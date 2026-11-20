import * as T from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Static scene dressing. A parked, unarmed, folded-wing naval aircraft silhouette;
// no launch, moving surfaces, or systems. Its familiar size gives the deck scale.
export function parkedAircraft() {
  const model=new T.Group(), bins=new Map<string,T.BufferGeometry[]>()
  const skin='#a4b1b4', lower='#89989f', tips='#717f86', glass='#3d5159', rubber='#353a3b'
  function part(geo:T.BufferGeometry,color:string){
    const geom=geo.index?geo.toNonIndexed():geo
    if(geo!==geom)geo.dispose()
    geom.deleteAttribute('uv'); if(!geom.attributes.normal)geom.computeVertexNormals()
    if(!bins.has(color))bins.set(color,[]);bins.get(color)!.push(geom)
  }
  function ov(x:number,y:number,z:number,rx:number,ry:number,rz:number,c:string){
    part(new T.SphereGeometry(1,16,10).scale(rx,ry,rz).translate(x,y,z),c)
  }
  type P=[number,number,number]
  function sheet(p:P[], color:string){
    const a:number[]=[]
    for(let i=1;i<p.length-1;i++)a.push(...p[0],...p[i],...p[i+1])
    part(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(a,3)),color)
  }
  // Chined body, rounded nose and two separated dark exhaust ends.
  ov(0,.71,.38,.36,.31,2.63,skin);ov(0,.72,2.45,.23,.21,.79,lower)
  ov(0,1.00,1.33,.25,.23,.60,glass);ov(0,1.02,1.12,.26,.23,.065,skin)
  for(const s of [-1,1]){
    ov(s*.38,.63,-.69,.27,.30,2.0,lower)
    part(new T.CylinderGeometry(.22,.19,.44,16).rotateX(Math.PI/2).translate(s*.39,.67,-2.47),tips)
    part(new T.CylinderGeometry(.155,.155,.035,16).rotateX(Math.PI/2).translate(s*.39,.67,-2.70),rubber)
    sheet([[s*.23,.73,1.03],[s*1.48,.78,-.52],[s*1.48,.79,-1.39],[s*.42,.74,-1.09]],skin)
    sheet([[s*1.48,.78,-.52],[s*1.58,1.54,-.94],[s*1.58,1.65,-1.55],[s*1.48,.79,-1.39]],lower)
    sheet([[s*.31,.80,1.18],[s*.86,.83,.60],[s*.85,.82,.43],[s*.29,.79,.57]],skin)
    sheet([[s*.51,.78,-1.83],[s*1.27,.80,-2.39],[s*1.34,.8,-2.88],[s*.33,.77,-2.55]],skin)
    sheet([[s*.41,.75,-1.39],[s*.61,1.58,-2.22],[s*.66,1.55,-2.62],[s*.50,.77,-2.57]],lower)
    part(new T.CylinderGeometry(.047,.047,.39,7).translate(s*.48,.31,-.65),tips)
    part(new T.CylinderGeometry(.16,.16,.13,10).rotateZ(Math.PI/2).translate(s*.48,.16,-.65),rubber)
  }
  part(new T.CylinderGeometry(.039,.039,.44,7).translate(0,.35,1.54),tips)
  part(new T.CylinderGeometry(.14,.14,.12,10).rotateZ(Math.PI/2).translate(0,.14,1.54),rubber)
  for(const [color,geos] of bins){
    const mesh=new T.Mesh(mergeGeometries(geos)!,new T.MeshStandardMaterial({color,side:T.DoubleSide,roughness:color===glass?.35:.79,metalness:.12}))
    mesh.castShadow=true;mesh.receiveShadow=true;model.add(mesh); geos.forEach(g=>g.dispose())
  }
  return model
}
