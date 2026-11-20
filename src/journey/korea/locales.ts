import reading from './reading-copy.json'
import { BEATS, UI } from './content'
import type { JourneyLang, Localized } from '../types'
import narration from './narration-ja.json'

export type KoreaLang = JourneyLang | 'ja'
export type KoreaText = Localized & { ja?: string }

export function tr(value: KoreaText, locale: KoreaLang) {
  return locale === 'ja' ? value.ja ?? value.en : value[locale]
}

export const COPY = {
  brandKicker: { ...UI.brandKicker, ja: '中国の軍事力' },
  brandTitle: { ...UI.brandTitle, ja: '抗米援朝 ― 朝鮮戦争への中国参戦' },
  coords: { zh: '1950–1953年 · 今地图上的代表性坐标', en: '1950–1953 · representative coordinates on the present-day globe', ja: '1950–1953年 · 現在の地図上のおおよその位置' },
  timeWindow: { zh: '时间窗：1950年6月25日 – 1953年7月27日', en: 'Window: 25 June 1950 – 27 July 1953', ja: '期間：1950年6月25日–1953年7月27日' },
  coordinateCaution: { ...UI.coordinateCaution, ja: '地図上のピンは代表地点や史跡のおおよその位置を示します。測量による精密な座標ではありません。' },
  languageLabel: { ...UI.languageLabel, ja: '表示・音声の言語' },
  exit: { ...UI.exit, ja: 'ガイドを終了' },
  close: { ...UI.close, ja: '閉じる' },
  sourcesBtn: { ...UI.sourcesBtn, ja: '史料と注記' },
  sourcesKicker: { ...UI.sourcesKicker, ja: '史料を確認したい方へ' },
  sourcesTitle: { ...UI.sourcesTitle, ja: '史料と読み方の注意' },
  hints: { ...UI.hints, ja: '0–6：章を選ぶ · ← →：前後の章 · スペース：再生／一時停止 · 地球儀はドラッグで操作 · Esc：閉じる／終了' },
  playNarration: { zh: '播放原版解说', en: 'Play original audio', ja: '元の解説を再生' },
  pauseNarration: { ...UI.pauseNarration, ja: '一時停止' },
  resumeNarration: { ...UI.resumeNarration, ja: '再生を続ける' },
  replayNarration: { en: 'Restart', zh: '从头播放', ja: '最初から' },
  narrationError: { ...UI.narrationError, ja: '音声を再生できません。画面の解説をお読みください。' },
  narrationProgress: { zh: '本段解说进度', en: 'Current beat narration', ja: 'この章の解説の進み具合' },
  briefingRoll: { zh: '图文导览', en: 'Field guide', ja: '図解ガイド' },
  illustrationCaution: { ...UI.illustrationCaution, ja: 'イメージ図 · 当時の写真ではありません' },
  audioEdition: { zh: '图文经重新编写，录音保留原版，不是逐字朗读。', en: 'The reading text has been edited. The original audio is not a word-for-word reading.', ja: '画面の文章は改稿版です。音声は従来の解説で、逐語読み上げではありません。' },
  warTypological: { ...UI.warTypological, ja: '模式図です。正確な進軍経路や兵力を示すものではありません。' },
  plate: { zh: '图版', en: 'Plate', ja: '図版' },
  place: { zh: '地点资料：', en: 'Site notes: ', ja: '地点の解説：' },
  beijing: { zh: '地图：北京', en: 'On the map: Beijing', ja: '地図：北京' },
  chapterProgress: { zh: '章节进度', en: 'Chapter progress', ja: '章の進行状況' },
  reader: { zh: '静音阅读', en: 'Silent reading', ja: '音声なしで読む' },
  previousParagraph: { zh: '上一小段', en: 'Previous paragraph', ja: '前の段落' },
  nextParagraph: { zh: '下一小段', en: 'Next paragraph', ja: '次の段落' },
  previousBeat: { zh: '上一段', en: 'Previous beat', ja: '前の章' },
  nextBeat: { zh: '下一段', en: 'Next beat', ja: '次の章' },
  next: { zh: '继续', en: 'Next', ja: '次へ' },
}

// Keep the recording scripts for timing/generation. The reader uses independently edited prose.
export const KOREA_BEATS = BEATS.map(beat => ({
  ...beat, reading: reading[beat.id].sections,
  narration: { ...beat.narration, ja: narration[beat.id] },
}))
