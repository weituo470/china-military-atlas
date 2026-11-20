import { useEffect, useRef, type MouseEvent } from 'react'
import { isLongMarchReturn, journeyHref, longMarchHref, type HubJourneyId } from '../../journey/routes'
import { useJourney } from '../../store/journey'
import type { JourneyId } from '../../journey/types'
import { PROJECT_NAME } from '../../brand'
import { EventRecord } from './EventRecord'
import openings from './tour/opening.json'
import { LanguagePicker } from './LanguagePicker'
import { catalog } from './i18n'
import { journeys, localeTag } from './i18n/locales'
import './hub.css'

function OrbitMark() {
  return <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" aria-hidden="true">
    <circle cx="18" cy="18" r="12" /><ellipse cx="18" cy="18" rx="18" ry="5" transform="rotate(-35 18 18)" />
    <path d="M18 6c-6 5-6 17 0 24M18 6c6 5 6 17 0 24" opacity=".65" />
  </svg>
}

export function JourneyHub({ active, onEnter }: { active: boolean; onEnter: (id: JourneyId) => void }) {
  const locale = useJourney(s => s.hubLocale)
  const select = useJourney(s => s.setHubLocale)
  const lastExit = useJourney(s => s.lastExitedJourney)
  const panel = useRef<HTMLElement>(null)
  const origin = useRef<HTMLAnchorElement | null>(null)
  const copy = catalog[locale]
  const subtitleLang = locale === 'zh' ? 'en' : 'zh'
  useEffect(() => {
    if (active && lastExit) {
      const link = origin.current?.dataset.journeyLink === lastExit ? origin.current : panel.current?.querySelector<HTMLAnchorElement>(`[data-door="${lastExit}"]`)
      link?.focus()
    } else if (active && isLongMarchReturn(location.hash)) {
      panel.current?.querySelector<HTMLAnchorElement>('[data-door="longmarch"]')?.focus()
    }
  }, [active, lastExit])
  const href = (id: HubJourneyId) => id === 'longmarch' ? longMarchHref(locale === 'zh' ? 'zh' : 'en') : journeyHref(id)
  const enter = (event: MouseEvent<HTMLAnchorElement>, id: HubJourneyId) => {
    // The self-contained Long March uses normal document navigation. Modifier
    // clicks and new tabs use real URLs for all guides.
    if (id === 'longmarch' || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    origin.current = event.currentTarget
    if (locale !== 'zh' && locale !== 'en') useJourney.getState().setLanguage('en')
    onEnter(id)
  }
  const opening=openings[locale]
  return <main ref={panel} className="atlas-hub" inert={!active} hidden={!active} lang={localeTag(locale)} dir={locale === 'ar' ? 'rtl' : 'ltr'} aria-labelledby="atlas-title">
    <div className="atlas-frame">
      <header className="atlas-mast">
        <div className="atlas-signature"><OrbitMark /><span>{copy.brand}</span><i /><small className="atlas-header-type">{copy.exhibition}</small></div>
        {active && <LanguagePicker locale={locale} copy={copy} select={select} />}
      </header>
      <div className="atlas-stage">
        <section className="atlas-prologue">
          <div className="atlas-eyebrow"><i />{copy.prologue}</div>
          <h1 id="atlas-title">{copy.brand}</h1>
          <div className="atlas-intro-line">
            <div className="atlas-subtitle" lang={localeTag(subtitleLang)}>{PROJECT_NAME[subtitleLang]}</div>
            <button type="button" className="atlas-jump" onClick={() => panel.current?.querySelector<HTMLAnchorElement>('[data-door]')?.focus()}>{copy.skip} ↓</button>
          </div>
          <div id="atlas-opening" className="atlas-opening">
            {opening.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
          </div>
          <nav className="atlas-shortcuts" aria-label={copy.journeys}>
            {journeys.map(id => <a key={id} data-journey-link={id} href={href(id)} onClick={e=>enter(e,id)}>{copy.doors[id].short}</a>)}
          </nav>
          <EventRecord copy={copy} locale={locale} selected="opening" step={0} />
        </section>
        <div className="atlas-plate" aria-hidden="true"><i />TERRA <span>/</span> 01</div>
      </div>
      <section className="atlas-editorial" aria-labelledby="atlas-question">
        <header>
          <div className="atlas-eyebrow"><i />{copy.author}</div>
          <h2 id="atlas-question">{copy.question}</h2>
        </header>
        <div className="atlas-statement">
          <p><strong>{copy.lead}</strong>{' '}{copy.argument}</p>
          <p>{copy.motive}{' '}<strong>{copy.conclusion}</strong></p>
        </div>
      </section>
      <nav className="atlas-directory" aria-labelledby="atlas-index-title">
        <div className="atlas-index-head"><h2 id="atlas-index-title">{copy.journeys}</h2><i /><b dir="ltr">01 — {String(journeys.length).padStart(2,'0')}</b></div>
        <p className="atlas-guide-note">{copy.guideNotice}</p>
        <div className="atlas-doors">{journeys.map((id, i) => {
          const door = copy.doors[id]
          return <a key={id} className="atlas-door" id={`atlas-door-${id}`} href={href(id)} data-door={id} data-journey-link={id} aria-labelledby={`door-${id}`} aria-describedby={`info-${id}`} onClick={e => enter(e,id)}>
            <span className="atlas-door-cap"><b>0{i+1}</b><span>{door.period}</span><i aria-hidden="true">↗</i></span>
            <strong className="atlas-door-title" id={`door-${id}`}>{door.title}</strong>
            <span className="atlas-detail" id={`info-${id}`}>{door.detail}</span>
          </a>
        })}</div>
      </nav>
    </div>
  </main>
}
