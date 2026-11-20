import { ARCHIVE_AUDIO } from '../../publicEdition'
import { useEffect, useRef, useState } from 'react'
import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { t, type JourneyLang } from '../types'
import { BEATS, SOURCES } from './content'
import { ConceptGallery, hasConcepts } from './ConceptGallery'
import { credits, MissionPlate, PlateDetails } from './MissionPlate'
import { SpaceSuggestion, readMarkedText, type MarkedText } from './SpaceSuggestion'
import { SpacePinnedMark } from './SpacePinnedMark'
import { BEAT_STAGING } from './sites'
import './space.css'

const COPY = {
  zh: {
    back: '返回入口', mark: '科研航天', sub: 'Science & spaceflight', picture: '查看大图', concepts: '六代机想象图', chapters: '导览章节',
    place: '地球视角', source: '公开资料', close: '关闭',
    sourceNote: '地球上的站点和轨道为科普示意。点击配图可查看原图出处或示意图说明。',
    transcript: '解说词', prev: '上一章', next: '下一章', begin: '开始导览', finish: '返回入口',
    play: '播放讲解', pause: '暂停讲解', resume: '继续讲解', replay: '从头播放', voice: '中文口播 · 云扬',
    fail: '口播未能播放，可继续阅读解说词。', progress: '本章口播进度',
  },
  en: {
    back: 'Exit guide', mark: 'Science & spaceflight', sub: '科研航天', picture: 'View full image', concepts: 'Aircraft concept art', chapters: 'Guide chapters',
    place: 'Earth view', source: 'Public sources', close: 'Close',
    sourceNote: 'Map markers and orbits are illustrative. Open a plate to see its image credit or diagram notes.',
    transcript: 'Transcript', prev: 'Previous', next: 'Next', begin: 'Begin guide', finish: 'Back to entrance',
    play: 'Play narration', pause: 'Pause narration', resume: 'Resume narration', replay: 'Replay guide', voice: 'Chinese narration only',
    fail: 'Narration is unavailable. You can still read the transcript.', progress: 'Chapter audio progress',
  },
} as const

const number = (index: number) => String(index + 1).padStart(2, '0')

type IconName = 'left' | 'right' | 'play' | 'pause' | 'source' | 'close' | 'expand' | 'pencil'
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7', play: 'M8 5l11 7-11 7z', pause: 'M9 5v14m6-14v14',
    source: 'M6 3h9l3 3v15H6zM9 10h6m-6 4h6m-6 4h4', close: 'M6 6l12 12m0-12L6 18', expand: 'M4 10V4h6m4 0h6v6m0 4v6h-6m-4 0H4v-6',
    pencil: 'M4 20l4-1 12-12-3-3L5 16zM14 7l3 3',
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}

type InspectionKind = 'sources' | 'plate' | 'concepts'

function Inspection({ index, lang, kind }: { index: number; lang: JourneyLang; kind: InspectionKind }) {
  const ref = useRef<HTMLDialogElement>(null)
  const close = useJourney(s => s.toggleSources)
  const beat = BEATS[index]
  const copy = COPY[lang]
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    return () => { if (dialog.open) dialog.close() }
  }, [])
  return (
    <dialog ref={ref} className={`space-source-dialog${kind !== 'sources' ? ' space-image-dialog' : ''}`} aria-labelledby="space-source-title"
      onCancel={event => { event.preventDefault(); close(false) }}
      onClick={event => { if (event.target === ref.current) close(false) }}>
      <div className="space-source-inner">
        <header>
          <h2 id="space-source-title">{kind === 'concepts' ? copy.concepts : kind === 'plate' ? credits[beat.id].title[lang] : copy.source}</h2>
          <button type="button" aria-label={copy.close} onClick={() => close(false)}><Icon name="close" /></button>
        </header>
        {kind === 'concepts' ? <ConceptGallery lang={lang} /> : kind === 'plate' ? <PlateDetails beat={beat.id} lang={lang} /> : <>
        <p className="space-source-chapter">{number(index)} · {t(beat.title, lang)}</p>
        <ul>{beat.sources.map(id => {
          const source = SOURCES[id]
          return <li key={id}><span>{t(source.agency, lang)}</span><a href={source.url} target="_blank" rel="noreferrer">{t(source.title, lang)} ↗</a></li>
        })}</ul>
        <p className="space-source-note">{copy.sourceNote}</p>
        </>}
      </div>
    </dialog>
  )
}

function NarrationControl({ lang }: { lang: JourneyLang }) {
  const status = useNarration(s => s.status)
  const ready = useNarration(s => s.ready)
  const note = useNarration(s => s.voiceNote)
  const copy = COPY[lang]
  if (lang === 'en') return <span className="space-voice-note">{copy.voice}</span>
  const control = status === 'playing' ? 'pause' : status === 'paused' ? 'resume' : status === 'ended' ? 'replay' : 'play'
  return (
    <div className="space-audio">
      <button type="button" className="space-play" disabled={!ready} onClick={() => useNarration.getState()[control]()}>
        <Icon name={control === 'pause' ? 'pause' : 'play'} />{copy[control]}
      </button>
      <span className="space-voice-note" role={note === 'error' ? 'status' : undefined}>{note === 'error' ? copy.fail : copy.voice}</span>
    </div>
  )
}

function NarrationProgress({ lang }: { lang: JourneyLang }) {
  const status = useNarration(s => s.status)
  const duration = useNarration(s => s.duration)
  const time = useNarration(s => s.currentTime)
  if (lang !== 'zh' || !duration || status === 'idle') return null
  return <progress className="space-audio-meter" aria-label={COPY[lang].progress} max={duration} value={Math.min(duration, time)} />
}

export function SpaceJourneyOverlay() {
  const lang = useJourney(s => s.language)
  const index = useJourney(s => s.beatIndex)
  const setBeat = useJourney(s => s.setBeat)
  const setLanguage = useJourney(s => s.setLanguage)
  const leave = useJourney(s => s.exitJourney)
  const sourcesOpen = useJourney(s => s.sourcesOpen)
  const toggleSources = useJourney(s => s.toggleSources)
  // All inspections share the same pause/resume and Escape handling.
  const [inspection, setInspection] = useState<InspectionKind | 'suggest'>('sources')
  const [marked, setMarked] = useState<MarkedText | null>(null)
  const [pinned, setPinned] = useState('')
  const pressing = useRef<MarkedText | null>(null)
  const inspect = (kind: InspectionKind | 'suggest') => { setInspection(kind); toggleSources(true) }
  const paragraph = useNarration(s => s.paragraphIndex)
  const read = useNarration(s => s.readParagraph)
  const rail = useRef<HTMLElement>(null)
  const copy = COPY[lang]
  const beat = BEATS[index]
  const frame = BEAT_STAGING[index]
  const lines = beat.narration[lang]
  const line = Math.min(paragraph, lines.length - 1)
  const last = index === BEATS.length - 1

  useEffect(() => {
    const nav = rail.current
    const current = nav?.querySelector<HTMLButtonElement>('[aria-current="step"]')
    if (nav && current && nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = current.offsetLeft + current.offsetWidth / 2 - nav.clientWidth / 2
    }
  }, [index, lang])

  return (
    <section className="space-guide" aria-label={copy.mark}>
      <header className="space-top">
        <div className="space-brand">
          <span className="space-brand-symbol" aria-hidden="true"><i /></span>
          <div><strong>{copy.mark}</strong><span>{copy.sub}</span></div>
        </div>
        <div className="space-top-actions">
          {hasConcepts && <button type="button" className="space-concept-entry" aria-haspopup="dialog" onClick={() => inspect('concepts')}>{copy.concepts}</button>}
          <button type="button" className="space-language" aria-label={lang === 'zh' ? 'Switch to English' : '切换为中文'} onClick={() => {
            useNarration.getState().stop()
            setLanguage(lang === 'zh' ? 'en' : 'zh')
          }}>{lang === 'zh' ? 'EN' : '中文'}</button>
          <button type="button" className="space-exit" onClick={() => leave()}><Icon name="left" />{copy.back}</button>
        </div>
      </header>

      <div className="space-stage">
        <article className="space-card" aria-labelledby="space-chapter-title" data-chapter={beat.id}>
          <div className="space-spread" key={beat.id}>
            <div className="space-copy">
              <p className="space-kicker"><b>{number(index)}</b><span>{t(beat.kicker, lang)}</span>{beat.date && <time dateTime={beat.date.replaceAll('.', '-')}>{beat.date}</time>}</p>
              <h1 id="space-chapter-title" data-space-anchor="title" aria-live="polite">{t(beat.title, lang)}</h1>
              <p className="space-summary" data-space-anchor="summary">{t(beat.body, lang)}</p>
            </div>
            <figure className="space-figure">
              <button type="button" className="space-open-plate" aria-haspopup="dialog"
                aria-label={`${copy.picture} · ${credits[beat.id].title[lang]}`} onClick={() => inspect('plate')}>
                <MissionPlate beat={beat.id} lang={lang} />
                <span className="space-expand-mark" aria-hidden="true"><Icon name="expand" /></span>
              </button>
              <figcaption data-space-anchor="image">{credits[beat.id].title[lang]}</figcaption>
            </figure>
          </div>
          <div className="space-transcript">
            <div className="space-transcript-head">
              <span>{copy.transcript}</span>
              <div className="space-paragraphs">{lines.map((_, i) =>
                <button key={i} type="button" aria-label={lang === 'zh' ? `读第 ${i + 1} 段` : `Read paragraph ${i + 1}`}
                  aria-pressed={i === line} onClick={() => read(i)}>{number(i)}</button>)}</div>
            </div>
            <p data-space-anchor={`paragraph:${line}`}>{lines[line]}</p>
            <div className="space-editorial-actions">
              <button type="button" className="space-source-button" onClick={() => inspect('sources')}><Icon name="source" />{copy.source}</button>
              <button type="button" className="space-source-button space-suggest-open" aria-haspopup="dialog"
                onPointerDown={() => { pressing.current = readMarkedText(beat.id, lang) }}
                onClick={() => {
                  setMarked(pressing.current ?? readMarkedText(beat.id, lang))
                  pressing.current = null
                  inspect('suggest')
                }}><Icon name="pencil" />{lang === 'zh' ? '标注建议' : 'Suggest an edit'}</button>
            </div>
          </div>
          <NarrationProgress lang={lang} />
        </article>
        <aside className="space-globe-caption" aria-label={copy.place}>
          <span><i />{copy.place}</span><strong>{t(frame.ground, lang)}</strong>
        </aside>
      </div>

      <div className="space-footer">
        <nav ref={rail} className="space-rail" aria-label={copy.chapters}>
          {BEATS.map((chapter, i) => <button type="button" key={chapter.id} onClick={() => setBeat(i)}
            aria-current={i === index ? 'step' : undefined} aria-label={`${number(i)} · ${t(chapter.name, lang)}`}>
            <b>{number(i)}</b><span>{t(chapter.name, lang)}</span>
          </button>)}
        </nav>
        <div className="space-controls">
          {ARCHIVE_AUDIO ? <NarrationControl lang={lang} /> : <span className="space-voice-note">{lang === 'zh' ? '阅读版 · 可逐段浏览' : 'Reading edition · browse by paragraph'}</span>}
          <div className="space-step">
            <button type="button" className="space-prev" disabled={index === 0} aria-label={copy.prev} onClick={() => setBeat(index - 1)}><Icon name="left" /><span>{copy.prev}</span></button>
            <button type="button" className="space-next" onClick={() => last ? leave() : setBeat(index + 1)}>
              {last ? copy.finish : index === 0 ? copy.begin : copy.next}<Icon name="right" />
            </button>
          </div>
        </div>
      </div>

      {sourcesOpen && (inspection === 'suggest'
        ? <SpaceSuggestion key={beat.id + lang} beat={beat} index={index} lang={lang} marked={marked}
            currentLine={line} onClose={() => toggleSources(false)} onPin={image => { setPinned(image); toggleSources(false) }} />
        : <Inspection index={index} lang={lang} kind={inspection} />)}
      {pinned && <SpacePinnedMark src={pinned} zh={lang === 'zh'} onClose={() => setPinned('')} />}
    </section>
  )
}

