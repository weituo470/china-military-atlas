/**
 * Present-day globe placements for the 抗美援朝 journey (1950–1953).
 * Every pin is a representative or site coordinate, never claimed as surveyed trench data.
 * Historical dates use Gregorian cursors such as 1950-10-19; do not invent civil dates with JS Date.
 */
import type { JourneyFocus, JourneySite } from '../types'

export const KOREA_WINDOW = {
  startCursor: '1950-06-25',
  trumanCursor: '1950-06-27',
  incheonCursor: '1950-09-15',
  politburoCursor: '1950-10-13',
  yaluCursor: '1950-10-19',
  firstCampaignCursor: '1950-10-25',
  chosinCursor: '1950-11-27',
  talksCursor: '1951-07-10',
  shangganlingCursor: '1952-10-14',
  armisticeCursor: '1953-07-27',
} as const

/** Peninsula held wide enough to read the Yalu, the 38th parallel, and the southern ports. */
export const PENINSULA_FOCUS: JourneyFocus = { lat: 38.15, lon: 127.15, distance: 2.58 }

/** Northeast China, the peninsula, and the Japan rear can be read together. */
export const EAST_ASIA_FOCUS: JourneyFocus = { lat: 37.4, lon: 126.8, distance: 3.42 }

export const YALU_FOCUS: JourneyFocus = { lat: 40.12, lon: 124.42, distance: 2.22 }
export const INCHEON_FOCUS: JourneyFocus = { lat: 37.46, lon: 126.62, distance: 2.16 }
export const UNSAN_FOCUS: JourneyFocus = { lat: 39.90, lon: 125.80, distance: 2.16 }
export const CHANGJIN_FOCUS: JourneyFocus = { lat: 40.37, lon: 127.25, distance: 2.16 }
export const SHANGGANLING_FOCUS: JourneyFocus = { lat: 38.32, lon: 127.47, distance: 2.12 }
export const PANMUNJOM_FOCUS: JourneyFocus = { lat: 37.956, lon: 126.677, distance: 2.12 }
export const MIG_ALLEY_FOCUS: JourneyFocus = { lat: 39.95, lon: 125.15, distance: 2.28 }
export const CHINA_REAR_FOCUS: JourneyFocus = { lat: 40.4, lon: 122.6, distance: 2.85 }
export const BEIJING_FOCUS: JourneyFocus = { lat: 39.90, lon: 116.41, distance: 2.55 }
/** Wide enough to read the peninsula and Taiwan in one frame. */
export const TAIWAN_STRAIT_FOCUS: JourneyFocus = { lat: 31.5, lon: 123.5, distance: 3.7 }
export const SANSOLI_FOCUS: JourneyFocus = { lat: 39.55, lon: 125.88, distance: 2.16 }

const representative = (id: string, lat: number, lon: number, en: string, zh: string): JourneySite => ({
  id,
  lat,
  lon,
  certainty: 'representative',
  precisionNote: { en, zh },
})

const site = (id: string, lat: number, lon: number, en: string, zh: string): JourneySite => ({
  id,
  lat,
  lon,
  certainty: 'site',
  precisionNote: { en, zh },
})

export const SITES = {
  peninsula: representative(
    'peninsula',
    38.15,
    127.15,
    'Regional anchor on the present-day Korean Peninsula — not a single battlefield.',
    '今朝鲜半岛上的地区锚点，不是某一战场的精确钉位。',
  ),
  yalu: site(
    'yalu',
    40.124,
    124.392,
    'Site / representative coordinate near the Yalu (Amnok) mouth at present-day Dandong / Sinuiju — not a surveyed crossing grid.',
    '今丹东 / 新义州一带鸭绿江口的遗址/代表性坐标，并非测绘过的渡口网格。',
  ),
  dandong: site(
    'dandong',
    40.129,
    124.383,
    'Present-day Dandong (then Andong), a representative rear and crossing anchor on the Chinese bank of the Yalu.',
    '今丹东（当时称安东），鸭绿江中国一侧的代表性后方与渡江锚点。',
  ),
  sinuiju: representative(
    'sinuiju',
    40.100,
    124.395,
    'Representative coordinate at present-day Sinuiju, on the Korean bank of the Yalu.',
    '今新义州的代表性坐标，位于鸭绿江朝鲜一侧。',
  ),
  incheon: site(
    'incheon',
    37.475,
    126.592,
    'Site / representative coordinate near Wolmido / Incheon, for the typological landing — not a ship-by-ship reconstruction.',
    '今月尾岛 / 仁川一带的遗址/代表性坐标，用于登陆示意，不是逐舰复原。',
  ),
  unsan: site(
    'unsan',
    39.90,
    125.80,
    'Site / representative coordinate near present-day Unsan, North Pyongan (云山) — not a trench survey.',
    '今平安北道云山一带的遗址/代表性坐标，并非战壕测量。',
  ),
  changjin: site(
    'changjin',
    40.37,
    127.25,
    'Site / representative coordinate at Changjin Lake / the Chosin Reservoir — not a surveyed line of march.',
    '长津湖（西方文献称 Chosin Reservoir）的遗址/代表性坐标，并非测过的进军轨迹。',
  ),
  hungnam: representative(
    'hungnam',
    39.831,
    127.621,
    'Representative coastal anchor at present-day Hungnam, used only as a typological withdrawal bearing — not a roster of the evacuation.',
    '今兴南的代表性海岸锚点，仅用作撤离方向的示意，不是撤离名册。',
  ),
  shangganling: site(
    'shangganling',
    38.32,
    127.47,
    'Site / representative coordinate for Shangganling / Triangle Hill, near present-day Kimhwa — not a reconstructed trench system.',
    '上甘岭（西方称三角山 / Triangle Hill）的遗址/代表性坐标，靠近今金化一带，不是战壕复原。',
  ),
  panmunjom: site(
    'panmunjom',
    37.956,
    126.677,
    'Site / representative coordinate at Panmunjom / the Joint Security Area — a present-day identification of the armistice site.',
    '板门店 / 共同警备区的遗址/代表性坐标，是停战签字地的今地图标识。',
  ),
  'thirty-eighth': representative(
    'thirty-eighth',
    38.0,
    127.2,
    'Typological marker on the 38th parallel. The later military demarcation line only runs near this latitude; it is not identical with it.',
    '三八线上的类型学标记。后来的军事分界线只是靠近这条纬线，并不与它重合。',
  ),
  pyongyang: representative(
    'pyongyang',
    39.039,
    125.762,
    'Regional anchor at present-day Pyongyang, not a pin for a single engagement.',
    '今平壤的地区锚点，不是某一场战斗的钉位。',
  ),
  busan: representative(
    'busan',
    35.179,
    129.075,
    'Regional anchor at present-day Busan (Pusan), used only to mark the southern end of the 1950 peninsula campaign.',
    '今釜山的地区锚点，仅用于标出一九五〇年半岛战局的南端。',
  ),
  'mig-alley': representative(
    'mig-alley',
    39.95,
    125.15,
    'Typological placement for “MiG Alley” in northwestern Korea, between the Yalu and the Chongchon — not a flight-path reconstruction.',
    '西北朝鲜“米格走廊”的类型学位置，大约在鸭绿江与清川江之间，不是航迹复原。',
  ),
  shenyang: representative(
    'shenyang',
    41.805,
    123.431,
    'Regional typological rear at present-day Shenyang, evoking the Northeast logistics base — not a named depot.',
    '今沈阳的地区性类型学后方，用以提示东北后勤基地，不是某一座仓库。',
  ),
  sasebo: representative(
    'sasebo',
    33.168,
    129.723,
    'Representative UN rear anchor near present-day Sasebo, Japan. Used only for a brief typological framing, not as a tour of Japanese bases.',
    '今日本佐世保一带的联合国军后方代表性锚点。仅作短暂的类型学交代，不是日本基地导览。',
  ),
  beijing: representative(
    'beijing',
    39.904,
    116.407,
    'Regional typological mark at present-day Beijing, for the state decision — not a reconstructed war room.',
    '今北京的地区性类型学标记，用以提示国家决策，不是作战室复原。',
  ),
  anju: representative(
    'anju',
    39.62,
    125.66,
    'Representative point near the Chongchon River / Anju, used to bound the typological logistics and MiG-Alley corridor.',
    '清川江 / 安州一带的代表性位置，用于框定后勤与米格走廊的示意范围。',
  ),
  taiwan: representative(
    'taiwan',
    24.5,
    120.0,
    'Typological anchor in the Taiwan Strait on the present-day globe — not a campaign site and not a surveyed naval station.',
    '今地图上台湾海峡的类型学锚点，不是战役遗址，也不是测过的海军驻地。',
  ),
  sansoli: representative(
    'sansoli',
    39.55,
    125.88,
    'Representative coordinate near Samso-ri / 三所里, south of the Chongchon, used only for the typological cut-off of the 113th Division — not a surveyed second pin for Longyuanli.',
    '清川江南、三所里（Samso-ri）一带的代表性坐标，仅用于第一一三师切断退路的类型学示意；龙源里在卡片中作为附近地点提及，不另设已测绘的第二钉位。',
  ),
} as const satisfies Record<string, JourneySite>

/** Flat lookup for the shared store’s openCard site fallback. */
export const SITE_INDEX: Record<string, JourneySite> = { ...SITES }

export type KoreaStaging = {
  cursor: string
  focus: JourneyFocus
  visibleSites: readonly string[]
  showEquipment: boolean
  showLogistics: boolean
  showCampaigns: boolean
  showArmistice: boolean
  showParallel: boolean
}

/**
 * One geographic cue per spoken paragraph.
 * Beat staging.focus must match paragraph 0 so setBeat does not double-fly.
 */
export const PARAGRAPH_FOCUS: readonly (readonly JourneyFocus[])[] = [
  [PENINSULA_FOCUS, YALU_FOCUS, EAST_ASIA_FOCUS],
  [TAIWAN_STRAIT_FOCUS, PENINSULA_FOCUS, BEIJING_FOCUS],
  [YALU_FOCUS, PENINSULA_FOCUS, BEIJING_FOCUS],
  [CHINA_REAR_FOCUS, YALU_FOCUS, SHANGGANLING_FOCUS],
  [YALU_FOCUS, SANSOLI_FOCUS, PENINSULA_FOCUS],
  [TAIWAN_STRAIT_FOCUS, EAST_ASIA_FOCUS, PANMUNJOM_FOCUS],
  [PANMUNJOM_FOCUS, PENINSULA_FOCUS, PANMUNJOM_FOCUS],
]

export function focusForParagraph(beatIndex: number, paragraphIndex: number): JourneyFocus {
  const cues = PARAGRAPH_FOCUS[beatIndex] ?? PARAGRAPH_FOCUS[0]
  if (paragraphIndex < 0 || paragraphIndex >= cues.length) return cues[0]
  return cues[paragraphIndex] ?? cues[0]
}

export const BEAT_STAGING = [
  {
    cursor: KOREA_WINDOW.yaluCursor,
    focus: PENINSULA_FOCUS,
    visibleSites: ['peninsula', 'yalu', 'thirty-eighth'],
    showEquipment: false,
    showLogistics: false,
    showCampaigns: false,
    showArmistice: false,
    showParallel: true,
  },
  {
    cursor: KOREA_WINDOW.trumanCursor,
    focus: TAIWAN_STRAIT_FOCUS,
    visibleSites: ['taiwan', 'incheon', 'thirty-eighth', 'yalu', 'beijing', 'peninsula'],
    showEquipment: false,
    showLogistics: false,
    showCampaigns: false,
    showArmistice: false,
    showParallel: true,
  },
  {
    cursor: KOREA_WINDOW.politburoCursor,
    focus: YALU_FOCUS,
    visibleSites: ['yalu', 'peninsula', 'beijing', 'dandong'],
    showEquipment: false,
    showLogistics: false,
    showCampaigns: false,
    showArmistice: false,
    showParallel: false,
  },
  {
    cursor: KOREA_WINDOW.firstCampaignCursor,
    focus: CHINA_REAR_FOCUS,
    visibleSites: ['shenyang', 'yalu', 'dandong', 'anju', 'shangganling'],
    showEquipment: false,
    showLogistics: true,
    showCampaigns: false,
    showArmistice: false,
    showParallel: false,
  },
  {
    cursor: KOREA_WINDOW.chosinCursor,
    focus: YALU_FOCUS,
    visibleSites: ['yalu', 'unsan', 'sansoli', 'thirty-eighth', 'peninsula'],
    showEquipment: false,
    showLogistics: false,
    showCampaigns: true,
    showArmistice: false,
    showParallel: true,
  },
  {
    cursor: KOREA_WINDOW.armisticeCursor,
    focus: TAIWAN_STRAIT_FOCUS,
    visibleSites: ['taiwan', 'sasebo', 'panmunjom', 'thirty-eighth', 'beijing'],
    showEquipment: false,
    showLogistics: false,
    showCampaigns: false,
    showArmistice: true,
    showParallel: true,
  },
  {
    cursor: KOREA_WINDOW.armisticeCursor,
    focus: PANMUNJOM_FOCUS,
    visibleSites: ['panmunjom', 'thirty-eighth', 'peninsula'],
    showEquipment: false,
    showLogistics: false,
    showCampaigns: false,
    showArmistice: true,
    showParallel: true,
  },
] as const satisfies readonly KoreaStaging[]

export const BEAT_COUNT = BEAT_STAGING.length

/** Approximate typological vertices of the later military demarcation line, west to east. */
export const ARMISTICE_LINE = [
  { lat: 37.78, lon: 126.63 },
  { lat: 37.92, lon: 126.67 },
  { lat: 38.28, lon: 127.09 },
  { lat: 38.31, lon: 128.04 },
  { lat: 38.36, lon: 128.17 },
  { lat: 38.62, lon: 128.37 },
] as const

export const PARALLEL_38 = [
  { lat: 38.0, lon: 124.85 },
  { lat: 38.0, lon: 128.65 },
] as const

export const LOGISTICS_PATH = [
  SITES.shenyang,
  SITES.dandong,
  SITES.sinuiju,
  SITES.anju,
  SITES.pyongyang,
] as const

export const MIG_ALLEY_PATH = [
  { lat: 40.20, lon: 124.55 },
  { lat: 40.05, lon: 124.90 },
  { lat: 39.85, lon: 125.20 },
  { lat: 39.62, lon: 125.66 },
] as const

export function offsetLatLon(lat: number, lon: number, eastKm: number, northKm: number) {
  const degLat = northKm / 111.32
  const degLon = eastKm / (111.32 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)))
  return { lat: lat + degLat, lon: lon + degLon }
}
