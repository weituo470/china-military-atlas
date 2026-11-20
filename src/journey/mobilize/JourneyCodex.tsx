import { ARCHIVE_ART } from '../../publicEdition'
import { useEffect, useRef } from 'react'
import { useJourney } from '../../store/journey'
import { BEATS, type MobilizeCard } from './content'
import { JA_BEATS } from './jaBeats'
import { JA_CARDS, JA_PLATES } from './jaRecords'
import { ml, tri, useMobilizeLanguage, type MobilizeLanguage } from './locale'
import { useMobilizeMediaValue } from './playback'
import { MOBILIZE_PLATES, preloadMobilizePlates } from './plates'
import { getReadingCue } from './readingCues'
import { focusForParagraph } from './sites'
import '../../styles/codex.css'
import './mobilize.css'

function FolioNotes({ beatId, language, cards, onInspect }: {
  beatId: string
  language: MobilizeLanguage
  cards: readonly MobilizeCard[]
  onInspect: (card: MobilizeCard, opener: HTMLButtonElement) => void
}) {
  if (beatId === 'hook') {
    return (
      <div className="mobilize-notes">
        <p>{tri(language, '两种情境都需要的能力', 'Capabilities both situations depend on', 'どちらの場面でも必要な力')}</p>
        <ul>
          <li>{tri(language, '组织协调', 'Coordination', '連携・調整')}</li>
          <li>{tri(language, '人员物资调度', 'Moving people and supplies', '人員と物資の輸送')}</li>
          <li>{tri(language, '生命线恢复', 'Restoring lifelines', 'ライフラインの復旧')}</li>
        </ul>
      </div>
    )
  }
  if (beatId === 'close') {
    return (
      <div className="mobilize-notes">
        <p>{tri(language, '对照阅读', 'Explore related chapters', '関連する章')}</p>
        <div className="mobilize-references">
          <a href="?journey=force">{tri(language, '战国', 'Warring States', '戦国時代')}</a>
          <a href="?journey=korea">{tri(language, '抗美援朝', 'Korean War', '朝鮮戦争')}</a>
          <a href="?journey=baseline2026">{tri(language, '2026 军力基线', '2026 military baseline', '2026年の軍事力')}</a>
        </div>
      </div>
    )
  }
  return (
    <div className="mobilize-notes">
      <p>{tri(language, '延伸资料', 'Related records', '関連資料')}</p>
      <div className="mobilize-references">
        {cards.map((card) => (
          <button key={card.id} type="button" aria-controls="mobilize-record"
            onClick={(event) => onInspect(card, event.currentTarget)}>
            {ml(card.title, language, JA_CARDS[card.id].title)} <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function MobilizeJourneyCodex({ showMap, onInspect }: {
  showMap: boolean
  onInspect: (card: MobilizeCard, opener: HTMLButtonElement) => void
}) {
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useMobilizeLanguage()
  const setFocus = useJourney((store) => store.setFocus)
  const paragraphIndex = useMobilizeMediaValue('paragraphIndex')
  const sheetRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  useEffect(() => { preloadMobilizePlates() }, [])
  useEffect(() => {
    setFocus(focusForParagraph(beatIndex, paragraphIndex))
    if (sheetRef.current) sheetRef.current.scrollTop = 0
    if (copyRef.current) copyRef.current.scrollTop = 0
  }, [beatIndex, paragraphIndex, setFocus])

  const beat = BEATS[beatIndex] ?? BEATS[0]
  const ja = JA_BEATS[beat.id]
  const lines = language === 'ja' ? ja.narration : beat.narration[language]
  const index = Math.min(paragraphIndex, lines.length - 1)
  const plate = MOBILIZE_PLATES[beat.id]
  const cue = getReadingCue(beat.id, index)
  const folio = String(beatIndex + 1).padStart(2, '0')
  const zh = language === 'zh'
  const title = ml(beat.title, language, ja.title)
  const cueLabel = ml(cue.label, language, ja.cues[index])

  if (showMap) {
    return (
      <div className="journey-codex mobilize-codex mobilize-map" data-beat={beat.id}>
        <div className="mobilize-map-key">
          <h1>{ml(beat.name, language, ja.name)} / {cueLabel}</h1>
          <p>{tri(language, '图钉使用代表性或遗址坐标，路线为示意。', 'Pins mark sites or representative locations; routes are schematic.', 'ピンは遺構や代表地点、経路は模式図です。')}</p>
          {beat.id === 'floods' && (
            <p>{tri(language, '荆江分洪区组织了转移，但最终未启用。', 'Residents were moved; the Jingjiang diversion was not opened.', '荊江分洪区では住民が避難しましたが、分洪は行われませんでした。')}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="journey-codex mobilize-codex" data-beat={beat.id} data-material="parchment">
      <div className="codex-stage is-parchment">
        <article className="torn-parchment">
          <div className="torn-parchment-sheet" ref={sheetRef} tabIndex={0} aria-labelledby="mobilize-folio-title">
            <div className="mobilize-folio">
              <div className="mobilize-copy" ref={copyRef} tabIndex={0} aria-labelledby="mobilize-folio-title">
                <p className="mobilize-kicker"><span>{folio} / 08</span>{ml(beat.kicker, language, ja.kicker).split('  ·  ').at(-1)}</p>
                <h1 id="mobilize-folio-title">
                  {zh ? title.split(/(?<=[，。？])/u)
                    .filter(Boolean).map((phrase) => <span key={phrase}>{phrase}</span>) : title}
                </h1>
                <div className="mobilize-passage" aria-live="polite" aria-atomic="true">
                  <h2><span>{index + 1} / {lines.length}</span>{cueLabel}</h2>
                  <p className="mobilize-spoken">{lines[index]}</p>
                </div>
                <FolioNotes beatId={beat.id} language={language} cards={cue.cards} onInspect={onInspect} />
              </div>
              {ARCHIVE_ART && <figure className="mobilize-plate" key={beat.id}>
                <img src={plate.src} alt={ml(plate.alt, language, JA_PLATES[beat.id][0])} width={1152} height={864} />
                <figcaption>
                  <b>{tri(language, '示意图', 'Illustration', '模式図')}</b>
                  <span>{ml(plate.caption, language, JA_PLATES[beat.id][1])}</span>
                </figcaption>
              </figure>}
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
