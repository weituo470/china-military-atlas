import { useLayoutEffect, useRef } from 'react'
import * as T from 'three'
import { makeCarrier, type CarrierId } from './ships'

// A film ship is ~100 units long, points to +Z and straddles y=0. Globe
// columns use +X for the heading and .09-.10 units for a carrier; the wake
// stays in the existing globe space rather than scaling the Earth anchor.
function chartModel(id: CarrierId) {
  const body = makeCarrier(id, 512)
  body.name = 'Review atlas / ' + id
  body.rotation.y = Math.PI / 2
  body.scale.setScalar(.00095)
  body.traverse(n => {
    if (!(n instanceof T.Mesh)) return
    const source = n.material as T.MeshStandardMaterial
    // Bake a small relief light into the atlas copy; the Earth is currently
    // showing its night hemisphere. No shared lights or film materials change.
    const colors = n.geometry.getAttribute('color')
    const normal = n.geometry.getAttribute('normal')
    if (colors && normal) {
      for (let i = 0; i < colors.count; i++) {
        const k = 1.16 + .44 * Math.abs(.42*normal.getX(i) + .82*normal.getY(i) - .39*normal.getZ(i))
        colors.setXYZ(i, colors.getX(i)*k*1.06, colors.getY(i)*k*1.025, colors.getZ(i)*k)
      }
      colors.needsUpdate = true
    }
    n.material = new T.MeshBasicMaterial({
      map: source.map, vertexColors: source.vertexColors, side: source.side,
      color: source.map && !source.transparent ? new T.Color(1.65,1.57,1.44) : 0xffffff,
      transparent: source.transparent, opacity: source.opacity, alphaTest: source.alphaTest,
      depthWrite: source.depthWrite, polygonOffset: source.polygonOffset,
      polygonOffsetFactor: source.polygonOffsetFactor, polygonOffsetUnits: source.polygonOffsetUnits,
      toneMapped: false,
    })
    source.dispose()
  })
  return body
}

function release(model: T.Object3D) {
  model.traverse(n => {
    if (!(n instanceof T.Mesh)) return
    const mat = n.material as T.MeshBasicMaterial
    mat.map?.dispose()
    mat.dispose()
    n.geometry.dispose()
  })
}

export function GlobeCarrier({ id }: { id: CarrierId }) {
  const root = useRef<T.Group>(null)
  const cache = useRef<{ id: CarrierId; model: T.Group } | null>(null)
  useLayoutEffect(() => {
    const host = root.current!
    const model = cache.current?.id === id ? cache.current.model : chartModel(id)
    cache.current = { id, model }
    host.add(model)
    return () => {
      host.remove(model)
      // The dev-only strict setup/cleanup/setup reuses this object. On a real
      // chapter exit, release the three geometries, materials and both maps.
      queueMicrotask(() => {
        if (!model.parent) {
          release(model)
          if (cache.current?.model === model) cache.current = null
        }
      })
    }
  }, [id])
  return <group ref={root} />
}
