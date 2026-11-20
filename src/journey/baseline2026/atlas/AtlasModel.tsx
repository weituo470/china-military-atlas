import { useLayoutEffect, useRef } from 'react'
import * as T from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { makeCarrier, type CarrierId } from '../film/ships'
import { parkedAircraft } from '../film/parked'
import { makeCapitalModel } from './capitalModels'
import { makeSurfaceModel } from './surfaceModels'
import type { AtlasId } from './catalog'

// Make neutral parked deck aircraft into a single coloured mesh. Their size is a
// scale cue, not a count or air-wing claim. The film assets are read-only inputs.
function parkingRow(id:CarrierId){
  const plane=parkedAircraft(), parts:T.BufferGeometry[]=[]
  const y={liaoning:5.9,shandong:6.1,fujian:6.4}[id]
  const lamps=new Set<T.Material>()
  plane.traverse(n=>{
    if(!(n instanceof T.Mesh))return
    const c=(n.material as T.MeshStandardMaterial).color, source=n.geometry as T.BufferGeometry
    for(const z of [-31.5,-25.7,-19.8]){
      const geo=source.index?source.toNonIndexed():source.clone()
      geo.deleteAttribute('uv')
      const a=new Float32Array(geo.attributes.position.count*3)
      for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b}
      geo.setAttribute('color',new T.BufferAttribute(a,3))
      geo.rotateY(1.13);geo.translate(-5.1,y+.04,z);parts.push(geo)
    }
    source.dispose();lamps.add(n.material as T.Material)
  })
  lamps.forEach(m=>m.dispose())
  const combined=mergeGeometries(parts)!;parts.forEach(p=>p.dispose())
  return new T.Mesh(combined,new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide}))
}
function china(id:CarrierId){
  const ship=makeCarrier(id,1536)
  ship.add(parkingRow(id));ship.rotation.y=Math.PI/2;ship.scale.setScalar(.00095)
  ship.updateMatrixWorld(true)
  const n=new T.Vector3(),sun=new T.Vector3(.37,.76,.56).normalize()
  ship.traverse(obj=>{
    if(!(obj instanceof T.Mesh))return
    const source=obj.material as T.MeshStandardMaterial,g=obj.geometry as T.BufferGeometry
    const norm=g.getAttribute('normal'),original=g.getAttribute('color')
    if(norm && !source.transparent){
      const data=new Float32Array(norm.count*3),mat=new T.Matrix3().getNormalMatrix(obj.matrixWorld)
      for(let i=0;i<norm.count;i++){
        n.fromBufferAttribute(norm,i).applyNormalMatrix(mat)
        const light=.54+.39*(n.y*.5+.5)+.57*Math.max(0,n.dot(sun))
        data[i*3]=(original?.getX(i)??1)*light
        data[i*3+1]=(original?.getY(i)??1)*light
        data[i*3+2]=(original?.getZ(i)??1)*light*(1.035-.035*Math.max(n.y,0))
      }
      g.setAttribute('color',new T.BufferAttribute(data,3))
    }
    obj.material=new T.MeshBasicMaterial({color:source.color,map:source.map,vertexColors:!!g.attributes.color,side:source.side,
      transparent:source.transparent,opacity:source.opacity,alphaTest:source.alphaTest,depthWrite:source.depthWrite,
      polygonOffset:source.polygonOffset,polygonOffsetFactor:source.polygonOffsetFactor,polygonOffsetUnits:source.polygonOffsetUnits,toneMapped:false})
    source.dispose()
  })
  return ship
}
const cache=new Map<AtlasId,{source:T.Group;users:number}>()
function build(id:AtlasId){
  if(id==='liaoning'||id==='shandong'||id==='fujian') return china(id)
  if(id==='nimitz'||id==='ford'||id==='izumo'||id==='kaga') return makeCapitalModel(id)
  return makeSurfaceModel(id)
}
function release(source:T.Group){
  const geos=new Set<T.BufferGeometry>(), mats=new Set<T.Material>(),maps=new Set<T.Texture>()
  source.traverse(n=>{if(n instanceof T.Mesh){geos.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material])mats.add(m)}})
  mats.forEach(m=>{for(const value of Object.values(m))if(value instanceof T.Texture)maps.add(value);m.dispose()})
  maps.forEach(t=>t.dispose());geos.forEach(g=>g.dispose())
}
export function AtlasModel({id}:{id:AtlasId}){
  const host=useRef<T.Group>(null)
  useLayoutEffect(()=>{
    const parent=host.current!
    let item=cache.get(id)
    if(!item){item={source:build(id),users:0};cache.set(id,item)}
    const entry=item, instance=entry.source.clone(true);entry.users++
    instance.name='Pacific exterior / '+id;instance.userData.atlasModel=id
    parent.add(instance)
    return ()=>{parent.remove(instance);entry.users--;queueMicrotask(()=>{
      if(!entry.users&&cache.get(id)===entry){release(entry.source);cache.delete(id)}
    })}
  },[id])
  return <group ref={host} />
}
