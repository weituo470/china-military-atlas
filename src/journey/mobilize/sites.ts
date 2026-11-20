/**
 * Present-day globe placements for the 灾难应对与动员能力 journey.
 * Every pin is a representative or site coordinate on the present-day globe,
 * never claimed as a surveyed trench, warehouse doorway, or building footprint.
 * Civil cursors such as 2008-05-12 use the project time model; do not invent dates with JS Date.
 */
import type { JourneyFocus, JourneySite } from '../types'

export const MOBILIZE_WINDOW = {
  floodPeakCursor: '1998-08-16',
  wenchuanCursor: '2008-05-12',
  pairingCursor: '2008-06-18',
  memInaugurationCursor: '2018-04-16',
  fireRescueFlagCursor: '2018-11-09',
  wuhanOutboundCursor: '2020-01-23',
} as const

/** Wide enough to read the whole country as a typological stage. */
export const CHINA_FOCUS: JourneyFocus = { lat: 35.2, lon: 104.8, distance: 3.92 }

/** Slightly tighter national frame used when axes or pairing should remain readable. */
export const CHINA_WORKING_FOCUS: JourneyFocus = { lat: 34.6, lon: 108.2, distance: 3.55 }

export const BEIJING_FOCUS: JourneyFocus = { lat: 39.904, lon: 116.407, distance: 2.28 }
export const NORTH_CHINA_FOCUS: JourneyFocus = { lat: 39.4, lon: 116.1, distance: 2.62 }

/** Mid-Yangtze: Three Gorges, Jingjiang, Wuhan can be read together. */
export const MID_YANGTZE_FOCUS: JourneyFocus = { lat: 30.55, lon: 113.15, distance: 2.58 }
export const JINGJIANG_FOCUS: JourneyFocus = { lat: 30.32, lon: 112.24, distance: 2.18 }
export const WUHAN_FOCUS: JourneyFocus = { lat: 30.593, lon: 114.305, distance: 2.16 }
export const THREE_GORGES_FOCUS: JourneyFocus = { lat: 30.823, lon: 111.004, distance: 2.18 }

/** Yingxiu / Wenchuan and the Chengdu approach. */
export const YINGXIU_FOCUS: JourneyFocus = { lat: 31.18, lon: 103.49, distance: 2.14 }
export const WENCHUAN_REGION_FOCUS: JourneyFocus = { lat: 31.15, lon: 103.85, distance: 2.32 }
export const CHENGDU_APPROACH_FOCUS: JourneyFocus = { lat: 30.9, lon: 104.0, distance: 2.42 }
export const SICHUAN_PAIRING_FOCUS: JourneyFocus = { lat: 32.2, lon: 108.4, distance: 3.28 }

/** Coastal / multi-site warning frame: coast and inland centers remain in view. */
export const COASTAL_NETWORK_FOCUS: JourneyFocus = { lat: 32.4, lon: 116.8, distance: 3.22 }
export const NATIONAL_NETWORK_FOCUS: JourneyFocus = { lat: 34.8, lon: 108.0, distance: 3.62 }

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
  china: representative(
    'china',
    35.2,
    104.8,
    'Regional typological anchor for China on the present-day globe — not a single disaster site.',
    '今地图上中国的地区性类型学锚点，不是某一处灾点。',
  ),
  beijing: representative(
    'beijing',
    39.904,
    116.407,
    'Regional typological mark at present-day Beijing, for national emergency institutions — not a reconstructed ministry floor plan.',
    '今北京的地区性类型学标记，用以提示国家应急体制，不是某部委办公楼的平面复原。',
  ),
  wuhan: representative(
    'wuhan',
    30.593,
    114.305,
    'Regional anchor at present-day Wuhan, used for mid-Yangtze flood defense and later medical mobilization — not a single hospital campus.',
    '今武汉的地区锚点，用于长江中游防汛与后来的医疗动员，不是某一所医院的院区界线。',
  ),
  jingzhou: site(
    'jingzhou',
    30.335,
    112.239,
    'Site / representative coordinate at present-day Jingzhou / Shashi, for the typological Jingjiang defense — not a surveyed dike chain.',
    '今荆州 / 沙市一带的遗址/代表性坐标，用于荆江防守示意，不是已测绘的堤防链。',
  ),
  gongan: representative(
    'gongan',
    30.058,
    112.229,
    'Representative typological mark for the Jingjiang flood-diversion area near present-day Gong’an County — not a household-by-household transfer map.',
    '今公安县一带荆江分洪区的类型学标记，不是逐户转移路线图。',
  ),
  'three-gorges': site(
    'three-gorges',
    30.8235,
    111.0035,
    'Site / representative coordinate at the present-day Three Gorges Dam (Sandouping). Used only for official project facts, not as a claim that the dam was already operating in 1998.',
    '今三峡大坝（三斗坪）的遗址/代表性坐标。仅用于说明官方公布的工程事实，并不表示大坝在一九九八年已经投入防洪运行。',
  ),
  yichang: representative(
    'yichang',
    30.692,
    111.286,
    'Regional typological mark at present-day Yichang, on the mid-Yangtze approach to the Jingjiang reach.',
    '今宜昌的地区性类型学标记，位于进入荆江河段之前的长江中游。',
  ),
  jiujiang: representative(
    'jiujiang',
    29.705,
    116.002,
    'Regional typological mark at present-day Jiujiang, used only to bound the mid-Yangtze defense line — not a reconstruction of the 1998 breach.',
    '今九江的地区性类型学标记，仅用于框定长江中游防线，不是一九九八年决口的复原。',
  ),
  yingxiu: site(
    'yingxiu',
    31.179,
    103.484,
    'Site / representative coordinate at present-day Yingxiu, Wenchuan County, near the widely identified 2008 meizoseismal area — not a surveyed inventory of ruined buildings.',
    '今汶川县映秀镇的遗址/代表性坐标，靠近通常所指的二〇〇八年极震区，不是损毁房屋的测绘清单。',
  ),
  wenchuan: representative(
    'wenchuan',
    31.477,
    103.590,
    'Representative coordinate at the present-day Wenchuan county seat (Weizhou). The county is larger than this pin; Yingxiu marks the more widely identified meizoseismal town.',
    '今汶川县城（威州）的代表性坐标。县域范围大于这一钉位；映秀用于标出更常被指认的极震乡镇。',
  ),
  chengdu: representative(
    'chengdu',
    30.662,
    104.063,
    'Regional typological hub at present-day Chengdu, for projection into the mountain disaster area — not a named airfield or depot.',
    '今成都的地区性类型学枢纽，用以提示向山地灾区的投送，不是某一座机场或仓库。',
  ),
  dujiangyan: site(
    'dujiangyan',
    31.013,
    103.648,
    'Site / representative coordinate at present-day Dujiangyan, on the typological road approach to Yingxiu, and later a counterpart-reconstruction county (Shanghai).',
    '今都江堰的遗址/代表性坐标，位于通往映秀的道路示意上，后来也是对口援建县（上海）。',
  ),
  beichuan: site(
    'beichuan',
    31.617,
    104.452,
    'Site / representative coordinate at the rebuilt Beichuan county seat (Yongchang) on the present-day globe. The pre-earthquake seat at Qushan is a different place; this pin is for typological reconstruction, not a survey of the old town.',
    '今北川新县城（永昌）的遗址/代表性坐标。地震前的曲山县城是另一处地点；本钉位用于重建示意，不是旧城测绘。',
  ),
  mianzhu: representative(
    'mianzhu',
    31.338,
    104.198,
    'Representative coordinate at present-day Mianzhu, a counterpart-reconstruction county (Jiangsu) — not a project-by-project map.',
    '今绵竹的代表性坐标，为对口援建县（江苏），不是逐个项目的地图。',
  ),
  shifang: representative(
    'shifang',
    31.127,
    104.167,
    'Representative coordinate at present-day Shifang, a counterpart-reconstruction county (Beijing).',
    '今什邡的代表性坐标，为对口援建县（北京）。',
  ),
  qingchuan: representative(
    'qingchuan',
    32.586,
    105.239,
    'Representative coordinate at present-day Qingchuan, a counterpart-reconstruction county (Zhejiang).',
    '今青川的代表性坐标，为对口援建县（浙江）。',
  ),
  huoshenshan: site(
    'huoshenshan',
    30.529,
    114.082,
    'Site / representative coordinate at the present-day Huoshenshan Hospital site in Caidian, Wuhan, near Zhiyin Lake — not a surveyed building footprint.',
    '今武汉蔡甸知音湖一带火神山医院旧址的遗址/代表性坐标，不是建筑物的测绘轮廓。',
  ),
  leishenshan: site(
    'leishenshan',
    30.432,
    114.288,
    'Site / representative coordinate at the present-day Leishenshan Hospital site in Jiangxia, Wuhan, near Huangjiahu — not a surveyed building footprint.',
    '今武汉江夏黄家湖一带雷神山医院旧址的遗址/代表性坐标，不是建筑物的测绘轮廓。',
  ),
  shanghai: representative(
    'shanghai',
    31.230,
    121.473,
    'Regional typological mark at present-day Shanghai, used for coastal warning and as a typological origin for medical and reconstruction support.',
    '今上海的地区性类型学标记，用于沿海预警，也作为医疗与重建支援的示意起点。',
  ),
  guangzhou: representative(
    'guangzhou',
    23.129,
    113.264,
    'Regional typological mark at present-day Guangzhou, for the southern coastal warning frame and typological support origins.',
    '今广州的地区性类型学标记，用于南方沿海预警框，以及支援出发的示意。',
  ),
  harbin: representative(
    'harbin',
    45.803,
    126.535,
    'Regional typological mark at present-day Harbin, used only to show that warning and support are national, not coastal-only.',
    '今哈尔滨的地区性类型学标记，仅用于表明预警与支援是全国性的，不只在沿海。',
  ),
  urumqi: representative(
    'urumqi',
    43.825,
    87.617,
    'Regional typological mark at present-day Ürümqi, a typological western origin for national medical projection — not a named unit.',
    '今乌鲁木齐的地区性类型学标记，作为全国医疗投送的西部示意起点，不是某一支队伍的驻地。',
  ),
  lhasa: representative(
    'lhasa',
    29.652,
    91.172,
    'Regional typological mark at present-day Lhasa, used only as a typological western origin — not a claim about a specific team roster.',
    '今拉萨的地区性类型学标记，仅作西部示意起点，不是某支队伍的名册。',
  ),
  kunming: representative(
    'kunming',
    25.038,
    102.718,
    'Regional typological mark at present-day Kunming, a typological southwestern origin.',
    '今昆明的地区性类型学标记，作为西南方向的示意起点。',
  ),
  xian: representative(
    'xian',
    34.341,
    108.940,
    'Regional typological mark at present-day Xi’an, used in the inland warning frame and as a typological support origin.',
    '今西安的地区性类型学标记，用于内陆预警框，也作为支援出发的示意。',
  ),
  shenyang: representative(
    'shenyang',
    41.805,
    123.431,
    'Regional typological mark at present-day Shenyang, a typological northeastern origin.',
    '今沈阳的地区性类型学标记，作为东北方向的示意起点。',
  ),
  lanzhou: representative(
    'lanzhou',
    36.061,
    103.834,
    'Regional typological mark at present-day Lanzhou, used in the inland warning frame.',
    '今兰州的地区性类型学标记，用于内陆预警框。',
  ),
} as const satisfies Record<string, JourneySite>

/** Flat lookup for the shared store’s openCard site fallback. */
export const SITE_INDEX: Record<string, JourneySite> = { ...SITES }

export type MobilizeStaging = {
  cursor: string
  focus: JourneyFocus
  visibleSites: readonly string[]
  showInstitutions: boolean
  showFloodLine: boolean
  showTransfer: boolean
  showReliefCorridors: boolean
  showMedicalRoutes: boolean
  showHospitals: boolean
  showWarningNet: boolean
  showPairing: boolean
  showLifelines: boolean
}

/**
 * One geographic cue per spoken paragraph.
 * Beat staging.focus must match paragraph 0 so setBeat does not double-fly.
 */
export const PARAGRAPH_FOCUS: readonly (readonly JourneyFocus[])[] = [
  [WENCHUAN_REGION_FOCUS, CHINA_WORKING_FOCUS, CHINA_FOCUS],
  [BEIJING_FOCUS, BEIJING_FOCUS, NORTH_CHINA_FOCUS],
  [MID_YANGTZE_FOCUS, JINGJIANG_FOCUS, THREE_GORGES_FOCUS],
  [YINGXIU_FOCUS, CHENGDU_APPROACH_FOCUS, SICHUAN_PAIRING_FOCUS],
  [WUHAN_FOCUS, WUHAN_FOCUS, WUHAN_FOCUS],
  [COASTAL_NETWORK_FOCUS, NATIONAL_NETWORK_FOCUS, CHINA_WORKING_FOCUS],
  [YINGXIU_FOCUS, SICHUAN_PAIRING_FOCUS, CHENGDU_APPROACH_FOCUS],
  [CHINA_FOCUS, WENCHUAN_REGION_FOCUS, CHINA_FOCUS],
]

export function focusForParagraph(beatIndex: number, paragraphIndex: number): JourneyFocus {
  const cues = PARAGRAPH_FOCUS[beatIndex] ?? PARAGRAPH_FOCUS[0]
  if (paragraphIndex < 0 || paragraphIndex >= cues.length) return cues[0]
  return cues[paragraphIndex] ?? cues[0]
}

export const BEAT_STAGING = [
  {
    cursor: MOBILIZE_WINDOW.wenchuanCursor,
    focus: WENCHUAN_REGION_FOCUS,
    visibleSites: ['china', 'beijing', 'wuhan', 'yingxiu'],
    showInstitutions: false,
    showFloodLine: false,
    showTransfer: false,
    showReliefCorridors: false,
    showMedicalRoutes: false,
    showHospitals: false,
    showWarningNet: false,
    showPairing: false,
    showLifelines: false,
  },
  {
    cursor: MOBILIZE_WINDOW.memInaugurationCursor,
    focus: BEIJING_FOCUS,
    visibleSites: ['beijing'],
    showInstitutions: true,
    showFloodLine: false,
    showTransfer: false,
    showReliefCorridors: false,
    showMedicalRoutes: false,
    showHospitals: false,
    showWarningNet: false,
    showPairing: false,
    showLifelines: false,
  },
  {
    cursor: MOBILIZE_WINDOW.floodPeakCursor,
    focus: MID_YANGTZE_FOCUS,
    visibleSites: ['wuhan', 'jingzhou', 'gongan', 'three-gorges', 'yichang', 'jiujiang'],
    showInstitutions: false,
    showFloodLine: true,
    showTransfer: true,
    showReliefCorridors: false,
    showMedicalRoutes: false,
    showHospitals: false,
    showWarningNet: false,
    showPairing: false,
    showLifelines: false,
  },
  {
    cursor: MOBILIZE_WINDOW.wenchuanCursor,
    focus: YINGXIU_FOCUS,
    visibleSites: ['yingxiu', 'wenchuan', 'chengdu', 'dujiangyan', 'beichuan'],
    showInstitutions: false,
    showFloodLine: false,
    showTransfer: false,
    showReliefCorridors: true,
    showMedicalRoutes: false,
    showHospitals: false,
    showWarningNet: false,
    showPairing: false,
    showLifelines: false,
  },
  {
    cursor: MOBILIZE_WINDOW.wuhanOutboundCursor,
    focus: WUHAN_FOCUS,
    visibleSites: ['wuhan', 'huoshenshan', 'leishenshan'],
    showInstitutions: false,
    showFloodLine: false,
    showTransfer: false,
    showReliefCorridors: false,
    showMedicalRoutes: true,
    showHospitals: true,
    showWarningNet: false,
    showPairing: false,
    showLifelines: false,
  },
  {
    cursor: MOBILIZE_WINDOW.fireRescueFlagCursor,
    focus: COASTAL_NETWORK_FOCUS,
    visibleSites: ['beijing', 'shanghai', 'guangzhou', 'chengdu', 'xian', 'lanzhou', 'harbin'],
    showInstitutions: false,
    showFloodLine: false,
    showTransfer: false,
    showReliefCorridors: false,
    showMedicalRoutes: false,
    showHospitals: false,
    showWarningNet: true,
    showPairing: false,
    showLifelines: false,
  },
  {
    cursor: MOBILIZE_WINDOW.pairingCursor,
    focus: YINGXIU_FOCUS,
    visibleSites: ['yingxiu', 'wenchuan', 'chengdu', 'dujiangyan', 'beichuan', 'mianzhu', 'shifang', 'qingchuan'],
    showInstitutions: false,
    showFloodLine: false,
    showTransfer: false,
    showReliefCorridors: false,
    showMedicalRoutes: false,
    showHospitals: false,
    showWarningNet: false,
    showPairing: true,
    showLifelines: true,
  },
  {
    cursor: MOBILIZE_WINDOW.memInaugurationCursor,
    focus: CHINA_FOCUS,
    visibleSites: ['china', 'beijing', 'wuhan', 'yingxiu'],
    showInstitutions: false,
    showFloodLine: false,
    showTransfer: false,
    showReliefCorridors: false,
    showMedicalRoutes: false,
    showHospitals: false,
    showWarningNet: false,
    showPairing: false,
    showLifelines: false,
  },
] as const satisfies readonly MobilizeStaging[]

export const BEAT_COUNT = BEAT_STAGING.length

/** Typological mid-Yangtze defense line, west to east. Not a surveyed dike. */
export const YANGTZE_DEFENSE_LINE = [
  { lat: 30.8235, lon: 111.0035 },
  { lat: 30.692, lon: 111.286 },
  { lat: 30.426, lon: 111.761 },
  { lat: 30.335, lon: 112.239 },
  { lat: 29.820, lon: 112.900 },
  { lat: 30.200, lon: 113.700 },
  { lat: 30.593, lon: 114.305 },
  { lat: 30.200, lon: 115.100 },
  { lat: 29.705, lon: 116.002 },
] as const

export const JINGJIANG_TRANSFER = {
  from: { lat: 30.058, lon: 112.229 },
  to: { lat: 30.280, lon: 112.480 },
} as const

export const RELIEF_CORRIDORS = [
  { from: 'chengdu', to: 'dujiangyan' },
  { from: 'dujiangyan', to: 'yingxiu' },
  { from: 'chengdu', to: 'beichuan' },
  { from: 'beijing', to: 'chengdu' },
] as const

export const LIFELINE_CORRIDORS = [
  { from: 'chengdu', to: 'dujiangyan' },
  { from: 'dujiangyan', to: 'yingxiu' },
  { from: 'chengdu', to: 'beichuan' },
] as const

/** Typological origins for medical-team projection into Wuhan. Not a roster of the 346 teams. */
export const MEDICAL_ORIGINS = [
  'beijing',
  'shanghai',
  'guangzhou',
  'shenyang',
  'harbin',
  'chengdu',
  'xian',
  'kunming',
  'urumqi',
  'lhasa',
] as const

/**
 * Official pairing in the State Council General Office notice of 18 June 2008.
 * Origins are typological provincial capitals (Shenzhen for the Gansu task led mainly by Shenzhen).
 * Destinations are representative present-day coordinates of the named counties, or typological
 * hard-hit marks in Gansu and Shaanxi. All arcs are schematic.
 */
export const PAIRING_LINKS = [
  { from: { lat: 36.651, lon: 117.120, id: 'jinan' }, to: 'beichuan', fromName: { en: 'Shandong', zh: '山东' }, toName: { en: 'Beichuan', zh: '北川' } },
  { from: { lat: 23.129, lon: 113.264, id: 'guangzhou-pair' }, to: 'wenchuan', fromName: { en: 'Guangdong', zh: '广东' }, toName: { en: 'Wenchuan', zh: '汶川' } },
  { from: { lat: 30.274, lon: 120.155, id: 'hangzhou' }, to: 'qingchuan', fromName: { en: 'Zhejiang', zh: '浙江' }, toName: { en: 'Qingchuan', zh: '青川' } },
  { from: { lat: 32.061, lon: 118.778, id: 'nanjing' }, to: 'mianzhu', fromName: { en: 'Jiangsu', zh: '江苏' }, toName: { en: 'Mianzhu', zh: '绵竹' } },
  { from: { lat: 39.904, lon: 116.407, id: 'beijing-pair' }, to: 'shifang', fromName: { en: 'Beijing', zh: '北京' }, toName: { en: 'Shifang', zh: '什邡' } },
  { from: { lat: 31.230, lon: 121.473, id: 'shanghai-pair' }, to: 'dujiangyan', fromName: { en: 'Shanghai', zh: '上海' }, toName: { en: 'Dujiangyan', zh: '都江堰' } },
  { from: { lat: 38.042, lon: 114.514, id: 'shijiazhuang' }, to: { lat: 32.410, lon: 104.529, id: 'pingwu' }, fromName: { en: 'Hebei', zh: '河北' }, toName: { en: 'Pingwu', zh: '平武' } },
  { from: { lat: 41.805, lon: 123.431, id: 'shenyang-pair' }, to: { lat: 31.535, lon: 104.567, id: 'anxian' }, fromName: { en: 'Liaoning', zh: '辽宁' }, toName: { en: 'Anxian', zh: '安县' } },
  { from: { lat: 34.747, lon: 113.625, id: 'zhengzhou' }, to: { lat: 31.778, lon: 104.745, id: 'jiangyou' }, fromName: { en: 'Henan', zh: '河南' }, toName: { en: 'Jiangyou', zh: '江油' } },
  { from: { lat: 26.074, lon: 119.296, id: 'fuzhou' }, to: { lat: 30.990, lon: 103.958, id: 'pengzhou' }, fromName: { en: 'Fujian', zh: '福建' }, toName: { en: 'Pengzhou', zh: '彭州' } },
  { from: { lat: 37.870, lon: 112.549, id: 'taiyuan' }, to: { lat: 31.682, lon: 103.853, id: 'maoxian' }, fromName: { en: 'Shanxi', zh: '山西' }, toName: { en: 'Maoxian', zh: '茂县' } },
  { from: { lat: 28.228, lon: 112.939, id: 'changsha' }, to: { lat: 31.436, lon: 103.165, id: 'lixian' }, fromName: { en: 'Hunan', zh: '湖南' }, toName: { en: 'Lixian', zh: '理县' } },
  { from: { lat: 43.817, lon: 125.324, id: 'changchun' }, to: { lat: 32.060, lon: 102.984, id: 'heishui' }, fromName: { en: 'Jilin', zh: '吉林' }, toName: { en: 'Heishui', zh: '黑水' } },
  { from: { lat: 31.821, lon: 117.227, id: 'hefei' }, to: { lat: 32.651, lon: 103.599, id: 'songpan' }, fromName: { en: 'Anhui', zh: '安徽' }, toName: { en: 'Songpan', zh: '松潘' } },
  { from: { lat: 28.683, lon: 115.858, id: 'nanchang' }, to: { lat: 30.999, lon: 102.364, id: 'xiaojin' }, fromName: { en: 'Jiangxi', zh: '江西' }, toName: { en: 'Xiaojin', zh: '小金' } },
  { from: { lat: 30.593, lon: 114.305, id: 'wuhan-pair' }, to: { lat: 29.348, lon: 102.645, id: 'hanyuan' }, fromName: { en: 'Hubei', zh: '湖北' }, toName: { en: 'Hanyuan', zh: '汉源' } },
  { from: { lat: 29.563, lon: 106.551, id: 'chongqing' }, to: { lat: 30.630, lon: 103.673, id: 'chongzhou' }, fromName: { en: 'Chongqing', zh: '重庆' }, toName: { en: 'Chongzhou', zh: '崇州' } },
  { from: { lat: 45.803, lon: 126.535, id: 'harbin-pair' }, to: { lat: 32.286, lon: 105.525, id: 'jiange' }, fromName: { en: 'Heilongjiang', zh: '黑龙江' }, toName: { en: 'Jiange', zh: '剑阁' } },
  { from: { lat: 22.543, lon: 114.058, id: 'shenzhen' }, to: { lat: 33.401, lon: 104.922, id: 'longnan' }, fromName: { en: 'Guangdong (mainly Shenzhen)', zh: '广东（主要由深圳）' }, toName: { en: 'hard-hit areas of Gansu', zh: '甘肃受灾严重地区' } },
  { from: { lat: 39.084, lon: 117.201, id: 'tianjin' }, to: { lat: 32.829, lon: 106.257, id: 'ningqiang' }, fromName: { en: 'Tianjin', zh: '天津' }, toName: { en: 'hard-hit areas of Shaanxi', zh: '陕西受灾严重地区' } },
] as const

export const WARNING_NET = [
  'beijing',
  'shanghai',
  'guangzhou',
  'chengdu',
  'xian',
  'lanzhou',
  'harbin',
] as const

export function offsetLatLon(lat: number, lon: number, eastKm: number, northKm: number) {
  const degLat = northKm / 111.32
  const degLon = eastKm / (111.32 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)))
  return { lat: lat + degLat, lon: lon + degLon }
}

export function resolvePoint(ref: string | { lat: number; lon: number }): { lat: number; lon: number } {
  if (typeof ref === 'string') {
    const found = SITES[ref as keyof typeof SITES]
    return { lat: found.lat, lon: found.lon }
  }
  return { lat: ref.lat, lon: ref.lon }
}
