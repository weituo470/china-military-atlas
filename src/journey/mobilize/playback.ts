import { ARCHIVE_AUDIO } from '../../publicEdition'
import { create } from 'zustand'
import { useJourney } from '../../store/journey'
import { useNarration, type NarrationStatus } from '../../store/narration'
import { BEATS } from './content'
import { getMobilizeLanguage, useMobilizeLocale, type MobilizeLanguage } from './locale'
import timings from './audio/timings.json'

const audioFiles = import.meta.glob<string>('./audio/*/*.mp3', { eager: true, import: 'default', query: '?url' })
type MediaStatus = NarrationStatus | 'loading'
type Playback = {
  status: MediaStatus
  currentTime: number
  duration: number
  paragraphIndex: number
  failed: boolean
}

function makeTracks(locale: MobilizeLanguage) {
  return BEATS.map(({ id }) => ({
    ...timings[locale][id],
    src: audioFiles[`./audio/${locale}/${id}.mp3`],
  }))
}
const tracks = { zh: makeTracks('zh'), en: makeTracks('en'), ja: makeTracks('ja') }
type Track = ReturnType<typeof makeTracks>[number]
const choiceKey = 'earth-force-mobilize-language'
const initial: Playback = { status: 'idle', currentTime: 0, duration: 0, paragraphIndex: 0, failed: false }
const useMedia = create<Playback>(() => initial)
let current: HTMLAudioElement | null = null
let resumeAfterInspection = false

function track(locale = getMobilizeLanguage(), beatIndex = useJourney.getState().beatIndex): Track {
  return tracks[locale][beatIndex] ?? tracks[locale][0]
}

function inspecting() {
  const state = useJourney.getState()
  return state.sourcesOpen || state.selectedCardId !== null
}

function unload() {
  if (!current) return
  const audio = current
  current = null
  audio.onended = audio.onerror = audio.ontimeupdate = null
  audio.pause()
  audio.removeAttribute('src')
  audio.load()
}

function resetMedia(paragraphIndex = 0) {
  unload()
  resumeAfterInspection = false
  const clip = track()
  useMedia.setState({
    ...initial,
    duration: clip.duration,
    paragraphIndex,
    currentTime: clip.starts[paragraphIndex] ?? 0,
  })
}

function sync(audio: HTMLAudioElement, clip: Track) {
  if (!audio.readyState || audio.seeking) return
  const now = audio.currentTime
  const index = clip.starts.findLastIndex((start) => now >= start)
  useMedia.setState({ currentTime: now, paragraphIndex: Math.max(0, index) })
}

function fail(audio: HTMLAudioElement) {
  if (audio !== current) return
  unload()
  resumeAfterInspection = false
  useMedia.setState({ status: 'idle', failed: true })
}

function resumeMedia(audio: HTMLAudioElement) {
  useMedia.setState({ status: 'loading', failed: false })
  void audio.play().then(() => {
    if (audio === current && !audio.paused && useMedia.getState().status === 'loading') {
      useMedia.setState({ status: 'playing' })
    }
  }).catch(() => {
    if (useMedia.getState().status === 'loading') fail(audio)
  })
}

function startMedia(paragraphIndex = 0) {
  const { activeJourney, beatIndex } = useJourney.getState()
  if (activeJourney !== 'mobilize' || inspecting()) return
  resetMedia(paragraphIndex)
  const clip = track()
  const audio = new Audio(clip.src)
  current = audio
  const start = clip.starts[paragraphIndex] ?? 0
  if (start > 0) {
    audio.currentTime = start
    audio.addEventListener('loadedmetadata', () => {
      if (current === audio && audio.currentTime < start) audio.currentTime = start
    }, { once: true })
  }
  audio.ontimeupdate = () => { if (current === audio) sync(audio, clip) }
  audio.onerror = () => fail(audio)
  audio.onended = () => {
    if (current !== audio) return
    if (beatIndex + 1 < BEATS.length) useJourney.getState().setBeat(beatIndex + 1)
    else {
      sync(audio, clip)
      useMedia.setState({ status: 'ended' })
    }
  }
  resumeMedia(audio)
}

function pauseMedia() {
  current?.pause()
  useMedia.setState({ status: 'paused' })
}

export function useMobilizeMediaValue<K extends keyof Playback>(key: K): Playback[K] {
  return useMedia((state) => state[key])
}

export function readMobilizeClock() {
  const { beatIndex } = useJourney.getState()
  const state = useMedia.getState()
  const clip = track()
  const start = clip.starts[state.paragraphIndex] ?? 0
  const next = clip.starts[state.paragraphIndex + 1] ?? clip.duration
  const time = current?.currentTime ?? state.currentTime
  return {
    ...state, beatIndex,
    hasStarted: state.status !== 'idle',
    progress: Math.max(0, Math.min(1, (time - start) / Math.max(.1, next - start))),
  }
}

export function changeMobilizeLanguage(language: MobilizeLanguage) {
  try { localStorage.setItem(choiceKey, language) } catch { /* still usable without storage */ }
  if (getMobilizeLanguage() === language) return
  const { paragraphIndex } = useMedia.getState()
  unload()
  resumeAfterInspection = false
  useJourney.getState().closeCard()
  useMobilizeLocale.setState({ language })
  resetMedia(paragraphIndex)
}

export function readMobilizeParagraph(index: number) {
  if (!inspecting()) resetMedia(Math.max(0, Math.min(track().starts.length - 1, index)))
}

export function toggleMobilizePlayback() {
  if (!ARCHIVE_AUDIO) return
  if (inspecting()) return
  const { status, paragraphIndex } = useMedia.getState()
  if (status === 'playing' || status === 'loading') pauseMedia()
  else if (status === 'paused' && current) resumeMedia(current)
  else if (status === 'ended') replayMobilize()
  else startMedia(paragraphIndex)
}

export function replayMobilize() {
  if (!ARCHIVE_AUDIO) return
  if (inspecting()) return
  resetMedia()
  if (useJourney.getState().beatIndex !== 0) useJourney.getState().setBeat(0)
  startMedia()
}

export function bindMobilizePlayback() {
  const sharedLanguage = useJourney.getState().language
  let requested = new URL(location.href).searchParams.get('lang')
  if (!requested) {
    try { requested = localStorage.getItem(choiceKey) } catch { /* use the shared default */ }
  }
  const language = requested === 'ja' || requested === 'en' || requested === 'zh' ? requested : sharedLanguage
  useMobilizeLocale.setState({ language })
  useNarration.getState().stop()
  // The shared Space handler knows only the old Chinese track for this route.
  // Keep that player silent while this chapter owns all audio; never persist the gate.
  if (sharedLanguage !== 'en') useJourney.setState({ language: 'en' })
  resetMedia()

  const unsubscribe = useJourney.subscribe((state, previous) => {
    if (state.activeJourney !== 'mobilize') {
      unload()
      return
    }
    const status = useMedia.getState().status
    const playing = status === 'playing' || status === 'loading'
    if (state.beatIndex !== previous.beatIndex) {
      if (playing) startMedia()
      else resetMedia()
      return
    }
    const nowInspecting = state.sourcesOpen || state.selectedCardId !== null
    const wasInspecting = previous.sourcesOpen || previous.selectedCardId !== null
    if (nowInspecting && !wasInspecting) {
      resumeAfterInspection = playing
      if (playing) pauseMedia()
    } else if (!nowInspecting && wasInspecting) {
      const resume = resumeAfterInspection
      resumeAfterInspection = false
      if (resume && current) resumeMedia(current)
    }
  })
  const onSpace = (event: KeyboardEvent) => {
    if (event.code !== 'Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey
      || useJourney.getState().activeJourney !== 'mobilize' || inspecting()) return
    if (event.target instanceof Element && event.target.closest('button,a,textarea,input,select,[contenteditable]:not([contenteditable="false"])')) return
    event.preventDefault()
    toggleMobilizePlayback()
  }
  window.addEventListener('keydown', onSpace, true)
  return () => {
    window.removeEventListener('keydown', onSpace, true)
    unsubscribe()
    unload()
    resumeAfterInspection = false
    useMedia.setState(initial)
    useMobilizeLocale.setState({ language: null })
    if (sharedLanguage !== 'en' && useJourney.getState().language === 'en') useJourney.setState({ language: sharedLanguage })
  }
}
