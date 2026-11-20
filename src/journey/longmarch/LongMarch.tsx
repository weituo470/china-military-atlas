import { useEffect, useRef, useState } from 'react'
import { beats, description, title, type Unit } from './content'
import { routes } from './map'
import { RouteMap } from './RouteMap'
import { bi, sources, type Lang } from './sources'
const sitePhoto=import.meta.glob<string>('./zunyi-2024.webp',{eager:true,query:'?url',import:'default'})['./zunyi-2024.webp']
import './atlas.css'
import { RouteRegister } from './RouteRegister'
import { MomentCompare } from './MomentCompare'
import { getDossier } from './dossiers'
import { readQuery as query, writeQuery, getView, type View } from './navigation'

type Recording = { starts:number[]; duration:number; text:string[] }
type Manifest = { clips: Record<string, Recording> }
const manifests = import.meta.glob<Manifest>('./audio/manifest.json', { eager:true, import:'default' })
const clips = manifests['./audio/manifest.json']?.clips ?? {}
const files = import.meta.glob<string>('./audio/*.mp3', { eager:true, import:'default', query:'?url' })
const icon = (name: 'play'|'pause'|'previous'|'next'|'back'|'restart') => {
  const d = { play:'M8 5 20 12 8 19Z', pause:'M8 5v14M16 5v14', previous:'M15 18 9 12l6-6', next:'m9 6 6 6-6 6', back:'M18 12H6m6 6-6-6 6-6', restart:'M4 12a8 8 0 1 1 2 5m-2-9v4h4' }
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill={name==='play'?'currentColor':'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d[name]}/></svg>
}
const mmss = (time: number) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2,'0')}`
const getUnit = (): Unit => { const q=query().get('unit'); return q==='red25'||q==='fourth'||q==='second'?q:'first' }
const getIndex = () => Math.max(0, beats.findIndex(b => b.id === query().get('chapter')))

export function LongMarch({ returnHref = '/', initialLang }: { returnHref?: string; initialLang?: Lang }) {
  const [lang,setLang] = useState<Lang>(() => query().get('lang') === 'en' ? 'en' : query().get('lang') === 'zh' ? 'zh' : initialLang ?? 'zh')
  const [index,setIndex] = useState(getIndex)
  const [line,setLine] = useState(0)
  const [view,setView] = useState<View>(getView)
  const [route,setRoute] = useState<Unit>(getUnit)
  const [stopId,setStopId] = useState(()=>query().get('stop')??'')
  const [moment,setMoment] = useState(()=>Number(query().get('at')) || 19351019)
  const modesRef=useRef<HTMLElement>(null)
  const origin=useRef<HTMLElement|null>(null)
  const resumeGuide=useRef(false)
  const [filter,setFilter] = useState<Unit|'all'>('all')
  const [playing,setPlaying] = useState(false)
  const [time,setTime] = useState(0)
  const [continuous,setContinuous] = useState(true)
  const [error,setError] = useState(false)
  const audio = useRef<HTMLAudioElement>(null)
  const sourcesDialog = useRef<HTMLDialogElement>(null)
  const chapters = useRef<HTMLElement>(null)
  const intent = useRef<{ position:number; play:boolean } | null>(null)
  const beat = beats[index]
  const cue = beat.cues[line] ?? beat.cues[0]
  const rec = clips[beat.id]
  const src = files[`./audio/${beat.id}.mp3`]
  const recorded = Boolean(rec && src)
  const zh = lang === 'zh'
  const atStart = index === 0
  const atEnd = index === beats.length - 1

  useEffect(() => {
    writeQuery(q=>{
      if(index===0)q.delete('chapter');else q.set('chapter',beats[index].id)
      q.set('lang',lang)
      if(view==='guide')q.delete('view');else q.set('view',view)
      if(view==='routes'){q.set('unit',route);const r=getDossier(route);q.set('stop',r.stops.find(s=>s.id===stopId)?.id??r.stops[0].id)}
      else {q.delete('unit');q.delete('stop')}
      if(view==='compare')q.set('at',String(moment));else q.delete('at')
    })
    document.documentElement.lang = zh ? 'zh-CN' : 'en'
    document.title = `${title[lang]} · 1934–1936`
  }, [index,lang,zh,view,route,stopId,moment])

  useEffect(() => {
    const nav = chapters.current
    const item = nav?.querySelector<HTMLButtonElement>('.selected')
    if (!nav || !item || nav.scrollWidth <= nav.clientWidth) return
    if (item.offsetLeft < nav.scrollLeft || item.offsetLeft + item.offsetWidth > nav.scrollLeft + nav.clientWidth)
      nav.scrollLeft = item.offsetLeft - (nav.clientWidth - item.offsetWidth) / 2
  }, [index,lang])

  useEffect(()=>{
    const pop=()=>{audio.current?.pause();intent.current=null;setView(getView());setIndex(getIndex());setRoute(getUnit());setStopId(query().get('stop')??'');setMoment(Number(query().get('at'))||19351019);setLang(query().get('lang')==='en'?'en':'zh')}
    window.addEventListener('popstate',pop);return ()=>window.removeEventListener('popstate',pop)
  },[])
  function navigate(next:View, fromCue=false) {
    if(next===view)return
    if(view==='guide'){
      origin.current=document.activeElement instanceof HTMLElement ? document.activeElement : null
      resumeGuide.current=!!audio.current&&!audio.current.paused
      intent.current=null;audio.current?.pause()
      if(next==='compare')setMoment(fromCue&&cue.place!=='all'?cue.at:19351019)
      if(next==='routes'&&filter!=='all'){setRoute(filter);setStopId('')}
    }
    writeQuery(q=>{if(next==='guide')q.delete('view');else q.set('view',next)},true)
    setView(next)
    if(next==='guide'){
      if(resumeGuide.current&&audio.current)startSound(audio.current)
      resumeGuide.current=false
      requestAnimationFrame(()=>{if(origin.current?.isConnected){origin.current.focus({preventScroll:true});origin.current.scrollIntoView({block:'nearest'})}})
    }else requestAnimationFrame(()=>modesRef.current?.scrollIntoView({block:'start'}))
  }
  function report(media: HTMLAudioElement) {
    const seconds = media.currentTime
    setTime(seconds)
    if (rec) setLine(rec.starts.reduce((current,start,n) => seconds + .035 >= start ? n : current,0))
  }
  function startSound(media: HTMLAudioElement) {
    setError(false)
    void media.play().catch((e:unknown) => {
      // A user can legitimately change chapters before play() settles.
      if (media !== audio.current || (e instanceof DOMException && e.name === 'AbortError')) return
      setPlaying(false); setError(true)
    })
  }
  function choose(chapter:number, target=0, play=false) {
    const to = Math.max(0, Math.min(beats.length - 1, chapter))
    const pos = clips[beats[to].id]?.starts[target] ?? 0
    const media = audio.current
    intent.current = null
    setFilter('all'); setError(false); setLine(target); setTime(pos)
    if (to !== index) {
      media?.pause()
      intent.current = {position:pos,play}
      setPlaying(false); setIndex(to)
    } else if (media && src) {
      if (!play) media.pause()
      if (media.readyState) media.currentTime = pos
      else intent.current = {position:pos,play}
      if (play && media.readyState) startSound(media)
    }
  }
  function point(id:string) {
    if (cue.place === id) return
    const chapter = beat.cues.findIndex(c=>c.place===id)
    if (chapter >= 0) { choose(index,chapter); return }
    const nextIndex = beats.findIndex((item,i)=>i>0 && item.cues.some(c=>c.place===id))
    if (nextIndex >= 0) choose(nextIndex, beats[nextIndex].cues.findIndex(c=>c.place===id))
  }
  function playToggle() {
    const media = audio.current
    if (!media || !recorded) return
    if (!media.paused) { media.pause(); return }
    if (media.ended || (media.duration > 0 && media.currentTime >= media.duration)) { media.currentTime = 0; setLine(0) }
    startSound(media)
  }
  function applyIntent(media:HTMLAudioElement) {
    const next = intent.current
    if (!next || !src) return
    intent.current = null
    media.currentTime = next.position
    if (next.play) startSound(media)
  }
  function seek(seconds:number) {
    const media = audio.current
    if (media && rec) {
      if (media.readyState) { media.currentTime = seconds; report(media) }
      else {
        intent.current = { position:seconds,play:!media.paused }
        setTime(seconds)
        setLine(rec.starts.reduce((current,start,n)=>seconds>=start?n:current,0))
      }
    }
  }

  const linkedSources = [...new Set(beat.cues.flatMap(c=>c.refs))]
  return (
    <main className="lm" data-lang={lang}>
      <div className="lm-shell">
        <header className="lm-mast">
          <a className="lm-back" href={returnHref}>{icon('back')} <span>{location.protocol==='file:'?(zh?'返回长征开篇':'Back to the opening'):(zh?'返回导览入口':'Back to guides')}</span></a>
          <div className="lm-mast-id"><i/> <span>{zh?'中国军力 · 历史图志':'CHINESE MILITARY POWER · HISTORICAL ATLAS'}</span></div>
          <div className="lm-lang" aria-label={zh?'语言':'Language'}>
            <button type="button" aria-label="简体中文" aria-pressed={zh} onClick={()=>setLang('zh')}>中</button>
            <button type="button" aria-label="English" aria-pressed={!zh} onClick={()=>setLang('en')}>EN</button>
          </div>
        </header>
        <div className="lm-head">
          <div><p className="lm-overline">{zh?'中国工农红军 · 长征图志':'THE CHINESE WORKERS’ AND PEASANTS’ RED ARMY'}</p><h1>{title[lang]}</h1></div>
          <div className="lm-intro"><b>1934—1936</b><p>{description[lang]}</p></div>
        </div>

        <nav className="lm-modes" ref={modesRef} aria-label={zh?'阅读方式':'Ways to explore'}>
          <button type="button" data-view="guide" aria-pressed={view==='guide'} onClick={()=>navigate('guide')}>{zh?'听九章导览':'Narrated guide'}</button>
          <button type="button" data-view="compare" aria-pressed={view==='compare'} onClick={()=>navigate('compare')}>{zh?'同一时刻，看四队':'Compare one date'}</button>
          <button type="button" data-view="routes" aria-pressed={view==='routes'} onClick={()=>navigate('routes')}>{zh?'分队路线志':'Routes by force'}</button>
        </nav>
        {view==='compare' && <MomentCompare lang={lang} initialAt={moment} onAtChange={setMoment} onClose={()=>navigate('guide')} onRoute={u=>{setRoute(u);setStopId('');navigate('routes')}}/>}
        {view==='routes' && <RouteRegister lang={lang} unit={route} stopId={stopId} onSelect={(u,s)=>{setRoute(u);setStopId(s)}} onClose={()=>navigate('guide')}/>}
        <div hidden={view!=='guide'}>
        <nav ref={chapters} className="lm-chapters" aria-label={zh?'章节时间轴':'Chapter timeline'}>
          {beats.map((item,n)=><button key={item.id} type="button" data-chapter={item.id} className={n===index?'selected':''} aria-current={n===index?'step':undefined}
             onClick={()=>choose(n)}><span>{String(n+1).padStart(2,'0')}</span>{item.short[lang]}</button>)}
        </nav>
        <div className="lm-workspace">
          <section className="lm-chart" aria-label={zh?'地图和队伍图例':'Map and route legend'}>
            <RouteMap cue={cue} lang={lang} unit={filter} onPlace={point}/>
            <div className="lm-legend">
              <div className="lm-legend-head"><strong>{zh?'按队伍看路线':'Routes by force'}</strong><button type="button" onClick={()=>setFilter('all')} aria-pressed={filter==='all'}>{zh?'全部路线':'All routes'}</button></div>
              <div className="lm-legend-rows">
                {routes.map(r=><button key={r.id} data-unit={r.id} type="button" onClick={()=>setFilter(filter===r.id?'all':r.id)} aria-pressed={filter===r.id} className={filter!==r.id&&filter!=='all'?'is-muted':''}>
                  <svg aria-hidden="true" width="33" height="12"><path d="M2 6H31" stroke={r.ink} strokeWidth="3" strokeDasharray={r.dash} strokeLinecap="round"/></svg>
                  <span><strong>{r.name[lang]}</strong><small>{r.time[lang]}</small></span>
                </button>)}
              </div>
            </div>
          </section>
          <section className="lm-reader" aria-labelledby="lm-chapter-title">
            <div className="lm-reader-kicker"><span>{zh?'第':'CHAPTER '}{String(index+1).padStart(2,'0')}{zh?'章':''} / {String(beats.length).padStart(2,'0')}</span>
              <button type="button" className="lm-link-button" onClick={()=>sourcesDialog.current?.showModal()}>{zh?'史料与注释':'Sources & notes'} <span aria-hidden="true">↗</span></button>
            </div>
            <h2 id="lm-chapter-title" data-active-chapter={beat.id}>{beat.title[lang]}</h2>
            <ol className="lm-cues">
              {beat.cues.map((c,n)=>
                <li key={n}>
                  <button type="button" className="lm-cue" data-cue={n} aria-current={line===n?'step':undefined} onClick={()=>choose(index,n,playing)}>
                    <time>{c.date[lang]}</time><span>{c.label[lang]}</span>
                  </button>
                </li>)}
            </ol>
            <article className="lm-excerpt" data-cue-text={line}>
              <p>{cue.words[lang]}</p>
              <div className="lm-inline-refs">{cue.refs.map(ref=><a href={sources[ref].url} key={ref} target="_blank" rel="noreferrer" title={sources[ref].title[lang]}>{sources[ref].publisher[lang]} <span aria-hidden="true">↗</span></a>)}</div>
            </article>
            {(beat.id==='atlas'||beat.id==='shaanbei'||beat.id==='reunions')&&<button type="button" className="lm-query" data-ask-moment onClick={()=>navigate('compare',true)}>{zh?'这一刻，其他队伍呢？':'Where were the other forces?'} <span aria-hidden="true">↗</span></button>}
            {beat.note && <p className="lm-note">{beat.note[lang]}</p>}
            {recorded ? <div className="lm-player">
              <audio key={beat.id} ref={audio} src={src} preload="metadata" onLoadedMetadata={e=>applyIntent(e.currentTarget)}
                onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={e=>report(e.currentTarget)} onError={()=>{setPlaying(false); setError(true)}}
                onEnded={()=>{ setPlaying(false); if (continuous && !atEnd) choose(index+1,0,true) }} />
              <div className="lm-player-row">
                <button type="button" className="lm-play" disabled={!recorded} onClick={playToggle} aria-label={playing?(zh?'暂停口播':'Pause narration'):(zh?'播放普通话口播':'Play Mandarin narration')}>{icon(playing?'pause':'play')}</button>
                <div className="lm-player-info"><strong>{zh?'普通话口播':'Mandarin narration'}</strong><small>{zh?'云扬 · 语速 −12%':'Yunyang · −12% speech rate'}</small></div>
                <button type="button" className="lm-restart" disabled={!recorded} onClick={()=>seek(0)} aria-label={zh?'重听本章':'Restart chapter'}>{icon('restart')}</button>
              </div>
              <div className="lm-player-seek">
                <input type="range" disabled={!recorded} min={0} max={rec?.duration??1} step=".05" value={time} onChange={e=>seek(Number(e.target.value))} aria-label={zh?'口播进度':'Narration position'}/>
                <output>{mmss(time)} / {mmss(rec?.duration??0)}</output>
              </div>
              <div className="lm-player-foot">
                <label><input type="checkbox" checked={continuous} onChange={e=>setContinuous(e.target.checked)}/>{zh?'播完接下一章':'Continue to next chapter'}</label>
                {!recorded && <span role="status">{zh?'开源版提供逐段文稿':'Transcript edition'}</span>}
                {error && <span role="status">{zh?'无法播放，请重试':'Playback failed; try again'}</span>}
              </div>
            </div>
            : <p className="lm-note">{zh?'阅读版 · 点选上方条目，逐段查看史料。' : 'Reading edition · select a passage above to explore its sources.'}</p>}
            <div className="lm-prev-next">
              <button type="button" disabled={atStart} onClick={()=>choose(index-1)}>{icon('previous')}{zh?'上一章':'Previous'}</button>
              {atEnd ? <button type="button" onClick={()=>choose(0)}>{zh?'回到总览':'Back to overview'}{icon('restart')}</button> : <button type="button" onClick={()=>choose(index+1)}>{zh?'下一章':'Next chapter'}{icon('next')}</button>}
            </div>
          </section>
        </div>
        </div>
        <footer className="lm-footer">
          <span>{bi('历史导览 · 地点按今天常用名称标注，正文注明历史名称。','Historical guide · Places use common modern names; historical names are noted in the text.')[lang]}</span>
          <a href={sources.artifacts.url} target="_blank" rel="noreferrer">{zh?'延伸阅读：馆藏与旧址 ↗':'Further reading: artifacts and historic sites ↗'}</a>
        </footer>
      </div>
      <dialog className="lm-dialog" ref={sourcesDialog} aria-labelledby="lm-dialog-title">
        <form method="dialog"><button type="submit" autoFocus>{zh?'关闭':'Close'}</button></form>
        <p className="lm-overline">{beat.title[lang]}</p>
        <h2 id="lm-dialog-title">{zh?'史料与注释':'Sources & notes'}</h2>
        {beat.note && <p>{beat.note[lang]}</p>}
        <ol>{linkedSources.map(id => <li key={id}><a href={sources[id].url} target="_blank" rel="noreferrer">{sources[id].title[lang]} ↗</a><small>{sources[id].publisher[lang]}</small></li>)}</ol>
        {sitePhoto && beat.id === 'zunyi' && <figure className="lm-doc-photo">
          <img src={sitePhoto} width="499" height="333" loading="lazy" alt={zh?'遵义会议会址的砖木建筑':'The brick and timber building at the Zunyi Conference Site'} />
          <figcaption>{zh?'遵义会议会址 · 2024年6月20日摄（非1935年现场影像）':'Zunyi Conference Site · June 20, 2024 (not a photo from 1935)'}<br />
            <a href="https://www.flickr.com/photos/7138083@N04/55410620039/" target="_blank" rel="noreferrer">xiquinhosilva / Flickr</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · {zh?'转为 WebP':'WebP conversion'}
          </figcaption>
        </figure>}
        <p className="lm-note">{zh?'文案是根据公开史料编写的导览。示意路线并非任一部队的逐日行军记录。1936年会师节点记录红一方面军接应，不延长中央红军主力1935年的长征路线。':'Narration is an editorial retelling based on public sources. Lines are not daily tracks. The 1936 reunions include First Front Army reception troops; they do not extend the main force’s 1935 march.'}</p>
      </dialog>
    </main>
  )
}

export default LongMarch

