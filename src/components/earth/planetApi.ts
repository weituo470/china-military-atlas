import * as THREE from 'three'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'

/** Shared handle to the rotating Earth group so journey cameras can track a surface point in world space. */
export const planetGroupRef: { current: THREE.Group | null } = { current: null }

const _local = new THREE.Vector3()

export function worldSurfacePoint(lat: number, lon: number, radius = EARTH_RADIUS, out = new THREE.Vector3()) {
  _local.copy(latLngToVector3(lat, lon, radius))
  const group = planetGroupRef.current
  if (group) out.copy(_local).applyQuaternion(group.quaternion)
  else out.copy(_local)
  return out
}

export function worldSurfaceNormal(lat: number, lon: number, out = new THREE.Vector3()) {
  return worldSurfacePoint(lat, lon, 1, out).normalize()
}
