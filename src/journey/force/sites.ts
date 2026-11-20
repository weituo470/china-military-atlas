/**
 * Present-day globe placements for Chapter I.
 * Every pin is a representative or site coordinate, never claimed as meter-precise excavation data.
 * Historical years use this project's numbering: -0475 is 475 BCE; year 0 is invalid.
 */
import type { JourneyFocus, JourneySite, JourneyStaging } from '../types'

/** Conventional textbook frame for the Warring States. 403 BCE is a strong alternative start. */
export const WARRING_STATES_WINDOW = {
  startYear: -475,
  alternativeStartYear: -403,
  endYear: -221,
  midCursor: '-0350-01-01',
  startCursor: '-0475-01-01',
  changpingCursor: '-0260-01-01',
  unificationCursor: '-0221-01-01',
} as const

/** A point from which China, South Asia, the Near East and the Mediterranean can be read together. */
export const EURASIA_FOCUS = { lat: 34.6, lon: 58.0 }

export const CHINA_REGIONAL_FOCUS = { lat: 35.2, lon: 111.8 }

/**
 * Gaoping, Shanxi, is the modern city associated with the Changping campaign.
 * The figure is a clearly labeled site/representative coordinate, not a trench grid.
 */
export const CHANGPING_SITE: JourneySite = {
  id: 'changping',
  lat: 35.80,
  lon: 112.93,
  certainty: 'site',
  precisionNote: {
    en: 'Site / representative coordinate near present-day Gaoping, Shanxi — not claimed to meter precision.',
    zh: '今山西高平一带的遗址/代表性坐标，并非米级精度。',
  },
}

export const THEATER_SITES: Record<string, JourneySite> = {
  china: {
    id: 'china',
    lat: 34.62,
    lon: 112.45,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional anchor on the Central Plains (near present-day Luoyang), not a capital pin for any one state.',
      zh: '中原地区的代表性锚点（今洛阳一带），不是某一国都的精确钉位。',
    },
  },
  greece: {
    id: 'greece',
    lat: 37.97,
    lon: 23.72,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional anchor for the eastern Mediterranean / Greek world, using Athens as a readable reference — not a single battlefield.',
      zh: '东地中海 / 希腊世界的地区锚点，以雅典作为可读参照，不是某一战场。',
    },
  },
  'near-east': {
    id: 'near-east',
    lat: 32.54,
    lon: 44.42,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional anchor in Mesopotamia (Babylon as a readable Achaemenid-era reference), not an army camp.',
      zh: '美索不达米亚的地区锚点（以巴比伦作为阿契美尼德时代的可读参照），不是某一军营。',
    },
  },
  'south-asia': {
    id: 'south-asia',
    lat: 25.61,
    lon: 85.13,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional anchor for Magadha in the late Mahajanapada / Nanda period, near later Pataliputra — cautious and representative.',
      zh: '列国晚期至难陀时期摩揭陀的地区锚点，靠近后来的华氏城，仅为审慎的代表性位置。',
    },
  },
  rome: {
    id: 'rome',
    lat: 41.89,
    lon: 12.49,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional anchor at Rome, introduced only for the late overlap (from the First Punic War, 264 BCE). Cannae (216) is after 221 and is not marked.',
      zh: '以罗马为地区锚点，仅在战国末期重叠处引入（自前264年第一次布匿战争起）。坎尼（前216）已在前221年之后，不在此标注。',
    },
  },
}

export const INSTITUTION_SITES: JourneySite[] = [
  {
    id: 'registers',
    lat: 34.35,
    lon: 108.95,
    certainty: 'regional',
    precisionNote: {
      en: 'Typological placement in the Guanzhong basin, evoking Qin’s well-documented reforms — not a named archive site.',
      zh: '置于关中盆地的类型学位置，用以提示秦国记载较清楚的改革，不是某一档案出土地。',
    },
  },
  {
    id: 'granaries',
    lat: 35.05,
    lon: 113.85,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional typological placement on the Central Plains, not a reconstructed granary.',
      zh: '中原地区的类型学位置，不是某一粮仓遗址的复原。',
    },
  },
  {
    id: 'counties',
    lat: 33.75,
    lon: 113.0,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional typological placement for county administration, which was wider than Qin alone.',
      zh: '用以提示县制的地区性类型学位置；这一格局并不限于秦。',
    },
  },
  {
    id: 'conscription',
    lat: 36.1,
    lon: 111.5,
    certainty: 'regional',
    precisionNote: {
      en: 'Regional typological placement in Shanxi–Henan, not a muster ground.',
      zh: '晋豫一带的类型学位置，不是某一征兵场地。',
    },
  },
]

/** Typological weapon rack in the Guanzhong / Wei valley — not a hoard or museum scan. */
export const WEAPON_RACK = {
  lat: 34.32,
  lon: 108.7,
  certainty: 'regional' as const,
  precisionNote: {
    en: 'Typological rack placed in the Guanzhong basin for inspection, not an excavated weapons cache.',
    zh: '为便于检视而放在关中盆地的类型学兵器架，不是出土兵器窖藏。',
  },
  slots: [
    { id: 'ge', offsetKm: [-90, -40] },
    { id: 'crossbow', offsetKm: [-30, 30] },
    { id: 'jian', offsetKm: [30, -25] },
    { id: 'cavalry', offsetKm: [90, 35] },
  ],
}

/**
 * Camera distances are in the existing Earth scene units (Earth radius = 1.5).
 * Default overview is about 4.25; a slightly wider Eurasian framing keeps Rome readable at the western limb.
 */
const EURASIA: JourneyFocus = { lat: EURASIA_FOCUS.lat, lon: EURASIA_FOCUS.lon, distance: 4.58 }
const CHINA: JourneyFocus = { lat: CHINA_REGIONAL_FOCUS.lat, lon: CHINA_REGIONAL_FOCUS.lon, distance: 2.88 }
const WEAPONS: JourneyFocus = { lat: WEAPON_RACK.lat, lon: WEAPON_RACK.lon, distance: 2.52 }
const CHANGPING: JourneyFocus = { lat: CHANGPING_SITE.lat, lon: CHANGPING_SITE.lon, distance: 2.18 }
/** Eastern Mediterranean wide enough for Greece, Sicily, and the Levant to stay readable. */
const MEDITERRANEAN: JourneyFocus = { lat: 36.4, lon: 22.4, distance: 3.62 }
const GREECE: JourneyFocus = { lat: THEATER_SITES.greece.lat, lon: THEATER_SITES.greece.lon, distance: 3.08 }
const SICILY: JourneyFocus = { lat: 37.07, lon: 15.29, distance: 3.18 }

/** Cinematic close-ups: typological scale, not a meter-precise reconstruction. */
const PLAINS_DIVE = {
  altitude: 0.0066,
  pitch: 0.32,
  back: 0.028,
  look: 0.036,
  east: 0.017,
  north: 0.028,
  revealAltitude: 0.058,
  revealPitch: 0.46,
  revealBack: 0.125,
  revealLook: 0.17,
  revealEast: 0.01,
  revealNorth: 0,
} as const
const SCALE_DIVE = {
  altitude: 0.0104,
  pitch: 0.38,
  back: 0.044,
  look: 0.07,
  east: 0.018,
  revealAltitude: 0.066,
  revealPitch: 0.48,
  revealBack: 0.14,
  revealLook: 0.19,
  revealEast: 0.012,
} as const
const CHANGPING_DIVE = {
  altitude: 0.0094,
  pitch: 0.37,
  back: 0.04,
  look: 0.064,
  east: 0.016,
  revealAltitude: 0.06,
  revealPitch: 0.47,
  revealBack: 0.13,
  revealLook: 0.18,
  revealEast: 0.01,
} as const

const CHINA_BATTLE: JourneyFocus = { ...CHINA, dive: PLAINS_DIVE }
const CHINA_MASS: JourneyFocus = { ...CHINA, dive: SCALE_DIVE }
const CHANGPING_BATTLE: JourneyFocus = { ...CHANGPING, dive: CHANGPING_DIVE }

/**
 * One geographic cue per spoken paragraph.
 * When the voice talks about China the globe turns to China; when it talks about the Mediterranean, it turns west.
 * Beat staging.focus must match paragraph 0 so setBeat does not double-fly.
 */
export const PARAGRAPH_FOCUS: readonly (readonly JourneyFocus[])[] = [
  [CHINA_BATTLE, CHINA_BATTLE, MEDITERRANEAN, EURASIA],
  [CHINA, MEDITERRANEAN],
  [CHINA, GREECE],
  [WEAPONS, WEAPONS],
  [MEDITERRANEAN, CHINA_MASS],
  [CHANGPING_BATTLE, CHANGPING_BATTLE],
  [CHINA, SICILY, CHINA],
  [EURASIA],
]

export function focusForParagraph(beatIndex: number, paragraphIndex: number): JourneyFocus {
  const cues = PARAGRAPH_FOCUS[beatIndex] ?? PARAGRAPH_FOCUS[0]
  if (paragraphIndex < 0 || paragraphIndex >= cues.length) return cues[0]
  return cues[paragraphIndex] ?? cues[0]
}

const ALL_THEATERS = ['china', 'greece', 'near-east', 'south-asia', 'rome']

export const BEAT_STAGING = [
  {
    cursor: WARRING_STATES_WINDOW.startCursor,
    focus: CHINA,
    visibleTheaters: ['china', 'greece', 'near-east'],
    showInstitutions: false,
    showWeapons: false,
    showFormations: false,
    showChangping: false,
  },
  {
    cursor: WARRING_STATES_WINDOW.midCursor,
    focus: CHINA,
    visibleTheaters: ALL_THEATERS,
    showInstitutions: false,
    showWeapons: false,
    showFormations: false,
    showChangping: false,
  },
  {
    cursor: '-0356-01-01',
    focus: CHINA,
    visibleTheaters: ['china', 'greece'],
    showInstitutions: true,
    showWeapons: false,
    showFormations: false,
    showChangping: false,
  },
  {
    cursor: '-0307-01-01',
    focus: WEAPONS,
    visibleTheaters: ['china'],
    showInstitutions: false,
    showWeapons: true,
    showFormations: false,
    showChangping: false,
  },
  {
    cursor: '-0331-01-01',
    focus: MEDITERRANEAN,
    visibleTheaters: ALL_THEATERS,
    showInstitutions: false,
    showWeapons: false,
    showFormations: true,
    showChangping: false,
  },
  {
    cursor: WARRING_STATES_WINDOW.changpingCursor,
    focus: CHANGPING_BATTLE,
    visibleTheaters: ['china'],
    showInstitutions: false,
    showWeapons: false,
    showFormations: false,
    showChangping: true,
  },
  {
    cursor: WARRING_STATES_WINDOW.midCursor,
    focus: CHINA,
    visibleTheaters: ['china', 'greece', 'near-east'],
    showInstitutions: false,
    showWeapons: false,
    showFormations: false,
    showChangping: false,
  },
  {
    cursor: WARRING_STATES_WINDOW.unificationCursor,
    focus: EURASIA,
    visibleTheaters: ALL_THEATERS,
    showInstitutions: false,
    showWeapons: false,
    showFormations: false,
    showChangping: false,
  },
] as const satisfies readonly JourneyStaging[]

export const BEAT_COUNT = BEAT_STAGING.length

export function offsetLatLon(lat: number, lon: number, eastKm: number, northKm: number) {
  const degLat = northKm / 111.32
  const degLon = eastKm / (111.32 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)))
  return { lat: lat + degLat, lon: lon + degLon }
}
