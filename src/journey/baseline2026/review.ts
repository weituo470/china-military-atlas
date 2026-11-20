/**
 * Typological mid-Pacific fleet review for the 2026 baseline journey.
 *
 * This is a ceremonial parade ground on open water, not a deployment map,
 * not a force plot, and not a track. Coordinates are typological.
 * Aviation ships with a locked official 1:1 count are shown at that
 * count. Broader hull totals use a single field-wide scale unit
 * (1 mark ≈ 10 ships, rounded; exact figures stay on badges and on the
 * paper). Definitions differ and are not stacked as like-for-like
 * inventories. Schematic columns (ROK, Russian Pacific Fleet) are not
 * on that scale — no invented totals. The mid-Pacific centroid stays
 * 13.5°N, 178.5°E. Columns are grouped west/east as a visual “China
 * camp” / “non-Western frame” by national affiliation, not as an alliance.
 */
import { EARTH_RADIUS } from '../../utils/geo'
import type { JourneyFocus, JourneySite, Localized } from '../types'
import type { CarrierId } from './film/ships'
import type { BaselineLocale } from './locale'
import type { AtlasId } from './atlas/catalog'

/** Ceremonial heading, degrees clockwise from north — all columns stand the same way. */
export const REVIEW_HEADING_DEG = 45

/**
 * Open-ocean typological parade-ground centroid, mid-Pacific near the date
 * line, well away from named ports and bases (Qingdao, Yokosuka, Pearl Harbor,
 * San Diego, Guam, Busan, Vladivostok, Sydney, Wake, Johnston, Midway).
 */
export const REVIEW_GROUND = { lat: 13.5, lon: 178.5 } as const

const PRECISION: Localized = {
  en: 'Typological review-ground placement on open Pacific water — not a real station, berth, or track, and not a claim that this navy is deployed here.',
  zh: '太平洋开阔水面上的类型学阅舰场位置，不是真实驻地、泊位或航迹，也不表示该海军部署于此。',
}

export type ReviewSourceKind = 'official' | 'estimate' | 'schematic'

export type ReviewNavyId =
  | 'review-plan'
  | 'review-rok'
  | 'review-japan'
  | 'review-russia'
  | 'review-australia'
  | 'review-us'

export type ReviewShipKind =
  | 'carrier-stobar'
  | 'carrier-flat'
  | 'carrier-cvn'
  | 'large-deck-escort'
  | 'destroyer-055'
  | 'amphib-lhd'
  | 'amphib-lpd'
  | 'escort'
  | 'scale-unit'
  | 'scale-sub'

export type ReviewShip = {
  kind: ReviewShipKind
  modelId?: AtlasId
  carrierId?: CarrierId
  lat: number
  lon: number
}

export type ReviewNavy = {
  id: ReviewNavyId
  short: Localized
  /** Origin of the typological column (label / badge anchor). */
  lat: number
  lon: number
  tint: { hull: string; island: string }
  /** Locked 1:1 typological aviation / large-deck marks, if any. */
  capital: ReviewShipKind | null
  capitalCount: number
  /** Visual camp by national affiliation — not a formal alliance. */
  camp: 'china' | 'other'
  /**
   * Rounded scale-unit marks for a published (or estimated) total.
   * 0 means this navy is not on the scale (schematic only).
   */
  scaleMarks: number
  /** Optional typological sub-tokens on the same 1≈10 unit, for a published sub total. */
  scaleSubMarks: number
  /** Short typological schematic cluster, not a count (ROK / Russia). */
  schematicCount: number
  badge: Localized
  badgeKind: ReviewSourceKind
  spokenIn: ReadonlySet<number>
}

function wrapLon(lon: number) {
  let value = lon
  while (value > 180) value -= 360
  while (value < -180) value += 360
  return value
}

function offsetLatLon(lat: number, lon: number, headingDeg: number, alongDeg: number, acrossDeg: number) {
  const heading = (headingDeg * Math.PI) / 180
  const starboard = heading + Math.PI / 2
  const dLat = alongDeg * Math.cos(heading) + acrossDeg * Math.cos(starboard)
  const dLon = (alongDeg * Math.sin(heading) + acrossDeg * Math.sin(starboard)) / Math.cos((lat * Math.PI) / 180)
  return { lat: lat + dLat, lon: wrapLon(lon + dLon) }
}

/**
 * Two visual camps about the mid-Pacific centroid (13.5°N, 178.5°E),
 * which also carries the typological divider. West is the PLAN
 * (Western frame). East is the other navies in this review (non-China
 * camp). The open-water gap and the divider are typological grouping
 * by national affiliation — not a formal alliance, coalition, or
 * deployment. Intra-camp origins were opened so the two sides do not
 * read as one even line; the centroid itself does not move.
 */
const ORIGINS: Record<ReviewNavyId, { lat: number; lon: number }> = {
  'review-plan': { lat: 13.5, lon: 173.8 },
  'review-japan': { lat: 13.7, lon: 181.8 },
  'review-rok': { lat: 13.05, lon: 183.5 },
  'review-australia': { lat: 12.25, lon: 184.8 },
  'review-russia': { lat: 14.85, lon: 183.9 },
  'review-us': { lat: 13.45, lon: 186.4 },
}

/** One typological scale mark stands for about ten hulls, rounded. */
export const REVIEW_SCALE_UNIT = 10

export function scaleMarksFor(count: number) {
  return Math.max(1, Math.round(count / REVIEW_SCALE_UNIT))
}

export type ReviewCampId = 'china' | 'other'

export const REVIEW_CAMPS: Record<ReviewCampId, {
  short: Localized
  note: Localized
  label: { lat: number; lon: number }
}> = {
  china: {
    short: { zh: '西侧取景', en: 'Western frame' },
    note: { zh: '示意分组，不是联盟', en: 'Visual grouping, not an alliance' },
    label: { lat: 12.15, lon: 172.4 },
  },
  other: {
    short: { zh: '东侧取景', en: 'Eastern frame' },
    note: { zh: '示意分组，不是联盟或联军', en: 'Visual grouping, not a formal coalition' },
    label: { lat: 12.15, lon: 185.6 },
  },
}

/** North–south typological divider through the mid-Pacific centroid. */
export function reviewDividerPoints() {
  const lon = REVIEW_GROUND.lon
  return [
    { lat: 10.4, lon },
    { lat: 12.0, lon },
    { lat: 13.5, lon },
    { lat: 15.0, lon },
    { lat: 16.6, lon },
  ]
}

export const REVIEW_NAVIES: readonly ReviewNavy[] = [
  {
    id: 'review-plan',
    short: { zh: '中国 · 人民海军', en: 'China · PLAN' },
    ...ORIGINS['review-plan'],
    tint: { hull: '#d8d0c4', island: '#8a7a68' },
    capital: 'carrier-stobar',
    capitalCount: 3,
    camp: 'china',
    scaleMarks: scaleMarksFor(370),
    scaleSubMarks: 0,
    schematicCount: 0,
    badge: { zh: '航母 3 · 官方公布  /  2024 美方估计 370+ 艘舰艇与潜艇 · 37 标示下限量级', en: '3 carriers · official  /  2024 US estimate: 370+ ships and submarines · 37 marks, lower bound' },
    badgeKind: 'estimate',
    spokenIn: new Set([0, 1, 2]),
  },
  {
    id: 'review-rok',
    short: { zh: '韩国海军', en: 'ROK Navy' },
    ...ORIGINS['review-rok'],
    tint: { hull: '#c9d4dc', island: '#6e8290' },
    capital: null,
    capitalCount: 0,
    camp: 'other',
    scaleMarks: 0,
    scaleSubMarks: 0,
    schematicCount: 3,
    badge: { zh: '示意编队，总数留白', en: 'Schematic column, total left blank' },
    badgeKind: 'schematic',
    spokenIn: new Set([0, 3]),
  },
  {
    id: 'review-japan',
    short: { zh: '日本 · 海上自卫队', en: 'Japan · JMSDF' },
    ...ORIGINS['review-japan'],
    tint: { hull: '#d8dde2', island: '#7a868f' },
    capital: 'large-deck-escort',
    capitalCount: 2,
    camp: 'other',
    scaleMarks: scaleMarksFor(51),
    scaleSubMarks: scaleMarksFor(22),
    schematicCount: 0,
    badge: { zh: '2025-03 护卫舰 51 · 潜艇 22 · 官方公布 · 5+2标', en: 'Mar 2025: 51 escorts · 22 subs · official · 5+2 marks' },
    badgeKind: 'official',
    spokenIn: new Set([0, 3]),
  },
  {
    id: 'review-russia',
    short: { zh: '俄罗斯太平洋舰队', en: 'Russian Pacific Fleet' },
    ...ORIGINS['review-russia'],
    tint: { hull: '#c5cdd4', island: '#667480' },
    capital: null,
    capitalCount: 0,
    camp: 'other',
    scaleMarks: 0,
    scaleSubMarks: 0,
    schematicCount: 3,
    badge: { zh: '示意编队，总数留白', en: 'Schematic column, total left blank' },
    badgeKind: 'schematic',
    spokenIn: new Set([0, 3]),
  },
  {
    id: 'review-australia',
    short: { zh: '澳大利亚海军', en: 'Royal Australian Navy' },
    ...ORIGINS['review-australia'],
    tint: { hull: '#d4d0c6', island: '#7a7468' },
    capital: null,
    capitalCount: 0,
    camp: 'other',
    scaleMarks: scaleMarksFor(16),
    scaleSubMarks: 0,
    schematicCount: 0,
    badge: { zh: '2024–25 主要作战舰艇 16 · 官方公布 · 2标', en: '2024–25: 16 major combatants · official · 2 marks' },
    badgeKind: 'official',
    spokenIn: new Set([0, 3]),
  },
  {
    id: 'review-us',
    short: { zh: '美国海军', en: 'US Navy' },
    ...ORIGINS['review-us'],
    tint: { hull: '#d4dbe0', island: '#6e7c88' },
    capital: 'carrier-cvn',
    capitalCount: 11,
    camp: 'other',
    scaleMarks: scaleMarksFor(293),
    scaleSubMarks: 0,
    schematicCount: 0,
    badge: { zh: '航母 11 · 官方公布  /  2025-10 战斗舰艇 293 艘 · 官方 · 29 标', en: '11 CVNs · official  /  Oct 2025: 293 battle force ships · official · 29 marks' },
    badgeKind: 'official',
    spokenIn: new Set([0, 1, 2]),
  },
]

/**
 * Local typological spacing, in degrees, kept compact so the 11 US carriers
 * remain a ceremonial block rather than a world-wrapping line.
 * Along = toward heading (northeast); across = starboard.
 */
/**
 * Intra-column spacing, in degrees. Opened slightly from the older mid-overhead
 * values (0.52 / 0.70 / 0.36 / 0.42 / 0.95) so typological capitals do not
 * interpenetrate when seen from a close sea-level 3/4 view. The 11 US CVNs
 * remain a compact 4-4-3 ceremonial block. ORIGINS, column order,
 * COLUMN_SPACING (2.8°), and the mid-Pacific centroid are unchanged.
 */
const CAPITAL_ALONG = 1.40
const CAPITAL_ACROSS = 0.95
const ESCORT_ACROSS = 0.50
const SCALE_ALONG = 0.28
const SCALE_ACROSS = 0.30
const CAPITAL_TO_SCALE = 0.55

function capitalLayout(count: number): { along: number; across: number }[] {
  if (count <= 0) return []
  if (count === 2) {
    return [
      { along: 0, across: -0.5 * CAPITAL_ACROSS },
      { along: 0, across: 0.5 * CAPITAL_ACROSS },
    ]
  }
  if (count === 3) {
    return [
      { along: 0, across: -CAPITAL_ACROSS },
      { along: 0, across: 0 },
      { along: 0, across: CAPITAL_ACROSS },
    ]
  }
  // 11 CVNs: three ranks (4, 4, 3) so the block stays compact.
  const ranks = [4, 4, 3]
  const slots: { along: number; across: number }[] = []
  ranks.forEach((width, rank) => {
    const across0 = -((width - 1) / 2) * CAPITAL_ACROSS
    for (let i = 0; i < width; i += 1) {
      slots.push({ along: -rank * CAPITAL_ALONG, across: across0 + i * CAPITAL_ACROSS })
    }
  })
  return slots
}

function schematicLayout(count: number, startAlong: number): { along: number; across: number }[] {
  const slots: { along: number; across: number }[] = []
  const across0 = -((count - 1) / 2) * ESCORT_ACROSS
  for (let i = 0; i < count; i += 1) {
    slots.push({ along: startAlong, across: across0 + i * ESCORT_ACROSS })
  }
  return slots
}

/** Compact ceremonial grid for typological scale-unit marks. */
function scaleGrid(count: number, columns: number, startAlong: number, startAcross: number): { along: number; across: number }[] {
  const slots: { along: number; across: number }[] = []
  for (let i = 0; i < count; i += 1) {
    const row = Math.floor(i / columns)
    const col = i % columns
    slots.push({
      along: startAlong - row * SCALE_ALONG,
      across: startAcross + col * SCALE_ACROSS,
    })
  }
  return slots
}

/**
 * PLAN ceremonial highlight, typological rather than an inventory:
 * three official carriers (Liaoning / Shandong ski-jump, Fujian flat deck)
 * in the front rank, then typological Type 055 destroyers and Type 075 / 071
 * amphibious silhouettes. 055 and amphibious marks are 示意, not a 1:1
 * hull count. The 370+ magnitude lives in a separate scale-unit field.
 */
function planHighlightSlots(): { kind: ReviewShipKind; carrierId?: CarrierId; along: number; across: number }[] {
  return [
    { kind: 'carrier-stobar', carrierId: 'liaoning', along: 0, across: -CAPITAL_ACROSS },
    { kind: 'carrier-stobar', carrierId: 'shandong', along: 0, across: 0 },
    { kind: 'carrier-flat', carrierId: 'fujian', along: 0, across: CAPITAL_ACROSS },
    { kind: 'destroyer-055', along: -CAPITAL_ALONG, across: -0.55 * CAPITAL_ACROSS },
    { kind: 'destroyer-055', along: -CAPITAL_ALONG, across: 0.55 * CAPITAL_ACROSS },
    { kind: 'amphib-lhd', along: -2 * CAPITAL_ALONG, across: -0.55 * CAPITAL_ACROSS },
    { kind: 'amphib-lpd', along: -2 * CAPITAL_ALONG, across: 0.55 * CAPITAL_ACROSS },
  ]
}

function typologicalRearAlong(navy: ReviewNavy) {
  if (navy.id === 'review-plan') return -2 * CAPITAL_ALONG
  if (navy.capitalCount > 3) return -2 * CAPITAL_ALONG
  return 0
}

function scaleStartFor(navy: ReviewNavy) {
  const rear = typologicalRearAlong(navy)
  return { along: rear - (navy.capitalCount > 0 || navy.id === 'review-plan' ? CAPITAL_TO_SCALE : 0), across: 0 }
}

export function shipsForNavy(navy: ReviewNavy): ReviewShip[] {
  const ships: ReviewShip[] = []
  if (navy.id === 'review-plan') {
    for (const slot of planHighlightSlots()) {
      const at = offsetLatLon(navy.lat, navy.lon, REVIEW_HEADING_DEG, slot.along, slot.across)
      const modelId = slot.carrierId ?? ({'destroyer-055':'type055','amphib-lhd':'type075','amphib-lpd':'type071'} as Partial<Record<ReviewShipKind,AtlasId>>)[slot.kind]
      ships.push({ kind: slot.kind, carrierId: slot.carrierId, modelId, ...at })
    }
  } else {
    const capitals = capitalLayout(navy.capitalCount)
    // Source window fixed by the chapter: ten Nimitz-class hulls and one Ford;
    // the two Japanese large-deck ships remain official escort vessels.
    for (const [i, slot] of capitals.entries()) {
      const at = offsetLatLon(navy.lat, navy.lon, REVIEW_HEADING_DEG, slot.along, slot.across)
      const modelId = navy.id === 'review-us' ? (i === 0 ? 'ford' : 'nimitz') : navy.id === 'review-japan' ? (i === 0 ? 'izumo' : 'kaga') : undefined
      ships.push({ kind: navy.capital ?? 'escort', modelId, ...at })
    }
  }
  if (navy.schematicCount > 0) {
    const startAlong = typologicalRearAlong(navy)
    for (const slot of schematicLayout(navy.schematicCount, startAlong)) {
      const at = offsetLatLon(navy.lat, navy.lon, REVIEW_HEADING_DEG, slot.along, slot.across)
      ships.push({ kind: 'escort', modelId:navy.id==='review-rok'?'sejong':'udaloy', ...at })
    }
  }
  if (navy.id === 'review-australia') {
    // Three types beside the statistical marks, *not* three additional units.
    for (const [i,modelId] of (['hobart','anzac','collins'] as const).entries()) {
      const at=offsetLatLon(navy.lat,navy.lon,REVIEW_HEADING_DEG,.62, (i-1)*.6)
      ships.push({kind:'escort',modelId,...at})
    }
  }
  const scale = scaleStartFor(navy)
  if(navy.id==='review-australia') scale.along=-.74
  // PLAN / US magnitude fields sit to the side of the 1:1 typological
  // capitals so the two visual languages do not interpenetrate.
  if (navy.scaleMarks > 0) {
    const columns = navy.scaleMarks >= 20 ? 7 : navy.scaleMarks >= 8 ? 5 : Math.max(navy.scaleMarks, 1)
    const startAcross = navy.id === 'review-plan'
      ? -2.7
      : navy.id === 'review-us'
        ? 2.15
        : -((columns - 1) / 2) * SCALE_ACROSS
    const startAlong = navy.id === 'review-plan' || navy.id === 'review-us' ? 0.15 : scale.along
    for (const slot of scaleGrid(navy.scaleMarks, columns, startAlong, startAcross)) {
      const at = offsetLatLon(navy.lat, navy.lon, REVIEW_HEADING_DEG, slot.along, slot.across)
      ships.push({ kind: 'scale-unit', ...at })
    }
  }
  if (navy.scaleSubMarks > 0) {
    const columns = Math.max(navy.scaleSubMarks, 1)
    const rowsOfUnits = navy.scaleMarks > 0 ? Math.ceil(navy.scaleMarks / (navy.scaleMarks >= 8 ? 5 : columns)) : 0
    const startAlong = scale.along - rowsOfUnits * SCALE_ALONG - 0.25
    const startAcross = -((columns - 1) / 2) * SCALE_ACROSS
    for (const slot of scaleGrid(navy.scaleSubMarks, columns, startAlong, startAcross)) {
      const at = offsetLatLon(navy.lat, navy.lon, REVIEW_HEADING_DEG, slot.along, slot.across)
      ships.push({ kind: 'scale-sub', ...at })
    }
  }
  return ships
}

/**
 * Compact one-line badges sit in open water at the south (screen-down,
 * once the camera is north-up) foot of each column, not on the hulls.
 * Slight south stagger keeps Russia (already north) and Australia
 * (already south) from covering each other.
 */
const LABEL_OFFSET: Record<ReviewNavyId, { dLat: number; dLon: number }> = {
  'review-plan': { dLat: -2.35, dLon: -1.40 },
  'review-rok': { dLat: -2.20, dLon: 0.15 },
  'review-japan': { dLat: -2.05, dLon: 0.15 },
  'review-russia': { dLat: -1.15, dLon: 0.20 },
  'review-australia': { dLat: -1.70, dLon: 0.90 },
  'review-us': { dLat: -1.70, dLon: 0.15 },
}

export function labelAnchor(navy: ReviewNavy) {
  const offset = LABEL_OFFSET[navy.id]
  return { lat: navy.lat + offset.dLat, lon: wrapLon(navy.lon + offset.dLon) }
}

/** Compact badge; definitions and exact dates stay on the paper. */
const JAPANESE_REVIEW_PINS: Record<ReviewNavyId, readonly [string, string]> = {
  'review-plan': ['中国海軍', '370隻超 · 外部推計'],
  'review-us': ['米海軍', '戦闘部隊艦艇293隻 · 公式'],
  'review-japan': ['海上自衛隊', '護衛艦51隻 · 公式'],
  'review-australia': ['豪海軍', '主要戦闘艦艇16隻 · 公式'],
  'review-rok': ['韓国海軍', '模式図'],
  'review-russia': ['ロシア太平洋艦隊', '模式図'],
}

export function compactPin(navy: ReviewNavy, language: BaselineLocale, paragraphIndex = 0): { name: string; note?: string } {
  if (language === 'ja') {
    const [name, note] = JAPANESE_REVIEW_PINS[navy.id]
    return { name, note: paragraphIndex === 1 && (navy.id === 'review-plan' || navy.id === 'review-us') ? `空母${navy.capitalCount}隻 · 公式` : note }
  }
  const name = language === 'zh' ? navy.short.zh : navy.short.en
  if (paragraphIndex === 1 && (navy.id === 'review-plan' || navy.id === 'review-us')) {
    return { name, note: language === 'zh' ? `航母 ${navy.capitalCount} · 官方` : `${navy.capitalCount} carriers · official` }
  }
  if (navy.id === 'review-plan') {
    return { name, note: language === 'zh' ? '370+ · 外部估计' : '370+ · external estimate' }
  }
  if (navy.id === 'review-us') {
    return { name, note: language === 'zh' ? '战斗舰艇 293 · 官方' : '293 battle force ships · official' }
  }
  if (navy.id === 'review-japan') {
    return { name, note: language === 'zh' ? '护卫舰 51 · 官方' : '51 escorts · official' }
  }
  if (navy.id === 'review-russia') return { name: language === 'zh' ? '俄罗斯 · 示意' : 'Russia · schematic' }
  if (navy.id === 'review-australia') {
    return { name, note: language === 'zh' ? '主要作战舰艇 16 · 官方' : '16 major combatants · official' }
  }
  if (navy.id === 'review-rok') return { name, note: language === 'zh' ? '示意' : 'schematic' }
  return { name }
}

/** A short typological lane under each column, heading northeast. */
export function laneEnds(navy: ReviewNavy) {
  const ships = shipsForNavy(navy)
  if (ships.length === 0) {
    return {
      head: offsetLatLon(navy.lat, navy.lon, REVIEW_HEADING_DEG, 0.5, 0),
      tail: offsetLatLon(navy.lat, navy.lon, REVIEW_HEADING_DEG, -0.5, 0),
    }
  }
  return {
    head: offsetLatLon(navy.lat, navy.lon, REVIEW_HEADING_DEG, 0.7, 0),
    tail: offsetLatLon(navy.lat, navy.lon, REVIEW_HEADING_DEG, typologicalRearAlong(navy) - 0.8, 0),
  }
}

export const REVIEW_SITES: Record<ReviewNavyId, JourneySite> = Object.fromEntries(
  REVIEW_NAVIES.map((navy) => [
    navy.id,
    {
      id: navy.id,
      lat: navy.lat,
      lon: navy.lon,
      certainty: 'representative' as const,
      precisionNote: PRECISION,
    } satisfies JourneySite,
  ]),
) as Record<ReviewNavyId, JourneySite>

export const REVIEW_GROUND_SITE: JourneySite = {
  id: 'review-ground',
  lat: REVIEW_GROUND.lat,
  lon: REVIEW_GROUND.lon,
  certainty: 'representative',
  precisionNote: {
    en: 'A typological mid-Pacific parade ground on open water — ceremonial framing only, not a station, a patrol box, or a named sea-lane.',
    zh: '太平洋中部开阔水面上的类型学阅舰场，只作取景，不是驻地、巡逻框或某一条航路。',
  },
}

/**
 * Sea-surface looks at the typological mid-Pacific parade (centroid
 * 13.5°N, 178.5°E). The camera stands a few degrees south of the look
 * point, just above the water, and looks at the formation on the sea —
 * not at the Earth origin. `focus.lat/lon` is the camera nadir so the
 * shared Planet facing (which aligns that nadir with the camera radial)
 * does not cancel the stand-off. ORIGINS, column order, COLUMN_SPACING,
 * and the centroid are unchanged; only the stand-point depth changes,
 * so the shot can be a wide sea review rather than a space view of the
 * planet. Vertical FOV widens to 52° for this beat only.
 *
 * p0: a wide sea stand centered on the typological divider at
 * 178.5°E, so the Western frame (west) and the non-Western frame (east)
 * both sit in frame, with a belt of open water in front.
 * p1: a close 3/4 on the PLAN typological highlight (ski-jump and
 * flat-deck carriers, Type 055, Type 075 / 071).
 * p2: eases back so both magnitude fields (37 vs 29 scale marks)
 * and the 1:1 carriers can be read together.
 * p3: a hold on the eastern camp (Japan / ROK / Australia / Russia,
 * with the US column still on the right edge).
 */
const REVIEW_FOV = 56

function seaFocus(
  camLat: number,
  camLon: number,
  altitude: number,
  lookLat: number,
  lookLon: number,
  fov: number = REVIEW_FOV,
): JourneyFocus {
  return {
    lat: camLat,
    lon: camLon,
    distance: EARTH_RADIUS + altitude,
    look: { lat: lookLat, lon: lookLon },
    fov,
  }
}

/* Sea stands stay a few degrees south of the look point and just
   above the water. The centroid / divider stays at 13.5°N, 178.5°E.
   p0 / p2 look at that divider so both camps read in one frame. */
export const REVIEW_WIDE: JourneyFocus = seaFocus(4.15, 178.5, 0.140, 11.85, 178.5, 60)
/** Close 3/4 on the PLAN typological highlight: ski-jump / flat carriers, 055, 075, 071. */
export const REVIEW_CARRIERS: JourneyFocus = seaFocus(7.15, 173.6, 0.058, 13.28, 173.5)
/** Ease back so both magnitude fields (PLAN 37 marks, US 29 marks) are in frame. */
export const REVIEW_CARRIERS_ESTIMATE: JourneyFocus = seaFocus(4.65, 178.5, 0.128, 12.15, 178.5, 58)
/** Hold on the eastern, non-Western frame. */
export const REVIEW_OTHERS: JourneyFocus = seaFocus(5.65, 183.7, 0.090, 12.85, 183.9)
