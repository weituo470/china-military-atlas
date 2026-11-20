import { useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'

const Y_UP = new THREE.Vector3(0, 1, 0)

export function surfacePose(lat: number, lon: number, altitude = EARTH_RADIUS * 1.018) {
  const position = latLngToVector3(lat, lon, altitude)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(Y_UP, position.clone().normalize())
  return { position, quaternion }
}

export function SurfaceAnchor({ lat, lon, altitude, children }: { lat: number; lon: number; altitude?: number; children: ReactNode }) {
  const pose = useMemo(() => surfacePose(lat, lon, altitude), [altitude, lat, lon])
  return <group position={pose.position} quaternion={pose.quaternion}>{children}</group>
}
