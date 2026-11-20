/**
 * Typological, self-authored weapon geometry for Chapter I.
 * No museum scans, no licensed assets. Forms are schematic, not named excavated pieces.
 */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function bronzeMaterial(options?: { color?: string; roughness?: number; metalness?: number }) {
  return new THREE.MeshStandardMaterial({
    color: options?.color ?? '#b08a4f',
    roughness: options?.roughness ?? 0.42,
    metalness: options?.metalness ?? 0.82,
  })
}

function ironMaterial() {
  return new THREE.MeshStandardMaterial({ color: '#8a8f96', roughness: 0.36, metalness: 0.78 })
}

function woodMaterial(color = '#5a3a22') {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.04 })
}

function clothMaterial(color = '#3a2414') {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 })
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      for (const material of materials) material.dispose()
    }
  })
}

export function createGe() {
  const group = new THREE.Group()
  group.name = 'ge'
  const wood = woodMaterial()
  const bronze = bronzeMaterial({ color: '#b59258' })
  const cloth = clothMaterial('#3a2414')

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.02, 2.15, 14), wood)
  group.add(shaft)
  const wrap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 14), cloth)
  wrap.position.y = 0.92
  group.add(wrap)
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.026, 0.04, 16), bronze)
  collar.position.y = 1.02
  group.add(collar)

  const shape = new THREE.Shape()
  shape.moveTo(0.0, 0.025)
  shape.lineTo(0.26, 0.045)
  shape.quadraticCurveTo(0.48, 0.02, 0.58, 0.0)
  shape.quadraticCurveTo(0.5, -0.03, 0.28, -0.05)
  shape.lineTo(0.16, -0.055)
  shape.lineTo(0.13, -0.22)
  shape.lineTo(0.05, -0.22)
  shape.lineTo(0.05, -0.06)
  shape.lineTo(0.0, -0.035)
  shape.closePath()
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.003, bevelSegments: 2 }),
    bronze,
  )
  blade.position.set(0.0, 1.08, -0.009)
  group.add(blade)

  const tang = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.035, 0.02), bronze)
  tang.position.set(-0.05, 1.08, 0)
  group.add(tang)

  for (let index = 0; index < 3; index += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.0025, 6, 10), bronze)
    ring.position.set(0.055, 0.95 - index * 0.035, 0.012)
    group.add(ring)
  }

  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.08, 12), bronze)
  ferrule.position.y = -1.08
  group.add(ferrule)
  return group
}

export function createCrossbow() {
  const group = new THREE.Group()
  group.name = 'crossbow'
  const wood = woodMaterial('#5a3a22')
  const bronze = bronzeMaterial({ color: '#c4a060', roughness: 0.34 })

  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.045, 0.05), wood)
  group.add(stock)
  const butt = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.048), wood)
  butt.position.set(-0.38, -0.02, 0)
  group.add(butt)
  const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.06), wood)
  cheek.position.set(0.08, 0.03, 0)
  group.add(cheek)

  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0.22, 0.0, -0.55),
    new THREE.Vector3(0.22, 0.18, -0.18),
    new THREE.Vector3(0.22, 0.18, 0.18),
    new THREE.Vector3(0.22, 0.0, 0.55),
  )
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.012, 8, false), wood))

  const string = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0.1, 0.02, -0.54), new THREE.Vector3(0.1, 0.02, 0.54)),
      1,
      0.003,
      5,
      false,
    ),
    new THREE.MeshStandardMaterial({ color: '#d8c8a0', roughness: 0.6, metalness: 0.05 }),
  )
  group.add(string)

  const boltShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.38, 6), wood)
  boltShaft.rotation.z = Math.PI / 2
  boltShaft.position.set(0.15, 0.032, 0)
  group.add(boltShaft)
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.03, 6), bronze)
  tip.rotation.z = -Math.PI / 2
  tip.position.set(0.35, 0.032, 0)
  group.add(tip)

  const lock = new THREE.Group()
  lock.name = 'lock'
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.04), bronze)
  housing.position.set(0.02, -0.04, 0)
  housing.name = 'housing'
  lock.add(housing)
  const nut = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.028), bronze)
  nut.position.set(0.03, -0.01, 0)
  nut.name = 'nut'
  lock.add(nut)
  const sear = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.018), bronze)
  sear.position.set(-0.01, -0.03, 0)
  sear.name = 'sear'
  lock.add(sear)
  const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.08, 0.014), bronze)
  trigger.position.set(-0.02, -0.08, 0)
  trigger.rotation.z = 0.2
  trigger.name = 'trigger'
  lock.add(trigger)

  lock.userData.rest = {
    housing: housing.position.clone(),
    nut: nut.position.clone(),
    sear: sear.position.clone(),
    trigger: trigger.position.clone(),
  }
  lock.userData.exploded = {
    housing: new THREE.Vector3(0.02, -0.04, 0),
    nut: new THREE.Vector3(0.03, 0.08, 0.07),
    sear: new THREE.Vector3(-0.02, -0.03, -0.08),
    trigger: new THREE.Vector3(-0.02, -0.16, 0.09),
  }
  group.add(lock)
  group.userData.lock = lock
  return group
}

export function setLockExploded(crossbow: THREE.Object3D, exploded: number) {
  const lock = crossbow.getObjectByName('lock') as THREE.Group | undefined
  if (!lock) return
  const rest = lock.userData.rest as Record<string, THREE.Vector3>
  const explodedPos = lock.userData.exploded as Record<string, THREE.Vector3>
  for (const name of ['housing', 'nut', 'sear', 'trigger']) {
    const mesh = lock.getObjectByName(name)
    if (!mesh) continue
    mesh.position.lerpVectors(rest[name], explodedPos[name], exploded)
  }
}

export function createJian() {
  const group = new THREE.Group()
  group.name = 'jian'
  const iron = ironMaterial()
  const bronze = bronzeMaterial({ color: '#c4a060', roughness: 0.32 })
  const wood = woodMaterial('#2a1a12')

  const bladeShape = new THREE.Shape()
  bladeShape.moveTo(0, 0)
  bladeShape.lineTo(0.018, 0.02)
  bladeShape.lineTo(0.02, 0.7)
  bladeShape.quadraticCurveTo(0.0, 0.82, 0, 0.88)
  bladeShape.quadraticCurveTo(0.0, 0.82, -0.02, 0.7)
  bladeShape.lineTo(-0.018, 0.02)
  bladeShape.closePath()
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bladeShape, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.001, bevelSegments: 1 }),
    iron,
  )
  blade.position.z = -0.003
  group.add(blade)
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.72, 0.008), iron)
  ridge.position.y = 0.4
  group.add(ridge)
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.016, 0.03), bronze)
  guard.position.y = 0.01
  group.add(guard)
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.013, 0.14, 10), wood)
  grip.position.y = -0.08
  group.add(grip)
  const pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.012, 20), bronze)
  pommel.position.y = -0.16
  group.add(pommel)
  const pommelCap = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 10), bronze)
  pommelCap.scale.y = 0.5
  pommelCap.position.y = -0.175
  group.add(pommelCap)
  return group
}

export function createCavalrySet() {
  const group = new THREE.Group()
  group.name = 'cavalry'
  const wood = woodMaterial('#4a2c18')
  const bronze = bronzeMaterial({ color: '#a7844a', roughness: 0.48 })
  const cloth = clothMaterial('#4a1c14')

  const bowCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.42, 0),
    new THREE.Vector3(0.16, 0.22, 0),
    new THREE.Vector3(0.16, -0.22, 0),
    new THREE.Vector3(0, -0.42, 0),
  )
  group.add(new THREE.Mesh(new THREE.TubeGeometry(bowCurve, 40, 0.01, 8, false), wood))
  const siyahTop = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.012), wood)
  siyahTop.position.set(-0.005, 0.44, 0)
  siyahTop.rotation.z = 0.4
  group.add(siyahTop)
  const siyahBot = siyahTop.clone()
  siyahBot.position.set(-0.005, -0.44, 0)
  siyahBot.rotation.z = -0.4
  group.add(siyahBot)
  group.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(0, 0.46, 0), new THREE.Vector3(0, -0.46, 0)), 1, 0.0025, 5, false),
    new THREE.MeshStandardMaterial({ color: '#d8c8a0', roughness: 0.6 }),
  ))

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.18, 10), bronze)
  neck.rotation.z = 0.5
  neck.position.set(0.28, -0.12, 0.12)
  group.add(neck)
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.05), bronze)
  head.position.set(0.38, -0.02, 0.12)
  head.rotation.z = -0.2
  group.add(head)
  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.035), bronze)
  muzzle.position.set(0.46, -0.03, 0.12)
  group.add(muzzle)
  const ear = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 6), bronze)
  ear.position.set(0.34, 0.04, 0.13)
  ear.rotation.z = -0.3
  group.add(ear)
  const ear2 = ear.clone()
  ear2.position.z = 0.1
  group.add(ear2)
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.04, 12), bronze)
  stand.position.set(0.3, -0.28, 0.12)
  group.add(stand)
  const clothMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.002, 0.1), cloth)
  clothMesh.position.set(0.3, -0.255, 0.12)
  group.add(clothMesh)
  return group
}

const FACTORIES: Record<string, () => THREE.Group> = {
  ge: createGe,
  crossbow: createCrossbow,
  jian: createJian,
  cavalry: createCavalrySet,
}

export function WeaponModel({
  id,
  exploded = false,
  reducedMotion = false,
}: {
  id: string
  exploded?: boolean
  reducedMotion?: boolean
}) {
  const object = useMemo(() => (FACTORIES[id] ?? createGe)(), [id])
  const explode = useRef(exploded ? 1 : 0)

  useEffect(() => () => disposeObject(object), [object])

  useFrame((_, delta) => {
    if (id !== 'crossbow') return
    const target = exploded ? 1 : 0
    explode.current = reducedMotion ? target : THREE.MathUtils.damp(explode.current, target, 8, delta)
    setLockExploded(object, explode.current)
  })

  return <primitive object={object} />
}
