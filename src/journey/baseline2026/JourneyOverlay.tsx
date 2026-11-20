import { SourcesDialog } from '../SourcesDialog'
import { SourceText } from '../SourceText'
import { useMemo } from 'react'
import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { JourneyPlayer } from './JourneyPlayer'
import { JourneyCodex } from './JourneyCodex'
import { FleetControls, RestoreFleetControls } from './atlas/FleetControls'
import { useAtlas } from './atlas/visit'
import { FleetPinOverlay } from './atlas/FleetPins'
import { atlasIds, fleetCatalog, words } from './atlas/catalog'
import { photoSources } from './atlas/photoSources'
import type { Localized } from '../types'
import { selectBaselineLocale, t, tags, tri, type BaselineLocale } from './locale'
import { UI, beatName, beatLines, japaneseCards } from './locale-copy'
import { JAPANESE_SOURCE_SECTIONS } from './sources-ja'
import {
  BEATS,
  DOCTRINE_CARDS,
  ESTIMATE_CARDS,
  INDUSTRY_CARDS,
  INTERFACE_CARDS,
  PLATFORM_CARDS,
  REVIEW_CARDS,
  SOURCE_SECTIONS,
  THEATER_CARDS,
} from './content'
import {
  BASELINE_WINDOW,
  BEAT_COUNT,
  DOCTRINE_SITE,
  INDUSTRY_SITES,
  KOREA_INTERFACE_SITE,
  PLATFORM_SITES,
  COMPARISON_SITES,
  REVIEW_SITES,
  THEATER_SITES,
  REVIEW_GROUND_SITE,
} from './sites'



function siteNote(id: string, language: BaselineLocale) {
  if (language === 'ja') return '' // Regional cautions are included in the Japanese card notes.
  const site = THEATER_SITES[id]
    ?? INDUSTRY_SITES[id]
    ?? PLATFORM_SITES[id]
    ?? COMPARISON_SITES[id]
    ?? REVIEW_SITES[id as keyof typeof REVIEW_SITES]
    ?? (id === REVIEW_GROUND_SITE.id ? REVIEW_GROUND_SITE : undefined)
    ?? (id === DOCTRINE_SITE.id ? DOCTRINE_SITE : undefined)
    ?? (id === KOREA_INTERFACE_SITE.id ? KOREA_INTERFACE_SITE : undefined)
  return site ? t(site.precisionNote, language) : ''
}

type CardView = {
  kicker: Localized
  title: Localized
  body?: Localized
  note?: Localized
  site?: string
}

export function Baseline2026Overlay() {
  const atlasMode=useAtlas(s=>s.ready?s.mode:undefined)
  const atlasClean=useAtlas(s=>s.clean)
  const activeJourney = useJourney((store) => store.activeJourney)
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney(selectBaselineLocale)
  const setLanguage = useJourney((store) => store.setBaselineLocale)
  const setBeat = useJourney((store) => store.setBeat)
  const advance = useJourney((store) => store.advance)
  const exitJourney = useJourney((store) => store.exitJourney)
  const selectedCardKind = useJourney((store) => store.selectedCardKind)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const closeCard = useJourney((store) => store.closeCard)
  const sourcesOpen = useJourney((store) => store.sourcesOpen)
  const toggleSources = useJourney((store) => store.toggleSources)
  const narrationStatus = useNarration((store) => store.status)
  const paragraphIndex = useNarration((store) => store.paragraphIndex)
  const readParagraph = useNarration((store) => store.readParagraph)
  const pending = useNarration((store) => store.manifest?.beats[beatIndex]?.paragraphs[paragraphIndex]?.pendingRecording)

  const beat = BEATS[beatIndex] ?? BEATS[0]
  const count = beatLines(beat, language).length
  const jaCard = language === 'ja' && selectedCardId ? japaneseCards[selectedCardId] : undefined
  const copy = (zh: string, en: string, ja: string) => tri(language, zh, en, ja)
  const card = useMemo<CardView | null>(() => {
    if (!selectedCardKind || !selectedCardId) return null
    if (selectedCardKind === 'theater') {
      const theater = THEATER_CARDS.find((item) => item.id === selectedCardId)
      if (!theater) return null
      return { kicker: theater.kicker, title: theater.title, body: theater.body, note: theater.note, site: siteNote(theater.id, language) }
    }
    if (selectedCardKind === 'platform') {
      const platform = PLATFORM_CARDS.find((item) => item.id === selectedCardId)
        ?? INDUSTRY_CARDS.find((item) => item.id === selectedCardId)
        ?? REVIEW_CARDS.find((item) => item.id === selectedCardId)
      if (!platform) return null
      return { kicker: platform.kicker, title: platform.title, body: platform.body, note: platform.note, site: siteNote(platform.id, language) }
    }
    if (selectedCardKind === 'estimate') {
      const estimate = ESTIMATE_CARDS.find((item) => item.id === selectedCardId)
      if (!estimate) return null
      return { kicker: estimate.kicker, title: estimate.title, body: estimate.body, note: estimate.note, site: siteNote(estimate.id, language) }
    }
    if (selectedCardKind === 'doctrine') {
      if (selectedCardId === 'korea-interface') {
        const item = INTERFACE_CARDS[0]
        return { kicker: item.kicker, title: item.title, body: item.body, note: item.note, site: siteNote(item.id, language) }
      }
      const doctrine = DOCTRINE_CARDS.find((item) => item.id === selectedCardId)
      if (!doctrine) return null
      return { kicker: doctrine.kicker, title: doctrine.title, body: doctrine.body, note: doctrine.note, site: siteNote(doctrine.id, language) }
    }
    return null
  }, [language, selectedCardId, selectedCardKind])

  if (activeJourney !== 'baseline2026') return null

  return (
    <div className={`journey-shell baseline-shell${narrationStatus === 'playing' ? ' is-cinematic' : ''}`} data-journey-chapter="baseline2026" data-journey-beat={beat.id} data-atlas-mode={beat.id==='review'?atlasMode:undefined} data-atlas-clean={beat.id==='review'&&atlasClean||undefined} lang={tags[language]}>
      <div className="journey-top">
        <div className="journey-brand">
          <small>{t(UI.brandKicker, language)}  ·  {t(UI.brandTitle, language)}</small>
          <span>{t(UI.brandWindow, language)}</span>
        </div>
        <div className="journey-toolbar">
          <div className="journey-lang" role="group" aria-label={t(UI.languageLabel, language)}>
            {([['en', 'English'], ['zh', '中文'], ['ja', '日本語']] as const).map(([locale, label]) => (
              <button key={locale} type="button" lang={tags[locale]} className={language === locale ? 'is-active' : ''} aria-pressed={language === locale} onClick={() => setLanguage(locale)}>{label}</button>
            ))}
          </div>
          <button type="button" className="journey-text-button" onClick={() => toggleSources(true)}>{t(UI.sourcesBtn, language)}</button>
          <button type="button" className="journey-text-button" onClick={() => exitJourney()}>{t(UI.exit, language)}</button>
        </div>
        <p className="baseline-globe-unavailable" role="status">
          {copy('三维地球不可用，仍可阅读图文和出处。', 'The 3D globe is unavailable. Text and sources are still available.', '三次元地球儀を表示できません。本文と出典は引き続き読めます。')}
        </p>
      </div>

      <JourneyCodex />
      {beat.id==='review'&&<FleetPinOverlay language={language}/>}
      {beat.id==='review'&&<RestoreFleetControls language={language}/>}

      {card && (
        <article className={`journey-card baseline-card${selectedCardKind === 'estimate' ? ' is-estimate' : ''}`} aria-label={jaCard?.[1] ?? t(card.title, language)}>
          <header>
            <small>{jaCard?.[0] ?? t(card.kicker, language)}</small>
            <button type="button" onClick={closeCard} aria-label={t(UI.close, language)}>{t(UI.close, language)}</button>
          </header>
          <h2>{jaCard?.[1] ?? t(card.title, language)}</h2>
          {card.body && <p>{jaCard?.[2] ?? t(card.body, language)}</p>}
          {card.note && <blockquote>{jaCard?.[3] ?? t(card.note, language)}</blockquote>}
          {card.site && <footer>{card.site}</footer>}
        </article>
      )}

      <nav className="journey-progress" aria-label={copy('章节进度', 'Chapter progress', '章の進み具合')}>
        {beat.id==='review'&&<FleetControls language={language}/>}
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
                <span>{beatName(item, language)}</span>
              </button>
            </li>
          ))}
        </ol>
        <JourneyPlayer />
        <div className="paragraph-reader">
          <div role="group" aria-label={copy('静音阅读', 'Silent reading', '音声なしで読む')}>
            <button type="button" disabled={!paragraphIndex} onClick={() => readParagraph(paragraphIndex - 1)}>{copy('上一小段', 'Previous paragraph', '前の段落')}</button>
            <span>{paragraphIndex + 1} / {count}</span>
            <button type="button" disabled={paragraphIndex >= count - 1} onClick={() => readParagraph(paragraphIndex + 1)}>{copy('下一小段', 'Next paragraph', '次の段落')}</button>
          </div>
          {pending && language === 'zh' && <p>本小段以修订文字为准，录音待更新。</p>}
        </div>
        <div className="journey-progress-actions">
          <button type="button" onClick={() => advance(-1)} disabled={beatIndex <= 0} aria-label={copy('上一段', 'Previous beat', '前の章')}>←</button>
          <button type="button" onClick={() => advance(1)} disabled={beatIndex >= BEAT_COUNT - 1} aria-label={copy('下一段', 'Next beat', '次の章')}>{copy('继续', 'Next', '次へ')} →</button>
        </div>
        <p className="journey-hints">{t(UI.hints, language)}</p>
        <p className="journey-window">
          {copy(`时间窗：${BASELINE_WINDOW.year} 年`, `Window: ${BASELINE_WINDOW.year}`, `対象年：${BASELINE_WINDOW.year}年`)}
        </p>
      </nav>

      {sourcesOpen && (
        <SourcesDialog titleId="baseline-sources-title">
          <div className="journey-sources-panel">
            <header>
              <div>
                <small>{t(UI.sourcesKicker, language)}</small>
                <h2 id="baseline-sources-title">{t(UI.sourcesTitle, language)}</h2>
              </div>
              <button type="button" onClick={() => toggleSources(false)}>{t(UI.close, language)}</button>
            </header>
            <div className="journey-sources-body">
              {beat.id==='review'&&<section>
                <h3>{copy('舰艇外观参照','Ship appearance references','艦艇の外観資料')}</h3>
                <p>{copy('这些资料用于核对外观，不是舰艇总数或部署的依据。','These references inform the exterior models, not fleet counts or deployments.','外観を照合するための資料です。艦艇の総数や配備の根拠ではありません。')}</p>
                <ul>{atlasIds.map(id=><li key={id}><a href={photoSources[id]} target="_blank" rel="noreferrer">{words(fleetCatalog[id].name,language)}</a></li>)}</ul>
              </section>}
              {language === 'ja' ? JAPANESE_SOURCE_SECTIONS.map(({ title, list, entries }) => (
                <section key={title}>
                  <h3>{title}</h3>
                  {list ? <ul>{entries.map((item) => <li key={item}><SourceText text={item} /></li>)}</ul>
                    : entries.map((item) => <p key={item}><SourceText text={item} /></p>)}
                </section>
              )) : SOURCE_SECTIONS.map((section) => (
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

export { Baseline2026Overlay as JourneyOverlay }
