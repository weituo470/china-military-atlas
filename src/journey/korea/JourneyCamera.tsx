import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'

/**
 * Flies the existing Earth camera along its current radial offset to a beat distance.
 * Mounted only when the Korea journey is active. Does not add a second renderer.
 */
export function KoreaJourneyCamera() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const focus = useJourney((store) => store.focus)
  const cameraNonce = useJourney((store) => store.cameraNonce)
  const restoreCamera = useJourney((store) => store.restoreCamera)
  const captureCameraPosition = useJourney((store) => store.captureCameraPosition)
  const { camera } = useThree()
  const reducedMotion = useReducedMotion()
  const target = useRef<THREE.Vector3 | null>(null)
  const entered = useRef(false)
  const koreaActive = activeJourney === 'korea'

  useEffect(() => {
    if (koreaActive && !entered.current) {
      entered.current = true
      captureCameraPosition(camera.position.toArray() as [number, number, number])
    }
    if (!koreaActive && entered.current) {
      entered.current = false
      if (restoreCamera) {
        const restored = new THREE.Vector3(...restoreCamera)
        if (reducedMotion) {
          camera.position.copy(restored)
          camera.lookAt(0, 0, 0)
          camera.updateProjectionMatrix()
          target.current = null
        } else {
          target.current = restored
        }
      }
    }
  }, [koreaActive, camera, captureCameraPosition, reducedMotion, restoreCamera])

  useEffect(() => {
    if (!koreaActive || !focus) return
    const next = camera.position.clone().normalize().multiplyScalar(focus.distance)
    if (reducedMotion) {
      camera.position.copy(next)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
      target.current = null
    } else {
      target.current = next
    }
  }, [koreaActive, camera, cameraNonce, focus, reducedMotion])

  useFrame((_, delta) => {
    if (!target.current) return
    camera.position.lerp(target.current, 1 - Math.exp(-delta * 1.65))
    camera.lookAt(0, 0, 0)
    if (camera.position.distanceToSquared(target.current) < 0.00002) {
      camera.position.copy(target.current)
      camera.lookAt(0, 0, 0)
      target.current = null
    }
  })

  return null
}
