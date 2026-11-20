/**
 * Documented journey registry entry point.
 *
 * The live helpers used by `src/store/journey.ts` and `src/store/narration.ts`
 * live in `runtime.ts` (already wired by the Korea merge). This file re-exports
 * them so a later three-way merge has a single obvious name.
 *
 * To add or adjust a journey:
 *   1. Keep journey-specific code under `src/journey/<id>/`.
 *   2. Register beats, staging, sites, and narration paths in `runtime.ts`.
 *   3. Extend `JourneyId` additively in `types.ts`.
 *   4. Choose the journey from the initial `?journey=` param in `useAppJourney`.
 *   5. Mount that journey’s overlay in `App.tsx` and its globe layer/camera
 *      in `EarthScene.tsx`.
 */
export {
  getJourneyBeatCount,
  getJourneyBeats,
  getJourneySite,
  getJourneyStaging,
  getNarrationAudioBase,
  getNarrationManifestUrl,
} from './runtime'
