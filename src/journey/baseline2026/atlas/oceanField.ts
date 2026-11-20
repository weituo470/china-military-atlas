import * as T from 'three'
import { EARTH_RADIUS, latLngToVector3 } from '../../../utils/geo'

// This is the same globe, not a ground plane or another Earth. All positions
// are in the parent Planet frame; the meridian at ±180° is continuous here.
export const SEA_RADIUS = EARTH_RADIUS + .00027
export const SEA_EAST = 179
export const SEA_NORTH = 13
const latScale = Math.cos(SEA_NORTH * Math.PI / 180)
export function oceanCap() {
  const columns=112, rows=82, radius=SEA_RADIUS
  const p=[], uv=[], ix=[]
  for(let i=0;i<=rows;i++) for(let j=0;j<=columns;j++){
    const east=(j/columns-.5)*66, north=(i/rows-.5)*50
    const point=latLngToVector3(SEA_NORTH+north, SEA_EAST+east/latScale, radius)
    p.push(point.x,point.y,point.z);uv.push(east,north)
    if(i && j){
      const c=i*(columns+1)+j
      ix.push(c-columns-2,c-columns-1,c,c-columns-2,c,c-1)
    }
  }
  const g=new T.BufferGeometry()
  g.setAttribute('position',new T.Float32BufferAttribute(p,3))
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2))
  g.setIndex(ix);g.computeBoundingSphere();return g
}

// Periodic wind ripples, plus two bands of correlated noise for foam, cloud
// and broad wind streaks. Texture filtering/mipmaps keep distant crests from
// aliasing as the same camera comes down from the globe. Generated here.
export function oceanPattern(){
  const n=192
  let seed=0x70d413b
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  const fields=[4,8,16,32,64,96].map(size=>({size,data:Array.from({length:size*size},random)}))
  const sample=(level:number,u:number,v:number)=>{
    const {size,data}=fields[level]
    const x=(u-Math.floor(u))*size,y=(v-Math.floor(v))*size,ix=Math.floor(x),iy=Math.floor(y)
    const a=x-ix,b=y-iy, t=a*a*(3-2*a),s=b*b*(3-2*b)
    const at=(dx:number,dy:number)=>data[((ix+dx)%size)+((iy+dy)%size)*size]
    return (at(0,0)*(1-t)+at(1,0)*t)*(1-s)+(at(0,1)*(1-t)+at(1,1)*t)*s
  }
  const phase=2*Math.PI,data=new Uint8Array(n*n*4),height=new Float32Array(n*n)
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const u=x/n,v=y/n, vals=fields.map((_,i)=>sample(i,u,v))
    const [a,b,c,d,e,f]=vals,flow=.22*(a-.5)+.08*(b-.5)
    height[x+y*n]=(.5+.7*a)*Math.sin(phase*(3*u+9*(v+flow)))+
      (.22+.27*b)*Math.sin(phase*(-3*u+16*v+1.1*b+c))+
      .15*Math.sin(phase*(7*u+24*v+.75*c+.5*d))+.33*(e+f-1)
    const at=4*(x+y*n);data[at+2]=Math.round(255*(a*.46+b*.26+c*.15+d*.08+e*.035+f*.015))
    data[at+3]=Math.round(255*(b*.05+c*.27+d*.29+e*.24+f*.15))
  }
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const at=4*(x+y*n)
    data[at]=T.MathUtils.clamp(127+198*(height[(x+1)%n+y*n]-height[(x+n-1)%n+y*n]),0,255)
    data[at+1]=T.MathUtils.clamp(127+147*(height[x+((y+1)%n)*n]-height[x+((y+n-1)%n)*n]),0,255)
  }
  const tex=new T.DataTexture(data,n,n,T.RGBAFormat)
  tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter
  tex.generateMipmaps=true;tex.anisotropy=4;tex.needsUpdate=true;return tex
}

export const oceanVertex = `
varying vec2 grid; varying vec3 worldPoint;
void main(){
  grid=uv;
  vec4 wp=modelMatrix*vec4(position,1.);
  worldPoint=wp.xyz;
  gl_Position=projectionMatrix*viewMatrix*wp;
}`
export const oceanFragment = `
uniform sampler2D wind;uniform float t;uniform float nearShot;uniform float scaleDetail;
uniform sampler2D reflected;uniform mat4 mirrorVP;uniform float hasMirror;
varying vec2 grid;varying vec3 worldPoint;
void main(){
  float r=length(grid/vec2(33.,25.));
  float edge=1.-smoothstep(.68,1.,r);
  if(edge<.002)discard;
  vec2 flow=texture2D(wind,grid*.066+vec2(.13,.68)).ba;
  vec2 p=(grid+.32*(flow-.5))*scaleDetail+vec2(.024*t,.014*t);
  mat2 rot=mat2(.88,.475,-.475,.88);
  vec4 gravity=texture2D(wind,.65*p);
  vec4 chop=texture2D(wind,rot*p*1.94+vec2(.3,-.012*t));
  vec4 ripple=texture2D(wind,mat2(.62,.785,-.785,.62)*p*5.86+vec2(.009*t,.12));
  vec2 slope=(gravity.rg-.5)*vec2(.092,.122)+(chop.rg-.5)*.116+(ripple.rg-.5)*.093;
  vec3 N=normalize(worldPoint);
  vec3 E=normalize(dFdx(worldPoint)*dFdy(grid).y-dFdy(worldPoint)*dFdx(grid).y);
  // Derivative basis can flip with front-face winding. Normalise to the
  // signed UV determinant so north and east follow the rotating Earth.
  vec2 dx=dFdx(grid),dy=dFdy(grid);
  E*=sign(dx.x*dy.y-dy.x*dx.y);
  vec3 K=normalize(cross(N,E));
  vec3 normal=normalize(N+E*slope.x+K*slope.y);
  vec3 eye=normalize(cameraPosition-worldPoint);
  float facing=clamp(dot(normal,eye),0.,1.);
  float grazing=pow(1.-facing,3.9);
  float grains=.53*gravity.b+.47*chop.a;
  vec3 body=mix(vec3(.007,.044,.072),vec3(.020,.122,.159),smoothstep(.16,.84,grains));
  vec3 reflection=mix(vec3(.094,.191,.257),vec3(.31,.418,.444),grazing);
  vec3 col=mix(body,reflection,.052+.78*grazing);
  vec3 sun=normalize(N*.43+E*.62+K*.58);
  float sheen=max(0.,dot(normal,normalize(sun+eye)));
  col+=vec3(.73,.72,.60)*(.12*pow(sheen,50.)+.56*pow(sheen,430.));
  if(hasMirror>.5){
    vec4 clip=mirrorVP*vec4(worldPoint,1.);
    vec2 st=clip.xy/max(.001,clip.w)*.5+.5;
    vec2 off=vec2(slope.x*.050,slope.y*.118);
    float mask=.55*texture2D(reflected,st+off).r+
      .25*texture2D(reflected,st+off*1.65+vec2(.0009,.002)).r+
      .20*texture2D(reflected,st+off*.57-vec2(.001,.001)).r;
    // The hull interrupts sky reflections; preserve small ripples and body
    // colour below them, rather than stamping a solid black silhouette.
    col*=1.-mask*(.12+.39*grazing)*(.85+.3*ripple.a);
  }
  float cap=smoothstep(.69,.82,chop.a)*smoothstep(.56,.78,gravity.g);
  col=mix(col,vec3(.38,.55,.57),.28*cap);
  float farBlur=1.-smoothstep(.015,.21,max(dot(N,eye),0.));
  col=mix(col,mix(vec3(.070,.125,.174),vec3(.17,.25,.281),nearShot),farBlur*.45);
  gl_FragColor=vec4(col,edge);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

export const skyVertex=`
varying vec3 wp;
void main(){vec4 world=modelMatrix*vec4(position,1.);wp=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}
`
export const skyFragment=`
uniform sampler2D wind;uniform float t;varying vec3 wp;
void main(){
  vec3 d=normalize(wp-cameraPosition),up=normalize(cameraPosition);
  float h=dot(d,up),dist=length(cameraPosition);
  float dip=sqrt(clamp(1.-2.25/(dist*dist),0.,1.));
  float altitude=max(0.,h+dip);
  vec3 col=mix(vec3(.205,.307,.367),vec3(.032,.114,.203),smoothstep(0.,.41,altitude));
  vec3 east=normalize(cross(up,vec3(.13,.97,.18)));
  vec3 north=cross(east,up);
  vec2 sky=vec2(dot(d,east),dot(d,north))/(altitude+.14);
  float large=texture2D(wind,sky*.14+vec2(.57,.37+.00016*t)).b;
  float fine=texture2D(wind,sky*.55+vec2(.18,.3)).b;
  float clouds=smoothstep(.47,.70,large*.82+fine*.18)*smoothstep(.006,.066,altitude);
  col=mix(col,mix(vec3(.221,.318,.380),vec3(.49,.56,.57),smoothstep(.29,.73,fine)),clouds*.70);
  gl_FragColor=vec4(col,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

