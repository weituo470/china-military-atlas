import { create } from 'zustand'
import { REVIEW_NAVIES, shipsForNavy, type ReviewNavyId, type ReviewShip } from '../review'
import { atlasIds, type AtlasId } from './catalog'

export type Berth=ReviewShip & {key:string;navyId:ReviewNavyId}
export const berths=Object.fromEntries(REVIEW_NAVIES.map(navy=>[
  navy.id,shipsForNavy(navy).map((ship,i)=>({...ship,key:navy.id+':'+i,navyId:navy.id})),
])) as Record<ReviewNavyId,Berth[]>
const all=Object.values(berths).flat()
export const exemplar=(id:AtlasId)=>all.find(b=>b.modelId===id)!
export const findBerth=(key:string)=>all.find(b=>b.key===key)
export type ViewMode='ship'|'formation'|'notes'
export type Bearing='bow'|'beam'|'overhead'
const initial=()=>({ready:false,mode:'ship' as ViewMode,berth:exemplar('liaoning'),bearing:'bow' as Bearing,yaw:0,pitch:0,zoom:1,manual:false,clean:false})
type Visit=ReturnType<typeof initial> & {
  enter:()=>void;leave:()=>void;choose:(id:AtlasId,key?:string)=>void;
  show:(mode:ViewMode)=>void;angle:(v:Bearing)=>void;drag:(x:number,y:number)=>void;
  magnify:(factor:number)=>void;cue:(paragraph:number)=>void
  toggleClean:()=>void
}
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n))
export const useAtlas=create<Visit>((set,get)=>({
  ...initial(),
  enter:()=>{
    const q=new URLSearchParams(location.search), id=q.get('ship') as AtlasId
    set({...initial(),ready:true,...(atlasIds.includes(id)?{berth:exemplar(id),manual:true}:{}),
      ...(q.get('view')==='fleet'?{mode:'formation',manual:true}:{})})
  },
  leave:()=>set(initial()),
  toggleClean:()=>{if(get().ready&&get().mode!=='notes')set(s=>({clean:!s.clean,manual:true}))},
  choose:(id,key)=>{const b=key?findBerth(key):undefined;set({berth:b?.modelId===id?b:exemplar(id),mode:'ship',manual:true,yaw:0,pitch:0,zoom:1})},
  show:mode=>set({mode,manual:true}),
  angle:bearing=>set({bearing,yaw:0,pitch:0,zoom:1,manual:true}),
  drag:(dx,dy)=>set(s=>({yaw:(s.yaw+dx)%(Math.PI*2),pitch:clamp(s.pitch+dy,-1.2,1.2),manual:true})),
  magnify:f=>set(s=>({zoom:clamp(s.zoom*f,.75,1.65),manual:true})),
  cue:p=>{if(!get().manual)set({mode:p===2?'formation':'ship',berth:exemplar((['liaoning','fujian','liaoning','izumo'] as const)[p]??'liaoning'),yaw:0,pitch:0,zoom:1})},
}))

