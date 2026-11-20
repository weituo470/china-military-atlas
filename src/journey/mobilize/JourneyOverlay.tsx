import { SourcesDialog } from '../SourcesDialog'
import { SourceText } from '../SourceText'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useJourney } from '../../store/journey'
import { t } from '../types'
import { BEATS, SOURCE_SECTIONS, UI, findMobilizeCard, type MobilizeCard, type SourceKind } from './content'
import { BEAT_COUNT, SITE_INDEX, focusForParagraph } from './sites'
import { MobilizeJourneyCodex } from './JourneyCodex'
import { MobilizeJourneyPlayer } from './JourneyPlayer'
import { JA_BEATS } from './jaBeats'
import { JA_CARDS, JA_SOURCES } from './jaRecords'
import { getMobilizeLanguage, localeTags, ml, tri, useMobilizeLanguage, type MobilizeLanguage } from './locale'
import { bindMobilizePlayback, changeMobilizeLanguage, readMobilizeClock, readMobilizeParagraph, useMobilizeMediaValue } from './playback'
import './mobilize.css'

export function MobilizeOverlay() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useMobilizeLanguage()
  const setBeat = useJourney((store) => store.setBeat)
  const advance = useJourney((store) => store.advance)
  const exitJourney = useJourney((store) => store.exitJourney)
  const selectedCardKind = useJourney((store) => store.selectedCardKind)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const closeCard = useJourney((store) => store.closeCard)
  const openCard = useJourney((store) => store.openCard)
  const sourcesOpen = useJourney((store) => store.sourcesOpen)
  const toggleSources = useJourney((store) => store.toggleSources)
  const narrationStatus = useMobilizeMediaValue('status')
  const paragraphIndex = useMobilizeMediaValue('paragraphIndex')
  const [showMap, setShowMap] = useState(false)
  const recordClose = useRef<HTMLButtonElement>(null)
  const recordOpener = useRef<HTMLElement | null>(null)
  const activeStep = useRef<HTMLButtonElement>(null)

  useEffect(() => { if (activeJourney === 'mobilize') return bindMobilizePlayback() }, [activeJourney])

  useEffect(() => {
    if (activeJourney !== 'mobilize') return
    // The application applies its bilingual default in a parent effect.
    queueMicrotask(() => {
      if (useJourney.getState().activeJourney !== 'mobilize' || getMobilizeLanguage() !== language) return
      document.documentElement.lang = localeTags[language]
      document.title = `${ml(UI.brandKicker, language, '中国の軍事力')} · ${ml(UI.brandTitle, language, '災害対応と動員')}`
    })
  }, [activeJourney, language])

  useEffect(() => {
    if (activeJourney !== 'mobilize') setShowMap(false)
  }, [activeJourney])

  useEffect(() => {
    const tab = activeStep.current
    const rail = tab?.closest('ol')
    if (!tab || !rail) return
    const a = tab.getBoundingClientRect()
    const b = rail.getBoundingClientRect()
    if (a.left < b.left) rail.scrollLeft += a.left - b.left - 4
    else if (a.right > b.right) rail.scrollLeft += a.right - b.right + 4
  }, [activeJourney, beatIndex])

  const beat = BEATS[beatIndex] ?? BEATS[0]
  const card = useMemo(() => {
    if (!selectedCardKind || !selectedCardId) return null
    const found = findMobilizeCard(selectedCardKind, selectedCardId)
    if (!found) return null
    const site = SITE_INDEX[selectedCardId]
    const ja = JA_CARDS[found.id]
    return {
      kicker: ml(found.kicker, language, ja.kicker),
      title: ml(found.title, language, ja.title),
      body: ml(found.body, language, ja.body),
      note: language === 'ja' ? ja.note : 'note' in found ? t(found.note, language) : undefined,
      sourceKind: found.sourceKind as SourceKind,
      site: site ? ml(site.precisionNote, language, 'ピンは現在の地図上の遺構または代表地点を示します。') : '',
    }
  }, [language, selectedCardId, selectedCardKind])
  const cardOpen = activeJourney === 'mobilize' && Boolean(card)

  useEffect(() => {
    if (!cardOpen) return
    const opener = recordOpener.current ?? document.activeElement
    recordClose.current?.focus({ preventScroll: true })
    return () => {
      recordOpener.current = null
      if (opener instanceof HTMLElement && opener.isConnected && !useJourney.getState().sourcesOpen) {
        opener.focus({ preventScroll: true })
      }
    }
  }, [cardOpen])

  if (activeJourney !== 'mobilize') return null

  const sourceLabels: Record<SourceKind, string> = {
    official: ml(UI.officialLabel, language, '公式発表'),
    estimate: ml(UI.estimateLabel, language, '外部推計'),
    typological: tri(language, '示意资料', 'Illustrative record', '模式資料'),
  }
  const sourceLabel = card ? sourceLabels[card.sourceKind] : ''
  const closeLabel = ml(UI.close, language, '閉じる')
  const paragraphCount = beat.narration.zh.length
  const sources = !sourcesOpen ? [] : language === 'ja' ? JA_SOURCES : SOURCE_SECTIONS.map((section) => ({
    title: t(section.title, language),
    paragraphs: 'paragraphs' in section ? section.paragraphs.map((paragraph) => t(paragraph, language)) : undefined,
    items: 'items' in section ? section.items.map((item) => t(item, language)) : undefined,
  }))

  const inspectRecord = (record: MobilizeCard, opener: HTMLButtonElement) => {
    recordOpener.current = opener
    openCard(record.kind, record.id, focusForParagraph(beatIndex, readMobilizeClock().paragraphIndex))
  }

  return (
    <div
      className={`journey-shell mobilize-shell${narrationStatus === 'playing' ? ' is-cinematic' : ''}`}
      data-journey-chapter="mobilize"
      data-journey-beat={beat.id}
      data-view={showMap ? 'map' : 'folio'}
      lang={localeTags[language]}
    >
      <div className="journey-top">
        <div className="journey-brand">
          <small>{ml(UI.brandKicker, language, '中国の軍事力')}</small>
          <strong>{ml(UI.brandTitle, language, '災害対応と動員')}</strong>
        </div>
        <div className="journey-toolbar">
          <div className="journey-lang" role="group" aria-label={ml(UI.languageLabel, language, '言語')}>
            {([['zh', '中文'], ['en', 'EN'], ['ja', '日本語']] as const satisfies readonly (readonly [MobilizeLanguage, string])[]).map(([locale, label]) => (
              <button type="button" key={locale} lang={localeTags[locale]}
                className={language === locale ? 'is-active' : ''} aria-pressed={language === locale}
                onClick={() => changeMobilizeLanguage(locale)}>{label}</button>
            ))}
          </div>
          <button type="button" className="journey-text-button mobilize-view-toggle"
            aria-pressed={showMap} onClick={() => { closeCard(); setShowMap(!showMap) }}>
            {tri(language, '地球视图', 'Globe view', '地球儀')}
          </button>
          <button type="button" className="journey-text-button" onClick={() => toggleSources(true)}>{ml(UI.sourcesBtn, language, '出典と注記')}</button>
          <button type="button" className="journey-text-button" aria-label={ml(UI.exit, language, '案内を終了')}
            onClick={() => exitJourney()}>{tri(language, '退出', 'Exit', '終了')}</button>
        </div>
      </div>

      <MobilizeJourneyCodex showMap={showMap} onInspect={inspectRecord} />

      {card && (
        <aside className="journey-card" id="mobilize-record" aria-labelledby="mobilize-record-title">
          <header>
            <small>{card.kicker}</small>
            <button ref={recordClose} type="button" onClick={closeCard}>{closeLabel}</button>
          </header>
          <span className={`source-tag is-${card.sourceKind}`}>{sourceLabel}</span>
          <h2 id="mobilize-record-title">{card.title}</h2>
          <p>{card.body}</p>
          {card.note && <blockquote>{card.note}</blockquote>}
          {card.site && <footer>{card.site}</footer>}
        </aside>
      )}

      <nav className="journey-progress" aria-label={tri(language, '章节进度', 'Chapter progress', '章の進行')}>
        <ol>
          {BEATS.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={`${index === beatIndex ? 'is-active' : ''}${index === beatIndex && narrationStatus === 'playing' ? ' is-playing' : ''}`}
                onClick={() => setBeat(index)}
                aria-current={index === beatIndex ? 'step' : undefined}
                ref={index === beatIndex ? activeStep : undefined}
              >
                <i>{index}</i>
                <span>{ml(item.name, language, JA_BEATS[item.id].name)}</span>
              </button>
            </li>
          ))}
        </ol>
        <MobilizeJourneyPlayer />
        <div className="paragraph-reader">
          <div role="group" aria-label={tri(language, '静音阅读', 'Silent reading', '段落を読む')}>
            <button type="button" disabled={!paragraphIndex} onClick={() => readMobilizeParagraph(paragraphIndex - 1)}>
              {tri(language, '上一小段', 'Previous paragraph', '前の段落')}
            </button>
            <span>{paragraphIndex + 1} / {paragraphCount}</span>
            <button type="button" disabled={paragraphIndex >= paragraphCount - 1} onClick={() => readMobilizeParagraph(paragraphIndex + 1)}>
              {tri(language, '下一小段', 'Next paragraph', '次の段落')}
            </button>
          </div>
        </div>
        <div className="journey-progress-actions">
          <button type="button" onClick={() => advance(-1)} disabled={beatIndex <= 0} aria-label={tri(language, '上一段', 'Previous beat', '前の章')}>←</button>
          <button type="button" onClick={() => advance(1)} disabled={beatIndex >= BEAT_COUNT - 1} aria-label={tri(language, '下一段', 'Next beat', '次の章')}>→</button>
        </div>
      </nav>

      {sourcesOpen && (
        <SourcesDialog titleId="mobilize-sources-title">
          <div className="journey-sources-panel">
            <header>
              <div>
                <small>{ml(UI.sourcesKicker, language, '読者と案内役のための資料')}</small>
                <h2 id="mobilize-sources-title">{ml(UI.sourcesTitle, language, '出典と注記事項')}</h2>
              </div>
              <button type="button" onClick={() => toggleSources(false)}>{closeLabel}</button>
            </header>
            <div className="journey-sources-body">
              {sources.map((section) => (
                <section key={section.title}>
                  <h3>{section.title}</h3>
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}><SourceText text={paragraph} /></p>)}
                  {section.items && (
                    <ul>
                      {section.items.map((item) => <li key={item}><SourceText text={item} /></li>)}
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
