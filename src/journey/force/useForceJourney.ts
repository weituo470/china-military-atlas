import { useEffect } from 'react'
import { useExperience } from '../../store/experience'
import { useJourney } from '../../store/journey'
import { initNarration, useNarration } from '../../store/narration'

const JOURNEY_PARAM = 'force'

function syncJourneyQuery(active: boolean) {
  const url = new URL(window.location.href)
  if (active) url.searchParams.set('journey', JOURNEY_PARAM)
  else url.searchParams.delete('journey')
  const next = `${url.pathname}${url.search}${url.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next !== current) window.history.replaceState(window.history.state, '', next)
}

export function useForceJourney() {
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
    // This app is the competition journey: enter Chapter I on first load,
    // with or without ?journey=force. The query string stays in sync below.
    startJourney('force')
    void initNarration()
  }, [startJourney])

  useEffect(() => {
    syncJourneyQuery(activeJourney === 'force')
  }, [activeJourney])

  useEffect(() => {
    if (activeJourney !== 'force') return
    const unsubscribe = useExperience.subscribe((state, previous) => {
      if (previous.spaceMode === 'earth' && state.spaceMode !== 'earth') {
        exitJourney({ restoreSpaceMode: false })
      }
    })
    return unsubscribe
  }, [activeJourney, exitJourney])

  useEffect(() => {
    if (activeJourney !== 'force') return
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
      if (event.key >= '0' && event.key <= '7') {
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
