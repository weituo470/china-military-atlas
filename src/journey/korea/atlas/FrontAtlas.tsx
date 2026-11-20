import { memo, useEffect, useId, useState } from 'react'
import { toggleKoreaAudio, useKoreaStatus } from '../playback'
import { useJourney } from '../../../store/journey'
import type { KoreaLang } from '../locales'
import coasts from './coasts.json'
import { project, STAGES, words, type Point } from './stages'
import { referenceFronts, scenes, type SceneId } from './cues'
import { CampKey, CampMarkers } from './parties'

const L = {
  atlas: words('半岛战线图志', 'Peninsula war atlas', '朝鮮半島 戦線図'),
  front: words('本期战线', 'Front', '当期の戦線'),
  prior: words('上一阶段', 'Prior front', '前の戦線'),
  latitude: words('三八线', '38th parallel', '38度線'),
  play: words('按年代连播', 'Play timeline', '年代順に再生'),
  pause: words('暂停演变', 'Pause timeline', '推移を一時停止'),
  follow: words('随解说', 'Follow narration', '解説に同期'),
  pick: words('选择战线阶段', 'Select a phase', '戦線の時期を選ぶ'),
  map: words('朝鲜半岛全貌，北至鸭绿江、图们江，南至济州岛', 'The entire Korean peninsula, from the Yalu and Tumen to Jeju Island', '鴨緑江・豆満江から済州島までの朝鮮半島全図'),
  approximate: words('分期示意', 'Schematic', '概略図'),
  review: words('独立阅图', 'Map review', '図の閲覧'),
  chron: words('年代连播', 'Timeline', '年代順'),
  wide: words('放大地图','Enlarge map','地図を拡大'),
  normal: words('返回图文','Back to briefing','図文に戻る'),
  subtitle: words('解说原文','Narration','解説本文'),
}
export const cartographyNote = words(
  '年代线共14期。解说另用9月30日、10月5日两张态势示意校对十月外交事件。标题日期是解说事件，「战线参照」是地图的日期，两者不一定同日。深色实线为本期前沿，虚线为上期，点线为三八线。三角和方块标示图示时期的双方，不是精确驻军点或完整控制区。末期实线为停战军事分界线。',
  'The timeline has 14 phases. Additional 30 September and 5 October snapshots provide context for the October diplomatic events. The event date and the map reference date may differ. Solid: current front; dashed: previous; dotted: 38°N. The triangle and square identify opposing sides, not unit positions or territorial boundaries. The final solid line represents the armistice demarcation line.',
  '年代順の全14期に加え、10月の外交を解説する際は9月30日と10月5日の概略図も参照する。見出しは出来事の日付、「戦線の参照時点」は地図の日付で、同日とは限らない。実線は当期の前線、破線は前期、点線は北緯38度。三角と四角は両陣営を示し、駐屯地点や支配域を表すものではない。最終図の実線は休戦時の軍事境界線。')
const cities = [
  [[125.75,39.03], words('平壤','Pyongyang','平壌'), -8, -6],
  [[126.98,37.57], words('汉城','Seoul','ソウル'), 9, 13],
  [[129.08,35.10], words('釜山','Pusan','釜山'), 9, 8],
  [[126.54,33.38], words('济州岛','Jeju','済州島'), 12, 5],
] as const
const events = {
  3: [[126.62,37.47],words('仁川','Inchon','仁川')],
  11: [[127.47,38.3],words('上甘岭','Triangle Hill','上甘嶺')],
  12: [[127.65,38.43],words('金城','Kumsong','金城')],
  13: [[126.68,37.96],words('板门店','Panmunjom','板門店')],
} as const
function path(points: readonly Point[]) {
  return points.map((point, i) => (i ? 'L' : 'M') + project(point).map(n => n.toFixed(1)).join(' ')).join('')
}
const fronts = STAGES.map(s => s.front.map(path))
const Chart = memo(function Chart({index, lang, reference}: {index:number; lang:KoreaLang; reference?:keyof typeof referenceFronts}) {
  const clip = useId()
  const titleId = useId()
  const event = !reference && events[index as keyof typeof events]
  const paths=reference?referenceFronts[reference].front.map(path):fronts[index]
  const labelPos = event && project(event[0])
  return <svg className="ka-geography" viewBox="64 -2 410 498" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby={titleId}>
    <title id={titleId}>{L.map[lang]} · {reference?referenceFronts[reference].date:STAGES[index].date}</title>
    <defs><clipPath id={clip}><path d={coasts.peninsula}/></clipPath></defs>
    <path d={coasts.mainland} fill="#bdbda4" stroke="#8c917e" strokeWidth=".8"/>
    <path d={coasts.japan} fill="#c7c6ae" stroke="#8c917e" strokeWidth=".8"/>
    <path className="ka-land" d={coasts.peninsula} fill="#f2e8c9" stroke="#797762" strokeWidth="1.35" strokeLinejoin="round"/>
    <g stroke="#768e84" strokeWidth=".65" opacity=".45" fill="none">
      {[125,130].map(lon => <path key={lon} d={path([[lon,27],[lon,50]])}/>)}
      {[35,40].map(lat => <path key={lat} d={path([[115,lat],[142,lat]])}/>)}
    </g>
    <path d={path([[115,38],[142,38]])} stroke="#345d6b" strokeWidth="1.6" strokeDasharray="1.6 4.5" fill="none"/>
    <text className="ka-lat" x="79" y={project([124,38])[1]-5}>38°N</text>
    <text className="ka-region" x="185" y="76" textAnchor="middle">{words('中国东北','NORTHEAST CHINA','中国東北部')[lang]}</text>
    <text className="ka-river" x="188" y="137" transform="rotate(-35 188 137)">{words('鸭绿江','Yalu','鴨緑江')[lang]}</text>
    <g clipPath={`url(#${clip})`} fill="none" strokeLinejoin="round" strokeLinecap="round">
      {index > 0 && (reference==='oct05'?referenceFronts.sep30.front.map(path):fronts[reference?index:index-1]).map((d,i) => <path key={'old'+i} className="ka-prior" d={d} stroke="#695647" strokeWidth="2.5" strokeDasharray="5 5"/>)}
      <g key={reference??index} className="ka-current">
        {paths.map((d,i) => <g key={i}><path d={d} stroke="#fff4d8" strokeWidth="6"/><path d={d} stroke="#3e3025" strokeWidth="3.8"/></g>)}
      </g>
    </g>
    {cities.map(([point,name,dx,dy]) => { const [x,y]=project(point); return <g key={name.en}>
      <circle cx={x} cy={y} r="2.8" fill="#302e27" stroke="#fff8e2" strokeWidth="1.2"/>
      <text className="ka-place" x={x+dx} y={y+dy} textAnchor={dx<0?'end':'start'}>{name[lang]}</text>
    </g> })}
    {event && labelPos && <g className="ka-event" transform={`translate(${labelPos[0]} ${labelPos[1]})`}>
      <path d="M0 0 L-20 -18 H-29" fill="none" stroke="#853322" strokeWidth="1.6"/>
      <circle r="3.5" fill="#a03622" stroke="#fff8e2" strokeWidth="1.5"/>
      <text x="-32" y="-14" textAnchor="end" className="ka-place">{event[1][lang]}</text>
    </g>}
    <CampMarkers index={index} lang={lang} early={!!reference}/>
    <g transform="translate(443 35)" fill="#344e4c"><text textAnchor="middle" y="-6" className="ka-lat">N</text><path d="M0 0 l-4 17 4-3 4 3z"/></g>
    <g transform="translate(84 460)" stroke="#48615b" fill="none"><path d="M0 -4V0H40.5V-4"/><text y="16" className="ka-lat" stroke="none" fill="#405954">100 km</text></g>
  </svg>
})
type Mode = 'follow' | 'chronology' | 'pinned'
function Key({lang}:{lang:KoreaLang}) {
  return <div className="ka-key"><small>{L.approximate[lang]}</small>
    <span><i/>{L.front[lang]}</span><span><i/>{L.prior[lang]}</span><span><i/>{L.latitude[lang]}</span></div>
}
export function FrontAtlas({sceneId, readingKey, onBrowse, lang, wide, onWide}:{sceneId:SceneId;readingKey:string; onBrowse:(i:number|null)=>void; lang:KoreaLang; wide:boolean; onWide:()=>void}) {
  const status=useKoreaStatus()
  const inspecting = useJourney(s=>s.sourcesOpen || !!s.selectedCardId)
  const [mode,setMode] = useState<Mode>('follow')
  const [manual,setManual] = useState(0)
  const [visible,setVisible] = useState(!document.hidden)
  useEffect(()=>{ if(status==='playing')setMode('follow') },[status])
  useEffect(()=>{setMode('follow')},[readingKey])
  useEffect(()=>{onBrowse(mode==='follow'?null:manual)},[manual,mode,onBrowse])
  function review() { if(status==='playing')toggleKoreaAudio() }
  useEffect(() => {
    const update=()=>setVisible(!document.hidden)
    document.addEventListener('visibilitychange',update)
    return ()=>document.removeEventListener('visibilitychange',update)
  },[])
  useEffect(() => {
    if (mode!=='chronology' || inspecting || !visible) return
    const id=window.setTimeout(()=>{
      if (manual === STAGES.length-1) setMode('pinned')
      else setManual(manual+1)
    },4600)
    return ()=>clearTimeout(id)
  },[manual,mode,inspecting,visible])
  const cue=mode==='follow'?scenes[sceneId]:undefined
  const index=cue?cue.stage:manual
  const reference=cue?.ref
  const stage=STAGES[index]
  function playTimeline() {
    if (mode==='chronology') { setMode('pinned'); return }
    review()
    if (mode==='follow' || manual===STAGES.length-1) setManual(0)
    setMode('chronology')
  }
  return <section className="korea-atlas" aria-label={L.atlas[lang]} data-mode={mode} data-stage={index} data-scene={cue?sceneId:undefined}>
    <header className="ka-heading"><b>{L.atlas[lang]}</b><span>{mode==='follow'?'1950 — 1953':mode==='chronology'?L.chron[lang]:L.review[lang]}</span>
      <button className="ka-size" type="button" aria-pressed={wide} onClick={onWide}>{wide?L.normal[lang]:L.wide[lang]}</button></header>
    <div className="ka-field">
      <Chart index={index} lang={lang} reference={reference}/>
      <Key lang={lang}/>
    </div>
    <div className="ka-notes">
      <div className="ka-phase"><span>{cue?.date??stage.date}</span><small>{String(index+1).padStart(2,'0')} / {STAGES.length}</small></div>
      <h2>{(cue?.title??stage.title)[lang]}</h2>
      {cue && <div className="ka-reference">{words('战线参照','Front shown','戦線の参照時点')[lang]} · {reference?referenceFronts[reference].date:stage.date}</div>}
      <CampKey index={index} lang={lang}/>
      {cue && sceneId==='fleet' && <p className="ka-context">{words('6月27日美国宣布海空支援；图中为开战时的地面双方。','On 27 June the US ordered air and naval support. The map identifies the ground forces at the outbreak.','6月27日、米国が海空支援を表明。図の両陣営は開戦時の地上軍。')[lang]}</p>}
      {cue && (sceneId==='seat'||sceneId==='report') && <p className="ka-context">{words('此处回看停战线，并非该年的新战线。','The map recalls the armistice line, not a new front on the date discussed.','休戦線を参照しており、解説時点の新たな戦線ではない。')[lang]}</p>}
      <Key lang={lang}/>
    </div>
    <div className="ka-tools"><input type="range" min="0" max={STAGES.length-1} step="1" value={index} aria-label={L.pick[lang]}
      aria-valuetext={`${index+1} / ${STAGES.length} · ${stage.date} · ${stage.title[lang]}`}
      onChange={e=>{review();setManual(+e.target.value);setMode('pinned')}}/>
      <div><button type="button" className="ka-play" onClick={playTimeline} aria-pressed={mode==='chronology'}><span aria-hidden="true">{mode==='chronology'?'Ⅱ':'▶'}</span> {mode==='chronology'?L.pause[lang]:L.play[lang]}</button>
      <button type="button" className="ka-follow" aria-pressed={mode==='follow'} onClick={()=>setMode('follow')}>{L.follow[lang]}</button></div>
    </div>
  </section>
}
