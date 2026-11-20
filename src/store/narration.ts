import { ARCHIVE_AUDIO } from '../publicEdition'
import { create } from 'zustand'
import { getJourneyBeatCount, getJourneyBeats, getNarrationAudioBase, getNarrationManifestUrl } from '../journey/runtime'
import type { JourneyId } from '../journey/types'
import { industryLocale } from '../journey/industry/locale'
import { selectBaselineLocale } from '../journey/baseline2026/locale'
import { useJourney } from './journey'
import {
  primeBattleAudio,
  setBattleAudioEnded,
  setBattleAudioPaused,
  setBattleAudioTalking,
  stopBattleAudio,
} from '../journey/force/battleAudio'

export type NarrationStatus = 'idle' | 'playing' | 'paused' | 'ended'
export type NarrationEngine = 'audio' | 'speech' | null
export type VoiceNote = 'chinese-only' | 'error' | null

export type NarrationParagraph = {
  index: number
  start: number
  end: number
  pendingRecording?: boolean
  text: string
}

export type NarrationClipVariant = 'default' | 'solo'

export type NarrationBeatClip = {
  id: string
  src: string
  duration: number
  paragraphs: NarrationParagraph[]
  solo?: {
    src: string
    duration: number
    paragraphs: NarrationParagraph[]
  }
}

export type NarrationManifest = {
  voice: string
  rate: string
  lang: string
  beats: NarrationBeatClip[]
}

type NarrationState = {
  status: NarrationStatus
  currentTime: number
  duration: number
  paragraphIndex: number
  engine: NarrationEngine
  ready: boolean
  hasStarted: boolean
  voiceNote: VoiceNote
  manifest: NarrationManifest | null
  clipVariant: NarrationClipVariant
  readParagraph: (index: number) => void
  play: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  playBeat: (index: number) => void
  replay: () => void
}

const BEAT_GAP_MS = 2000

function gapAfterBeat(beatIndex: number) {
  if (activeJourneyId() === 'industry') return 4000
  if (beatIndex === 0) return 3200
  if (beatIndex === 5) return 2800
  return BEAT_GAP_MS
}
const TIME_EPS = 0.08
let audio: HTMLAudioElement | null = null
let manifestCache: NarrationManifest | null = null
let manifestPromise: Promise<NarrationManifest | null> | null = null
let manifestKey: string | null = null
let gapTimer: number | null = null
let rafId = 0
let advancingFromAudio = false
let bound = false
let loadedBeatIndex = -1
let loadedClipVariant: NarrationClipVariant = 'default'
let useSoloClip = false
let usingSpeech = false
let speechStartedAt = 0
let speechElapsed = 0

// Playback and manifest have different lifetimes: pausing invalidates a pending
// play(), but a manifest may still finish for this visit to the same journey.
let playbackGeneration = 0
let manifestGeneration = 0
let speechGeneration = 0
let resumeAfterInspection = false

function inspecting() {
  const { sourcesOpen, selectedCardId } = useJourney.getState()
  return sourcesOpen || selectedCardId !== null
}

function playable() {
  return ARCHIVE_AUDIO && !!useJourney.getState().activeJourney && hasNarrationLanguage() && !inspecting()
}

function activeJourneyId(): JourneyId {
  return useJourney.getState().activeJourney ?? 'force'
}

function clampBeat(index: number) {
  return Math.min(getJourneyBeatCount(activeJourneyId()) - 1, Math.max(0, Math.round(index)))
}

function resolveSrc(src: string) {
  if (/^https?:/i.test(src)) return src
  const base = import.meta.env.BASE_URL || '/'
  const path = src.replace(/^\/+/, '')
  return `${base}${base.endsWith('/') ? '' : '/'}${path}`
}

const prefetchedSrcs = new Set<string>()

function prefetchSrc(src: string | undefined) {
  if (!src || typeof fetch === 'undefined') return
  const url = resolveSrc(src)
  if (prefetchedSrcs.has(url)) return
  prefetchedSrcs.add(url)
  const request = { cache: 'force-cache', priority: 'low' } as RequestInit & { priority?: string }
  void fetch(url, request).catch(() => {
    prefetchedSrcs.delete(url)
  })
}

function prefetchBeat(index: number, data: NarrationManifest | null = manifestCache) {
  if (!data?.beats?.length) return
  const current = resolveClip(data.beats[clampBeat(index)])
  prefetchSrc(current?.src)
  const nextIndex = index + 1
  if (nextIndex < data.beats.length) prefetchSrc(resolveClip(data.beats[nextIndex])?.src)
}

function paragraphAt(clip: NarrationBeatClip, time: number) {
  let index = 0
  for (const paragraph of clip.paragraphs) {
    if (time + TIME_EPS >= paragraph.start) index = paragraph.index
  }
  return index
}

function resolveClip(clip: NarrationBeatClip | undefined | null): NarrationBeatClip | null {
  if (!clip) return null
  if (useSoloClip && clip.solo) {
    return {
      id: clip.id,
      src: clip.solo.src,
      duration: clip.solo.duration,
      paragraphs: clip.solo.paragraphs,
      solo: clip.solo,
    }
  }
  return clip
}

function currentClip(): NarrationBeatClip | null {
  const manifest = manifestCache ?? useNarration.getState().manifest
  if (!manifest) return null
  const raw = manifest.beats[useJourney.getState().beatIndex] ?? manifest.beats[0] ?? null
  return resolveClip(raw)
}

function syncClipVariant(variant: NarrationClipVariant) {
  useSoloClip = variant === 'solo'
  if (useNarration.getState().clipVariant !== variant) {
    useNarration.setState({ clipVariant: variant })
  }
}

function updateSoloFromBeat(id: string | null, beatIndex: number, previousBeatIndex: number, fromAudioAdvance: boolean) {
  const solo = id === 'industry'
    && (beatIndex === 3 || beatIndex === 7)
    && !fromAudioAdvance
    && previousBeatIndex + 1 !== beatIndex
  syncClipVariant(solo ? 'solo' : 'default')
}

function fallbackManifest(id: JourneyId): NarrationManifest {
  const base = getNarrationAudioBase(id)
  return {
    voice: 'speechSynthesis',
    rate: '-8%',
    lang: 'zh-CN',
    beats: getJourneyBeats(id).map((beat) => {
      const paragraphs = beat.narration.zh
      const duration = Math.max(24, paragraphs.reduce((sum, line) => sum + line.length, 0) / 4.2)
      return {
        id: beat.id,
        src: `${base}/${beat.id}.mp3`,
        duration,
        paragraphs: paragraphs.map((text, index) => ({
          index,
          start: (index / paragraphs.length) * duration,
          end: ((index + 1) / paragraphs.length) * duration,
          text,
        })),
      }
    }),
  }
}

function resetManifestCache() {
  ++manifestGeneration
  manifestCache = null
  manifestPromise = null
  manifestKey = null
  loadedBeatIndex = -1
  prefetchedSrcs.clear()
}

function getManifestKey(id: JourneyId) {
  if (id === 'baseline2026') return `baseline2026:${selectBaselineLocale(useJourney.getState())}`
  return id === 'industry' ? `industry:${industryLocale(useJourney.getState())}` : id
}

async function loadManifest(): Promise<NarrationManifest | null> {
  if (!ARCHIVE_AUDIO) return null
  const id = activeJourneyId()
  const language = id === 'industry' ? industryLocale(useJourney.getState())
    : id === 'baseline2026' ? selectBaselineLocale(useJourney.getState()) : 'zh'
  const key = getManifestKey(id)
  if (manifestCache && manifestKey === key) return manifestCache
  if (manifestPromise && manifestKey === key) return manifestPromise
  manifestKey = key
  const generation = manifestGeneration
  const request = id === 'industry' && language !== 'zh'
    ? import('../journey/industry/recordings').then((mod) => mod.loadIndustryNarration(language))
    : fetch(getNarrationManifestUrl(id, language)).then(async (response) => {
        if (!response.ok) throw new Error(`manifest ${response.status}`)
        return await response.json() as NarrationManifest
      })
  manifestPromise = request
    .then((data) => {
      if (!data?.beats?.length) throw new Error('empty manifest')
      if (generation !== manifestGeneration) return null
      manifestCache = data
      manifestKey = key
      const clip = resolveClip(data.beats[useJourney.getState().beatIndex] ?? data.beats[0])
      const { status, paragraphIndex } = useNarration.getState()
      useNarration.setState({
        manifest: data,
        ready: true,
        duration: clip?.duration ?? 0,
        ...((id === 'industry' || id === 'baseline2026') && status === 'idle' && {
          currentTime: clip?.paragraphs[paragraphIndex]?.start ?? 0,
        }),
      })
      const later = typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 2000 })
        : (cb: () => void) => window.setTimeout(cb, 400)
      later(() => {
        if (generation === manifestGeneration) prefetchBeat(useJourney.getState().beatIndex, data)
      })
      return data
    })
    .catch(() => {
      if (generation !== manifestGeneration) return null
      if (language !== 'zh') {
        manifestPromise = null
        useNarration.setState({ voiceNote: 'error', status: 'idle', engine: null })
        return null
      }
      manifestCache = fallbackManifest(id)
      manifestKey = key
      useNarration.setState({
        manifest: manifestCache,
        ready: true,
        duration: manifestCache.beats[0]?.duration ?? 0,
      })
      return manifestCache
    })
  return manifestPromise
}

function haltPlayback() {
  ++playbackGeneration
  clearGap()
  stopRaf()
  cancelSpeech()
  if (audio) {
    const old = audio
    audio = null
    old.pause()
    old.removeAttribute('src')
    try { old.load() } catch { /* ignore */ }
  }
  loadedBeatIndex = -1
  advancingFromAudio = false
}

function switchNarrationJourney(id: JourneyId | null, paragraphIndex = 0) {
  resumeAfterInspection = false
  stopBattleAudio()
  haltPlayback()
  resetManifestCache()
  useNarration.setState({
    status: 'idle',
    currentTime: 0,
    paragraphIndex,
    duration: 0,
    engine: null,
    ready: false,
    hasStarted: false,
    voiceNote: null,
    manifest: null,
  })
  if (id) {
    void loadManifest()
  }
}

function clearGap() {
  if (gapTimer != null) {
    window.clearTimeout(gapTimer)
    gapTimer = null
  }
}

function stopRaf() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function startRaf() {
  stopRaf()
  const tick = () => {
    rafId = 0
    const { status } = useNarration.getState()
    if (status !== 'playing') return
    syncClock()
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

function syncClock() {
  const clip = currentClip()
  if (!clip) return
  let currentTime = useNarration.getState().currentTime
  if (!usingSpeech && audio && Number.isFinite(audio.currentTime)) {
    if (activeJourneyId() === 'baseline2026' && (audio.readyState === 0 || audio.seeking)) return
    currentTime = audio.currentTime
  } else if (usingSpeech && useNarration.getState().status === 'playing') {
    const elapsed = speechElapsed + (performance.now() - speechStartedAt) / 1000
    const para = clip.paragraphs[useNarration.getState().paragraphIndex]
    if (para) {
      const span = Math.max(0.2, para.end - para.start)
      currentTime = Math.min(para.end - 0.01, para.start + elapsed)
      if (currentTime - para.start > span) currentTime = para.end - 0.01
    } else {
      currentTime = Math.min(clip.duration, elapsed)
    }
  }
  const duration = clip.duration || (audio?.duration && Number.isFinite(audio.duration) ? audio.duration : 0)
  const paragraphIndex = paragraphAt(clip, currentTime)
  const prev = useNarration.getState()
  if (
    Math.abs(prev.currentTime - currentTime) < 0.008
    && prev.paragraphIndex === paragraphIndex
    && Math.abs(prev.duration - duration) < 0.01
  ) return
  useNarration.setState({ currentTime, duration, paragraphIndex })
}

function getAudio() {
  if (typeof Audio === 'undefined') return null
  if (!audio) {
    audio = new Audio()
    const element = audio
    const isPlaying = () => element === audio && playable() && useNarration.getState().status === 'playing'
    audio.preload = 'auto'
    audio.addEventListener('timeupdate', () => {
      if (isPlaying() && !usingSpeech) syncClock()
    })
    audio.addEventListener('ended', () => {
      if (!isPlaying() || !element.ended || usingSpeech) return
      const clip = currentClip()
      if (clip) useNarration.setState({ currentTime: clip.duration, paragraphIndex: Math.max(0, clip.paragraphs.length - 1) })
      onClipEnded()
    })
    audio.addEventListener('error', () => {
      if (!isPlaying() || !element.error) return
      if (usingSpeech) return
      startSpeechFallback(useJourney.getState().beatIndex)
    })
    audio.addEventListener('loadedmetadata', () => {
      if (audio !== element) return
      const clip = currentClip()
      const duration = clip?.duration ?? (Number.isFinite(audio?.duration) ? audio!.duration : 0)
      useNarration.setState({ duration })
    })
  }
  return audio
}

function cancelSpeech() {
  ++speechGeneration
  usingSpeech = false
  speechElapsed = 0
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

function pickZhVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((voice) => voice.lang === 'zh-CN' && /Yunyang/i.test(voice.name))
    ?? voices.find((voice) => voice.lang === 'zh-CN')
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('zh'))
    ?? null
  )
}

function hasNarrationLanguage() {
  const state = useJourney.getState()
  return state.activeJourney === 'industry' || state.activeJourney === 'baseline2026' || state.language === 'zh'
}

function startSpeechFallback(index: number) {
  if (!playable() || usingSpeech) return
  if ((activeJourneyId() === 'industry' && industryLocale(useJourney.getState()) !== 'zh') ||
      (activeJourneyId() === 'baseline2026' && selectBaselineLocale(useJourney.getState()) !== 'zh')) {
    // The two new editions have packaged recordings, not a potentially wrong OS voice.
    haltPlayback()
    useNarration.setState({ voiceNote: 'error', status: 'idle', engine: null })
    return
  }
  const clip = resolveClip(manifestCache?.beats[clampBeat(index)])
  if (!clip) {
    useNarration.setState({ voiceNote: 'error', status: 'idle', engine: null })
    return
  }
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    useNarration.setState({ voiceNote: 'error', status: 'idle', engine: null })
    return
  }
  cancelSpeech()
  if (audio) {
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    loadedBeatIndex = -1
  }
  const generation = speechGeneration
  usingSpeech = true
  const voice = pickZhVoice()
  const speak = (paragraph: number) => {
    if (generation !== speechGeneration || !usingSpeech) return
    if (paragraph >= clip.paragraphs.length) {
      const latest = useNarration.getState()
      useNarration.setState({ currentTime: clip.duration, paragraphIndex: Math.max(0, clip.paragraphs.length - 1) })
      if (latest.status === 'playing') onClipEnded()
      return
    }
    const item = clip.paragraphs[paragraph]
    const utterance = new SpeechSynthesisUtterance(item.text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.86
    if (voice) utterance.voice = voice
    utterance.onstart = () => {
      if (generation !== speechGeneration || !playable()) return
      speechStartedAt = performance.now()
      speechElapsed = 0
      useNarration.setState({
        status: 'playing',
        engine: 'speech',
        paragraphIndex: item.index,
        currentTime: item.start,
        duration: clip.duration,
        voiceNote: null,
        hasStarted: true,
      })
      startRaf()
    }
    utterance.onend = () => {
      if (generation !== speechGeneration || !usingSpeech || useNarration.getState().status !== 'playing') return
      speak(paragraph + 1)
    }
    utterance.onerror = () => {
      if (generation !== speechGeneration || !usingSpeech) return
      usingSpeech = false
      stopRaf()
      useNarration.setState({ voiceNote: 'error', status: 'idle', engine: null })
    }
    try {
      window.speechSynthesis.speak(utterance)
    } catch {
      usingSpeech = false
      useNarration.setState({ voiceNote: 'error', status: 'idle', engine: null })
    }
  }
  speak(useNarration.getState().paragraphIndex)
}

function onClipEnded() {
  clearGap()
  const beatIndex = useJourney.getState().beatIndex
  gapTimer = window.setTimeout(() => {
    gapTimer = null
    if (useNarration.getState().status !== 'playing') return
    const next = beatIndex + 1
    if (next >= getJourneyBeatCount(activeJourneyId())) {
      stopRaf()
      if (audio) audio.pause()
      cancelSpeech()
      const clip = currentClip()
      setBattleAudioEnded()
      useNarration.setState({
        status: 'ended',
        currentTime: clip?.duration ?? useNarration.getState().duration,
        paragraphIndex: Math.max(0, (clip?.paragraphs.length ?? 1) - 1),
      })
      return
    }
    advancingFromAudio = true
    useJourney.getState().setBeat(next)
    void playClip(next)
  }, gapAfterBeat(beatIndex))
}

async function playClip(index: number, paragraph = 0) {
  if (!playable()) return
  if (!hasNarrationLanguage()) {
    useNarration.setState({ voiceNote: 'chinese-only', status: 'idle' })
    return
  }
  const clipIndex = clampBeat(index)
  haltPlayback()
  const generation = playbackGeneration
  useNarration.setState({ status: 'playing', currentTime: 0, paragraphIndex: paragraph, hasStarted: true })
  const data = await loadManifest()
  if (generation !== playbackGeneration || !playable()) return
  const clip = resolveClip(data?.beats[clipIndex])
  if (!clip) {
    useNarration.setState({ voiceNote: 'error', status: 'idle', engine: null })
    return
  }
  clearGap()
  cancelSpeech()
  const element = getAudio()
  useNarration.setState({
    status: 'playing',
    hasStarted: true,
    voiceNote: null,
    duration: clip.duration,
    currentTime: clip.paragraphs[paragraph]?.start ?? 0,
    paragraphIndex: paragraph,
    engine: 'audio',
  })
  if (!element) {
    startSpeechFallback(clipIndex)
    return
  }
  try {
    const src = resolveSrc(clip.src)
    const variant: NarrationClipVariant = useSoloClip ? 'solo' : 'default'
    if (loadedBeatIndex !== clipIndex || loadedClipVariant !== variant || element.getAttribute('src') !== src) {
      element.src = src
      loadedBeatIndex = clipIndex
      loadedClipVariant = variant
      element.load()
    }
    const startTime = clip.paragraphs[paragraph]?.start ?? 0
    if (activeJourneyId() === 'baseline2026' && startTime > 0 && element.readyState === 0) {
      // Keep the matching paragraph on cold clips, including after a locale switch.
      element.addEventListener('loadedmetadata', () => {
        if (element === audio) element.currentTime = startTime
      }, { once: true })
    } else {
      element.currentTime = startTime
    }
    const playAttempt = element.play()
    if (playAttempt) await playAttempt
    if (generation !== playbackGeneration || !playable() || usingSpeech) return
    usingSpeech = false
    useNarration.setState({ engine: 'audio', voiceNote: null, status: 'playing' })
    prefetchBeat(clipIndex + 1)
    startRaf()
  } catch {
    if (generation === playbackGeneration) startSpeechFallback(clipIndex)
  }
}

function loadClipPaused(index: number) {
  const clipIndex = clampBeat(index)
  const clip = resolveClip(manifestCache?.beats[clipIndex])
  clearGap()
  cancelSpeech()
  stopRaf()
  if (audio) {
    audio.pause()
    if (clip) {
      const src = resolveSrc(clip.src)
      const variant: NarrationClipVariant = useSoloClip ? 'solo' : 'default'
      if (loadedBeatIndex !== clipIndex || loadedClipVariant !== variant) {
        audio.src = src
        loadedBeatIndex = clipIndex
        loadedClipVariant = variant
        audio.load()
      }
      try { audio.currentTime = 0 } catch { /* metadata may be pending */ }
    }
  }
  useNarration.setState({
    status: useNarration.getState().status === 'playing' || useNarration.getState().status === 'paused'
      ? 'paused'
      : useNarration.getState().status === 'ended'
        ? 'idle'
        : useNarration.getState().status,
    currentTime: 0,
    paragraphIndex: 0,
    duration: clip?.duration ?? 0,
    engine: audio && clip ? 'audio' : useNarration.getState().engine,
  })
}

function onExternalBeatChange(index: number) {
  const { status } = useNarration.getState()
  if (status === 'playing') {
    void playClip(index)
    return
  }
  if (status === 'paused') {
    loadClipPaused(index)
    return
  }
  const clip = resolveClip(manifestCache?.beats[clampBeat(index)])
  clearGap()
  useNarration.setState({
    currentTime: 0,
    paragraphIndex: 0,
    duration: clip?.duration ?? useNarration.getState().duration,
    status: status === 'ended' ? 'idle' : status,
  })
}

export function peekAudioTime() {
  if (!usingSpeech && audio && Number.isFinite(audio.currentTime)) return audio.currentTime
  return useNarration.getState().currentTime
}

export function readNarrationClock() {
  const narration = useNarration.getState()
  const beatIndex = useJourney.getState().beatIndex
  const clip = resolveClip(narration.manifest?.beats[beatIndex] ?? manifestCache?.beats[beatIndex])
  const currentTime = peekAudioTime()
  let paragraphIndex = narration.paragraphIndex
  let progress = 1
  if (clip) {
    paragraphIndex = paragraphAt(clip, currentTime)
    const paragraph = clip.paragraphs[paragraphIndex] ?? clip.paragraphs[0]
    if (paragraph) {
      const span = Math.max(0.001, paragraph.end - paragraph.start)
      progress = Math.min(1, Math.max(0, (currentTime - paragraph.start) / span))
    }
    if (narration.status === 'idle') {
      progress = 1
      paragraphIndex = narration.paragraphIndex
    } else if (narration.status === 'ended') {
      progress = 1
      paragraphIndex = Math.max(0, clip.paragraphs.length - 1)
    }
  }
  return {
    beatIndex,
    paragraphIndex,
    progress,
    currentTime,
    duration: clip?.duration ?? narration.duration,
    status: narration.status,
    hasStarted: narration.hasStarted,
    clip,
  }
}

export const useNarration = create<NarrationState>((set, get) => ({
  status: 'idle',
  currentTime: 0,
  duration: 0,
  paragraphIndex: 0,
  engine: null,
  ready: false,
  hasStarted: false,
  voiceNote: null,
  manifest: null,
  clipVariant: 'default',

  readParagraph: (index) => {
    const { activeJourney, beatIndex, language } = useJourney.getState()
    if (!activeJourney || inspecting()) return
    const count = getJourneyBeats(activeJourney)[beatIndex].narration[language].length
    const paragraphIndex = Math.max(0, Math.min(count - 1, index))
    get().stop()
    set({ paragraphIndex, currentTime: currentClip()?.paragraphs[paragraphIndex]?.start ?? 0 })
  },

  play: () => {
    if (!playable()) return
    const { status, resume, replay, playBeat } = get()
    if (!hasNarrationLanguage()) {
      set({ voiceNote: 'chinese-only' })
      return
    }
    if (status === 'playing') return
    if (status === 'paused') {
      resume()
      return
    }
    if (status === 'ended') {
      replay()
      return
    }
    if (get().paragraphIndex === 0) playBeat(useJourney.getState().beatIndex)
    else {
      primeBattleAudio()
      setBattleAudioTalking(true)
      setBattleAudioPaused(false)
      void playClip(useJourney.getState().beatIndex, get().paragraphIndex)
    }
  },

  pause: () => {
    const { status } = get()
    if (status !== 'playing') return
    ++playbackGeneration
    setBattleAudioPaused(true)
    clearGap()
    stopRaf()
    if (usingSpeech && window.speechSynthesis) {
      syncClock()
      window.speechSynthesis.pause()
      speechElapsed += (performance.now() - speechStartedAt) / 1000
    } else if (audio) {
      audio.pause()
      syncClock()
    }
    set({ status: 'paused' })
  },

  resume: () => {
    if (!playable()) return
    const { status, playBeat } = get()
    if (!hasNarrationLanguage()) {
      set({ voiceNote: 'chinese-only' })
      return
    }
    if (status === 'ended') {
      playBeat(useJourney.getState().beatIndex)
      return
    }
    if (status !== 'paused') return
    primeBattleAudio()
    setBattleAudioTalking(true)
    setBattleAudioPaused(false)
    const clip = currentClip()
    const almostDone = clip && get().currentTime >= clip.duration - 0.05
    if (almostDone) {
      set({ status: 'playing' })
      onClipEnded()
      return
    }
    if (usingSpeech && window.speechSynthesis) {
      window.speechSynthesis.resume()
      speechStartedAt = performance.now()
      set({ status: 'playing', engine: 'speech', voiceNote: null })
      startRaf()
      return
    }
    const element = getAudio()
    if (!element) {
      startSpeechFallback(useJourney.getState().beatIndex)
      return
    }
    if (loadedBeatIndex !== useJourney.getState().beatIndex) {
      void playClip(useJourney.getState().beatIndex, get().paragraphIndex)
      return
    }
    const generation = ++playbackGeneration
    set({ status: 'playing' })
    const attempt = element.play()
    const go = () => {
      if (generation !== playbackGeneration || !playable() || usingSpeech) return
      set({ status: 'playing', engine: 'audio', voiceNote: null })
      startRaf()
    }
    if (attempt) attempt.then(go).catch(() => { if (generation === playbackGeneration) startSpeechFallback(useJourney.getState().beatIndex) })
    else go()
  },

  stop: () => {
    stopBattleAudio()
    haltPlayback()
    resumeAfterInspection = false
    set({
      status: 'idle',
      currentTime: 0,
      paragraphIndex: 0,
      engine: null,
      hasStarted: false,
      voiceNote: hasNarrationLanguage() ? (get().voiceNote === 'error' ? 'error' : null) : 'chinese-only',
    })
  },

  playBeat: (index) => {
    if (!playable()) return
    if (!hasNarrationLanguage()) {
      set({ voiceNote: 'chinese-only' })
      return
    }
    primeBattleAudio()
    setBattleAudioTalking(true)
    setBattleAudioPaused(false)
    const clipIndex = clampBeat(index)
    if (useJourney.getState().beatIndex !== clipIndex) {
      advancingFromAudio = true
      useJourney.getState().setBeat(clipIndex)
    }
    void playClip(clipIndex)
  },

  replay: () => {
    if (!playable()) return
    if (!hasNarrationLanguage()) {
      set({ voiceNote: 'chinese-only' })
      return
    }
    primeBattleAudio()
    setBattleAudioTalking(true)
    setBattleAudioPaused(false)
    if (useJourney.getState().beatIndex !== 0) {
      advancingFromAudio = true
      useJourney.getState().setBeat(0)
    }
    void playClip(0)
  },
}))

export function bindNarrationToJourney() {
  if (bound) return
  bound = true
  useJourney.subscribe((state, previous) => {
    if (state.activeJourney !== previous.activeJourney) {
      syncClipVariant('default')
      switchNarrationJourney(state.activeJourney)
      return
    }
    if (state.activeJourney === 'industry' && industryLocale(state) !== industryLocale(previous)) {
      switchNarrationJourney('industry', useNarration.getState().paragraphIndex)
      return
    }
    if (state.activeJourney === 'baseline2026' && selectBaselineLocale(state) !== selectBaselineLocale(previous)) {
      // Pause on the same paragraph; the old locale's seconds never address the new track.
      switchNarrationJourney('baseline2026', useNarration.getState().paragraphIndex)
      return
    }
    const reading = state.sourcesOpen || state.selectedCardId !== null
    const wasReading = previous.sourcesOpen || previous.selectedCardId !== null
    if (reading && !wasReading) {
      resumeAfterInspection = useNarration.getState().status === 'playing'
      if (resumeAfterInspection) useNarration.getState().pause()
    } else if (!reading && wasReading) {
      const shouldResume = resumeAfterInspection && state.beatIndex === previous.beatIndex
      resumeAfterInspection = false
      if (shouldResume) useNarration.getState().resume()
    }
    if (state.activeJourney !== 'industry' && state.activeJourney !== 'baseline2026' && state.language !== previous.language) {
      resumeAfterInspection = false
      if (state.language !== 'zh') {
        const { status, pause } = useNarration.getState()
        if (status === 'playing') pause()
        useNarration.setState({ voiceNote: 'chinese-only' })
      } else if (useNarration.getState().voiceNote === 'chinese-only') {
        useNarration.setState({ voiceNote: null })
      }
    }
    if (state.beatIndex !== previous.beatIndex && state.activeJourney) {
      const fromAudio = advancingFromAudio
      updateSoloFromBeat(state.activeJourney, state.beatIndex, previous.beatIndex, fromAudio)
      if (fromAudio) {
        advancingFromAudio = false
        return
      }
      onExternalBeatChange(state.beatIndex)
    }
  })
}

export async function initNarration(journeyId?: JourneyId) {
  bindNarrationToJourney()
  const id = journeyId ?? useJourney.getState().activeJourney ?? 'force'
  const key = getManifestKey(id)
  if (manifestKey !== key) {
    haltPlayback()
    resetManifestCache()
    manifestKey = key
    useNarration.setState({
      status: 'idle',
      currentTime: 0,
      paragraphIndex: 0,
      duration: 0,
      engine: null,
      ready: false,
      hasStarted: false,
      voiceNote: null,
      manifest: null,
    })
  }
  await loadManifest()
}

export function getNarrationAudio() {
  return audio
}
