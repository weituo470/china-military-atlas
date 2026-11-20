import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type Palette = {
  armor: string
  cloth: string
  helm: string
  crest: string
  skin: string
  shield: string
  boss: string
  spear: string
  tip: string
  pants: string
  horse: string
  mane: string
  pole: string
  hair: string
}

export const QIN: Palette = {
  armor: '#6a4a36',
  cloth: '#a04032',
  helm: '#7a6248',
  crest: '#a03024',
  skin: '#c4a07c',
  shield: '#6a4a32',
  boss: '#b9975c',
  spear: '#6a5038',
  tip: '#e6d090',
  pants: '#5a4a3c',
  horse: '#6a4a32',
  mane: '#2a2018',
  pole: '#4a3a2c',
  hair: '#2a2018',
}

export const PEER: Palette = {
  armor: '#6a7a84',
  cloth: '#7a8a94',
  helm: '#5a656c',
  crest: '#7a6a50',
  skin: '#c4a07c',
  shield: '#5c6a70',
  boss: '#d0c8b8',
  spear: '#5a5348',
  tip: '#d0d4d8',
  pants: '#4a5458',
  horse: '#6a5848',
  mane: '#2a241c',
  pole: '#3a3832',
  hair: '#2a241c',
}

function collect(parts: THREE.BufferGeometry[]) {
  const prepared: THREE.BufferGeometry[] = []
  for (const part of parts) {
    if (!part.getAttribute('position')?.count) {
      part.dispose()
      continue
    }
    if (part.index) {
      const flat = part.toNonIndexed()
      part.dispose()
      prepared.push(flat)
    } else {
      prepared.push(part)
    }
  }
  const merged = prepared.length ? mergeGeometries(prepared, false) : null
  prepared.forEach((part) => part.dispose())
  if (!merged) throw new Error('Failed to merge unit geometry')
  merged.computeVertexNormals()
  return merged
}

function toLinear(hex: string) {
  // Three's CSS-color constructor already converts from sRGB.
  return new THREE.Color(hex)
}

function shadeColor(hex: string, y: number, minY: number, maxY: number, z = 0, ao = 0.12) {
  const color = toLinear(hex)
  const span = Math.max(1e-6, maxY - minY)
  const lift = (y - minY) / span
  const shade = 1 - ao * (1 - lift) - Math.max(0, -z) * 0.03
  color.r *= shade
  color.g *= shade
  color.b *= shade
  return color
}

function paint(geo: THREE.BufferGeometry, hex: string, ao = 0.12) {
  const pos = geo.attributes.position
  const n = pos.count
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < n; i++) {
    const y = pos.getY(i)
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const arr = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const color = shadeColor(hex, pos.getY(i), minY, maxY, pos.getZ(i), ao)
    arr[i * 3] = color.r
    arr[i * 3 + 1] = color.g
    arr[i * 3 + 2] = color.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3))
  return geo
}

function paintLamellar(geo: THREE.BufferGeometry, baseHex: string, darkHex: string, period = 0.048) {
  const pos = geo.attributes.position
  const n = pos.count
  const base = toLinear(baseHex)
  const dark = toLinear(darkHex)
  const scratch = new THREE.Color()
  const arr = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const y = pos.getY(i)
    const wave = 0.5 + 0.5 * Math.sin((y / period) * Math.PI * 2)
    scratch.copy(base).lerp(dark, wave * 0.4)
    const seam = Math.abs(Math.sin(pos.getX(i) * 28 + pos.getZ(i) * 6))
    if (seam > 0.92) scratch.multiplyScalar(0.86)
    arr[i * 3] = scratch.r
    arr[i * 3 + 1] = scratch.g
    arr[i * 3 + 2] = scratch.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3))
  return geo
}

function paintShield(geo: THREE.BufferGeometry, fieldHex: string, rimHex: string) {
  const pos = geo.attributes.position
  const n = pos.count
  const field = toLinear(fieldHex)
  const rim = toLinear(rimHex)
  const scratch = new THREE.Color()
  geo.computeBoundingBox()
  const maxX = geo.boundingBox!.max.x
  const maxY = geo.boundingBox!.max.y
  const arr = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const r = Math.max(Math.abs(pos.getX(i)) / maxX, Math.abs(pos.getY(i)) / maxY)
    const grain = 0.92 + 0.08 * Math.sin(pos.getX(i) * 22) * Math.cos(pos.getY(i) * 18)
    // Keep the face lacquered; only the beveled lip takes the bronze tint.
    const rimMix = pos.getZ(i) <= 0.0401 ? 0 : THREE.MathUtils.smoothstep(r, 0.94, 1)
    scratch.copy(field).lerp(rim, rimMix)
    scratch.multiplyScalar(grain)
    arr[i * 3] = scratch.r
    arr[i * 3 + 1] = scratch.g
    arr[i * 3 + 2] = scratch.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3))
  return geo
}

function place(
  geo: THREE.BufferGeometry,
  hex: string,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
  ao = 0.12,
) {
  if (rx) geo.rotateX(rx)
  if (ry) geo.rotateY(ry)
  if (rz) geo.rotateZ(rz)
  if (x || y || z) geo.translate(x, y, z)
  return paint(geo, hex, ao)
}

function roundedRect(width: number, height: number, radius: number) {
  const shape = new THREE.Shape()
  const w = width / 2
  const h = height / 2
  const r = Math.min(radius, w, h)
  shape.moveTo(-w + r, -h)
  shape.lineTo(w - r, -h)
  shape.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false)
  shape.lineTo(w, h - r)
  shape.absarc(w - r, h - r, r, 0, Math.PI / 2, false)
  shape.lineTo(-w + r, h)
  shape.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false)
  shape.lineTo(-w, -h + r)
  shape.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false)
  return shape
}

export const SPEAR_GRIP = { x: 0.24, y: 0.98, z: 0.1 }
export const SPEAR_TIP = 1.28
export const SPEAR_BUTT = 0.82

export function createSoldierGeometry(palette: Palette) {
  const leftLeg = place(new THREE.CapsuleGeometry(0.065, 0.38, 6, 10), palette.pants, -0.08, 0.255, 0.055, 0.08, 0, 0.04)
  const rightLeg = place(new THREE.CapsuleGeometry(0.065, 0.38, 6, 10), palette.pants, 0.085, 0.255, -0.05, -0.06, 0, -0.03)
  const leftBoot = place(new THREE.SphereGeometry(0.07, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), palette.pants, -0.08, 0.0, 0.07, 0, 0, 0, 0.22)
  const rightBoot = place(new THREE.SphereGeometry(0.07, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), palette.pants, 0.085, 0.0, -0.03, 0, 0, 0, 0.22)

  const skirt = new THREE.CylinderGeometry(0.2, 0.24, 0.26, 12, 4)
  skirt.translate(0, 0.56, 0)
  paintLamellar(skirt, palette.armor, '#3a281c')

  const hips = place(new THREE.SphereGeometry(0.16, 12, 8), palette.pants, 0, 0.7, 0, 0, 0, 0, 0.2)

  const torso = new THREE.CylinderGeometry(0.155, 0.195, 0.46, 12, 6)
  torso.translate(0, 0.92, 0)
  paintLamellar(torso, palette.armor, '#3a281c')

  const sash = place(new THREE.TorusGeometry(0.175, 0.028, 6, 16), palette.cloth, 0, 0.7, 0, Math.PI / 2, 0, 0, 0.08)
  const leftShoulder = place(new THREE.SphereGeometry(0.09, 10, 8), palette.armor, -0.2, 1.1, 0.01)
  const rightShoulder = place(new THREE.SphereGeometry(0.09, 10, 8), palette.armor, 0.2, 1.1, 0.01)

  const leftUpper = place(new THREE.CapsuleGeometry(0.05, 0.2, 5, 8), palette.armor, -0.28, 0.96, 0.04, 0.35, 0, 0.55)
  const leftFore = place(new THREE.CapsuleGeometry(0.045, 0.18, 5, 8), palette.armor, -0.32, 0.82, 0.14, 0.95, 0, 0.15)
  const leftHand = place(new THREE.SphereGeometry(0.045, 8, 6), palette.skin, -0.36, 0.82, 0.1)

  const rightUpper = place(new THREE.CapsuleGeometry(0.05, 0.2, 5, 8), palette.armor, 0.24, 0.98, 0.05, 0.45, 0, -0.35)
  const rightFore = place(new THREE.CapsuleGeometry(0.045, 0.18, 5, 8), palette.armor, 0.26, 0.92, 0.16, 0.85, 0, -0.1)
  const rightHand = place(new THREE.SphereGeometry(0.045, 8, 6), palette.skin, SPEAR_GRIP.x, SPEAR_GRIP.y, SPEAR_GRIP.z)

  const neck = place(new THREE.CylinderGeometry(0.05, 0.06, 0.09, 10), palette.skin, 0, 1.18, 0.02)
  const head = place(new THREE.SphereGeometry(0.095, 16, 12), palette.skin, 0, 1.3, 0.04, 0, 0, 0, 0.06)
  const nose = place(new THREE.SphereGeometry(0.022, 8, 6), palette.skin, 0, 1.29, 0.13, 0, 0, 0, 0.04)
  const eye = () => new THREE.SphereGeometry(0.013, 8, 6).scale(1, 0.47, 0.5)
  const eyeL = place(eye(), '#30221a', -0.033, 1.311, 0.127, 0, 0, 0, 0.02)
  const eyeR = place(eye(), '#30221a', 0.033, 1.311, 0.127, 0, 0, 0, 0.02)
  const earL = place(new THREE.SphereGeometry(0.02, 8, 6), palette.skin, -0.095, 1.29, 0.03, 0, 0, 0, 0.08)
  const earR = place(new THREE.SphereGeometry(0.02, 8, 6), palette.skin, 0.095, 1.29, 0.03, 0, 0, 0, 0.08)

  // Cap only covers the crown down to the brow, leaving the face open.
  const helmCap = new THREE.SphereGeometry(0.118, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.46)
  helmCap.translate(0, 1.318, 0.015)
  paint(helmCap, palette.helm, 0.08)

  const brow = place(new THREE.TorusGeometry(0.09, 0.013, 6, 18, Math.PI * 1.05), palette.helm, 0, 1.285, 0.05, 0.55, 0, 0, 0.06)
  // Back half only: theta 0 is +X, +Z is the face, so wrap from +X through -Z to -X.
  const neckGuard = place(
    new THREE.CylinderGeometry(0.105, 0.12, 0.13, 14, 1, true, Math.PI * 0.15 + Math.PI, Math.PI * 0.7),
    palette.helm,
    0,
    1.22,
    0.01,
  )

  const bun = place(new THREE.SphereGeometry(0.048, 10, 8), palette.hair, 0.0, 1.42, -0.07)
  const tassel = place(new THREE.ConeGeometry(0.016, 0.12, 6), palette.crest, 0.0, 1.36, -0.13, 2.5)

  const shield = new THREE.ExtrudeGeometry(roundedRect(0.5, 0.66, 0.08), {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.014,
    bevelSegments: 2,
    curveSegments: 8,
  })
  const shieldPos = shield.attributes.position
  for (let i = 0; i < shieldPos.count; i++) {
    const x = shieldPos.getX(i)
    shieldPos.setZ(i, shieldPos.getZ(i) - x * x * 0.45)
  }
  paintShield(shield, palette.shield, palette.boss)
  shield.translate(-0.34, 0.86, 0.14)

  const boss = place(new THREE.SphereGeometry(0.05, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), palette.boss, -0.34, 0.86, 0.22, Math.PI / 2, 0, 0, 0.04)
  const bossRing = place(new THREE.TorusGeometry(0.068, 0.01, 6, 16), palette.boss, -0.34, 0.86, 0.205, 0, 0, 0, 0.04)

  return collect([
    leftLeg,
    rightLeg,
    leftBoot,
    rightBoot,
    skirt,
    hips,
    torso,
    sash,
    leftShoulder,
    rightShoulder,
    leftUpper,
    leftFore,
    leftHand,
    rightUpper,
    rightFore,
    rightHand,
    neck,
    head,
    nose,
    eyeL,
    eyeR,
    earL,
    earR,
    helmCap,
    brow,
    neckGuard,
    bun,
    tassel,
    shield,
    boss,
    bossRing,
  ])
}

export function createSpearGeometry(palette: Palette) {
  const shaft = new THREE.CylinderGeometry(0.012, 0.016, SPEAR_TIP + SPEAR_BUTT, 8)
  shaft.translate(0, (SPEAR_TIP - SPEAR_BUTT) / 2, 0)
  paint(shaft, palette.spear, 0.12)

  const collar = place(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 8), palette.tip, 0, SPEAR_TIP - 0.06, 0, 0, 0, 0, 0.04)
  const tip = place(new THREE.ConeGeometry(0.032, 0.2, 8), palette.tip, 0, SPEAR_TIP + 0.04, 0, 0, 0, 0, 0.04)
  const butt = place(new THREE.SphereGeometry(0.018, 8, 6), palette.spear, 0, -SPEAR_BUTT, 0, 0, 0, 0, 0.2)

  return collect([shaft, collar, tip, butt])
}

export function createHorseGeometry(palette: Palette) {
  const body = place(new THREE.CapsuleGeometry(0.2, 0.72, 6, 12), palette.horse, 0, 0.58, 0, Math.PI / 2)
  const chest = place(new THREE.SphereGeometry(0.22, 12, 10), palette.horse, 0, 0.56, 0.34, 0, 0, 0, 0.12)
  const rump = place(new THREE.SphereGeometry(0.23, 12, 10), palette.horse, 0, 0.58, -0.36, 0, 0, 0, 0.12)
  const neck = place(new THREE.CapsuleGeometry(0.1, 0.34, 5, 10), palette.horse, 0, 0.88, 0.42, 0.7)
  const head = place(new THREE.CapsuleGeometry(0.07, 0.26, 5, 10), palette.horse, 0, 1.08, 0.66, 0.95, 0, 0, 0.1)
  const muzzle = place(new THREE.SphereGeometry(0.055, 8, 6), palette.mane, 0, 1.02, 0.82, 0, 0, 0, 0.15)
  const earL = place(new THREE.ConeGeometry(0.03, 0.1, 6), palette.mane, -0.05, 1.2, 0.58, 0.15, 0, 0.2)
  const earR = place(new THREE.ConeGeometry(0.03, 0.1, 6), palette.mane, 0.05, 1.2, 0.58, 0.15, 0, -0.2)
  const mane = place(new THREE.CapsuleGeometry(0.04, 0.36, 4, 8), palette.mane, 0, 0.98, 0.36, 0.75)
  const tail = place(new THREE.CapsuleGeometry(0.035, 0.4, 4, 8), palette.mane, 0, 0.5, -0.62, 0.9)

  const leg = (x: number, z: number, hex: string) =>
    place(new THREE.CapsuleGeometry(0.045, 0.38, 4, 8), hex, x, 0.26, z)
  const hoof = (x: number, z: number) => place(new THREE.SphereGeometry(0.05, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), palette.mane, x, 0.0, z, 0, 0, 0, 0.25)

  const saddle = place(new THREE.CylinderGeometry(0.18, 0.2, 0.08, 10), palette.cloth, 0, 0.78, -0.02, Math.PI / 2, 0, Math.PI / 2)
  const riderHip = place(new THREE.SphereGeometry(0.12, 10, 8), palette.pants, 0, 0.92, -0.02)
  const riderTorso = new THREE.CylinderGeometry(0.12, 0.15, 0.36, 10)
  riderTorso.translate(0, 1.16, -0.02)
  paintLamellar(riderTorso, palette.armor, '#3a281c')
  const riderArmL = place(new THREE.CapsuleGeometry(0.04, 0.22, 4, 8), palette.armor, -0.16, 1.12, 0.08, 0.6, 0, 0.4)
  const riderArmR = place(new THREE.CapsuleGeometry(0.04, 0.22, 4, 8), palette.armor, 0.18, 1.14, 0.12, 0.7, 0, -0.3)
  const riderHead = place(new THREE.SphereGeometry(0.08, 12, 10), palette.skin, 0, 1.42, 0.0)
  const riderHelm = new THREE.SphereGeometry(0.09, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58)
  riderHelm.translate(0, 1.43, -0.01)
  paint(riderHelm, palette.helm, 0.1)
  const riderBun = place(new THREE.SphereGeometry(0.045, 8, 6), palette.hair, 0, 1.5, -0.05)
  const lance = place(new THREE.CylinderGeometry(0.012, 0.014, 1.85, 7), palette.spear, 0.22, 1.1, 0.55, 1.15)
  const lanceTip = place(new THREE.ConeGeometry(0.028, 0.16, 7), palette.tip, 0.22, 1.22, 1.42, 1.15)

  return collect([
    body,
    chest,
    rump,
    neck,
    head,
    muzzle,
    earL,
    earR,
    mane,
    tail,
    leg(-0.12, 0.32, palette.horse),
    leg(0.12, 0.32, palette.horse),
    leg(-0.13, -0.34, palette.horse),
    leg(0.13, -0.34, palette.horse),
    hoof(-0.12, 0.32),
    hoof(0.12, 0.32),
    hoof(-0.13, -0.34),
    hoof(0.13, -0.34),
    saddle,
    riderHip,
    riderTorso,
    riderArmL,
    riderArmR,
    riderHead,
    riderHelm,
    riderBun,
    lance,
    lanceTip,
  ])
}

export function createBannerGeometry(palette: Palette) {
  const pole = place(new THREE.CylinderGeometry(0.02, 0.025, 2.35, 8), palette.pole, 0, 1.18, 0)
  const cross = place(new THREE.CylinderGeometry(0.014, 0.014, 0.55, 8), palette.pole, 0.18, 2.22, 0, 0, 0, Math.PI / 2)
  const finial = place(new THREE.SphereGeometry(0.045, 10, 8), palette.tip, 0, 2.4, 0, 0, 0, 0, 0.05)
  const spike = place(new THREE.ConeGeometry(0.025, 0.12, 8), palette.tip, 0, 2.5, 0)

  const cloth = new THREE.PlaneGeometry(0.5, 0.82, 6, 8)
  const pos = cloth.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, Math.sin((x + 0.2) * 6) * 0.03 + Math.sin(y * 5) * 0.015)
  }
  cloth.translate(0.28, 1.82, 0)
  const n = pos.count
  const field = toLinear(palette.cloth)
  const stripe = toLinear(palette.crest)
  const arr = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const y = pos.getY(i)
    const c = y > 2.08 || y < 1.58 ? stripe : field
    arr[i * 3] = c.r
    arr[i * 3 + 1] = c.g
    arr[i * 3 + 2] = c.b
  }
  cloth.setAttribute('color', new THREE.BufferAttribute(arr, 3))

  const streamer = place(new THREE.PlaneGeometry(0.08, 0.46), palette.crest, 0.54, 1.55, 0.01)

  return collect([pole, cross, finial, spike, cloth, streamer])
}

export function createRockGeometry() {
  const a = place(new THREE.DodecahedronGeometry(0.55, 0), '#6a5a44', 0, 0.22, 0)
  const b = place(new THREE.DodecahedronGeometry(0.38, 0), '#5a4a36', 0.22, 0.16, 0.12, 0.3, 0.4)
  const c = place(new THREE.DodecahedronGeometry(0.28, 0), '#7a6a50', -0.18, 0.14, -0.1, 0.5, -0.3)
  return collect([a, b, c])
}

export function createTreeGeometry() {
  const trunk = place(new THREE.CylinderGeometry(0.07, 0.12, 0.95, 8), '#3a2a1c', 0, 0.45, 0, 0, 0, 0, 0.2)
  const crownA = place(new THREE.SphereGeometry(0.48, 12, 10), '#3a4a30', 0, 1.15, 0)
  const crownB = place(new THREE.SphereGeometry(0.36, 10, 8), '#4a5a38', 0.22, 1.28, 0.08)
  const crownC = place(new THREE.SphereGeometry(0.32, 10, 8), '#334028', -0.2, 1.22, -0.1)
  const crownD = place(new THREE.SphereGeometry(0.28, 10, 8), '#455434', 0.05, 1.52, -0.06)
  return collect([trunk, crownA, crownB, crownC, crownD])
}

export function createShadowGeometry() {
  const geo = new THREE.CircleGeometry(0.55, 18)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  const n = pos.count
  const arr = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const r = Math.hypot(pos.getX(i), pos.getZ(i)) / 0.55
    const shade = 1 - r
    arr[i * 3] = 0.07 * shade
    arr[i * 3 + 1] = 0.05 * shade
    arr[i * 3 + 2] = 0.03 * shade
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3))
  return geo
}



export function createLodSoldierGeometry(palette: Palette, level: 1 | 2, spearPitch: number) {
  if (level === 2) {
    const body = place(new THREE.BoxGeometry(0.26, 0.86, 0.2), palette.armor, 0, 0.7, 0)
    const head = place(new THREE.BoxGeometry(0.16, 0.2, 0.16), palette.helm, 0, 1.28, 0.02)
    const shield = place(new THREE.BoxGeometry(0.34, 0.48, 0.04), palette.shield, -0.3, 0.84, 0.14)
    const shaftLen = SPEAR_TIP + SPEAR_BUTT
    const shaft = new THREE.BoxGeometry(0.03, shaftLen, 0.03)
    shaft.translate(0, SPEAR_TIP - shaftLen / 2, 0)
    shaft.rotateX(spearPitch)
    shaft.translate(SPEAR_GRIP.x, SPEAR_GRIP.y, SPEAR_GRIP.z)
    paint(shaft, palette.spear)
    return collect([body, head, shield, shaft])
  }

  const segs = 7
  const leftLeg = place(new THREE.CapsuleGeometry(0.065, 0.38, 2, segs), palette.pants, -0.08, 0.255, 0.04, 0.08)
  const rightLeg = place(new THREE.CapsuleGeometry(0.065, 0.38, 2, segs), palette.pants, 0.085, 0.255, -0.04, -0.06)
  const torso = new THREE.CylinderGeometry(0.16, 0.2, 0.7, segs)
  torso.translate(0, 0.82, 0)
  paintLamellar(torso, palette.armor, '#3a281c')
  const head = place(new THREE.SphereGeometry(0.1, 8, 7), palette.skin, 0, 1.3, 0.03)
  const helm = new THREE.SphereGeometry(0.12, 8, 7, 0, Math.PI * 2, 0, Math.PI * 0.5)
  helm.translate(0, 1.32, 0.01)
  paint(helm, palette.helm, 0.08)
  const shield = place(new THREE.BoxGeometry(0.42, 0.58, 0.05), palette.shield, -0.34, 0.86, 0.16)
  const leftArm = place(new THREE.CapsuleGeometry(0.045, 0.28, 2, segs), palette.armor, -0.28, 0.9, 0.08, 0.7, 0, 0.4)
  const rightArm = place(new THREE.CapsuleGeometry(0.045, 0.28, 2, segs), palette.armor, 0.24, 0.96, 0.1, 0.7, 0, -0.3)
  const shaftLen = SPEAR_TIP + SPEAR_BUTT
  const shaft = new THREE.CylinderGeometry(0.012, 0.014, shaftLen, 6)
  shaft.translate(0, SPEAR_TIP - shaftLen / 2, 0)
  const tip = new THREE.ConeGeometry(0.03, 0.14, 6)
  tip.translate(0, SPEAR_TIP + 0.05, 0)
  shaft.rotateX(spearPitch)
  tip.rotateX(spearPitch)
  shaft.translate(SPEAR_GRIP.x, SPEAR_GRIP.y, SPEAR_GRIP.z)
  tip.translate(SPEAR_GRIP.x, SPEAR_GRIP.y, SPEAR_GRIP.z)
  paint(shaft, palette.spear)
  paint(tip, palette.tip)
  const boss = place(new THREE.SphereGeometry(0.05, 7, 5), palette.boss, -0.34, 0.86, 0.2, Math.PI / 2)
  const bun = place(new THREE.SphereGeometry(0.048, 7, 5), palette.hair, 0, 1.42, -0.06)
  return collect([leftLeg, rightLeg, torso, head, helm, shield, leftArm, rightArm, shaft, tip, boss, bun])
}
