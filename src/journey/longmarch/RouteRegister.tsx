import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { RouteDossier } from './dossier-types'
import { dossiers, getDossier } from './dossiers'
import { documents } from './document-windows'
import { type Lang } from './sources'
import type { Unit } from './content'
import { xy } from './map'
const relief=import.meta.glob<string>('./relief.webp',{ eager:true,query:'?url',import:'default' })['./relief.webp']
import './register.css'

const voiceUrls=import.meta.glob<string>('./voices/*.mp3',{eager:true,import:'default',query:'?url'})
const inks={first:'#902f27',red25:'#256057',fourth:'#77551b',second:'#35577f'}
const edition='2026-11-18'
const num=(n:number)=>String(n+1).padStart(2,'0')
const citeId=(r:RouteDossier,n:number)=>'LM.'+r.id+'.'+r.stops[n].id
const routeNames={first:['中央红军','Central Red Army'],red25:['红二十五军','25th Army'],fourth:['红四方面军','Fourth Front Army'],second:['红二方面军及其前身','Second Front Army & its precursors']}
function exportRecord(r:RouteDossier,lang:Lang) {
  const zh=lang==='zh', doc=documents[r.id]
  const rows=[ '# '+r.title[lang], '中国军力 · 红军长征 / Long March | '+edition,
    r.lead[lang], (zh?'编目范围：':'Scope: ')+r.scope[lang],
    zh?'节点为已选史实，坐标仅为地名示意；未标出的日程和道路不作推算。':'Selected documented events. Map locations are approximate; intervening days and roads are not reconstructed.',
    ...r.stops.flatMap((s,i)=>['## '+num(i)+' · '+s.date[lang]+' · '+s.place[lang],s.body[lang],
      (zh?'建议引用：':'Cite as: ')+citeId(r,i)+' / '+edition,'['+s.refs.map(id=>'S'+num(r.sources.findIndex(a=>a.id===id))).join(', ')+']']),
    '## '+(zh?'节点依据':'Sources for the entries'),...r.sources.map((s,i)=>'[S'+num(i)+'] '+s.title[lang]+' — '+s.publisher[lang]+'\n'+s.locator[lang]+'\n'+s.url),
    '## '+(zh?'同期文献对读':'A contemporary document'), doc.date+' · '+(zh?doc.zhTitle:doc.enTitle),doc.institution[lang],doc.read[lang],doc.url]
  const blob=new Blob(['\uFEFF',rows.join('\n\n')+'\n'],{type:'text/markdown;charset=utf-8'})
  const url=URL.createObjectURL(blob),link=document.createElement('a')
  link.href=url;link.download='Long-March-'+r.id+'-'+lang+'-'+edition+'.md'
  document.body.appendChild(link); link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),3000)
}

function RegisterMap({route,current,lang,choose}:{route:RouteDossier;current:number;lang:Lang;choose:(n:number)=>void}) {
  const zh=lang==='zh'
  const pts=route.stops.map(s=>xy(s.lon,s.lat))
  const xx=pts.map(p=>p[0]),yy=pts.map(p=>p[1])
  const minX=Math.min(...xx),maxX=Math.max(...xx),minY=Math.min(...yy),maxY=Math.max(...yy)
  // Fit this route alone. All marker numbers remain legible regardless of geographic spread.
  const scale=Math.min(670/Math.max(maxX-minX,105),320/Math.max(maxY-minY,90))
  const left=380-(minX+maxX)*scale/2,top=196-(minY+maxY)*scale/2
  const mid=pts.map(([x,y])=>({x:left+x*scale,y:top+y*scale}))
  const pins:{x:number;y:number}[]=[]
  for(const [i,pt] of mid.entries()){
    let best={...pt}
    for(let step=0;step<120;step++) {
      const radius=step===0?0:15+Math.floor((step-1)/12)*8, angle=step*2.39996
      const x=pt.x+Math.cos(angle)*radius,y=pt.y+Math.sin(angle)*radius
      if(x>18&&x<742&&y>18&&y<375&&pins.every(p=>Math.hypot(x-p.x,y-p.y)>31)&&mid.every((p,j)=>i===j||Math.hypot(pt.x-p.x,pt.y-p.y)<2||Math.hypot(x-p.x,y-p.y)>9)){
        best={x,y};break
      }
    }
    pins.push(best)
  }
  const path=mid.map((p,i)=>(i===0||route.stops[i].breakBefore?'M':'L')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ')
  return <figure className="lm-register-map">
    <svg viewBox="0 0 760 396" aria-label={zh?'单队档案地图，编号对应下方节点目录':'Map of the selected force; numbers match the entry index'}>
      <title>{route.title[lang]}</title>
      <rect width="760" height="396" fill="#ded4b9"/>
      {relief && <image href={relief} x={left} y={top} width={800*scale} height={528*scale} preserveAspectRatio="none"/>}
      <path d={path} fill="none" stroke="#fff3d9" strokeWidth="6"/>
      <path d={path} fill="none" stroke={inks[route.id]} strokeWidth="2.8" strokeDasharray="6 4"/>
      {mid.map((p,i)=><g key={route.stops[i].id}>
        <line x1={p.x} y1={p.y} x2={pins[i].x} y2={pins[i].y} stroke="#483e31" strokeWidth="1.4"/>
        <circle cx={p.x} cy={p.y} r="3" fill={inks[route.id]}/>
      </g>)}
      {pins.map((pt,i)=><g key={route.stops[i].id} transform={`translate(${pt.x} ${pt.y})`} role="button" tabIndex={0} data-register-pin={i}
        aria-current={i===current?'location':undefined} aria-label={num(i)+' · '+route.stops[i].place[lang]}
        onClick={()=>choose(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i)}}}>
        <title>{route.stops[i].date[lang]} · {route.stops[i].place[lang]}</title>
        <circle r="15" fill={i===current?inks[route.id]:'#faf4e4'} stroke={inks[route.id]} strokeWidth={i===current?3:1.6}/>
        <text y="5" textAnchor="middle" fill={i===current?'#fff':'#26261e'}>{num(i)}</text>
      </g>)}
      <text x="728" y="25" fill="#352e25" textAnchor="middle">↑ N</text>
    </svg>
    <figcaption><b className="lm-reg-current">{num(current)} · {route.stops[current].place[lang]}　/　{route.stops[current].date[lang]}</b>{zh?'实点标大致地点；编号按阅读次序错开。虚线只连接同一叙事线索中的选点，不代表实走道路。':'Dots locate approximate places. Number labels may be displaced for clarity. Dashes connect selected events, not actual roads.'} <a href="https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-2/" target="_blank" rel="noreferrer">Natural Earth ↗</a></figcaption>
  </figure>
}

export function RouteRegister({lang,unit,stopId,onSelect,onClose}:{lang:Lang;unit:Unit;stopId:string;onSelect:(unit:Unit,stopId:string)=>void;onClose:()=>void}) {
  const r=getDossier(unit), zh=lang==='zh'
  const n=Math.max(0,r.stops.findIndex(s=>s.id===stopId)), stop=r.stops[n], doc=documents[r.id]
  const [playNext,setPlayNext]=useState(true)
  const [error,setError]=useState(false)
  const [notice,setNotice]=useState('')
  const player=useRef<HTMLAudioElement>(null), autoplay=useRef(false)
  const card=useRef<HTMLDivElement>(null)
  const [name,subtitle]=r.title[lang].split(/[：:]\s*/,2)
  const pendingKey=useRef('')
  const src=voiceUrls['./voices/'+r.id+'-'+stop.id+'.mp3']
  function select(route:RouteDossier,pos:number,play=false) {
    player.current?.pause();setError(false);setNotice('');autoplay.current=play
    pendingKey.current=play?route.id+':'+route.stops[pos].id:''
    onSelect(route.id,route.stops[pos].id)
  }
  function pick(pos:number){select(r,pos)}
  function readEntry(pos:number){pick(pos);if(matchMedia('(max-width:820px)').matches)requestAnimationFrame(()=>card.current?.scrollIntoView({block:'start'}))}
  async function copyLink(){
    try{await navigator.clipboard.writeText(location.href);setNotice(zh?'本条链接已复制':'Entry link copied')}
    catch{setNotice(location.href)}
  }
  useEffect(()=>{
    const media=player.current
    return ()=>{media?.pause()}
  },[src])
  const selectedSources=stop.refs.map(id=>r.sources.find(s=>s.id===id)!)
  return <section className="lm-register" data-dossier={unit} style={{'--route-ink':inks[unit]} as CSSProperties}>
    <div className="lm-reg-strap"><span>{zh?'行军路线志':'ROUTE REGISTER'}　/　1934–1936</span><button type="button" data-register-close onClick={onClose}>← {zh?'回到导览':'Return to guide'}</button></div>
    <nav className="lm-reg-tabs" aria-label={zh?'选择独立队伍路线':'Choose a force'}>{dossiers.map((d,i)=><button key={d.id} type="button" aria-pressed={d.id===unit} data-dossier-unit={d.id} onClick={()=>select(d,0)}><small>{num(i)}</small><b>{routeNames[d.id][zh?0:1]}</b></button>)}</nav>
    <header className="lm-reg-title"><small>{zh?'队伍专卷':'FORCE DOSSIER'} · {r.stops.length} {zh?'个节点':'entries'}</small>
      <h2>{name}{subtitle&&<><span className="lm-reg-divider">{zh?'：':': '}</span><span className="lm-reg-subtitle">{subtitle}</span></>}</h2><p>{r.lead[lang]}</p></header>
    <div className="lm-reg-grid">
      <div><RegisterMap route={r} current={n} lang={lang} choose={pick}/>
        <div className="lm-register-index"><h3>{zh?'节点目录':'Entry index'}</h3>
        <ol>{r.stops.map((s,i)=><li key={s.id}><button type="button" data-register-entry={i} aria-current={i===n?'step':undefined} onClick={()=>readEntry(i)}><small>{num(i)}</small><span>{s.place[lang]}</span></button></li>)}</ol></div>
      </div>
      <div className="lm-reg-card" ref={card} data-register-card={stop.id}>
        <div className="lm-reg-meta"><span>{num(n)} / {r.stops.length}</span><time>{stop.date[lang]}</time></div>
        <h3>{stop.place[lang]}</h3><p className="lm-reg-prose">{stop.body[lang]}</p>
        {stop.id.endsWith('shuangshipu')&&<button type="button" className="lm-query" data-same-place onClick={()=>{const other=getDossier(unit==='red25'?'second':'red25');select(other,other.stops.findIndex(s=>s.id.endsWith('shuangshipu')))}}>{zh?'同地对读：另一年来到双石铺的是谁？':'Same place, another year: who else came to Shuangshipu?'} ↗</button>}
        <div className="lm-reg-player">
          <b>{zh?'听这支队伍的路线':'Listen to this route'}</b><small>{zh?'普通话 · 云扬':'Mandarin · Yunyang'}</small>
          {src?<audio key={src} ref={player} controls preload="metadata" src={src}
            onLoadedMetadata={e=>{if(autoplay.current&&pendingKey.current===unit+':'+stop.id){autoplay.current=false;void e.currentTarget.play().catch(()=>setError(true))}}}
            onError={()=>setError(true)}
            onEnded={()=>{if(playNext&&n+1<r.stops.length)select(r,n+1,true)}}/>:<span>{zh?'本条音频尚未就绪':'Audio not ready'}</span>}
          <label><input type="checkbox" checked={playNext} onChange={e=>setPlayNext(e.target.checked)}/>{zh?'连续听本卷':'Play consecutive entries'}</label>
          {error&&<span role="status">{zh?'请重新点播放；仍可阅读全文。':'Press play again, or continue reading.'}</span>}
        </div>
        <div className="lm-reg-sources"><h4>{zh?'这一站的依据':'Evidence for this entry'}</h4>{selectedSources.map(s=><div key={s.id} data-source={s.id}>
          <span>S{num(r.sources.indexOf(s))}</span><div><a href={s.url} target="_blank" rel="noreferrer">{s.title[lang]} ↗</a><small>{s.publisher[lang]}</small><p>{s.locator[lang]}</p></div>
        </div>)}</div>
        <div className="lm-reg-step"><button type="button" disabled={n===0} onClick={()=>pick(n-1)}>← {zh?'上一站':'Previous'}</button><button type="button" disabled={n===r.stops.length-1} onClick={()=>pick(n+1)}>{zh?'下一站':'Next'} →</button></div>
      </div>
    </div>
    <div className="lm-reg-bottom">
      <article className="lm-reg-primary"><small>{zh?'同期文献 · 后出汇编本':'CONTEMPORARY DOCUMENT · LATER EDITION'}</small><time>{doc.date}</time>
        <h3>{zh?doc.zhTitle:doc.enTitle}</h3><p>{doc.read[lang]}</p><a href={doc.url} target="_blank" rel="noreferrer">{doc.institution[lang]} ↗</a></article>
      <aside className="lm-reg-scope"><h3>{zh?'编目与引用':'Scope and citation'}</h3><p>{r.scope[lang]}</p><code>{citeId(r,n)} · {edition}</code>
        <div><button type="button" onClick={copyLink}>{zh?'复制本条链接':'Copy entry link'}</button><button type="button" data-export-route onClick={()=>exportRecord(r,lang)}>{zh?'导出本卷与出处 ↓':'Export dossier & sources ↓'}</button></div>
        {notice&&<small role="status">{notice}</small>}
      </aside>
    </div>
  </section>
}

