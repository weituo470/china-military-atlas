import type { JourneySite, JourneyStoreStaging, Localized } from '../types'
import { BEATS, type SpaceBeatId } from './content'

type SpaceSite = JourneySite & { name: Localized }
function site(id: string, lat: number, lon: number, zh: string, en: string): SpaceSite {
  return {
    id, lat, lon, name: { zh, en }, certainty: 'regional',
    precisionNote: { zh: '区域级导览定位，不表示设施精确位置。', en: 'Regional guide marker, not a precise facility location.' },
  }
}

export const SITE_INDEX = {
  jiuquan: site('jiuquan', 40.9, 100.3, '酒泉发射场一带', 'Jiuquan launch region'),
  wenchang: site('wenchang', 19.5, 111.0, '海南文昌', 'Wenchang, Hainan'),
  returnRegion: site('returnRegion', 42.0, 111.5, '内蒙古四子王旗一带', 'Siziwang Banner, Inner Mongolia'),
  fast: site('fast', 25.7, 106.8, '贵州平塘', 'Pingtang, Guizhou'),
}

export function getSpaceSite(id: string): JourneySite | undefined {
  return Object.hasOwn(SITE_INDEX, id) ? SITE_INDEX[id as keyof typeof SITE_INDEX] : undefined
}

type Frame = {
  ground: Localized
  marker?: keyof typeof SITE_INDEX
  visual?: 'orbit' | 'network'
} & JourneyStoreStaging

function frame(lat: number, lon: number, distance: number, cursor: string, ground: Localized, extra?: Pick<Frame, 'marker' | 'visual'>): Frame {
  return { cursor, focus: { lat, lon, distance }, ground, ...extra }
}

const FRAMES: Record<SpaceBeatId, Frame> = {
  opening: frame(25, 125, 5.6, '2024-05-03', { zh: '东亚与西太平洋', en: 'East Asia & western Pacific' }, { visual: 'orbit' }),
  dfh: frame(40.9, 100.3, 4.55, '1970-04-24', SITE_INDEX.jiuquan.name, { marker: 'jiuquan' }),
  launch: frame(19.5, 111.0, 4.5, '2024-05-03', SITE_INDEX.wenchang.name, { marker: 'wenchang' }),
  tiangong: frame(17, 145, 5.6, '2022-11-03', { zh: '近地轨道示意', en: 'Low Earth orbit illustration' }, { visual: 'orbit' }),
  moon: frame(42, 111.5, 4.55, '2024-06-25', SITE_INDEX.returnRegion.name, { marker: 'returnRegion' }),
  beidou: frame(18, 84, 6.15, '2020-07-31', { zh: '全球服务示意', en: 'Global service illustration' }, { visual: 'network' }),
  fast: frame(25.7, 106.8, 4.5, '2020-01-11', SITE_INDEX.fast.name, { marker: 'fast' }),
  closing: frame(30, 110, 5.5, '2024-06-25', { zh: '中国与近地空间', en: 'China & near-Earth space' }, { visual: 'orbit' }),
}

export const BEAT_STAGING = BEATS.map(beat => FRAMES[beat.id])
export const BEAT_COUNT = BEATS.length

