import * as T from 'three'

// Everything is authored as small, visible exterior shapes in display units;
// no interior geometry, mechanical interfaces, or working equipment.
export type P = [number, number, number]
type XZ = [number, number]
type Ring = [number, number, number, number] // x, top half-beam, sheer, waterline fraction
const C = { steel: '#aebcc2', pale: '#c5cfd0', side: '#8398a2', deck: '#667780', glass: '#314956',
  boot: '#3f5158', ink: '#d7d9ce', grey: '#929fa3', dark: '#59666b', rubber: '#38454a' }
export { C }
const rgb = new Map<string, T.Color>()
// A mipmapped paint tile replaces screen-space shader noise. Very slight
// differences in weathering stay attached to the plating as the lens moves;
// railings fade rather than turning the hull into a field of glitter.
let paintBytes: Uint8Array<ArrayBuffer> | undefined
function hullPaint(){
  const n=192
  if(!paintBytes){
    let seed=1729
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
    const noise=Array.from({length:18*18},random)
    const value=(x:number,y:number)=>noise[(x%18)+18*(y%18)]
    paintBytes=new Uint8Array(n*n*4)
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
      const u=i/n*18,v=j/n*18,x=Math.floor(u),y=Math.floor(v),f=u-x,g=v-y
      const mottling=(value(x,y)*(1-f)+value(x+1,y)*f)*(1-g)+(value(x,y+1)*(1-f)+value(x+1,y+1)*f)*g
      const streaks=Math.exp(-Math.pow((i-71)/2.3,2))*Math.max(0,1-Math.abs(j-74)/50)
          +Math.exp(-Math.pow((i-133)/1.6,2))*Math.max(0,1-Math.abs(j-94)/37)
      const a=224+16*mottling+random()*8-17*streaks
      const p=(j*n+i)*4
      paintBytes[p]=a+1;paintBytes[p+1]=a+1;paintBytes[p+2]=a;paintBytes[p+3]=255
    }
  }
  const m=new T.DataTexture(paintBytes,n,n,T.RGBAFormat)
  m.wrapS=m.wrapT=T.RepeatWrapping;m.generateMipmaps=true
  m.minFilter=T.LinearMipmapLinearFilter;m.magFilter=T.LinearFilter;m.needsUpdate=true
  return m
}
function color(v: string) {
  let c = rgb.get(v)
  if (!c) { c = new T.Color(v); rgb.set(v, c) }
  return c
}
export class Yard {
  private xyz:number[]=[]
  private rgb:number[]=[]
  private normals:number[]=[]
  private uv:number[]=[]
  face(pts:P[], shade:string, out:P, tint=1) {
    if(pts.length<3)return
    const a=pts[0], b=pts[1], d=pts[2]
    let nx=(b[1]-a[1])*(d[2]-a[2])-(b[2]-a[2])*(d[1]-a[1])
    let ny=(b[2]-a[2])*(d[0]-a[0])-(b[0]-a[0])*(d[2]-a[2])
    let nz=(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0])
    const n=Math.hypot(nx,ny,nz)
    if(n<1e-9)return
    const flip=nx*out[0]+ny*out[1]+nz*out[2]<0
    const inv=(flip?-1:1)/n
    nx*=inv;ny*=inv;nz*=inv
    const mat=color(shade)
    // Baked maritime daylight for readability on the dark hemisphere. The sun
    // is oblique, not a white rim around an otherwise unmodelled silhouette.
    const light=(.55+.62*Math.max(0,ny*.73+nz*.30-nx*.58)+.12*ny)*tint
    for(let j=1;j<pts.length-1;j++) {
      for(const p of flip?[a,pts[j+1],pts[j]]:[a,pts[j],pts[j+1]]) {
        this.xyz.push(...p);this.normals.push(nx,ny,nz)
        this.rgb.push(mat.r*light,mat.g*light,mat.b*light)
        this.uv.push((Math.abs(nx)>.75?p[2]:p[0])*.093,(ny>.73?p[2]:p[1])*.14)
      }
    }
  }
  private oct(x:number,z:number,len:number,w:number,cut:number):XZ[] {
    const a=len/2,b=w/2,c=Math.min(b*.85,a*.8,cut)
    return [[x+a,z-b+c],[x+a,z+b-c],[x+a-c,z+b],[x-a+c,z+b],[x-a,z+b-c],[x-a,z-b+c],[x-a+c,z-b],[x+a-c,z-b]]
  }
  // Chamfered, battered deckhouses rather than rectangular boxes.
  house(x:number,y:number,z:number,len:number,w:number,h:number,wall=C.steel,roof=C.grey,taper=.86,dx=0,cut=.65) {
    const a=this.oct(x,z,len,w,cut), b=this.oct(x+dx,z,len*taper,w*taper,cut*taper)
    const base=a.map(([u,v]):P=>[u,y,v]), top=b.map(([u,v]):P=>[u,y+h,v])
    for(let i=0;i<8;i++){const j=(i+1)%8
      this.face([base[i],base[j],top[j],top[i]],wall,[(a[i][0]+a[j][0])/2-x,0,(a[i][1]+a[j][1])/2-z])}
    this.face(top,roof,[0,1,0])
    this.face(base,wall,[0,-1,0],.78)
  }
  rod(a:P,b:P,r:number,shade=C.grey,r2=r,n=6) {
    const d=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize()
    const u=new T.Vector3().crossVectors(d, Math.abs(d.y)>.88 ? new T.Vector3(1,0,0) : new T.Vector3(0,1,0)).normalize()
    const v=new T.Vector3().crossVectors(d,u).normalize()
    const ring=(p:P,radius:number,i:number):P=>{const t=i/n*Math.PI*2, co=Math.cos(t)*radius,si=Math.sin(t)*radius
      return [p[0]+u.x*co+v.x*si,p[1]+u.y*co+v.y*si,p[2]+u.z*co+v.z*si]}
    const top:P[]=[]
    for(let i=0;i<n;i++){const p=ring(a,r,i),q=ring(a,r,i+1), t=ring(b,r2,i);top.push(t)
      this.face([p,q,ring(b,r2,i+1),t],shade,[p[0]+q[0]-2*a[0],p[1]+q[1]-2*a[1],p[2]+q[2]-2*a[2]])}
    this.face(top,shade,[d.x,d.y,d.z]);this.face(Array.from({length:n},(_,i)=>ring(a,r,i)),shade,[-d.x,-d.y,-d.z])
  }
  ball(x:number,y:number,z:number,rx:number,ry:number,rz:number,shade:string) {
    const p=(i:number,j:number):P=>{const a=i/16*Math.PI*2,b=j/8*Math.PI-Math.PI/2
      return [x+rx*Math.cos(a)*Math.cos(b),y+ry*Math.sin(b),z+rz*Math.sin(a)*Math.cos(b)]}
    for(let i=0;i<16;i++)for(let j=0;j<8;j++) {
      const a=p(i,j),b=p(i+1,j),c=p(i+1,j+1),d=p(i,j+1)
      this.face(j===0?[a,c,d]:j===7?[a,b,c]:[a,b,c,d],shade,[a[0]+c[0]-2*x,a[1]+c[1]-2*y,a[2]+c[2]-2*z])
    }
  }
  // Slender, flared bow. Waterline tapers independently of the gunwale and
  // the stem rakes forward above the water; a deck slab alone misses both.
  hull(width:number, height:number, aft:number, isBox:boolean, deck=C.deck) {
    const h=height,w=width*.5
    const profile:Ring[]=isBox?[
      [-50,w*.72,aft,.84],[-48,w*.92,aft,.90],[-38,w,aft,.91],[-27,w,h,.91],[-8,w,h,.92],[14,w*.99,h,.92],
      [29,w*.94,h,.88],[38,w*.81,h+.18,.81],[44,w*.58,h+.47,.72],[48,w*.28,h+.70,.44],[50,.07,h+.83,.28],
    ]:[[-50,w*.66,aft,.77],[-47,w*.82,aft,.86],[-39,w*.95,aft,.89],[-30,w*.99,aft,.91],[-19,w,h,.92],[-3,w,h,.93],[13,w*.98,h+.10,.89],
      [25,w*.87,h+.39,.84],[35,w*.67,h+.79,.73],[42,w*.42,h+1.17,.68],[47,w*.18,h+1.46,.55],[50,.05,h+1.63,.48]]
    const rows:Ring[]=[profile[0]]
    // Monotone tangent-limited Hermite interpolation preserves the raked stem
    // while rounding the visible change of station along the forward shoulder.
    const tangent=(i:number,v:number)=>{
      if(i===0)return (profile[1][v]-profile[0][v])/(profile[1][0]-profile[0][0])
      if(i===profile.length-1)return (profile[i][v]-profile[i-1][v])/(profile[i][0]-profile[i-1][0])
      const a=(profile[i][v]-profile[i-1][v])/(profile[i][0]-profile[i-1][0])
      const b=(profile[i+1][v]-profile[i][v])/(profile[i+1][0]-profile[i][0])
      return a*b>0?2*a*b/(a+b):0
    }
    for(let j=1;j<profile.length;j++){
      const a=profile[j-1],b=profile[j],len=b[0]-a[0],steps=Math.max(1,Math.ceil(len/2.4))
      for(let k=1;k<=steps;k++){
        const u=k/steps,v=u*u,h=v*u, row:Ring=[a[0]+u*len,0,0,0]
        for(let e=1;e<4;e++)row[e]=(2*h-3*v+1)*a[e]+(h-2*v+u)*len*tangent(j-1,e)+(-2*h+3*v)*b[e]+(h-v)*len*tangent(j,e)
        rows.push(row)
      }
    }
    const point=(r:Ring, s:number,level:number):P=>{
      const [x,b,y,wl]=r,f=Math.max(0,(x-15)/35),tail=Math.max(0,(-x-38)/12)
      const yy=level===0?-.46:level===1?.22:level===2?y*.57:y
      const k=(yy+.46)/(y+.46),ww=level===0?wl*.95:level===1?wl:level===2?(wl*.29+.71):1
      return [x-Math.pow(f,2)*2.9*(1-k)+tail*.47*(1-k),yy,s*b*ww]
    }
    for(let i=1;i<rows.length;i++){
      for(const s of [-1,1])for(let j=0;j<3;j++){
        const a=point(rows[i-1],s,j),b=point(rows[i],s,j)
        this.face([a,b,point(rows[i],s,j+1),point(rows[i-1],s,j+1)],j===0?C.boot:j===1?'#9aabb4':'#a2b1b7',[0,0,s],.98+.013*Math.sin(rows[i][0]*.17))
      }
      this.face([point(rows[i-1],-1,3),point(rows[i],-1,3),point(rows[i],1,3),point(rows[i-1],1,3)],deck,[0,1,0])
    }
    for(const i of [0,rows.length-1]){
      const row=rows[i]
      this.face([point(row,-1,0),point(row,1,0),point(row,1,3),point(row,-1,3)],C.side,[i===0?-1:1,0,0])
    }
    // Edge stanchions follow the actual sheer line, not a hovering plane.
    for(let i=1;i<rows.length;i++) {
      const steps=Math.max(1,Math.round((rows[i][0]-rows[i-1][0])/3))
      for(const s of [-1,1]){
        const a=point(rows[i-1],s,3),b=point(rows[i],s,3)
        const at=(t:number,dy:number):P=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+dy,(a[2]+(b[2]-a[2])*t)*.992]
        this.rod(at(0,.35),at(1,.35),.059,C.pale,.059,4)
        for(let j=0;j<steps;j++)this.rod(at(j/steps,0),at(j/steps,.37),.042,C.pale,.031,4)
      }
    }
  }
  bridge(x:number,y:number,z:number,l:number,w:number){
    this.house(x,y,z,l*.95,w*.95,.43,C.side,C.grey)
    this.house(x,y+.38,z,l,w,.95,C.steel,C.pale,1.02)
    // Glazing around front and quarter faces: separate apertures, not a
    // black stripe painted uninterrupted around every deck.
    for(let i=0;i<7;i++){
      const ww=(w-1.45)/7,start=z-(w-1.45)/2
      this.face([[x+l*.512,y+.65,start+i*ww],[x+l*.512,y+.65,start+(i+.81)*ww],[x+l*.512,y+1.1,start+(i+.84)*ww],[x+l*.512,y+1.1,start+i*ww]],C.glass,[1,0,0])
    }
    for(const s of [-1,1])for(let i=0;i<5;i++){
      const u=x-l*.30+i*l*.13, v=z+s*w*.508
      this.face([[u,y+.65,v],[u+l*.105,y+.65,v],[u+l*.105,y+1.1,v],[u,y+1.1,v]],i===2?'#526979':C.glass,[0,0,s])
    }
    this.house(x,y+1.31,z,l*1.07,w*1.07,.19,C.pale,C.grey,.99)
  }
  funnel(x:number,y:number,z:number,l:number,w:number,h:number,sweep=.7){
    this.house(x,y,z,l,w,h,C.steel,C.grey,.79,-sweep)
    this.house(x-sweep,y+h-.06,z,l*.81,w*.82,.32,C.dark,C.boot,.99)
    for(const s of [-1,1]) this.house(x-sweep,y+h+.25,z+s*w*.18,l*.52,w*.22,.16,C.dark,'#303d44')
  }
  rig(x:number,y:number,z:number,h:number,w:number,open=true){
    if(open){
      for(const s of [-1,1]) for(const a of [-1,1]){
        this.rod([x+a*w*.42,y,z+s*w*.55],[x-.60+a*.18,y+h*.79,z+s*.23],.105,C.grey,.065)
        this.rod([x+a*w*.31,y+h*.24,z+s*w*.41],[x-.43-a*w*.16,y+h*.55,z+s*w*.24],.065,C.grey)
      }
    } else this.house(x,y,z,w,w,h*.77,C.steel,C.grey,.32,-.55,w*.23)
    this.rod([x-.52,y+h*.76,z],[x-.52,y+h,z],.12,C.dark,.045)
    for(const [level,span] of [[.61,1],[.82,.62]]) {
      this.rod([x-.45,y+h*level,z-w*span],[x-.45,y+h*level,z+w*span],.095,C.grey,.095)
      this.rod([x-.35,y+h*(level-.15),z],[x-.45,y+h*level,z+w*span],.063,C.grey)
      this.rod([x-.35,y+h*(level-.15),z],[x-.45,y+h*level,z-w*span],.063,C.grey)
    }
  }
  mark(x:number,y:number,z:number,r:number) {
    for(let i=0;i<40;i++){
      const p=(j:number,k:number):P=>[x+Math.cos(j*Math.PI/20)*k,y,z+Math.sin(j*Math.PI/20)*k]
      this.face([p(i,r),p(i+1,r),p(i+1,r-.22),p(i,r-.22)],C.ink,[0,1,0])
    }
    this.flatLine(x-.77,y,z-.65,x+.77,z-.65,.16)
    this.flatLine(x-.77,y,z+.65,x+.77,z+.65,.16)
    this.flatLine(x,y,z-.65,x,z+.65,.17)
  }
  flatLine(x:number,y:number,z:number,u:number,v:number,w:number,c=C.ink) {
    const d=Math.hypot(u-x,v-z)||1, dx=(v-z)/d*w*.5,dz=(x-u)/d*w*.5
    this.face([[x+dx,y,z+dz],[u+dx,y,v+dz],[u-dx,y,v-dz],[x-dx,y,z-dz]],c,[0,1,0])
  }
  raft(x:number,y:number,z:number) {
    this.rod([x-.59,y,z],[x+.59,y,z],.29,C.pale,.29,8)
    for(const o of [-.38,.38])this.rod([x+o-.06,y,z],[x+o+.06,y,z],.31,C.dark,.31,8)
  }
  finish(id:string,length:number) {
    const g=new T.BufferGeometry()
    g.setAttribute('position',new T.Float32BufferAttribute(this.xyz,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.normals,3))
    g.setAttribute('color',new T.Float32BufferAttribute(this.rgb,3));g.scale(length/100,length/100,length/100);g.computeBoundingSphere()
    g.setAttribute('uv',new T.Float32BufferAttribute(this.uv,2))
    const mesh=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,toneMapped:false,map:hullPaint()}))
    const group=new T.Group();group.name='Surface atlas / '+id;mesh.name=id+' / sculpted exterior';group.add(mesh)
    return group
  }
}
