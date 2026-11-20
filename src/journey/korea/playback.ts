import { ARCHIVE_AUDIO } from '../../publicEdition'
import { useEffect } from 'react'
import { create } from 'zustand'
import { useJourney } from '../../store/journey'
import { readNarrationClock, useNarration, type NarrationStatus } from '../../store/narration'
import { KOREA_BEATS, type KoreaLang } from './locales'
import recordings from './recordings/manifest.json'

type ForeignLang = keyof typeof recordings
type Playback = {
  choice: KoreaLang | null
  status: NarrationStatus
  paragraph: number
  time: number
  error: boolean
}
export const useKoreaAudio = create<Playback>(() => ({ choice: null, status: 'idle', paragraph: 0, time: 0, error: false }))
const urls = import.meta.glob<string>('./recordings/*/*.mp3', { eager: true, query: '?url', import: 'default' })
let audio: HTMLAudioElement | undefined
let events: AbortController | undefined
let clipKey = ''
let intent = 0
let resumeAfterInspection = false
let advancing = false
let gap: number | undefined

const state = useKoreaAudio.getState
const set = useKoreaAudio.setState
const journey = useJourney.getState
const effectiveLocale = (choice: KoreaLang | null, value: ReturnType<typeof journey>): KoreaLang =>
  choice ?? (value.hubLocale === 'ja' ? 'ja' : value.language)
export const koreaLanguage = () => effectiveLocale(state().choice, journey())

export function useKoreaLanguage(): KoreaLang {
  const fallback = useJourney(value => value.hubLocale === 'ja' ? 'ja' : value.language)
  return useKoreaAudio(value => value.choice) ?? fallback
}

export function useKoreaParagraph() {
  const locale = useKoreaLanguage()
  const foreign = useKoreaAudio(value => value.paragraph)
  const chinese = useNarration(value => value.paragraphIndex)
  return locale === 'zh' ? chinese : foreign
}

export function useKoreaStatus() {
  const locale = useKoreaLanguage()
  const foreign = useKoreaAudio(value => value.status)
  const chinese = useNarration(value => value.status)
  return locale === 'zh' ? chinese : foreign
}

function clip(locale: ForeignLang, beatIndex = journey().beatIndex) {
  return recordings[locale].beats[KOREA_BEATS[beatIndex].id]
}

function isReading(value = journey()) {
  return value.sourcesOpen || value.selectedCardId !== null
}

function allowed(locale: ForeignLang) {
  return journey().activeJourney === 'korea' && koreaLanguage() === locale && !isReading()
}

function clearGap() {
  if (gap !== undefined) window.clearTimeout(gap)
  gap = undefined
}

function disposeClip() {
  ++intent
  clearGap()
  events?.abort()
  if (audio) {
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }
  clipKey = ''
}

function reset(paragraph = 0) {
  disposeClip()
  resumeAfterInspection = false
  set({ status: 'idle', paragraph, time: 0, error: false })
}

function update(locale: ForeignLang, index: number, time: number) {
  const { starts } = clip(locale, index)
  const paragraph = time >= starts[2] ? 2 : time >= starts[1] ? 1 : 0
  set({ paragraph, time })
}

function listen(locale: ForeignLang, paragraph = state().paragraph, seek = true) {
  if (!allowed(locale)) return
  clearGap()
  const index = journey().beatIndex
  const { id } = KOREA_BEATS[index]
  const key = `./recordings/${locale}/${id}.mp3`
  const player = audio ??= new Audio()
  if (clipKey !== key) {
    disposeClip()
    events = new AbortController()
    const options = { signal: events.signal }
    clipKey = key
    player.addEventListener('timeupdate', () => {
      if (state().status === 'playing') update(locale, index, player.currentTime)
    }, options)
    player.addEventListener('ended', () => {
      if (state().status !== 'playing') return
      set({ paragraph: 2, time: clip(locale, index).duration })
      if (index === KOREA_BEATS.length - 1) {
        set({ status: 'ended' })
        return
      }
      gap = window.setTimeout(() => {
        gap = undefined
        if (state().status === 'playing' && allowed(locale) && journey().beatIndex === index) {
          nextBeat(locale, index + 1)
        }
      }, 1800)
    }, options)
    player.src = urls[key]
    seek = true
  }
  const time = seek ? clip(locale, index).starts[paragraph] ?? 0 : player.currentTime
  if (seek) player.currentTime = time
  const attempt = ++intent
  set({ status: 'playing', time, paragraph, error: false })
  void player.play().catch(() => {
    if (attempt === intent) set({ status: 'paused', error: true })
  })
}

function nextBeat(locale: ForeignLang, index: number) {
  advancing = true
  try { journey().setBeat(index) } finally { advancing = false }
  listen(locale, 0)
}

function pauseForeign() {
  ++intent
  clearGap()
  audio?.pause()
  set({ status: 'paused' })
}

function resumeForeign(locale: ForeignLang) {
  if (state().time >= clip(locale).duration - .07 && !state().error) {
    if (journey().beatIndex + 1 < KOREA_BEATS.length) {
      nextBeat(locale, journey().beatIndex + 1)
    } else {
      set({ status: 'ended' })
    }
    return
  }
  listen(locale, state().paragraph, false)
}

export function toggleKoreaAudio() {
  if (!ARCHIVE_AUDIO) return
  const locale = koreaLanguage()
  if (journey().activeJourney !== 'korea' || isReading()) return
  if (locale === 'zh') {
    const { status, play, pause, resume } = useNarration.getState()
    if (status === 'playing') pause()
    else if (status === 'paused') resume()
    else play()
  } else if (state().status === 'playing') {
    pauseForeign()
  } else if (state().status === 'paused') {
    resumeForeign(locale)
  } else if (state().status === 'ended') {
    restartKoreaAudio()
  } else {
    listen(locale)
  }
}

export function restartKoreaAudio() {
  if (!ARCHIVE_AUDIO) return
  if (journey().activeJourney !== 'korea' || isReading()) return
  const locale = koreaLanguage()
  if (locale === 'zh') useNarration.getState().replay()
  else nextBeat(locale, 0)
}

export function readKoreaParagraph(index: number) {
  if (isReading()) return
  if (koreaLanguage() === 'zh') useNarration.getState().readParagraph(index)
  else reset(Math.max(0, Math.min(2, index)))
}

export function chooseKoreaLanguage(locale: KoreaLang) {
  const previous = koreaLanguage()
  if (previous === locale) return
  const shared = useNarration.getState()
  const paragraph = previous === 'zh' ? shared.paragraphIndex : state().paragraph
  const wasPlaying = (previous === 'zh' ? shared.status : state().status) === 'playing'
  shared.stop()
  reset(paragraph)
  set({ choice: locale })
  journey().setLanguage(locale === 'zh' ? 'zh' : 'en')
  if (locale === 'zh') {
    shared.readParagraph(paragraph)
    if (wasPlaying) shared.play()
  } else if (wasPlaying) {
    listen(locale, paragraph)
  }
}

export function useBindKoreaAudio() {
  useEffect(() => {
    // Keep shared Chinese playback inactive when entering from a Japanese hub.
    if (koreaLanguage() === 'ja' && journey().language !== 'en') journey().setLanguage('en')
    const stopListening = useJourney.subscribe((value, previous) => {
      if (value.activeJourney !== 'korea') {
        reset()
        set({ choice: null })
        return
      }
      const locale = effectiveLocale(state().choice, value)
      if (locale === 'zh') return
      if (value.beatIndex !== previous.beatIndex) {
        if (!advancing) {
          const playing = state().status === 'playing' || resumeAfterInspection
          reset()
          if (playing && !isReading(value)) listen(locale, 0)
        }
        return
      }
      if (!isReading(previous) && isReading(value)) {
        resumeAfterInspection = state().status === 'playing'
        if (resumeAfterInspection) pauseForeign()
      } else if (isReading(previous) && !isReading(value) && resumeAfterInspection) {
        resumeAfterInspection = false
        resumeForeign(locale)
      }
    })
    const space = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
        || journey().activeJourney !== 'korea' || koreaLanguage() === 'zh' || isReading()
        || (event.target instanceof Element && event.target.closest('button,a,input,select,textarea,[contenteditable]:not([contenteditable="false"])'))) return
      event.preventDefault()
      toggleKoreaAudio()
    }
    window.addEventListener('keydown', space, true)
    return () => {
      stopListening()
      window.removeEventListener('keydown', space, true)
      reset()
      set({ choice: null })
    }
  }, [])
}

export function koreaAudioDuration(locale: ForeignLang, index: number) {
  return clip(locale, index).duration
}

export function readKoreaClock() {
  const locale = koreaLanguage()
  if (locale === 'zh') return readNarrationClock()
  const { status, paragraph: paragraphIndex } = state()
  const { beatIndex } = journey()
  const { starts, duration } = clip(locale, beatIndex)
  const currentTime = clipKey && audio ? audio.currentTime : 0
  const start = starts[paragraphIndex]
  const end = starts[paragraphIndex + 1] ?? duration
  const progress = Math.max(0, Math.min(1, (currentTime - start) / (end - start)))
  return { status, paragraphIndex, beatIndex, currentTime, duration, progress, hasStarted: status !== 'idle' }
}
