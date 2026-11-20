import type { Localized } from '../types'
import { BEATS, INSTITUTION_CARDS, SITE_CARDS, type MobilizeCard } from './content'

type BeatId = (typeof BEATS)[number]['id']
type RecordId = MobilizeCard['id']
type Cue = { label: Localized; ids: readonly RecordId[] }

const cue = (zh: string, en: string, ...ids: RecordId[]): Cue => ({ label: { zh, en }, ids })

// UI labels and links to existing records only; the spoken script is unchanged.
const CUES = {
  hook: [
    cue('从汶川看动员', 'Mobilization at Wenchuan'),
    cue('两种危机，共用的能力', 'Capabilities shared across crises'),
    cue('三次危机，三个现场', 'Three crises, three settings'),
  ],
  system: [
    cue('机构改革', 'Institutional reform', 'beijing'),
    cue('预案与响应', 'Plans and response', 'response-levels', 'fire-rescue'),
    cue('平时的国防动员', 'Peacetime mobilization', 'defense-mobilization'),
  ],
  floods: [
    cue('1998 年长江抗洪', 'The 1998 Yangtze flood', 'jingzhou'),
    cue('守堤与转移', 'Holding the dikes and moving residents', 'gongan'),
    cue('后来的防洪工程', 'Later flood-control works', 'three-gorges'),
  ],
  wenchuan: [
    cue('震后的映秀', 'Yingxiu after the earthquake', 'yingxiu'),
    cue('山地救援投送', 'Getting help into the mountains', 'chengdu'),
    cue('跨省对口支援', 'Cross-province support', 'pairing'),
  ],
  epidemic: [
    cue('公共卫生应急', 'Public-health response', 'wuhan'),
    cue('应急医院建设', 'Emergency hospital construction', 'huoshenshan', 'leishenshan'),
    cue('医疗队与方舱', 'Medical teams and cabin hospitals', 'medical-teams', 'cabin-hospitals'),
  ],
  warning: [
    cue('监测与提醒', 'Monitoring and alerts', 'shanghai'),
    cue('常备救援与物资', 'Standing teams and supplies', 'fire-rescue'),
    cue('沿海到内陆', 'From coast to inland', 'xian'),
  ],
  rebuild: [
    cue('从安置到定居', 'From emergency shelter to settlements', 'beichuan'),
    cue('一省帮一重灾县', 'One province helps one hard-hit county', 'pairing', 'dujiangyan'),
    cue('道路、电力与家园', 'Roads, power and homes', 'dujiangyan'),
  ],
  close: [
    cue('救灾与战时动员相通之处', 'What relief and wartime mobilization share'),
    cue('从生命线到家园', 'From lifelines to homes'),
    cue('把被打断的日子接上', 'Getting daily life back on track'),
  ],
} satisfies Record<BeatId, readonly [Cue, Cue, Cue]>

const records = new Map<RecordId, MobilizeCard>(
  [...SITE_CARDS, ...INSTITUTION_CARDS].map((card) => [card.id, card]),
)

export function getReadingCue(beatId: BeatId, paragraphIndex: number) {
  const cues = CUES[beatId]
  const { label, ids } = cues[paragraphIndex] ?? cues[0]
  return { label, cards: ids.map((id) => records.get(id)!) }
}
