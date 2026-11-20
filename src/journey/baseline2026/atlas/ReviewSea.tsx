import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { oceanCap, oceanPattern, oceanVertex, oceanFragment, skyVertex, skyFragment } from './oceanField'
import { useAtlas } from './visit'
import { fleetCatalog } from './catalog'
import { useContactReflection } from './oceanReflection'

// One wind-field texture and one clock per active review, not one animation per
// ship. ReviewFormation mounts on just this one globe and unmounts on beat exit.
const wind:T.IUniform<T.Texture|null>={value:null},time={value:0}
const noHit:T.Object3D['raycast']=()=>{}

export function ReviewSea({closeup=false}:{closeup?:boolean}) {
  const reduced=useReducedMotion()
  const berth=useAtlas(s=>s.berth),mode=useAtlas(s=>s.mode)
  const marineSky=closeup || mode==='formation'
  const patch=useMemo(oceanCap,[])
  const uniforms=useMemo(()=>({wind,t:time,nearShot:{value:0},scaleDetail:{value:1},
    reflected:{value:null},hasMirror:{value:0},mirrorVP:{value:new T.Matrix4()}}),[])
  const seaMat=useRef<T.ShaderMaterial>(null), skyMat=useRef<T.ShaderMaterial>(null)
  useContactReflection(seaMat,closeup,berth.key,berth.modelId)
  useLayoutEffect(()=>()=>patch.dispose(),[patch])
  useLayoutEffect(()=>{
    const texture=oceanPattern();wind.value=texture;time.value=0
    return ()=>{if(wind.value===texture)wind.value=null;texture.dispose()}
  },[])
  useLayoutEffect(()=>{
    // R3F merges/clones shader uniforms when assigning JSX props. Bind the
    // real material references, including a sky mounted after the first frame.
    for (const mat of [seaMat.current,skyMat.current]) if(mat){
      mat.uniforms.wind=wind;mat.uniforms.t=time
      mat.uniforms.nearShot.value=closeup?1:0
      mat.uniforms.scaleDetail.value=closeup&&berth.modelId?2.32*(.10/fleetCatalog[berth.modelId].length)**.64:1
    }
  },[closeup,marineSky,berth])
  useFrame((_,delta)=>{if(!reduced)time.value+=Math.min(delta,.1)})
  return <group name="Review atlas / Pacific water">
    {/* It is the same planet mesh below this small, feathered spherical inset.
        The inset writes depth to conceal the underwater hull. */}
    <mesh geometry={patch} raycast={noHit} renderOrder={1}>
      <shaderMaterial ref={seaMat} uniforms={uniforms} vertexShader={oceanVertex} fragmentShader={oceanFragment}
        side={T.FrontSide} transparent depthWrite toneMapped={false}/>
    </mesh>
    {/* Shared cloud and atmosphere shells are transparent and do not write
        depth. Paint the sky after them, behind the actual opaque globe and
        hulls, so their outer space-view shell doesn't make a second horizon. */}
    {marineSky&&<mesh name="Review atlas / marine sky" raycast={noHit} renderOrder={4}>
      <sphereGeometry args={[6,44,28]}/>
      <shaderMaterial ref={skyMat} uniforms={uniforms} vertexShader={skyVertex} fragmentShader={skyFragment}
        side={T.BackSide} transparent blending={T.NoBlending} depthWrite toneMapped={false}/>
    </mesh>}
  </group>
}

const washVertex=`
varying vec2 local;varying vec2 seed;
void main(){
  local=vec2(mix(-1.88,.517,uv.x),mix(-.37,.37,uv.y));
  vec3 p=(modelMatrix*vec4(local.x,0.,local.y,1.)).xyz;
  // Bend the wash to the sphere rather than drawing a rigid tangent-plane
  // streak that rises into air at the tail. Hull centreline uses R+.00035.
  vec3 world=normalize(p)*1.50047;
  seed=modelMatrix[3].xz*67.;
  gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
}`
const washFragment=`
uniform sampler2D wind;uniform float t;uniform float ratio;
varying vec2 local;varying vec2 seed;
void main(){
  float aft=.503-local.x, across=abs(local.y),beam=ratio;
  if(aft<0.)discard;
  vec2 p=vec2(local.x+t*.038,local.y)+seed;
  vec4 big=texture2D(wind,p*vec2(1.1,1.6));
  vec4 small=texture2D(wind,p*vec2(3.2,5.4));
  float noise=.53*big.a+.47*small.a;
  float irregular=(big.b-.5)*.013+(small.a-.5)*.008;
  float end=1.-smoothstep(.84,1.06,aft);
  float halfHull=.49*beam*smoothstep(.005,.28,aft)*(1.-.33*smoothstep(.71,1.,aft));
  float waterline=halfHull+irregular;
  float hullWash=exp(-abs(across-waterline)/(.0035+.033*beam))
    *smoothstep(.001,.046,aft)*end*(.75-.43*smoothstep(.19,.81,aft));
  float stern=max(0.,aft-.91),span=.31*beam+.060*stern;
  float mid=local.y+(big.b-.5)*.037*min(stern,1.);
  float core=(1.-smoothstep(.15*span,1.15*span,abs(mid)))
    *smoothstep(.01,.115,stern)*(1.-smoothstep(.24,1.49,stern));
  float rail=.44*beam+.102*max(0.,aft-.19)+irregular*1.4;
  float scallop=.32+.68*smoothstep(-.68,.74,sin(86.*aft-56.*across+5.5*big.b));
  float crest=exp(-abs(across-rail)/(.004+.004*aft))*scallop*
    smoothstep(.15,.29,aft)*(1.-smoothstep(.38,2.15,aft));
  float flakes=smoothstep(.27,.69,noise);
  float rough=hullWash*(.34+.66*flakes)+core*(.12+.77*flakes)+crest*(.18+.52*flakes);
  // Aerated water becomes teal outside the concentrated foam, not a uniform
  // opaque ribbon. Dark, soft contact at the shoulder anchors a very low hull.
  float shadow=(1.-smoothstep(.40*halfHull,max(.014,halfHull*.98+.008),abs(local.y-.017)))
    *smoothstep(.018,.22,aft)*end*.46;
  float alpha=clamp(rough,0.,.89);
  if(max(shadow,alpha)<.012)discard;
  vec3 foam=mix(vec3(.075,.23,.27),vec3(.73,.85,.83),smoothstep(.06,.79,rough*.8+flakes*.24));
  gl_FragColor=vec4(mix(foam,vec3(.008,.028,.038),shadow*(1.-alpha)),max(alpha,shadow));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

/** +X is the bow; lengths are for the hull before its parent scale. No wash
 * on the statistical counters. One transparent draw per display vessel. */
export function ShipWash({length,beam}:{length:number;beam:number}) {
  const uniforms=useMemo(()=>({wind,t:time,ratio:{value:beam/length}}),[length,beam])
  const material=useRef<T.ShaderMaterial>(null)
  useLayoutEffect(()=>{
    if(material.current){material.current.uniforms.wind=wind;material.current.uniforms.t=time}
  },[uniforms])
  return <mesh name="Review vessel / wash" raycast={noHit} scale={length} renderOrder={2} frustumCulled={false}>
    <planeGeometry args={[1,1,12,3]}/>
    <shaderMaterial ref={material} vertexShader={washVertex} fragmentShader={washFragment} uniforms={uniforms}
      side={T.DoubleSide} forceSinglePass transparent depthWrite={false} toneMapped={false}/>
  </mesh>
}

