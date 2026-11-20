import { SourcesDialog } from '../SourcesDialog'
import { SourceText } from '../SourceText'
import { useEffect, useMemo, useState } from 'react'
import { useJourney } from '../../store/journey'
import { findKoreaCard } from './content'
import { COPY, KOREA_BEATS, tr } from './locales'
import { JA_CARDS, KOREA_SOURCES } from './reference-ja'
import { chooseKoreaLanguage, readKoreaParagraph, useBindKoreaAudio, useKoreaLanguage, useKoreaParagraph, useKoreaStatus } from './playback'
import { BEAT_COUNT, SITE_INDEX } from './sites'
import { KoreaJourneyCodex } from './JourneyCodex'
import { KoreaJourneyPlayer } from './JourneyPlayer'
import { MAP_SOURCES, words } from './atlas/stages'
import { cartographyNote } from './atlas/FrontAtlas'
import './korea.css'

export function KoreaJourneyOverlay() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useKoreaLanguage()
  const setBeat = useJourney((store) => store.setBeat)
  const advance = useJourney((store) => store.advance)
  const exitJourney = useJourney((store) => store.exitJourney)
  const selectedCardKind = useJourney((store) => store.selectedCardKind)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const closeCard = useJourney((store) => store.closeCard)
  const sourcesOpen = useJourney((store) => store.sourcesOpen)
  const toggleSources = useJourney((store) => store.toggleSources)
  const narrationStatus = useKoreaStatus()
  const paragraph = useKoreaParagraph()
  const [wide,setWide] = useState(() => new URLSearchParams(window.location.search).get('atlas') === 'wide')
  useBindKoreaAudio()
  // A link to a plate opens in reading mode, without starting the recording.
  useEffect(() => {
    if (activeJourney !== 'korea') return
    const match = /^0([1-7])\.([1-3])$/.exec(new URLSearchParams(window.location.search).get('section') ?? '')
    if (!match) return
    setBeat(Number(match[1]) - 1)
    readKoreaParagraph(Number(match[2]) - 1)
  }, [activeJourney, setBeat])

  const beat = KOREA_BEATS[beatIndex] ?? KOREA_BEATS[0]
  const count = beat.reading.length
  const card = useMemo(() => {
    if (!selectedCardKind || !selectedCardId) return null
    const found = findKoreaCard(selectedCardKind, selectedCardId)
    if (!found) return null
    const site = SITE_INDEX[selectedCardId]
    const [kicker, title, body, note] = JA_CARDS[found.id]
    return {
      kicker: { ...found.kicker, ja: kicker },
      title: { ...found.title, ja: title },
      body: { ...found.body, ja: body },
      note: 'note' in found ? { ...found.note, ja: note } : undefined,
      site: site ? tr({ ...site.precisionNote, ja: COPY.coordinateCaution.ja }, language) : '',
    }
  }, [language, selectedCardId, selectedCardKind])

  if (activeJourney !== 'korea') return null

  return (
    <div
      className={`journey-shell korea-shell${narrationStatus === 'playing' ? ' is-cinematic' : ''}${wide?' ka-wide':''}`}
      data-journey-chapter="korea"
      data-journey-beat={beat.id}
      lang={language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : 'en'}
    >
      <div className="journey-top">
        <div className="journey-brand">
          <small>{tr(COPY.brandKicker, language)}  ·  {tr(COPY.brandTitle, language)}</small>
          <span title={tr(COPY.coordinateCaution, language)}>{tr(COPY.coords, language)}</span>
        </div>
        <div className="journey-toolbar">
          <div className="journey-lang" role="group" aria-label={tr(COPY.languageLabel, language)}>
            {([['zh', '中文', 'zh-CN'], ['en', 'English', 'en'], ['ja', '日本語', 'ja-JP']] as const).map(([id, label, tag]) => (
              <button key={id} type="button" lang={tag} className={language === id ? 'is-active' : ''}
                aria-pressed={language === id} onClick={() => chooseKoreaLanguage(id)}>{label}</button>
            ))}
          </div>
          <button type="button" className="journey-text-button" onClick={() => toggleSources(true)}>{tr(COPY.sourcesBtn, language)}</button>
          <button type="button" className="journey-text-button" onClick={() => exitJourney()}>{tr(COPY.exit, language)}</button>
        </div>
      </div>

      <KoreaJourneyCodex wide={wide} onWide={()=>setWide(!wide)}/>

      {card && (
        <article className="journey-card" aria-label={tr(card.title, language)}>
          <header>
            <small>{tr(card.kicker, language)}</small>
            <button type="button" onClick={closeCard} aria-label={tr(COPY.close, language)}>{tr(COPY.close, language)}</button>
          </header>
          <h2>{tr(card.title, language)}</h2>
          <p>{tr(card.body, language)}</p>
          {card.note && <blockquote>{tr(card.note, language)}</blockquote>}
          {card.site && <footer>{card.site}</footer>}
        </article>
      )}

      <nav className="journey-progress" aria-label={tr(COPY.chapterProgress, language)}>
        <ol>
          {KOREA_BEATS.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={`${index === beatIndex ? 'is-active' : ''}${index === beatIndex && narrationStatus === 'playing' ? ' is-playing' : ''}`}
                onClick={() => setBeat(index)}
                aria-current={index === beatIndex ? 'step' : undefined}
              >
                <i>{index}</i>
                <span>{tr(item.name, language)}</span>
              </button>
            </li>
          ))}
        </ol>
        <KoreaJourneyPlayer />
        <div className="paragraph-reader">
          <div role="group" aria-label={tr(COPY.reader, language)}>
            <button type="button" disabled={!paragraph} onClick={() => readKoreaParagraph(paragraph - 1)}>{tr(COPY.previousParagraph, language)}</button>
            <span>{paragraph + 1} / {count}</span>
            <button type="button" disabled={paragraph >= count - 1} onClick={() => readKoreaParagraph(paragraph + 1)}>{tr(COPY.nextParagraph, language)}</button>
          </div>
        </div>
        <div className="journey-progress-actions">
          <button type="button" onClick={() => advance(-1)} disabled={beatIndex <= 0} aria-label={tr(COPY.previousBeat, language)}>←</button>
          <button type="button" onClick={() => advance(1)} disabled={beatIndex >= BEAT_COUNT - 1} aria-label={tr(COPY.nextBeat, language)}>{tr(COPY.next, language)} →</button>
        </div>
        <p className="journey-hints">{tr(COPY.hints, language)}</p>
        <p className="journey-window">
          {tr(COPY.timeWindow, language)}
        </p>
      </nav>

      {sourcesOpen && (
        <SourcesDialog titleId="korea-sources-title">
          <div className="journey-sources-panel">
            <header>
              <div>
                <small>{tr(COPY.sourcesKicker, language)}</small>
                <h2 id="korea-sources-title">{tr(COPY.sourcesTitle, language)}</h2>
              </div>
              <button type="button" onClick={() => toggleSources(false)}>{tr(COPY.close, language)}</button>
            </header>
            <div className="journey-sources-body">
              <section>
                <h3>{words('战线图的读法与出处','How to read the front lines','戦線図の読み方と出典')[language]}</h3>
                <p>{cartographyNote[language]}</p>
                <ul>{MAP_SOURCES.map(([name,url])=><li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{name[language]}</a></li>)}</ul>
              </section>
              <section>
                <h3>{words('关于图文与原声','About the text and audio','本文と音声について')[language]}</h3>
                <p>{COPY.audioEdition[language]}</p>
                <ul>
                  <li><a href="https://ask.un.org/faq/320138" target="_blank" rel="noreferrer">{words('联合国：1971年的中国代表权决议','United Nations: the 1971 representation resolution','国連：1971年の中国代表権に関する決議')[language]}</a></li>
                  <li><a href="https://history.state.gov/milestones/1945-1952/japan-reconstruction" target="_blank" rel="noreferrer">{words('美国国务院史料：战时的日本与对日和约','US diplomatic history: Japan and the peace treaty','米国務省史料：戦時下の日本と対日講和')[language]}</a></li>
                  <li><a href="https://www.archives.gov/milestone-documents/armistice-agreement-restoration-south-korean-state" target="_blank" rel="noreferrer">{words('美国国家档案馆：停战协定原文','US National Archives: text of the armistice','米国立公文書館：休戦協定の原文')[language]}</a></li>
                </ul>
              </section>
              {KOREA_SOURCES.map(section => (
                <section key={section.title.en}>
                  <h3>{tr(section.title, language)}</h3>
                  {section.isList ? (
                    <ul>{section.entries.map(item => <li key={item.en}><SourceText text={tr(item, language)} /></li>)}</ul>
                  ) : section.entries.map(item => <p key={item.en}><SourceText text={tr(item, language)} /></p>)}
                </section>
              ))}
            </div>
          </div>
        </SourcesDialog>
      )}
    </div>
  )
}

