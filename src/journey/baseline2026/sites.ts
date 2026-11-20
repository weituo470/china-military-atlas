/**
 * Present-day globe placements for the 2026 military baseline journey.
 * Every pin is a regional or typological coordinate, never a headquarters,
 * base, yard, airfield, or missile site. Calendar dates use this project's
 * historical numbering via src/utils/time.ts: 2026-07-01 is a mid-year
 * representative cursor, not a JavaScript Date invention.
 */
import type { JourneyFocus, JourneySite } from '../types'
import { COMPARISON_SITES } from './comparison'
import {
  REVIEW_CARRIERS,
  REVIEW_CARRIERS_ESTIMATE,
  REVIEW_OTHERS,
  REVIEW_SITES,
  REVIEW_GROUND_SITE,
  REVIEW_WIDE,
} from './review'

export const BASELINE_WINDOW = {
  year: 2026,
  cursor: '2026-07-01',
  yearStartCursor: '2026-01-01',
} as const

/** A readable China-regional framing that keeps all five theater areas in view. */
export const CHINA_REGIONAL_FOCUS = { lat: 35.2, lon: 111.8 }

/** Wide western-Pacific framing — a camera position, not a targeting plot. */
export const WEST_PACIFIC_FOCUS = { lat: 22.0, lon: 132.0 }

/** East Asia wide enough for the Chapter I / 2026 / Korea-interface ticks. */
export const EAST_ASIA_FOCUS = { lat: 33.0, lon: 120.0 }

/**
 * Regional centroids of the five official theater areas.
 * These are not headquarters street addresses and are not installation pins.
 */
export const THEATER_SITES: Record<string, JourneySite> = {
  eastern: {
    id: 'eastern',
    lat: 29.4,
    lon: 119.6,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional centroid of the eastern theater area (inland Zhejiang–Anhui), not a headquarters street address.',
      zh: '东部战区地域的地区中心（浙皖内陆一带），不是总部的门牌号。',
    },
  },
  southern: {
    id: 'southern',
    lat: 24.0,
    lon: 109.5,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional centroid of the southern theater area (eastern Guangxi / western Guangdong interior), not a headquarters, port, or island.',
      zh: '南部战区地域的地区中心（桂东–粤西内陆一带），不是总部、军港或岛屿。',
    },
  },
  western: {
    id: 'western',
    lat: 36.2,
    lon: 94.8,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional centroid chosen for the vast western theater area (eastern Qinghai plateau), not an installation.',
      zh: '为辽阔的西部战区地域选取的地区中心（青海东部高原一带），不是某一设施。',
    },
  },
  northern: {
    id: 'northern',
    lat: 43.8,
    lon: 121.5,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional centroid of the northern theater area (eastern Inner Mongolia / western Jilin), not a headquarters city.',
      zh: '北部战区地域的地区中心（内蒙古东部–吉林西部一带），不是某一总部城市。',
    },
  },
  central: {
    id: 'central',
    lat: 35.4,
    lon: 112.4,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional centroid of the central theater area (southern Shanxi / northern Henan), not Beijing and not a headquarters street.',
      zh: '中部战区地域的地区中心（晋南–豫北一带），不是北京，也不是总部街道。',
    },
  },
}

/** Typological coastal industrial regions — not yards or berths. */
export const INDUSTRY_SITES: Record<string, JourneySite> = {
  bohai: {
    id: 'bohai',
    lat: 38.7,
    lon: 119.4,
    certainty: 'regional',
    precisionNote: {
      en: 'Typological mark for the Bohai-rim industrial region, placed over open coastal water — not a shipyard or berth.',
      zh: '渤海沿岸产业带的类型学标记，落在开阔近海，不是船厂或泊位。',
    },
  },
  yangtze: {
    id: 'yangtze',
    lat: 31.3,
    lon: 122.4,
    certainty: 'regional',
    precisionNote: {
      en: 'Typological mark for the Yangtze-mouth industrial region, offshore of the estuary — not a named yard.',
      zh: '长江口产业带的类型学标记，落在河口外海，不是某一船厂。',
    },
  },
  pearl: {
    id: 'pearl',
    lat: 21.6,
    lon: 113.4,
    certainty: 'regional',
    precisionNote: {
      en: 'Typological mark for a southern coastal industrial region, over open water — not a dock or airfield.',
      zh: '南部沿海产业带的类型学标记，落在开阔水面，不是码头或机场。',
    },
  },
}

/**
 * Typological equipment silhouettes, placed in open-sea or inland typological
 * positions, never at a named dock, airfield, or yard.
 */
export const PLATFORM_SITES: Record<string, JourneySite> = {
  carriers: {
    id: 'carriers',
    lat: 32.2,
    lon: 124.6,
    certainty: 'representative',
    precisionNote: {
      en: 'Open-sea typological placement for officially inducted carriers, not a berth and not a patrol track.',
      zh: '已入列航母的开阔海域类型学位置，不是泊位，也不是巡航航迹。',
    },
  },
  type055: {
    id: 'type055',
    lat: 34.0,
    lon: 123.2,
    certainty: 'representative',
    precisionNote: {
      en: 'Open-sea typological placement for the officially commissioned Type 055 class, not a hull at a yard.',
      zh: '〇五五型已入列舰级的开阔海域类型学位置，不是船厂里的一艘舰。',
    },
  },
  j20: {
    id: 'j20',
    lat: 34.6,
    lon: 109.4,
    certainty: 'representative',
    precisionNote: {
      en: 'Inland typological placement for the officially inducted J-20, not an airfield coordinate.',
      zh: '歼-20官方列装的内陆类型学位置，不是机场坐标。',
    },
  },
}

/**
 * Re-export typological comparison sites (regional centroids, not capitals or bases).
 * Numbers and placements live in comparison.ts.
 */
export { COMPARISON_SITES }
export { REVIEW_SITES, REVIEW_GROUND_SITE, REVIEW_WIDE, REVIEW_CARRIERS, REVIEW_CARRIERS_ESTIMATE, REVIEW_OTHERS } from './review'

export const DOCTRINE_SITE: JourneySite = {
  id: 'vocabulary',
  lat: 35.0,
  lon: 112.0,
  certainty: 'regional',
  precisionNote: {
    en: 'Typological mark for official public vocabulary, not a headquarters or a school.',
    zh: '官方公开词汇的类型学标记，不是总部或院校。',
  },
}

/**
 * Interface only: a regional tick so a later Korea journey has a visible hook.
 * Not a battlefield, not the 38th parallel as a military line, not a campaign map.
 */
export const KOREA_INTERFACE_SITE: JourneySite = {
  id: 'korea-interface',
  lat: 36.4,
  lon: 127.9,
  certainty: 'regional',
  precisionNote: {
    en: 'Regional interface for a future 1950–53 sibling journey — not a campaign map or a battlefield reconstruction.',
    zh: '为未来一九五〇到五三年平行导览留下的地区性接口，不是战役图，也不是战场复原。',
  },
}

/** Wide schematic arc across the western Pacific. Endpoints are framing, not objectives. */
export const WEST_PACIFIC_ARC = {
  id: 'westpac',
  points: [
    { lat: 32.0, lon: 124.0 },
    { lat: 28.0, lon: 128.0 },
    { lat: 22.0, lon: 132.0 },
    { lat: 16.0, lon: 134.0 },
    { lat: 10.0, lon: 130.0 },
  ],
  certainty: 'regional' as const,
  precisionNote: {
    en: 'A wide typological framing of the western Pacific.',
    zh: '西太平洋的开阔类型学取景。',
  },
}

/**
 * Camera distances are in the existing Earth scene units (Earth radius = 1.5).
 * Default overview is about 4.25. The western-Pacific beat stays deliberately wide.
 */
const CHINA: JourneyFocus = { lat: CHINA_REGIONAL_FOCUS.lat, lon: CHINA_REGIONAL_FOCUS.lon, distance: 3.05 }
const CHINA_TIGHT: JourneyFocus = { lat: CHINA_REGIONAL_FOCUS.lat, lon: CHINA_REGIONAL_FOCUS.lon, distance: 2.72 }
const THEATERS: JourneyFocus = { lat: 41.8, lon: 110.0, distance: 3.38 }
const COAST: JourneyFocus = { lat: 31.0, lon: 121.0, distance: 2.85 }
const OPEN_SEA: JourneyFocus = { lat: 32.5, lon: 124.0, distance: 2.95 }
/** Near-Arctic northern-hemisphere overview so many comparison clusters are in frame. */
const SCALE_WORLD: JourneyFocus = { lat: 70.0, lon: 30.0, distance: 6.45 }
/** Look north of the Eurasian cluster so Russia and the DPRK sit in the belt under a raised paper, not in it. */
const SCALE_EURASIA: JourneyFocus = { lat: 74.0, lon: 105.0, distance: 5.70 }
/** Higher-latitude mid-Pacific look so mid-latitude shafts sit in the lower belt under the paper, with the US fully in the lower-right (not in the mid-right tear). China and Japan stay on the left. Distance stays in the 6.0–6.5 band. */
const SCALE_PACIFIC: JourneyFocus = { lat: 88.0, lon: -174.0, distance: 6.15 }
const WESTPAC: JourneyFocus = { lat: WEST_PACIFIC_FOCUS.lat, lon: WEST_PACIFIC_FOCUS.lon, distance: 4.72 }
const WESTPAC_WIDE: JourneyFocus = { lat: 20.5, lon: 130.0, distance: 5.05 }
const EAST_ASIA: JourneyFocus = { lat: EAST_ASIA_FOCUS.lat, lon: EAST_ASIA_FOCUS.lon, distance: 4.35 }

/**
 * One geographic cue per spoken paragraph.
 * Beat staging.focus must match paragraph 0 so setBeat does not double-fly.
 */
export const PARAGRAPH_FOCUS: readonly (readonly JourneyFocus[])[] = [
  [CHINA, CHINA_TIGHT],
  [CHINA, CHINA],
  [THEATERS, THEATERS, CHINA],
  [OPEN_SEA, COAST, COAST],
  [SCALE_WORLD, SCALE_EURASIA, SCALE_PACIFIC],
  [REVIEW_WIDE, REVIEW_CARRIERS, REVIEW_CARRIERS_ESTIMATE, REVIEW_OTHERS],
  [WESTPAC, WESTPAC_WIDE],
  [CHINA, CHINA_TIGHT],
  [EAST_ASIA, EAST_ASIA],
]

export function focusForParagraph(beatIndex: number, paragraphIndex: number): JourneyFocus {
  const cues = PARAGRAPH_FOCUS[beatIndex] ?? PARAGRAPH_FOCUS[0]
  if (paragraphIndex < 0 || paragraphIndex >= cues.length) return cues[0]
  return cues[paragraphIndex] ?? cues[0]
}

export type BaselineStaging = {
  cursor: string
  focus: JourneyFocus
  visibleTheaters: string[]
  showPlatforms: boolean
  showIndustry: boolean
  showScale: boolean
  showReview: boolean
  showWestPacArc: boolean
  showDoctrine: boolean
  showInterfaces: boolean
}

const ALL_THEATERS = ['eastern', 'southern', 'western', 'northern', 'central']

export const BEAT_STAGING = [
  {
    cursor: BASELINE_WINDOW.yearStartCursor,
    focus: CHINA,
    visibleTheaters: [],
    showPlatforms: false,
    showIndustry: false,
    showScale: false,
    showReview: false,
    showWestPacArc: false,
    showDoctrine: false,
    showInterfaces: false,
  },
  {
    cursor: BASELINE_WINDOW.cursor,
    focus: CHINA,
    visibleTheaters: [],
    showPlatforms: false,
    showIndustry: false,
    showScale: false,
    showReview: false,
    showWestPacArc: false,
    showDoctrine: false,
    showInterfaces: false,
  },
  {
    cursor: BASELINE_WINDOW.cursor,
    focus: THEATERS,
    visibleTheaters: ALL_THEATERS,
    showPlatforms: false,
    showIndustry: false,
    showScale: false,
    showReview: false,
    showWestPacArc: false,
    showDoctrine: false,
    showInterfaces: false,
  },
  {
    cursor: BASELINE_WINDOW.cursor,
    focus: OPEN_SEA,
    visibleTheaters: [],
    showPlatforms: true,
    showIndustry: true,
    showScale: false,
    showReview: false,
    showWestPacArc: false,
    showDoctrine: false,
    showInterfaces: false,
  },
  {
    cursor: BASELINE_WINDOW.cursor,
    focus: SCALE_WORLD,
    visibleTheaters: [],
    showPlatforms: false,
    showIndustry: false,
    showScale: true,
    showReview: false,
    showWestPacArc: false,
    showDoctrine: false,
    showInterfaces: false,
  },
  {
    cursor: BASELINE_WINDOW.cursor,
    focus: REVIEW_WIDE,
    visibleTheaters: [],
    showPlatforms: false,
    showIndustry: false,
    showScale: false,
    showReview: true,
    showWestPacArc: false,
    showDoctrine: false,
    showInterfaces: false,
  },
  {
    cursor: BASELINE_WINDOW.cursor,
    focus: WESTPAC,
    visibleTheaters: [],
    showPlatforms: false,
    showIndustry: false,
    showScale: false,
    showReview: false,
    showWestPacArc: true,
    showDoctrine: false,
    showInterfaces: false,
  },
  {
    cursor: BASELINE_WINDOW.cursor,
    focus: CHINA,
    visibleTheaters: [],
    showPlatforms: false,
    showIndustry: false,
    showScale: false,
    showReview: false,
    showWestPacArc: false,
    showDoctrine: true,
    showInterfaces: false,
  },
  {
    cursor: BASELINE_WINDOW.cursor,
    focus: EAST_ASIA,
    visibleTheaters: ALL_THEATERS,
    showPlatforms: false,
    showIndustry: false,
    showScale: false,
    showReview: false,
    showWestPacArc: false,
    showDoctrine: false,
    showInterfaces: true,
  },
] as const satisfies readonly BaselineStaging[]

export const BEAT_COUNT = BEAT_STAGING.length


/** Flat lookup for the shared openCard / getJourneySite helper. */
export const SITE_INDEX: Record<string, JourneySite> = {
  ...THEATER_SITES,
  ...INDUSTRY_SITES,
  ...PLATFORM_SITES,
  ...COMPARISON_SITES,
  ...REVIEW_SITES,
  [REVIEW_GROUND_SITE.id]: REVIEW_GROUND_SITE,
  [DOCTRINE_SITE.id]: DOCTRINE_SITE,
  [KOREA_INTERFACE_SITE.id]: KOREA_INTERFACE_SITE,
}

if (PARAGRAPH_FOCUS.length !== BEAT_STAGING.length) {
  throw new Error(`baseline2026 paragraph-focus/staging length mismatch: ${PARAGRAPH_FOCUS.length} vs ${BEAT_STAGING.length}`)
}
