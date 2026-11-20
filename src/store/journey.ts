import { create } from 'zustand'
import { getJourneyBeatCount, getJourneySite, getJourneyStaging } from '../journey/runtime'
import type { ExperienceSnapshot, JourneyCardKind, JourneyFocus, JourneyId, JourneyLang } from '../journey/types'
import { useExperience } from './experience'
import type { IndustryLanguage } from '../journey/industry/locale'
import type { BaselineLocale } from '../journey/baseline2026/locale'

import { isHubLocale, type HubLocale } from '../components/hub/i18n/locales'

const HUB_LANG_KEY = 'earth-force-hub-locale'
const INDUSTRY_LANG_KEY = 'earth-force-industry-locale'
const BASELINE_LANG_KEY = 'earth-force-baseline2026-locale'

function readBaselineLocale(): BaselineLocale | null {
  try {
    const value = window.localStorage.getItem(BASELINE_LANG_KEY)
    if (value === 'zh' || value === 'en' || value === 'ja') return value
  } catch { /* storage may be unavailable */ }
  return null
}

function readIndustryLanguage(): IndustryLanguage | null {
  try {
    const value = window.localStorage.getItem(INDUSTRY_LANG_KEY)
    if (value === 'zh' || value === 'en' || value === 'ja') return value
  } catch { /* storage may be unavailable */ }
  return null
}

function readHubLocale(): HubLocale {
  try {
    const saved = window.localStorage.getItem(HUB_LANG_KEY)
    if (isHubLocale(saved)) return saved
  } catch { /* storage may be unavailable */ }
  return readStoredLanguage()
}

const LANG_KEY = 'earth-force-journey-lang'

function readStoredLanguage(): JourneyLang {
  if (typeof window === 'undefined') return 'zh'
  try {
    const stored = window.localStorage.getItem(LANG_KEY)
    return stored === 'zh' || stored === 'en' ? stored : 'zh'
  } catch {
    return 'zh'
  }
}

function captureSnapshot(): ExperienceSnapshot {
  const state = useExperience.getState()
  return {
    spaceMode: state.spaceMode,
    historyLens: state.historyLens,
    granularity: state.granularity,
    calendarCursor: state.calendarCursor,
    calendarModel: state.calendarModel,
    isPlaying: state.isPlaying,
    selectedEventId: state.selectedEventId,
    selectedSpacecraftId: state.selectedSpacecraftId,
    selectedMarsLandmarkId: state.selectedMarsLandmarkId,
    progress: state.progress,
    hasEnteredDeepTime: state.hasEnteredDeepTime,
    cameraPosition: null,
  }
}


function sameDive(a: JourneyFocus['dive'], b: JourneyFocus['dive']) {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.altitude === b.altitude && a.pitch === b.pitch && a.back === b.back
}

function sameFocus(current: JourneyFocus | null, focus: JourneyFocus) {
  return Boolean(
    current
    && current.lat === focus.lat
    && current.lon === focus.lon
    && current.distance === focus.distance
    && sameDive(current.dive, focus.dive),
  )
}

function applyEarthWindow(cursor: string) {
  useExperience.setState({
    spaceMode: 'earth',
    activePlanetId: 'earth',
    granularity: 'century',
    calendarCursor: cursor,
    calendarModel: 'gregorian',
    isPlaying: false,
    selectedEventId: null,
    selectedSpacecraftId: null,
    selectedMarsLandmarkId: null,
  })
}

type JourneyState = {
  activeJourney: JourneyId | null
  chapterIndex: number
  beatIndex: number
  language: JourneyLang
  industryLanguage: IndustryLanguage | null
  setIndustryLanguage: (locale: IndustryLanguage) => void
  baselineLocale: BaselineLocale | null
  setBaselineLocale: (locale: BaselineLocale) => void
  hubLocale: HubLocale
  setHubLocale: (locale: HubLocale) => void
  selectedCardKind: JourneyCardKind | null
  selectedCardId: string | null
  sourcesOpen: boolean
  lockExploded: boolean
  focus: JourneyFocus | null
  cameraNonce: number
  diveProgress: number
  restoreCamera: [number, number, number] | null
  snapshot: ExperienceSnapshot | null
  lastExitedJourney: JourneyId | null
  startJourney: (id: JourneyId) => void
  exitJourney: (options?: { restoreSpaceMode?: boolean }) => void
  setBeat: (index: number) => void
  advance: (direction: -1 | 1) => void
  setLanguage: (language: JourneyLang) => void
  openCard: (kind: JourneyCardKind, id: string, focus?: JourneyFocus) => void
  closeCard: () => void
  toggleSources: (open?: boolean) => void
  setLockExploded: (exploded: boolean) => void
  setFocus: (focus: JourneyFocus) => void
  setDiveProgress: (value: number) => void
  captureCameraPosition: (position: [number, number, number]) => void
}

export const useJourney = create<JourneyState>((set, get) => ({
  activeJourney: null,
  chapterIndex: 0,
  beatIndex: 0,
  language: readStoredLanguage(),
  hubLocale: readHubLocale(),
  industryLanguage: readIndustryLanguage(),
  baselineLocale: readBaselineLocale(),
  setBaselineLocale: (baselineLocale) => {
    if (get().activeJourney !== 'baseline2026') return
    try { window.localStorage.setItem(BASELINE_LANG_KEY, baselineLocale) } catch { /* local preference only */ }
    set({ baselineLocale })
  },
  setIndustryLanguage: (industryLanguage) => {
    if (get().activeJourney !== 'industry') return
    try {
      window.localStorage.setItem(INDUSTRY_LANG_KEY, industryLanguage)
    } catch { /* preference still works in memory */ }
    set({ industryLanguage })
  },
  setHubLocale: (hubLocale) => {
    const language = hubLocale === 'zh' ? 'zh' : 'en'
    try {
      window.localStorage.setItem(HUB_LANG_KEY, hubLocale)
      window.localStorage.setItem(LANG_KEY, language)
      window.localStorage.removeItem(INDUSTRY_LANG_KEY)
    } catch { /* preferences still work in memory */ }
    set({ hubLocale, language, industryLanguage: null })
  },
  selectedCardKind: null,
  selectedCardId: null,
  sourcesOpen: false,
  lockExploded: false,
  focus: null,
  cameraNonce: 0,
  diveProgress: 0,
  restoreCamera: null,
  snapshot: null,
  lastExitedJourney: null,

  startJourney: (id) => {
    if (get().activeJourney === id) return
    const snapshot = get().activeJourney ? get().snapshot : captureSnapshot()
    const staging = getJourneyStaging(id, 0)
    applyEarthWindow(staging.cursor)
    set({
      activeJourney: id,
      chapterIndex: 0,
      beatIndex: 0,
      selectedCardKind: null,
      selectedCardId: null,
      sourcesOpen: false,
      lockExploded: false,
      focus: staging.focus,
      cameraNonce: get().cameraNonce + 1,
      diveProgress: 0,
      restoreCamera: null,
      snapshot,
    })
  },

  exitJourney: (options) => {
    const { snapshot, activeJourney } = get()
    if (!activeJourney) return
    const restoreSpaceMode = options?.restoreSpaceMode !== false
    if (snapshot) {
      useExperience.setState({
        spaceMode: restoreSpaceMode ? snapshot.spaceMode : useExperience.getState().spaceMode,
        activePlanetId: restoreSpaceMode
          ? (snapshot.spaceMode === 'earth' ? 'earth' : snapshot.spaceMode === 'mars' ? 'mars' : useExperience.getState().activePlanetId)
          : useExperience.getState().activePlanetId,
        historyLens: snapshot.historyLens,
        granularity: snapshot.granularity,
        calendarCursor: snapshot.calendarCursor,
        calendarModel: snapshot.calendarModel,
        isPlaying: false,
        selectedEventId: null,
        selectedSpacecraftId: null,
        selectedMarsLandmarkId: snapshot.spaceMode === 'mars' && restoreSpaceMode ? snapshot.selectedMarsLandmarkId : null,
        progress: snapshot.progress,
        hasEnteredDeepTime: snapshot.hasEnteredDeepTime,
      })
    }
    set({
      activeJourney: null,
      selectedCardKind: null,
      selectedCardId: null,
      sourcesOpen: false,
      lockExploded: false,
      focus: null,
      diveProgress: 0,
      restoreCamera: snapshot?.cameraPosition ?? null,
      snapshot: null,
      lastExitedJourney: activeJourney,
    })
  },

  setBeat: (index) => {
    const active = get().activeJourney
    if (!active) return
    const beatIndex = Math.min(getJourneyBeatCount(active) - 1, Math.max(0, Math.round(index)))
    const staging = getJourneyStaging(active, beatIndex)
    applyEarthWindow(staging.cursor)
    set({
      beatIndex,
      selectedCardKind: null,
      selectedCardId: null,
      sourcesOpen: false,
      lockExploded: false,
      focus: staging.focus,
      cameraNonce: get().cameraNonce + 1,
    })
  },

  advance: (direction) => {
    const { beatIndex, setBeat } = get()
    setBeat(beatIndex + direction)
  },

  setLanguage: (language) => {
    // Guide controls remain bilingual; preserve the visitor's separate entrance choice.
    const previous = get().hubLocale
    const hubLocale = previous === 'zh' || previous === 'en' ? language : previous
    try {
      window.localStorage.setItem(LANG_KEY, language)
      window.localStorage.setItem(HUB_LANG_KEY, hubLocale)
    } catch { /* preferences still work in memory */ }
    set({ language, hubLocale })
  },

  openCard: (kind, id, focus) => {
    const already = get().selectedCardKind === kind && get().selectedCardId === id
    if (already) {
      set({ selectedCardKind: null, selectedCardId: null, lockExploded: false })
      return
    }
    const registrySite = getJourneySite(get().activeJourney, id)
    const nextFocus = focus ?? (registrySite
      ? { lat: registrySite.lat, lon: registrySite.lon, distance: 3.2 }
      : undefined)
    set({
      selectedCardKind: kind,
      selectedCardId: id,
      lockExploded: kind === 'weapon' && id === 'crossbow' ? get().lockExploded : false,
      ...(nextFocus ? { focus: nextFocus, cameraNonce: get().cameraNonce + 1 } : {}),
    })
  },

  closeCard: () => set({ selectedCardKind: null, selectedCardId: null, lockExploded: false }),

  toggleSources: (open) => set((current) => ({
    sourcesOpen: open ?? !current.sourcesOpen,
  })),

  setLockExploded: (lockExploded) => set({ lockExploded }),

  setFocus: (focus) => {
    if (!get().activeJourney) return
    if (sameFocus(get().focus, focus)) return
    set({ focus, cameraNonce: get().cameraNonce + 1 })
  },

  setDiveProgress: (value) => {
    const next = Math.max(0, Math.min(1, value))
    const current = get().diveProgress
    if (Math.abs(current - next) < 0.008 && !(next === 0 && current !== 0) && !(next === 1 && current !== 1)) return
    set({ diveProgress: next })
  },

  captureCameraPosition: (position) => {
    const snapshot = get().snapshot
    if (!snapshot || snapshot.cameraPosition) return
    set({ snapshot: { ...snapshot, cameraPosition: position } })
  },
}))
