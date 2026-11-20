import { useEffect, useMemo, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { groundHeight } from './battleTerrain'
import { buildChariot, buildCourser, buildRider, buildWheel } from './mountedGeometry'

const METRE = .00172
// Tangent coordinates are (east, north), shared with JourneyCamera's film marks.
export const MOUNTED_FILM_MARKS = {
  rider: {x:-.013,z:.006}, chariot: {x:.009,z:.005}, height: .0024,
} as const
export const MOUNTED_CENSUS = {riders:36, cars:6, crew:12, horses:48} as const

type Entry={x:number;z:number;yaw:number;seed:number; pace:number}
const riders:Entry[]=[], carts:Entry[]=[]
for(const side of [-1,1]){
  for(let i=0;i<18;i++){
    // A few overlapping silhouettes at the south edge, a looser file beyond;
    // the centre line is reserved for the infantry close-up.
    const band=Math.floor(i/6),col=i%6
    const south=side<0
    const x=south ? -.013-col*.0054-band*.0027 : .045+col*.0052+band*.0029
    const z=south ? .006+col*.00076-band*.0056 : .010+col*.0010-band*.0057
    riders.push({x,z,yaw:side<0?1.32:-1.41,seed:i*2.39+(south?1.1:.3),pace:.37+.05*Math.sin(i)})
  }
  for(let i=0;i<3;i++){
    const west=side<0
    carts.push({x:west?(-.048-i*.009):(.009+i*.014),z:west?(-.001-i*.002):(.005-i*.0034),yaw:west?1.27:-1.25,seed:i*2.1+(west?4:1),pace:.285+i*.02})
  }
}
const PI=Math.PI
function displacement(t:number,e:Entry) {
  // Hooves start moving at slightly different moments and slow to a standstill.
  const duration=12.8, u=Math.max(0,t-.45*(1+Math.sin(e.seed)))
  const distance=e.pace*duration*(1-Math.exp(-u/duration))
  return distance
}

function prepare() {
  const root=new THREE.Group();root.name='force-mounted-corps'
  const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.87,metalness:.08})
  const uniform={value:0}
  mat.onBeforeCompile=(shader)=>{
    shader.uniforms.uMountTime=uniform
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
      attribute vec4 poseWeights;
      attribute vec2 marchStep;
      uniform float uMountTime;
    `).replace('#include <begin_vertex>',`#include <begin_vertex>
      float a=marchStep.x+poseWeights.z;
      if(poseWeights.x < -0.1){
        float gust=sin(uMountTime*3.4 + position.z*9.0 + marchStep.x*.1);
        transformed.x+=gust*.19*poseWeights.y;
        transformed.y+=sin(uMountTime*2.8 + position.z*7.0)*.072*poseWeights.y;
      } else {
        transformed.z += sin(a)*.27*poseWeights.x*marchStep.y;
        transformed.y += max(0.,cos(a))*.155*poseWeights.x*marchStep.y;
        transformed.y += sin(marchStep.x*2.0)*.014*max(0.,poseWeights.w)*marchStep.y;
        transformed.x += sin(uMountTime*2.3+position.y*5.5)*.059*max(0.,-poseWeights.w);
      }
    `)
  }
  const mesh=(name:string, geo:THREE.BufferGeometry,count:number)=>{
    const step=new THREE.InstancedBufferAttribute(new Float32Array(count*2),2)
    step.setUsage(THREE.DynamicDrawUsage);geo.setAttribute('marchStep',step)
    const m=new THREE.InstancedMesh(geo,mat,count)
    m.name=name;m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(m);return m
  }
  const horse=mesh('tethered-and-saddled-horses',buildCourser(),48)
  const rider=[mesh('ochre-riders',buildRider(-1),18),mesh('slate-riders',buildRider(1),18)]
  const car=[mesh('ochre-chariots',buildChariot(-1),3),mesh('slate-chariots',buildChariot(1),3)]
  const wheel=mesh('spoked-wheels',buildWheel(),12)
  const shadowMat=new THREE.MeshBasicMaterial({color:'#302820',transparent:true,depthWrite:false,opacity:.32,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})
  shadowMat.onBeforeCompile=(s)=>{
    s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vFootUV;').replace('#include <begin_vertex>','#include <begin_vertex>\nvFootUV=uv;')
    s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vFootUV;').replace('#include <alphamap_fragment>','#include <alphamap_fragment>\ndiffuseColor.a *= 1.0-smoothstep(.09, .50, length(vFootUV-.5));')
  }
  const shadowG=new THREE.PlaneGeometry(1,1);shadowG.rotateX(-PI/2)
  const shade=new THREE.InstancedMesh(shadowG,shadowMat,54)
  shade.frustumCulled=false;shade.name='hoof-contact-shadows';root.add(shade)
  const swatches=['#ffe5c8','#b58e70','#f5d5ae','#938792','#dcc7af','#fcf3d9','#f6c9a3','#bdb1a0']
  for(let i=0;i<48;i++)horse.setColorAt(i,new THREE.Color(swatches[(i*7+2)%swatches.length]))
  const mtx=new THREE.Matrix4(),offset=new THREE.Matrix4(),base=new THREE.Matrix4(),wm=new THREE.Matrix4()
  const pos=new THREE.Vector3(),q=new THREE.Quaternion(),eul=new THREE.Euler(),scale=new THREE.Vector3(METRE,METRE,METRE)
  function place(x:number,z:number,yaw:number,out:THREE.Matrix4){
    const dx=Math.sin(yaw),dz=Math.cos(yaw),eps=.0008
    const h=groundHeight(x,z)
    const dzSlope=(groundHeight(x+dx*eps,z+dz*eps)-h)/eps
    const dxSlope=(groundHeight(x+dz*eps,z-dx*eps)-h)/eps
    q.setFromEuler(eul.set(-Math.atan(dzSlope),yaw,Math.atan(dxSlope),'YXZ'))
    return out.compose(pos.set(x,h+.000009,z),q,scale)
  }
  function stamp(index:number,body:THREE.Matrix4, wide:number,long:number){
    // Local offset follows the slope as well; don't let dark planar shadows float.
    mtx.copy(body).multiply(offset.makeTranslation(.16,.018,-.07)).multiply(offset.makeScale(wide,1,long))
    shade.setMatrixAt(index,mtx)
  }
  const attrs=horse.geometry.getAttribute('marchStep') as THREE.InstancedBufferAttribute
  function writeHorse(index:number,x:number,z:number, yaw:number, step:number, amount:number) {
    place(x,z,yaw,base);horse.setMatrixAt(index,base);attrs.setXY(index,step,amount)
    stamp(index,base,1.16,2.63)
  }
  function update(t:number){
    uniform.value=t
    for(let i=0;i<riders.length;i++){
      const e=riders[i],d=displacement(t,e),dx=Math.sin(e.yaw),dz=Math.cos(e.yaw)
      const step=d*5.9+e.seed,amount=.24+.76*Math.exp(-t/12.8)
      writeHorse(i,e.x+dx*d*METRE,e.z+dz*d*METRE,e.yaw,step,amount)
      base.multiply(offset.makeTranslation(0,.010*Math.sin(step*2)*amount,0))
      rider[i<18?0:1].setMatrixAt(i%18,base)
    }
    for(let i=0;i<carts.length;i++){
      const e=carts[i],d=displacement(t,e),dx=Math.sin(e.yaw),dz=Math.cos(e.yaw),x=e.x+dx*d*METRE,z=e.z+dz*d*METRE
      place(x,z,e.yaw,wm)
      car[i<3?0:1].setMatrixAt(i%3,wm);stamp(48+i,wm,2.27,2.01)
      for(const s of [-1,1]){
        const idx=i*2+(s>0?1:0)
        mtx.copy(wm).multiply(offset.makeTranslation(s*.985,.696,0)).multiply(offset.makeRotationX(d/.695))
        wheel.setMatrixAt(idx,mtx)
        const fx=1.98,lat=s*.6
        writeHorse(36+idx,x+(dx*fx+dz*lat)*METRE,z+(dz*fx-dx*lat)*METRE,e.yaw,e.seed+s*2+d*5.9,.25+.75*Math.exp(-t/12.8))
      }
    }
    for(const obj of root.children)(obj as THREE.InstancedMesh).instanceMatrix.needsUpdate=true
    attrs.needsUpdate=true
  }
  update(0)
  function dispose(){
    for(const child of root.children){const m=child as THREE.InstancedMesh;m.geometry.dispose();m.dispose()}
    shadowMat.dispose();mat.dispose()
  }
  return {root,update,dispose}
}

export function MountedCorps({motion}:{motion:RefObject<number>}){
  const assets=useMemo(prepare,[])
  useFrame(()=>assets.update(motion.current))
  useEffect(()=>()=>assets.dispose(),[assets])
  return <primitive object={assets.root} dispose={null} />
}

