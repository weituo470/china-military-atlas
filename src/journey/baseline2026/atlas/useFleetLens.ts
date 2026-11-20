import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as T from 'three'
import type { OrbitControls } from 'three-stdlib'
import { planetGroupRef } from '../../../components/earth/planetApi'
import { EARTH_RADIUS,latLngToVector3 } from '../../../utils/geo'
import { useJourney } from '../../../store/journey'
import { atlasScale,fleetCatalog } from './catalog'
import { useAtlas } from './visit'
import { fleetOverview } from './formation'

// Camera coordinates follow the actual rotating Planet. No second canvas, scene,
// substituted hero model, or mini-diorama: this is the clicked berth on the sphere.
const bases={bow:[.84,.30],beam:[1.59,.16],overhead:[1.13,1.08]}
export function useFleetLens(reduced:boolean){
  const {camera,gl,get}=useThree()
  const view=camera as T.PerspectiveCamera
  const prev=useRef<{key:string;near:number;angle:number;elevation:number;dist:number}|null>(null)
  const vectors=useMemo(()=>Array.from({length:9},()=>new T.Vector3()),[])
  const [up,ahead,right,center,pos,target,sky,dir,normal]=vectors
  const frame=useRef({top:60,dock:150})
  useEffect(()=>{
    const hud=document.querySelector<HTMLElement>('.baseline-shell')
    const dock=hud?.querySelector<HTMLElement>('.journey-progress'),top=hud?.querySelector<HTMLElement>('.journey-top')
    const resize=()=>{frame.current={top:top?.offsetHeight?top.getBoundingClientRect().bottom:0,dock:dock?.offsetHeight?innerHeight-dock.getBoundingClientRect().top:0}}
    const observer=new ResizeObserver(resize);if(dock)observer.observe(dock);if(top)observer.observe(top);resize()
    const canvas=gl.domElement
    const points=new Map<number,{x:number;y:number}>()
    const isLive=()=>{const a=useAtlas.getState();return a.ready&&a.mode==='ship'&&!useJourney.getState().sourcesOpen&&!useJourney.getState().selectedCardId}
    const down=(e:PointerEvent)=>{if(!isLive()||e.button!==0)return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId)}
    const move=(e:PointerEvent)=>{
      const p=points.get(e.pointerId);if(!p||!isLive())return
      const other=[...points.entries()].find(([id])=>id!==e.pointerId)?.[1]
      if(other){const was=Math.hypot(p.x-other.x,p.y-other.y),now=Math.hypot(e.clientX-other.x,e.clientY-other.y);if(was>4&&now>4)useAtlas.getState().magnify(now/was)}
      else useAtlas.getState().drag((e.clientX-p.x)*.007,(e.clientY-p.y)*.006)
      points.set(e.pointerId,{x:e.clientX,y:e.clientY})
    }
    const upEvt=(e:PointerEvent)=>{points.delete(e.pointerId)}
    const wheel=(e:WheelEvent)=>{if(!isLive()||e.ctrlKey)return;e.preventDefault();useAtlas.getState().magnify(Math.exp(T.MathUtils.clamp(-e.deltaY*.0016,-.42,.42)))}
    canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('lostpointercapture',upEvt)
    canvas.addEventListener('pointerup',upEvt);canvas.addEventListener('pointercancel',upEvt);canvas.addEventListener('wheel',wheel,{passive:false})
    return ()=>{observer.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',upEvt);canvas.removeEventListener('pointercancel',upEvt);canvas.removeEventListener('lostpointercapture',upEvt);canvas.removeEventListener('wheel',wheel)
      if(prev.current){view.near=prev.current.near;view.updateProjectionMatrix();prev.current=null}
    }
  },[gl,view])
  return (dt:number)=>{
    const a=useAtlas.getState()
    if(!a.ready||a.mode==='notes'||useJourney.getState().beatIndex!==5||!planetGroupRef.current){
      if(prev.current){view.near=prev.current.near;view.updateProjectionMatrix();prev.current=null}
      return false
    }
    const b=a.berth,quat=planetGroupRef.current.quaternion
    if(a.mode==='formation'){
      prev.current={key:'formation',near:prev.current?.near??view.near,angle:0,elevation:0,dist:1}
      fleetOverview(view,quat,frame.current.top,frame.current.dock,get().size.height,get().controls as OrbitControls|undefined)
      return true
    }
    up.copy(latLngToVector3(b.lat,b.lon,1)).applyQuaternion(quat)
    northTangent(b.lat,b.lon,normal).applyQuaternion(quat)
    right.crossVectors(normal,up).normalize()
    ahead.copy(normal).add(right).normalize() // heading 45° east of north
    right.crossVectors(ahead,up).normalize()
    const {aspect}=view, len=fleetCatalog[b.modelId!].length*atlasScale,portrait=aspect<.83
    const base=bases[a.bearing],angle=base[0]+a.yaw-(portrait&&a.bearing==='bow'?.28:0)
    const elev=T.MathUtils.clamp(base[1]+a.pitch+(portrait&&a.bearing==='bow'?.19:0),.09,1.39)
    const fov=34,tan=Math.tan(T.MathUtils.degToRad(fov/2))
    const span=Math.max(.67,Math.abs(Math.sin(angle))+.18*Math.abs(Math.cos(angle)))
    const visible=T.MathUtils.clamp(1-(frame.current.top+frame.current.dock)/get().size.height,.36,.88)
    // A broadside and a bow-on view require different fitting distances, particularly in portrait.
    const d=len*Math.max(.99,span*.61/(aspect*tan)+.22,((.34+Math.abs(Math.cos(angle))*Math.sin(elev)*.46)/(tan*visible))*.78)*(portrait?1:.89)/a.zoom
    const old=prev.current,cut=!old||old.key!==b.key
    const k=reduced||cut?1:1-Math.exp(-Math.min(.1,dt)*10)
    const yaw=old&&!cut?old.angle+Math.atan2(Math.sin(angle-old.angle),Math.cos(angle-old.angle))*k:angle
    const pitch=old&&!cut?T.MathUtils.lerp(old.elevation,elev,k):elev
    const distance=old&&!cut?T.MathUtils.lerp(old.dist,d,k):d
    prev.current={key:b.key,near:old?.near??view.near,angle:yaw,elevation:pitch,dist:distance}
    center.copy(up).multiplyScalar(EARTH_RADIUS+.00035+len*.041)
    dir.copy(ahead).multiplyScalar(Math.cos(yaw)*Math.cos(pitch)).addScaledVector(right,Math.sin(yaw)*Math.cos(pitch)).addScaledVector(up,Math.sin(pitch))
    pos.copy(center).addScaledVector(dir,distance)
    sky.copy(up).addScaledVector(dir,-up.dot(dir)).normalize()
    const shift=T.MathUtils.clamp((frame.current.dock-frame.current.top)/get().size.height,-.17,.43)
    target.copy(center).addScaledVector(sky,-shift*distance*tan)
    view.position.copy(pos);view.up.copy(up);view.lookAt(target)
    if(view.near!==.0003||view.fov!==fov){view.near=.0003;view.fov=fov;view.updateProjectionMatrix()}
    const controls=get().controls as OrbitControls|undefined
    if(controls){controls.enabled=false;controls.target.copy(target)}
    return true
  }
}
function northTangent(lat:number,lon:number,out:T.Vector3){
  const a=T.MathUtils.degToRad(lat),l=T.MathUtils.degToRad(lon)
  return out.set(-Math.sin(a)*Math.cos(l),Math.cos(a),Math.sin(a)*Math.sin(l)).normalize()
}
