/**
 * Thin shared registry so the journey and narration stores can stay journey-aware
 * without importing journey-specific flags into force modules.
 *
 * Merge note: force continues to own BEAT_STAGING / THEATER_SITES / BEATS.
 * baseline2026 and korea own their own tables. This file is the shared wiring point.
 *
 * `registry.ts` re-exports the same helpers for documentation and for a later
 * three-way merge. Keep the function signatures here stable.
 */
import { BEATS as BASELINE_BEATS } from './baseline2026/content'
import { BEAT_COUNT as BASELINE_BEAT_COUNT, BEAT_STAGING as BASELINE_STAGING, SITE_INDEX as BASELINE_SITES } from './baseline2026/sites'
import { BEATS as FORCE_BEATS } from './force/content'
import { BEAT_COUNT as FORCE_BEAT_COUNT, BEAT_STAGING as FORCE_STAGING, THEATER_SITES as FORCE_SITES } from './force/sites'
import { BEATS as KOREA_BEATS } from './korea/content'
import { BEAT_COUNT as KOREA_BEAT_COUNT, BEAT_STAGING as KOREA_STAGING, SITE_INDEX as KOREA_SITES } from './korea/sites'
import { BEATS as INDUSTRY_BEATS } from './industry/content'
import { BEAT_COUNT as INDUSTRY_BEAT_COUNT, BEAT_STAGING as INDUSTRY_STAGING, SITE_INDEX as INDUSTRY_SITES } from './industry/sites'
import { BEATS as MOBILIZE_BEATS } from './mobilize/content'
import { BEAT_COUNT as MOBILIZE_BEAT_COUNT, BEAT_STAGING as MOBILIZE_STAGING, SITE_INDEX as MOBILIZE_SITES } from './mobilize/sites'
import { BEATS as SPACE_BEATS } from './space/content'
import { BEAT_COUNT as SPACE_BEAT_COUNT, BEAT_STAGING as SPACE_STAGING, getSpaceSite } from './space/sites'
import { SPACE_MANIFEST_URL } from './space/recordings'
import type { JourneyBeat, JourneyCameraStaging, JourneyId, JourneySite } from './types'
import type { BaselineLocale } from './baseline2026/locale'

export function getJourneyBeatCount(id: JourneyId): number {
  if (id === 'space') return SPACE_BEAT_COUNT
  if (id === 'industry') return INDUSTRY_BEAT_COUNT
  if (id === 'mobilize') return MOBILIZE_BEAT_COUNT
  if (id === 'korea') return KOREA_BEAT_COUNT
  if (id === 'baseline2026') return BASELINE_BEAT_COUNT
  return FORCE_BEAT_COUNT
}

export function getJourneyStaging(id: JourneyId, index: number): JourneyCameraStaging {
  if (id === 'space') {
    const indexClamped = Math.min(SPACE_BEAT_COUNT - 1, Math.max(0, Math.round(index)))
    const { cursor, focus } = SPACE_STAGING[indexClamped] ?? SPACE_STAGING[0]
    return { cursor, focus }
  }
  const staging = id === 'industry'
    ? INDUSTRY_STAGING
    : id === 'mobilize'
      ? MOBILIZE_STAGING
      : id === 'korea'
        ? KOREA_STAGING
        : id === 'baseline2026'
          ? BASELINE_STAGING
          : FORCE_STAGING
  const beatIndex = Math.min(staging.length - 1, Math.max(0, Math.round(index)))
  const row = staging[beatIndex] ?? staging[0]
  return { cursor: row.cursor, focus: row.focus }
}

export function getJourneySite(id: JourneyId | null, siteId: string): JourneySite | undefined {
  if (id === 'space') return getSpaceSite(siteId)
  if (id === 'industry') return INDUSTRY_SITES[siteId]
  if (id === 'mobilize') return MOBILIZE_SITES[siteId]
  if (id === 'korea') return KOREA_SITES[siteId]
  if (id === 'baseline2026') return BASELINE_SITES[siteId]
  if (id === 'force') return FORCE_SITES[siteId]
  return undefined
}

export function getJourneyBeats(id: JourneyId): readonly JourneyBeat[] {
  if (id === 'space') return SPACE_BEATS
  if (id === 'industry') return INDUSTRY_BEATS
  if (id === 'mobilize') return MOBILIZE_BEATS
  if (id === 'korea') return KOREA_BEATS
  if (id === 'baseline2026') return BASELINE_BEATS
  return FORCE_BEATS
}

export function getNarrationManifestUrl(id: JourneyId, baselineLocale: BaselineLocale = 'zh') {
  if (id === 'space') return SPACE_MANIFEST_URL
  const base = import.meta.env.BASE_URL || '/'
  const path = id === 'industry'
    ? 'audio/industry/zh/manifest.json'
    : id === 'mobilize'
      ? 'audio/mobilize/zh/manifest.json'
      : id === 'korea'
        ? 'audio/korea/zh/manifest.json'
        : id === 'baseline2026'
          ? `audio/baseline2026/${baselineLocale}/manifest.json`
          : 'audio/zh/manifest.json'
  const url = `${base}${base.endsWith('/') ? '' : '/'}${path}`
  if (id === 'industry') return `${url}?v=20261117industry1`
  return id === 'mobilize' || id === 'korea' || id === 'baseline2026' ? url : `${url}?v=20261117tts1`
}

export function getNarrationAudioBase(id: JourneyId) {
  if (id === 'space') return '/audio/space/zh'
  if (id === 'industry') return '/audio/industry/zh'
  if (id === 'mobilize') return '/audio/mobilize/zh'
  if (id === 'korea') return '/audio/korea/zh'
  if (id === 'baseline2026') return '/audio/baseline2026/zh'
  return '/audio/zh'
}
