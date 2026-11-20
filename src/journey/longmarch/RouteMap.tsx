import { useId, type KeyboardEvent } from 'react'
import type { Cue, Unit } from './content'
import { caption, height, places, routes, width, xy } from './map'
import type { Lang } from './sources'
const relief=import.meta.glob<string>('./relief.webp',{ eager:true,query:'?url',import:'default' })['./relief.webp']

type Place = keyof typeof places
type Pt = { lon: number; lat: number; at: number }
const trace = (path: Pt[]) => path.map((n,i) => (i ? 'L' : 'M') + xy(n.lon,n.lat).map(v=>v.toFixed(1)).join(' ')).join(' ')
const primary = ['yudu','hejia','cangxi','sangzhi','ganzi','zunyi','xiang','wuqi','yongping','huining','jiangtai']
const offset: Partial<Record<Place,[number,number]>> = { wuqi:[-12,-12], yongping:[11,-12], huining:[-15,21], jiangtai:[11,-9], cangxi:[11,-10], sangzhi:[13,-10], xiang:[13,19], ganzi:[-13,-11], grass:[-11,20], zunyi:[14,20], yudu:[-12,-9], hejia:[-13,21] }

export function RouteMap({ cue, lang, unit, onPlace }: { cue:Cue; lang:Lang; unit:Unit|'all'; onPlace:(id:string)=>void }) {
  const uid = useId()
  const zh = lang === 'zh'
  const selected = cue.place !== 'all' ? cue.place as Place : null
  const byUnit = unit !== 'all' ? unit : cue.unit
  const dots = Object.entries(places) as [Place, (typeof places)[Place]][]
  const onKey = (evt: KeyboardEvent<SVGGElement>, place: string) => {
    if (evt.key !== 'Enter' && evt.key !== ' ') return
    evt.preventDefault(); onPlace(place)
  }
  return (
    <figure className="lm-map" aria-label={zh ? '红军长征路线示意地图' : 'Schematic map of the Long March routes'}>
      <div className="lm-map-frame">
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="lm-map-svg">
          <title>{zh ? '四支队伍的长征' : 'The routes of four Red Army forces'}</title>
          <desc>{caption[lang]}</desc>
          {relief && <image href={relief} width={width} height={height} preserveAspectRatio="none" />}
          {[95,100,105,110,115].map(lon => <g key={lon} fill="#6c5d45" opacity=".7"><path d={`M${xy(lon,39)[0]} 0 V${height}`} className="lm-grid" /><text x={xy(lon,39)[0]+4} y={height-9} className="lm-degree">{lon}°E</text></g>)}
          {[25,30,35].map(lat => <g key={lat} fill="#6c5d45" opacity=".7"><path d={`M0 ${xy(92,lat)[1]} H${width}`} className="lm-grid" /><text x="7" y={xy(92,lat)[1]-6} className="lm-degree">{lat}°N</text></g>)}
          <g opacity=".78" fill="#483f2c" className="lm-terrain" aria-hidden="true">
            <text x="58" y="203">{zh?'青藏高原':'TIBETAN PLATEAU'}</text>
            <text x="459" y="43">{zh?'黄土高原':'LOESS PLATEAU'}</text>
            <text x="441" y="457">{zh?'云贵高原':'YUNNAN–GUIZHOU PLATEAU'}</text>
          </g>
          <g transform="translate(751 37)" fill="#4a4232" aria-hidden="true">
            <path d="M0 12 0 -10 -6 5 0 2 6 5 0 -10" fill="none" stroke="currentColor" />
            <text y="-15" x="0" textAnchor="middle" className="lm-degree">{zh?'北':'N'}</text>
          </g>
          {routes.flatMap(r => r.paths.map((path,i) => {
            const prominent = byUnit === undefined || byUnit === r.id
            const visited = trace(path.filter(pt=>pt.at<=cue.at))
            const overview = cue.place === 'all' && cue.at === 19361023
            const mask = overview ? uid + r.id + i : undefined
            const dim = unit === 'all' ? (prominent ? .28 : .18) : (prominent ? .33 : .11)
            return <g key={r.id+i} data-route-track={r.id} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {mask && <mask id={mask} maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}><path className="lm-route-draw" d={visited} pathLength="1" stroke="white" strokeWidth="14" /></mask>}
              {!overview && <path d={trace(path)} stroke={r.ink} strokeDasharray={r.dash} strokeWidth="2.6" opacity={dim}/>}
              <g mask={mask ? 'url(#'+mask+')' : undefined}>
              <path d={visited} stroke="#fff7e2" strokeWidth={prominent ? '6.8' : '5'} opacity={prominent ? .86 : .34}/>
              <path className={cue.place === 'all' ? 'lm-ink-line' : undefined} d={visited} stroke={r.ink} strokeDasharray={r.dash} strokeWidth={prominent ? '4' : '2.5'} opacity={prominent ? 1 : .4}/>
              </g>
              {path.filter(pt=>pt.at<=cue.at).map((pt,k)=><circle key={k} cx={xy(pt.lon,pt.lat)[0]} cy={xy(pt.lon,pt.lat)[1]} r={prominent?2.7:1.8} fill={r.ink} opacity={prominent?1:.55}/>)}
            </g>
          }))}
          {dots.filter(([id]) => id !== selected).concat(dots.filter(([id]) => id === selected)).map(([id, loc]) => {
            const [x,y] = xy(loc.lon,loc.lat)
            const [dx,dy] = offset[id] ?? [11,-11]
            const active = id === selected
            const start = 'start' in loc
            const name = loc.name[lang]
            return <g key={id} transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label={name} aria-current={active?'location':undefined}
              onKeyDown={e=>onKey(e,id)} onClick={()=>onPlace(id)} className={`lm-pin ${active?'is-current':''}`} data-place={id}>
              <title>{name}</title>
              <circle className="lm-pin-target" r="17" fill="transparent"/>
              {active && <circle className="lm-beacon" r="13" fill="none" stroke="#962b24" strokeWidth="1.6"/>}
              {start ? <rect x="-4.4" y="-4.4" width="8.8" height="8.8" rx="1" className="lm-pin-point" /> : <circle r={active?'5.8':'3.7'} className="lm-pin-point" />}
              {(active || primary.includes(id)) && <text className="lm-loc-label" data-minor={active ? undefined : !['yudu','wuqi','huining','sangzhi','ganzi','yongping'].includes(id)} x={dx} y={dy} textAnchor={dx<0 ? 'end' : 'start'}>{name}</text>}
            </g>
          })}
        </svg>
        <div className="lm-plate-no"><small>ATLAS / 07</small><span>{zh ? '路线示意' : 'Route schematic'}</span></div>
      </div>
      <figcaption><span>{caption[lang]}</span><a href="https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-2/" target="_blank" rel="noreferrer">{zh?'地形底图：Natural Earth':'Relief: Natural Earth'}</a></figcaption>
    </figure>
  )
}

