export type SpaceMode = 'earth' | 'lunar' | 'solar' | 'mars' | 'planet' | 'sibling' | 'network'
export type TimelineGranularity = 'deep-time' | 'civilization' | 'century' | 'year' | 'month' | 'day'
export type HistoryLens = 'all' | 'art' | 'military' | 'literature' | 'science' | 'society' | 'network'
export type CalendarModel = 'gregorian' | 'julian'
export type CoordinateCertainty = 'exact' | 'site' | 'regional' | 'representative'

export type EarthState = {
  magma: number
  ocean: number
  oxygen: number
  ice: number
  vegetation: number
  impact: number
  cityLights: number
  atmosphere: number
}
