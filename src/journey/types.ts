import type { CalendarModel, CoordinateCertainty, HistoryLens, SpaceMode, TimelineGranularity } from '../types'

export type JourneyId = 'force' | 'baseline2026' | 'korea' | 'mobilize' | 'industry' | 'space'

export type JourneyLang = 'en' | 'zh'
export type JourneyCardKind =
  | 'theater'
  | 'weapon'
  | 'institution'
  | 'formation'
  | 'changping'
  | 'platform'
  | 'estimate'
  | 'doctrine'
  | 'campaign'
  | 'equipment'
  | 'site'

export type Localized = { en: string; zh: string }
export type LocalizedParagraphs = { en: readonly string[]; zh: readonly string[] }

export type JourneyBeat = {
  id: string
  name: Localized
  kicker: Localized
  title: Localized
  body: Localized
  narration: LocalizedParagraphs
}

export type ExperienceSnapshot = {
  spaceMode: SpaceMode
  historyLens: HistoryLens
  granularity: TimelineGranularity
  calendarCursor: string
  calendarModel: CalendarModel
  isPlaying: boolean
  selectedEventId: string | null
  selectedSpacecraftId: string | null
  selectedMarsLandmarkId: string | null
  progress: number
  hasEnteredDeepTime: boolean
  cameraPosition: [number, number, number] | null
}

export type JourneySite = {
  id: string
  lat: number
  lon: number
  certainty: CoordinateCertainty
  precisionNote: Localized
}

/** Close-up approach used by Chapter I battle dives. Distances are scene units (Earth radius = 1.5). */
export type JourneyDive = {
  /** Height above the globe surface at the end of the dive. */
  altitude: number
  /** 0 = look along the horizon, 1 = look straight down. */
  pitch?: number
  /** How far south of the aim point the camera stands, along the surface. */
  back?: number
  /** How far north of the site the camera looks, along the surface. */
  look?: number
  /** Mid-dive wide reveal, before the final push-in. */
  revealAltitude?: number
  revealPitch?: number
  revealBack?: number
  revealLook?: number
  /** Side offset along local east, so the settle view is a 3/4 on the contact line. */
  east?: number
  revealEast?: number
  /** Extra shift along local north, added to both camera and look (settle). */
  north?: number
  revealNorth?: number
}

export type JourneyFocus = {
  lat: number
  lon: number
  distance: number
  dive?: JourneyDive
  /**
   * If set, look at this surface point instead of the Earth origin.
   * Used only by the baseline2026 mid-Pacific review sea shots; other
   * journeys and beats omit it and keep the historical lookAt(0,0,0).
   */
  look?: { lat: number; lon: number }
  /** Optional vertical FOV in degrees. Restored to the shared 38° when omitted. */
  fov?: number
}

/**
 * Staging shape used by Chapter I (`force`). Other journeys may define their
 * own staging types; the shared store only reads `cursor` and `focus`.
 */
export type JourneyStaging = {
  cursor: string
  focus: JourneyFocus
  visibleTheaters: string[]
  showInstitutions: boolean
  showWeapons: boolean
  showFormations: boolean
  showChangping: boolean
}

/** The fields the shared journey store needs from any registered journey. */
export type JourneyStoreStaging = {
  cursor: string
  focus: JourneyFocus
}

/** Alias used by `runtime.ts` and the Korea journey. */
export type JourneyCameraStaging = JourneyStoreStaging

export function t(node: Localized | string | undefined, lang: JourneyLang): string {
  if (node == null) return ''
  if (typeof node === 'string') return node
  return node[lang] ?? node.en ?? ''
}

export function paragraphs(node: LocalizedParagraphs | Localized | undefined, lang: JourneyLang): string[] {
  if (!node) return []
  const value = node[lang] ?? node.en
  return (Array.isArray(value) ? [...value] : [value]).filter((line) => line.length > 0)
}
