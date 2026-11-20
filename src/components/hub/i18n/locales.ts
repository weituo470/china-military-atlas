import type { HubJourneyId } from '../../../journey/routes'

export const locales = {
  "zh": {
    "name": "简体中文",
    "flag": "cn"
  },
  "en": {
    "name": "English",
    "flag": "gb"
  },
  "ja": {
    "name": "日本語",
    "flag": "jp"
  },
  "ko": {
    "name": "한국어",
    "flag": "kr"
  },
  "fil": {
    "name": "Filipino",
    "flag": "ph"
  },
  "id": {
    "name": "Bahasa Indonesia",
    "flag": "id"
  },
  "es": {
    "name": "Español",
    "flag": "es"
  },
  "fr": {
    "name": "Français",
    "flag": "fr"
  },
  "de": {
    "name": "Deutsch",
    "flag": "de"
  },
  "pt": {
    "name": "Português",
    "flag": "pt"
  },
  "ru": {
    "name": "Русский",
    "flag": "ru"
  },
  "ar": {
    "name": "العربية",
    "flag": "sa"
  }
} as const
export type HubLocale = keyof typeof locales
export const localeTag = (id: HubLocale) => id === 'zh' ? 'zh-CN' : id
export const isHubLocale = (s: unknown): s is HubLocale => typeof s === 'string' && Object.hasOwn(locales, s)
export const events = ['2026-11-16','2026-05-28','2025-12-17','2025-11-07','2024-11-07'] as const
export { hubJourneyIds as journeys } from '../../../journey/routes'
export type HubCopy = {
  brand: string; exhibition: string; language: string; moreLanguages: string; close: string; prologue: string; skip: string
  record: string; newest: string; response: string; author: string; journeys: string; guideNotice: string; unavailable: string
  question: string; lead: string; argument: string; motive: string; conclusion: string
  audioLabel: string; audioError: string
  events: Record<typeof events[number], {title: string; account: string; response: string; sources: [string,string]}>
  doors: Record<HubJourneyId, {short: string; title: string; period: string; detail: string}>
}
