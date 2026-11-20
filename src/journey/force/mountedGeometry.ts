import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

type Point = [number, number, number]
type Section = [number, number, number, number, number] // axis, centre in first plane, centre in second plane, radii
type Pose = (x: number, y: number, z: number) => [number, number, number, number]
const fixed: Pose = () => [0, 0, 0, 0]
const vec = (p: Point) => new THREE.Vector3(...p)
const up = new THREE.Vector3(0, 1, 0)
const clay = '#b48a68', dark = '#302622', bronze = '#aa895c', darkIron = '#4b4540'
const leather = '#77523d', chestnut = '#957052', soot = '#382c25'

/** One indexed geometry/material per repeated object. Colour is in linear space;
 * the extra weights are a tiny pose rig for hooves, manes and the signal cloth. */
class Painted {
  parts: THREE.BufferGeometry[] = []
  add(g: THREE.BufferGeometry, hex: string, pose: Pose = fixed) {
    if (g.attributes.uv) g.deleteAttribute('uv')
    const pos = g.getAttribute('position'), col = new THREE.Color(hex)
    const c = new Float32Array(pos.count * 3), w = new Float32Array(pos.count * 4)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      const amt = .88 + Math.min(1, Math.max(0, y / 1.9)) * .12 + .016 * Math.sin(4*x+4*z)
      c.set([col.r * amt, col.g * amt, col.b * amt], i * 3)
      w.set(pose(x,y,z), i * 4)
    }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3))
    g.setAttribute('poseWeights', new THREE.BufferAttribute(w, 4))
    this.parts.push(g)
  }
  oval(at: Point, radii: Point, color: string, pose = fixed, roll = 0) {
    const g = new THREE.SphereGeometry(1, 10, 7)
    g.scale(...radii); g.rotateX(roll); g.translate(...at); this.add(g,color,pose)
  }
  bar(a: Point,b: Point,ra: number, rb: number,color: string, pose = fixed, seg = 7) {
    const aa=vec(a), bb=vec(b), delta=bb.clone().sub(aa)
    const g=new THREE.CylinderGeometry(rb,ra,delta.length(),seg)
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up,delta.normalize()))
    aa.lerp(bb,.5); g.translate(aa.x,aa.y,aa.z); this.add(g,color,pose)
  }
  link(path: Point[], r:number,color:string,pose=fixed) {
    for(let k=1;k<path.length;k++)this.bar(path[k-1],path[k],r,r,color,pose,5)
  }
  box(at:Point,sz:Point,color:string,rx=0,ry=0) {
    const g=new THREE.BoxGeometry(...sz);g.rotateX(rx);g.rotateY(ry);g.translate(...at);this.add(g,color)
  }
  loft(sections: Section[], alongZ:boolean, color:string, pose = fixed, sides=12) {
    const v:number[]=[],idx:number[]=[]
    for(let j=0;j<sections.length;j++){
      const [axis,c1,c2,r1,r2]=sections[j]
      for(let i=0;i<sides;i++){
        const a=i*2*Math.PI/sides
        const aa=c1+r1*Math.cos(a), bb=c2+r2*Math.sin(a)
        if(alongZ)v.push(aa,bb,axis);else v.push(aa,axis,bb)
        if(j) {
          const k=(j-1)*sides+i, l=(j-1)*sides+(i+1)%sides
          if(alongZ) idx.push(k,l,k+sides,l,l+sides,k+sides)
          else idx.push(k,k+sides,l,l,k+sides,l+sides)
        }
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();this.add(g,color,pose)
  }
  finish() {
    const geo=mergeGeometries(this.parts,false)
    for(const part of this.parts)part.dispose()
    if(!geo)throw Error('Could not join horse/cart geometry')
    geo.computeBoundingSphere()
    return geo
  }
}

export function buildCourser() {
  const p=new Painted()
  // The shoulder, narrow flank and croup have different sections, not a scaled sphere.
  p.loft([[-.99,0,1.17,.045,.09],[-.86,0,1.17,.22,.33],[-.60,0,1.17,.31,.405],[-.30,0,1.14,.295,.36],[0,0,1.13,.31,.35],[.34,0,1.16,.34,.395],[.54,0,1.2,.30,.405],[.68,0,1.29,.21,.28],[.72,0,1.32,.08,.10]],true,chestnut)
  // Upward crest, cheek to tapered muzzle. Small, turned ears preserve the silhouette.
  const head:Pose=(_x,y)=>[0,0,0,Math.min(1,Math.max(0,(y-1.35)/.55))]
  p.loft([[1.24,0,.45,.265,.35],[1.43,0,.57,.24,.33],[1.61,0,.70,.19,.28],[1.78,0,.81,.155,.245],[1.94,0,.90,.12,.17],[1.99,0,.92,.08,.10]],false,chestnut,head)
  p.loft([[.86,0,1.89,.105,.145],[1.01,0,1.90,.153,.177],[1.15,0,1.855,.15,.145],[1.29,0,1.76,.12,.122],[1.43,0,1.69,.105,.084],[1.48,0,1.685,.068,.069]],true,'#926b50',head)
  p.oval([0,1.675,1.43],[.107,.075,.09],'#715949',head)
  for(const s of [-1,1]){
    p.loft([[1.96,s*.083,.95,.055,.077],[2.08,s*.105,.935,.047,.053],[2.20,s*.14,.925,.008,.009]],false,'#71513c',head,8)
    p.oval([s*.145,1.919,1.087],[.018,.026,.039],'#251f1f',head)
    p.oval([s*.160,1.924,1.101],[.004,.008,.008],'#e7d4aa',head)
    p.oval([s*.095,1.709,1.431],[.015,.017,.026],'#322b27',head)
    p.link([[s*.10,1.99,.92],[s*.154,1.865,1.068],[s*.117,1.699,1.39]],.017,'#49382b',head)
    p.bar([s*.12,1.698,1.39],[s*.04,1.76,1.405],.018,.017,bronze,head)
  }
  // Narrow coarse mane on the neck, tail separate from the rump and tapering.
  p.loft([[1.47,0,.37,.072,.19],[1.62,0,.46,.067,.18],[1.77,0,.59,.062,.15],[1.92,0,.75,.052,.14],[2.015,0,.89,.045,.11],[2.04,0,.98,.02,.036]],false,soot,head,9)
  p.loft([[.44,.04,-1.17,.05,.053],[.56,.06,-1.18,.095,.105],[.80,.049,-1.11,.108,.10],[1.05,.024,-1.02,.091,.09],[1.27,0,-.92,.085,.083],[1.39,0,-.84,.073,.08]],false,soot,(_x,y)=>[0,0,0,-Math.max(0,1.28-y)],9)
  for(const side of [-1,1])for(const front of [false,true]){
    const z=front?.445:-.63
    const x=side*.185
    const phase=(front ? 0 : Math.PI/2)+(side<0?Math.PI:0)
    const gait:Pose=(_x,y)=>[Math.pow(Math.max(0,1-y/1.14),1.3),1,phase,0]
    const marks=front?[[0,.034,.075,.095],[.05,.034,.078,.10],[.135,.006,.051,.06],[.235,-.035,.05,.062],[.52,.025,.06,.074],[.72,-.025,.079,.10],[.94,-.045,.103,.14],[1.18,0,.13,.15]]:[[0,.083,.081,.098],[.05,.083,.081,.10],[.13,.060,.048,.061],[.255,.005,.048,.055],[.48,-.112,.057,.071],[.57,-.135,.074,.085],[.78,.001,.087,.113],[.91,.086,.105,.128],[1.15,0,.141,.17]]
    p.loft(marks.slice(2).map(([y,o,rx,rz])=>[y,x,z+o,rx,rz]),false,chestnut,gait,9)
    p.loft(marks.slice(0,4).map(([y,o,rx,rz])=>[y,x,z+o,rx,rz]),false,'#4f4438',gait,9)
  }
  return p.finish()
}

function person(p:Painted,x:number,y:number,z:number, mounted:boolean, cloth:string,cap:boolean){
  const o=(a:number,b:number,c:number):Point=>[x+a,y+b,z+c]
  const section=(h:number,zc:number,ax:number,az:number):Section=>[y+h,x,z+zc,ax,az]
  if(mounted){
    for(const s of [-1,1]){
      p.bar(o(s*.106,.85,-.015),o(s*.32,.61,.19),.104,.073,'#6c5b4c')
      p.bar(o(s*.32,.61,.19),o(s*.32,.30,.06),.075,.055,'#615345')
      p.oval(o(s*.32,.28,.098),[.065,.064,.12],dark)
    }
  } else {
    for(const s of [-1,1]){
      p.bar(o(s*.108,.82,0),o(s*.13,.37,.023*s),.103,.078,cloth)
      p.bar(o(s*.13,.37,.023*s),o(s*.13,.09,.049*s),.077,.057,'#746754')
      p.oval(o(s*.13,.063,.05+.049*s),[.075,.064,.136],dark)
    }
  }
  p.loft([section(.77,0,.212,.139),section(.87,0,.22,.15),section(1.04,0,.164,.125),section(1.34,.014,.224,.143),section(1.41,.018,.154,.10)],false,cloth)
  // Four interleaved horizontal rows of worn lacquer lamellae.
  for(let j=0;j<4;j++){
    const k=1.02+j*.077,w=.185+j*.009
    p.loft([section(k,.019,w+.012,.145),section(k+.017,.015,w+.008,.148),section(k+.071,.015,w,.143)],false,j%2?'#565149':'#484743',fixed,10)
  }
  p.loft([section(.94,.007,.197,.15),section(.975,.007,.191,.144)],false,'#45362a')
  p.oval(o(0,1.495,.036),[.08,.10,.08],clay)
  p.loft([section(1.465,.044,.064,.084),section(1.50,.043,.103,.098),section(1.60,.035,.119,.116),section(1.70,.032,.115,.107),section(1.735,.019,.067,.073)],false,clay)
  p.oval(o(0,1.59,.143),[.031,.043,.040],clay)
  for(const s of [-1,1]){
    p.bar(o(s*.195,1.327,.007),o(s*.234,1.136,.06),.080,.064,cloth)
    p.bar(o(s*.234,1.136,.06),o(s*.168,1.127,.297),.061,.043,cloth)
    p.oval(o(s*.167,1.128,.32),[.045,.045,.059],clay)
    p.bar(o(s*.036,1.63,.14),o(s*.083,1.632,.126),.009,.012,dark)
  }
  p.loft([section(1.64,.001,.128,.135),section(1.68,0,.137,.132),section(1.735,-.01,.115,.103),section(1.765,-.012,.065,.063)],false,cap?darkIron:'#3b3229')
  p.oval(o(0,1.78,-.049),[.052,.057,.049],dark)
}

export function buildRider(side:number){
  const p=new Painted()
  const c=side<0?'#904a38':'#556e75'
  // Riding cloth and girth, no stirrups.
  p.oval([0,1.425,-.07],[.345,.13,.36],c)
  for(const s of [-1,1]){
    p.link([[s*.158,1.51,.13],[s*.31,1.33,.15],[s*.317,1.10,.16],[s*.25,.915,.17]],.033,'#685640')
    p.link([[s*.116,1.69,1.397],[s*.16,1.63,1.02],[s*.20,1.67,.66],[s*.167,1.77,.275]],.010,'#564534')
  }
  person(p,0,.655,-.045,true,c,true)
  return p.finish()
}

export function buildWheel(){
  const p=new Painted()
  const rim=(R:number,r:number,hex:string)=>{
    const g=new THREE.TorusGeometry(R,r,7,36);g.rotateY(Math.PI/2);p.add(g,hex)
  }
  rim(.655,.041,'#846348');rim(.675,.020,'#524738')
  for(let i=0;i<18;i++){
    const ang=i*Math.PI/9, yy=Math.sin(ang),zz=Math.cos(ang)
    p.bar([0,.074*yy,.074*zz],[0,.641*yy,.641*zz],.023,.015,'#ac8860',fixed,6)
  }
  p.bar([-.18,0,0],[.18,0,0],.105,.105,'#836446',fixed,12)
  p.bar([-.19,0,0],[-.15,0,0],.093,.093,bronze)
  p.bar([.15,0,0],[.19,0,0],.093,.093,bronze)
  return p.finish()
}

export function buildChariot(side:number){
  const p=new Painted(), c=side<0?'#924831':'#536d71'
  p.bar([-1.02,.696,0],[1.02,.696,0],.085,.085,'#6e5037',fixed,10)
  p.box([0,.794,-.02],[1.74,.16,1.30],leather)
  for(let i=0;i<10;i++)p.box([-.765+i*.17,.889,-.02],[.157,.035,1.25],i%2?'#977451':'#876545')
  for(const s of [-1,1]){
    p.box([s*.817,1.034,0],[.064,.28,1.28],c)
    for(const z of [-.61,-.22,.20,.61])p.bar([s*.816,.90,z],[s*.816,1.54,z],.033,.026,leather)
    p.link([[s*.816,1.42,-.65],[s*.816,1.49,-.13],[s*.816,1.56,.63]],.039,'#ae895c')
    p.box([s*.816,1.158,0],[.07,.043,1.3],bronze)
    p.bar([s*.52,.81,-.52],[s*.14,1.11,2.18],.052,.046,'#927552')
  }
  p.box([0,1.045,.604],[1.67,.29,.092],c)
  p.bar([-.826,1.53,.612],[.826,1.53,.612],.039,.039,leather)
  for(let i=0;i<10;i++)p.bar([-.76+i*.166,1.15,.607],[-.76+i*.166,1.52,.607],.015,.014,bronze,fixed,5)
  p.bar([0,1.03,1.64],[0,1.41,2.64],.061,.056,'#9a7956')
  p.bar([-.93,1.42,2.61],[.93,1.42,2.61],.041,.041,leather)
  for(const s of [-1,1]){
    p.link([[s*.395,2.02,.35],[s*.54,1.81,1.25],[s*.65,1.68,2.42],[s*.66,1.69,3.35]],.014,'#5f4a32')
    p.link([[s*.69,.97,.59],[s*.82,1.00,1.21],[s*.87,1.17,2.42]],.019,'#584937')
  }
  person(p,-.34,.895,.11,false,c,false);person(p,.34,.895,-.19,false,c,true)
  // Small coloured pennant reads differently from the tall infantry standards.
  p.bar([.74,.82,-.54],[.74,3.40,-.54],.024,.018,leather)
  const verts=[.74,3.37,-.54,.695,3.30,-.81,.62,3.30,-1.18,.74,2.97,-.54,.69,2.99,-.82,.64,3.06,-1.14]
  const tri=new THREE.BufferGeometry();tri.setAttribute('position',new THREE.Float32BufferAttribute(verts,3))
  tri.setIndex([0,1,3,3,1,4,1,2,4,4,2,5,3,1,0,4,1,3,4,2,1,5,2,4]);tri.computeVertexNormals()
  p.add(tri,c,(_x,_y,z)=>[-1,Math.max(0,-.54-z),0,0])
  return p.finish()
}

