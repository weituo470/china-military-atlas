import type { KoreaLang } from '../locales'
import { words, project, type Point } from './stages'

// One representative side of each front, never a unit position or a claim of
// control over the entire area. Pusan and the split northern front are exceptions
// to a simple north/south relationship.
const positions:readonly (readonly [Point,Point])[] = [
 [[126.8,38.8],[127.9,36.8]], [[127.2,37.2],[128.6,35.8]],
 [[127.65,35.92],[128.85,35.53]], [[128.22,37.25],[128.4,35.85]],
 [[126.45,40.22],[126.4,38.6]], [[126.1,40.3],[125.86,39.35]],
 [[126.85,38.8],[127.78,37.51]], [[127.22,37.92],[127.58,36.66]],
 [[127.6,38.68],[127.36,37.57]], [[127.4,38.34],[127.45,37.19]],
 [[127.45,38.83],[127.85,37.77]], [[127.45,38.83],[127.85,37.77]],
 [[127.45,38.83],[127.85,37.77]], [[127.45,38.83],[127.85,37.77]],
]
export function partyInfo(index:number,lang:KoreaLang) {
 const kpa=words('朝鲜人民军','Korean People’s Army','朝鮮人民軍')
 const cpv=words('中国人民志愿军','Chinese People’s Volunteers','中国人民志願軍')
 const rok=words('韩国军队','Republic of Korea forces','韓国軍')
 const unc=words('美军为主的联合国军','US-led UN Command','米軍を主力とする国連軍')
 return [
  {key:'a',color:'#923c27', short:(index<4?words('朝鲜军','KPA','朝鮮軍'):words('朝鲜军 · 志愿军','KPA · CPV','朝鮮軍・志願軍'))[lang],name:kpa[lang]+(index>=4?' · '+cpv[lang]:''),point:positions[index][0]},
  {key:'b',color:'#175978', short:(index===0?words('韩军','ROK','韓国軍'):words('韩军 · 联合国军','ROK · UNC','韓国軍・国連軍'))[lang],name:rok[lang]+(index>0?' · '+unc[lang]:''),point:positions[index][1]},
 ] as const
}
export function CampMarkers({index,lang,early}:{index:number;lang:KoreaLang;early:boolean}){
 return <g className="ka-camps">{partyInfo(index,lang).map((party,i)=>{
  const [x,y]=project(early?(i?[127.9,37.27]:[126.8,38.69]):party.point)
  const tx=i?462:71, ty=y+(i?27:-27)
  return <g key={party.key} className={'ka-camp ka-camp-'+party.key} data-party={party.key} aria-label={party.name}>
   <title>{party.name}</title>
   <path d={`M${x} ${y} l${i?13:-13} ${i?15:-15} H${i?tx-7:tx+7}`} fill="none" stroke={party.color} strokeWidth="2"/>
   <g transform={`translate(${x} ${y})`} fill={party.color} stroke="#fff6db" strokeWidth="1.6">{i?<rect x="-4.4" y="-4.4" width="8.8" height="8.8"/>:<path d="M0 -6L5.5 4.5H-5.5Z"/>}</g>
  <text x={tx} y={ty+(i?5:-1)} textAnchor={i?'end':'start'} fill={party.color}>{index===4&&!i?words('朝鲜军','KPA','朝鮮軍')[lang]:party.short}</text>
  </g>
 })}{index===4 && <g transform={`translate(${project([124.42,40.11]).join(' ')})`} fill="#923c27">
   <title>{words('志愿军从鸭绿江开始入朝；标注为边境一带，不是精确渡点。','The Volunteers begin entering across the Yalu; regional marker, not an exact crossing.','志願軍が鴨緑江を渡り始めた地域。正確な渡河地点ではない。')[lang]}</title>
   <circle r="4" stroke="#fff6db" strokeWidth="1.4"/><text x="5" y="-8">{words('志愿军渡江','CPV · Yalu','志願軍渡河')[lang]}</text>
 </g>}</g>
}
export function CampKey({index,lang}:{index:number;lang:KoreaLang}) {
 return <div className="ka-camp-key"><small>{words('图示时期的双方','Sides at the map date','参照時点の両陣営')[lang]}</small>{partyInfo(index,lang).map((p,i)=><div key={p.key} style={{color:p.color}}><b aria-hidden="true">{i?'■':'▲'}</b><span>{p.name}</span></div>)}</div>
}

