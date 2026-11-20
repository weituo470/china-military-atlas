import type { JourneyLang, Localized } from '../types'

export type BaselineLocale = JourneyLang | 'ja'
export type BaselineText = Localized & { ja?: string }

export function selectBaselineLocale(state: {
  baselineLocale: BaselineLocale | null
  language: JourneyLang
  hubLocale: string
}): BaselineLocale {
  return state.baselineLocale ?? (state.hubLocale === 'ja' ? 'ja' : state.language)
}

export const tags = { zh: 'zh-CN', en: 'en', ja: 'ja' } as const

export function tri(language: BaselineLocale, zh: string, en: string, ja: string): string {
  return { zh, en, ja }[language]
}

export function t(value: BaselineText | undefined, language: BaselineLocale): string {
  return value?.[language] ?? value?.en ?? ''
}
