/**
 * Four original exterior portraits for the actual globe. Artists' 100-unit
 * hulls, not drawings to scale. +X bow, +Y up, +Z starboard, y=0 water.
 * No equipment locations, interiors or mechanisms are reconstructed.
 * The US ships represent classes, not individual numbered hulls. DDHs
 * freeze two documented appearances, not a claim about today's refit:
 * https://www.cnatra.navy.mil/local/docs/naval-aviation-vision.pdf
 * https://www.mod.go.jp/msdf/equipment/ships/ddh/izumo/index.html
 * https://www.mod.go.jp/j/press/wp/wp2022/html/nc020000.html
 * https://www.navy.mil/Press-Office/News-Stories/display-news/Article/3940484/f-35b-test-jet-begins-sea-trials-with-japanese-multi-functional-destroyer-in-ea/
 *
 * Two draw calls per uninstanced portrait. Hull, details, parked silhouettes
 * and island share vertex-coloured geometry. Every painted deck mark lives
 * in one mipmapped atlas, not coplanar line overlays on a close-up globe.
 */
import * as T from 'three'

export type CapitalModelId = 'nimitz' | 'ford' | 'izumo' | 'kaga'
type V = [number, number, number]
type XZ = [number, number]
type D = [number, number, number] // longitudinal station; port & starboard edges
const us = (id: CapitalModelId) => id === 'nimitz' || id === 'ford'

const forms: Record<CapitalModelId, D[]> = {
  nimitz: [[-50,-4.9,5.9],[-49,-6.2,6.6],[-43,-6.6,7.3],[-35,-7.5,10.1],[-22,-9.6,10.2],[-8,-11.4,10.3],[6,-12.2,10.4],[17,-12.7,10.4],[22,-12.1,9.8],[26,-8.4,8.9],[30,-6.2,7.3],[42,-5.3,5.9],[49.5,-4.5,4.35],[50,-4.1,3.95]],
  ford: [[-50,-5.2,6],[-48,-6.6,6.9],[-38,-7.6,9.1],[-29,-8.8,10.6],[-15,-10.5,11.3],[0,-12.4,11.2],[14,-13,10.5],[22,-13,9.6],[26,-10.9,8.5],[29,-6.5,7.3],[38,-5.8,6.4],[49.3,-4.3,4.4],[50,-3.9,4]],
  izumo: [[-50,-6.55,6.25],[-48,-7.15,6.85],[-39,-7.55,7.1],[-32,-7.6,7.2],[-28,-7.6,8.65],[-21,-7.6,8.65],[-17,-7.6,7.3],[8,-7.55,7.35],[31,-7.38,7.2],[38,-6.6,6.65],[49.7,-4.0,4.15],[50,-3.55,3.8]],
  kaga: [[-50,-6.55,6.25],[-48,-7.15,6.85],[-39,-7.55,7.1],[-32,-7.6,7.2],[-28,-7.6,8.65],[-21,-7.6,8.65],[-17,-7.6,7.3],[8,-7.55,7.35],[33,-7.5,7.2],[48.6,-7.4,7.05],[50,-6.8,6.5]],
}
function edge(stations:D[], x:number, axis:1|2) {
  for(let i=1;i<stations.length;i++) if(x<=stations[i][0]) {
    const a=stations[i-1],b=stations[i]
    return T.MathUtils.lerp(a[axis],b[axis],T.MathUtils.clamp((x-a[0])/(b[0]-a[0]),0,1))
  }
  return stations[stations.length-1][axis]
}

// A fixed, broad daylight wash and a cool under-deck bounce keep the portrait
// legible on Earth's night hemisphere without changing any shared illumination.
class Painter {
  pos:number[]=[]; rgb:number[]=[]
  cache=new Map<number,T.Color>()
  tri(a:V,b:V,c:V,ink:number, value=1) {
    const ax=b[0]-a[0],ay=b[1]-a[1],az=b[2]-a[2],bx=c[0]-a[0],by=c[1]-a[1],bz=c[2]-a[2]
    const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx, len=Math.hypot(nx,ny,nz)||1
    const key=Math.max(0,(nx*.39+ny*.81+nz*.44)/len)
    const k=(.68+.43*key+.065*Math.abs(nz)/len)*value
    if(!this.cache.has(ink))this.cache.set(ink,new T.Color(ink))
    const {r,g,b:blue}=this.cache.get(ink)!
    this.pos.push(...a,...b,...c)
    for(let i=0;i<3;i++)this.rgb.push(r*k,g*k,blue*k*1.015)
  }
  quad(a:V,b:V,c:V,d:V,ink:number,k=1){this.tri(a,b,c,ink,k);this.tri(a,c,d,ink,k)}
  // Clockwise as seen from above: cross products of the cap point +Y.
  tier(x:number,y:number,z:number,l:number,w:number,h:number,ink:number, inset=.16, shift=0, bevel=.14) {
    const rim=(sy:number,sx:number,sw:number,sl:number):V[]=>{
      const a=sl/2,b=sw/2,c=Math.min(sl,sw)*bevel
      return [[-a+c,-b],[-a,-b+c],[-a,b-c],[-a+c,b],[a-c,b],[a,b-c],[a,-b+c],[a-c,-b]].map(([u,v])=>[sx+u,sy,z+v])
    }
    const floor=rim(y,x,w,l),top=rim(y+h,x+shift,Math.max(.02,w-inset*2),Math.max(.02,l-inset*2))
    for(let i=0;i<8;i++){
      const j=(i+1)%8
      this.quad(floor[i],floor[j],top[j],top[i],ink)
      this.tri([x+shift,y+h,z],top[i],top[j],ink)
    }
  }
  pole(a:V,b:V,r:number,ink:number,rt=r,n=6) {
    const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A).normalize()
    const u=new T.Vector3().crossVectors(v,Math.abs(v.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0)).normalize()
    const w=new T.Vector3().crossVectors(v,u)
    const pt=(C:T.Vector3,R:number,i:number):V=>{
      const t=i/n*Math.PI*2
      return [C.x+R*(u.x*Math.cos(t)+w.x*Math.sin(t)),C.y+R*(u.y*Math.cos(t)+w.y*Math.sin(t)),C.z+R*(u.z*Math.cos(t)+w.z*Math.sin(t))]
    }
    for(let i=0;i<n;i++){
      this.quad(pt(A,r,i),pt(A,r,i+1),pt(B,rt,i+1),pt(B,rt,i),ink)
      this.tri(b,pt(B,rt,i),pt(B,rt,i+1),ink)
    }
  }
  dome(x:number,y:number,z:number,r:number,ink:number) {
    const pt=(j:number,i:number):V=>{
      const a=j*Math.PI/8,b=i*Math.PI/5;return [x+r*Math.cos(a)*Math.cos(b),y+r*Math.sin(a),z+r*Math.cos(a)*Math.sin(b)]
    }
    for(let j=0;j<4;j++)for(let i=0;i<10;i++)this.quad(pt(j,i),pt(j+1,i),pt(j+1,i+1),pt(j,i+1),ink)
  }
  mesh(scale:number){
    const g=new T.BufferGeometry()
    g.setAttribute('position',new T.Float32BufferAttribute(this.pos.map(v=>v*scale),3))
    g.setAttribute('color',new T.Float32BufferAttribute(this.rgb,3));g.computeVertexNormals()
    return new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,toneMapped:false}))
  }
}
const gray=0xa9b7bf,top=0xb7c1c6,mid=0x929ea6, steel=0x7e8f99, shade=0x52626d, glass=0x415965, pale=0xd6dddb
function body(b:Painter,id:CapitalModelId,H:number) {
  const cvn=us(id), widths=cvn?[4.1,4.85,5.75,6,6.05,5.80,5.25,4.3,2.85,1.75,.9,.02]:
    [4.3,5.25,5.85,6.04,6.04,5.8,5.12,4.36,3.0,1.8,.85,.025]
  const xs=[-49,-46,-36,-20,-7,10,23,32,39,43,46.4,49.3]
  const rings=xs.map((x,i)=>{
    const w=widths[i],bow=Math.max(0,(x-32)/17.3)**2
    const aft=Math.max(0,(-x-40)/9)
    return [[x-3.2*bow+1.1*aft,-1.25,w*.73],[x-2.8*bow+.8*aft,.1,w*.84],[x-1.2*bow+.4*aft,H*.53,w*.94],[x,H-.52,w]] as V[]
  })
  for(const s of [-1,1]){
    const p=(i:number,j:number):V=>{const [x,y,z]=rings[i][j];return [x,y,s*z]}
    const skin=(i:number,j:number)=>{
      const l=Math.max(0,i-1),r=Math.min(xs.length-1,i+1)
      const a=rings[l][j],c=rings[r][j], slope=(c[2]-a[2])/(c[0]-a[0])
      // Interpolate the flank illumination at shared stations, not as a
      // different flat-colour strip on each plate. The bow should round away.
      const dot=(-slope*.39+s*.44-.07)/Math.sqrt(1+slope*slope)
      const level=[.37,.61,.85,.98][j]+.08*Math.max(0,dot)
      const col=new T.Color(0xa2b0bb).multiplyScalar(level*(1+.012*Math.sin(i*2.1)))
      return [col.r,col.g,col.b] as V
    }
    for(let i=1;i<rings.length;i++)for(let h=0;h<3;h++){
      const pts=[[i-1,h],[i,h],[i,h+1],[i-1,h+1]]
      for(const q of s>0?[0,1,2,0,2,3]:[0,2,1,0,3,2]){
        const [ix,j]=pts[q];b.pos.push(...p(ix,j));b.rgb.push(...skin(ix,j))
      }
    }
  }
  for(const i of [0,xs.length-1]){
    for(let j=0;j<3;j++){
      const [x,y,z]=rings[i][j],[xx,yy,zz]=rings[i][j+1]
      b.quad([x,y,-z],[x,y,z],[xx,yy,zz],[xx,yy,-zz],i===0?mid:gray)
    }
  }
  // Small painted pennants on the named Japanese hulls only. Conform
  // the strokes to the flare instead of floating a rectangular decal.
  const beam=(x:number,y:number)=>{
    const f=T.MathUtils.clamp((y-H*.53)/(H*.47-.52),0,1)
    const layers=rings.map(r=>{
      const a=r[2],c=r[3]
      return [T.MathUtils.lerp(a[0],c[0],f),0,T.MathUtils.lerp(a[2],c[2],f)] as D
    })
    return edge(layers,x,2)
  }
  for(const s of [-1,1]){
    const surface=(x:number,y:number,dist=.025):V=>[x,y,s*(beam(x,y)+dist)]
    if(cvn){
      // A shadowed gallery set back from the deck-edge walkways. Broken
      // lintels, door bays and short balconies, rather than a single grey wall.
      for(const [start,end] of (s===1?[[-35,-25],[-11,-1],[8,15]]:[[-35,-26],[-15,-9],[3,11]])){
        const y=H*.61,ht=H*.23
        b.quad(surface(start,y),surface(end,y),surface(end,y+ht),surface(start,y+ht),shade)
        for(let x=start+.3;x<end;x+=1.25){
          b.quad(surface(x,y,.06),surface(x+.09,y,.06),surface(x+.12,y+ht,.06),surface(x,y+ht,.06),mid)
        }
        const zz=s*(beam((start+end)/2,y)+.25)
        b.tier((start+end)/2,y-.09,zz,end-start+.18,.65,.13,mid,.025)
      }
    }
    if(!cvn) {
      const glyphs:Record<string,XZ[][]>={
        '1':[[[.06,.75],[.32,1],[.32,0]],[[.05,0],[.60,0]]],
        '8':[[[.09,.53],[0,.68],[.02,.88],[.15,1],[.47,1],[.61,.87],[.61,.68],[.50,.53],[.11,.53],[.00,.37],[.01,.14],[.15,0],[.48,0],[.61,.13],[.62,.37],[.50,.53]]],
        '3':[[[.02,.83],[.15,1],[.47,1],[.61,.86],[.61,.68],[.46,.52],[.24,.52]],[[.46,.52],[.62,.37],[.60,.14],[.48,0],[.13,0],[.00,.16]]],
        '4':[[[.46,0],[.46,.98],[.02,.32],[.65,.32]]],
      }
      const number=id==='izumo'?'183':'184', height=1.62
      for(const [glyphIndex,glyph] of Array.from(number).entries()) for(const path of glyphs[glyph]){
        for(let j=1;j<path.length;j++){
          const a=path[j-1],e=path[j],du=e[0]-a[0],dv=e[1]-a[1],d=Math.hypot(du,dv),h=.057
          const pt=(q:XZ,side:number,dx:number,dy:number,dist:number):V=>surface(34+s*(glyphIndex*.81+q[0]+side*h*dv/d+dx-1.12)*height,H*.59+(q[1]-side*h*du/d+dy)*height,dist)
          for(const [dx,dy,dist,color] of [[.05,-.04,.025,steel],[0,0,.039,0xe7e9e1]]){
            b.quad(pt(a,1,dx,dy,dist),pt(a,-1,dx,dy,dist),pt(e,-1,dx,dy,dist),pt(e,1,dx,dy,dist),color)
          }
        }
      }
    }
    // Fairleads, inset gallery ports and angled sheer crease. These are painterly
    // scale cues, deliberately not a reproduction of any ship's fittings schedule.
    for(const x of (cvn?[30,31.65,38.4,42.3]:[-39,-36.6,-34.2,-14,-12.5,22.8,24.6,42.3])){
      const cy=H*.73,cx=x,rx=x>38?.43:.31,ry=x>38?.23:.15
      for(let i=0;i<8;i++) {
        const rim=(k:number)=>surface(cx+rx*Math.cos(k*Math.PI/4),cy+ry*Math.sin(k*Math.PI/4),.045)
        b.tri(surface(cx,cy,.047),rim(i),rim(i+1),shade)
      }
    }
  }
  // Flight deck overhang, tiered at the galleries. Black waterline is not a rectangular slab.
  const st=forms[id], levels=[H-.82,H-.43,H-.16,H]
  for(let i=1;i<st.length;i++)for(const side of [1,2] as const){
    const v=(k:number,j:number):V=>[st[k][0],levels[j],st[k][side]*(j===0?.80:j===1?.95:1)]
    for(let j=0;j<3;j++){
      const q:V[]=[v(i-1,j),v(i,j),v(i,j+1),v(i-1,j+1)];if(side===1)q.reverse()
      b.quad(q[0],q[1],q[2],q[3],j===0?shade:j===1?mid:gray)
    }
    b.quad([st[i-1][0],levels[0],0],v(i-1,0),v(i,0),[st[i][0],levels[0],0],shade)
  }
  for(const row of [st[0],st[st.length-1]])b.quad([row[0],levels[0],row[1]*.8],[row[0],H,row[1]],[row[0],H,row[2]],[row[0],levels[0],row[2]*.8],mid)
  // Shadowed gallery doors and intermittent rail runs cast a recognisable scale at water level.
  for(const side of [1,2] as const){
    const s=side===1?-1:1
    for(const [l,r] of [[-42,-32],[-26,-14],[-9,2],[7,15],[19,26]]){
      const p=(x:number,y:number,o:number):V=>[x,y,edge(st,x,side)+s*o]
      for(let x=l;x<r;x+=1.4){
        const end=Math.min(x+1.4,r)
        b.quad(p(x,H-.32,.055),p(end,H-.32,.055),p(end,H-.10,.055),p(x,H-.10,.055),shade)
        b.pole(p(x,H-.33,.10),p(x,H+.10,.10),.046,top)
        b.pole(p(x,H+.10,.10),p(end,H+.10,.10),.031,gray)
      }
      for(let x=l+1;x<r-1.0;x+=1.85)b.pole(p(x,H-.74,-.41),p(x+.93,H-.74,-.41),.155,pale,.155,7)
    }
  }
  // Recessed hangar/transom gallery beneath the projecting stern.
  const sx=-49.06
  b.quad([sx,H*.53,-3.7],[sx,H*.53,3.7],[sx,H*.80,3.7],[sx,H*.80,-3.7],shade)
  for(let z=-3.4;z<=3.4;z+=1.05)b.pole([sx-.03,H*.52,z],[sx-.03,H*.83,z],.067,gray)
}
// Original vector-painted deck chart: restrained markings, non-skid swatches and a little wear.
function flightDeck(id:CapitalModelId,H:number,scale:number) {
  const st=forms[id], cvn=us(id), W=1024, D=320, span=30
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=D
  const c=canvas.getContext('2d')!
  c.setTransform(W/100,0,0,D/span,W/2,D/2)
  c.fillStyle=cvn?'#6b7479':'#677579';c.fillRect(-50,-15,100,30)
  let seed=1167
  const rand=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296
  for(let i=0;i<5600;i++){c.fillStyle=i%2?'rgba(236,233,215,.075)':'rgba(32,42,46,.08)';c.fillRect(-50+rand()*100,-15+rand()*30,.12+rand()*.35,.06+rand()*.10)}
  // Long, uneven rub marks on non-skid, intentionally much quieter than paint.
  for(let i=0;i<1300;i++){
    const x=-49+rand()*95,z=-13+rand()*26
    c.fillStyle=i%4?'rgba(26,31,33,.045)':'rgba(205,207,201,.06)'
    c.fillRect(x,z,.22+rand()*2.7,.02+rand()*.085)
  }
  const poly=(pts:XZ[],color:string)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,z],i)=>i?c.lineTo(x,z):c.moveTo(x,z));c.closePath();c.fill()}
  const path=(pts:XZ[],ink:string,width:number,dash:number[]=[])=>{c.beginPath();c.strokeStyle=ink;c.lineWidth=width;c.setLineDash(dash);pts.forEach(([x,z],i)=>i?c.lineTo(x,z):c.moveTo(x,z));c.stroke();c.setLineDash([])}
  const chalk='#e1ded0',buff='#d5bd72',seam='#535d62'
  for(const side of [1,2] as const)path(st.map(p=>[p[0],p[side]+(side===1?.28:-.28)]), '#bcc4c3',.115)
  for(let x=-48;x<50;x+=3.8)path([[x,-13],[x+.2,13]],'rgba(205,208,208,.17)',.045)
  if(cvn){
    const s=(x:number)=>1.9-(x+50)*.147
    poly([[-50,s(-50)-3.25],[25,s(25)-3.25],[25,s(25)+3.25],[-50,s(-50)+3.25]],'#5d676c')
    for(const sign of [-1,1]){
      path([[-49,s(-49)+3.24*sign],[24,s(24)+3.24*sign]],chalk,.27)
      path([[-48,s(-48)+3.58*sign],[23,s(23)+3.58*sign]],'#d7bd80',.10)
    }
    path([[-49,s(-49)],[25,s(25)]],buff,.20,[1.8,1.0])
    for(const z of [-1.85,2.1]){path([[13,z],[47,z-.2]],seam,.31);path([[15,z+.22],[47,z+.02]],'#c8c7bc',.12)}
    const elevators=id==='nimitz'?[[-33,1],[-7,1],[13,1],[-32,-1]]:[[-32,1],[10,1],[-31,-1]]
    for(const [x,sig] of elevators){
      const z=edge(st,x,sig<0?1:2)-sig*.7
      path([[x-2.8,z],[x-2.8,z-sig*2.7],[x+2.8,z-sig*2.7],[x+2.8,z]],seam,.19)
      path([[x-2.6,z-sig*.2],[x-2.6,z-sig*2.5],[x+2.6,z-sig*2.5]],'#cbb77f',.10,[.32,.23])
    }
  }else{
    const z=-1.9
    path([[-48,z],[48,z]],buff,.245)
    for(const x of [-39,-22,-5,12,29]){
      path([[x-2.35,z-2.55],[x+2.35,z-2.55]],chalk,.23)
      path([[x-2.35,z+2.55],[x+2.35,z+2.55]],chalk,.23)
      for(const side of [-1,1]){path([[x,z+side*2.55],[x,z+side*.69]],chalk,.18);path([[x-.70,z+side*.70],[x+.70,z+side*.70]],chalk,.16)}
    }
    path([[24,1.1],[29.9,1.1],[29.9,6.2],[24,6.2],[24,1.1]],seam,.17)
    path([[-28,5],[-21,5],[-21,8],[-28,8],[-28,5]],seam,.16)
  }
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;tex.flipY=false
  const pts:number[]=[],uv:number[]=[],idx:number[]=[]
  for(let i=0;i<st.length;i++){
    for(const z of [st[i][1],st[i][2]]){pts.push(st[i][0]*scale,H*scale,z*scale);uv.push((st[i][0]+50)/100,(z+span/2)/span)}
    if(i>0){const a=2*i-2;idx.push(a,a+1,a+2,a+2,a+1,a+3)}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals()
  return new T.Mesh(g,new T.MeshBasicMaterial({map:tex,side:T.DoubleSide,toneMapped:false}))
}
// A projecting pilothouse ribbon with separated panes, visible from either beam.
function bridge(b:Painter,x:number,y:number,z:number,l:number,w:number,h:number) {
  b.tier(x,y-.15,z,l+.30,w+.34,.22,shade,.03)
  b.tier(x,y,z,l,w,h,mid,-.04)
  for(const s of [-1,1]){
    const count=Math.max(3,Math.round(l/.54)),step=(l-w*.19)/count
    for(let n=0;n<count;n++){
      const left=x-l*.5+w*.095+n*step,zz=z+s*(w*.5+.075)
      b.quad([left+.04,y+.13,zz],[left+step-.07,y+.13,zz],[left+step-.05,y+h-.14,zz],[left+.02,y+h-.14,zz],n%3?glass:0x557382)
    }
    for(let n=0;n<3;n++){
      const xx=x+s*(l*.5+.061),zz=z-w*.36+n*w*.24
      b.quad([xx,y+.13,zz],[xx,y+h-.14,zz],[xx,y+h-.14,zz+w*.19],[xx,y+.13,zz+w*.19],glass)
    }
  }
  b.tier(x,y+h-.04,z,l+.48,w+.48,.20,top,.025)
}
function mast(b:Painter,x:number,y:number,z:number,h:number,w:number) {
  const pt=(f:number,s:number,q:number):V=>[x+s*w*(1-.66*f)*.5,y+h*f,z+q*w*(1-.66*f)*.5]
  for(const s of [-1,1])for(const q of [-1,1]){
    b.pole(pt(0,s,q),pt(1,s,q),.087,mid,.047)
    for(let k=0;k<3;k++){
      const a=k/3,d=(k+1)/3
      b.pole(pt(a,s,q),pt(d,-s,q),.043,steel,.043,5)
      b.pole(pt(a,s,q),pt(d,s,-q),.037,steel,.037,5)
    }
  }
  b.pole([x,y+h*.72,z-w*1.8],[x,y+h*.72,z+w*1.8],.081,mid)
  b.pole([x,y+h*.49,z-w*1.45],[x,y+h*.49,z+w*1.45],.085,mid)
  b.tier(x,y+h-.18,z,w*.78,w*.80,.16,gray,.015)
  b.pole([x,y+h,z],[x,y+h+2.1,z],.070,steel,.034)
}
function island(b:Painter,id:CapitalModelId,H:number) {
  if(us(id)){
    const ford=id==='ford', x=ford?-17:-4.5,z=ford?8.45:7.7
    // Ford's small aft block is a very different silhouette from Nimitz's
    // longer stepped island, two-level overhanging bridge and open mast.
    b.tier(x,H,z,ford?9.3:14.3,3.7,2.3,gray,.31,ford?.3:-.20)
    b.tier(x-.28,H+2.05,z,ford?7.85:11.6,3.37,2.45,gray,.29)
    const length=ford?6.05:8.3
    bridge(b,x+.63,H+4.12,z-.24,length,3.60,1.02)
    bridge(b,x-.1,H+5.36,z-.17,length-.7,3.30,.91)
    b.tier(x-1.43,H+6.38,z,ford?3.76:4.5,2.62,ford?3.38:1.38,ford?gray:mid,ford?.57:.12,ford?.16:0)
    if(ford){
      b.tier(x-1.2,H+9.73,z,1.85,1.39,.81,top,.20)
      b.pole([x-1.2,H+10.56,z],[x-1.2,H+13.05,z],.093,steel,.025)
      b.pole([x-.77,H+8.20,z-2.0],[x-.77,H+8.20,z+2.0],.085,mid)
      b.dome(x+2.20,H+6.56,z+.43,.55,pale)
    } else {
      mast(b,x-.75,H+7.54,z,4.43,1.28)
      b.tier(x-5.34,H+2.18,z,2.8,2.4,2.0,mid,.15)
      mast(b,x-5.35,H+4.18,z,3.3,1.10)
      b.dome(x-5.39,H+7.48,z,.59,pale)
      b.dome(x+2.17,H+6.49,z-.83,.46,pale)
    }
    // Side galleries are deliberately feature bands rather than a simulated system fit.
    for(let i=0;i<(ford?5:8);i++) {
      const xx=x-(ford?3.6:5.7)+i*1.50
      b.tier(xx,H+1.2,z+1.63,.78,.17,.34,shade,.018)
      b.tier(xx,H+2.97,z-1.50,.62,.19,.35,glass,.015)
    }
  } else {
    // Izumo-family island is a long, continuous starboard block with split
    // uptakes and a projecting wing to the flight-deck side, not a CVN tower.
    const z=5.42
    b.tier(1.2,H,z,31.1,3.48,2.28,gray,.28,.36)
    b.tier(6.85,H+2.18,z,15,3.18,1.53,mid,.17)
    bridge(b,10.18,H+3.65,z-.27,6.85,3.42,1.16)
    b.tier(11.00,H+4.95,z,3.25,2.44,1.03,gray,.21)
    b.dome(11.45,H+5.98,z,.69,pale)
    b.tier(8.65,H+3.18,z-1.22,3.65,2.05,.41,gray,.04)
    bridge(b,8.7,H+3.56,z-1.47,2.82,1.65,.72)
    for(const x of [1.65,-8.5]){
      b.tier(x,H+2.23,z+.10,4.36,2.68,3.06,gray,.41,-.66)
      b.tier(x-.61,H+5.28,z+.1,3.64,2.02,.50,shade,.10,-.12)
      b.tier(x-.72,H+5.76,z+.1,3.1,1.64,.08,0x43505a,.01)
    }
    b.tier(5,H+3.57,z,2.23,2.20,2.05,gray,.28)
    mast(b,5,H+5.60,z,4.49,1.40)
    b.tier(-11.0,H+2.18,z,3.60,2.80,.85,gray,.12)
    b.dome(-11.1,H+3.03,z,.70,pale)
    for(let i=0;i<14;i++) {
      const xx=-11.3+i*1.66
      b.tier(xx,H+.82,z+1.67,.83,.16,.34,i%3===0?glass:shade,.015)
      if(i%3===0)b.tier(xx,H+1.74,z-1.47,.86,.13,.30,shade,.01)
    }
  }
}
// Few stationary, unarmed scale cues; these are not a depiction of an air wing.
function foldedAirframe(b:Painter,x:number,H:number,z:number,a:number,size:number){
  const cs=Math.cos(a),sn=Math.sin(a)
  const p=(u:number,h:number,v:number):V=>[x+size*(u*cs-v*sn),H+h*size,z+size*(u*sn+v*cs)]
  const ink=0xacb7bc
  b.pole(p(-2.45,.37,0),p(1.55,.46,0),.22*size,ink,.18*size)
  b.pole(p(1.53,.46,0),p(2.47,.43,0),.18*size,ink,.025*size)
  b.pole(p(.71,.65,0),p(1.36,.66,0),.142*size,glass,.06*size)
  for(const s of [-1,1]){
    b.quad(p(.65,.48,s*.12),p(-.40,.43,s*.15),p(-1.02,.38,s*1.20),p(-.47,.38,s*1.29),ink)
    b.quad(p(-.47,.38,s*1.29),p(-1.02,.38,s*1.20),p(-1.44,1.02,s*1.46),p(-1.06,1.12,s*1.54),mid)
    b.tri(p(-.93,.50,s*.18),p(-2.35,.44,s*.21),p(-2.05,1.28,s*.63),ink)
    b.tri(p(-1.11,.44,s*.15),p(-2.16,.37,s*1.0),p(-2.2,.37,s*.22),ink)
    b.pole(p(-.65,.10,s*.28),p(-.65,.32,s*.28),.065*size,shade)
  }
  b.pole(p(1.22,.10,0),p(1.22,.35,0),.05*size,shade)
}
function parkedHelicopter(b:Painter,x:number,H:number,z:number,size:number){
  const p=(u:number,h:number,v:number):V=>[x+size*u,H+size*h,z+size*v]
  b.pole(p(-2.8,.63,0),p(-.52,.53,0),.104*size,mid,.38*size)
  b.pole(p(-1.1,.59,0),p(.69,.59,0),.42*size,mid,.39*size,8)
  b.pole(p(.67,.61,0),p(1.34,.48,0),.39*size,glass,.18*size,8)
  b.tri(p(-2.85,.65,0),p(-3.14,1.26,0),p(-2.53,1.23,0),gray)
  b.pole(p(-.15,.91,0),p(-.15,1.35,0),.075*size,shade)
  for(const dz of [-.23,.23])b.quad(p(-.14,1.35,0),p(-1.18,1.34,dz),p(-2.87,1.19,2*dz),p(-1.89,1.25,2*dz),shade)
  for(const s of [-1,1])b.pole(p(-.65,.10,s*.34),p(-.65,.48,s*.34),.09*size,shade)
}
export function makeCapitalModel(id:CapitalModelId):T.Group {
  const carrier=us(id),H=carrier?5.68:5.97,scale=carrier?.00105:.00079
  const group=new T.Group(),paint=new Painter()
  body(paint,id,H);island(paint,id,H)
  if(carrier){
    for(const x of id==='ford'?[-38,-34,-30]:[-36,-32,-28])foldedAirframe(paint,x,H,5.66,-.85,.92)
    for(const x of [6,10])foldedAirframe(paint,x,H,6.85,-1.17,.92)
  } else {
    parkedHelicopter(paint,-34,H,3.40,1.16);parkedHelicopter(paint,-27,H,3.95,1.16)
  }
  const hull=paint.mesh(scale), deck=flightDeck(id,H,scale)
  hull.name=id+' / exterior';deck.name=id+' / deck'
  group.name='Review exterior / '+id;group.add(hull,deck)
  return group
}
