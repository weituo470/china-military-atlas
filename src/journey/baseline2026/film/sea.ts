import * as T from 'three'

interface Waterline { x: number; z: number; length: number; beam: number }

// An original, periodic wind field. The texture holds two wave gradients and two
// bands of cloud/foam density, not display colours. Mipmaps matter for a moving
// camera: the surface should converge into the haze without a sparkling moiré.
function windField() {
  const n = 256
  const octaves = [3, 6, 12, 24, 48, 96].map((k, i) => {
    let s = 398961 + i * 1421
    return { k, v: Float32Array.from({ length: k * k }, () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0
      return s / 4294967296
    }) }
  })
  function octave(i: number, u: number, v: number) {
    const o = octaves[i], x = (u - Math.floor(u)) * o.k, y = (v - Math.floor(v)) * o.k
    const ix = Math.floor(x), iy = Math.floor(y)
    const a = x - ix, b = y - iy, f = a * a * (3 - 2 * a), g = b * b * (3 - 2 * b)
    const j = (iy % o.k) * o.k, l = ((iy + 1) % o.k) * o.k, k = (ix + 1) % o.k
    return (o.v[j + ix] * (1 - f) + o.v[j + k] * f) * (1 - g)
        + (o.v[l + ix] * (1 - f) + o.v[l + k] * f) * g
  }
  const bytes = new Uint8Array(n * n * 4), h = new Float32Array(n * n)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const u = x / n, v = y / n, i = y * n + x
    const a = octave(0, u, v), b = octave(1, u, v), c = octave(2, u, v)
    const d = octave(3, u, v), e = octave(4, u, v), f = octave(5, u, v)
    const w = v + .12 * (b - .5) + .055 * (c - .5)
    // Wind-driven groups break up the parallel capillary crests.
    h[i] = Math.sin(2 * Math.PI * (w * 9 + u * 3 + a)) * (.27 + .43 * b)
      + Math.sin(2 * Math.PI * (w * 16 - u * 2 + 1.25 * c)) * .19
      + Math.sin(2 * Math.PI * (v * 29 + u * 7 + 1.4 * c + .5 * d)) * .10
      + (d - .5) * .72 + (e - .5) * .37
    bytes[i * 4 + 2] = Math.round(255 * (.44 * a + .26 * b + .15 * c + .085 * d + .045 * e + .02 * f))
    bytes[i * 4 + 3] = Math.round(255 * (.40 * c + .28 * d + .2 * e + .12 * f))
  }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const i = (y * n + x) * 4
    bytes[i] = T.MathUtils.clamp(128 + 550 * (h[y*n+(x+1)%n] - h[y*n+(x+n-1)%n]), 0, 255)
    bytes[i+1] = T.MathUtils.clamp(128 + 320 * (h[((y+1)%n)*n+x] - h[((y+n-1)%n)*n+x]), 0, 255)
  }
  const map = new T.DataTexture(bytes, n, n, T.RGBAFormat)
  map.wrapS = map.wrapT = T.RepeatWrapping
  map.magFilter = T.LinearFilter; map.minFilter = T.LinearMipmapLinearFilter
  map.generateMipmaps = true; map.anisotropy = 4; map.needsUpdate = true
  return map
}

const output = `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

// Colours below are linear, before the renderer applies its output transform.
const skyCommon = `
uniform vec3 sun;
vec3 atmosphere(vec3 dir) {
  float h = max(dir.y, 0.);
  vec3 horizon = vec3(.62,.735,.775);
  vec3 top = vec3(.133,.313,.483);
  vec3 sky = mix(horizon, top, pow(smoothstep(.0, .88, h), .46));
  float facing = max(0., dot(dir,sun));
  return sky + vec3(.18,.103,.025)*pow(facing,5.);
}`

export function makeSea(scene: T.Scene) {
  const root = new T.Group(); root.name = 'Sea / daylight exterior'
  scene.add(root)
  const map = windField()
  const direction = new T.Vector3(-.54,.54,.64).normalize()
  const shared = { wind: { value: map }, t: { value: 0 }, sun: { value: direction } }
  const previousFog = scene.fog
  const fog = new T.FogExp2(0xbad0d8, .00072)
  scene.fog = fog
  const key = new T.DirectionalLight(0xffeed6, 2.40)
  key.name = 'Sea / key light'
  key.position.copy(direction).multiplyScalar(500)
  const dome = new T.HemisphereLight(0xd9e9f4, 0x708c9a, 1.12)
  const fill = new T.DirectionalLight(0xd6e9f7, .48)
  fill.position.set(300,156,-250)
  root.add(key, dome, fill)

  const skyMat = new T.ShaderMaterial({
    uniforms: shared, side: T.BackSide, depthTest: false, depthWrite: false,
    vertexShader: `varying vec3 ray; void main() {
      ray = position;
      vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.);
      gl_Position = p.xyww;
    }`,
    fragmentShader: `varying vec3 ray; uniform sampler2D wind; uniform float t;
    ${skyCommon}
    void main() {
      vec3 d = normalize(ray); float h = max(0.,d.y);
      vec3 color = atmosphere(d);
      // A distant layer of low maritime cloud. The texture is made here, never
      // a photographic backdrop, so a turn of the lens has no seam.
      vec2 p = d.xz / (h + .065) * vec2(.075,.105) + vec2(.63,-.12);
      float shape = texture2D(wind, p + vec2(t*.00009,0.)).b;
      float curls = texture2D(wind, p*3.67+vec2(.63,.23)).b;
      float density = smoothstep(.43,.72,shape*.74+curls*.26)
        * smoothstep(.007,.062,h) * (1.-.68*smoothstep(.16,.65,h));
      vec3 cloud = mix(vec3(.59,.658,.68),vec3(.93,.91,.85), smoothstep(.41,.72,curls));
      color = mix(color,cloud,density*.74);
      float s = max(0.,dot(d,sun));
      color += vec3(.30,.21,.10)*pow(s,90.) + vec3(1.9,1.65,1.27)*smoothstep(.99988,.99997,s);
      gl_FragColor = vec4(color,1.);
    ${output}`,
  })
  const sky = new T.Mesh(new T.BoxGeometry(2,2,2), skyMat)
  sky.renderOrder = -100; sky.frustumCulled = false; root.add(sky)

  const oceanMat = new T.ShaderMaterial({
    // Draw after opaque hulls: compare against their depth to hide underwater
    // geometry, but do NOT replace that depth with the huge horizon quad's.
    // A coplanar near-surface wake otherwise disappears at different camera
    // angles (especially on 16-bit SwiftShader render targets).
    depthTest: true, depthWrite: false,
    uniforms: { ...shared, horizon: { value: 1500 }, reflection: {value: null as T.Texture|null},
      hasReflection: {value: 0}, viewport: {value: new T.Vector2(1,1)} },
    vertexShader: `varying vec3 wp; void main() {
      wp=(modelMatrix*vec4(position,1.)).xyz;
      gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);
    }`,
    fragmentShader: `varying vec3 wp; uniform sampler2D wind; uniform float t; uniform float horizon;
    uniform sampler2D reflection; uniform float hasReflection; uniform vec2 viewport;
    ${skyCommon}
    void main() {
      vec3 view = normalize(cameraPosition-wp);
      float dist = length(cameraPosition-wp);
      vec2 p = wp.xz + vec2(0.,t*1.12);
      vec2 drift = texture2D(wind,p/212.+.63).ba - .5;
      p += 10. * drift;
      vec4 n1 = texture2D(wind, p / 63.);
      const mat2 r = mat2(.837,.547,-.547,.837);
      vec4 n2 = texture2D(wind, r*(p+vec2(t*.27,t*.33))/23.+.31);
      vec4 n3 = texture2D(wind, vec2(.67*wp.x + .74*wp.z,-.74*wp.x+.67*wp.z+t*1.88)/6.4+.42);
      vec2 slope = (n1.rg-.5)*vec2(.178,.228)
        + (n2.rg-.5)*vec2(.145,.149) + (n3.rg-.5)*vec2(.107,.11);
      vec3 N = normalize(vec3(-slope.x,1.,-slope.y));
      float ndv = clamp(dot(N,view),0.,1.);
      float fresnel = .038 + .77 * pow(1.-ndv,3.8);
      vec3 reflected = reflect(-view,N);
      vec3 sky = atmosphere(reflected);
      float occludedSun = 0.;
      if (hasReflection > .5) {
        // The separate RGBA pass contains just the actual reflected ships.
        // Refract screen-space sampling through changing water slopes; let the
        // darker flank occlude *sky radiance*, not paint a black shadow on top.
        vec2 tilt = (viewMatrix * vec4(slope.x,.0,slope.y,0.)).xy;
        float heightRatio = viewport.y / viewport.x;
        vec2 fuzz = vec2(heightRatio,1.) * (.0016 + .0014*(1.-ndv));
        vec2 uv = gl_FragCoord.xy / viewport + vec2(heightRatio*tilt.x,tilt.y + .62*slope.y)*.092;
        vec4 rr = texture2D(reflection,clamp(uv,vec2(.0001),vec2(.9999))) * .52
          + texture2D(reflection,clamp(uv + fuzz*vec2(1.,-.55),vec2(.0001),vec2(.9999))) * .24
          + texture2D(reflection,clamp(uv - fuzz*vec2(1.,-.55),vec2(.0001),vec2(.9999))) * .24;
        vec3 radiance = rr.rgb / max(rr.a, .065);
        occludedSun = rr.a * (.64 + .20*n2.a);
        sky = mix(sky,radiance*vec3(.83,.92,.95),occludedSun);
      }
      float pattern = .52*n1.b + .48*n2.a;
      vec3 under = mix(vec3(.010,.057,.082),vec3(.027,.139,.153), smoothstep(.24,.77,pattern));
      vec3 col = mix(under,sky,fresnel);
      vec3 H = normalize(view+sun);
      float glint = max(0.,dot(H,N));
      col += vec3(1.,.88,.65)*(.20*pow(glint,55.)+.81*pow(glint,560.))*(1.-occludedSun*.85);
      // Only occasional pale caps; neither the entire surface nor the sun's
      // specular path should look like a uniformly glittering grid.
      float cap = smoothstep(.69,.815,n2.a) * smoothstep(.59,.80,n1.g);
      col = mix(col,vec3(.56,.69,.71),.29*cap);
      float haze = .32*(1.-exp(-.0008*dist))
        + .42*smoothstep(horizon*.56,horizon,dist);
      col = mix(col,atmosphere(normalize(wp-cameraPosition)),clamp(haze,0.,.76));
      gl_FragColor = vec4(col,1.);
    ${output}`,
  })
  const slab = new T.PlaneGeometry(2,2); slab.rotateX(-Math.PI/2)
  const ocean = new T.Mesh(slab, oceanMat); ocean.renderOrder = 50; ocean.frustumCulled=false; root.add(ocean)

  const wakeGeo = new T.InstancedBufferGeometry()
  // A unit rectangle per wake. Only the pixels behind or beside each ship
  // pay for an entrained foam field. No full-frame loop over vessel positions.
  const rect = new T.PlaneGeometry(2,2)
  wakeGeo.setAttribute('position', rect.getAttribute('position'))
  wakeGeo.setIndex(rect.getIndex())
  const max = 32
  const lines = new T.InstancedBufferAttribute(new Float32Array(max*4),4)
  lines.setUsage(T.DynamicDrawUsage); wakeGeo.setAttribute('line',lines)
  const wakeMat = new T.ShaderMaterial({
    uniforms: shared, transparent:true, depthWrite:false, side:T.DoubleSide,
    vertexShader: `attribute vec4 line; varying vec2 loc; varying vec2 wp;
      varying float beam; varying float len;
      void main(){
        beam=line.w; len=line.z;
        loc=vec2(position.x*(.56*len+.80*beam),mix(-2.50*len,.55*len,position.y*.5+.5));
        wp=line.xy+loc;
        gl_Position=projectionMatrix*viewMatrix*vec4(wp.x,.025,wp.y,1.);
      }`,
    fragmentShader: `uniform sampler2D wind; uniform float t; varying vec2 loc;
      varying vec2 wp; varying float beam; varying float len;
      void main(){
        float longitudinal = (.485*len-loc.y)/len;
        if(longitudinal < -.002) discard;
        vec2 drift=wp+vec2(0.,1.24*t);
        vec4 a=texture2D(wind,drift/14.);
        vec4 b=texture2D(wind,(drift+vec2(.39*t,.64*t))/4.7+vec2(.48,.73));
        vec4 c=texture2D(wind,(drift+vec2(.18*t,.89*t))/1.96);
        float down=max(0.,longitudinal), tr=loc.x/beam, u=abs(tr);
        float wander=(a.a-.5)*.12+(b.a-.5)*.07;
        float bowWidth=.60*pow(smoothstep(.0,.31,down),.49);
        float bowMask=pow(max(0.,1.-abs(u-bowWidth-wander)/(.215+.055*down)),1.15)
          * smoothstep(-.003,.025,longitudinal)*(1.-smoothstep(.26,1.00,down));
        float flankWidth=.545-.12*smoothstep(.68,1.,down);
        float wash=exp(-abs(u-flankWidth-wander*1.9)/.14)
          *smoothstep(.09,.32,down)*(1.-smoothstep(.90,1.08,down));
        // Diverging crests detach from the ship's shoulders and break into
        // streaks instead of two opaque brush strokes.
        float spread=(.59*beam+max(0.,down-.17)*len*.19)/beam;
        float crest=exp(-abs(u-spread-wander*2.7)/(.117+.055*down))
          *smoothstep(.11,.28,down)*(1.-smoothstep(.74,2.75,down));
        float undertow=exp(-abs(u-spread+.22+.065*down-wander*2.3)/(.105+.025*down))
          *smoothstep(.20,.35,down)*(1.-smoothstep(.66,2.2,down));
        float stripe=.63+.37*sin((down*len/4.4-u*3.)*2.+a.b*10.);
        float stern=down-.89;
        float tailWidth=.52+max(stern,0.)*.40;
        float outside=abs(tr+wander*2.);
        float track=(1.-smoothstep(.29*tailWidth,tailWidth*1.42,outside))
          *smoothstep(-.08,.055,stern)*(1.-smoothstep(.24,2.03,stern));
        float threads=.50*a.a+.31*b.a+.19*c.a;
        float flecks=smoothstep(.34,.67,threads);
        float richest=bowMask*mix(.69,1.26,flecks)+wash*mix(.39,.86,flecks)
          +crest*(.52+.67*flecks)*stripe + undertow*(.10+.30*flecks)
          +track*(.50+.81*flecks)*(1.-.22*smoothstep(.64,1.97,stern));
        // A blue-green aerated band underneath the salt-white turbulent foam.
        float shadeWidth=.57*smoothstep(.01,.20,down)*(1.-smoothstep(.76,1.17,down));
        float contact=(1.-smoothstep(.50*shadeWidth,max(.03,shadeWidth+.12),abs(tr-.10)))
          *smoothstep(.022,.18,down)*(1.-smoothstep(.87,1.065,down));
        float alpha = clamp(richest,0.,.95);
        vec3 foam=mix(vec3(.13,.405,.427),vec3(.90,.95,.935),
          smoothstep(.10,.83,richest*.69+flecks*.40));
        if(alpha<.009 && contact<.01) discard;
        gl_FragColor=vec4(mix(foam,vec3(.012,.038,.047),contact*(1.-alpha)),max(alpha,.32*contact));
      ${output}`,
  })
  const wakes=new T.Mesh(wakeGeo,wakeMat); wakes.renderOrder=1; wakes.frustumCulled=false
  wakeGeo.instanceCount=0; root.add(wakes)
  return {
    // RGBA linear render target, clear=(0,0,0,0); viewport is the actual
    // main drawing buffer in pixels, not the lower-resolution reflection RT.
    // The caller owns this texture. A null map restores the procedural ocean.
    setReflection(texture:T.Texture|null, width:number, height:number) {
      oceanMat.uniforms.reflection.value = texture
      oceanMat.uniforms.hasReflection.value = texture ? 1 : 0
      oceanMat.uniforms.viewport.value.set(Math.max(1,width),Math.max(1,height))
    },
    update(time: number, vessels: readonly Waterline[], camera: T.PerspectiveCamera) {
      shared.t.value = time
      oceanMat.uniforms.horizon.value=camera.far
      ocean.position.set(camera.position.x,0,camera.position.z)
      ocean.scale.setScalar(camera.far*2.5)
      const count=Math.min(vessels.length,max)
      for(let i=0;i<count;i++){
        const {x,z,length,beam}=vessels[i]
        lines.setXYZW(i,x,z,length,Math.max(.05,beam))
      }
      lines.needsUpdate=true; wakeGeo.instanceCount=count
    },
    dispose(){
      scene.remove(root)
      if(scene.fog===fog) scene.fog=previousFog
      sky.geometry.dispose(); skyMat.dispose(); slab.dispose(); oceanMat.dispose()
      wakeGeo.dispose(); rect.dispose(); wakeMat.dispose(); map.dispose()
      key.dispose(); dome.dispose(); fill.dispose()
    },
  }
}
