import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls } from 'three-stdlib'
import { worldSurfaceNormal, worldSurfacePoint } from '../../components/earth/planetApi'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { EARTH_RADIUS } from '../../utils/geo'
import type { JourneyFocus } from '../types'
import { useFleetLens } from './atlas/useFleetLens'

const WORLD_UP = new THREE.Vector3(0, 1, 0)
const BASE_FOV = 38
const _normal = new THREE.Vector3()
const _pole = new THREE.Vector3()
const _east = new THREE.Vector3()
const _desiredPos = new THREE.Vector3()
const _desiredUp = new THREE.Vector3()
const _desiredLook = new THREE.Vector3()
const _origin = new THREE.Vector3(0, 0, 0)

/**
 * North-up radial for a baseline2026 focus that still looks at the Earth
 * origin (every beat except the mid-Pacific review sea shots).
 */
function composeNorthUpRadial(
  lat: number,
  lon: number,
  distance: number,
  outPos: THREE.Vector3,
  outUp: THREE.Vector3,
) {
  worldSurfaceNormal(lat, lon, _normal)
  worldSurfaceNormal(Math.min(89.5, lat + 0.5), lon, _pole)
  outUp.copy(_pole).addScaledVector(_normal, -_pole.dot(_normal))
  if (outUp.lengthSq() < 1e-8) {
    _east.crossVectors(WORLD_UP, _normal).normalize()
    outUp.crossVectors(_normal, _east).normalize()
  } else {
    outUp.normalize()
  }
  outPos.copy(_normal).multiplyScalar(distance)
}

/**
 * Low sea-surface pose for the review beat only.
 *
 * The camera stands on the radial of `focus.lat/lon` (its nadir) at
 * `focus.distance` ≈ Earth radius + altitude, and looks at the typological
 * formation on the water (`focus.look`), not at the Earth origin. `camera.up`
 * is the local zenith so the horizon stays level.
 */
function composeSeaPose(
  focus: JourneyFocus,
  outPos: THREE.Vector3,
  outUp: THREE.Vector3,
  outLook: THREE.Vector3,
) {
  worldSurfaceNormal(focus.lat, focus.lon, _normal)
  outPos.copy(_normal).multiplyScalar(focus.distance)
  outUp.copy(_normal)
  const look = focus.look
  if (look) {
    worldSurfacePoint(look.lat, look.lon, EARTH_RADIUS * 1.02, outLook)
  } else {
    outLook.set(0, 0, 0)
  }
}

function setFov(camera: THREE.Camera, fov: number) {
  const perspective = camera as THREE.PerspectiveCamera
  if (!('fov' in perspective) || typeof perspective.fov !== 'number') return
  if (Math.abs(perspective.fov - fov) < 0.04) {
    if (perspective.fov !== fov) {
      perspective.fov = fov
      perspective.updateProjectionMatrix()
    }
    return
  }
  perspective.fov = fov
  perspective.updateProjectionMatrix()
}

function syncControls(controls: OrbitControls | undefined, target: THREE.Vector3, sea: boolean) {
  if (!controls) return
  controls.enabled = !sea
  controls.minDistance = sea ? 0.003 : 1.72
  controls.target.copy(target)
  // Do not call controls.update() while we own the camera: OrbitControls.update
  // would re-apply its spherical state and fight the sea pose.
}

/**
 * Flies the existing Earth camera onto a north-up radial for the current
 * beat focus, or — when `focus.look` is set — onto a low sea-surface view
 * of the typological mid-Pacific review. Lives in baseline2026/ so Chapter I
 * camera files stay untouched.
 */
export function Baseline2026Camera() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const focus = useJourney((store) => store.focus)
  const restoreCamera = useJourney((store) => store.restoreCamera)
  const captureCameraPosition = useJourney((store) => store.captureCameraPosition)
  const { camera, get } = useThree()
  const reducedMotion = useReducedMotion()
  const atlasCamera=useFleetLens(reducedMotion)
  const restoreTarget = useRef<THREE.Vector3 | null>(null)
  const entered = useRef(false)
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0))
  const baselineActive = activeJourney === 'baseline2026'

  const orbit = () => get().controls as OrbitControls | undefined

  useEffect(() => {
    if (baselineActive && !entered.current) {
      entered.current = true
      captureCameraPosition(camera.position.toArray() as [number, number, number])
    }
    if (!baselineActive && entered.current) {
      entered.current = false
      setFov(camera, BASE_FOV)
      if (restoreCamera) {
        const restored = new THREE.Vector3(...restoreCamera)
        if (reducedMotion) {
          camera.position.copy(restored)
          camera.up.copy(WORLD_UP)
          camera.lookAt(0, 0, 0)
          camera.updateProjectionMatrix()
          restoreTarget.current = null
          lookTarget.current.set(0, 0, 0)
          syncControls(orbit(), lookTarget.current, false)
        } else {
          restoreTarget.current = restored
        }
      } else {
        camera.up.copy(WORLD_UP)
        camera.lookAt(0, 0, 0)
        lookTarget.current.set(0, 0, 0)
        syncControls(orbit(), lookTarget.current, false)
      }
    }
  }, [baselineActive, camera, captureCameraPosition, get, reducedMotion, restoreCamera])

  useFrame((_, delta) => {
    if (!baselineActive) {
      const perspective = camera as THREE.PerspectiveCamera
      if ('fov' in perspective && Math.abs(perspective.fov - BASE_FOV) > 0.05) {
        const kFov = 1 - Math.exp(-delta * 1.65)
        setFov(camera, THREE.MathUtils.lerp(perspective.fov, BASE_FOV, kFov))
      }
      if (!restoreTarget.current) return
      const k = 1 - Math.exp(-delta * 1.65)
      camera.position.lerp(restoreTarget.current, k)
      camera.up.lerp(WORLD_UP, k).normalize()
      lookTarget.current.lerp(_origin, k)
      camera.lookAt(lookTarget.current)
      if (camera.position.distanceToSquared(restoreTarget.current) < 0.00002) {
        camera.position.copy(restoreTarget.current)
        camera.up.copy(WORLD_UP)
        lookTarget.current.set(0, 0, 0)
        camera.lookAt(0, 0, 0)
        setFov(camera, BASE_FOV)
        restoreTarget.current = null
        syncControls(orbit(), lookTarget.current, false)
      }
      return
    }
    if(atlasCamera(delta))return
    if (!focus) return

    const sea = Boolean(focus.look)
    if (sea) {
      composeSeaPose(focus, _desiredPos, _desiredUp, _desiredLook)
    } else {
      composeNorthUpRadial(focus.lat, focus.lon, focus.distance, _desiredPos, _desiredUp)
      _desiredLook.set(0, 0, 0)
    }

    const targetFov = sea && typeof focus.fov === 'number' ? focus.fov : BASE_FOV
    const gap = camera.position.distanceTo(_desiredPos)
    const snap = reducedMotion || (sea && gap > 0.55)

    if (snap) {
      camera.position.copy(_desiredPos)
      camera.up.copy(_desiredUp)
      lookTarget.current.copy(_desiredLook)
      camera.lookAt(lookTarget.current)
      setFov(camera, targetFov)
      camera.updateProjectionMatrix()
      syncControls(orbit(), lookTarget.current, sea)
      return
    }

    const k = 1 - Math.exp(-delta * (sea ? 2.8 : 1.65))
    const kLook = 1 - Math.exp(-delta * (sea ? 4.2 : 3.05))
    camera.position.lerp(_desiredPos, k)
    camera.up.lerp(_desiredUp, k).normalize()
    lookTarget.current.lerp(_desiredLook, kLook)
    camera.lookAt(lookTarget.current)
    const perspective = camera as THREE.PerspectiveCamera
    if ('fov' in perspective && typeof perspective.fov === 'number') {
      setFov(camera, THREE.MathUtils.lerp(perspective.fov, targetFov, k))
    }
    syncControls(orbit(), lookTarget.current, sea)
  })

  return null
}
