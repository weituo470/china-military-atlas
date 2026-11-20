import { Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'
import { BEAT_STAGING, SITE_INDEX } from './sites'

const SUNLIT = '#ffd5a2'

/** Shift the projection, not the controls' origin: the guide has a dedicated globe column. */
export function SpaceJourneyCamera() {
  const { camera, size } = useThree()
  const view = camera as THREE.PerspectiveCamera
  const focus = useJourney(s => s.focus)
  const reduced = useReducedMotion()
  const destination = useRef<number | null>(null)

  useLayoutEffect(() => {
    const wide = size.width >= 960
    view.fov = wide ? 45 : 47
    const offsetX = wide ? size.width * -0.375 : size.width * -0.36
    const offsetY = wide ? 0 : Math.max(0, size.height * 0.5 - 121)
    view.setViewOffset(size.width, size.height, offsetX, offsetY, size.width, size.height)
    return () => {
      view.clearViewOffset()
      view.fov = 38
      view.updateProjectionMatrix()
    }
  }, [view, size.width, size.height])

  const compact = size.width < 960
  useLayoutEffect(() => {
    if (focus) destination.current = compact ? focus.distance * 2.15 : focus.distance
  }, [focus, compact])

  useFrame((_, delta) => {
    const target = destination.current
    if (target === null) return
    const current = view.position.length()
    const settled = reduced || Math.abs(target - current) < 0.008
    view.position.setLength(settled ? target : THREE.MathUtils.damp(current, target, 3, delta))
    view.lookAt(0, 0, 0)
    // Release zoom back to OrbitControls once this chapter's view settles.
    if (settled) destination.current = null
  })
  return null
}

function orbitPoints(tilt: number, radius: number) {
  return Array.from({ length: 97 }, (_, i) => {
    const a = (i / 96) * 2 * Math.PI
    return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * Math.sin(tilt), Math.sin(a) * radius * Math.cos(tilt))
  })
}

export function SpaceJourneyLayer() {
  const index = useJourney(s => s.beatIndex)
  const frame = BEAT_STAGING[index]
  const marker = frame.marker ? SITE_INDEX[frame.marker] : null
  const orbits = useMemo(() => [orbitPoints(0.28, 1.77), orbitPoints(-0.51, 1.96), orbitPoints(1.17, 2.05)], [])
  const location = marker ? latLngToVector3(marker.lat, marker.lon, EARTH_RADIUS * 1.012) : null
  const anchor = location ? new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), location.clone().normalize()) : null

  return (
    <group name="Qualitative space journey marks">
      {location && anchor && <group position={location} quaternion={anchor}>
        <mesh>
          <circleGeometry args={[0.021, 32]} />
          <meshBasicMaterial color={SUNLIT} toneMapped={false} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.038, 0.045, 48]} />
          <meshBasicMaterial color={SUNLIT} toneMapped={false} transparent opacity={0.82} depthWrite={false} />
        </mesh>
      </group>}
      {frame.visual && orbits.slice(0, frame.visual === 'orbit' ? 1 : 3).map((points, i) =>
        <Line key={i} points={points} color={i === 0 ? SUNLIT : '#adc0d3'} transparent opacity={i === 0 ? 0.6 : 0.35} depthWrite={false} lineWidth={1} />)}
    </group>
  )
}

