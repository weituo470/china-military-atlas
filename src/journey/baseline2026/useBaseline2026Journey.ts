/**
 * Journey-specific hook, kept for a split-App pattern.
 *
 * App currently uses the shared `useAppJourney` router (already landed for the
 * Korea merge) so that `useForceJourney` is never called on a 2026 or Korea
 * route. This hook is the same keyboard and query contract, scoped to
 * `baseline2026`, if a later merge prefers ForceApp / Baseline2026App / KoreaApp
 * children instead of a single router.
 */
import { useEffect } from 'react'
import { useExperience } from '../../store/experience'
import { useJourney } from '../../store/journey'
import { initNarration, useNarration } from '../../store/narration'
import { BEAT_COUNT } from './sites'

const JOURNEY_PARAM = 'baseline2026'

function syncJourneyQuery() {
  const url = new URL(window.location.href)
  url.searchParams.set('journey', JOURNEY_PARAM)
  const next = `${url.pathname}${url.search}${url.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next !== current) window.history.replaceState(window.history.state, '', next)
}

export function useBaseline2026Journey() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const startJourney = useJourney((store) => store.startJourney)
  const exitJourney = useJourney((store) => store.exitJourney)
  const setBeat = useJourney((store) => store.setBeat)
  const advance = useJourney((store) => store.advance)
  const closeCard = useJourney((store) => store.closeCard)
  const sourcesOpen = useJourney((store) => store.sourcesOpen)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const toggleSources = useJourney((store) => store.toggleSources)

  useEffect(() => {
    startJourney('baseline2026')
    void initNarration('baseline2026')
  }, [startJourney])

  useEffect(() => {
    syncJourneyQuery()
  }, [activeJourney])

  useEffect(() => {
    if (activeJourney !== 'baseline2026') return
    const unsubscribe = useExperience.subscribe((state, previous) => {
      if (previous.spaceMode === 'earth' && state.spaceMode !== 'earth') {
        exitJourney({ restoreSpaceMode: false })
      }
    })
    return unsubscribe
  }, [activeJourney, exitJourney])

  useEffect(() => {
    if (activeJourney !== 'baseline2026') return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('button,a,input,textarea,select,[contenteditable="true"]')) {
        if (event.code !== 'Escape') return
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.code === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        if (sourcesOpen) toggleSources(false)
        else if (selectedCardId) closeCard()
        else exitJourney()
        return
      }
      const lastDigit = String(Math.max(0, BEAT_COUNT - 1))
      if (event.key >= '0' && event.key <= lastDigit) {
        event.preventDefault()
        event.stopPropagation()
        setBeat(Number(event.key))
        return
      }
      if (event.code === 'ArrowLeft') {
        event.preventDefault()
        event.stopPropagation()
        advance(-1)
        return
      }
      if (event.code === 'Space') {
        event.preventDefault()
        event.stopPropagation()
        const narration = useNarration.getState()
        if (narration.status === 'playing') narration.pause()
        else if (narration.status === 'paused') narration.resume()
        else narration.play()
        return
      }
      if (event.code === 'ArrowRight') {
        event.preventDefault()
        event.stopPropagation()
        advance(1)
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [activeJourney, advance, closeCard, exitJourney, selectedCardId, setBeat, sourcesOpen, toggleSources])
}
