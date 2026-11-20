import { useEffect, useLayoutEffect } from 'react'
import { getJourneyBeatCount } from './runtime'
import { useExperience } from '../store/experience'
import { useJourney } from '../store/journey'
import { initNarration, useNarration } from '../store/narration'
import type { JourneyId } from './types'

import { requestedJourney, journeyHref } from './routes'

function writeJourney(id: JourneyId | null, method: 'pushState' | 'replaceState') {
  history[method](history.state, '', journeyHref(id))
}

export function useAppJourney() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const startJourney = useJourney((store) => store.startJourney)
  const exitJourney = useJourney((store) => store.exitJourney)
  const setBeat = useJourney((store) => store.setBeat)
  const advance = useJourney((store) => store.advance)
  const closeCard = useJourney((store) => store.closeCard)
  const sourcesOpen = useJourney((store) => store.sourcesOpen)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const toggleSources = useJourney((store) => store.toggleSources)

  useLayoutEffect(() => {
    // All store exits (Esc or toolbar) get a clean history entry. During
    // popstate the URL already matches, so navigation never echoes a push.
    const unsubscribe = useJourney.subscribe((state, previous) => {
      if (state.activeJourney !== previous.activeJourney &&
          state.activeJourney !== requestedJourney(new URL(location.href))) {
        writeJourney(state.activeJourney, 'pushState')
      }
    })
    const apply = () => {
      const url = new URL(location.href)
      const id = requestedJourney(url)
      if (!id) {
        if (url.searchParams.has('journey')) writeJourney(null, 'replaceState')
        exitJourney()
        return
      }
      startJourney(id)
      void initNarration(id)
      const beat = url.searchParams.get('beat')
      if (beat && Number.isInteger(Number(beat))) setBeat(Number(beat))
      const para = url.searchParams.get('para')
      if (id === 'industry' && para && /^\d+$/.test(para)) useNarration.getState().readParagraph(Number(para))
    }
    apply()
    window.addEventListener('popstate', apply)
    return () => {
      unsubscribe()
      window.removeEventListener('popstate', apply)
    }
  }, [startJourney, exitJourney, setBeat])

  useEffect(() => {
    if (!activeJourney) return
    const unsubscribe = useExperience.subscribe((state, previous) => {
      if (previous.spaceMode === 'earth' && state.spaceMode !== 'earth') {
        exitJourney({ restoreSpaceMode: false })
      }
    })
    return unsubscribe
  }, [activeJourney, exitJourney])

  useEffect(() => {
    if (!activeJourney) return
    const beatCount = getJourneyBeatCount(activeJourney)
    const lastDigit = String(Math.max(0, beatCount - 1))
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null
      // The nested screenshot editor owns Escape, undo and drawing shortcuts.
      if (activeJourney === 'space' && (document.querySelector('dialog.space-mark-editor[open]') || target?.closest('.space-pinned-mark'))) return
      // Keep number/arrow shortcuts after a mouse click on Play; only treat real
      // text fields (and Space on a button/link) as reserved controls.
      if (event.code !== 'Escape' && (
        sourcesOpen || selectedCardId
        || target?.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])')
        || (event.code === 'Space' && target?.closest('button,a'))
      )) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.code === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        if (sourcesOpen) toggleSources(false)
        else if (selectedCardId) closeCard()
        else exitJourney()
        return
      }
      if (/^[0-9]$/.test(event.key) && event.key <= lastDigit) {
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
  return (id: JourneyId) => {
    startJourney(id)
    void initNarration(id)
  }
}
