/**
 * Looping battlefield bed for Chapter I dives.
 *
 * Stem: /audio/sfx/battle-bed.wav — original procedural audio
 * (see public/audio/sfx/ATTRIBUTION.txt). No commercial game samples.
 *
 * Starts on the same user gesture as 「播放解说」 / Space / the seal
 * (primeBattleAudio). Fades in with dive closeness, ducks under the
 * Chinese narration clip, and pauses with the journey.
 */
import { useJourney } from '../../store/journey'

const BED_OGG = `${import.meta.env.BASE_URL}audio/sfx/battle-bed.ogg`
const BED_WAV = `${import.meta.env.BASE_URL}audio/sfx/battle-bed.wav`

const MASTER = 0.42
const DUCK = 0.32
const DIVE_IN_START = 0.90
const DIVE_IN_END = 0.998
const FADE_MS = 80

let ctx: AudioContext | null = null
let master: GainNode | null = null
let diveGain: GainNode | null = null
let duckGain: GainNode | null = null
let source: AudioBufferSourceNode | null = null
let buffer: AudioBuffer | null = null
let loadPromise: Promise<AudioBuffer | null> | null = null
let armed = false
let talking = false
let paused = true
let ended = false
let subscribed = false

function ensureSubscribe() {
  if (subscribed) return
  subscribed = true
  useJourney.subscribe((state, prev) => {
    if (state.diveProgress !== prev.diveProgress || state.activeJourney !== prev.activeJourney) {
      applyGains()
    }
    if (state.activeJourney !== 'force' && ctx && ctx.state === 'running' && paused === false) {
      // Leaving Chapter I must silence the bed.
      paused = true
      applyGains()
      void ctx.suspend()
    }
  })
}

async function fetchBed(src: string) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`battle bed ${res.status}`)
  return res.arrayBuffer()
}

async function loadBuffer(audio: AudioContext): Promise<AudioBuffer | null> {
  if (buffer) return buffer
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    try {
      let data: ArrayBuffer
      try {
        data = await fetchBed(BED_OGG)
      } catch {
        data = await fetchBed(BED_WAV)
      }
      const decoded = await audio.decodeAudioData(data.slice(0))
      buffer = decoded
      return decoded
    } catch {
      loadPromise = null
      return null
    }
  })()
  return loadPromise
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    ctx = new Ctor()
    master = ctx.createGain()
    diveGain = ctx.createGain()
    duckGain = ctx.createGain()
    master.gain.value = 0
    diveGain.gain.value = 0
    duckGain.gain.value = 1
    diveGain.connect(duckGain)
    duckGain.connect(master)
    master.connect(ctx.destination)
  }
  return ctx
}

function startLoop() {
  if (!ctx || !buffer || !diveGain || source) return
  const node = ctx.createBufferSource()
  node.buffer = buffer
  node.loop = true
  node.connect(diveGain)
  try {
    node.start(0)
  } catch {
    return
  }
  source = node
  node.onended = () => {
    if (source === node) source = null
  }
}

function diveAmount(progress: number) {
  const x = Math.min(1, Math.max(0, progress))
  if (x <= DIVE_IN_START) return 0
  if (x >= DIVE_IN_END) return 1
  const u = (x - DIVE_IN_START) / (DIVE_IN_END - DIVE_IN_START)
  return u * u * (3 - 2 * u)
}

function targetMaster(): number {
  const journey = useJourney.getState()
  if (journey.activeJourney !== 'force') return 0
  if (!armed) return 0
  if (paused) return 0
  const close = diveAmount(journey.diveProgress)
  if (close <= 0) return 0
  if (ended) return MASTER * close * 0.4
  return MASTER * close
}

function targetDuck(): number {
  if (talking && !paused && !ended) return DUCK
  return 1
}

export function applyBattleAudioGains() {
  applyGains()
}

function applyGains() {
  if (!ctx || !master || !diveGain || !duckGain) return
  const now = ctx.currentTime
  const diveLevel = (!armed || paused) ? 0 : diveAmount(useJourney.getState().activeJourney === 'force' ? useJourney.getState().diveProgress : 0)
  const masterLevel = (!armed || paused) ? 0 : (ended ? MASTER * 0.4 : MASTER)
  const d = targetDuck()
  const ramp = (node: GainNode, value: number, seconds: number) => {
    const current = node.gain.value
    if (Math.abs(current - value) < 0.002) {
      node.gain.cancelScheduledValues(now)
      node.gain.setValueAtTime(value, now)
      return
    }
    node.gain.cancelScheduledValues(now)
    node.gain.setValueAtTime(current, now)
    node.gain.linearRampToValueAtTime(value, now + seconds)
  }
  ramp(master, masterLevel, FADE_MS / 1000)
  ramp(diveGain, diveLevel, FADE_MS / 1000)
  ramp(duckGain, d, 0.12)
}

/** Call from the user-gesture play/resume path so the AudioContext can start. */
export function primeBattleAudio() {
  ensureSubscribe()
  armed = true
  paused = false
  ended = false
  const audio = getContext()
  if (!audio) return
  void (async () => {
    try {
      if (audio.state === 'suspended') await audio.resume()
    } catch { /* autoplay policy */ }
    const decoded = await loadBuffer(audio)
    if (!decoded || !armed || paused || useJourney.getState().activeJourney !== 'force') return
    startLoop()
    try {
      if (audio.state === 'suspended') await audio.resume()
    } catch { /* ignore */ }
    applyGains()
  })()
}

export function setBattleAudioTalking(value: boolean) {
  talking = value
  applyGains()
}

export function setBattleAudioPaused(value: boolean) {
  paused = value
  if (value) {
    talking = false
    applyGains()
    if (ctx && ctx.state === 'running') void ctx.suspend()
  } else if (armed && ctx) {
    void ctx.resume().then(() => {
      startLoop()
      applyGains()
    }).catch(() => { /* autoplay policy */ })
  }
}

export function setBattleAudioEnded() {
  ended = true
  talking = false
  paused = false
  applyGains()
}

export function stopBattleAudio() {
  paused = true
  talking = false
  ended = false
  armed = false
  applyGains()
  if (ctx && ctx.state === 'running') void ctx.suspend()
}

/** Read-only snapshot for QA. */
export function inspectBattleAudio() {
  return {
    armed,
    paused,
    talking,
    ended,
    contextState: ctx?.state ?? 'none',
    hasBuffer: Boolean(buffer),
    bufferDuration: buffer?.duration ?? 0,
    master: master?.gain.value ?? 0,
    diveGain: diveGain?.gain.value ?? 0,
    duckGain: duckGain?.gain.value ?? 0,
    diveProgress: useJourney.getState().diveProgress,
    journey: useJourney.getState().activeJourney,
    targetMaster: targetMaster(),
    targetDuck: targetDuck(),
  }
}
