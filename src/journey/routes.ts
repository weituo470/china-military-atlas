import type { JourneyId } from './types'

// The globe's staging and narration stores only handle these six guides.
export const journeyIds = ['force','korea','mobilize','industry','baseline2026','space'] as const satisfies readonly JourneyId[]
export type HubJourneyId = JourneyId | 'longmarch'
// The Long March has its own map, chapters and audio player, not a globe staging entry.
export const hubJourneyIds = [journeyIds[0],'longmarch',...journeyIds.slice(1)] as const satisfies readonly HubJourneyId[]
const longMarchDoor = '#atlas-door-longmarch'

export function isLongMarchRoute(url: URL) {
  return url.searchParams.get('journey') === 'longmarch'
}

export function requestedJourney(url: URL): JourneyId | null {
  const value = url.searchParams.get('journey')
  return journeyIds.find(id => id === value) ?? null
}

export function journeyHref(id: HubJourneyId | null, current = location.href) {
  const url = new URL(current)
  if (id) url.searchParams.set('journey', id)
  else url.searchParams.delete('journey')
  // Doors always enter at the beginning, never at a previous guide's paragraph.
  url.searchParams.delete('beat')
  url.searchParams.delete('para')
  if (id && url.hash === longMarchDoor) url.hash = ''
  return url.pathname + url.search + url.hash
}

export function longMarchHref(lang: 'zh' | 'en', current = location.href) {
  const url = new URL(journeyHref('longmarch', current), current)
  url.searchParams.set('lang', lang)
  return url.pathname + url.search + url.hash
}

export function longMarchReturnHref(current = location.href) {
  const url = new URL(journeyHref(null, current), current)
  for (const key of ['chapter', 'view', 'unit', 'stop', 'at', 'lang']) url.searchParams.delete(key)
  return url.pathname + url.search + longMarchDoor
}

export const isLongMarchReturn = (hash: string) => hash === longMarchDoor
