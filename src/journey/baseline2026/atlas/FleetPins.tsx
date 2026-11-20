import {useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as T from 'three'
import {planetGroupRef} from '../../../components/earth/planetApi'
import {latLngToVector3,EARTH_RADIUS} from '../../../utils/geo'
import {useAtlas,berths} from './visit'
import {REVIEW_NAVIES} from '../review'
import {words,navyNames} from './catalog'
import {tri,type BaselineLocale} from '../locale'

const pins=REVIEW_NAVIES.map(navy=>{
  const b=berths[navy.id].find(s=>s.modelId)!
  return {b,navy:navy.id,p:latLngToVector3(b.lat,b.lon,EARTH_RADIUS+.0025)}
})
export function FleetPinOverlay({language}:{language:BaselineLocale}){
  const mode=useAtlas(s=>s.mode),ready=useAtlas(s=>s.ready)
  if(!ready||mode!=='formation')return null
  return <div className="fleet-pin-overlay" aria-label={tri(language,'按国家近观舰艇','Inspect ships by country','国別に艦艇を見る')}>
    <svg aria-hidden="true" width="100%" height="100%">{pins.map(p=><g key={p.navy}><path data-lead={p.navy}/><circle data-dot={p.navy} r="2.8"/></g>)}</svg>
    {pins.map(p=><button type="button" key={p.navy} data-pin={p.navy} onClick={()=>useAtlas.getState().choose(p.b.modelId!,p.b.key)}>
      {language==='en'&&p.navy==='review-rok'?'ROK':language==='en'&&p.navy==='review-us'?'U.S.':words(navyNames[p.navy],language)}
    </button>)}
  </div>
}
function spread(records:{pos:number;len:number;fixed:number}[],min:number,max:number){
  records.sort((a,b)=>a.pos-b.pos)
  let cursor=min
  for(const p of records){p.fixed=Math.max(cursor+p.len*.5,Math.min(max-p.len*.5,p.pos));cursor=p.fixed+p.len*.5+6}
  cursor=max
  for(let i=records.length-1;i>=0;i--){const p=records[i];p.fixed=Math.min(p.fixed,cursor-p.len*.5);cursor=p.fixed-p.len*.5-6}
}
export function FleetPinProjection(){
  const tmp=useRef(new T.Vector3()),timer=useRef(1)
  useFrame(({camera,size},dt)=>{
    timer.current+=dt
    if(useAtlas.getState().mode!=='formation'||!planetGroupRef.current||timer.current<.12)return
    timer.current=0
    const frame=document.querySelector<HTMLElement>('.fleet-pin-overlay')
    if(!frame)return
    const top=(document.querySelector('.baseline-shell .journey-top')?.getBoundingClientRect().bottom??68)+7
    const bottom=(document.querySelector('.baseline-shell .journey-progress')?.getBoundingClientRect().top??size.height-145)-8
    const {width:w,height:h}=size,portrait=w/h<.89
    const set=pins.flatMap(({p,navy})=>{
      const button=frame.querySelector<HTMLButtonElement>('[data-pin="'+navy+'"]')
      if(!button)return []
      const v=tmp.current.copy(p).applyQuaternion(planetGroupRef.current!.quaternion).project(camera),x=(1+v.x)*w*.5,y=(1-v.y)*h*.5
      const first=portrait?['review-plan','review-rok','review-australia'].includes(navy):['review-plan','review-us','review-japan'].includes(navy)
      return [{button,navy,x,y,first,pos:portrait?y:x,len:portrait?button.offsetHeight:button.offsetWidth,fixed:0}]
    })
    for(const first of [false,true])spread(set.filter(p=>p.first===first),portrait?top+6:10,portrait?bottom-6:w-10)
    for(const p of set){
      const left=portrait?(p.first?p.button.offsetWidth/2+10:w-10-p.button.offsetWidth/2):p.fixed
      const y=portrait?p.fixed:top+(bottom-top)*(p.first?.17:.87)
      p.button.style.left=left+'px';p.button.style.top=y+'px'
      const endX=portrait?left+(p.first?1:-1)*p.button.offsetWidth*.4:left,endY=portrait?y:y+(p.first?1:-1)*p.button.offsetHeight*.45
      frame.querySelector('[data-lead="'+p.navy+'"]')?.setAttribute('d',`M ${p.x} ${p.y} L ${endX} ${endY}`)
      const dot=frame.querySelector('[data-dot="'+p.navy+'"]');dot?.setAttribute('cx',String(p.x));dot?.setAttribute('cy',String(p.y))
    }
    frame.style.visibility='visible'
  })
  return null
}

