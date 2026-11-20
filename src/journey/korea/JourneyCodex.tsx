import { ARCHIVE_ART } from '../../publicEdition'
import { useEffect, useState } from 'react'
import { useJourney } from '../../store/journey'
import { SITE_CARDS } from './content'
import { COPY, KOREA_BEATS, tr, type KoreaLang } from './locales'
import { useKoreaLanguage, useKoreaParagraph } from './playback'
import { plateFor, preloadKoreaPlates, type KoreaPlate } from './plates'
import { focusForParagraph } from './sites'
import { FrontAtlas } from './atlas/FrontAtlas'
import { words, STAGES } from './atlas/stages'
import { useSpokenScene } from './atlas/cues'
import { archiveFor, reviewArchive } from './archive/records'
import './korea.css'
import './atlas/atlas.css'
import './archive/presentation.css'

const MAP_NAMES = {
  peninsula: { zh: '朝鲜半岛', en: 'Korean Peninsula', ja: '朝鮮半島' },
  yalu: { zh: '鸭绿江', en: 'Yalu River', ja: '鴨緑江' },
  taiwan: { zh: '台湾海峡', en: 'Taiwan Strait', ja: '台湾海峡' },
  dandong: { zh: '丹东', en: 'Dandong', ja: '丹東' },
  shangganling: { zh: '上甘岭', en: 'Shangganling', ja: '上甘嶺' },
  sansoli: { zh: '三所里', en: 'Sansoli', ja: '三所里' },
  panmunjom: { zh: '板门店', en: 'Panmunjom', ja: '板門店' },
} as const

// Related place in the narration; a card may discuss a place outside the map frame.
const MAP_CUES = [
  ['peninsula', 'yalu', 'peninsula'], ['taiwan', 'peninsula', null],
  ['yalu', 'peninsula', null], ['dandong', 'yalu', 'shangganling'],
  ['yalu', 'sansoli', 'peninsula'], ['taiwan', 'peninsula', 'panmunjom'],
  ['panmunjom', 'peninsula', 'panmunjom'],
] as const

function PlateView({ plate, language, number, record }: { plate: KoreaPlate; language: KoreaLang; number: string; record?: ReturnType<typeof archiveFor> }) {
  return (
    <figure className="korea-plate" data-origin={record?.painting?'painting':record?'archive':'illustration'}>
      <img src={record?.src??plate.src} alt={record?.alt[language]??plate.alt[language]} />
      <figcaption className="korea-plate-caption">
        <div className="korea-plate-meta">
          <span>{tr(COPY.plate, language)} {number}</span>
          <span>{record?.kind[language]??tr(COPY.illustrationCaution, language)}</span>
        </div>
        <strong>{record?.title[language]??plate.title[language]}</strong>
        <p>{record?.alt[language]??plate.caption[language]}</p>
        {record && <a href={record.url} target="_blank" rel="noreferrer">{record.painting?words('查看原画','View painting','元の挿画を見る')[language]:record.credit} ↗</a>}
      </figcaption>
    </figure>
  )
}

export function KoreaJourneyCodex({wide,onWide}:{wide:boolean; onWide:()=>void}) {
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useKoreaLanguage()
  const setFocus = useJourney((store) => store.setFocus)
  const openCard = useJourney((store) => store.openCard)
  const selected = useJourney((store) => store.selectedCardId)
  const [view, setView] = useState<'copy' | 'plate'>('copy')
  const paragraphIndex = useKoreaParagraph()
  const sceneId=useSpokenScene(beatIndex,paragraphIndex,language)
  const [originalFor,setOriginalFor]=useState('')
  const [browse,setBrowse]=useState<number|null>(null)

  useEffect(() => {
    preloadKoreaPlates()
  }, [])

  useEffect(() => {
    // The contextual globe can travel; the foreground peninsula never does.
    if (!selected) setFocus(focusForParagraph(beatIndex, paragraphIndex))
  }, [selected, beatIndex, paragraphIndex, setFocus])

  const beat = KOREA_BEATS[beatIndex] ?? KOREA_BEATS[0]
  const section = beat.reading[paragraphIndex] ?? beat.reading[0]
  const review=browse===null?null:STAGES[browse]
  const plateId=browse===4?'hook':browse===11?'hardship':beat.id
  const plateIndex=browse===4?1:browse===11?2:paragraphIndex
  const plate = ARCHIVE_ART ? plateFor(plateId, plateIndex) : undefined
  const placeId = MAP_CUES[beatIndex]?.[paragraphIndex]
  const place = SITE_CARDS.find(card => card.id === placeId)
  const plateNumber = browse!==null?String(browse+1).padStart(2,'0')+'/14':`${String(beatIndex + 1).padStart(2, '0')}.${paragraphIndex + 1}`
  const record=browse!==null?reviewArchive(browse):archiveFor(beat.id,paragraphIndex,sceneId)
  const recordKey=plateNumber+sceneId
  const showOriginal=view==='plate' && originalFor===recordKey
  const label = tr(COPY.place, language)

  return (
    <div className="korea-codex" data-beat={beat.id}>
      <div className="korea-vignette" aria-hidden="true" />
      <div className="korea-stage">
        <article className="korea-brief korea-atlas-edition">
          <FrontAtlas sceneId={sceneId} readingKey={beat.id+paragraphIndex} onBrowse={setBrowse} lang={language} wide={wide} onWide={onWide}/>
          <section className="kr-reader" data-view={view}>
            <div className="kr-tabs">
              <button type="button" className="kr-read-copy" aria-pressed={view==='copy'} onClick={()=>setView('copy')}>{(review?words('本期图文','Phase notes','時期の解説'):words('正文','Read','本文'))[language]}</button>
              {plate && <button type="button" className="kr-read-plate" aria-pressed={view==='plate'} onClick={()=>setView('plate')}>{tr(COPY.plate,language)} {plateNumber}</button>}
              {record && !review && view==='plate' && <button type="button" className="kr-original" aria-pressed={showOriginal} onClick={()=>setOriginalFor(showOriginal?'':recordKey)}>
                {showOriginal?words('看本段选图','Selected plate','選定図版')[language]:words('看原配图','Original plate','元の挿図')[language]}
              </button>}
            </div>
          <div key={`${beat.id}:${paragraphIndex}:${language}:${browse??'voice'}`} className="korea-brief-sheet">
            <div className="korea-copy" aria-live="polite" tabIndex={view==='copy'?0:-1}>
              <header>
                <p className="korea-material-tag">{tr(COPY.briefingRoll, language)} <span aria-hidden="true">/</span> {review?review.date:tr(beat.kicker, language)}</p>
                <h1 className="korea-title">{review?review.title[language]:section.title[language]}</h1>
              </header>
              <p className="korea-spoken">{review?review.summary[language]:section.body[language]}</p>
              {record && !ARCHIVE_ART && <a href={record.url} target="_blank" rel="noreferrer">{record.title[language]} ↗</a>}
              {!review && <footer className="korea-map-note">
                {place && placeId ? (
                  <button type="button" className="map-cue" onClick={() => openCard(place.kind, place.id)}>
                    {label}{tr(MAP_NAMES[placeId], language)} <span aria-hidden="true">↗</span>
                  </button>
                ) : <p>{tr(COPY.beijing, language)}</p>}
              </footer>}
            </div>
            {plate && <PlateView plate={plate} language={language} number={plateNumber} record={showOriginal?undefined:record}/>}
          </div>
          </section>
        </article>
      </div>
    </div>
  )
}
