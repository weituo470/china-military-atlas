import { create } from 'zustand'
import type { CalendarModel, HistoryLens, SpaceMode, TimelineGranularity } from '../types'

/**
 * Minimal experience store so the Chapter I journey can snapshot, apply an
 * Earth time window, and restore on exit — without the rest of 地球往事.
 */
type ExperienceState = {
  progress: number
  isPlaying: boolean
  selectedEventId: string | null
  selectedSpacecraftId: string | null
  selectedMarsLandmarkId: string | null
  activePlanetId: 'earth' | 'mars' | string
  hasEnteredDeepTime: boolean
  spaceMode: SpaceMode
  historyLens: HistoryLens
  granularity: TimelineGranularity
  calendarCursor: string
  calendarModel: CalendarModel
}

export const useExperience = create<ExperienceState>(() => ({
  progress: 1,
  isPlaying: false,
  selectedEventId: null,
  selectedSpacecraftId: null,
  selectedMarsLandmarkId: null,
  activePlanetId: 'earth',
  hasEnteredDeepTime: false,
  spaceMode: 'earth',
  historyLens: 'all',
  granularity: 'century',
  calendarCursor: '-0475-01-01',
  calendarModel: 'gregorian',
}))
