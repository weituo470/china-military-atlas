import type { IndustryLanguage } from '../locale'

type Label = Readonly<Record<IndustryLanguage, string>>
export const label = (zh: string, en: string, ja: string): Label => ({ zh, en, ja })
export type AtlasPlate = { readonly src: string; readonly caption: Label; readonly alt: Label }
