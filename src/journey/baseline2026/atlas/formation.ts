import * as T from 'three'
import { latLngToVector3,EARTH_RADIUS } from '../../../utils/geo'
import { berths } from './visit'
import { atlasScale,fleetCatalog } from './catalog'

// Fit actual places and silhouette extents, not a fixed camera position
// tuned to a single aspect. The review straddles the date line.
const list=Object.values(berths).flat()
const unwrap=(x:number)=>x<0?x+360:x
const mid=(ns:number[])=>(Math.min(...ns)+Math.max(...ns))*.5
const lat=mid(list.map(s=>s.lat)),lon=mid(list.map(s=>unwrap(s.lon)))
const origin=latLngToVector3(lat,lon,EARTH_RADIUS+.001)
const normal=origin.clone().normalize(),north=latLngToVector3(lat+.1,lon,1).sub(normal).projectOnPlane(normal).normalize(),east=north.clone().cross(normal).normalize()
const extent=list.map(s=>({v:latLngToVector3(s.lat,s.lon,EARTH_RADIUS+.001).sub(origin),radius:(s.modelId?fleetCatalog[s.modelId].length*atlasScale:.007)*.54}))
const dir=new T.Vector3(),side=new T.Vector3(),up=new T.Vector3(),aim=new T.Vector3(),eye=new T.Vector3(),worldUp=new T.Vector3()
export function fleetOverview(view:T.PerspectiveCamera,q:T.Quaternion,top:number,dock:number,height:number,controls?:{enabled:boolean;target:T.Vector3}){
  const portrait=view.aspect<.89
  const tilt=portrait?.89:.49
  dir.copy(normal).multiplyScalar(Math.sin(tilt)).addScaledVector(portrait?east:north,-Math.cos(tilt)).addScaledVector(portrait?north:east,portrait?-.27:-.035).normalize()
  side.crossVectors(normal,dir).normalize();up.crossVectors(dir,side).normalize()
  const fov=40,tan=Math.tan(T.MathUtils.degToRad(fov/2))
  const free=T.MathUtils.clamp(1-(top+dock)/height,.34,.88)
  let distance=.13
  for(const {v,radius} of extent){
    const z=v.dot(dir)
    distance=Math.max(distance,z+(Math.abs(v.dot(side))+radius)/(tan*view.aspect*.89),z+(Math.abs(v.dot(up))+radius)/(tan*free*.73))
  }
  aim.copy(origin).addScaledVector(up,-T.MathUtils.clamp((dock-top)/height,-.15,.4)*distance*tan)
  eye.copy(aim).addScaledVector(dir,distance)
  view.position.copy(eye.applyQuaternion(q));view.up.copy(worldUp.copy(normal).applyQuaternion(q))
  view.lookAt(aim.applyQuaternion(q))
  if(view.fov!==fov||view.near!==.002){view.fov=fov;view.near=.002;view.updateProjectionMatrix()}
  if(controls){controls.enabled=false;controls.target.copy(aim)}
}

