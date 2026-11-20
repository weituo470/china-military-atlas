import { label } from './plate'

// GB/T 4754—2017: B, C and D comprise 41 two-digit divisions (not UN identifiers).
export const INDUSTRY_CLASSIFICATION_URL = 'https://www.stats.gov.cn/sj/tjbz/gmjjhyfl/202501/P020250116506795831658.pdf'
export const categoryGroups = [
  { section: 'B', name: label('采矿业', 'Mining', '鉱業'), range: [6, 12] },
  { section: 'C', name: label('制造业', 'Manufacturing', '製造業'), range: [13, 43] },
  { section: 'D', name: label('电热气水供应', 'Utilities', '電気・熱・ガス・水道'), range: [44, 46] },
] as const
