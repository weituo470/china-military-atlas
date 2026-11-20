import { ARCHIVE_ART } from '../../publicEdition'
/**
 * Lore-surface mapping for the 2026 baseline.
 * Plates are typological / schematic dossier inserts, never photographs of events
 * and never operational charts.
 */
import type { BaselineText } from './locale'
import { BEATS } from './content'

export type CodexVoice = 'dossier' | 'estimate' | 'mixed'

export type CodexPlate = {
  src: string
  alt: BaselineText
  caption: BaselineText
}

export type CodexBeatSpec = {
  id: string
  emphasize: readonly CodexVoice[]
  plate?: CodexPlate
}

function art(file: string) {
  const base = import.meta.env.BASE_URL || '/'
  const root = base.endsWith('/') ? base : `${base}/`
  return `${root}art/baseline2026/${file}`
}

export const CODEX_BEATS: readonly CodexBeatSpec[] = [
  {
    id: 'hook',
    emphasize: ['dossier', 'estimate'],
    plate: {
      src: art('hook.webp'),
      alt: { zh: '三条轴与一把尺子的基线示意', en: 'Schematic of a ruler and three baseline axes', ja: 'ものさしと三つの軸の模式図' },
      caption: { zh: '先把尺子摆正 · 示意', en: 'Force structure · Arms and industry · Research and military thought (schematic)', ja: '規模と編成・装備と産業・研究開発と軍事思想（模式図）' },
    },
  },
  {
    id: 'timeline',
    emphasize: ['dossier', 'dossier'],
    plate: {
      src: art('timeline.webp'),
      alt: { zh: '战国、一九五〇到五三年与二〇二六年三条刻度的时间尺示意', en: 'Schematic time ruler with ticks for the Warring States, 1950–53, and 2026', ja: '戦国時代、1950～53年、2026年の三つの目盛りを示す模式図' },
      caption: { zh: '同一颗地球上的三条刻度 · 示意', en: 'Three ticks on the same Earth · schematic', ja: '同じ地球上の三つの目盛り（模式図）' },
    },
  },
  {
    id: 'structure',
    emphasize: ['dossier', 'dossier', 'mixed'],
  },
  {
    id: 'equipment',
    emphasize: ['dossier', 'dossier', 'dossier'],
    plate: {
      src: art('platforms.webp'),
      alt: { zh: '航母、驱逐舰与歼-20的类型学剪影示意', en: 'Typological silhouettes of carriers, a destroyer, and a J-20', ja: '空母、駆逐艦、J-20のシルエット' },
      caption: { zh: '已公开亮相的装备类型学剪影 · 示意', en: 'Typological silhouettes of officially shown platforms · schematic', ja: '公開された装備のシルエット（模式図）' },
    },
  },
  {
    id: 'scale',
    emphasize: ['estimate', 'estimate', 'estimate'],
  },
  {
    id: 'review',
    // The live formation and the HTML source key replace the archival SVG.
    emphasize: ['dossier', 'dossier', 'mixed', 'dossier'],
  },
  {
    id: 'seas',
    emphasize: ['dossier', 'estimate'],
    plate: {
      src: art('westpac.webp'),
      alt: { zh: '西太平洋开阔取景的示意', en: 'Wide western-Pacific framing schematic', ja: '西太平洋を広く見渡した模式図' },
      caption: { zh: '西太平洋取景 · 开阔示意', en: 'Western Pacific framing · a wide schematic view', ja: '西太平洋の広域図（模式図）' },
    },
  },
  {
    id: 'doctrine',
    emphasize: ['dossier', 'dossier'],
    plate: {
      src: art('doctrine.webp'),
      alt: { zh: '世界一流、信息化、智能化与联合作战等官方公开词汇示意', en: 'Schematic of official public vocabulary: world-class, informatized, intelligentized, joint', ja: '世界一流、情報化、知能化、統合作戦などの公式用語の模式図' },
      caption: { zh: '官方公开词汇 · 示意', en: 'World-class military · Informatization · Intelligentization · Joint operations (schematic)', ja: '世界一流の軍隊・情報化・知能化・統合作戦（模式図）' },
    },
  },
  {
    id: 'close',
    emphasize: ['dossier', 'dossier'],
    plate: {
      src: art('close.webp'),
      alt: { zh: '古代刻度、二〇二六年刻度与朝鲜战争接口的收束示意', en: 'Closing schematic of the ancient tick, the 2026 tick, and a Korea-journey interface', ja: '古代、2026年、朝鮮戦争の目盛りを結ぶ模式図' },
      caption: { zh: '公开记录能站住的结论 · 示意', en: 'What the public record can defend · schematic', ja: '公開資料が支える結論（模式図）' },
    },
  },
]

if (CODEX_BEATS.length !== BEATS.length || CODEX_BEATS.some((spec, index) => spec.id !== BEATS[index]?.id || spec.emphasize.length !== BEATS[index].narration.zh.length)) {
  throw new Error('baseline2026 CODEX_BEATS emphasize/id is out of sync with BEATS narration')
}

export const CODEX_IMAGE_URLS = CODEX_BEATS.flatMap((beat) => beat.plate ? [beat.plate.src] : [])

export function preloadCodexArt() {
  if (!ARCHIVE_ART) return
  if (typeof window === 'undefined') return
  for (const src of CODEX_IMAGE_URLS) {
    const image = new Image()
    image.src = src
  }
}
