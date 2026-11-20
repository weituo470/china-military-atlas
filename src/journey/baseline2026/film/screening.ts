import * as T from 'three'
import { makeCarrier } from './ships'
import { makeEscort } from './escort'
import { makeSea } from './sea'
import { parkedAircraft } from './parked'

type V3 = [number,number,number]
type Vessel = 'liaoning'|'shandong'|'nanchang'|'fujian'
type Stage = { from:V3; to:V3; a:V3; b:V3; fov:number; time:number; cast:readonly [Vessel,number,number][] }
const shots:Stage[]=[
  // Low starboard bow; the rise of the forward deck is cut against open sky.
  {time:0,fov:26,from:[-75,13,100],to:[-91,16,75],a:[0,5.3,7],b:[0,5.3,5],cast:[['liaoning',0,0]]},
  // Reverse to the after quarter and lift: folded wings, angled deck and compact island.
  {time:5,fov:32,from:[-71,51,-106],to:[-83,41,-88],a:[0,4,-5],b:[0,4,-3],cast:[['shandong',0,0]]},
  // A tighter lateral tracking shot. The escort is never enlarged in the group view.
  {time:10,fov:25,from:[-60,14,57],to:[-64,13,40],a:[0,3.2,2.3],b:[0,3.8,1.7],cast:[['nanchang',0,0]]},
  // High opposite quarter: leave negative space ahead of the straight flight deck.
  {time:14,fov:32,from:[70,64,108],to:[82,48,91],a:[0,4,5],b:[0,4,4],cast:[['fujian',0,0]]},
  // Editorial grouping, deliberately not laid over geographic coordinates.
  {time:20,fov:35,from:[-130,140,-219],to:[-149,153,-251],a:[-3,1,-16],b:[-5,1,-16],cast:[['liaoning',-56,-47],['shandong',57,-20],['fujian',0,47]]},
]
const duration=25
declare global {interface Window {fleetFilm:{ready:Promise<void>;duration:number;seek:(time:number)=>void;play:()=>void;pause:()=>void}}}
const canvas=document.querySelector('canvas')!
let done!:()=>void,fail!:(err:unknown)=>void
const ready=new Promise<void>((resolve,reject)=>{done=resolve;fail=reject})
let frame=0, t=0, previous=-1, stamp=0
let draw:(time:number)=>void=()=>{}
const pause=()=>{cancelAnimationFrame(frame);frame=0}
const seek=(s:number)=>{pause();draw(T.MathUtils.clamp(Number.isFinite(s)?s:0,0,duration))}
function play(){
  pause();stamp=performance.now()-(t>=duration?0:t)*1000
  const tick=(n:number)=>{draw(Math.min(duration,Math.max(0,(n-stamp)/1000))); if(t<duration)frame=requestAnimationFrame(tick);else frame=0}
  frame=requestAnimationFrame(tick)
}
window.fleetFilm={ready,duration,seek,play,pause}
try {
  const scene=new T.Scene()
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true})
  renderer.outputColorSpace=T.SRGBColorSpace
  renderer.toneMapping=T.NoToneMapping
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false
  const cam=new T.PerspectiveCamera(30,16/9,.5,4500)
  const sea=makeSea(scene)
  // Reflection pass uses the same hulls and lens, not decals or a stock cubemap.
  // Only the ocean samples this target. Keep it soft: waves should break up
  // the reflected mass, never mirror every window like a sheet of glass.
  const reflection=new T.WebGLRenderTarget(960,540,{depthBuffer:true})
  const waterObjects:T.Mesh[]=[]
  scene.getObjectByName('Sea / daylight exterior')?.traverse(n=>{if(n instanceof T.Mesh)waterObjects.push(n)})
  const key=scene.getObjectByName('Sea / key light') as T.DirectionalLight|undefined
  if(key){
    const direction=key.position.clone().sub(key.target.position).normalize()
    key.target.position.set(0,0,0);scene.add(key.target);key.position.copy(direction).multiplyScalar(190)
    key.castShadow=true;key.shadow.mapSize.set(2048,2048)
    Object.assign(key.shadow.camera,{left:-76,right:76,top:76,bottom:-76,near:8,far:290})
    key.shadow.camera.updateProjectionMatrix();key.shadow.bias=-.00065;key.shadow.normalBias=.065
    key.shadow.intensity=.60
  }
  const props=parkedAircraft()
  const vessels:Record<Vessel,T.Group>={liaoning:makeCarrier('liaoning'),shandong:makeCarrier('shandong'),fujian:makeCarrier('fujian'),nanchang:makeEscort()}
  for(const id of ['liaoning','shandong','fujian'] as const){
    const obj=vessels[id], y={liaoning:5.9,shandong:6.1,fujian:6.4}[id]
    for(const z of [-31.5,-25.7,-19.8]){
      const plane=props.clone();plane.rotation.y=1.13;plane.position.set(-5.1,y+.04,z);obj.add(plane)
    }
  }
  for(const ship of Object.values(vessels)){
    ship.traverse(n=>{if(n instanceof T.Mesh && !n.material?.transparent){n.castShadow=true;n.receiveShadow=true}})
    scene.add(ship)
  }
  const dest=new T.Vector3(),delta=new T.Vector3(),look=new T.Vector3()
  let wakes:{x:number;z:number;length:number;beam:number}[]=[]
  draw=(time)=>{
    t=time
    const i=shots.findLastIndex(s=>s.time<=t),s=shots[i],end=shots[i+1]?.time??duration
    const raw=(t-s.time)/(end-s.time),u=raw*(.85+.15*raw*(3-2*raw))
    const vec=(a:V3,b:V3)=>dest.fromArray(a).lerp(delta.fromArray(b),u)
    cam.position.copy(vec(s.from,s.to));look.copy(vec(s.a,s.b));cam.lookAt(look)
    cam.fov=s.fov;cam.updateProjectionMatrix()
    if(i!==previous){
      previous=i;Object.values(vessels).forEach(v=>{v.visible=false})
      wakes=s.cast.map(([id,x,z])=>{
        const ship=vessels[id];ship.visible=true;ship.position.set(x,0,z)
        const dims={nanchang:[54,6.0],liaoning:[98,12.4],shandong:[99,12.8],fujian:[101,14.8]}[id]
        return {x,z,length:dims[0],beam:dims[1]}
      })
      renderer.shadowMap.needsUpdate=true
    }
    sea.update(time,wakes,cam)
    waterObjects.forEach(o=>{o.visible=false})
    s.cast.forEach(([id])=>{vessels[id].scale.y=-1})
    renderer.shadowMap.enabled=false
    renderer.setRenderTarget(reflection);renderer.setClearColor(0x000000,0);renderer.render(scene,cam)
    renderer.setRenderTarget(null);renderer.shadowMap.enabled=true
    s.cast.forEach(([id])=>{vessels[id].scale.y=1})
    waterObjects.forEach(o=>{o.visible=true})
    renderer.render(scene,cam)
  }
  function resize(){
    renderer.setSize(window.innerWidth,window.innerHeight,false)
    reflection.setSize(Math.max(1,Math.floor(innerWidth/2)),Math.max(1,Math.floor(innerHeight/2)))
    sea.setReflection(reflection.texture,innerWidth,innerHeight)
    cam.aspect=window.innerWidth/window.innerHeight;draw(t)
  }
  await document.fonts.ready;resize();window.addEventListener('resize',resize)
  document.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();if(frame)pause();else play()}})
  window.addEventListener('pagehide',()=>{pause();reflection.dispose();sea.dispose();renderer.dispose()},{once:true})
  done()
  if(new URLSearchParams(location.search).has('play'))play()
} catch(err) {
  const error=document.createElement('p');error.id='error';error.textContent='无法渲染三维取景台，请查看已导出的 MP4。';document.body.appendChild(error)
  fail(err);console.error(err)
}
