import { C, Yard, type P } from './surfaceBuilder'

export type SurfaceModelId = 'type055'|'type075'|'type071'|'sejong'|'udaloy'|'hobart'|'collins'|'anzac'
const lengths:Record<SurfaceModelId,number>={type055:.059,type075:.079,type071:.070,sejong:.054,udaloy:.054,hobart:.049,collins:.027,anzac:.039}

// Silhouettes are original, unnumbered class illustrations, not engineering
// models or depictions of a particular vessel on a particular day. References:
// 055: https://eng.chinamil.com.cn/BILINGUAL/Photos_209204/16352325_2.html
// 071 & 075 together: https://eng.chinamil.com.cn/MEDIA/PhotosChina/16277487.html
// Sejong: https://www.dvidshub.net/image/1821867/foal-eagle-2015
// Udaloy: US Navy archival photograph DN-SN-90-01698 (1989), reproduced at
// https://commons.wikimedia.org/wiki/File:AdmiralVinogradov1989.jpg
// Hobart: https://www.navy.gov.au/capabilities/ships-boats-and-submarines/hmas-hobart-iii
// Collins: https://www.navy.gov.au/capabilities/ships-boats-and-submarines/hmas-collins
// Anzac: https://seapower.navy.gov.au/sites/default/files/2025-02/Anzac%20III.pdf
function deckFurniture(s:Yard, halfBeam:number,h:number) {
  // Anchor hawse recesses and short pairs of bollards are scale references.
  for(const side of [-1,1]){
    s.ball(42,h+.45,side*halfBeam*.396,.75,.32,.12,'#4c606a')
    for(const x of [35.5,36.38,-45.5,-44.62]){
      const z=side*halfBeam*(x>0?.47:.59),y=x>0?h+.91:h-.04
      s.rod([x,y,z],[x,y+.41,z],.155,C.dark,.18)
    }
  }
}
function flatPad(s:Yard,x:number,y:number,span:number,width:number,r:number,red=false) {
  const p = red ? '#9a796a' : '#657982'
  s.house(x,y-.09,0,span,width,.16,p,p,1,0,1.25)
  s.mark(x,y+.102,0,r)
  for(const k of [-1,1]){
    const z=k*width*.42
    s.flatLine(x-span*.41,y+.10,z,x+span*.41,z,.135)
    s.flatLine(x-span*.15,y+.10,k*r,x+span*.21,k*r,.11)
  }
}
function shutter(s:Yard,x:number,y:number,z:number,width:number,height:number) {
  // Stern-facing garage facade with inset folding-door grooves.
  s.house(x+.10,y-.08,z,.52,width+.42,height+.35,C.pale,C.steel,.99,0,.03)
  const p=(u:number,v:number):P=>[x-.19,y+v,z+u]
  s.face([p(-width/2,0),p(width/2,0),p(width/2,height),p(-width/2,height)],'#617580',[-1,0,0])
  for(let yy=.24;yy<height;yy+=.38)
    s.face([p(-width*.46,yy),p(width*.46,yy),p(width*.46,yy+.07),p(-width*.46,yy+.07)].map(([a,b,c]):P=>[a-.04,b,c]),'#a4b0b0',[-1,0,0])
}
function promenade(s:Yard,x0:number,x1:number,y:number,z:number,spacing=2) {
  s.rod([x0,y+.49,z],[x1,y+.49,z],.042,C.pale,.042,4)
  for(let x=x0;x<x1;x+=spacing)s.rod([x,y,z],[x,y+.5,z],.047,C.pale,.043,4)
}
function tender(s:Yard,x:number,y:number,z:number,side:number) {
  s.ball(x,y,z,1.85,.37,.60,C.rubber);s.ball(x-.1,y+.26,z,1.25,.24,.38,'#a4a7a0')
  s.house(x+.35,y+.34,z,.55,.53,.40,C.steel,C.grey)
  for(const u of [x-1.05,x+1.05])s.rod([u,y-.16,z-side*.55],[u-.25,y+1.02,z],.09,C.pale)
}
function ventBank(s:Yard,x:number,y:number,z:number,len:number,side:number) {
  const p=(dx:number,dy:number,dz=0):P=>[x+dx,y+dy,z+side*dz]
  s.face([p(-len*.5,0),p(len*.5,0),p(len*.5,1.02),p(-len*.5,1.02)],C.dark,[0,0,side])
  for(const v of [.19,.48,.78])
    s.face([p(-len*.48,v,.035),p(len*.48,v,.035),p(len*.48,v+.088,.035),p(-len*.48,v+.088,.035)],C.grey,[0,0,side])
}
// Hatches and flush facets belong to a sloped exterior plane, not a floating
// vertical sign. The outline is a narrow rim and the middle a separate face.
function fitting(s:Yard,x:number,y:number,z:number,w:number,h:number,k:number,
  slope:number,fill:string,bevel=false){
  const panel=(f:number,d:number,c:string)=>{
    const a=w*f*.5,b=h*f*.5,e=bevel?Math.min(a,b)*.40:.065
    const outline=[[-a+e,-b],[a-e,-b],[a,-b+e],[a,b-e],[a-e,b],[-a+e,b],[-a,b-e],[-a,-b+e]]
    s.face(outline.map(([u,v]):P=>[x+u,y+v,k*(z-v*slope+d)]),c,[0,slope,k])
  }
  panel(1,0,C.dark);panel(.90,.045,fill)
}
function serviceDeck(s:Yard,x:number,y:number,w:number,l:number,k:number) {
  s.house(x,y,k*w,l,.92,.22,C.side,C.grey,1,0,.16)
  promenade(s,x-l*.46,x+l*.46,y+.22,k*(w+.42),1.12)
  for(const dx of [-l*.32,l*.32]) {
    s.rod([x+dx,y-.68,k*(w-.47)],[x+dx,y+.07,k*(w+.33)],.105,C.side,.08)
  }
}
function helo(s:Yard,x:number,y:number,z:number) {
  // Generic parked deck transport helicopter for scale, not a particular
  // squadron: glazed cabin, stowed blades, tail fin and three wheel contacts.
  for(const k of [-1,1]){
    s.rod([x-.28,y+.52,z+k*.44],[x-.30,y+.19,z+k*.72],.075,C.side)
    s.ball(x-.30,y+.17,z+k*.72,.19,.19,.107,C.rubber)
  }
  s.ball(x+.93,y+.21,z,.16,.18,.104,C.rubber)
  s.ball(x,y+.89,z,1.69,.73,.65,'#a7afb1')
  s.ball(x+1.04,y+1.06,z,.73,.40,.602,'#475f6b')
  s.house(x+.34,y+.80,z,1.07,1.29,.65,'#778990',C.grey,.87,0,.11)
  s.rod([x-.93,y+1.04,z],[x-3.23,y+1.38,z],.43,C.grey,.12,8)
  s.face([[x-3.37,y+1.23,z],[x-3.64,y+2.29,z],[x-3.28,y+2.21,z],[x-2.91,y+1.37,z]],C.side,[0,0,1])
  s.face([[x-3.37,y+1.23,z],[x-3.64,y+2.29,z],[x-3.28,y+2.21,z],[x-2.91,y+1.37,z]],C.side,[0,0,-1])
  s.rod([x-.20,y+1.55,z],[x-.20,y+1.94,z],.095,C.dark)
  for(const k of [-1,1]){
    s.flatLine(x-.18,y+1.94,z+k*.02,x-3.11,z+k*.47,.11,C.dark)
    s.flatLine(x-.12,y+1.96,z+k*.09,x-2.71,z+k*.73,.095,C.dark)
  }
}
function forecastle(s:Yard,h:number,x:number,old=false) {
  // Just the fixed, visible outline on the foredeck; no operational detail.
  s.rod([x,h+.25,0],[x,h+.70,0],1.45,C.dark,1.39)
  if(old)s.ball(x,h+1.03,0,1.58,1.23,1.4,C.steel)
  else s.house(x,h+.47,0,3.1,2.9,1.73,C.steel,C.grey,.6,-.25,.75)
  s.rod([x+.81,h+1.59,0],[x+4.54,h+1.83,0],.25,C.side,.14)
}
function aftHangar(s:Yard,x:number,h:number,l:number,w:number,height:number,twin=false) {
  s.house(x,h,0,l,w,height,C.steel,C.grey,.94,0,1)
  const stern=x-l*.5+.10
  if(twin)for(const z of [-w*.22,w*.22])shutter(s,stern,h+.03,z,w*.37,height*.80)
  else shutter(s,stern,h+.04,0,w*.67,height*.81)
  for(const side of [-1,1]) {
    for(let j=0;j<3;j++)s.raft(x+l*.18+j*1.28,h+height+.34,side*w*.37)
    s.house(x+l*.18,h+height+.09,side*w*.38,l*.53,.92,.14,C.pale,C.dark,1)
  }
}
function mastFittings(s:Yard,x:number,h:number,z:number,span:number) {
  s.rod([x,h,z-span],[x,h,z+span],.105,C.dark)
  s.rod([x-.15,h,z],[x-.15,h+1.9,z],.10,C.side,.045)
  for(const k of [-1,1])s.rod([x,h,z+k*span*.88],[x-.19,h+1.15,z+k*span*.88],.055,C.pale,.032,5)
}
function type055(s:Yard){
  const h=3.65,back=3.22
  s.hull(12.45,h,back,false);deckFurniture(s,6.22,h)
  s.house(4.3,h-.28,0,39,10.75,3.05,C.steel,C.grey,.89,-.40)
  s.house(11,6.39,0,20.3,9.10,3.04,C.steel,C.pale,.73,-.92,1.60)
  s.bridge(12.45,9.15,0,7.25,7.2)
  s.house(8.0,9.34,0,8,5.8,4.73,C.steel,C.grey,.63,-.40,1.0)
  s.house(7.65,13.97,0,4.63,3.57,2.63,C.side,C.steel,.65,-.28)
  s.house(7.36,16.52,0,3.15,2.77,.36,C.pale,C.grey,.95)
  s.rig(7.28,16.82,0,3.65,.76,false);mastFittings(s,7.11,17.65,0,1.43)
  for(const x of [-.5,-9.7])s.funnel(x,6.46,0,5.4,5.5,3.75,.8)
  aftHangar(s,-22.65,back,16.1,10,3.71,true)
  flatPad(s,-39.1,back+.02,17.8,8.4,3.22)
  forecastle(s,h+.5,30)
  for(const k of [-1,1]){
    tender(s,-13.0,5.27,k*5.21,k)
    ventBank(s,-21.82,4.22,k*4.91,2.65,k)
    s.ball(3.87,10.37,k*2.04,.53,.63,.53,C.pale)
    fitting(s,13.16,8.26,3.87,3.44,1.85,k,.40,'#8d9ca5',true)
    fitting(s,8.00,12.09,2.31,2.1,1.35,k,.23,'#91a0a7',true)
    fitting(s,-25.57,4.96,4.91,1.09,1.54,k,.08,'#98a8ad')
    fitting(s,-3.13,4.76,5.18,2.63,1.20,k,.19,'#7c919b')
    serviceDeck(s,12.29,9.14,3.56,6.5,k)
    for(const u of [2.36,4.75,7.14])fitting(s,u,5.63,5.03,.86,.53,k,.18,C.glass)
    for(let i=0;i<5;i++)s.raft(-25.67+i*1.33,6.97,k*4.51)
  }
}
function type075(s:Yard){
  const deck=7.80
  s.hull(12.70,6.83,7.08,true,'#73818a')
  // Continuous oblong flight deck with a broad, softly chamfered bow.
  // Slightly narrower forward than aft and overhangs the actual ship's sides.
  const row=[[-49.94,5.05],[-48.5,6.78],[-39.8,7.08],[13,7.11],[35,6.81],[45.2,6.50],[48,5.74],[49.75,4.39]]
  for(let i=1;i<row.length;i++){
    const [a,w]=row[i-1],[b,v]=row[i]
    s.face([[a,deck,-w],[b,deck,-v],[b,deck,v],[a,deck,w]],'#758087',[0,1,0])
    for(const k of [-1,1]) s.face([[a,deck-.57,k*w*.98],[b,deck-.57,k*v*.98],[b,deck,k*v],[a,deck,k*w]],C.pale,[0,0,k])
  }
  for(const i of [0,row.length-1]){
    const [x,w]=row[i];s.face([[x,deck-.57,-w],[x,deck-.57,w],[x,deck,w],[x,deck,-w]],C.side,[i===0?-1:1,0,0])
  }
  // Restrained helideck registration marks; these are illustrative positions, not a deck plan.
  for(const x of [-36,-19,-2,15,32])s.mark(x,deck+.07,-2.25,2.44)
  for(const side of [-1,1])s.flatLine(-45,deck+.055,side*5.86,39,side*5.72,.15)
  for(let x=-38;x<40;x+=3.4)s.flatLine(x,deck+.07,-.37,x+1.67,-.37,.13,'#d2c397')
  for(const x of [-42,38])for(const k of [-1,1])
    s.flatLine(x-1.6,deck+.07,k*2.8,x+1.6,k*2.8,.16)
  const z=4.23
  s.house(-1,deck,z,31.8,4.20,2.83,C.steel,C.grey,.92,-.30)
  s.house(8.71,10.53,z,10.65,3.91,1.97,C.steel,C.grey,.88)
  s.bridge(10.33,12.22,z,5.30,4.14)
  s.bridge(-13.13,10.54,z,4.35,3.57)
  s.funnel(1.47,10.47,z,4.33,3.26,3.84,.46)
  s.funnel(-7.10,10.48,z,3.86,3.26,3.36,.48)
  s.rig(7.31,13.18,z,5.21,1.55,false);s.rig(-11.42,12.02,z,3.59,.77,true)
  s.ball(3.20,13.45,z,.60,.63,.6,C.pale)
  helo(s,-32.80,deck+.20,3.61);helo(s,-23.85,deck+.20,3.61)
  // Shadowed galleries, tumble under the flight deck, boats and sponsons.
  for(const k of [-1,1]){
    for(const [x,l] of [[-36,8.5],[-19,7.1],[-1.4,8.1],[22,5.6]]){
      const zz=k*6.30
      s.house(x,3.37,zz,l,.34,2.42,C.side,C.pale,.98,0,.08)
      s.face([[x-l*.43,3.63,zz+k*.195],[x+l*.43,3.63,zz+k*.195],[x+l*.43,5.42,zz+k*.195],[x-l*.43,5.42,zz+k*.195]],'#415963',[0,0,k])
      for(const dx of [-l*.31,0,l*.31])s.rod([x+dx,3.57,zz+k*.24],[x+dx,5.54,zz+k*.24],.078,C.pale)
      if(x<0)tender(s,x,4.12,zz+k*.22,k)
      s.house(x,6.64,zz+k*.23,l+.35,1.08,.24,C.pale,C.grey,.95)
      promenade(s,x-l*.46,x+l*.46,6.88,zz+k*.70)
    }
    for(let i=0;i<4;i++)s.raft(-28+i*1.28,7.13,k*6.63)
  }
  shutter(s,-49.68,1.03,0,6.54,3.65)
}
function type071(s:Yard){
  const h=4.80,back=4.4
  s.hull(13.13,h,back,true);deckFurniture(s,6.54,h)
  // Prominent angular forward block and long, clear after flight deck.
  s.house(4.50,h-.31,0,49.1,11.95,4.26,C.steel,C.grey,.85,-.25,1.61)
  s.house(14.0,8.55,0,17.1,9.35,2.95,C.steel,C.pale,.82,-.51,1.37)
  s.bridge(16.04,11.28,0,6.57,7.72)
  s.house(8.80,9.20,0,6.9,5.15,3.09,C.steel,C.grey,.72)
  s.rig(9.26,12.32,0,6.74,2.19,true)
  for(const k of [-1,1]){
    s.funnel(1.55,8.52,k*2.94,4.10,2.66,3.55,.66)
    tender(s,-6.91,8.91,k*4.94,k)
    ventBank(s,-13.25,5.92,k*5.65,4.14,k)
    s.rod([-4.10,8.65,k*4.21],[-3.42,12.0,k*4.21],.20,C.pale)
    s.rod([-3.42,12.0,k*4.21],[-9.36,10.72,k*4.21],.15,C.pale)
    fitting(s,11.50,7.10,5.43,2.25,1.03,k,.20,'#798d96')
    for(const u of [15.95,18.04,20.13])fitting(s,u,7.10,5.43,.77,.50,k,.20,C.glass)
    serviceDeck(s,15.53,11.27,3.82,6.1,k)
  }
  shutter(s,-19.64,back+.09,0,7.30,3.05)
  flatPad(s,-34.53,back+.03,28.2,11.45,3.12)
  s.mark(-25.36,back+.159,0,2.76)
  helo(s,-25.29,back+.20,.17)
  forecastle(s,h+.40,37.6)
  shutter(s,-49.68,.48,0,7.56,2.96)
}

function sejong(s:Yard){
  const h=3.66,b=3.15;s.hull(13.04,h,b,false);deckFurniture(s,6.50,h)
  s.house(8.11,h-.21,0,31.8,11.8,3.77,C.steel,C.grey,.88,-.48,1.54)
  s.house(11.25,7.12,0,16.5,10.3,3.20,C.steel,C.grey,.73,-.51,1.77)
  s.bridge(12.93,10.18,0,7.3,8.0)
  s.rig(7.64,10.22,0,10.43,2.20,true)
  mastFittings(s,7.15,17.82,0,2.23)
  // Two separated, swept-back exhaust trunks / split superstructure.
  for(const [x,y,z] of [[-.9,6.88,1.17],[-12.90,5.24,-1.12]]) {
    s.house(x,y-.17,z,7.72,5.47,1.15,C.side,C.grey,.88)
    s.funnel(x,y+.86,z,6.57,4.6,4.28,1.22)
  }
  aftHangar(s,-26.18,b,17.83,11.64,4.25,true)
  s.house(-19.68,7.23,0,7.76,6.63,1.78,C.steel,C.grey,.78)
  s.rig(-20.45,8.84,0,6.15,1.17,true)
  for(const k of [-1,1]){
    tender(s,-8.75,h+1,k*5.12,k)
    s.ball(4.09,9.27,k*3.42,.63,.64,.63,C.pale)
    ventBank(s,-29.55,4.16,k*5.68,3.95,k)
    fitting(s,11.71,8.72,4.53,3.75,2.16,k,.43,'#86959b',true)
    serviceDeck(s,12.19,10.13,3.96,6.72,k)
    for(const u of [-21.2,-23.3,-25.4])fitting(s,u,6.36,5.56,.87,.52,k,.09,C.glass)
  }
  forecastle(s,h+.42,32.2);flatPad(s,-41.00,b+.02,15.84,9.21,3.20)
}
function udaloy(s:Yard){
  const h=3.73,b=3.17,red='#9c7968';s.hull(11.82,h,b,false,red);deckFurniture(s,5.9,h)
  s.house(12.11,h-.33,0,24.3,10.1,3.68,C.steel,red,.90,-.40)
  s.house(11.25,6.86,0,14.22,9.0,2.72,C.pale,red,.88)
  s.bridge(12.94,9.21,0,7.05,7.88)
  s.house(6.0,8.41,0,5.08,5.67,3.81,C.steel,C.grey,.72,-.62)
  s.rig(5.6,11.87,0,10.17,2.27,true)
  // Two characteristic open, layered masts and broad transverse aerial heads.
  for(const [x,y,r] of [[5.06,20.98,2.20],[-17.00,17.70,1.82]]){
    s.house(x,y,0,.64,r*2,1.11,C.side,C.grey,.88,.03,.22)
    for(const k of [-1,1])s.rod([x+.1,y+.30,0],[x+.23,y+1.52,k*r*.82],.09,C.pale)
  }
  for(const [x,y] of [[.62,4.21],[-12.15,4.14]]){
    s.house(x,y-.62,0,8.01,8.81,2.52,C.side,red,.91)
    for(const k of [-1,1])s.funnel(x,y+1.72,k*2.25,6.28,3.07,5.12,1.26)
  }
  s.rig(-16.55,7.22,0,10.21,2.01,true)
  aftHangar(s,-26.56,b,16.82,10.61,3.22,true)
  // Stepped deckhouses, pronounced forward silhouette, warm decks and
  // lattice-work instead of a modern flush-sided single enclosure.
  for(const k of [-1,1]){
    s.house(16.43,5.12,k*4.61,7.57,1.51,1.57,C.side,C.grey,.81,-.52)
    tender(s,-5.41,4.74,k*4.7,k)
    s.ball(11.15,10.91,k*3.26,.64,.67,.64,C.pale)
    serviceDeck(s,11.04,9.24,3.98,7.79,k)
    for(const u of [9.45,11.23,13.01,14.79])fitting(s,u,8.01,4.35,.79,.64,k,.21,C.glass)
    for(const u of [-22.1,-24.35,-26.6])fitting(s,u,5.24,5.12,1.28,.94,k,.12,'#829399')
  }
  forecastle(s,h+.45,35.11,true);forecastle(s,h+1.21,25.80,true)
  flatPad(s,-41.12,b+.06,14.69,8.78,3.11,true)
}
function hobart(s:Yard){
  const h=3.60,b=3.14;s.hull(12.54,h,b,false);deckFurniture(s,6.25,h)
  s.house(7.17,h-.26,0,34.2,11.45,3.09,C.steel,C.grey,.88,-.61,1.41)
  s.house(10.62,6.30,0,19.20,9.86,3.28,C.steel,C.steel,.76,-.53,1.64)
  s.bridge(14.94,9.20,0,7.56,7.87)
  // High squared forward tower and a single aft-swept central funnel.
  s.house(6.25,9.38,0,6.90,6.12,5.01,C.steel,C.grey,.81,-.39,1.02)
  s.house(6.03,14.30,0,5.49,5.26,.72,C.pale,C.grey,.97)
  s.rig(5.91,14.91,0,6.93,1.52,false)
  s.house(-8.28,h-.09,0,11.61,7.12,2.32,C.side,C.grey,.89)
  s.funnel(-8.08,5.72,0,7.6,5.0,5.33,1.18)
  aftHangar(s,-24.32,b,16.73,10.62,4.34)
  s.rig(-21.55,7.38,0,4.12,.79,true)
  for(const k of [-1,1]){
    s.raft(-16.7,5.62,k*4.6);tender(s,-2.85,5.01,k*4.81,k)
    s.ball(3.41,11.2,k*3.25,.53,.56,.53,C.pale)
    fitting(s,6.05,11.85,2.80,3.31,2.93,k,.11,'#8699a3',true)
    serviceDeck(s,14.17,9.18,3.95,5.76,k)
    for(const u of [4.6,6.59,8.58])fitting(s,u,5.13,5.46,.78,.56,k,.23,C.glass)
    ventBank(s,-23.92,4.73,k*5.20,2.89,k)
  }
  forecastle(s,h+.37,31.20);flatPad(s,-40.42,b+.04,16.88,9.29,3.35)
}
function anzac(s:Yard){
  const h=3.69,b=3.18;s.hull(12.45,h,b,false);deckFurniture(s,6.23,h)
  s.house(7.13,h-.25,0,33.7,10.81,3.18,C.steel,C.grey,.88)
  s.house(13.61,6.44,0,13.22,8.76,2.41,C.steel,C.grey,.86)
  s.bridge(14.55,8.44,0,6.94,7.91)
  // Modernised Anzac silhouette: enclosed faceted forward mast head,
  // separate aft tower and broad hangar / single landing deck.
  s.house(7.52,8.22,0,6.21,5.30,5.21,C.side,C.grey,.52)
  s.house(7.52,13.37,0,5.15,4.56,2.53,C.steel,C.grey,.88,0,1.42)
  s.rig(7.48,15.72,0,3.0,.81,false)
  s.funnel(-3.35,6.31,0,5.50,4.43,4.54,.82)
  s.house(-13.22,4.26,0,8.86,6.14,3.43,C.steel,C.grey,.85)
  s.rig(-13.43,7.63,0,6.61,1.27,false)
  s.house(-13.84,12.02,0,3.58,3.21,1.91,C.side,C.pale,.78,0,1.14)
  aftHangar(s,-25.42,b,14.0,10.76,4.37)
  for(const k of [-1,1]){
    tender(s,-6.89,4.75,k*5.04,k)
    serviceDeck(s,14.07,8.45,3.96,5.41,k)
    fitting(s,7.50,14.52,2.20,2.41,1.62,k,.11,'#7c8b93',true)
    for(const u of [13.2,15.1,17.0])fitting(s,u,5.45,5.12,.80,.55,k,.20,C.glass)
    ventBank(s,-26.2,4.75,k*5.27,3.97,k)
  }
  forecastle(s,h+.46,31.92);flatPad(s,-40.71,b+.01,15.52,8.89,3.09)
}
function collins(s:Yard) {
  // The surfaced boat has little freeboard. Show the visible crown, the
  // fairwater, sail planes and tail tip; no cutaway / underwater display.
  const stations=[
    [-50,.035,-1.05],[-47,1.5,-.24],[-40,3.43,.72],[-28,4.63,1.74],
    [-13,4.94,2.22],[7,5.00,2.53],[24,4.9,2.33],[35,4.56,1.71],
    [43,3.47,1.05],[48,2.04,.28],[50,.035,-1.05],
  ]
  const section=(j:number,f:number)=>{
    const a=stations[j],b=stations[j+1],v=f*f,g=f*v,span=b[0]-a[0]
    const m=(i:number,k:number)=>{const left=stations[Math.max(0,i-1)],r=stations[Math.min(stations.length-1,i+1)]
      return (r[k]-left[k])/(r[0]-left[0])}
    const interp=(k:number)=>(2*g-3*v+1)*a[k]+(g-2*v+f)*span*m(j,k)+(-2*g+3*v)*b[k]+(g-v)*span*m(j+1,k)
    return [a[0]+span*f,Math.max(.03,interp(1)),interp(2)]
  }
  const p=(row:number[],t:number):P=>{const [x,w,h]=row,a=t/32*Math.PI*2,sy=Math.sin(a)
    return [x,-1.14+(sy>=0?h+1.14:w*.83)*sy,Math.cos(a)*w]}
  for(let j=0;j<stations.length-1;j++)for(let k=0;k<4;k++){
    const l=section(j,k/4),r=section(j,(k+1)/4)
    for(let t=0;t<32;t++){
      const angle=(t+.5)/32*Math.PI*2
      s.face([p(l,t),p(r,t),p(r,t+1),p(l,t+1)],Math.sin(angle)<.21?'#3c4e57':'#4d6069',[0,Math.sin(angle),Math.cos(angle)])
    }
  }
  // Blend the rounded forward face and longer trailing edge of the sail
  // into the hull with a rounded fairing, not a surface ship's bridge.
  for(const i of [0,stations.length-1])
    s.face(Array.from({length:32},(_,k)=>p(stations[i],k)),C.dark,[i===0?-1:1,0,0])
  const rs=[[10,2.13,8.23,2.77],[10.1,2.72,7.78,2.42],[10.18,3.32,6.54,2.17],[10.10,4.12,5.91,2.01],[9.62,8.81,5.51,1.92],[9.58,9.09,5.10,1.78],[9.51,9.22,4.85,1.60]]
  const ring=(row:number[],t:number):P=>{const a=t/28*Math.PI*2,co=Math.cos(a)
    return [row[0]+Math.sign(co)*Math.abs(co)**.76*row[2],row[1],Math.sin(a)*(.8+.18*co)*row[3]]}
  for(let j=1;j<rs.length;j++)for(let t=0;t<28;t++){
    const a=(t+.5)/28*Math.PI*2
    s.face([ring(rs[j-1],t),ring(rs[j-1],t+1),ring(rs[j],t+1),ring(rs[j],t)],j<3?'#53636a':j>4?'#586a72':'#52616a',[Math.cos(a),0,Math.sin(a)])
  }
  s.face(Array.from({length:28},(_,i)=>ring(rs[rs.length-1],i)),'#65747a',[0,1,0])
  for(const [x,height] of [[9.24,2.13],[11.18,1.52]])
    s.rod([x,9.23,0],[x,9.23+height,0],.16,'#525f68',.12,8)
  for(const x of [7.1,9.22,11.31])
    s.house(x,9.32,0,1.06,.82,.12,C.dark,C.rubber,1,0,.15)
  for(const k of [-1,1]){
    for(const u of [11.53,12.66,13.79])fitting(s,u,8.12,1.46,.67,.38,k,.04,'#34444e')
    for(const u of [-26,-22,-18,-14,-10,-6,-2])
      s.face([[u-.82,.90,k*4.13],[u+.82,.91,k*4.13],[u+.81,1.18,k*4.0],[u-.83,1.18,k*4.0]],'#37454d',[0,.3,k])
    s.face([[12.28,5.9,k*1.4],[11.26,5.94,k*6.10],[9.64,5.97,k*6.01],[8.93,5.94,k*1.43]],'#5b6971',[0,1,0])
    s.face([[-39.31,-.26,k*1.60],[-44.18,2.82,k*3.03],[-46.77,2.76,k*3.10],[-45.06,-.24,k*1.82]],'#53626c',[0,.68,k*.7])
  }
}

const makers:Record<SurfaceModelId,(s:Yard)=>void>={type055,type071,type075,sejong,udaloy,hobart,anzac,collins}
export function makeSurfaceModel(id:SurfaceModelId) {
  const yard=new Yard()
  makers[id](yard)
  return yard.finish(id,lengths[id])
}


