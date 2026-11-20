import { Component, type ReactNode, Suspense, lazy, useEffect, useMemo } from 'react'
import { EarthCanvas } from './components/earth/EarthScene'
import { useAppJourney } from './journey/useAppJourney'
import { JourneyHub } from './components/hub/JourneyHub'
import type { JourneyId } from './journey/types'
import { industryLocale } from './journey/industry/locale'
import { selectBaselineLocale } from './journey/baseline2026/locale'
import { useJourney } from './store/journey'
import { PROJECT_NAME } from './brand'
import { catalog } from './components/hub/i18n'
import { localeTag } from './components/hub/i18n/locales'
import './index.css'
import './styles/journey.css'
import './styles/reading.css'
import './App.css'

const JourneyOverlay = lazy(() => import('./journey/force/JourneyOverlay').then((module) => ({ default: module.JourneyOverlay })))
const Baseline2026Overlay = lazy(() => import('./journey/baseline2026/JourneyOverlay').then((module) => ({ default: module.Baseline2026Overlay })))
const KoreaJourneyOverlay = lazy(() => import('./journey/korea/JourneyOverlay').then((module) => ({ default: module.KoreaJourneyOverlay })))
const MobilizeOverlay = lazy(() => import('./journey/mobilize/JourneyOverlay').then((module) => ({ default: module.MobilizeOverlay })))
const IndustryOverlay = lazy(() => import('./journey/industry/JourneyOverlay').then((module) => ({ default: module.IndustryOverlay })))

const SpaceJourneyOverlay = lazy(() => import('./journey/space/JourneyOverlay').then((module) => ({ default: module.SpaceJourneyOverlay })))

const TITLES: Record<JourneyId, { en: string; zh: string }> = {
  force: { en: 'Chapter I — Warring States', zh: '第一章：战国' },
  korea: { en: 'Resist US Aggression and Aid Korea', zh: '抗美援朝' },
  baseline2026: { en: '2026 Military Baseline', zh: '2026 军力基线' },
  mobilize: { en: 'Disaster Response and Mobilization', zh: '灾难应对与动员' },
  industry: { en: 'The Chassis: How Industry Sustains Military Power', zh: '底盘：工业实力对军力的支撑' },
  space: { en: 'Science & Spaceflight', zh: '科研航天' },
}

class GlobeBoundary extends Component<{ children: ReactNode; unavailable: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed
      ? (
          <div className="globe-fallback" role="status">
            {this.props.unavailable}
          </div>
        )
      : this.props.children
  }
}

function ActiveJourneyOverlay({ id }: { id: JourneyId | null }) {
  if (id === 'force') return <JourneyOverlay />
  if (id === 'baseline2026') return <Baseline2026Overlay />
  if (id === 'korea') return <KoreaJourneyOverlay />
  if (id === 'mobilize') return <MobilizeOverlay />
  if (id === 'industry') return <IndustryOverlay />
  if (id === 'space') return <SpaceJourneyOverlay />
  return null
}

export default function App() {
  const enterJourney = useAppJourney()
  const activeJourney = useJourney((store) => store.activeJourney)
  const language = useJourney((store) => store.language)
  const hubLocale = useJourney(s => s.hubLocale)
  const industryLanguage = useJourney(industryLocale)
  const baselineLocale = useJourney(selectBaselineLocale)
  const displayLocale = activeJourney === 'industry' ? industryLanguage
    : activeJourney === 'baseline2026' ? baselineLocale : activeJourney ? language : hubLocale
  const journeyFocus = useJourney((store) => store.focus)
  const canvasFocus = useMemo(
    () => journeyFocus ? { lat: journeyFocus.lat, lon: journeyFocus.lon } : undefined,
    [journeyFocus],
  )
  const journeyActive = activeJourney !== null

  useEffect(() => {
    document.documentElement.lang = localeTag(displayLocale)
    document.documentElement.dir = displayLocale === 'ar' ? 'rtl' : 'ltr'
    const titleLanguage = activeJourney === 'industry' || activeJourney === 'baseline2026'
      ? (displayLocale === 'en' ? 'en' : 'zh') : language
    document.title = activeJourney
      ? displayLocale === 'ja' && activeJourney === 'industry'
        ? '中国の軍事力 · 土台：産業が軍事力をどう支えるか'
        : displayLocale === 'ja' && activeJourney === 'baseline2026'
          ? '中国の軍事力 · 2026年の軍事力基準'
        : `${PROJECT_NAME[titleLanguage]} · ${TITLES[activeJourney][titleLanguage]}`
      : catalog[displayLocale].brand
  }, [activeJourney, displayLocale, language])

  return (
    <div className={`app-root${journeyActive ? ' is-journey' : ''}`} data-lang={displayLocale} data-journey={activeJourney ?? ''}>
      <JourneyHub active={!journeyActive} onEnter={enterJourney} />
      <GlobeBoundary unavailable={catalog[displayLocale].unavailable}><EarthCanvas focus={canvasFocus} journeyActive={journeyActive} /></GlobeBoundary>
      <Suspense fallback={null}>
        <ActiveJourneyOverlay id={activeJourney} />
      </Suspense>
    </div>
  )
}
