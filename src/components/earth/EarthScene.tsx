import { PROJECT_NAME } from '../../brand'
import { OrbitControls, Stars, useProgress, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, lazy, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitController } from 'three/addons/controls/OrbitControls.js'
import type { DirectionalLight, Group, Mesh, ShaderMaterial } from 'three'
const ForceJourneyCamera = lazy(() => import('../../journey/force/JourneyCamera').then((module) => ({ default: module.JourneyCameraController })))
const ForceJourneyLayer = lazy(() => import('../../journey/force/JourneyLayer').then((module) => ({ default: module.JourneyLayer })))
const Baseline2026Camera = lazy(() => import('../../journey/baseline2026/JourneyCamera').then((module) => ({ default: module.Baseline2026Camera })))
const Baseline2026Layer = lazy(() => import('../../journey/baseline2026/JourneyLayer').then((module) => ({ default: module.Baseline2026Layer })))
const KoreaJourneyCamera = lazy(() => import('../../journey/korea/JourneyCamera').then((module) => ({ default: module.KoreaJourneyCamera })))
const KoreaJourneyLayer = lazy(() => import('../../journey/korea/JourneyLayer').then((module) => ({ default: module.KoreaJourneyLayer })))
const MobilizeJourneyCamera = lazy(() => import('../../journey/mobilize/JourneyCamera').then((module) => ({ default: module.MobilizeJourneyCamera })))
const MobilizeJourneyLayer = lazy(() => import('../../journey/mobilize/JourneyLayer').then((module) => ({ default: module.MobilizeJourneyLayer })))
const IndustryJourneyCamera = lazy(() => import('../../journey/industry/JourneyCamera').then((module) => ({ default: module.IndustryJourneyCamera })))
const IndustryJourneyLayer = lazy(() => import('../../journey/industry/JourneyLayer').then((module) => ({ default: module.IndustryJourneyLayer })))
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useExperience } from '../../store/experience'
const SpaceJourneyCamera = lazy(() => import('../../journey/space/JourneyScene').then((module) => ({ default: module.SpaceJourneyCamera })))
const SpaceJourneyLayer = lazy(() => import('../../journey/space/JourneyScene').then((module) => ({ default: module.SpaceJourneyLayer })))
import { useJourney } from '../../store/journey'
import { selectBaselineLocale, tri } from '../../journey/baseline2026/locale'
import type { EarthState } from '../../types'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'
import { planetGroupRef } from './planetApi'
import { solarStateUtc } from '../../utils/solar'
import { noonUtcForCursor } from '../../utils/time'
import { atmosphereFragmentShader, atmosphereVertexShader, earthFragmentShader, earthVertexShader } from './shaders'

const LazyPostEffects = lazy(() => import('./PostEffects').then((module) => ({ default: module.PostEffects })))

type RenderQuality = 'high' | 'balanced' | 'economy'

const detectInitialRenderQuality = (): RenderQuality => {
  if (typeof window === 'undefined') return 'high'
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency || 8
  const compactViewport = window.innerWidth < 900 || window.innerHeight < 620
  if (memory <= 4 || cores <= 4 || compactViewport) return 'economy'
  if (memory >= 8 && cores >= 12 && window.devicePixelRatio <= 2) return 'high'
  return 'balanced'
}

const INITIAL_WORLD_SUN_DIRECTION = new THREE.Vector3(-0.58, 0.28, -0.76).normalize()
const WORLD_UP = new THREE.Vector3(0, 1, 0)
const HOT_AIR = new THREE.Color('#b76a45')
const BLUE_AIR = new THREE.Color('#67d9ff')
const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const WARRING_STATES_EARTH: EarthState = {
  magma: 0,
  ocean: 1,
  oxygen: 1,
  ice: 0.12,
  vegetation: 1,
  impact: 0,
  cityLights: 0,
  atmosphere: 1,
}

const PRESENT_DAY_EARTH: EarthState = {
  magma: 0,
  ocean: 1,
  oxygen: 1,
  ice: 0.16,
  vegetation: 1,
  impact: 0,
  cityLights: 1,
  atmosphere: 1,
}

function createPaleoStub() {
  const texture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1)
  texture.needsUpdate = true
  return texture
}

function resolveSolarDate(utc?: string) {
  const date = new Date(utc ?? Date.now())
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function SolarEphemeris({ direction, utc, reducedMotion }: { direction: THREE.Vector3; utc?: string; reducedMotion: boolean }) {
  const target = useRef(solarStateUtc(resolveSolarDate(utc)).direction)
  const updateElapsed = useRef(0)

  useEffect(() => {
    const next = solarStateUtc(resolveSolarDate(utc)).direction
    target.current.copy(next)
    if (reducedMotion) direction.copy(next)
  }, [direction, reducedMotion, utc])

  useFrame((_, delta) => {
    if (!utc) {
      updateElapsed.current += delta
      if (updateElapsed.current >= 20) {
        updateElapsed.current = 0
        target.current.copy(solarStateUtc(new Date()).direction)
      }
    }
    if (reducedMotion) direction.copy(target.current)
    else direction.lerp(target.current, 1 - Math.exp(-delta * 1.8)).normalize()
  })

  return null
}

function SolarRig({ direction }: { direction: THREE.Vector3 }) {
  const light = useRef<DirectionalLight>(null)

  useFrame(() => {
    if (light.current) light.current.position.copy(direction).multiplyScalar(8)
  })

  return <directionalLight ref={light} position={[4, 1.8, 3.5]} intensity={2.5} color="#fff3dd" />
}

function Surface({ state, sunDirection, textureQuality }: {
  state: EarthState
  sunDirection: THREE.Vector3
  textureQuality: RenderQuality
}) {
  const [dayMap, nightMap, waterMap, cloudMap] = useTexture([
    publicAsset('textures/earth-day-4k.webp'),
    publicAsset('textures/earth-night.jpg'),
    publicAsset('textures/earth-specular.jpg'),
    publicAsset('textures/earth-clouds-2k.webp'),
  ])
  const { gl } = useThree()
  const paleoStub = useMemo(() => createPaleoStub(), [])
  const material = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uDayMap: { value: dayMap },
    uNightMap: { value: nightMap },
    uWaterMap: { value: waterMap },
    uCloudMap: { value: cloudMap },
    uPaleoMapA: { value: paleoStub },
    uPaleoMapB: { value: paleoStub },
    uDayTexel: { value: new THREE.Vector2(1 / 4096, 1 / 2048) },
    uSunDirection: { value: sunDirection },
    uTime: { value: 0 },
    uMagma: { value: 0 },
    uOcean: { value: 1 },
    uOxygen: { value: 1 },
    uIce: { value: 0 },
    uVegetation: { value: 1 },
    uImpact: { value: 0 },
    uCityLights: { value: 0 },
    uAtmosphere: { value: 1 },
    uDiveHide: { value: 0 },
    uSolarOverlay: { value: 0 },
    uPaleoBlend: { value: 0 },
    uPaleoStrength: { value: 0 },
    uAncientCratons: { value: 0 },
  }), [cloudMap, dayMap, nightMap, paleoStub, sunDirection, waterMap])

  useEffect(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace
    nightMap.colorSpace = THREE.SRGBColorSpace
    const anisotropy = Math.min(textureQuality === 'economy' ? 8 : 16, gl.capabilities.getMaxAnisotropy())
    for (const texture of [dayMap, nightMap, waterMap, cloudMap]) {
      texture.anisotropy = anisotropy
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true
    }
    const image = dayMap.image as { width?: number; height?: number } | undefined
    const width = image?.width || 4096
    const height = image?.height || 2048
    uniforms.uDayTexel.value.set(1 / width, 1 / height)
  }, [cloudMap, dayMap, gl, nightMap, textureQuality, uniforms, waterMap])

  useFrame(({ clock }) => {
    if (!material.current) return
    const next = material.current.uniforms
    const blend = (current: number, target: number, amount: number) => THREE.MathUtils.lerp(current, target, amount)
    next.uTime.value = clock.elapsedTime
    next.uMagma.value = blend(next.uMagma.value as number, state.magma, 0.035)
    next.uOcean.value = blend(next.uOcean.value as number, state.ocean, 0.035)
    next.uOxygen.value = blend(next.uOxygen.value as number, state.oxygen, 0.035)
    next.uIce.value = blend(next.uIce.value as number, state.ice, 0.035)
    next.uVegetation.value = blend(next.uVegetation.value as number, state.vegetation, 0.035)
    next.uImpact.value = blend(next.uImpact.value as number, state.impact, 0.055)
    next.uCityLights.value = blend(next.uCityLights.value as number, state.cityLights, 0.035)
    const diveHide = THREE.MathUtils.smoothstep(useJourney.getState().diveProgress, 0.02, 0.18)
    next.uAtmosphere.value = blend(next.uAtmosphere.value as number, state.atmosphere * (1 - diveHide), 0.06)
    const globeHide = THREE.MathUtils.smoothstep(useJourney.getState().diveProgress, 0.86, 0.93)
    next.uDiveHide.value = blend(next.uDiveHide.value as number, globeHide, 0.18)
    material.current.transparent = globeHide > 0.02
    material.current.depthWrite = globeHide < 0.92
    material.current.visible = (next.uDiveHide.value as number) < 0.995
    next.uPaleoBlend.value = 0
    next.uPaleoStrength.value = 0
    next.uAncientCratons.value = 0
  })

  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, textureQuality === 'high' ? 128 : textureQuality === 'balanced' ? 112 : 96, textureQuality === 'economy' ? 72 : 96]} />
      <shaderMaterial
        ref={material}
        vertexShader={earthVertexShader}
        fragmentShader={earthFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function Clouds({ state, renderQuality }: { state: EarthState; renderQuality: RenderQuality }) {
  const cloudMap = useTexture(publicAsset('textures/earth-clouds-2k.webp'))
  const cloudRef = useRef<Mesh>(null)
  const reducedMotion = useReducedMotion()
  const diveProgress = useJourney((store) => store.diveProgress)

  useFrame((_, delta) => {
    if (!cloudRef.current || reducedMotion) return
    cloudRef.current.rotation.y += delta * 0.008
  })

  return (
    <mesh ref={cloudRef} scale={1.009}>
      <sphereGeometry args={[EARTH_RADIUS, renderQuality === 'economy' ? 48 : 64, renderQuality === 'economy' ? 32 : 64]} />
      <meshLambertMaterial
        map={cloudMap}
        color="#dff8ff"
        transparent
        opacity={(0.06 + state.ocean * 0.2) * (1 - state.magma * 0.88) * (1 - state.impact * 0.6) * (1 - Math.min(1, diveProgress * 1.15))}
        depthWrite={false}
      />
    </mesh>
  )
}

function Atmosphere({ strength, magma, sunDirection, renderQuality }: {
  strength: number
  magma: number
  sunDirection: THREE.Vector3
  renderQuality: RenderQuality
}) {
  const material = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uStrength: { value: 0 },
    uColor: { value: new THREE.Color('#67d9ff') },
    uSunDirection: { value: sunDirection },
  }), [sunDirection])

  useFrame(() => {
    if (!material.current) return
    const hide = THREE.MathUtils.smoothstep(useJourney.getState().diveProgress, 0.02, 0.16)
    const target = strength * (1 - hide)
    material.current.uniforms.uStrength.value = THREE.MathUtils.lerp(material.current.uniforms.uStrength.value as number, target, 0.08)
    ;(material.current.uniforms.uColor.value as THREE.Color).lerpColors(HOT_AIR, BLUE_AIR, 1 - magma)
  })

  return (
    <mesh scale={1.075}>
      <sphereGeometry args={[EARTH_RADIUS, renderQuality === 'economy' ? 48 : 64, renderQuality === 'economy' ? 32 : 64]} />
      <shaderMaterial
        ref={material}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}


function ActiveJourneyLayer() {
  const activeJourney = useJourney((store) => store.activeJourney)
  return (
    <Suspense fallback={null}>
      {activeJourney === 'force' ? <ForceJourneyLayer />
        : activeJourney === 'baseline2026' ? <Baseline2026Layer />
        : activeJourney === 'korea' ? <KoreaJourneyLayer />
        : activeJourney === 'mobilize' ? <MobilizeJourneyLayer />
        : activeJourney === 'industry' ? <IndustryJourneyLayer />
        : activeJourney === 'space' ? <SpaceJourneyLayer />
        : null}
    </Suspense>
  )
}

// Guide cameras unmount on exit, so the entrance owns its own orbital pose.
function HubCamera() {
  const { camera, get } = useThree()
  useLayoutEffect(() => {
    const view = camera as THREE.PerspectiveCamera
    view.position.set(0.15, 0.1, 4.25)
    view.up.set(0, 1, 0)
    view.fov = 61
    view.near = 0.01
    view.lookAt(0, 0, 0)
    view.updateProjectionMatrix()
    const orbit = get().controls as OrbitController | null
    orbit?.target.set(0, 0, 0)
    orbit?.update()
    return () => {
      // All guide cameras expect the original canvas lens on entry.
      view.fov = 38
      view.updateProjectionMatrix()
    }
  }, [camera, get])
  return null
}

function ActiveJourneyCamera() {
  const activeJourney = useJourney((store) => store.activeJourney)
  return (
    <Suspense fallback={null}>
      {activeJourney === 'force' ? <ForceJourneyCamera />
        : activeJourney === 'baseline2026' ? <Baseline2026Camera />
        : activeJourney === 'korea' ? <KoreaJourneyCamera />
        : activeJourney === 'mobilize' ? <MobilizeJourneyCamera />
        : activeJourney === 'industry' ? <IndustryJourneyCamera />
        : activeJourney === 'space' ? <SpaceJourneyCamera />
        : <HubCamera />}
    </Suspense>
  )
}

function Planet({
  state,
  focus,
  localSunDirection,
  worldSunDirection,
  renderQuality,
  textureQuality,
}: {
  state: EarthState
  focus?: { lat: number; lon: number }
  localSunDirection: THREE.Vector3
  worldSunDirection: THREE.Vector3
  renderQuality: RenderQuality
  textureQuality: RenderQuality
}) {
  const group = useRef<Group>(null)
  const targetQuaternion = useRef<THREE.Quaternion | null>(null)
  const { camera } = useThree()
  const reducedMotion = useReducedMotion()
  const focusLocked = Boolean(focus)
  // The baseline2026 and space guides apply a north-up twist after
  // setFromUnitVectors. Chapter I / korea / mobilize / industry keep the
  // historical facing quaternion (roll unconstrained). Documented in
  // src/journey/baseline2026/MERGE.md.
  const activeJourney = useJourney((store) => store.activeJourney)

  useEffect(() => {
    if (!group.current || !focus) {
      targetQuaternion.current = null
      return
    }
    const current = group.current.quaternion.clone()
    const localNormal = latLngToVector3(focus.lat, focus.lon, 1).normalize()
    const worldNormal = localNormal.clone().applyQuaternion(current).normalize()
    const cameraDirection = camera.position.clone().normalize()
    const delta = new THREE.Quaternion().setFromUnitVectors(worldNormal, cameraDirection)
    const facing = delta.multiply(current)
    if (activeJourney !== 'baseline2026' && activeJourney !== 'space') {
      targetQuaternion.current = facing
      return
    }
    // Twist around the view axis so geographic north at the focus lines
    // up with world +Y in the view plane. Combined with Baseline2026Camera
    // setting camera.up to the same tangent, a west–east formation is
    // a horizontal line and south is screen-down.
    const localPole = latLngToVector3(Math.min(89.5, focus.lat + 0.5), focus.lon, 1).normalize()
    const worldPole = localPole.applyQuaternion(facing)
    const tangentNorth = worldPole.addScaledVector(cameraDirection, -worldPole.dot(cameraDirection))
    const desiredUp = WORLD_UP.clone().addScaledVector(cameraDirection, -WORLD_UP.dot(cameraDirection))
    if (tangentNorth.lengthSq() > 1e-8 && desiredUp.lengthSq() > 1e-8) {
      const twist = new THREE.Quaternion().setFromUnitVectors(tangentNorth.normalize(), desiredUp.normalize())
      targetQuaternion.current = twist.multiply(facing)
    } else {
      targetQuaternion.current = facing
    }
  }, [activeJourney, camera, focus?.lat, focus?.lon])

  useFrame((_, delta) => {
    if (!group.current) return
    planetGroupRef.current = group.current
    if (targetQuaternion.current) {
      group.current.quaternion.slerp(targetQuaternion.current, reducedMotion ? 1 : Math.min(1, delta * 1.55))
      if (group.current.quaternion.angleTo(targetQuaternion.current) < 0.0015) targetQuaternion.current = null
    } else if (!focusLocked && !reducedMotion) {
      group.current.rotateOnWorldAxis(WORLD_UP, delta * 0.032)
    }
    worldSunDirection.copy(localSunDirection).applyQuaternion(group.current.quaternion).normalize()
  })

  return (
    <group ref={group} rotation={[0, 2.45, THREE.MathUtils.degToRad(-4)]}>
      <Surface state={state} sunDirection={worldSunDirection} textureQuality={textureQuality} />
      <Clouds state={state} renderQuality={renderQuality} />
      <Atmosphere strength={state.atmosphere} magma={state.magma} sunDirection={worldSunDirection} renderQuality={renderQuality} />
      <ActiveJourneyLayer />
    </group>
  )
}

const ORBIT_BG = new THREE.Color('#02050a')
const DIVE_BG = new THREE.Color('#8c96a0')
const DIVE_FOG = new THREE.Color('#b5a888')
const _bgMix = new THREE.Color()

function DiveAtmosphere() {
  const { scene } = useThree()
  useFrame(() => {
    const t = THREE.MathUtils.smoothstep(useJourney.getState().diveProgress, 0.78, 0.915)
    _bgMix.copy(ORBIT_BG).lerp(DIVE_BG, t)
    if (scene.background instanceof THREE.Color) scene.background.copy(_bgMix)
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(ORBIT_BG).lerp(DIVE_FOG, t)
      scene.fog.near = THREE.MathUtils.lerp(7, 0.08, t)
      scene.fog.far = THREE.MathUtils.lerp(14, 0.62, t)
    }
  })
  return null
}

function Scene({
  state,
  focus,
  skyUtc,
  renderQuality,
  textureQuality,
}: {
  state: EarthState
  focus?: { lat: number; lon: number }
  skyUtc?: string
  renderQuality: RenderQuality
  textureQuality: RenderQuality
}) {
  const reducedMotion = useReducedMotion()
  const diveProgress = useJourney((store) => store.diveProgress)
  const activeJourney = useJourney((store) => store.activeJourney)
  const journeyFocus = useJourney((store) => store.focus)
  // baseline2026 review sea shots look at the formation, not the Earth origin,
  // and stand closer than the default 1.72 minDistance. Guarded: other journeys
  // keep the historical OrbitControls contract. Documented in baseline2026/MERGE.md.
  const seaLook = activeJourney === 'baseline2026' && Boolean(journeyFocus?.look)
  const [localSunDirection] = useState(() => solarStateUtc(resolveSolarDate(skyUtc)).direction.clone())
  const [worldSunDirection] = useState(() => INITIAL_WORLD_SUN_DIRECTION.clone())

  return (
    <>
      <color attach="background" args={['#02050a']} />
      <fog attach="fog" args={['#02050a', 7, 14]} />
      <DiveAtmosphere />
      <ambientLight intensity={0.12} color="#789ba8" />
      <group visible={diveProgress < 0.82}>
      <Stars
        radius={22}
        depth={26}
        count={renderQuality === 'economy' ? 760 : 1300}
        factor={2.2}
        saturation={0.08}
        fade={!reducedMotion}
        speed={reducedMotion ? 0 : 0.08}
      />
      </group>
      <SolarEphemeris direction={localSunDirection} utc={skyUtc} reducedMotion={reducedMotion} />
      <Planet
        state={state}
        focus={focus}
        localSunDirection={localSunDirection}
        worldSunDirection={worldSunDirection}
        renderQuality={renderQuality}
        textureQuality={textureQuality}
      />
      <SolarRig direction={worldSunDirection} />
      <ActiveJourneyCamera />
      <OrbitControls
        makeDefault
        enabled={!seaLook}
        enablePan={false}
        enableDamping={!seaLook}
        dampingFactor={0.045}
        target={[0, 0, 0]}
        minDistance={diveProgress > 0.05 || seaLook ? 0.003 : 1.72}
        maxDistance={9.5}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        rotateSpeed={0.34}
        zoomSpeed={0.72}
        zoomToCursor={false}
      />
      {renderQuality !== 'economy' && (
        <Suspense fallback={null}>
          <LazyPostEffects />
        </Suspense>
      )}
    </>
  )
}

type EarthCanvasProps = {
  focus?: { lat: number; lon: number }
  journeyActive: boolean
}

export const EarthCanvas = memo(function EarthCanvas({ focus, journeyActive }: EarthCanvasProps) {
  const baselineLocale = useJourney((state) => state.activeJourney === 'baseline2026' ? selectBaselineLocale(state) : 'en')
  const renderQuality = useRef(detectInitialRenderQuality()).current
  const textureQuality = renderQuality
  const calendarCursor = useExperience((store) => store.calendarCursor)
  const calendarModel = useExperience((store) => store.calendarModel)
  const activeJourney = useJourney((store) => store.activeJourney)
  const skyUtc = useMemo(() => {
    if (!journeyActive) return undefined
    return noonUtcForCursor(calendarCursor, calendarModel)?.toISOString()
  }, [calendarCursor, calendarModel, journeyActive])
  // Chapter I keeps city lights off (Warring States Earth). The 2026 baseline, Korea (1950–1953), mobilize, and industry journeys use present-day Earth with lights on.
  const state = activeJourney === 'force' ? WARRING_STATES_EARTH : PRESENT_DAY_EARTH

  const dpr = useMemo<[number, number]>(() => renderQuality === 'high'
    ? [1, 1.25]
    : renderQuality === 'balanced'
      ? [0.9, 1.1]
      : [0.75, 1], [renderQuality])
  const cameraConfig = useMemo(() => ({
    position: [0.15, 0.1, 4.25] as [number, number, number],
    fov: 38,
    near: 0.01,
    far: 80,
  }), [])
  const glConfig = useMemo(() => ({
    antialias: textureQuality !== 'economy',
    alpha: false,
    powerPreference: 'high-performance' as const,
    stencil: false,
  }), [textureQuality])

  return (
    <div
      className="earth-canvas"
      data-render-quality={renderQuality}
      role="img"
      aria-label={activeJourney === 'space'
        ? 'Interactive Earth showing regions from the science and spaceflight guide'
        : activeJourney === 'korea'
        ? 'Interactive 3D Earth focused on the Korean Peninsula, 1950–1953, with present-day lighting'
        : activeJourney === 'baseline2026'
          ? tri(baselineLocale, '可交互三维地球：基于公开资料的 2026 军力基线', 'Interactive 3D Earth showing a 2026 public military baseline, with present-day city lights', '操作できる三次元地球儀：公開資料に基づく2026年の軍事力基準')
          : activeJourney === 'mobilize'
            ? 'Interactive 3D Earth showing typological disaster-response and mobilization routes in China, with present-day city lights'
            : activeJourney === 'industry'
              ? 'Interactive 3D Earth showing how industry sustains military power, with present-day city lights'
              : activeJourney === 'force'
              ? 'Interactive 3D Earth focused on the Warring States, with day-night lighting for the chapter date'
              : 'Interactive 3D Earth; drag to rotate, scroll to zoom'}
    >
      <Canvas dpr={dpr} camera={cameraConfig} gl={glConfig}>
        <Suspense fallback={null}>
          <Scene
            state={state}
            focus={focus}
            skyUtc={skyUtc}
            renderQuality={renderQuality}
            textureQuality={textureQuality}
          />
        </Suspense>
      </Canvas>
      {journeyActive && <TextureLoadingVeil />}
      <div className="canvas-noise" aria-hidden="true" />
    </div>
  )
})

function TextureLoadingCopy() {
  const language = useJourney((store) => store.language)
  const activeJourney = useJourney((store) => store.activeJourney)
  if (activeJourney === 'space') {
    return (
      <>
        <small>{PROJECT_NAME[language]}  ·  {language === 'zh' ? '科研航天' : 'Science & spaceflight'}</small>
        <strong>{language === 'zh' ? '地球载入中' : 'Loading the globe'}</strong>
      </>
    )
  }
  if (activeJourney === 'korea') {
    return (
      <>
        <small>{PROJECT_NAME[language]}  ·  抗美援朝</small>
        <strong>地球载入中</strong>
      </>
    )
  }
  if (activeJourney === 'baseline2026') {
    return (
      <>
        <small>{PROJECT_NAME[language]}  ·  2026 BASELINE</small>
        <strong>地球载入中</strong>
      </>
    )
  }
  if (activeJourney === 'mobilize') {
    return (
      <>
        <small>{PROJECT_NAME[language]}  ·  灾难应对与动员</small>
        <strong>地球载入中</strong>
      </>
    )
  }
  if (activeJourney === 'industry') {
    return (
      <>
        <small>{PROJECT_NAME[language]}  ·  底盘</small>
        <strong>地球载入中</strong>
      </>
    )
  }
  return (
    <>
      <small>{PROJECT_NAME[language]}  ·  CHAPTER I</small>
      <strong>地球载入中</strong>
    </>
  )
}

function TextureLoadingVeil() {
  const { active, progress } = useProgress()
  if (!active && progress >= 100) return null
  return (
    <div className="loading-veil" role="status">
      <TextureLoadingCopy />
      <span>Loading the globe…  {Math.round(progress)}%</span>
    </div>
  )
}
