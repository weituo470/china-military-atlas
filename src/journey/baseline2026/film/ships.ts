import * as T from 'three'

/**
 * Original exterior portraits, not engineering plans. Sources for the artists:
 * https://english.news.cn/20241031/50fbbabe265f4d9f88ce4cb8412fc3e8/c.html
 * https://english.news.cn/20250703/1a0c9fb588e642ae91c45abfd873942f/c.html
 * https://english.news.cn/20240508/48cef1c4b56548d8934d5f545e9bbda9/c.html
 * https://english.news.cn/20251107/a61224516aea4fb895a65861fcf26cfd/c.html
 * Public photographs inform the silhouette, not measurements or vessel locations.
 * +Z points to the bow. With +Y up, starboard is -X. The drafting coordinates
 * below read left-to-right like a deck plan; the conversion lives on a child,
 * leaving the caller's Group unmirrored for attaching props.
 */
export type CarrierId = 'liaoning' | 'shandong' | 'fujian'
type Pt = [number, number, number]
type DeckPoint = [number, number] // across, forward
type Station = [number, number, number] // forward, port edge, starboard edge
type Paint = number | T.Color
const steel = 0x969fa2, light = 0xb3babb, shadow = 0x697779, dark = 0x394750
const pane = 0x455762, white = 0xd6d9d5
const spec = {
  liaoning: { deck: 5.9, ramp: 2.7, deckId: '16', ix: 8.15, iz: -1.6, islandL: 19.8, width: 1, len: 1 },
  shandong: { deck: 6.1, ramp: 2.35, deckId: '17', ix: 8.65, iz: -0.6, islandL: 16.8, width: 1.035, len: 1.002 },
  fujian: { deck: 6.4, ramp: 0, deckId: '18', ix: 9.65, iz: -7.7, islandL: 15.2, width: 1, len: 1.041 },
} as const

const jump: Station[] = [
  [-49,-6.25,4.8],[-48,-7.35,5.4],[-46,-7.6,5.9],[-39,-8.55,7.05],
  [-36,-9.05,7.45],[-32,-9.65,9.3],[-26,-10.45,10.35],[-12,-12.15,10.5],
  [-6,-12.85,10.4],[2,-13.4,10.4],[8,-13.65,10.3],[14,-13.6,9.95],
  [21,-13.0,9.25],[23,-11.9,8.85],[25,-7.6,8.4],[29,-6.25,7.5],
  [33,-5.85,6.65],[37,-5.35,5.8],[41,-4.9,5.15],[45,-4.5,4.65],[49,-4.05,4.2],[50,-3.9,4.05],
]
const flat: Station[] = [
  [-49,-6.15,6.0],[-48,-7.6,7.5],[-44,-8.35,7.95],[-38,-9.2,8.4],
  [-30,-10.35,10.85],[-25,-11.1,11.65],[-15,-12.25,11.85],[-9,-13.1,11.85],
  [-2,-14.25,11.85],[6,-14.25,11.85],[13,-13.85,11.85],[20,-13.15,11.65],
  [24,-12.45,11.35],[26,-10.5,10.95],[30,-8.35,10.35],[34,-7.65,9.9],
  [42,-7.2,9.4],[47,-6.8,9.05],[50,-6.55,8.8],
]
function interpolate(rows: Station[], z: number, side: 1|2) {
  let i=1; while(i < rows.length-1 && rows[i][0]<z) i++
  const a=rows[i-1], b=rows[i]; return T.MathUtils.lerp(a[side],b[side],T.MathUtils.clamp((z-a[0])/(b[0]-a[0]),0,1))
}
function deckHeight(id: CarrierId,z:number) {const a=spec[id]; return a.deck+a.ramp*(Math.max(0,z-29)/21)**2}

// One vertex-painted opaque mesh for the hull, island, galleries and small fittings.
class Painter {
  p:number[]=[]; n:number[]=[]; c:number[]=[]
  colors = new Map<number,T.Color>()
  clr(v:Paint){if(typeof v!=='number')return v;let c=this.colors.get(v); if(!c){c=new T.Color(v);this.colors.set(v,c)}return c}
  tri(a:Pt,b:Pt,c:Pt,tint:Paint) {
    const n=new T.Vector3(...b).sub(new T.Vector3(...a)).cross(new T.Vector3(...c).sub(new T.Vector3(...a))).normalize()
    const k=this.clr(tint); this.p.push(...a,...b,...c)
    for(let i=0;i<3;i++){this.n.push(n.x,n.y,n.z);this.c.push(k.r,k.g,k.b)}
  }
  quad(a:Pt,b:Pt,c:Pt,d:Pt,tint:Paint){this.tri(a,b,c,tint);this.tri(a,c,d,tint)}
  // A chamfered octagonal deckhouse; different upper/lower rings avoid toy-like slabs.
  house(x:number,z:number,y:number,w:number,l:number,h:number,shrink:number,tint:Paint,cut=.175,shift=0) {
    const corners=(sw:number, sl:number, sy:number, dz:number):Pt[]=>{
      const a=sw/2,b=sl/2,c=Math.min(sw,sl)*cut
      return [[-a+c,-b],[-a,-b+c],[-a,b-c],[-a+c,b],[a-c,b],[a,b-c],[a,-b+c],[a-c,-b]].map(([u,v])=>[x+u,sy,z+v+dz])
    }
    const a=corners(w,l,y,0),b=corners(w*shrink,Math.max(l*.8,l-w*(1-shrink)),y+h,shift)
    for(let i=0;i<8;i++){const j=(i+1)%8; this.quad(a[i],a[j],b[j],b[i],tint); this.tri([x,y+h,z+shift],b[i],b[j],tint)}
  }
  box(x:number,y:number,z:number,w:number,h:number,l:number,c:Paint){this.house(x,z,y-h/2,w,l,h,1,c,.014)}
  rod(a:Pt,b:Pt,r:number,tint:Paint,r2=r,n=7){
    const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A).normalize()
    const u=new T.Vector3().crossVectors(d,Math.abs(d.y)>.92?new T.Vector3(1,0,0):new T.Vector3(0,1,0)).normalize(), v=new T.Vector3().crossVectors(d,u)
    const pos=(p:T.Vector3, rad:number, i:number):Pt=>p.clone().addScaledVector(u,rad*Math.cos(2*Math.PI*i/n)).addScaledVector(v,rad*Math.sin(2*Math.PI*i/n)).toArray()
    for(let i=0;i<n;i++) {const j=i+1;this.quad(pos(A,r,i),pos(A,r,j),pos(B,r2,j),pos(B,r2,i),tint);this.tri(b,pos(B,r2,i),pos(B,r2,j),tint)}
  }
  sphere(x:number,y:number,z:number,r:number,tint:Paint) {
    const p=(i:number,j:number):Pt=>[x+r*Math.cos(i*Math.PI/4)*Math.cos(Math.PI*j/8),y+r*Math.sin(Math.PI*j/8),z+r*Math.sin(i*Math.PI/4)*Math.cos(Math.PI*j/8)]
    for(let j=-3;j<4;j++)for(let i=0;i<8;i++)this.quad(p(i,j),p(i,j+1),p(i+1,j+1),p(i+1,j),tint)
  }
  mesh(){
    const g=new T.BufferGeometry()
    g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));g.computeBoundingSphere()
    const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:.035,side:T.DoubleSide})
    // Object-space paint variation and salt traces. No photographic assets.
    mat.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec3 paintP;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npaintP=position;')
      shader.fragmentShader=`varying vec3 paintP;
      float paintHash(vec2 p){p=fract(p*vec2(.3183099,.3678794));p+=dot(p,p.yx+19.19);return fract(p.x*p.y);}
      float paintNoise(vec2 p){vec2 i=floor(p),v=fract(p);v=v*v*(3.-2.*v);return mix(mix(paintHash(i),paintHash(i+vec2(1.,0.)),v.x),mix(paintHash(i+vec2(0.,1.)),paintHash(i+1.),v.x),v.y);}
      `+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec2 steelUV=vec2(paintP.z+.15*paintP.x,paintP.y);
        float large=paintNoise(steelUV*vec2(.34,.40)), streak=paintNoise(steelUV*vec2(2.7,.40));
        float plate=paintHash(vec2(floor(steelUV.x/3.35+floor(steelUV.y/1.28)*.47),floor(steelUV.y/1.28)));
        float ageing=(large-.5)*.13+(streak-.5)*.06+(plate-.5)*.034;
        diffuseColor.rgb*=1.+ageing;
        diffuseColor.rgb+=vec3(.004,.007,.011)*(1.-smoothstep(5.5,8.,paintP.y));
      `)
    }
    const m=new T.Mesh(g,mat);m.name='Painted shell, island and gallery fittings';return m
  }
}

function canvasTexture(c:HTMLCanvasElement,aniso=8) {const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=aniso;return t}

// Authored markings, subtle seams, warm/cool patches & tyre scuff in one texture.
// Per-scene ownership: the scene disposer can release these textures at teardown.
function flightDeck(id:CarrierId,rows:Station[],raster:number) {
  const a=spec[id], flatDeck=id==='fujian'
  const c=document.createElement('canvas');c.height=Math.max(256,Math.min(2048,Math.round(raster)));c.width=Math.round(c.height*3/8)
  const ctx=c.getContext('2d')!
  // Paint deterministic grain at raster scale; the mip chain handles distance.
  const im=ctx.createImageData(c.width,c.height)
  let rand=16471;const noise=()=>((rand=Math.imul(rand,1664525)+1013904223>>>0)/4294967296)
  const cells=Array.from({length:80*80},()=>noise())
  function mottled(x:number,y:number){
    const i=Math.floor(x),j=Math.floor(y),a=x-i,b=y-j,k=i+80*j
    return T.MathUtils.lerp(T.MathUtils.lerp(cells[k],cells[k+1],a),T.MathUtils.lerp(cells[k+80],cells[k+81],a),b)-.5
  }
  for(let j=0;j<c.height;j++){
    const broad=1.4*Math.sin(j*.011)+.7*Math.sin(j*.037)
    for(let i=0;i<c.width;i++){const n=(noise()-.5)*13+broad+13*mottled(i/57,j/98)+9*mottled(i/14,j/40)+2*Math.sin(i*.033+j*.008), k=(j*c.width+i)*4
      im.data[k]=(flatDeck?99:108)+n;im.data[k+1]=(flatDeck?103:111)+n;im.data[k+2]=(flatDeck?105:112)+n;im.data[k+3]=255}
  }ctx.putImageData(im,0,0)
  const px=(x:number)=>(x+16)*c.width/32, py=(z:number)=>(52-z)*c.height/104
  ctx.setTransform(c.width/32,0,0,-c.height/104,px(0),py(0))
  function line(points:DeckPoint[],col:string,w:number,dash:number[]=[]){
    ctx.beginPath();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash);points.forEach(([x,z],i)=>i?ctx.lineTo(x,z):ctx.moveTo(x,z));ctx.stroke();ctx.setLineDash([])
  }
  for(let row=0;row<36;row++)for(let j=0;j<10;j++){
    ctx.fillStyle='rgba('+(noise()>.5?'222,224,213,':'36,44,46,')+(.02+noise()*.034)+')'
    ctx.fillRect(-15+j*3+(row%2)*1.5,-50+row*2.87,2.96,2.82)
  }
  for(let z=-48;z<52;z+=3.4){line([[-15,z],[15,z]],'rgba(53,54,54,.19)',.029);line([[-15,z+.05],[15,z+.05]],'rgba(198,194,177,.11)',.02)}
  for(let x=-14;x<15;x+=2.75)line([[x,-50],[x,51]],'rgba(43,48,49,.12)',.024)
  for(let x=-14;x<15;x+=1.05)for(let z=-49;z<50;z+=1.7){
    ctx.fillStyle='rgba(41,48,50,.54)';ctx.fillRect(x,z,.052,.085)
  }
  const lane=(s:number,z:number)=>.95-(z+46)*(flatDeck?.123:.135)+s
  // Repeated soft tyre tracks taper just forward of the aft landing area.
  for(let i=0;i<105;i++){const dz=noise()*15-47,span=6+noise()*22, dx=(noise()-.5)*2.3
    line([[lane(dx,dz),dz],[lane(dx,dz+span),dz+span]],'rgba(32,34,34,.033)',.035+noise()*.23)}
  const cream='#f1f0df', ochre='#eac35c'
  const bounds=flatDeck?3.3:3.05
  for(const side of [-1,1]){
    const u=bounds*side; line([[lane(u,-48),-48],[lane(u,22),22]],cream,flatDeck?.37:.42)
    line([[lane(u,-48),-48],[lane(u,22),22]],'#626a6c',.115,[1.7,.42])
  }
  if(flatDeck)for(const side of [-1,1])line([[lane((bounds+.48)*side,-48),-48],[lane((bounds+.48)*side,21.8),21.8]],'#b27269',.15)
  line([[lane(0,-47),-47],[lane(0,21),21]],ochre,.20)
  for(const z of [-35,-32.5,-30,-27.5])line([[lane(-bounds,z),z],[lane(bounds,z+.35),z+.35]],'rgba(38,42,43,.72)',.10)
  // Painted deck-edge gutter with short interruptions where a gallery opens.
  for(const n of [1,2] as const){line(rows.map(r=>[r[n]*.984,r[0]]), '#b4b4aa',.14);line(rows.map(r=>[r[n]*.955,r[0]]), '#a1746c',.085)}
  if(flatDeck){
    // Broad bow and flush parallel strips, with a third diagonal on the waist.
    for(const [x,z,x2,z2] of [[-2.1,16,-2.6,49],[4.15,17,4.8,49],[-4,-6,-8.6,22]]){
      line([[x,z],[x2,z2]],'#41494b',.58); line([[x,z],[x2,z2]],'#e2ddd0',.17)
      line([[x-.48,z],[x2-.48,z2]],ochre,.145,[1,.64])
      if(z>0){const dx=x2-x;line([[x+dx*.34,z+(z2-z)*.34],[x2,z2]],'#aeb4b4',.32)}
    }
  } else {
    for(const s of [-1,1])line([[s*2.3,14],[s*2.36,27],[s*2.4,49.8]],'#e6e4d9',.21)
    line([[1.05,-17],[.7,2],[.1,28],[.1,49]],ochre,.19)
    line([[-6.4,-4],[-3.4,9],[-1.65,21],[.1,29]],ochre,.16)
  }
  for(const [x,z] of [[-1,8],[-3,-13],[4.5,-34]]){
    ctx.strokeStyle='#d7b568';ctx.lineWidth=.088;ctx.beginPath();ctx.arc(x,z,.50,0,Math.PI*2);ctx.stroke()
    for(const t of [-1,1])line([[x+t*.65,z-.47],[x+t*.65,z+.47]],'#d0b475',.079)
  }
  // Only the ski-jump carriers carry a large number at the ramp lip in this interpretation.
  if(!flatDeck) {
    ctx.save();ctx.translate(0,44.5);ctx.scale(1,-1);ctx.font='bold 4.65px Arial';ctx.textAlign='center';ctx.textBaseline='middle'
    ctx.lineWidth=.22;ctx.strokeStyle='#555a59';ctx.strokeText(a.deckId,0,0);ctx.fillStyle='#dfdfd8';ctx.fillText(a.deckId,0,0);ctx.restore()
  }
  for(const z of [-21,15]){
    const e=interpolate(rows,z,2)-.55; line([[e,z-3],[e-3.35,z-3],[e-3.35,z+3],[e,z+3]],'#444e50',.14)
    line([[e-.14,z-2.82],[e-3.15,z-2.82],[e-3.15,z+2.82],[e-.14,z+2.82]],'#b1a57f',.055,[.42,.27])
  }
  const p:number[]=[], uv:number[]=[], indices:number[]=[]
  for(let i=0;i<rows.length;i++){
    const [z,lo,hi]=rows[i], y=deckHeight(id,z)
    for(const x of [lo,hi]){p.push(x,y,z);uv.push((x+16)/32,(z+52)/104)}
    if(i){const s=i*2;indices.push(s-2,s,s-1,s-1,s,s+1)}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals()
  const m=new T.Mesh(g,new T.MeshStandardMaterial({map:canvasTexture(c),roughness:.88,metalness:.04,side:T.DoubleSide}));m.name='Continuous flight deck';return m
}
// Sculpt the stem in 3D: near the bow the waterline ends well aft of the
// deck lip. A longitudinal loft alone would produce a vertical triangular wall.
function prowZ(id:CarrierId,z:number,y:number){
  const d=deckHeight(id,z), a=T.MathUtils.smoothstep(z,29,50), f=T.MathUtils.clamp(y/d,0,1)
  const stern=(1-T.MathUtils.smoothstep(z,-49,-35))*(1-f)*2.1
  return z+stern-a*(id==='fujian'?5.35:7.4)*(1-f*f*.83-f*.17)
}
function shellPt(id:CarrierId,rows:Station[],z:number,side:-1|1,y:number,out=0):Pt {
  return [sideAt(id,rows,z,side,y)+side*out,y,prowZ(id,z,y)]
}
const bodyBeam:Station[]=[[-49,3.5,3.7],[-46,4.8,5.3],[-37,5.8,6.1],[-28,6.55,6.85],[-17,6.75,7.05],[6,6.75,7.05],[19,6.35,6.7],[29,5.4,5.75],[36,4.1,4.35],[42,2.65,2.75],[47,1.0,1.05],[50,.045,.05]]
function sideAt(id:CarrierId,rows:Station[],z:number,side:-1|1,y:number) {
  const idx=side===-1?1:2, d=deckHeight(id,z)
  const w=interpolate(bodyBeam,z,id==='fujian'?2:1),e=Math.abs(interpolate(rows,z,idx))
  const high=Math.min(e-.18,w+.82+T.MathUtils.smoothstep(z,26,44)*Math.max(0,e-1.4-w))*(1-.55*T.MathUtils.smoothstep(z,44,50))
  const ring=[[-3,w*.58],[-1,w*.88],[-.05,w],[.31,w+.035],[1,w+.12],[d*.53,w*.43+high*.57],[d*.72,w*.20+high*.8],[d-.97,high],[d-.48,e-.10],[d-.12,e],[d,e]]
  let i=1;while(i<ring.length-1&&y>ring[i][0])i++
  return side*T.MathUtils.lerp(ring[i-1][1],ring[i][1],T.MathUtils.clamp((y-ring[i-1][0])/(ring[i][0]-ring[i-1][0]),0,1))
}
function hull(b:Painter,id:CarrierId,rows:Station[]){
  const zs=[...new Set([...rows.map(r=>r[0]),...bodyBeam.map(r=>r[0]),...Array.from({length:25},(_,i)=>26+i)])].sort((a,b)=>a-b)
  const color=[0x733e3b,0x754746,0x473f3c,0x909da0,0xa4afb0,0xa7b1b2,0xa7b1b2,0x7d8b8c,0xb3bbba,0x969f9f]
  for(const side of [-1,1] as const)for(let i=1;i<zs.length;i++){
    const section=(z:number):Pt[]=>{const d=deckHeight(id,z);return [-3,-1,-.05,.31,1,d*.53,d*.72,d-.97,d-.48,d-.12,d].map(y=>shellPt(id,rows,z,side,y))}
    const a=section(zs[i-1]),c=section(zs[i])
    for(let j=1;j<a.length;j++){
      const tint=b.clr(color[j-1]).clone().multiplyScalar(1+.017*Math.sin((zs[i]+20)*.066))
      const first=b.n.length
      if(side===1)b.quad(a[j-1],a[j],c[j],c[j-1],tint);else b.quad(c[j-1],c[j],a[j],a[j-1],tint)
      if(j>=3&&j<=7){
        const normal=(z:number,y:number):Pt=>{
          const v=(zz:number,yy:number)=>new T.Vector3(...shellPt(id,rows,Math.max(-49,Math.min(50,zz)),side,yy))
          return v(z,y+.15).sub(v(z,y-.15)).cross(v(z+.40,y).sub(v(z-.40,y))).multiplyScalar(side).normalize().toArray()
        }
        const ar=zs[i-1],cr=zs[i],aa=normal(ar,a[j-1][1]),ab=normal(ar,a[j][1]),ca=normal(cr,c[j-1][1]),cb=normal(cr,c[j][1])
        const ns=side===1?[aa,ab,cb,aa,cb,ca]:[ca,cb,ab,ca,ab,aa]
        for(let k=0;k<6;k++)for(let m=0;m<3;m++)b.n[first+k*3+m]=ns[k][m]
      }
    }
    for(const z of i===1?[zs[0],zs[zs.length-1]]:[]){
      if(side===1){const section=([-1,1] as const).map(s=>{const d=deckHeight(id,z);return [-3,-1,-.05,.31,1,d*.53,d*.72,d-.97,d-.48,d-.12,d].map(y=>shellPt(id,rows,z,s,y))})
        const [p,s]=section
        const mid=(j:number):Pt=>[0,s[j][1],s[j][2]+(z>0 ? 1.75*Math.sin(Math.PI*Math.max(0,s[j][1]/deckHeight(id,z))) : 0)]
        for(let j=1;j<p.length;j++){b.quad(p[j-1],p[j],mid(j),mid(j-1),color[j-1]);b.quad(mid(j-1),mid(j),s[j],s[j-1],color[j-1])}}
    }
  }

  // The stern has depth even from directly astern. Its rake brings the lower
  // transom in under a shallow overhang; the upper gallery breaks the blank slab.
  const aftZ=-49, h=spec[id].deck
  const transom=(x:number,y:number,ext=0):Pt=>[x,y,prowZ(id,aftZ,y)-ext]
  for(const [cx,w] of [[-2.18,2.1],[.28,1.66],[2.22,1.34]]){
    const l=cx-w/2,r=cx+w/2,y0=h*.54,y1=h*.76
    b.quad(transom(l,y0,.047),transom(l+.10,y1,.047),transom(r-.10,y1,.047),transom(r,y0,.047),0x4c5c64)
    b.rod(transom(l-.06,y1,.10),transom(r+.06,y1,.10),.068,light)
    b.rod(transom(l+.08,y0+.22,.09),transom(r-.08,y0+.22,.09),.044,0x91a0a0)
    for(const t of [.26,.73])b.rod(transom(l+t*w,y0,.095),transom(l+t*w,y1,.095),.041,steel)
  }
  for(const yy of [h*.49,h*.51]){
    const dl=.07,dr=.38
    b.quad(transom(-3.43,yy,dl),transom(3.18,yy,dl),transom(3.05,yy,dr),transom(-3.30,yy,dr),yy>h*.50?steel:shadow)
  }
  const gy=h*.51
  for(const yy of [gy+.25,gy+.47])b.rod(transom(-3.22,gy,.32).map((p,i)=>i===1?yy:p) as Pt,transom(3.0,gy,.32).map((p,i)=>i===1?yy:p) as Pt,.03,light)
  for(let i=0;i<9;i++){const xx=-3.22+i*.78,top=transom(xx,gy,.32);top[1]+=.49;b.rod(transom(xx,gy,.32),top,.042,light)}
  for(const xx of [-2.7,-1.45,1.16,2.58])b.rod(transom(xx,gy-.45,.04),transom(xx,gy,.33),.066,shadow)
  // Slim white deck-edge anti-slip band and several weathered fairlead mouths.
  b.quad(transom(-4.35,h-.13,.04),transom(3.98,h-.13,.04),transom(3.85,h-.27,.04),transom(-4.18,h-.27,.04),0xb8c0bd)
  for(const xx of [-2.24,-.56,1.34])b.quad(transom(xx-.18,h*.32,.051),transom(xx-.24,h*.38,.051),transom(xx+.23,h*.38,.051),transom(xx+.17,h*.32,.051),0x4c5e64)
  // Galleries under the projecting deck: shadow wells, braces, capsule canisters and rails.
  for(const side of [-1,1] as const){
    for(const [start,stop] of [[-38,-28],[-22,-12],[-7,4],[12,19],[28,34]]){
      const x=(z:number)=>interpolate(rows,z,side<0?1:2)
      for(let z=start;z<stop;z+=1.8){
        const z2=Math.min(stop,z+1.75),d=deckHeight(id,z),xx=x(z),xb=x(z2)
        const edge=(yy:number,offset:number,end:boolean):Pt=>[(end?xb:xx)+side*offset,yy,end?z2:z]
        b.quad(edge(d-.64,-.22,false),edge(d-1.23,-.22,false),edge(d-1.23,-.22,true),edge(d-.64,-.22,true),shadow)
        b.quad(edge(d-1.23,-.34,false),edge(d-1.23,.25,false),edge(d-1.23,.25,true),edge(d-1.23,-.34,true),steel)
        b.rod(edge(d-1.24,.24,false),edge(d-.64,.24,false),.032,light)
        for(const y of [d-.68,d-.92])b.rod(edge(y,.24,false),edge(y,.24,true),.021,light)
        const X=xx+side*.12
        if(z>-29&&z<14){
          b.rod([X,d-.94,z+.27],[X,d-.94,z+1.36],.19,0xd3d3c9,.19,9)
          for(const dz of [.49,1.11])b.rod([X,d-.92,z+dz],[X,d-.92,z+dz+.075],.198,shadow,.198,9)
        }
        b.rod([xx-side*.045,d-1.27,z],[sideAt(id,rows,z,side,d-2),d-2,z],.067,shadow)
      }
    }
    // A few recessed mooring galleries. No systematic equipment inventory.
    for(const z of [-35,-31,-25,-5,3,10,15,24,29,32,35]){
      const y=deckHeight(id,z)*.65, w=sideAt(id,rows,z,side,y)
      b.quad([w+side*.02,y-.19,z-.36],[w+side*.02,y+.13,z-.32],[sideAt(id,rows,z+.37,side,y)+side*.02,y+.13,z+.37],[sideAt(id,rows,z+.36,side,y)+side*.02,y-.19,z+.36],0x4b585b)
    }
    // Boat gallery inside the silhouette: a shaded aperture, canopy and davits.
    for(const z of (side===1?[-17.8,7.1]:[-24.5,-9.3])){
      const d=deckHeight(id,z),yy=d-2.05,xx=sideAt(id,rows,z,side,yy)
      const pp=(dy:number,dz:number,off:number):Pt=>shellPt(id,rows,z+dz,side,yy+dy,off)
      b.quad(pp(-.59,-2.35,.041),pp(.56,-2.16,.041),pp(.56,2.18,.041),pp(-.59,2.35,.041),0x4b5a61)
      b.rod(pp(.62,-2.2,.12),pp(.62,2.2,.12),.072,light)
      b.house(xx+side*.15,z,yy-.40,.61,3.4,.21,.85,0x929c99,.32)
      b.house(xx+side*.20,z+.12,yy-.19,.47,1.83,.30,.79,0xb3b8ae,.28)
      for(const sign of [-1,1])b.rod(pp(.52,sign*1.31,.08),pp(.02,sign*1.71,.57),.047,steel)
    }
    // Anchor pocket: painted shadow within the bow, with a restrained relief anchor.
    const z=44.65,y=deckHeight(id,z)*.52
    const point=(dz:number,dy:number):Pt=>shellPt(id,rows,z+dz,side,y+dy,.065)
    b.quad(point(-.78,-.12),point(-.44,.55),point(.60,.43),point(.75,-.38),dark)
    b.tri(point(-.78,-.12),point(.75,-.38),point(-.18,-.65),dark)
    b.rod(point(.29,.4),point(-.1,-.23),.073,0x8b8c86)
    b.rod(point(-.4,-.13),point(.2,-.45),.078,0x807f78)
  }
}

function hullDigits(id:CarrierId,rows:Station[]){
  const c=document.createElement('canvas');c.width=384;c.height=216
  const k=c.getContext('2d')!;k.translate(192,111);k.scale(.92,1)
  k.textAlign='center';k.textBaseline='middle';k.font='bold 204px Arial'
  k.fillStyle='#343b3c';k.fillText(spec[id].deckId,5,5)
  k.fillStyle='#e1e3dd';k.fillText(spec[id].deckId,0,0)
  const mat=new T.MeshStandardMaterial({map:canvasTexture(c),transparent:true,alphaTest:.26,roughness:.86,side:T.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})
  const p:number[]=[],uv:number[]=[],idx:number[]=[]
  for(const side of [-1,1] as const){
    const o=p.length/3
    for(let i=0;i<=12;i++){
      const z=side===1?35.15+i*.53:41.51-i*.53
      for(let j=0;j<2;j++){const y=2.35+j*2.62
        p.push(...shellPt(id,rows,z,side,y,.055));uv.push(i/12,j)}
      if(i){const a=o+i*2;idx.push(a-2,a-1,a,a,a-1,a+1)}
    }
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals()
  const m=new T.Mesh(g,mat);m.name='Painted pennant number '+spec[id].deckId;return m
}

// Wrap-around bridge glazing: individual panes catch different amounts of sky.
function bridge(b:Painter,x:number,z:number,y:number,w:number,l:number,h:number){
  b.house(x,z,y,w*.84,l*.89,.40,1.1,shadow)
  b.house(x,z,y+.35,w,l,h,1.015,0x62717a)
  const dx=w*.5, dz=l*.5, corner=.18*Math.min(w,l), ring:DeckPoint[]=[[-dx+corner,-dz],[-dx,-dz+corner],[-dx,dz-corner],[-dx+corner,dz],[dx-corner,dz],[dx,dz-corner],[dx,-dz+corner],[dx-corner,-dz]]
  for(let i=0;i<8;i++){const a=ring[i],c=ring[(i+1)%8],n=Math.max(1,Math.round(Math.hypot(c[0]-a[0],c[1]-a[1])/.49))
    for(let j=0;j<n;j++){
      const pt=(t:number,yy:number):Pt=>[x+T.MathUtils.lerp(a[0],c[0],t)*1.021,yy,z+T.MathUtils.lerp(a[1],c[1],t)*1.021]
      b.quad(pt((j+.09)/n,y+.45),pt((j+.08)/n,y+.33+h),pt((j+.91)/n,y+.33+h),pt((j+.88)/n,y+.45),[pane,0x3e505b,0x526672,0x465965][(i+j)%4])
      const t=(j+.015)/n
      b.rod(pt(t,y+.37),pt(t,y+.37+h),.036,light,.038,5)
    }
  }
  b.house(x,z,y+h+.34,w*1.07,l*1.035,.16,.989,light)
}

function island(b:Painter,id:CarrierId){
  const a=spec[id], x=a.ix,z=a.iz,y=a.deck, l=a.islandL, f=id==='fujian',s=id==='shandong'
  const tower=z+l*(f?.11:.145), iw=f?3.95:s?3.9:4.05
  b.house(x,z,y-.02,iw,l,2.55,.93,steel,.19)
  b.house(x,z-.08,y+2.45,iw*1.075,l*.985,.28,1,light,.18)
  b.house(x,z+.3,y+2.7,iw*.895,l*.93,1.3,.95,steel,.18)
  // Extended aft-facing bridge and galleries break up the island elevation.
  bridge(b,x,z-l*.33,y+2.8,iw*1.06,l*.27,.63)
  for(const sign of [-1,1])for(let i=0;i<9;i++){
    const zz=z-l*.31+i*l*.076,xx=x+sign*iw*.482
    b.box(xx,y+1.55,zz,.065,.22,.38,shadow)
  }
  const bw=f?4.6:s?4.72:4.25
  // Fujian: single lighter, integrated tower; Shandong: distinctive stacked bridges;
  // Liaoning: a longer base, offset forward bridge and visually separate aft exhaust.
  b.house(x,tower,y+3.55,iw*1.03,l*(f?.74:.64),1.62,.93,steel,.21)
  bridge(b,x-.075,tower+1.13,y+4.92,bw*(s?1.05:1),f?6.38:s?6.6:5.6,.70)
  if(s)bridge(b,x-.03,tower+1.0,y+6.23,bw*.96,5.85,.59)
  if(f)bridge(b,x,tower+.77,y+6.27,bw*.91,5.35,.50)
  if(!f&&!s)b.house(x,tower-.35,y+6.12,3.7,5.4,.57,.94,steel)
  const hh=f?7.47:s?7.54:6.66
  b.house(x,tower-.35,y+hh, f?3.62:3.03,f?4.65:3.67,f?3.1:2.54,.60,steel,.23,.08)
  const ey=y+hh+(f?3.1:2.54), ez=tower-.35, funnelZ=z-l*.178
  b.house(x,funnelZ,y+3.88,iw*.88,l*.289,f?3.15:3.86,.73,steel,.24,-.18)
  b.house(x,funnelZ-.18,y+3.88+(f?3.15:3.86),iw*.69,l*.215,.32,.95,dark,.22)
  for(let k=0;k<4;k++)b.box(x,y+3.88+(f?3.47:4.18),funnelZ-.18+(k-1.5)*.42,iw*.48,.07,.09,0x879194)
  b.house(x,ez,ey,2.05,2.40,.19,.96,light)
  b.rod([x,ey+.15,ez],[x,ey+3.2,ez],.22,steel,.095)
  b.rod([x,ey+3.2,ez],[x,ey+4.3,ez],.044,shadow,.032,6)
  for(const [height,width] of [[.85,1.9],[1.75,1.38],[2.55,.95]]) {
    b.rod([x-width,ey+height,ez],[x+width,ey+height,ez],.057,shadow)
    for(const sign of [-1,1]){b.rod([x,ey+height-.42,ez],[x+width*sign,ey+height,ez],.039,steel);b.rod([x+width*sign,ey+height,ez],[x+width*sign,ey+height+.42,ez],.021,steel)}
  }
  for(const [xx,zz,h,r] of [[x-1.35,z-l*.26,5.8,.47],[x+1.08,z+l*.255,6.6,.33],[x+.85,z-l*.36,5.1,.37]]){
    b.rod([xx,y+h-.87,zz],[xx,y+h-.12,zz],r*.59,steel);b.sphere(xx,y+h,zz,r,0xc4c8c5)
  }
  // A real island reads as independent bridge wings, balconies, recessed
  // faces and a broken aerial skyline. Long blank walls collapse in a low
  // shot, so use physical relief rather than a window pattern on a box.
  const shelf=(xx:number,zz:number,base:number,w:number,length:number,rails=true)=>{
    b.house(xx,zz,base-.20,w,length,.17,.987,shadow,.12)
    b.house(xx,zz,base-.04,w+.08,length+.04,.12,1,light,.12)
    if(!rails)return
    for(const sg of [-1,1]){const x0=xx+sg*(w/2-.06)
      for(const height of [.20,.37])b.rod([x0,base+height,zz-length*.38],[x0,base+height,zz+length*.38],.029,light)
      for(let k=0;k<5;k++){const z0=zz-length*.38+k*length*.19;b.rod([x0,base+.06,z0],[x0,base+.39,z0],.034,light)}
    }
  }
  shelf(x-.03,z-l*.37,y+2.75,iw*1.16,3.9)
  shelf(x+.05,z+l*.31,y+4.55,iw*1.21,3.75)
  shelf(x,tower+.75,y+hh-.16,bw*1.01,4.35,false)
  for(const sign of [-1,1]){
    const xx=x+sign*iw*.464
    // Distinct bands of ventilation grilles with light metal frames.
    for(const zz of [z-l*.135,z+l*.08]){
      b.box(xx,y+3.31,zz,.14,.65,1.98,light)
      b.box(xx+sign*.09,y+3.31,zz,.065,.51,1.80,0x51616a)
      for(let j=0;j<3;j++)b.box(xx+sign*.14,y+3.13+j*.16,zz,.08,.045,1.79,0x96a2a4)
    }
    b.box(x+sign*iw*.51,y+1.48,z+.2,.13,1.65,.94,0x839298)
    b.box(x+sign*iw*.54,y+1.95,z+.2,.06,.30,.40,pane)
    for(let k=0;k<3;k++){
      const zz=z+l*(.16+k*.085)
      b.rod([xx+sign*.32,y+4.45,zz],[xx-sign*.08,y+3.91,zz],.061,shadow)
    }
    // Subtly inset, bevel-edged visible tower cheek, drawn to catch the sidelight.
    const tx=x+sign*1.44, tz=ez-.28
    const pt=(v:number,dy:number,offs:number):Pt=>[tx-sign*dy*.24+sign*offs,y+hh+.36+dy,tz+v]
    b.quad(pt(-1,0,0),pt(-.85,1.64,0),pt(.90,1.64,0),pt(1.05,0,0),0x788a91)
    b.quad(pt(-.89,.10,.02),pt(-.74,1.53,.02),pt(.8,1.53,.02),pt(.92,.10,.02),0x929fa2)
    // High gallery and yardarm silhouette on both sides, distinct from the funnel.
    const xx2=x+sign*1.28
    b.rod([xx2,ey-.51,ez+.3],[x+sign*2.32,ey+.17,ez+.3],.064,shadow)
    b.rod([x+sign*.57,ey+.17,ez+.3],[x+sign*2.32,ey+.17,ez+.3],.10,steel)
    b.sphere(x+sign*2.23,ey+.33,ez+.3,.14,light)
  }
  if(!f){
    // The lattice and broad cross-head retain a distinct silhouette above the bridges.
    const mz=ez+.12
    for(const sign of [-1,1]){
      b.rod([x+sign*.65,ey,mz],[x+sign*.20,ey+3.0,mz],.084,steel,.045)
      for(let k=0;k<3;k++)b.rod([x+sign*(.59-k*.13),ey+k*.88,mz],[x-sign*(.51-k*.13),ey+(k+1)*.88,mz],.044,shadow)
    }
    const h=ey+(s?2.5:2.0)
    b.rod([x-1.12,h,mz],[x+1.12,h,mz],.095,shadow)
    for(let k=0;k<8;k++)b.rod([x-.89+k*.25,h+.01,mz],[x-.95+k*.26,h+.61,mz-.17],.051,0x71838b,.038)
    b.rod([x-1.09,h+.61,mz-.17],[x+1.0,h+.61,mz-.17],.066,shadow)
    b.rod([x+.7,y+7.45,funnelZ],[x+.7,y+(s?9.3:10.2),funnelZ],.093,steel,.047)
    shelf(x,z-l*.28,y+5.04,3.95,2.4)
  }else{
    b.house(x,ez+.05,ey+.22,1.26,1.35,.93,.76,steel,.22)
    b.rod([x,ey+.75,ez],[x,ey+2.55,ez],.28,steel,.12)
    b.house(x,ez,ey+1.76,1.65,1.55,.13,.94,shadow)
  }
  for(const [xoff,zoff,height] of [[-.82,.34,1.75],[.84,-.69,1.58],[-.6,-1.28,1.23]])b.rod([x+xoff,ey-.16,ez+zoff],[x+xoff,ey+height,ez+zoff],.039,shadow,.019,6)
  // Mast flag: real red cloth accent at long focal lengths, no invented unit insignia.
  const fy=ey+2.35
  for(let i=0;i<6;i++){
    const p=(n:number,v:number):Pt=>[x+.18*Math.sin(n*.83),fy+v*.51-.10*n/6+.045*Math.sin(n*.72),ez-n*.20]
    b.quad(p(i,0),p(i,1),p(i+1,1),p(i+1,0),0xaf332c)
  }
}

// Occasional white-clad figures on the outboard gallery give a human-scale cue;
// not a literal count or a reconstruction of a particular parade day.
function figures(b:Painter,id:CarrierId,rows:Station[]){
  for(const [side,start,end] of [[1,-35,-29],[-1,4,12]] as const)for(let z=start+.44;z<end;z+=1.38){
    const x=interpolate(rows,z,side<0?1:2)-side*.36,y=deckHeight(id,z)
    b.rod([x,y+.025,z],[x,y+.22,z],.062,0xb9bdb8,.080,5)
    b.rod([x,y+.20,z],[x,y+.45,z],.099,0xd5d5cb,.089,5)
    b.sphere(x,y+.505,z,.062,0xb6a28d);b.rod([x,y+.54,z],[x,y+.575,z],.084,white,.082,6)
  }
}

export function makeCarrier(id:CarrierId,deckHeightPx=2048):T.Group {
  const a=spec[id], rows=id==='fujian'?flat:jump, root=new T.Group(),draft=new T.Group(),b=new Painter()
  root.name='Carrier exterior 路 '+id+' / '+a.deckId
  hull(b,id,rows);island(b,id);figures(b,id,rows)
  draft.add(b.mesh(),flightDeck(id,rows,deckHeightPx),hullDigits(id,rows))
  draft.scale.set(-a.width,1,a.len);root.add(draft)
  return root
}
