import { useRef, useState } from 'react'
import { SourcesDialog } from '../SourcesDialog'
import { SourceText } from '../SourceText'
import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { JourneyPlayer } from './JourneyPlayer'
import { JourneyCodex } from './JourneyCodex'
import { Screening, screeningLabel } from './highlight/Screening'
import { industryLocale, LANG_TAG, phrase, t } from './locale'
import { BEATS, narrationForBeat, SOURCE_SECTIONS, UI } from './content'
import { BEAT_COUNT, WINDOW } from './sites'

export function IndustryOverlay() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney(industryLocale)
  const setLanguage = useJourney((store) => store.setIndustryLanguage)
  const setBeat = useJourney((store) => store.setBeat)
  const advance = useJourney((store) => store.advance)
  const exitJourney = useJourney((store) => store.exitJourney)
  const sourcesOpen = useJourney((store) => store.sourcesOpen)
  const toggleSources = useJourney((store) => store.toggleSources)
  const narrationStatus = useNarration((store) => store.status)
  const [inspection, setInspection] = useState<'sources' | 'film'>('sources')
  const filmButton = useRef<HTMLButtonElement>(null)

  // The app's window-capture keyboard handler and narration both honour this
  // inspection gate. Escape dismisses the active dialog, not the whole journey.
  const openInspection = (kind: 'sources' | 'film') => {
    if (kind === 'film') useNarration.getState().pause()
    setInspection(kind)
    toggleSources(true)
  }

  const paragraph = useNarration((store) => store.paragraphIndex)
  const readParagraph = useNarration((store) => store.readParagraph)
  const beat = BEATS[beatIndex] ?? BEATS[0]
  const count = narrationForBeat(beatIndex, language, false).length

  if (activeJourney !== 'industry') return null

  return (
    <div
      className={`journey-shell industry-shell${narrationStatus === 'playing' ? ' is-cinematic' : ''}`}
      data-journey-chapter="industry"
      data-journey-beat={beat.id}
      lang={LANG_TAG[language]}
    >
      <div className="journey-top">
        <div className="journey-brand">
          <small>{t(UI.brandKicker, language)}  ·  {t(UI.brandTitle, language)}</small>
          <span>{t(UI.brandWindow, language)}</span>
        </div>
        <div className="journey-toolbar">
          <div className="journey-lang" role="group" aria-label={t(UI.languageLabel, language)}>
            {([['zh', '中文'], ['en', 'English'], ['ja', '日本語']] as const).map(([locale, label]) => (
              <button type="button" key={locale} lang={LANG_TAG[locale]}
                className={language === locale ? 'is-active' : ''}
                aria-pressed={language === locale}
                onClick={() => setLanguage(locale)}
              >{label}</button>
            ))}
          </div>
          <button ref={filmButton} type="button" className="journey-text-button industry-film-trigger"
            aria-haspopup="dialog" onClick={() => openInspection('film')}>
            <svg aria-hidden="true" width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><path d="M2 1.5v9L10 6z" /></svg>
            {screeningLabel(language)}
          </button>
          <button type="button" className="journey-text-button" onClick={() => openInspection('sources')}>{t(UI.sourcesBtn, language)}</button>
          <button type="button" className="journey-text-button" onClick={() => exitJourney()}>{t(UI.exit, language)}</button>
        </div>
      </div>

      <JourneyCodex />

      <nav className="journey-progress" aria-label={phrase(language, '章节进度', 'Chapter progress', '章の進行')}>
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
        <div className="paragraph-reader">
          <div role="group" aria-label={phrase(language, '静音阅读', 'Silent reading', '音声なしで読む')}>
            <button type="button" disabled={paragraph === 0} onClick={() => readParagraph(paragraph - 1)}>
              {phrase(language, '上一小段', 'Previous paragraph', '前の段落')}
            </button>
            <span>{paragraph + 1} / {count}</span>
            <button type="button" disabled={paragraph + 1 >= count} onClick={() => readParagraph(paragraph + 1)}>
              {phrase(language, '下一小段', 'Next paragraph', '次の段落')}
            </button>
          </div>
        </div>
        <div className="journey-progress-actions">
          <button type="button" onClick={() => advance(-1)} disabled={beatIndex <= 0} aria-label={phrase(language, '上一段', 'Previous beat', '前の章')}>←</button>
          <button type="button" onClick={() => advance(1)} disabled={beatIndex >= BEAT_COUNT - 1} aria-label={phrase(language, '下一段', 'Next beat', '次の章')}>{phrase(language, '继续', 'Next', '次へ')} →</button>
        </div>
        <p className="journey-hints">{t(UI.hints, language)}</p>
        <p className="journey-window">
          {phrase(language, `时间窗随段落而变  ·  现窗可至 ${WINDOW.present}`, `The time window follows the beat  ·  present cursor ${WINDOW.present}`, `時間範囲は章に連動  ·  現代の基準日 ${WINDOW.present}`)}
        </p>
      </nav>

      {sourcesOpen && inspection === 'film' && (
        <Screening language={language} triggerRef={filmButton} onDismiss={() => toggleSources(false)} />
      )}
      {sourcesOpen && inspection === 'sources' && (
        <SourcesDialog titleId="industry-sources-title">
          <div className="journey-sources-panel">
            <header>
              <div>
                <small>{t(UI.sourcesKicker, language)}</small>
                <h2 id="industry-sources-title">{t(UI.sourcesTitle, language)}</h2>
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

export { IndustryOverlay as JourneyOverlay }
