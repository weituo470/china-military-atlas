import { create } from 'zustand'
import { useJourney } from '../../store/journey'
import type { JourneyLang, Localized } from '../types'

export type MobilizeLanguage = JourneyLang | 'ja'
export const useMobilizeLocale = create<{ language: MobilizeLanguage | null }>(() => ({ language: null }))
export function useMobilizeLanguage(): MobilizeLanguage {
  const shared = useJourney((state) => state.language)
  return useMobilizeLocale((state) => state.language) ?? shared
}
export function getMobilizeLanguage(): MobilizeLanguage {
  return useMobilizeLocale.getState().language ?? useJourney.getState().language
}

export const tri = (language: MobilizeLanguage, zh: string, en: string, ja: string) => ({ zh, en, ja })[language]
export const ml = (value: Localized, language: MobilizeLanguage, ja: string) =>
  language === 'ja' ? ja : value[language]
export const localeTags = { zh: 'zh-CN', en: 'en', ja: 'ja' } as const
