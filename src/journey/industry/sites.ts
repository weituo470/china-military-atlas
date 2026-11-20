/**
 * Regional or city-level placements for the industry-chassis journey.
 * Plants, yards, railways, grids, and linking lights are typological.
 * They do not map real facilities or real supply relationships.
 */
import type { JourneyFocus, JourneySite } from '../types'

export const WINDOW = {
  present: '2026-07-01',
  warringStates: '-0250-01-01',
  jiangnan: '1865-06-01',
  jiawu: '1894-09-01',
  koreaWar: '1951-06-01',
  mao1954: '1954-06-14',
  firstPlan: '1955-01-01',
  thirdFront: '1964-08-01',
} as const

function site(
  id: string,
  lat: number,
  lon: number,
  certainty: JourneySite['certainty'],
  zh: string,
  en: string,
): JourneySite {
  return { id, lat, lon, certainty, precisionNote: { en, zh } }
}

export const SITES: Record<string, JourneySite> = {
  westPacific: site('westPacific', 28.0, 138.0, 'regional', '西太平洋与东亚同框的远景，不是某一处海域。', 'A wide western-Pacific framing with East Asia in view — not a named sea or base.'),
  eastAsia: site('eastAsia', 33.0, 122.0, 'regional', '东亚海陆同框，区域级。', 'East Asia, land and sea in one frame, regional.'),
  eastAsiaNight: site('eastAsiaNight', 35.0, 108.0, 'regional', '由海面转向大陆腹地的区域中心，不是某一城市。', 'A regional turn from the sea toward the continental interior — not a city.'),
  guanzhong: site('guanzhong', 34.35, 108.85, 'regional', '关中平原一带，战国秦地的区域级标注，不是都城门牌。', 'The Guanzhong plain, a regional mark for the Qin heartland — not a capital street.'),
  eurasiaWest: site('eurasiaWest', 41.0, 12.5, 'regional', '欧亚大陆西端沿海的区域级转场，不是某一港口。', 'A typological turn at the western end of Eurasia — not a named port.'),
  shanghai: site('shanghai', 31.23, 121.47, 'representative', '上海，江南制造总局所在城市的公开历史遗址标注，不是厂区范围。', 'Shanghai, a public historical-site city mark for the Jiangnan Arsenal — not a plant outline.'),
  mawei: site('mawei', 26.05, 119.46, 'representative', '福州马尾，福州船政所在地的公开历史遗址标注，不是船厂范围。', 'Mawei, Fuzhou, a public historical-site mark for the Fuzhou Navy Yard — not a yard outline.'),
  shanghaiMawei: site('shanghaiMawei', 28.7, 120.5, 'regional', '长江口与闽江口同框，城市级标注上海与马尾。', 'The Yangtze mouth and the Min River mouth in one frame, with city-level marks for Shanghai and Mawei.'),
  yellowSea: site('yellowSea', 37.6, 123.2, 'regional', '黄海、渤海一带的海域全景，不演示战场，不画航迹。', 'A wide view of the Yellow Sea and Bohai — no battlefield, no tracks.'),
  northeastKorea: site('northeastKorea', 41.2, 126.4, 'regional', '东北南部到朝鲜半岛北部的区域级，不标具体线路。', 'From southern Northeast China to the northern Korean Peninsula, regional — no specific route.'),
  northeast: site('northeast', 42.4, 126.0, 'regional', '东北老工业基地，区域级。', 'The Northeast industrial base, regional.'),
  coastalCities: site('coastalCities', 32.4, 120.2, 'regional', '沿海几座大城市一带，区域级，不标厂址。', 'A few large coastal cities, regional — no plant sites.'),
  national: site('national', 35.2, 111.8, 'regional', '全国版图的地区中心，不是首都。', 'A regional center for a national framing — not the capital.'),
  inland: site('inland', 33.4, 104.8, 'regional', '由沿海向西南、西北腹地缓转的区域中心。', 'A regional center for a turn from the coast toward the southwest and northwest hinterland.'),
  southwestNorthwest: site('southwestNorthwest', 32.2, 103.2, 'regional', '西南山地与西北腹地，区域级，不标厂址。', 'Southwest mountains and the northwest hinterland, regional — no plant sites.'),
  yangtzeBelt: site('yangtzeBelt', 31.4, 118.6, 'regional', '长江中下游造船与制造业地带，区域级。', 'The mid- and lower-Yangtze shipbuilding and manufacturing belt, regional.'),
  shipbands: site('shipbands', 30.6, 119.4, 'regional', '环渤海、长三角、珠三角造船带的地带级晕染，不是船厂。', 'Typological washes for the Bohai-rim, Yangtze-delta, and Pearl-delta shipbuilding belts — not yards.'),
  pacificMid: site('pacificMid', 18.0, 168.0, 'regional', '太平洋洋面中央，不指向任何基地。', 'Mid-Pacific open water, pointing at no base.'),
  rails: site('rails', 34.2, 114.0, 'regional', '沿海航线与内陆铁路干线的抽象示意框，不是真实路网。', 'An abstract frame for coastal routes and inland trunk railways — not a real network.'),
  hinterlandCoast: site('hinterlandCoast', 33.2, 116.0, 'regional', '腹地与沿海同框，区域级。', 'Hinterland and coast in one frame, regional.'),
  globe: site('globe', 20.0, 110.0, 'regional', '全球远景。', 'A global wide view.'),
  entries: site('entries', 32.0, 115.0, 'regional', '四条既有导览线入口的区域级同框。', 'A regional frame for the four existing journey entries.'),
  forceEntry: site('forceEntry', 34.35, 108.85, 'regional', '战国线入口，沿用关中区域级位置。', 'Entry for the Warring States line, using the Guanzhong regional mark.'),
  koreaEntry: site('koreaEntry', 38.4, 127.0, 'regional', '抗美援朝线入口，朝鲜半岛中部区域级。', 'Entry for the Korea line, a regional mark on the peninsula.'),
  mobilizeEntry: site('mobilizeEntry', 30.6, 114.3, 'regional', '灾难动员线入口，长江中游区域级。', 'Entry for the mobilization line, a mid-Yangtze regional mark.'),
  baselineEntry: site('baselineEntry', 22.0, 132.0, 'regional', '2026 军力基线入口，西太平洋远景。', 'Entry for the 2026 baseline, a western-Pacific wide view.'),
}

const F = {
  westPacific: { lat: 28.0, lon: 138.0, distance: 5.55 },
  eastAsiaWide: { lat: 33.0, lon: 122.0, distance: 4.15 },
  eastAsia: { lat: 33.0, lon: 120.0, distance: 3.55 },
  interior: { lat: 35.0, lon: 108.0, distance: 3.15 },
  guanzhong: { lat: 34.35, lon: 108.85, distance: 2.48 },
  eurasiaWest: { lat: 41.0, lon: 12.5, distance: 5.2 },
  shanghaiMawei: { lat: 28.7, lon: 120.5, distance: 2.72 },
  yellowSea: { lat: 37.6, lon: 123.2, distance: 2.95 },
  eastAsiaSlow: { lat: 35.0, lon: 122.0, distance: 3.85 },
  northeastKorea: { lat: 41.2, lon: 126.4, distance: 2.58 },
  northeast: { lat: 42.4, lon: 126.0, distance: 2.52 },
  coastalCities: { lat: 32.4, lon: 120.2, distance: 3.05 },
  national: { lat: 35.2, lon: 111.8, distance: 3.22 },
  inland: { lat: 33.4, lon: 104.8, distance: 3.28 },
  southwestNorthwest: { lat: 32.2, lon: 103.2, distance: 2.85 },
  yangtzeBelt: { lat: 31.4, lon: 118.6, distance: 2.62 },
  shipbands: { lat: 30.6, lon: 119.4, distance: 3.18 },
  pacificMid: { lat: 18.0, lon: 168.0, distance: 5.85 },
  rails: { lat: 34.2, lon: 114.0, distance: 3.12 },
  hinterlandCoast: { lat: 33.2, lon: 116.0, distance: 3.28 },
  globe: { lat: 20.0, lon: 110.0, distance: 5.95 },
  entries: { lat: 32.0, lon: 115.0, distance: 4.35 },
} as const satisfies Record<string, JourneyFocus>

/**
 * One geographic cue per spoken paragraph.
 * Beat staging.focus must match paragraph 0 so setBeat does not double-fly.
 */
export const PARAGRAPH_FOCUS: readonly (readonly JourneyFocus[])[] = [
  [F.westPacific, F.eastAsia, F.interior, F.interior],
  [F.guanzhong, F.eurasiaWest, F.shanghaiMawei, F.yellowSea],
  [F.eastAsiaSlow, F.northeastKorea, F.northeast, F.northeast],
  [F.northeast, F.inland, F.southwestNorthwest, F.national],
  [F.yangtzeBelt, F.yangtzeBelt, F.national, F.national],
  [F.shipbands, F.pacificMid, F.national, F.national],
  [F.rails, F.rails, F.national, F.hinterlandCoast, F.hinterlandCoast],
  [F.globe, F.globe, F.globe, F.entries, F.entries],
]

export const BEAT_CURSORS = [
  WINDOW.present,
  WINDOW.warringStates,
  WINDOW.koreaWar,
  WINDOW.firstPlan,
  WINDOW.present,
  WINDOW.present,
  WINDOW.present,
  WINDOW.present,
] as const

export const PARAGRAPH_CURSORS: readonly (readonly string[])[] = [
  [WINDOW.present, WINDOW.present, WINDOW.present, WINDOW.present],
  [WINDOW.warringStates, WINDOW.jiangnan, WINDOW.jiangnan, WINDOW.jiawu],
  [WINDOW.koreaWar, WINDOW.koreaWar, WINDOW.mao1954, WINDOW.mao1954],
  [WINDOW.firstPlan, WINDOW.thirdFront, WINDOW.thirdFront, WINDOW.thirdFront],
  [WINDOW.present, WINDOW.present, WINDOW.present, WINDOW.present],
  [WINDOW.present, WINDOW.present, WINDOW.present, WINDOW.present],
  [WINDOW.present, WINDOW.present, WINDOW.present, WINDOW.present, WINDOW.present],
  [WINDOW.present, WINDOW.present, WINDOW.present, WINDOW.present, WINDOW.present],
]

export function focusForParagraph(beatIndex: number, paragraphIndex: number): JourneyFocus {
  const cues = PARAGRAPH_FOCUS[beatIndex] ?? PARAGRAPH_FOCUS[0]
  if (paragraphIndex < 0 || paragraphIndex >= cues.length) return cues[0]
  return cues[paragraphIndex] ?? cues[0]
}

export function cursorForParagraph(beatIndex: number, paragraphIndex: number): string {
  const row = PARAGRAPH_CURSORS[beatIndex] ?? PARAGRAPH_CURSORS[0]
  return row[Math.min(Math.max(0, paragraphIndex), row.length - 1)] ?? BEAT_CURSORS[beatIndex] ?? WINDOW.present
}

export type IndustryStaging = {
  cursor: string
  focus: JourneyFocus
}

export const BEAT_STAGING: readonly IndustryStaging[] = BEAT_CURSORS.map((cursor, index) => ({
  cursor,
  focus: PARAGRAPH_FOCUS[index][0],
}))

export const BEAT_COUNT = BEAT_STAGING.length

export const SITE_INDEX: Record<string, JourneySite> = { ...SITES }

if (PARAGRAPH_FOCUS.length !== BEAT_STAGING.length) {
  throw new Error(`industry paragraph-focus/staging length mismatch: ${PARAGRAPH_FOCUS.length} vs ${BEAT_STAGING.length}`)
}
