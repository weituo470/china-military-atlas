/**
 * Public, typological comparison of major military forces for beat 4 (scale).
 * Numbers live here as the single typed source of truth. All figures are
 * external estimates unless a card or footnote says otherwise. Globe marks
 * are regional centroids, never capitals, HQs, bases, yards, or airfields.
 */
import type { JourneySite, Localized } from '../types'

export const COMPARISON_SOURCES = {
  iiss: {
    label: {
      en: 'IISS The Military Balance 2026, as published by Business Insider, “The largest militaries in the world, ranked by the number of active troops,” updated 26 October 2026, citing active armed forces during 2025. No printed IISS page was inspected.',
      zh: '国际战略研究所《军事平衡》2026年版，见《商业内幕》2026年10月26日更新的公开转述《按现役人数排列的世界最大军队》，口径为2025年现役。本导览未能核对印刷页码，故不虚造页码。',
    },
    url: 'https://www.businessinsider.com/largest-militaries-ranked-by-size',
  },
  sipri: {
    label: {
      en: 'SIPRI, Trends in World Military Expenditure, 2025 (fact sheet, April 2026), Table 1, current US dollars. Square brackets mark SIPRI estimates. Coverage is 2025, not a 2026 SIPRI figure.',
      zh: '斯德哥尔摩国际和平研究所《2025年世界军费趋势》（2026年4月概况）表1，当年美元。方括号为SIPRI估计。覆盖至2025年，不是对2026年的估计。',
    },
    url: 'https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025',
    pdf: 'https://www.sipri.org/sites/default/files/2026-04/2604_milex_2025.pdf',
  },
  flightglobal: {
    label: {
      en: 'FlightGlobal, World Air Forces 2026 (Cirium data, 1 October 2025), combat-aircraft column. Open corroboration: Air Museums Almanac and Aerospace Global News. Combat aircraft (fighters, attack aircraft, and bombers, as FlightGlobal defines them) are not interchangeable with an all-aircraft total.',
      zh: '飞行国际《世界空军》2026年版（Cirium数据，截至2025年10月1日）的作战飞机栏。公开核对见 Air Museums Almanac 与 Aerospace Global News。作战飞机（按该目录定义，含战斗机、攻击机和轰炸机）与全部军用飞机总数不可混用。',
    },
    directory: 'FlightGlobal, World Air Forces 2026',
    urls: [
      'https://airmuseums.co.uk/numbers/air-forces-of-the-world',
      'https://aerospaceglobalnews.com/news/world-combat-aircraft-fleets-2026/',
    ],
  },
  dod2024: {
    label: {
      en: 'US Department of Defense, Military and Security Developments Involving the PRC 2024: PLAN described as numerically the world’s largest navy, with a battle force of more than 370 ships and submarines, including more than 140 major surface combatants. A 2025 edition exists; this tour does not invent a newer PLAN hull count from it.',
      zh: '美国国防部《中国军事与安全发展报告》2024年版：将人民海军表述为按舰艇数量计的世界最大海军，战斗舰艇与潜艇合计370艘以上，其中主要水面战斗舰艇140艘以上。同一系列2025年版已经发布；本导览不从中另造更新的人民海军艘数。',
    },
  },
  crs: {
    label: {
      en: 'CRS Report RL32665, Navy Force Structure and Shipbuilding Plans: Background and Issues for Congress: as of 1 October 2025, the US Navy included 293 battle force ships. This official US figure is not under the same definition as the 2024 DoD wording on the PLAN.',
      zh: '美国国会研究处报告 RL32665《海军兵力结构与造船计划》：截至2025年10月1日，美国海军战斗舰艇为293艘。这一官方数字与美国国防部2024年对人民海军的表述，口径并不相同。',
    },
    url: 'https://www.congress.gov/crs_external_products/RL/HTML/RL32665.web.html',
  },
} as const

export type ComparisonAxisId = 'personnel' | 'spending' | 'aircraft'
export type ComparisonCountryId =
  | 'china'
  | 'india'
  | 'united-states'
  | 'north-korea'
  | 'russia'
  | 'south-korea'
  | 'japan'
  | 'france'
  | 'germany'
  | 'united-kingdom'

export type ComparisonAxis = {
  id: ComparisonAxisId
  color: string
  hatch: string
  label: Localized
  short: Localized
  unit: Localized
}

export const COMPARISON_AXES: readonly ComparisonAxis[] = [
  {
    id: 'personnel',
    color: '#8fb4c6',
    hatch: '#5b7c8c',
    label: { en: 'Active personnel', zh: '现役人数' },
    short: { en: 'Personnel', zh: '人数' },
    unit: { en: 'IISS active, 2025', zh: 'IISS 现役，2025' },
  },
  {
    id: 'spending',
    color: '#c4a36a',
    hatch: '#8a6b3a',
    label: { en: 'Military expenditure, 2025', zh: '2025 年军费' },
    short: { en: 'Spending', zh: '军费' },
    unit: { en: 'SIPRI, USD billion', zh: 'SIPRI，亿美元' },
  },
  {
    id: 'aircraft',
    color: '#8aa392',
    hatch: '#4f6d58',
    label: { en: 'Combat aircraft', zh: '作战飞机' },
    short: { en: 'Aircraft', zh: '飞机' },
    unit: { en: 'FlightGlobal combat', zh: 'FlightGlobal 作战飞机' },
  },
]

export const COMPARISON_MAX = {
  personnel: 2_035_000,
  spending: 954,
  aircraft: 2_718,
} as const

/** World-unit height of the tallest column (Earth radius = 1.5). */
export const COLUMN_MAX_HEIGHT = 0.4
export const COLUMN_WIDTH = 0.018
export const COLUMN_GAP = 0.01

export type ComparisonCountry = {
  id: ComparisonCountryId
  onGlobe: boolean
  name: Localized
  short: Localized
  adjective: Localized
  personnel?: number
  spending?: number
  spendingEstimated?: boolean
  aircraft?: number
  site?: JourneySite
  /** Local HTML label offset so East Asian names do not collide. */
  labelOffset?: [number, number, number]
  /** Geographic label anchor (degrees from the typological site), preferred when a 3D local offset would slide under the paper. */
  labelGeo?: { dLat: number; dLon: number }
  /**
   * Paragraph-specific globe-badge anchors. `eurasia` is used on scale
   * paragraphs 0–1 (SCALE_EURASIA); `pacific` on paragraph 2+
   * (SCALE_PACIFIC). A single lat/lon cannot serve both cameras.
   * Falls back to labelGeo / labelOffset when a frame is omitted.
   */
  labelByFrame?: {
    eurasia?: CompareLabelAnchor
    pacific?: CompareLabelAnchor
  }
}

export type CompareLabelAnchor = {
  offset?: [number, number, number]
  geo?: { dLat: number; dLon: number }
}

/** Resolve the globe-badge anchor for the current scale paragraph. */
export function compareLabelAnchor(country: ComparisonCountry, paragraphIndex: number): CompareLabelAnchor {
  const frame = paragraphIndex >= 2 ? country.labelByFrame?.pacific : country.labelByFrame?.eurasia
  if (frame) return frame
  return { offset: country.labelOffset, geo: country.labelGeo }
}

function typologicalSite(
  id: ComparisonCountryId,
  lat: number,
  lon: number,
  note: Localized,
): JourneySite {
  return {
    id,
    lat,
    lon,
    certainty: 'regional',
    precisionNote: note,
  }
}

export const COMPARISON_COUNTRIES: readonly ComparisonCountry[] = [
  {
    id: 'china',
    onGlobe: true,
    name: { en: 'China', zh: '中国' },
    short: { en: 'China', zh: '中国' },
    adjective: { en: 'Chinese', zh: '中国' },
    personnel: 2_035_000,
    spending: 336,
    spendingEstimated: true,
    aircraft: 1_814,
    site: typologicalSite('china', 35.0, 108.0, {
      en: 'Typological regional mark on the Central Plains, not a headquarters, base, or capital.',
      zh: '中原一带的类型学地区标记，不是总部、基地或首都。',
    }),
    labelOffset: [-0.055, 0, 0.02],
  },
  {
    id: 'india',
    onGlobe: true,
    name: { en: 'India', zh: '印度' },
    short: { en: 'India', zh: '印度' },
    adjective: { en: 'Indian', zh: '印度' },
    personnel: 1_501_000,
    spending: 92.1,
    aircraft: 600,
    site: typologicalSite('india', 23.0, 79.0, {
      en: 'Typological mark in central India, not a headquarters or a capital.',
      zh: '印度中部的类型学标记，不是总部或首都。',
    }),
  },
  {
    id: 'united-states',
    onGlobe: true,
    name: { en: 'United States', zh: '美国' },
    short: { en: 'United States', zh: '美国' },
    adjective: { en: 'US', zh: '美国' },
    personnel: 1_340_000,
    spending: 954,
    aircraft: 2_718,
    site: typologicalSite('united-states', 39.5, -98.0, {
      en: 'Typological mark in the continental interior, not a capital, headquarters, or base.',
      zh: '美国大陆内部的类型学标记，不是首都、总部或基地。',
    }),
  },
  {
    id: 'north-korea',
    onGlobe: true,
    name: { en: 'North Korea', zh: '朝鲜' },
    short: { en: 'DPRK', zh: '朝鲜' },
    adjective: { en: 'DPRK', zh: '朝鲜' },
    personnel: 1_280_000,
    aircraft: 455,
    site: typologicalSite('north-korea', 40.0, 127.0, {
      en: 'National typological mark, not a base and not a headquarters city.',
      zh: '全国性的类型学标记，不是基地，也不是某一总部城市。',
    }),
    labelByFrame: {
      // 3D offset, not a peninsula geo: geos near the site all project into the full-width .journey-progress hit rect and get hidden. This local vector sits in the clear belt between 俄罗斯 and 日本, same height as 日本.
      eurasia: { offset: [0.64, 0, 0.40] },
      // qa7 Pacific-visible position (30.4°N, 126.6°E) — do not move.
      pacific: { geo: { dLat: -9.6, dLon: -0.4 } },
    },
  },
  {
    id: 'russia',
    onGlobe: true,
    name: { en: 'Russia', zh: '俄罗斯' },
    short: { en: 'Russia', zh: '俄罗斯' },
    adjective: { en: 'Russian', zh: '俄罗斯' },
    personnel: 1_264_000,
    spending: 190,
    spendingEstimated: true,
    aircraft: 1_559,
    site: typologicalSite('russia', 58.0, 80.0, {
      en: 'Typological mark in the continental interior, not Moscow and not a headquarters.',
      zh: '内陆的类型学标记，不是莫斯科，也不是总部。',
    }),
    labelByFrame: {
      // qa7 / qa6 Eurasia-visible position (53.0°N, 77.5°E).
      eurasia: { geo: { dLat: -5.0, dLon: -2.5 } },
      // Further south into the Pacific left-hand belt, west of China/Japan.
      pacific: { geo: { dLat: -15.0, dLon: -1.0 } },
    },
  },
  {
    id: 'south-korea',
    onGlobe: true,
    name: { en: 'South Korea', zh: '韩国' },
    short: { en: 'ROK', zh: '韩国' },
    adjective: { en: 'ROK', zh: '韩国' },
    personnel: 450_000,
    spending: 47.8,
    aircraft: 340,
    site: typologicalSite('south-korea', 35.3, 126.7, {
      en: 'National typological comparison mark, offset from the sibling-journey interface at 36.4, 127.9. Not a campaign map and not a headquarters.',
      zh: '全国性的类型学对照标记，与平行导览接口（36.4，127.9）错开。不是战役图，也不是总部。',
    }),
    labelOffset: [-0.36, 0, 0.38],
  },
  {
    id: 'japan',
    onGlobe: true,
    name: { en: 'Japan', zh: '日本' },
    short: { en: 'Japan', zh: '日本' },
    adjective: { en: 'Japanese', zh: '日本' },
    personnel: 247_000,
    spending: 62.2,
    aircraft: 264,
    site: typologicalSite('japan', 36.5, 138.0, {
      en: 'Typological mark on central Honshu, not a headquarters, base, or capital.',
      zh: '本州中部的类型学标记，不是总部、基地或首都。',
    }),
    labelByFrame: {
      // qa6 Eurasia placement — 日本 visible between Russia and Korea.
      eurasia: { offset: [0.46, 0, 0.24] },
      // qa7 Pacific-visible position (32.0°N, 138.8°E) — do not move.
      pacific: { geo: { dLat: -4.5, dLon: 0.8 } },
    },
  },
  {
    id: 'france',
    onGlobe: true,
    name: { en: 'France', zh: '法国' },
    short: { en: 'France', zh: '法国' },
    adjective: { en: 'French', zh: '法国' },
    personnel: 204_000,
    spending: 68.0,
    aircraft: 223,
    site: typologicalSite('france', 46.5, 2.5, {
      en: 'Typological mark in central France, not a headquarters or a capital.',
      zh: '法国中部的类型学标记，不是总部或首都。',
    }),
  },
  {
    id: 'germany',
    onGlobe: false,
    name: { en: 'Germany', zh: '德国' },
    short: { en: 'Germany', zh: '德国' },
    adjective: { en: 'German', zh: '德国' },
    spending: 114,
    aircraft: 190,
  },
  {
    id: 'united-kingdom',
    onGlobe: false,
    name: { en: 'United Kingdom', zh: '英国' },
    short: { en: 'United Kingdom', zh: '英国' },
    adjective: { en: 'UK', zh: '英国' },
    spending: 89.0,
    aircraft: 141,
  },
]

export const GLOBE_COUNTRIES = COMPARISON_COUNTRIES.filter((country) => country.onGlobe)

export const COMPARISON_SITES: Record<string, JourneySite> = Object.fromEntries(
  GLOBE_COUNTRIES.map((country) => [country.id, country.site!]),
)

export const SIPRI_WORLD_SPENDING = 2_887
export const SIPRI_TOP5_SHARE = 58
export const US_TOTAL_AIRCRAFT = 13_033
export const WORLD_TOTAL_AIRCRAFT = 52_231

export function axisById(id: ComparisonAxisId): ComparisonAxis {
  return COMPARISON_AXES.find((axis) => axis.id === id) ?? COMPARISON_AXES[0]
}

export function countryById(id: string): ComparisonCountry | undefined {
  return COMPARISON_COUNTRIES.find((country) => country.id === id)
}

export function columnHeight(axis: ComparisonAxisId, value: number | undefined): number {
  if (value == null || value <= 0) return 0
  return (value / COMPARISON_MAX[axis]) * COLUMN_MAX_HEIGHT
}

export function formatPersonnel(value: number, lang: 'en' | 'zh'): string {
  if (lang === 'zh') {
    const wan = value / 10_000
    return Number.isInteger(wan) ? `${wan.toLocaleString('zh-CN')} 万` : `${wan.toLocaleString('zh-CN', { maximumFractionDigits: 1 })} 万`
  }
  return value.toLocaleString('en-US')
}

/** SIPRI current USD billions, written so $954 billion is 9,540 亿美元, never 954 亿. */
export function formatSpendingBillions(value: number, lang: 'en' | 'zh', estimated = false): string {
  const yi = value * 10
  const rounded = Number.isInteger(yi) ? yi.toLocaleString('zh-CN') : yi.toLocaleString('zh-CN', { maximumFractionDigits: 1 })
  const en = `${estimated ? '[' : ''}${formatEnBillion(value)}${estimated ? ']' : ''}`
  if (lang === 'zh') return `${estimated ? '[' : ''}${rounded}${estimated ? ']' : ''} 亿美元`
  return `$${en} billion`
}

function formatEnBillion(value: number): string {
  return Number.isInteger(value) ? value.toLocaleString('en-US') : value.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

export function formatAircraft(value: number, lang: 'en' | 'zh'): string {
  const n = value.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')
  return lang === 'zh' ? `${n} 架` : n
}
