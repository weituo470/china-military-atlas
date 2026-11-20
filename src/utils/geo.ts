import * as THREE from 'three'

export const EARTH_RADIUS = 1.5

export function latLngToVector3(lat: number, lon: number, radius = EARTH_RADIUS) {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon + 180)

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}


const _start = new THREE.Vector3()
const _end = new THREE.Vector3()
/** Spherical interpolation of unit vectors (great-circle). Vector3.slerp is not in this Three build. */
function slerpUnit(out: THREE.Vector3, start: THREE.Vector3, end: THREE.Vector3, t: number) {
  const angle = start.angleTo(end)
  if (angle < 1e-5) return out.copy(start)
  const sin = Math.sin(angle)
  if (sin < 1e-5) return out.copy(start)
  const wa = Math.sin((1 - t) * angle) / sin
  const wb = Math.sin(t * angle) / sin
  return out.copy(start).multiplyScalar(wa).addScaledVector(end, wb)
}

/**
 * Sample a great-circle path between two geographic points, slightly above the sphere.
 * `bulge` is extra mid-arc lift in the same units as `altitude`.
 */
export function sampleGreatCircle(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  segments = 48,
  altitude = EARTH_RADIUS * 1.02,
  bulge = 0,
): THREE.Vector3[] {
  const count = Math.max(2, Math.floor(segments))
  _start.copy(latLngToVector3(fromLat, fromLon, 1)).normalize()
  _end.copy(latLngToVector3(toLat, toLon, 1)).normalize()
  const points: THREE.Vector3[] = []
  for (let index = 0; index <= count; index += 1) {
    const t = index / count
    const point = slerpUnit(new THREE.Vector3(), _start, _end, t)
    const lift = bulge > 0 ? Math.sin(t * Math.PI) * bulge : 0
    points.push(point.normalize().multiplyScalar(altitude + lift))
  }
  return points
}

export function greatCirclePoint(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  t: number,
  altitude = EARTH_RADIUS * 1.02,
  bulge = 0,
): THREE.Vector3 {
  _start.copy(latLngToVector3(fromLat, fromLon, 1)).normalize()
  _end.copy(latLngToVector3(toLat, toLon, 1)).normalize()
  const clamped = THREE.MathUtils.clamp(t, 0, 1)
  const point = slerpUnit(new THREE.Vector3(), _start, _end, clamped)
  const lift = bulge > 0 ? Math.sin(clamped * Math.PI) * bulge : 0
  return point.normalize().multiplyScalar(altitude + lift)
}
