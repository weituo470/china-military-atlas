import { SourcesDialog } from '../SourcesDialog'
import { ParagraphNav } from '../ParagraphNav'
import { SourceText } from '../SourceText'
import { useMemo } from 'react'
import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { JourneyPlayer } from './JourneyPlayer'
import { JourneyCodex } from './JourneyCodex'
import { t, type JourneyLang } from '../types'
import { BEATS, CHANGPING, FORMATIONS, INSTITUTION_PANELS, SOURCE_SECTIONS, THEATERS, UI, WEAPONS } from './content'
import { BEAT_COUNT, CHANGPING_SITE, INSTITUTION_SITES, THEATER_SITES, WARRING_STATES_WINDOW } from './sites'

function siteNote(id: string, language: JourneyLang) {
  const site = THEATER_SITES[id] ?? INSTITUTION_SITES.find((item) => item.id === id) ?? (id === 'changping' || id === 'site' ? CHANGPING_SITE : undefined)
  return site ? t(site.precisionNote, language) : ''
}

export function JourneyOverlay() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney((store) => store.language)
  const setLanguage = useJourney((store) => store.setLanguage)
  const setBeat = useJourney((store) => store.setBeat)
  const advance = useJourney((store) => store.advance)
  const exitJourney = useJourney((store) => store.exitJourney)
  const selectedCardKind = useJourney((store) => store.selectedCardKind)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const closeCard = useJourney((store) => store.closeCard)
  const sourcesOpen = useJourney((store) => store.sourcesOpen)
  const toggleSources = useJourney((store) => store.toggleSources)
  const lockExploded = useJourney((store) => store.lockExploded)
  const setLockExploded = useJourney((store) => store.setLockExploded)
  const narrationStatus = useNarration((store) => store.status)

  const beat = BEATS[beatIndex] ?? BEATS[0]
  const card = useMemo(() => {
    if (!selectedCardKind || !selectedCardId) return null
    if (selectedCardKind === 'theater') {
      const theater = THEATERS.find((item) => item.id === selectedCardId)
      if (!theater) return null
      return { kicker: theater.kicker, title: theater.title, body: theater.body, note: theater.note, site: siteNote(theater.id, language) }
    }
    if (selectedCardKind === 'weapon') {
      const weapon = WEAPONS.find((item) => item.id === selectedCardId)
      if (!weapon) return null
      return { kicker: weapon.kicker, title: weapon.title, body: weapon.body, note: weapon.note, site: t({ en: 'Typological geometry, not a named excavated object.', zh: '类型学几何示意，不是某一件有名的出土器。' }, language) }
    }
    if (selectedCardKind === 'institution') {
      const panel = INSTITUTION_PANELS.find((item) => item.id === selectedCardId)
      if (!panel) return null
      return { kicker: { en: 'Institutions  ·  typological mark', zh: '制度  ·  类型学标记' }, title: panel.title, body: panel.body, note: INSTITUTION_SITES.find((item) => item.id === panel.id)?.precisionNote, site: siteNote(panel.id, language) }
    }
    if (selectedCardKind === 'formation') {
      const formation = FORMATIONS.find((item) => item.id === selectedCardId)
      if (!formation) return null
      return {
        kicker: { en: formation.kind === 'claim' ? 'Source claim  ·  not a muster' : 'Modern estimate  ·  1 block = 1,000', zh: formation.kind === 'claim' ? '文献记载  ·  非名册' : '现代估计  ·  一方块 = 1,000人' },
        title: formation.title,
        body: formation.caption,
        note: UI.blockLegend,
        site: '',
      }
    }
    if (selectedCardKind === 'changping') {
      return {
        kicker: { en: 'Changping  ·  260 BCE', zh: '长平  ·  前260年' },
        title: { en: 'A site, a narrative, and a caution', zh: '一处遗址，一则记载，一条审慎' },
        body: CHANGPING.facts[0]?.body,
        note: CHANGPING.facts[1]?.body,
        extra: CHANGPING.facts[2]?.body,
        site: t(CHANGPING_SITE.precisionNote, language),
      }
    }
    return null
  }, [language, selectedCardId, selectedCardKind])

  if (activeJourney !== 'force') return null

  return (
    <div className={`journey-shell${narrationStatus === 'playing' ? ' is-cinematic' : ''}`} data-journey-chapter="1" data-journey-beat={beat.id} lang={language === 'zh' ? 'zh-CN' : 'en'}>
      <div className="journey-top">
        <div className="journey-brand">
          <small>{t(UI.brandKicker, language)}  ·  {t(UI.brandTitle, language)}</small>
          <span>{language === 'zh' ? '约前475–前221年（亦有以迄前403年为始）' : 'c. 475–221 BCE  ·  403 BCE is a strong alternative start'}</span>
        </div>
        <div className="journey-toolbar">
          <a
            className="journey-text-button force-film-link"
            href={`${import.meta.env.BASE_URL}film/force/index.html?lang=${language}&beat=${beatIndex}`}
            onClick={() => {
              // Restore this beat even if the browser evicts the WebGL page from its back cache.
              const back = new URL(location.href)
              if (beatIndex || back.searchParams.has('beat')) {
                back.searchParams.set('beat', String(beatIndex))
                history.replaceState(history.state, '', back)
              }
              const player = useNarration.getState()
              if (player.status === 'playing') player.pause()
            }}
          >
            <span aria-hidden="true">▷</span> {language === 'zh' ? '高光 · 行军' : 'Film · The March'}
          </a>
          <div className="journey-lang" role="group" aria-label={t(UI.languageLabel, language)}>
            <button type="button" className={language === 'en' ? 'is-active' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>{UI.langEn}</button>
            <button type="button" className={language === 'zh' ? 'is-active' : ''} aria-pressed={language === 'zh'} onClick={() => setLanguage('zh')}>{UI.langZh}</button>
          </div>
          <button type="button" className="journey-text-button" onClick={() => toggleSources(true)}>{t(UI.sourcesBtn, language)}</button>
          <button type="button" className="journey-text-button" onClick={() => exitJourney()}>{t(UI.exit, language)}</button>
        </div>
      </div>

      <JourneyCodex />

      {card && (
        <article className="journey-card" aria-label={t(card.title, language)}>
          <header>
            <small>{t(card.kicker, language)}</small>
            <button type="button" onClick={closeCard} aria-label={t(UI.close, language)}>{t(UI.close, language)}</button>
          </header>
          <h2>{t(card.title, language)}</h2>
          <p>{t(card.body, language)}</p>
          {card.note && <blockquote>{t(card.note, language)}</blockquote>}
          {'extra' in card && card.extra && <p>{t(card.extra, language)}</p>}
          {card.site && <footer>{card.site}</footer>}
          {selectedCardKind === 'weapon' && selectedCardId === 'crossbow' && (
            <button type="button" className="journey-lock-button" onClick={() => setLockExploded(!lockExploded)}>
              {t(lockExploded ? UI.closeLock : UI.openLock, language)}
            </button>
          )}
        </article>
      )}

      <nav className="journey-progress" aria-label={language === 'zh' ? '章节进度' : 'Chapter progress'}>
        <ol>
          {BEATS.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={`${index === beatIndex ? 'is-active' : ''}${index === beatIndex && narrationStatus === 'playing' ? ' is-playing' : ''}`}
                onClick={() => setBeat(index)}
                aria-current={index === beatIndex ? 'step' : undefined}
              >
                <i>{index}</i>
                <span>{t(item.name, language)}</span>
              </button>
            </li>
          ))}
        </ol>
        <JourneyPlayer placement="progress" />
        <ParagraphNav />
        <div className="journey-progress-actions">
          <button type="button" onClick={() => advance(-1)} disabled={beatIndex <= 0} aria-label={language === 'zh' ? '上一段' : 'Previous beat'}>←</button>
          <button type="button" onClick={() => advance(1)} disabled={beatIndex >= BEAT_COUNT - 1} aria-label={language === 'zh' ? '下一段' : 'Next beat'}>{language === 'zh' ? '继续' : 'Next'} →</button>
        </div>
        <p className="journey-hints">{t(UI.hints, language)}</p>
        <p className="journey-window">
          {language === 'zh'
            ? `时间窗：前${Math.abs(WARRING_STATES_WINDOW.startYear)}–前${Math.abs(WARRING_STATES_WINDOW.endYear)}年`
            : `Window: ${Math.abs(WARRING_STATES_WINDOW.startYear)}–${Math.abs(WARRING_STATES_WINDOW.endYear)} BCE`}
        </p>
      </nav>

      {sourcesOpen && (
        <SourcesDialog titleId="journey-sources-title">
          <div className="journey-sources-panel">
            <header>
              <div>
                <small>{t(UI.sourcesKicker, language)}</small>
                <h2 id="journey-sources-title">{t(UI.sourcesTitle, language)}</h2>
              </div>
              <button type="button" onClick={() => toggleSources(false)}>{t(UI.close, language)}</button>
            </header>
            <div className="journey-sources-body">
              {SOURCE_SECTIONS.map((section) => (
                <section key={t(section.title, 'en')}>
                  <h3>{t(section.title, language)}</h3>
                  {section.paragraphs?.map((paragraph) => <p key={paragraph.en}><SourceText text={t(paragraph, language)} /></p>)}
                  {section.items && (
                    <ul>
                      {section.items.map((item) => <li key={item.en}><SourceText text={t(item, language)} /></li>)}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        </SourcesDialog>
      )}
    </div>
  )
}
