export const earthVertexShader = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uWaterMap;
  uniform sampler2D uPaleoMapA;
  uniform sampler2D uPaleoMapB;
  uniform float uPaleoBlend;
  uniform float uPaleoStrength;
  uniform float uAncientCratons;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPosition;

  void main() {
    vUv = uv;
    float surfaceLuma = dot(texture2D(uDayMap, uv).rgb, vec3(0.299, 0.587, 0.114));
    float currentWater = smoothstep(0.18, 0.72, texture2D(uWaterMap, uv).r);
    float paleoLand = mix(texture2D(uPaleoMapA, uv).a, texture2D(uPaleoMapB, uv).a, uPaleoBlend);
    float reconstructedLand = mix(1.0 - currentWater, paleoLand, uPaleoStrength);
    float relief = (surfaceLuma - 0.38) * reconstructedLand * 0.006;
    relief += (paleoLand - 0.45) * reconstructedLand * uPaleoStrength * 0.003;
    vec3 detailedPosition = position + normal * relief;
    vLocalPosition = normalize(detailedPosition);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(detailedPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

export const earthFragmentShader = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uWaterMap;
  uniform sampler2D uCloudMap;
  uniform sampler2D uPaleoMapA;
  uniform sampler2D uPaleoMapB;
  uniform vec2 uDayTexel;
  uniform vec3 uSunDirection;
  uniform float uTime;
  uniform float uMagma;
  uniform float uOcean;
  uniform float uOxygen;
  uniform float uIce;
  uniform float uVegetation;
  uniform float uImpact;
  uniform float uCityLights;
  uniform float uAtmosphere;
  uniform float uDiveHide;
  uniform float uSolarOverlay;
  uniform float uPaleoBlend;
  uniform float uPaleoStrength;
  uniform float uAncientCratons;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPosition;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + 13.17;
      amplitude *= 0.5;
    }
    return value;
  }

  // The source night texture is a colour composite rather than a binary light
  // mask. Urban light is comparatively warm, while snow, cloud and moonlit sea
  // are blue. Extracting that warm residual prevents Antarctica and ocean haze
  // from turning into false cities after the texture is decoded from sRGB.
  float cityLightSignal(vec3 nightSample) {
    float warmResidual = nightSample.r * 1.3 + nightSample.g * 0.35 - nightSample.b * 1.05;
    return max(0.0, warmResidual);
  }

  void main() {
    vec3 daySource = texture2D(uDayMap, vUv).rgb;
    vec3 dayNeighbours = (
      texture2D(uDayMap, vUv + vec2(uDayTexel.x, 0.0)).rgb +
      texture2D(uDayMap, vUv - vec2(uDayTexel.x, 0.0)).rgb +
      texture2D(uDayMap, vUv + vec2(0.0, uDayTexel.y)).rgb +
      texture2D(uDayMap, vUv - vec2(0.0, uDayTexel.y)).rgb
    ) * 0.25;
    // A restrained unsharp pass restores coastlines, mountain chains and
    // vegetation boundaries softened by texture compression and globe scale.
    vec3 day = clamp(daySource + (daySource - dayNeighbours) * 0.84, 0.0, 1.2);
    vec3 normal = normalize(vWorldNormal);
    vec3 sunDirection = normalize(uSunDirection);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float sunlight = dot(normal, sunDirection);
    float terminator = smoothstep(-0.16, 0.2, sunlight);
    float nightMask = 1.0 - smoothstep(-0.12, 0.16, sunlight);
    float waterSource = texture2D(uWaterMap, vUv).r;
    float presentWaterMask = smoothstep(0.18, 0.72, waterSource);
    float reconstructionAmount = max(uPaleoStrength, uAncientCratons);
    float reconstructedLandMask = 1.0 - presentWaterMask;
    if (reconstructionAmount > 0.001) {
      float paleoLandMask = mix(texture2D(uPaleoMapA, vUv).a, texture2D(uPaleoMapB, vUv).a, uPaleoBlend);
      float cratonField = fbm(vUv * vec2(5.2, 2.6) + vec2(7.1, 2.4));
      float cratonRidges = fbm(vUv * vec2(11.0, 5.5) - vec2(2.6, 4.1));
      float ancientLandMask = smoothstep(0.56, 0.69, cratonField * 0.78 + cratonRidges * 0.3);
      reconstructedLandMask = mix(paleoLandMask, ancientLandMask, uAncientCratons);
    }
    float waterMask = mix(presentWaterMask, 1.0 - reconstructedLandMask, reconstructionAmount);
    float landMask = 1.0 - waterMask;
    float oceanLight = smoothstep(-0.2, 0.85, sunlight);
    vec3 oceanColor = mix(vec3(0.006, 0.026, 0.049), vec3(0.012, 0.092, 0.145), oceanLight);
    vec3 halfDirection = normalize(sunDirection + viewDirection);
    float oceanGlint = pow(max(0.0, dot(normal, halfDirection)), 72.0) * waterMask * step(0.0, sunlight);
    oceanColor += vec3(0.08, 0.18, 0.24) * oceanGlint * 0.38;
    // Keep a trace of the satellite map beneath the physically shaded ocean so
    // currents, shelves and shallow coastal water remain visible when zoomed in.
    vec3 mappedOcean = mix(day * vec3(0.34, 0.68, 0.88), oceanColor, 0.72);
    day = mix(day, mappedOcean, waterMask * 0.94 * uOcean);
    vec3 paleoSurface = day;
    if (reconstructionAmount > 0.001) {
      float paleoTerrain = fbm(vUv * vec2(36.0, 18.0) + vec2(uPaleoBlend * 2.1, 0.0));
      float paleoLatitude = abs(vLocalPosition.y);
      float paleoLowland = 1.0 - smoothstep(0.48, 0.82, paleoTerrain);
      float paleoHumidity = fbm(vUv * vec2(12.0, 6.0) - vec2(3.7, uPaleoBlend));
      vec3 paleoBareRock = mix(vec3(0.105, 0.095, 0.075), vec3(0.30, 0.25, 0.18), paleoTerrain);
      vec3 paleoVegetated = mix(vec3(0.042, 0.105, 0.064), vec3(0.19, 0.27, 0.12), paleoTerrain);
      float paleoVegetationCover = uVegetation
        * smoothstep(0.06, 0.72, 1.0 - paleoLatitude)
        * smoothstep(0.24, 0.68, paleoHumidity)
        * (0.62 + paleoLowland * 0.38);
      float paleoDesertBand = smoothstep(0.17, 0.31, paleoLatitude)
        * (1.0 - smoothstep(0.48, 0.64, paleoLatitude))
        * (1.0 - paleoHumidity * 0.72)
        * (1.0 - uVegetation * 0.46);
      vec3 paleoLand = mix(paleoBareRock, paleoVegetated, paleoVegetationCover);
      paleoLand = mix(paleoLand, vec3(0.34, 0.275, 0.17), paleoDesertBand * 0.38);
      vec3 paleoOcean = mix(vec3(0.002, 0.018, 0.045), vec3(0.008, 0.092, 0.15), oceanLight);
      paleoSurface = mix(paleoOcean, paleoLand, reconstructedLandMask);
      day = mix(day, paleoSurface, reconstructionAmount);
    }

    // In low-oxygen chapters the familiar greens are deliberately withdrawn.
    float luma = dot(day, vec3(0.299, 0.587, 0.114));
    vec3 mineralDay = mix(vec3(luma) * vec3(0.72, 0.76, 0.66), day, 0.28 + uVegetation * 0.72);
    mineralDay *= mix(vec3(0.78, 0.88, 0.82), vec3(1.0), uOxygen);
    float sourceLuma = dot(daySource, vec3(0.299, 0.587, 0.114));
    float neighbourLuma = dot(dayNeighbours, vec3(0.299, 0.587, 0.114));
    float terrainRelief = clamp((sourceLuma - neighbourLuma) * 4.8, -0.16, 0.16);
    float mineralGrain = noise(vUv * vec2(1180.0, 590.0));
    float terrainGrain = (mineralGrain - 0.5) * 0.055 * landMask;
    mineralDay *= 1.0 + terrainRelief * landMask + terrainGrain;
    // Preserve geographic legibility on the unlit hemisphere without flattening
    // it into a second daytime exposure. A cool, low floor carries coastlines,
    // mountain relief and ocean colour while the terminator keeps its contrast.
    vec3 nightTint = mix(vec3(0.15, 0.19, 0.25), vec3(0.2, 0.22, 0.255), landMask);
    vec3 naturalNight = mineralDay * nightTint;
    naturalNight += mix(vec3(0.012, 0.03, 0.052), vec3(0.022, 0.031, 0.043), landMask);
    naturalNight *= 1.0 + terrainRelief * landMask * 1.35;
    // Ancient continental silhouettes remain faintly legible under narrative
    // moonlight so plate motion can still be read when a reconstruction rotates
    // onto the astronomical night side.
    naturalNight += paleoSurface * reconstructionAmount * vec3(0.055, 0.07, 0.095);
    vec3 litDay = mineralDay * (0.58 + max(0.0, sunlight) * 0.78);
    float cloudShadow = smoothstep(
      0.28,
      0.78,
      dot(texture2D(uCloudMap, vUv + vec2(0.0018, -0.0012)).rgb, vec3(0.299, 0.587, 0.114))
    );
    litDay *= 1.0 - cloudShadow * smoothstep(-0.02, 0.42, sunlight) * 0.105;

    // Rebuild the source night texture as neutral-white human light. Four
    // neighbouring samples form a restrained ground-hugging aura; bloom only
    // catches the brightest cores. Historical development and true night still
    // gate the entire effect.
    vec3 cityEmission = vec3(0.0);
    if (uCityLights > 0.005) {
      vec3 night = texture2D(uNightMap, vUv).rgb;
      vec2 nightTexel = vec2(1.0 / 2048.0, 1.0 / 1024.0);
      float citySignal = cityLightSignal(night);
      float haloSignal = (
        cityLightSignal(texture2D(uNightMap, vUv + vec2(nightTexel.x * 2.0, 0.0)).rgb) +
        cityLightSignal(texture2D(uNightMap, vUv - vec2(nightTexel.x * 2.0, 0.0)).rgb) +
        cityLightSignal(texture2D(uNightMap, vUv + vec2(0.0, nightTexel.y * 2.0)).rgb) +
        cityLightSignal(texture2D(uNightMap, vUv - vec2(0.0, nightTexel.y * 2.0)).rgb)
      ) * 0.25;
      float cityCore = pow(smoothstep(0.022, 0.18, citySignal), 1.25) * landMask;
      float cityHeart = smoothstep(0.12, 0.23, citySignal) * landMask;
      float cityAura = smoothstep(0.009, 0.085, haloSignal) * landMask * (1.0 - cityHeart * 0.6);
      float districtSeed = hash(floor(vUv * vec2(720.0, 360.0)));
      float slowBreath = 0.985 + 0.015 * sin(uTime * 0.22 + districtSeed * 6.28318);
      float rareTwinkle = smoothstep(0.94, 0.995, districtSeed)
        * (0.45 + 0.55 * sin(uTime * 1.15 + districtSeed * 12.0));
      vec3 whiteLight = mix(vec3(0.88, 0.94, 1.0), vec3(1.0), cityHeart);
      cityEmission = (
        whiteLight * cityCore * (0.66 + cityHeart * 0.5) +
        vec3(0.78, 0.9, 1.0) * cityAura * 0.11 +
        vec3(1.0) * cityHeart * max(0.0, rareTwinkle) * 0.05
      ) * uCityLights * nightMask * slowBreath * 1.18;
    }
    vec3 color = mix(naturalNight, litDay, terminator) + cityEmission;

    // A global-scale terminator must not be painted red: at this distance the
    // thin warm tropospheric sunset layer is below a pixel. Retain only a faint,
    // neutral blue-grey softening so the transition reads as light, not a ring.
    float duskBand = smoothstep(-0.16, -0.035, sunlight) * (1.0 - smoothstep(0.015, 0.14, sunlight));
    color += vec3(0.025, 0.055, 0.072) * duskBand * uAtmosphere * 0.022;

    // Both conditions are uniform across the draw call, so modern-Earth frames can
    // skip the expensive procedural FBM paths without introducing fragment divergence.
    if (uMagma > 0.005) {
      float n = fbm(vUv * vec2(17.0, 8.5) + vec2(uTime * 0.004, 0.0));
      float micro = fbm(vUv * vec2(47.0, 23.5) - vec2(uTime * 0.007, 0.0));
      float fissure = smoothstep(0.59, 0.78, n * 0.82 + micro * 0.34);
      vec3 cooledRock = vec3(0.055, 0.033, 0.028);
      vec3 molten = mix(vec3(0.26, 0.038, 0.012), vec3(1.2, 0.24, 0.025), fissure);
      vec3 magmaSurface = mix(cooledRock, molten, 0.12 + fissure * 0.88);
      float magmaBlend = smoothstep(0.04, 0.62, uMagma) * (0.98 - uOcean * 0.16);
      color = mix(color, magmaSurface, magmaBlend);
    }

    if (uIce > 0.005) {
      float latitude = abs(vLocalPosition.y);
      float brokenIce = fbm(vUv * vec2(12.0, 6.0));
      float polarMask = smoothstep(0.26 - uIce * 0.42, 0.79 - uIce * 0.14, latitude + brokenIce * 0.18);
      float snowball = smoothstep(0.68, 0.9, uIce);
      float iceCoverage = mix(polarMask, max(polarMask, 0.86 + brokenIce * 0.12), snowball);
      vec3 iceColor = mix(vec3(0.58, 0.72, 0.78), vec3(0.91, 0.96, 0.96), max(0.0, sunlight));
      color = mix(color, iceColor, iceCoverage * min(1.0, uIce * 1.06));
    }

    float impactVeil = uImpact * (0.42 + 0.1 * sin(uTime * 1.7));
    color *= 1.0 - impactVeil * (1.0 - terminator * 0.2);
    color += vec3(0.2, 0.055, 0.012) * uImpact * smoothstep(-0.2, 0.8, sunlight);

    // Keep the subsolar reference point, but never draw a contour around the
    // terminator: on a globe that contour reads as an artificial laser line.
    float subsolarPoint = smoothstep(0.9975, 0.9997, sunlight);
    color += vec3(1.0, 0.7, 0.3) * subsolarPoint * uSolarOverlay * 0.28;

    float rim = pow(1.0 - max(0.0, dot(normal, viewDirection)), 3.0);
    color += vec3(0.08, 0.28, 0.38) * rim * uAtmosphere * 0.2;
    color += vec3(0.16, 0.25, 0.38) * rim * nightMask * uCityLights * 0.065;
    // Lift the mid-tones rather than washing the globe with a flat overlay.
    // This keeps deep space black while making land relief readable on both
    // sides of the terminator.
    color = color * 1.07 + vec3(0.004, 0.006, 0.009);
    gl_FragColor = vec4(color, 1.0 - uDiveHide);
  }
`

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

export const atmosphereFragmentShader = /* glsl */ `
  uniform float uStrength;
  uniform vec3 uColor;
  uniform vec3 uSunDirection;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float sunlight = dot(normal, normalize(uSunDirection));
    float fresnel = pow(1.0 - abs(dot(viewDirection, normal)), 2.8);
    float daySide = smoothstep(-0.08, 0.28, sunlight);
    float dusk = smoothstep(-0.16, -0.035, sunlight) * (1.0 - smoothstep(0.015, 0.14, sunlight));
    vec3 nightAir = vec3(0.045, 0.085, 0.16);
    vec3 atmosphereColor = mix(nightAir, uColor, daySide);
    atmosphereColor = mix(atmosphereColor, vec3(0.12, 0.24, 0.31), dusk * 0.08);
    float alpha = fresnel * (0.31 + daySide * 0.25 + dusk * 0.025) * uStrength;
    gl_FragColor = vec4(atmosphereColor, alpha);
  }
`
