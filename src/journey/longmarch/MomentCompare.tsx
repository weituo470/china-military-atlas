import { useEffect, useId, useRef, useState } from 'react'
import { bi, type Lang } from './sources'
import type { Unit } from './content'
import { moments, momentPlaces, momentSources, type Moment, type Place, type RecordKind } from './moment-data'
const relief=import.meta.glob<string>('./relief.webp',{ eager:true,query:'?url',import:'default' })['./relief.webp']
import './moment.css'

const kindLabel = {
  on:bi('当日可证','On this date'), prior:bi('此前记录','Earlier record'),
  future:bi('尚未共同出发','Not yet departed together'), lineage:bi('按番号追溯','By organizational lineage'),
}
const color:Record<Unit,string> = {first:'#962b24',red25:'#286058',fourth:'#745019',second:'#39547c'}
const day = (at:number) => Date.UTC(Math.floor(at/10000), Math.floor(at%10000/100)-1,at%100)
const nearest = (at:number) => moments.reduce((best,moment,i)=>Math.abs(day(moment.at)-day(at)) < Math.abs(day(moments[best].at)-day(at)) ? i : best,0)

type Props = {lang:Lang;initialAt:number;onClose:()=>void;onAtChange?:(at:number)=>void;onRoute?:(unit:Unit)=>void}
type MapProps = {moment:Moment;lang:Lang;unit:Unit;setUnit:(unit:Unit)=>void}

function FrameMap({moment,lang,unit,setUnit}:MapProps) {
  const zh=lang==='zh'
  const selected=moment.rows.find(row=>row.id===unit)!
  const w=640,h=320, wide=moment.at===19351019
  const [west,east,south,north]=wide ? [98.7,112.5,29.0,38.8] : [103.4,107.3,34.12,36.62]
  const x=(lon:number)=>(lon-west)*w/(east-west),y=(lat:number)=>(north-lat)*h/(north-south)
  const groups = Object.keys(momentPlaces).map(key=>({
    key:key as Place,place:momentPlaces[key as Place],rows:moment.rows.filter(row=>row.point===key),
  })).filter(g=>g.rows.length)
  const ticksLon = (wide ? [100,104,108,112] : [104,105,106,107])
  const ticksLat = (wide ? [30,33,36] : [34.5,35.5,36.5])
  return <figure className="lm-moment-map" aria-label={zh?'有日期依据的地点图':'Map of documented places'}>
    <svg data-moment-map={moment.at} viewBox={'0 0 '+w+' '+h} role="group" aria-label={zh?'点地点查看所涉队伍':'Select a place to inspect its forces'}>
      <title>{moment.date[lang]}</title>
      {relief && <image href={relief} x={x(92)} y={y(39)} width={25*w/(east-west)} height={16*h/(north-south)} preserveAspectRatio="none"/>}
      {ticksLon.map(lon=><g key={lon} aria-hidden="true"><path className="lm-moment-gridline" d={'M'+x(lon)+' 0V'+h}/><text className="lm-moment-axis" textAnchor={x(lon)>w-50?'end':'start'} x={x(lon)+(x(lon)>w-50?-3:3)} y={h-7}>{lon}°E</text></g>)}
      {ticksLat.map(lat=><g key={lat} aria-hidden="true"><path className="lm-moment-gridline" d={'M0 '+y(lat)+'H'+w}/><text className="lm-moment-axis" x="5" y={y(lat)-4}>{lat}°N</text></g>)}
      <g transform="translate(610 30)" aria-hidden="true"><path d="M0 13V-7l-5 10m5-10 5 10" stroke="#584f3c" fill="none" strokeWidth="1.8"/><text className="lm-moment-axis" textAnchor="middle" y="-12">N</text></g>
      {groups.map(({key,place,rows})=>{
        const current = rows.some(r=>r.id===unit), kind=rows[0].kind
        const next = rows[(rows.findIndex(r=>r.id===unit)+1)%rows.length].id
        const left = key==='wuqi' || key==='huining' || key==='laoshan'
        const tx=left?-16:16, ty= key==='wuqi'?-8:key==='laoshan'?28:key==='huining'?13:-6
        return <g key={key} role="button" tabIndex={0} className={'lm-moment-pin'+(current?' is-current':'')} data-moment-point={key} data-map-kind={kind}
          aria-label={place.name[lang]+' · '+rows.map(r=>r.name[lang]).join(' / ')} aria-pressed={current}
          transform={'translate('+x(place.lon)+' '+y(place.lat)+')'} onClick={()=>setUnit(next)}
          onKeyDown={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();setUnit(next)}}}>
          <title>{place.name[lang]} · {kindLabel[kind][lang]} · {rows.map(r=>r.name[lang]).join(' / ')}</title>
          <circle className="lm-moment-hit" r="20" fill="transparent"/>
          {current && <circle r="13" fill="none" stroke="#8b2c22" strokeWidth="1.6"/>}
          <circle r="6.3" stroke="#312d24" strokeWidth="2.3" fill={kind==='on'?'#312d24':'#f7eddb'} strokeDasharray={kind==='prior'?'4 2':undefined}/>
          <text className="lm-moment-pin-label" textAnchor={left?'end':'start'} x={tx} y={ty}>{place.name[lang]}</text>
        </g>
      })}
    </svg>
    <figcaption>
      <div className="lm-moment-key"><span><i className="is-solid"/>{zh?'所选日的活动':'On selected date'}</span> <span><i/>{zh?'此前的活动':'Earlier event'}</span></div>
      <p>{selected.point ? (zh?'地点按今址约示；同地会师只标一个点。':'Approximate modern locations; a reunion shares one point.') : (zh?'当前所选队伍未单独落点：没有当日独立位置依据。':'No separate marker for the selected force: no independent position established for this day.')}</p>
      <a href="https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-2/" target="_blank" rel="noreferrer">{zh?'地形：Natural Earth II':'Relief: Natural Earth II'} ↗</a>
    </figcaption>
  </figure>
}

export function MomentCompare({lang,initialAt,onClose,onAtChange,onRoute}:Props) {
  const zh=lang==='zh',uid=useId()
  const [index,setIndex]=useState(()=>nearest(initialAt))
  const [unit,setUnit]=useState<Unit>('first')
  const lastReported=useRef<number|undefined>(undefined)
  const heading=useRef<HTMLHeadingElement>(null)
  const moment=moments[index], selected=moment.rows.find(row=>row.id===unit)!
  useEffect(()=>{ heading.current?.focus({preventScroll:true}) },[])
  useEffect(()=>{
    if(onAtChange && lastReported.current!==moment.at){lastReported.current=moment.at;onAtChange(moment.at)}
  },[moment.at,onAtChange])
  useEffect(()=>{setIndex(nearest(initialAt))},[initialAt])
  return <section className="lm-moment" data-active-moment={moment.at} aria-labelledby={uid+'title'}
    onKeyDown={event=>{if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();onClose()}}}>
    <div className="lm-moment-mast">
      <span>{zh?'长征图志 / 同日对照':'Long March atlas / Dated comparisons'}</span>
      <button type="button" onClick={onClose} data-moment-close>{zh?'← 返回导览':'← Back to guide'}</button>
    </div>
    <div className="lm-moment-heading"><h2 ref={heading} tabIndex={-1} id={uid+'title'}>{zh?'这一刻，其他队伍呢？':'Where were the other forces?'}</h2>
    <p>{zh?'选同一个日子，横看四支队伍。留白不等于停步：没有当日驻地记录，就不推算位置。':'Read across four forces on the same date. A gap in the record is not a halt: positions are not inferred.'}</p></div>
    <div className="lm-moment-dates" role="group" aria-label={zh?'选择日期':'Choose a date'}>
      {moments.map((m,i)=><button type="button" onClick={()=>setIndex(i)} data-moment-at={m.at} aria-pressed={i===index} key={m.at}>
        <time dateTime={String(m.at).replace(/^(\d{4})(\d{2})(\d{2})$/,'$1-$2-$3')}>{m.date[lang]}</time><span>{m.label[lang]}</span>
      </button>)}
    </div>
    <p className="lm-moment-thesis" aria-live="polite">{moment.lead[lang]}</p>
    <div className="lm-moment-work">
      <div><FrameMap moment={moment} lang={lang} unit={unit} setUnit={setUnit}/></div>
      <div className="lm-moment-register">
        <h3>{zh?'四队纪事':'The four records'}</h3>
        <p>{zh?'选一支队伍，读下方证据。':'Select a force to read its evidence below.'}</p>
        {moment.rows.map((row,n)=><button type="button" className="lm-moment-row" data-moment-unit={row.id} data-record-kind={row.kind}
          key={row.id} onClick={()=>setUnit(row.id)} aria-pressed={unit===row.id} aria-controls={uid+'detail'}>
          <span className="lm-moment-rank" style={{color:color[row.id]}}>{String(n+1).padStart(2,'0')}</span>
          <span className="lm-moment-rowwords"><strong>{row.name[lang]}</strong><span>{row.status[lang]}</span></span>
          <span className={'lm-moment-tag t-'+row.kind}>{kindLabel[row.kind as RecordKind][lang]}</span>
        </button>)}
      </div>
    </div>
    <article className="lm-moment-document" id={uid+'detail'} data-moment-evidence={unit}>
      <div className="lm-moment-document-head"><span>{zh?'核对这条记载':'Check this record'}</span><h3>{selected.name[lang]}</h3><b>{selected.date[lang]}</b></div>
      <div><p className="lm-moment-body">{selected.body[lang]}</p>
      <details key={moment.at+'-'+unit} className="lm-moment-cites">
        <summary>{zh?'出处与原文定位':'Sources and passages'} ({selected.refs.length})</summary>
        <ol>{selected.refs.map(id=><li key={id}><a href={momentSources[id].url} rel="noreferrer" target="_blank">{momentSources[id].label[lang]} ↗</a><small>{momentSources[id].locator[lang]}</small></li>)}</ol>
      </details>{onRoute&&<button type="button" data-open-route={unit} className="lm-query" onClick={()=>onRoute(unit)}>{zh?'从首站读这支队伍的路线志':'Read this force’s route from the first entry'} →</button>}</div>
    </article>
  </section>
}
export default MomentCompare

