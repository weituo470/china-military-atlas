import * as T from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Original exhibition miniature, from public broadside/bow photography. Only visible
// exterior shapes are represented. +Z bow, -X starboard, water at zero.
export function makeEscort(): T.Group {
  const g = new T.Group(), batches = new Map<string, T.BufferGeometry[]>()
  const steel = '#9ba6a7', side = '#899598', lip = '#a3aeae', deck = '#616f75',
    dark = '#48555c', glass = '#33464e', white = '#d6d8d1', seam = '#78878b'
  function add(geo:T.BufferGeometry, c:string) {
    const src = geo.index ? geo.toNonIndexed() : geo
    if (geo !== src) geo.dispose()
    src.deleteAttribute('uv')
    if (!src.attributes.normal) src.computeVertexNormals()
    if (!batches.has(c)) batches.set(c,[])
    batches.get(c)!.push(src)
  }
  function box(x:number,y:number,z:number,w:number,h:number,l:number,c:string,rot=0) {
    add(new T.BoxGeometry(w,h,l).rotateY(rot).translate(x,y,z),c)
  }
  type P = [number,number,number]
  function rod(a:P,b:P,r:number,c:string,r2=r,n=8) {
    const start=new T.Vector3(...a), end=new T.Vector3(...b), v=end.clone().sub(start)
    const geom = new T.CylinderGeometry(r2,r,v.length(),n)
    geom.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.normalize()))
    const mid=start.lerp(end,.5); add(geom.translate(mid.x,mid.y,mid.z),c)
  }
  type S = [number,number,number] // longitudinal stations: z, half width, top height
  function house(z:number,l:number,w:number,low:number,hi:number,ratio:number,c:string){
    const a= [[-.76,-1],[.76,-1],[1,-.82],[1,.64],[.70,1],[-.70,1],[-1,.64],[-1,-.82]]
    const verts:number[]=[]
    const p=(i:number,t:boolean):P=>[a[i][0]*w*.5*(t?ratio:1),t?hi:low,z+a[i][1]*l*.5*(t?ratio:1)]
    for(let i=0;i<8;i++) {
      const j=(i+1)%8, b=p(i,false), bb=p(j,false), u=p(i,true),uu=p(j,true)
      verts.push(...b,...u,...uu,...b,...uu,...bb,0,hi,z,...uu,...u)
    }
    const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(verts,3))
    geo.computeVertexNormals(); add(geo,c)
  }
  const sections:S[]=[[-26.6,2.10,2.38],[-24,2.65,2.47],[-18,2.97,2.56],[-10,3.15,2.68],[0,3.25,2.83],[9,3.09,2.98],[16,2.64,3.14],[21,1.92,3.42],[25,.91,3.68],[27,.03,3.82]]
  // Loft curved shoulders around a raked stem. Waterline, decals and rails
  // all sample this same surface; a planar label would disappear into the flare.
  const widths=new T.SplineCurve(sections.map(([z,w])=>new T.Vector2(z,w)))
  function plate(z:number,yFrac:number,s:number):P{
    const i=Math.min(sections.length-2,Math.max(0,sections.findLastIndex(p=>p[0]<=z)))
    const a=sections[i],b=sections[i+1],t=T.MathUtils.clamp((z-a[0])/(b[0]-a[0]),0,1)
    const w=widths.getPoint((i+t)/(sections.length-1)).y, h=T.MathUtils.lerp(a[2],b[2],t)
    const stem=T.MathUtils.smoothstep(z,12,27),stern=1-T.MathUtils.smoothstep(z,-27,-21)
    return [s*w*(.64+.36*(1-(1-yFrac)**1.55)), -.88+(h+.88)*yFrac,z+(1-yFrac)*(stern*.9-stem*2.85)]
  }
  const rows=108, rings=8
  function addSkin(s:number) {
    const pos:number[]=[],col:number[]=[],idx:number[]=[]
    for(let i=0;i<=rows;i++)for(let j=0;j<=rings;j++){
      const z=-26.6+53.6*i/rows, f=j/rings
      pos.push(...plate(z,f,s))
      const color=new T.Color('#a8b2b6').lerp(new T.Color('#707f83'),.45*(1-f)+.09*(Math.sin(z*1.5+.2)*.5+.5))
      col.push(color.r,color.g,color.b)
      if(i&&j){const d=i*(rings+1)+j,a=d-rings-2,b=d-1,c=d-rings-1
        if(s>0)idx.push(a,c,b,b,c,d);else idx.push(a,b,c,b,d,c)}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('color',new T.Float32BufferAttribute(col,3))
    geo.setIndex(idx);geo.computeVertexNormals()
    const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.76,metalness:.11,side:T.DoubleSide}));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh)
  }
  addSkin(1);addSkin(-1)
  const tops:number[]=[]
  for(let i=1;i<=rows;i++){
    const z0=-26.6+53.6*(i-1)/rows,z1=-26.6+53.6*i/rows
    const l0=plate(z0,1,-1),l1=plate(z1,1,-1),r0=plate(z0,1,1),r1=plate(z1,1,1)
    tops.push(...l0,...l1,...r1,...l0,...r1,...r0)
    if(i%2===0||i===1)for(const s of [-1,1]){
      const z=i===1?z0:z1,zPrev=i===1?z:Math.max(-26.6,z-2*53.6/rows)
      const a=plate(z,1,s), b=plate(zPrev,1,s)
      if(i%4===0){rod(a,[a[0],a[1]+.32,a[2]],.032,lip,.027,5)}
      for(const h of [.20,.34])if(z!==zPrev)rod([a[0],a[1]+h,a[2]],[b[0],b[1]+h,b[2]],.016,lip,.016,4)
    }
  }
  const aft=sections[0][0],l=plate(aft,1,-1),r=plate(aft,1,1),ll=plate(aft,0,-1),rr=plate(aft,0,1)
  add(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([...l,...r,...rr,...l,...rr,...ll],3)),side)
  add(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(tops,3)),deck)
  house(3.2,19.6,6.07,2.72,4.45,.88,steel)
  house(5.5,11.0,5.5,4.36,6.12,.84,steel)
  house(5.84,7.36,4.84,6.09,7.20,.95,steel)
  house(5.88,7.47,5.0,7.11,7.32,.98,lip)
  // Continuous dark front glazing interrupted by individually modelled mullions.
  for(let i=-3;i<=3;i++)box(i*.48,6.86,9.35,.39,.35,.08,glass)
  for(const s of [-1,1]){
    for(let j=0;j<7;j++) box(s*2.34,6.86,3.17+j*.70,.07,.34,.51,glass)
    for(let j=0;j<4;j++)box(s*(2.17-j*.18),6.86,8.68+j*.23,.08,.32,.25,glass,s*.55)
  }
  house(4.75,4.70,3.12,7.30,8.14,.81,steel)
  house(4.42,2.80,2.44,8.12,10.23,.64,side)
  house(4.3,2.03,1.58,10.17,10.85,.82,lip)
  // Recessed fascia, gallery edges, thin yards and capped navigation domes
  // pick up oblique sunlight; leave actual systems undescribed.
  for(const s of [-1,1]){
    box(s*2.43,6.65,5.6,.29,.12,5.0,side)
    box(s*2.43,6.57,5.6,.27,.055,4.9,dark)
    box(s*.76,8.15,5.16,.76,.19,.77,lip)
    add(new T.SphereGeometry(.29,12,10).scale(1,1.03,1).translate(s*.76,8.36,5.16),'#bec7c7')
    box(s*1.88,5.42,9.61,1.05,.82,.08,seam,s*.34)
    box(s*1.88,5.42,9.66,.89,.68,.05,side,s*.34)
    box(s*2.73,3.71,-8.83,.12,.71,1.42,side)
    for(let i=0;i<5;i++)box(s*2.80,3.48+i*.11,-8.83,.055,.046,1.28,dark)
    for(let n=0;n<3;n++)box(s*2.50,4.27,3.7+n*1.8,.16,.49,.51,seam)
    for(let n=0;n<9;n++)box(s*2.70,3.20+n*.15,-12.38,.23,.045,.29,lip)
    const a=plate(23.8,.73,s);a[0]+=s*.035
    add(new T.SphereGeometry(1,14,8).scale(.056,.23,.33).rotateY(s*.31).translate(...a),dark)
    for(const z of [21.0,22.4]) {const b=plate(z,1,s);rod([b[0]*.68,b[1],z],[b[0]*.68,b[1]+.22,z],.11,seam,.14)}
  }
  rod([0,6.70,-6.52],[0,9.31,-6.52],.065,seam,.025)
  rod([-.77,8.28,-6.52],[.77,8.28,-6.52],.033,seam)
  for(const z of [3.85,4.75])rod([-.83,10.34,z],[.83,10.34,z],.045,seam)
  box(0,10.96,4.32,2.44,.17,.24,dark)
  rod([0,10.68,4.32],[0,13.4,4.32],.085,dark,.04)
  rod([-1.18,11.33,4.32],[1.18,11.33,4.32],.045,seam)
  for(const s of [-1,1])rod([0,11,4.32],[s*1.18,11.33,4.32],.035,seam)
  const flag:number[]=[]
  for(let j=0;j<6;j++){
    const q=(i:number,h:number):P=>[.12*Math.sin(i*.73),12.57+h*.42-i*.015,4.32-i*.19]
    flag.push(...q(j,0),...q(j,1),...q(j+1,1),...q(j,0),...q(j+1,1),...q(j+1,0))
  }
  add(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(flag,3)),'#ac342d')
  // Two separate sloped uptakes, pale outer skins and recessed dark caps.
  for (const z of [-1.15,-6.24]) {
    house(z,4.34,3.45,4.0,6.76,.78,side)
    house(z,3.43,2.80,6.64,6.91,.98,lip)
    house(z,2.91,2.25,6.91,6.98,.97,dark)
    for(const dx of [-.53,.53])box(dx,7.00,z,.82,.04,1.64,'#39454b')
  }
  house(-11,9.5,5.70,2.56,4.67,.90,steel); house(-11.2,7.8,4.94,4.67,4.88,.96,seam)
  for(const x of [-1.22,1.22]) {
    box(x,3.63,-15.65,2.04,1.55,.08,dark)
    for(let k=0;k<8;k++)box(x,2.99+k*.17,-15.71,1.90,.105,.055,seam)
  }
  // The aft deck is open, with a painted landing circle instead of a solid disc.
  const R=1.72, az=-21.37, py=2.60
  for(let i=0;i<48;i++){
    const a=i*2*Math.PI/48,b=(i+1)*2*Math.PI/48
    rod([Math.cos(a)*R,py,az+Math.sin(a)*R],[Math.cos(b)*R,py,az+Math.sin(b)*R],.045,white,.045,4)
  }
  for(const s of [-1,1])box(s*.44,py,az,.09,.035,1.09,white)
  box(0,py,az,.88,.035,.09,white)
  // Nonfunctional closed foredeck silhouette; no internal or mechanical detail.
  house(18.6,2.57,1.93,3.34,4.21,.72,side)
  rod([0,3.98,19.30],[0,4.22,21.62],.13,seam,.085)
  for(const s of [-1,1]) {
    for(let i=0;i<12;i++) {
      const z=-22+i*3.65,w=z< -15?2.89:z<13?3.09:2.6
      box(s*w,2.91,z,.06,.51,.059,lip)
    }
    for(let i=0;i<5;i++){
      const z=-6.75+i*.97,x=s*2.72
      rod([x,4.54,z-.35],[x,4.54,z+.35],.17,lip,.17)
      box(x,4.54,z,.36,.36,.09,seam)
    }
    for(let i=0;i<7;i++) box(s*2.84,3.7,-13.4+i*.79,.05,.24,.29,dark)
  }
  // Painted pennant on both bow shoulders; original cut vinyl style glyphs.
  const cv=document.createElement('canvas'); cv.width=384;cv.height=128
  const ctx=cv.getContext('2d')!;ctx.font='bold 108px Arial';ctx.textBaseline='middle';ctx.textAlign='center'
  ctx.fillStyle='#394953';ctx.fillText('101',195,69);ctx.fillStyle='#edece5';ctx.fillText('101',191,66)
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace
  const decal=new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.09,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})
  for(const s of [-1,1]){
    const pp:number[]=[],uv:number[]=[],ix:number[]=[]
    for(let j=0;j<=10;j++)for(let k=0;k<2;k++){
      const u=j/10,z=16.2+(u-.5)*4.60*(-s),p=plate(z,.56+k*.36,s)
      p[0]+=s*.037;pp.push(...p);uv.push(u,k)
      if(j&&k){const d=j*2+1;ix.push(d-3,d-1,d-2,d-1,d,d-2)}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pp,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix)
    decal.side=T.DoubleSide;g.add(new T.Mesh(geo,decal))
  }
  for(const [color,geoms] of batches) {
    const geometry=mergeGeometries(geoms)!
    const mat=new T.MeshStandardMaterial({color,roughness:.78,metalness:.11,side:T.DoubleSide})
    const part=new T.Mesh(geometry,mat);part.castShadow=true;part.receiveShadow=true;g.add(part)
    geoms.forEach(geo=>geo.dispose())
  }
  g.name='南昌 · 101';return g
}
