import { ARCHIVE_ART } from '../../publicEdition'
/**
 * Lore-surface mapping for Chapter I.
 * Plates are typological / historical-imagination paintings, never photographs of events.
 */
import type { Localized } from '../types'
import { UI } from './content'

export type CodexAspect = '3:4' | '4:3'
export type CodexMaterial = 'bamboo' | 'parchment' | 'both'
export type CodexLayout = 'bamboo' | 'diptych' | 'shared'

export type CodexPlate = {
  src: string
  aspect: CodexAspect
  alt: Localized
  caption: Localized
  note?: Localized
  dual?: { east: Localized; west: Localized }
}

export type CodexBeatSpec = {
  id: string
  layout: CodexLayout
  /** Which surface comes forward for each narration paragraph. */
  emphasize: readonly CodexMaterial[]
  bambooParagraphs: readonly number[]
  parchmentParagraphs: readonly number[]
  bambooPlate?: CodexPlate
  parchmentPlate?: CodexPlate
  sharedPlate?: CodexPlate
}

function art(plate: string) {
  const base = import.meta.env.BASE_URL || '/'
  const root = base.endsWith('/') ? base : `${base}/`
  return `${root}art/force/march/${plate}.webp`
}

const typo = UI.illustrationCaution

export const CODEX_BEATS: readonly CodexBeatSpec[] = [
  {
    id: 'hook',
    layout: 'diptych',
    emphasize: ['bamboo', 'bamboo', 'parchment', 'parchment'],
    bambooParagraphs: [0, 1],
    parchmentParagraphs: [2, 3],
    bambooPlate: {
      src: art('hook-east'),
      aspect: '3:4',
      alt: { zh: '战国黎明行军的历史想象图', en: 'Typological illustration of a Warring States dawn march' },
      caption: { zh: '战国黎明行军 · 历史想象图', en: 'Warring States dawn march · typological illustration' },
      note: typo,
    },
    parchmentPlate: {
      src: art('hook-west'),
      aspect: '3:4',
      alt: { zh: '地中海岸边，水手放开缆绳，木质桨船正在离岸', en: 'A sailor casts off as a wooden galley leaves a Mediterranean quay' },
      caption: { zh: '地中海海岸 · 历史想象图', en: 'A Mediterranean coast · typological illustration' },
      note: typo,
    },
  },
  {
    id: 'timeline',
    layout: 'diptych',
    emphasize: ['bamboo', 'parchment'],
    bambooParagraphs: [0],
    parchmentParagraphs: [1],
    bambooPlate: {
      src: art('timeline-east'),
      aspect: '4:3',
      alt: { zh: '乡人挎着粮篮，从残破的土墙边望向远处山道上的行列', en: 'A villager with a grain basket looks past a weathered earthen wall toward troops on a distant ridge' },
      caption: { zh: '列国交战示意 · 历史想象图', en: 'Schematic interstate war · typological illustration' },
      note: typo,
    },
    parchmentPlate: {
      src: art('timeline-west'),
      aspect: '4:3',
      alt: { zh: '重装步兵与较短东方远征的历史想象图', en: 'Typological illustration of a hoplite company and a shorter eastern expedition' },
      caption: { zh: '同时代西方战争示意 · 历史想象图', en: 'Contemporaneous western campaigns · typological illustration' },
      note: typo,
    },
  },
  {
    id: 'institutions',
    layout: 'diptych',
    emphasize: ['bamboo', 'parchment'],
    bambooParagraphs: [0],
    parchmentParagraphs: [1],
    bambooPlate: {
      src: art('institutions'),
      aspect: '4:3',
      alt: { zh: '户籍、粮仓、县廷与征发的类型学想象图', en: 'Typological illustration of registers, a granary, a county office, and a muster' },
      caption: { zh: '户籍、粮仓、县廷与征发 · 类型学想象图', en: 'Registers, granary, county, and muster · typological illustration' },
      note: typo,
    },
    parchmentPlate: {
      src: art('institutions-west'),
      aspect: '4:3',
      alt: { zh: '希腊城邦的廊下，一位携盔的公民等候登记，案上摆着给养', en: 'Under a Greek portico, a citizen carrying a helmet waits to be registered beside a table of provisions' },
      caption: { zh: '希腊城邦的征募与给养 · 历史想象图', en: 'Muster and provisions in a Greek city-state · typological illustration' },
      note: typo,
    },
  },
  {
    id: 'weapons',
    layout: 'bamboo',
    emphasize: ['bamboo', 'bamboo'],
    bambooParagraphs: [0, 1],
    parchmentParagraphs: [],
    bambooPlate: {
      src: art('weapons'),
      aspect: '4:3',
      alt: { zh: '战国兵器的类型学想象图，不是出土器', en: 'Typological still life of Warring States weapons, not an excavated object' },
      caption: { zh: '类型学想象图，不是某一件出土器', en: 'Typological illustration, not a named excavated object' },
      note: UI.weaponsPlateCaution,
    },
  },
  {
    id: 'scale',
    layout: 'diptych',
    emphasize: ['parchment', 'bamboo'],
    bambooParagraphs: [1],
    parchmentParagraphs: [0],
    sharedPlate: {
      src: art('scale'),
      aspect: '4:3',
      alt: { zh: '文献记载规模感与可计数登陆对照的历史想象图', en: 'Typological diptych: a literature-claim host beside a countable landing' },
      caption: typo,
      dual: { east: UI.scaleEastCaption, west: UI.scaleWestCaption },
    },
  },
  {
    id: 'changping',
    layout: 'bamboo',
    emphasize: ['bamboo', 'bamboo'],
    bambooParagraphs: [0, 1],
    parchmentParagraphs: [],
    bambooPlate: {
      src: art('changping'),
      aspect: '4:3',
      alt: { zh: '空粮篓横倒在山谷地形模型旁，篓口只剩几粒谷子', en: 'An empty grain basket lies beside a valley relief, with a few grains spilled at its mouth' },
      caption: UI.changpingPlateTitle,
      note: UI.changpingPlateNote,
    },
  },
  {
    id: 'strategy',
    layout: 'diptych',
    emphasize: ['bamboo', 'parchment', 'both'],
    bambooParagraphs: [0, 2],
    parchmentParagraphs: [1],
    bambooPlate: {
      src: art('strategy-east'),
      aspect: '4:3',
      alt: { zh: '厅堂侧光下，三个人围坐在竹书与沙盘旁商议', en: 'Three men deliberate beside bamboo texts and a sand-table in a sidelit hall' },
      caption: { zh: '庙算与沙盘 · 历史想象图', en: 'Deliberation and a sand-table · typological illustration' },
      note: typo,
    },
    parchmentPlate: {
      src: art('strategy-west'),
      aspect: '4:3',
      alt: { zh: '西西里与东方路线的历史想象图', en: 'Typological illustration of a Sicily map and an eastern route' },
      caption: { zh: '同时代西方谋略示意 · 历史想象图', en: 'Contemporaneous western strategy · typological illustration' },
      note: typo,
    },
  },
  {
    id: 'close',
    layout: 'shared',
    emphasize: ['both'],
    bambooParagraphs: [0],
    parchmentParagraphs: [0],
    sharedPlate: {
      src: art('close'),
      aspect: '4:3',
      alt: { zh: '竹简、青铜残件、羊皮卷与盔形在同一黄昏前的历史想象图', en: 'Typological still life of bamboo slips, a small bronze, parchment, and a helmet at a shared dusk' },
      caption: { zh: '三种能力的余响 · 历史想象图', en: 'The aftertone of three capacities · typological illustration' },
      note: typo,
    },
  },
]

export const CODEX_IMAGE_URLS = [
  ...new Set(
    CODEX_BEATS.flatMap((beat) => [beat.bambooPlate?.src, beat.parchmentPlate?.src, beat.sharedPlate?.src].filter(Boolean) as string[]),
  ),
]

function plateSrcs(spec: CodexBeatSpec | undefined) {
  if (!spec) return [] as string[]
  return [spec.bambooPlate?.src, spec.parchmentPlate?.src, spec.sharedPlate?.src].filter(Boolean) as string[]
}

/** Prefetch the current beat’s plates, and the next one. Do not fetch the whole catalog on first paint. */
export function preloadCodexArt(beatIndex = 0) {
  if (!ARCHIVE_ART) return
  if (typeof window === 'undefined') return
  const urls = [...new Set([...plateSrcs(CODEX_BEATS[beatIndex]), ...plateSrcs(CODEX_BEATS[beatIndex + 1])])]
  for (const src of urls) {
    const image = new Image()
    image.src = src
  }
}
