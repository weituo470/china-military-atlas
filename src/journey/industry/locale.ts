import type { Localized } from '../types'

export type IndustryLanguage = 'zh' | 'en' | 'ja'
export type IndustryText = Localized & { ja?: string }

export const LANG_TAG = { zh: 'zh-CN', en: 'en', ja: 'ja' } as const

export function industryLocale(state: {
  industryLanguage: IndustryLanguage | null
  hubLocale: string
  language: 'zh' | 'en'
}): IndustryLanguage {
  return state.industryLanguage ?? (state.hubLocale === 'ja' ? 'ja' : state.language)
}

export function t(text: IndustryText | string | undefined, lang: IndustryLanguage): string {
  if (typeof text === 'string') return text
  return text?.[lang] ?? text?.en ?? ''
}

export function phrase(lang: IndustryLanguage, zh: string, en: string, ja: string) {
  return lang === 'zh' ? zh : lang === 'en' ? en : ja
}
