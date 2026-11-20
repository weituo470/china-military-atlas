import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls } from 'three-stdlib'
import { worldSurfaceNormal, worldSurfacePoint } from '../../components/earth/planetApi'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { readNarrationClock, useNarration } from '../../store/narration'
import { EARTH_RADIUS } from '../../utils/geo'
import type { JourneyFocus } from '../types'
import { BATTLE_SURFACE_LIFT, groundHeight } from './battleTerrain'

/**
 * Flies the existing Earth camera along its current radial offset to a beat distance,
 * or, when a beat asks for a dive, keeps pushing in until a typological battlefield
 * fills the frame. Does not add a second renderer.
 */

const ORBIT_RATE = 1.15
const SWING_SECONDS = 5.2
const PULL_SECONDS = 7.8
const BASE_FOV = 38
const WORLD_UP = new THREE.Vector3(0, 1, 0)
const WORLD_ORIGIN = new THREE.Vector3()

const DIVE_SECONDS = 18

const _normal = new THREE.Vector3()
const _northPole = new THREE.Vector3()
const _north = new THREE.Vector3()
const _east = new THREE.Vector3()
const _surface = new THREE.Vector3()
const _orbitPos = new THREE.Vector3()
const _divePos = new THREE.Vector3()
const _diveTarget = new THREE.Vector3()
const _revealPos = new THREE.Vector3()
const _revealTarget = new THREE.Vector3()
const _look = new THREE.Vector3()
const _fromPos = new THREE.Vector3()
const _fromLook = new THREE.Vector3()
const _camUp = new THREE.Vector3()

function applyLeveledLook(camera: THREE.Camera, target: THREE.Vector3, close: number) {
  const blend = THREE.MathUtils.smoothstep(close, 0.12, 0.72)
  _camUp.copy(WORLD_UP).lerp(_normal, blend)
  if (_camUp.lengthSq() < 1e-8) _camUp.copy(WORLD_UP)
  else _camUp.normalize()
  camera.up.copy(_camUp)
  camera.lookAt(target)
}

function applyWorldLook(camera: THREE.Camera, target: THREE.Vector3) {
  camera.up.copy(WORLD_UP)
  camera.lookAt(target)
}

function shouldDive(focus: JourneyFocus | null, beatIndex: number, paragraphIndex: number, status: string, reducedMotion: boolean) {
  if (!focus?.dive) return false
  // Silent reading keeps its paper and map. The narration leads the cinematic.
  if (status !== 'playing' && status !== 'paused') return false
  if (beatIndex === 0 && reducedMotion) return paragraphIndex === 1
  return beatIndex !== 0 || paragraphIndex <= 1
}

/** Hold on the globe, then a long descent, then a soft settle. t is raw 0–1 clock. */
function easeDive(t: number, hold = 0.12) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  if (x < hold) return 0
  const startEnd = hold + 0.08
  if (x < startEnd) {
    const u = (x - hold) / 0.08
    return 0.04 * (u * u * (3 - 2 * u))
  }
  // Reach most of the descent by 0.72 of the clock so the field can fill mid-narration.
  const midEnd = 0.72
  if (x < midEnd) {
    const u = (x - startEnd) / (midEnd - startEnd)
    return 0.04 + Math.pow(u, 0.82) * 0.84
  }
  const u = (x - midEnd) / (1 - midEnd)
  const s = u * u * (3 - 2 * u)
  return 0.88 + s * 0.12
}

/** Dolly along the dive path by remaining distance, not a linear world lerp. */
function lerpDivePath(start: THREE.Vector3, end: THREE.Vector3, t: number, out: THREE.Vector3) {
  const clamped = THREE.MathUtils.clamp(t, 0, 1)
  if (clamped >= 1) {
    out.copy(end)
    return out
  }
  const d0 = Math.max(1e-4, start.distanceTo(end))
  const remaining = d0 * Math.pow(1 - clamped, 2.7)
  const u = 1 - remaining / d0
  out.copy(start).lerp(end, u)
  return out
}

/** 0 in orbit, 1 when the camera has settled over the field. Based on real distance. */
function closenessToDive(position: THREE.Vector3, divePos: THREE.Vector3) {
  const d = position.distanceTo(divePos)
  return 1 - THREE.MathUtils.smoothstep(d, 0.045, 1.55)
}

function easePull(t: number) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return 1 - Math.pow(1 - x, 2.15)
}

function easeSwing(t: number) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

function composeOrbit(focus: JourneyFocus, out: THREE.Vector3) {
  worldSurfaceNormal(focus.lat, focus.lon, _normal)
  // Keep the camera on the current radial if it already almost faces the site,
  // so the planet's own turn can finish without the camera sliding sideways.
  return out.copy(_normal).multiplyScalar(focus.distance)
}

function readSurfaceBasis(focus: JourneyFocus) {
  worldSurfaceNormal(focus.lat, focus.lon, _normal)
  worldSurfacePoint(focus.lat, focus.lon, EARTH_RADIUS, _surface)
  worldSurfaceNormal(Math.min(89, focus.lat + 0.35), focus.lon, _northPole)
  _north.copy(_northPole).addScaledVector(_normal, -_northPole.dot(_normal)).normalize()
  if (_north.lengthSq() < 1e-8) {
    _east.crossVectors(WORLD_UP, _normal).normalize()
    _north.crossVectors(_normal, _east).normalize()
  } else {
    _east.crossVectors(_normal, _north).normalize()
  }
}

function composeDivePose(focus: JourneyFocus, phase: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  const dive = focus.dive
  if (!dive) {
    composeOrbit(focus, outPos)
    outTarget.set(0, 0, 0)
    return
  }
  readSurfaceBasis(focus)
  const u = THREE.MathUtils.clamp(phase, 0, 1)
  const settleBack = dive.back ?? 0.028
  const settlePitch = dive.pitch ?? 0.36
  const revealAltitude = dive.revealAltitude ?? dive.altitude * 4.6
  const revealPitch = dive.revealPitch ?? Math.min(0.62, settlePitch * 1.45)
  const revealBack = dive.revealBack ?? settleBack * 2.2
  const altitude = THREE.MathUtils.lerp(revealAltitude, dive.altitude, u)
  const back = THREE.MathUtils.lerp(revealBack, settleBack, u)
  const pitch = THREE.MathUtils.lerp(revealPitch, settlePitch, u)
  // pitch 1 = almost nadir (short back), pitch 0 = more oblique.
  const backUse = back * (1.15 - pitch * 0.7)
  const settleLook = dive.look ?? backUse * 0.45
  const revealLook = dive.revealLook ?? settleLook * 1.7
  const look = THREE.MathUtils.lerp(revealLook, settleLook, u)
  const settleEast = dive.east ?? 0
  const revealEast = dive.revealEast ?? settleEast * 0.35
  const eastUse = THREE.MathUtils.lerp(revealEast, settleEast, u)
  const settleNorth = dive.north ?? 0
  const revealNorth = dive.revealNorth ?? settleNorth
  const northUse = THREE.MathUtils.lerp(revealNorth, settleNorth, u)
  outPos.copy(_surface).addScaledVector(_normal, altitude + 0.002).addScaledVector(_north, -backUse + northUse).addScaledVector(_east, eastUse)
  outTarget.copy(_surface).addScaledVector(_normal, 0.0024).addScaledVector(_north, look + northUse).addScaledVector(_east, eastUse * 0.2)
}

function composeDive(focus: JourneyFocus, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  composeDivePose(focus, 1, outPos, outTarget)
}

/** Hook-only framing: read the whole host first, then look across the south end
 * of the contact line. Coordinates are on the same tangent plane as the army. */
function composeHookShot(
  focus: JourneyFocus, shot: 'host' | 'front', camera: THREE.Vector3, target: THREE.Vector3, truck = 0,
) {
  readSurfaceBasis(focus)
  const point = (out: THREE.Vector3, x: number, z: number, clearance: number) => {
    out.copy(_surface)
      .addScaledVector(_east, x)
      .addScaledVector(_north, z)
      .addScaledVector(_normal, BATTLE_SURFACE_LIFT + groundHeight(x, z) + clearance)
  }
  if (shot === 'host') {
    point(camera, 0.014, -0.22, 0.44)
    point(target, 0, 0.168, 0)
  } else {
    point(camera, 0.0128 - truck * 0.0008, 0.0055 + truck * 0.0015, 0.006)
    point(target, 0.0038, 0.025 + truck * 0.001, 0.00115)
  }
}

function hookShotClock() {
  const { clip, currentTime } = readNarrationClock()
  const p0 = clip?.paragraphs[0]
  const p1 = clip?.paragraphs[1]
  const start = p0?.end ?? 11.57
  const contactStart = p1?.start ?? 12.72
  const contactEnd = p1?.end ?? 33.45
  const span = Math.max(1, contactEnd - contactStart)
  return {
    fromGlobe: THREE.MathUtils.smoothstep(currentTime, start, contactStart + 0.36 * span),
    toFront: THREE.MathUtils.smoothstep(currentTime, contactStart + 0.53 * span, contactStart + 0.8 * span),
    truck: THREE.MathUtils.smoothstep(currentTime, contactStart + 0.8 * span, contactEnd + 1),
  }
}


type Flight = {
  kind: 'idle' | 'orbit' | 'swing' | 'dive' | 'linger' | 'pull'
  startedAt: number
  duration: number
  fromDistance: number
}

export function JourneyCameraController() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const language = useJourney((store) => store.language)
  const focus = useJourney((store) => store.focus)
  const cameraNonce = useJourney((store) => store.cameraNonce)
  const beatIndex = useJourney((store) => store.beatIndex)
  const restoreCamera = useJourney((store) => store.restoreCamera)
  const captureCameraPosition = useJourney((store) => store.captureCameraPosition)
  const setDiveProgress = useJourney((store) => store.setDiveProgress)
  const paragraphIndex = useNarration((store) => store.paragraphIndex)
  const narrationStatus = useNarration((store) => store.status)
  const pausedAtStart = useNarration((store) => store.status === 'paused' && store.currentTime < 0.01)
  // The player preserves pause when a different beat is selected, but the new
  // beat's paper must not be hidden by the previous beat's frozen camera.
  const reading = pausedAtStart || language !== 'zh'
  const { camera, controls } = useThree()
  const reducedMotion = useReducedMotion()
  const orbitTarget = useRef<THREE.Vector3 | null>(null)
  const entered = useRef(false)
  const lookAt = useRef(new THREE.Vector3())
  const flight = useRef<Flight>({ kind: 'idle', startedAt: 0, duration: 1, fromDistance: 4.25 })
  const wasDiving = useRef(false)
  const lastNonce = useRef(-1)
  const lastShould = useRef(false)
  const lastDivePos = useRef(new THREE.Vector3())

  useEffect(() => {
    if (activeJourney && !entered.current) {
      entered.current = true
      captureCameraPosition(camera.position.toArray() as [number, number, number])
    }
    if (!activeJourney && entered.current) {
      entered.current = false
      flight.current.kind = 'idle'
      setDiveProgress(0)
      if (restoreCamera) {
        const restored = new THREE.Vector3(...restoreCamera)
        if (reducedMotion) {
          camera.position.copy(restored)
          camera.lookAt(0, 0, 0)
          lookAt.current.set(0, 0, 0)
          camera.updateProjectionMatrix()
          orbitTarget.current = null
        } else {
          orbitTarget.current = restored
        }
      }
    }
  }, [activeJourney, camera, captureCameraPosition, reducedMotion, restoreCamera, setDiveProgress])

  useEffect(() => {
    if (!activeJourney || !focus) return
    const diving = !reading && shouldDive(focus, beatIndex, paragraphIndex, narrationStatus, reducedMotion)
    const nonceChanged = lastNonce.current !== cameraNonce
    const diveToggled = lastShould.current !== diving
    lastNonce.current = cameraNonce
    lastShould.current = diving

    if (!nonceChanged && !diveToggled) return

    const now = performance.now()
    const currentDistance = camera.position.length()
    if (diving) {
      worldSurfaceNormal(focus.lat, focus.lon, _normal)
      const angle = camera.position.clone().normalize().angleTo(_normal)
      const needsSwing = beatIndex !== 0 && angle > 0.32
      if (reducedMotion) {
        if (beatIndex === 0) composeHookShot(focus, 'front', camera.position, lookAt.current)
        else composeDive(focus, camera.position, lookAt.current)
        applyLens(camera, 1)
        applyLeveledLook(camera, lookAt.current, 1)
        flight.current = { kind: 'idle', startedAt: now, duration: 1, fromDistance: currentDistance }
        wasDiving.current = true
        setDiveProgress(1)
        orbitTarget.current = null
        return
      }
      flight.current = {
        kind: needsSwing ? 'swing' : 'dive',
        startedAt: now,
        duration: needsSwing ? SWING_SECONDS : DIVE_SECONDS,
        fromDistance: currentDistance,
      }
      _fromPos.copy(camera.position)
      _fromLook.copy(lookAt.current)
      wasDiving.current = true
      orbitTarget.current = null
      return
    }

    composeOrbit(focus, _orbitPos)
    if (wasDiving.current && !reducedMotion && !reading) {
      flight.current = {
        kind: 'pull',
        startedAt: now,
        duration: PULL_SECONDS,
        fromDistance: currentDistance,
      }
      _fromPos.copy(camera.position)
      _fromLook.copy(lookAt.current)
      wasDiving.current = false
      orbitTarget.current = null
      return
    }
    wasDiving.current = false
    flight.current = { kind: 'idle', startedAt: now, duration: 1, fromDistance: currentDistance }
    if (reducedMotion || reading) {
      camera.position.copy(_orbitPos)
      lookAt.current.set(0, 0, 0)
      applyWorldLook(camera, lookAt.current)
      camera.near = 0.01
      camera.updateProjectionMatrix()
      orbitTarget.current = null
      setDiveProgress(0)
    } else {
      orbitTarget.current = _orbitPos.clone()
      setDiveProgress(0)
    }
  }, [activeJourney, beatIndex, camera, cameraNonce, focus, narrationStatus, paragraphIndex, reading, reducedMotion, setDiveProgress])

  useFrame((_, delta) => {
    const orbitControls = controls as OrbitControls | undefined
    const flying = flight.current.kind !== 'idle' || Boolean(orbitTarget.current)
    const progressNow = useJourney.getState().diveProgress

    if (orbitControls) {
      orbitControls.enabled = !flying && progressNow < 0.05 && Boolean(activeJourney)
      // During a journey flight the script owns the camera; after it settles, gentle orbit is allowed again.
      if (!activeJourney) {
        orbitControls.enabled = true
        orbitControls.minDistance = 1.72
      } else if (flying || progressNow > 0.05) {
        orbitControls.enabled = false
        orbitControls.minDistance = 0.003
      } else {
        orbitControls.minDistance = 1.72
      }
    }

    if (!activeJourney) {
      if (orbitTarget.current) {
        camera.position.lerp(orbitTarget.current, 1 - Math.exp(-delta * ORBIT_RATE))
        camera.lookAt(0, 0, 0)
        if (camera.position.distanceToSquared(orbitTarget.current) < 0.00002) {
          camera.position.copy(orbitTarget.current)
          camera.lookAt(0, 0, 0)
          orbitTarget.current = null
        }
      }
      return
    }

    if (!focus) return

    const now = performance.now()
    const fl = flight.current
    if (narrationStatus === 'paused' && (fl.kind === 'dive' || fl.kind === 'swing' || fl.kind === 'pull' || fl.kind === 'linger')) {
      fl.startedAt += delta * 1000
      syncControls(orbitControls, lookAt.current)
      return
    }
    const tRaw = (now - fl.startedAt) / Math.max(0.016, fl.duration * 1000)

    if (fl.kind === 'swing' && focus.dive) {
      const t = easeSwing(tRaw)
      composeOrbit(focus, _orbitPos)
      camera.position.lerpVectors(_fromPos, _orbitPos, t)
      _look.copy(_fromLook).lerp(new THREE.Vector3(0, 0, 0), t)
      lookAt.current.copy(_look)
      camera.lookAt(lookAt.current)
      const closeness = THREE.MathUtils.smoothstep(camera.position.length(), focus.distance + 0.8, focus.distance)
      setDiveProgress(closeness * 0.08)
      if (tRaw >= 1) {
        flight.current = {
          kind: 'dive',
          startedAt: now,
          duration: DIVE_SECONDS,
          fromDistance: camera.position.length(),
        }
        _fromPos.copy(camera.position)
        _fromLook.copy(lookAt.current)
      }
      applyLens(camera, 0.08)
      syncControls(orbitControls, lookAt.current)
      return
    }

    if (fl.kind === 'dive' && focus.dive && beatIndex === 0) {
      const { fromGlobe, toFront, truck } = hookShotClock()
      if (fromGlobe === 0) {
        composeOrbit(focus, _orbitPos)
        camera.position.lerp(_orbitPos, 1 - Math.exp(-delta * ORBIT_RATE))
        lookAt.current.lerp(WORLD_ORIGIN, 1 - Math.exp(-delta * ORBIT_RATE))
        _fromPos.copy(camera.position)
        _fromLook.copy(lookAt.current)
        applyWorldLook(camera, lookAt.current)
        setDiveProgress(0)
        applyLens(camera, 0)
        syncControls(orbitControls, lookAt.current)
        return
      }
      composeHookShot(focus, 'host', _revealPos, _revealTarget)
      composeHookShot(focus, 'front', _divePos, _diveTarget, truck)
      const overviewProgress = 0.956
      let close: number
      if (fromGlobe < 1) {
        lerpDivePath(_fromPos, _revealPos, fromGlobe, camera.position)
        const remaining = camera.position.distanceTo(_revealPos)
        const initial = _fromPos.distanceTo(_revealPos)
        const pathFraction = initial > 1e-6 ? 1 - remaining / initial : fromGlobe
        lookAt.current.copy(_fromLook).lerp(_revealTarget, pathFraction)
        close = overviewProgress * (1 - THREE.MathUtils.smoothstep(remaining, 0.01, 1.7))
      } else {
        camera.position.lerpVectors(_revealPos, _divePos, toFront)
        lookAt.current.lerpVectors(_revealTarget, _diveTarget, toFront)
        close = THREE.MathUtils.lerp(overviewProgress, 1, toFront)
      }
      lastDivePos.current.copy(_divePos)
      applyLeveledLook(camera, lookAt.current, close)
      setDiveProgress(close)
      applyLens(camera, close)
      syncControls(orbitControls, lookAt.current)
      return
    }

    if (fl.kind === 'dive' && focus.dive) {
      const t = easeDive(tRaw)
      composeOrbit(focus, _orbitPos)
      composeDivePose(focus, 0, _revealPos, _revealTarget)
      composeDivePose(focus, 1, _divePos, _diveTarget)
      lastDivePos.current.copy(_divePos)
      const revealAt = 0.8
      if (t <= revealAt) {
        const u = t / revealAt
        // Start from wherever we are on the radial, so a late play() still dives from the current overview.
        lerpDivePath(_fromPos, _revealPos, u, camera.position)
        const pathU =
          _fromPos.distanceTo(_revealPos) < 1e-5
            ? u
            : 1 - camera.position.distanceTo(_revealPos) / Math.max(1e-4, _fromPos.distanceTo(_revealPos))
        lookAt.current.copy(_fromLook).lerp(_revealTarget, pathU)
      } else {
        const u = (t - revealAt) / (1 - revealAt)
        const s = u * u * (3 - 2 * u)
        camera.position.lerpVectors(_revealPos, _divePos, s)
        lookAt.current.copy(_revealTarget).lerp(_diveTarget, s)
      }
      const close = closenessToDive(camera.position, _divePos)
      applyLeveledLook(camera, lookAt.current, close)
      setDiveProgress(close)
      applyLens(camera, close)
      syncControls(orbitControls, lookAt.current)
      if (tRaw >= 1) {
        camera.position.copy(_divePos)
        lookAt.current.copy(_diveTarget)
        applyLeveledLook(camera, lookAt.current, 1)
        flight.current = { kind: 'linger', startedAt: now, duration: 1, fromDistance: camera.position.length() }
        setDiveProgress(1)
        applyLens(camera, 1)
      }
      return
    }

    if (fl.kind === 'linger' && focus.dive) {
      const elapsed = (now - fl.startedAt) / 1000
      composeDive(focus, _divePos, _diveTarget)
      lastDivePos.current.copy(_divePos)
      // Slow, stable truck along the front (local north). No handheld shake.
      const truck = Math.sin(elapsed * 0.08) * 0.012
      const peek = Math.sin(elapsed * 0.045) * 0.0028
      _divePos.addScaledVector(_north, truck).addScaledVector(_east, peek)
      _diveTarget.addScaledVector(_north, truck).addScaledVector(_east, peek * 0.25)
      camera.position.lerp(_divePos, 1 - Math.exp(-delta * 0.9))
      lookAt.current.lerp(_diveTarget, 1 - Math.exp(-delta * 0.9))
      applyLeveledLook(camera, lookAt.current, 1)
      setDiveProgress(1)
      applyLens(camera, 1)
      syncControls(orbitControls, lookAt.current)
      return
    }

    if (fl.kind === 'pull') {
      const t = easePull(tRaw)
      composeOrbit(focus, _orbitPos)
      camera.position.lerpVectors(_fromPos, _orbitPos, t)
      lookAt.current.copy(_fromLook).lerp(new THREE.Vector3(0, 0, 0), t)
      const close = closenessToDive(camera.position, lastDivePos.current)
      applyLeveledLook(camera, lookAt.current, close)
      setDiveProgress(close)
      applyLens(camera, close)
      syncControls(orbitControls, lookAt.current)
      if (tRaw >= 1) {
        camera.position.copy(_orbitPos)
        lookAt.current.set(0, 0, 0)
        applyWorldLook(camera, lookAt.current)
        flight.current.kind = 'idle'
        setDiveProgress(0)
        applyLens(camera, 0)
      }
      return
    }

    if (orbitTarget.current) {
      camera.position.lerp(orbitTarget.current, 1 - Math.exp(-delta * ORBIT_RATE))
      lookAt.current.lerp(new THREE.Vector3(0, 0, 0), 1 - Math.exp(-delta * ORBIT_RATE))
      camera.lookAt(lookAt.current)
      applyLens(camera, 0)
      if (camera.position.distanceToSquared(orbitTarget.current) < 0.00002) {
        camera.position.copy(orbitTarget.current)
        lookAt.current.set(0, 0, 0)
        camera.lookAt(0, 0, 0)
        orbitTarget.current = null
      }
      syncControls(orbitControls, lookAt.current)
      return
    }

    // Keep a settled dive locked to the surface if linger was interrupted.
    if (!reading && wasDiving.current && focus.dive && shouldDive(focus, beatIndex, paragraphIndex, narrationStatus, reducedMotion)) {
      if (beatIndex === 0) composeHookShot(focus, 'front', _divePos, _diveTarget)
      else composeDive(focus, _divePos, _diveTarget)
      camera.position.lerp(_divePos, 1 - Math.exp(-delta * 1.4))
      lookAt.current.lerp(_diveTarget, 1 - Math.exp(-delta * 1.4))
      applyLeveledLook(camera, lookAt.current, 1)
      applyLens(camera, 1)
      setDiveProgress(1)
      syncControls(orbitControls, lookAt.current)
    }
  })

  return null
}

function applyLens(camera: THREE.Camera, closeness: number) {
  if (!('isPerspectiveCamera' in camera) || !camera.isPerspectiveCamera) return
  const perspective = camera as THREE.PerspectiveCamera
  const c = THREE.MathUtils.clamp(closeness, 0, 1)
  const near = THREE.MathUtils.lerp(0.01, 0.0016, c)
  // Widen slightly mid-descent, then settle on a cinematic field of view.
  const fov = c < 0.55
    ? THREE.MathUtils.lerp(BASE_FOV, 42, c / 0.55)
    : THREE.MathUtils.lerp(42, 40, (c - 0.55) / 0.45)
  const nearChanged = Math.abs(perspective.near - near) > 0.0002
  const fovChanged = Math.abs(perspective.fov - fov) > 0.05
  if (nearChanged || fovChanged) {
    perspective.near = near
    perspective.fov = fov
    perspective.updateProjectionMatrix()
  }
}

function syncControls(controls: OrbitControls | undefined, target: THREE.Vector3) {
  if (!controls) return
  controls.target.copy(target)
  controls.update()
}
