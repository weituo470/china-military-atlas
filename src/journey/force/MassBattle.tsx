import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'
import { BATTLE_SURFACE_LIFT, groundHeight as terrainHeight } from './battleTerrain'
import { SurfaceAnchor } from './surfaceAnchor'
import {
  PEER,
  QIN,
  SPEAR_GRIP,
  type Palette,
  createBannerGeometry,
  createHorseGeometry,
  createShadowGeometry,
  createSoldierGeometry,
  createSpearGeometry,
  createLodSoldierGeometry,
  createRockGeometry,
  createTreeGeometry,
} from './unitGeometries'

export type BattleMode = 'clash' | 'encircle' | 'mass'


const Y_UP = new THREE.Vector3(0, 1, 0)
const WORLD_UP = new THREE.Vector3(0, 1, 0)
const _color = new THREE.Color()
const _matrix = new THREE.Matrix4()
const _position = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _scale = new THREE.Vector3()
const _euler = new THREE.Euler()
const _grip = new THREE.Vector3()
const _spearQ = new THREE.Quaternion()
const _pitchQ = new THREE.Quaternion()
const _axisX = new THREE.Vector3(1, 0, 0)
const _leanQ = new THREE.Quaternion()
const _stageOrigin = new THREE.Vector3()
const _combat = { dx: 0, dz: 0, dy: 0, lean: 0, sway: 0, spear: 0, yaw: 0 }

const TERRAIN = 0.92
const SOLDIER = 0.00208
const FILE_GAP = 0.00112
const RANK_GAP = 0.00142

function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const PLAIN_RADIUS = 1.8

function makeGroundTexture(companies: Company[]) {
  const size = 2048
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const mid = size / 2
  const image = ctx.createImageData(size, size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const wx = ((x - mid) / mid) * PLAIN_RADIUS
      const wz = ((y - mid) / mid) * PLAIN_RADIUS
      const u = wx / TERRAIN
      const v = wz / TERRAIN
      const grain = (Math.sin(x * 0.037) * Math.cos(y * 0.031) + Math.sin((x * 0.13 + y) * 0.018)) * 0.28
      const grass = Math.max(0, Math.sin(x * 0.07 + y * 0.045) * 0.45 + Math.sin(y * 0.11) * 0.22)
      const stream = Math.exp(-((u * 0.7 + Math.sin(v * 8) * 0.04 + 0.05) ** 2) / 0.0018)
      const tracks = Math.exp(-((u + 0.04) ** 2) / 0.01) * (0.14 + Math.abs(Math.sin(y * 0.18)) * 0.1)
      const trampling = Math.exp(-((u * 1.05) ** 2 + ((v - 0.22) * 0.85) ** 2) / 0.32) * 0.3
      const farHost = Math.exp(-((v - 0.62) ** 2) / 0.04 - (u ** 2) / 0.12) * 0.14
      const alongLine = wz > 0.008 && wz < 0.36
      const midX = alongLine ? contactMid(wz) : 0
      const biteW = alongLine ? Math.max(0, -contactGap(wz)) : 0
      const clashBand = alongLine ? Math.exp(-((wx - midX) ** 2) / (0.000007 + biteW * 0.0014 + 0.000003)) * (0.22 + biteW * 40) : 0
      const southWear = wz > -0.006 && wz < 0.028 ? Math.exp(-((wz - 0.01) ** 2) / 0.00022) * (0.16 + Math.abs(Math.sin(wx * 900 + wz * 700)) * 0.12) : 0
      const prints = southWear > 0.02 && ((Math.sin(wx * 2400) * Math.cos(wz * 2100) + hash(Math.floor(wx * 9000) + Math.floor(wz * 9000))) > 0.62) ? 0.18 : 0
      let red = 132 + grain * 22 + grass * 16 - stream * 18 - trampling * 26 - tracks * 18 - farHost * 22 - clashBand * 28 - southWear * 20 - prints * 16
      let green = 112 + grain * 14 + grass * 32 - stream * 8 - trampling * 22 - tracks * 12 - farHost * 16 - clashBand * 22 - southWear * 16 - prints * 12
      let blue = 72 + grain * 8 + grass * 6 - stream * 2 - trampling * 14 - tracks * 8 - farHost * 10 - clashBand * 14 - southWear * 10 - prints * 8
      const i = (y * size + x) * 4
      image.data[i] = Math.max(0, Math.min(255, red))
      image.data[i + 1] = Math.max(0, Math.min(255, green))
      image.data[i + 2] = Math.max(0, Math.min(255, blue))
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  ctx.globalCompositeOperation = 'multiply'
  for (const company of companies) {
    const px = mid + (company.cx / PLAIN_RADIUS) * mid
    const py = mid + (company.cz / PLAIN_RADIUS) * mid
    const rx = (company.depth / (PLAIN_RADIUS * 2)) * size * 0.95
    const ry = (company.width / (PLAIN_RADIUS * 2)) * size * 0.95
    const gradient = ctx.createRadialGradient(px, py, 2, px, py, Math.max(rx, ry))
    gradient.addColorStop(0, 'rgba(40, 28, 16, 0.32)')
    gradient.addColorStop(0.55, 'rgba(40, 28, 16, 0.14)')
    gradient.addColorStop(1, 'rgba(40, 28, 16, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(px, py, rx, ry, company.heading, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function makeSkyTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const gradient = ctx.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, '#6f8498')
  gradient.addColorStop(0.42, '#c9b696')
  gradient.addColorStop(0.5, '#b5a888') // Match the scene's ground fog at the horizon.
  gradient.addColorStop(1, '#b5a888')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 256)
  const sun = ctx.createRadialGradient(160, 81, 4, 160, 81, 47)
  sun.addColorStop(0, 'rgba(255, 230, 180, 0.85)')
  sun.addColorStop(0.25, 'rgba(255, 200, 130, 0.35)')
  sun.addColorStop(1, 'rgba(255, 200, 130, 0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, 0, 512, 256)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function makeSmokeTexture() {
  const size = 160
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const gradient = ctx.createRadialGradient(size * 0.5, size * 0.62, 6, size * 0.5, size * 0.42, size * 0.48)
  gradient.addColorStop(0, 'rgba(190, 170, 140, 0.55)')
  gradient.addColorStop(0.45, 'rgba(150, 132, 108, 0.22)')
  gradient.addColorStop(1, 'rgba(120, 104, 84, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

type Slot = {
  x: number
  z: number
  heading: number
  seed: number
  kind: 'foot' | 'cavalry' | 'banner' | 'fallen'
  side: 'west' | 'east' | 'ring' | 'pocket'
  live: boolean
  rank: number
  spearPitch: number
  lod: 0 | 1 | 2
  drive: number
}

type Company = {
  cx: number
  cz: number
  width: number
  depth: number
  heading: number
  side: Slot['side']
}

function pushRanks(
  into: Slot[],
  side: Slot['side'],
  cx: number,
  cz: number,
  files: number,
  ranks: number,
  heading: number,
  kind: Slot['kind'] = 'foot',
  liveChance = 1,
  fileGap = FILE_GAP,
  rankGap = RANK_GAP,
) {
  let n = into.length
  const faceX = Math.sin(heading)
  const faceZ = Math.cos(heading)
  const rightX = Math.cos(heading)
  const rightZ = -Math.sin(heading)
  for (let rank = 0; rank < ranks; rank++) {
    for (let file = 0; file < files; file++) {
      if (rank === ranks - 1 && hash(n * 1.7 + cx * 80) > 0.9) continue
      const jitter = rank < 3 ? 0.03 : 0.08
      const stagger = rank < 3 ? 0.04 : 0.1
      const alongFile = (file - (files - 1) / 2 + (rank % 2) * stagger + (hash(n + 3) - 0.5) * jitter) * fileGap
      const alongRank = ((ranks - 1) / 2 - rank + (hash(n + 8) - 0.5) * jitter * 0.8) * rankGap
      const x = cx + alongFile * rightX + alongRank * faceX
      const z = cz + alongFile * rightZ + alongRank * faceZ
      const fallen = kind === 'foot' && liveChance < 1 && hash(n + 11) > liveChance
      const spearPitch =
        kind === 'foot'
          ? rank < 3
            ? 1.22 + (hash(n + 17) - 0.5) * 0.1
            : rank < 6
              ? 0.7 + (hash(n + 17) - 0.5) * 0.12
              : 0.28 + (hash(n + 17) - 0.5) * 0.1
          : 0.2
      into.push({
        x,
        z,
        heading: heading + (hash(n + 9) - 0.5) * (fallen ? 1.3 : rank < 3 ? 0.02 : 0.045),
        seed: hash(n + 13),
        kind: fallen ? 'fallen' : kind,
        side,
        live: !fallen,
        rank,
        spearPitch: fallen ? 1.45 + hash(n + 19) * 0.2 : spearPitch,
        lod: 2,
        drive: 1,
      })
      n++
    }
  }
}

function measure(files: number, ranks: number, fileGap = FILE_GAP, rankGap = RANK_GAP) {
  return { width: files * fileGap, depth: ranks * rankGap }
}

function plantBanner(into: Slot[], company: Company) {
  const rear = company.depth * 0.38
  into.push({
    x: company.cx - Math.sin(company.heading) * rear,
    z: company.cz - Math.cos(company.heading) * rear,
    heading: company.heading,
    seed: hash(company.cx * 40 + company.cz * 18),
    kind: 'banner',
    side: company.side,
    live: true,
    rank: 0,
    spearPitch: 0,
    lod: 0,
    drive: 1,
  })
}

function addCompany(
  into: Slot[],
  companies: Company[],
  side: Slot['side'],
  cx: number,
  cz: number,
  files: number,
  ranks: number,
  heading: number,
  liveChance = 1,
  kind: Slot['kind'] = 'foot',
  fileGap = FILE_GAP,
  rankGap = RANK_GAP,
) {
  const size = measure(files, ranks, fileGap, rankGap)
  const company: Company = { cx, cz, width: size.width, depth: size.depth, heading, side }
  companies.push(company)
  pushRanks(into, side, cx, cz, files, ranks, heading, kind, liveChance, fileGap, rankGap)
  if (kind === 'foot') plantBanner(into, company)
}

const LINE_OFFSET = 0.02
const LINE_START = 0.028
const HOST_FILES = 24
const HOST_RANKS = 16
const HOST_ALONG = 12
const HOST_DEEP = 11
const FILE_SPAN = HOST_FILES * FILE_GAP
const RANK_SPAN = HOST_RANKS * RANK_GAP
const AISLE_Z = 0.0015
const AISLE_X = 0.0018
const Z_PITCH = FILE_SPAN + AISLE_Z
const X_PITCH = RANK_SPAN + AISLE_X
const FRONT_GAP = 0.0022
const HOST_SPAN_Z = (HOST_ALONG - 1) * Z_PITCH
const LINE_SOUTH = LINE_START - ((HOST_FILES - 1) / 2) * FILE_GAP
const LINE_NORTH = LINE_START + (HOST_ALONG - 1) * Z_PITCH + ((HOST_FILES - 1) / 2) * FILE_GAP

/** Signed mid-line displacement (east-positive). Knots sit on company columns. */
const CONTACT_MID = [0.0064, 0.0012, -0.0058, 0.0006, 0.0068, 0.0018, -0.0008, -0.006, 0.0016, -0.001, -0.0036, 0.0011]

function contactU(z: number) {
  return (z - LINE_START) / Z_PITCH
}

function contactMid(z: number) {
  const u = contactU(z)
  const i = Math.floor(u)
  const f = u - i
  const a = CONTACT_MID[Math.max(0, Math.min(CONTACT_MID.length - 1, i))] ?? 0
  const b = CONTACT_MID[Math.max(0, Math.min(CONTACT_MID.length - 1, i + 1))] ?? a
  const s = f * f * (3 - 2 * f)
  return a + (b - a) * s
}

/** Resting gap between the two front faces at z. Negative = interpenetration (a bite). */
function contactGap(z: number) {
  const abs = Math.abs(contactMid(z))
  if (abs < 0.0022) return 0.00145 + (0.0022 - abs) * 0.3
  return 0.0002 - (abs - 0.0022) * 1.45
}

/** Positive: Qin (west) wedges east; negative: the peer wedges west. */
function contactBite(z: number) {
  const mid = contactMid(z)
  const gap = contactGap(z)
  const depth = Math.max(0, -gap)
  if (depth <= 0) return 0
  return Math.sign(mid) * depth
}

function nearestBitePeak(z: number) {
  const u = contactU(z)
  let best = LINE_START
  let bestAbs = 0
  for (let i = 0; i < CONTACT_MID.length; i++) {
    const mid = CONTACT_MID[i] ?? 0
    const zi = LINE_START + i * Z_PITCH
    const gap = contactGap(zi)
    const depth = Math.max(0, -gap)
    if (depth > 0.0008 && Math.abs(mid) >= bestAbs && Math.abs(u - i) <= 1.6) {
      bestAbs = Math.abs(mid)
      best = zi
    }
  }
  if (bestAbs === 0) {
    let i = Math.max(0, Math.min(CONTACT_MID.length - 1, Math.round(u)))
    best = LINE_START + i * Z_PITCH
  }
  return best
}

function makeFallenSlot(x: number, z: number, west: boolean, n: number): Slot {
  return {
    x,
    z,
    heading: (west ? Math.PI / 2 : -Math.PI / 2) + (hash(n + 9) - 0.5) * 1.85,
    seed: hash(n + 13),
    kind: 'fallen',
    side: west ? 'west' : 'east',
    live: false,
    rank: 0,
    spearPitch: 1.38 + hash(n + 19) * 0.28,
    lod: 0,
    drive: 0.15,
  }
}

function applyBiteAndYield(qin: Slot[], peer: Slot[]) {
  const dress = (slot: Slot) => {
    if ((slot.side !== 'west' && slot.side !== 'east') || slot.kind === 'cavalry' || slot.kind === 'banner') return
    const mid = contactMid(slot.z)
    const signed = contactBite(slot.z)
    const depth = Math.abs(signed)
    const isWest = slot.side === 'west'
    const depthX = Math.abs(slot.x)
    const follow = depthX < 0.02 ? 1 : depthX < 0.045 ? 0.7 : depthX < 0.07 ? 0.4 : depthX < 0.1 ? 0.2 : 0.08
    slot.x += mid * follow
    const biteFactor = depth / 0.0042
    slot.drive = 0.55 + Math.min(1, biteFactor) * 0.7 + (slot.seed - 0.5) * 0.22
    if (depth < 0.00035) return
    const westIsAggressor = signed > 0
    const isAggressor = isWest === westIsAggressor
    if (isAggressor && slot.rank < 4) {
      const step = depth * ((3.35 - slot.rank) / 3.35)
      slot.x += (isWest ? 1 : -1) * step
    } else if (!isAggressor && slot.rank < 5) {
      const back = depth * 0.78 * ((4.2 - slot.rank) / 4.2)
      slot.x += (isWest ? -1 : 1) * back
      const peak = nearestBitePeak(slot.z)
      const away = Math.sign(slot.z - peak) || (slot.seed > 0.5 ? 1 : -1)
      const squeeze = Math.max(0.2, Math.min(1.4, biteFactor))
      slot.z += away * FILE_GAP * (0.22 + (4 - slot.rank) * 0.16) * squeeze
      slot.heading += away * 0.16 * squeeze * (1 - slot.rank / 5)
    }
  }
  for (const slot of qin) dress(slot)
  for (const slot of peer) dress(slot)
}

function dressEdgesAndContact(slots: Slot[]) {
  for (const slot of slots) {
    if (slot.kind === 'cavalry' || slot.kind === 'banner') continue
    const mid = contactMid(slot.z)
    const contactDist = Math.abs(slot.x - mid)
    const edgeSouth = slot.z - LINE_SOUTH
    const edgeNorth = LINE_NORTH - slot.z
    const edge = Math.min(edgeSouth, edgeNorth)
    const contactW = THREE.MathUtils.smoothstep(0.018, 0.002, contactDist)
    const edgeW = THREE.MathUtils.smoothstep(FILE_GAP * 5.5, 0, edge)
    const southW = THREE.MathUtils.smoothstep(FILE_GAP * 4.4, 0, edgeSouth)
    const amp = 0.16 + contactW * 0.55 + edgeW * 0.75 + southW * 0.95
    const n = slot.seed * 97 + slot.x * 800 + slot.z * 430
    if (slot.kind !== 'fallen') {
      slot.x += (hash(n) - 0.5) * FILE_GAP * amp * 0.4
      slot.z += (hash(n + 1) - 0.5) * FILE_GAP * amp
      slot.heading += (hash(n + 2) - 0.5) * (0.045 + contactW * 0.12 + southW * 0.28)
    }
    if (southW > 0.45 && slot.live && slot.kind === 'foot' && hash(n + 5) > 0.7) {
      slot.z -= FILE_GAP * (0.45 + hash(n + 6) * 0.75) * southW
      slot.x += (hash(n + 7) - 0.5) * FILE_GAP * 0.85
      slot.heading += (hash(n + 8) - 0.5) * 0.42
    }
  }
}

function cutSouthGaps(slots: Slot[]) {
  const kept: Slot[] = []
  for (const slot of slots) {
    const mid = contactMid(slot.z)
    const nearSouth = slot.z < LINE_SOUTH + FILE_GAP * 3.1
    const nearFront = Math.abs(slot.x - mid) < 0.055
    const n = slot.seed * 140 + slot.x * 920
    if (slot.kind === 'foot' && slot.live && nearSouth && nearFront && slot.rank < 8 && hash(n) > 0.8) continue
    kept.push(slot)
  }
  slots.length = 0
  slots.push(...kept)
}

function separateOpponents(qin: Slot[], peer: Slot[]) {
  const minDist = 0.001
  const minDistSq = minDist * minDist
  const cell = 0.0024
  const keyOf = (x: number, z: number) => `${Math.floor(x / cell)}:${Math.floor(z / cell)}`
  const interesting = (slot: Slot) =>
    (slot.kind === 'foot' || slot.kind === 'fallen') && (slot.side === 'west' || slot.side === 'east') && Math.abs(slot.x - contactMid(slot.z)) < 0.02
  const west = qin.filter(interesting)
  const east = peer.filter(interesting)
  const grid = new Map<string, Slot[]>()
  for (const slot of west) {
    const k = keyOf(slot.x, slot.z)
    const list = grid.get(k)
    if (list) list.push(slot)
    else grid.set(k, [slot])
  }
  const nearby = (slot: Slot) => {
    const found: Slot[] = []
    const cx = Math.floor(slot.x / cell)
    const cz = Math.floor(slot.z / cell)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const list = grid.get(`${cx + dx}:${cz + dz}`)
        if (list) found.push(...list)
      }
    }
    return found
  }
  for (let iter = 0; iter < 3; iter++) {
    for (const e of east) {
      if (e.kind === 'fallen') continue
      for (const w of nearby(e)) {
        if (w.kind === 'fallen') continue
        const dx = e.x - w.x
        const dz = e.z - w.z
        const d2 = dx * dx + dz * dz
        if (d2 >= minDistSq || d2 < 1e-12) continue
        const d = Math.sqrt(d2)
        const push = (minDist - d) * 0.55
        const ux = dx / d
        const uz = dz / d
        const wShare = w.rank <= e.rank ? 0.35 : 0.65
        w.x -= ux * push * wShare
        w.z -= uz * push * wShare
        e.x += ux * push * (1 - wShare)
        e.z += uz * push * (1 - wShare)
      }
    }
  }
}

function assignLods(slots: Slot[], lod0Max = 1400, lod1Max = 4000) {
  const camX = 0.008
  const camZ = 0.016
  const distOf = (slot: Slot) => Math.hypot(slot.x - camX, (slot.z - camZ) * 0.85)
  const foot = slots.filter((slot) => slot.kind === 'foot' || slot.kind === 'fallen')
  const ranked = foot.slice().sort((a, b) => distOf(a) - distOf(b))
  const lod0 = new Set(ranked.slice(0, lod0Max))
  const lod1 = new Set(ranked.slice(lod0Max, lod0Max + lod1Max))
  for (const slot of slots) {
    if (slot.kind === 'banner') slot.lod = 0
    else if (slot.kind === 'cavalry') slot.lod = 1
    else if (lod0.has(slot)) slot.lod = 0
    else if (lod1.has(slot)) slot.lod = 1
    else slot.lod = 2
  }
}

function plantClashFallen(qin: Slot[], peer: Slot[], along: number) {
  let n = 90001
  for (let i = 0; i < along; i++) {
    const z0 = LINE_START + i * Z_PITCH
    const bite = Math.abs(contactBite(z0))
    const count = 8 + Math.floor(hash(n) * 5) + Math.floor(bite / RANK_GAP * 3.2)
    for (let k = 0; k < count; k++) {
      n++
      const z = z0 + (hash(n + 1) - 0.5) * (FILE_SPAN * 0.92)
      const mid = contactMid(z)
      const spread = 0.00135 + Math.max(0, -contactGap(z)) * 0.85
      const x = mid + (hash(n + 3) - 0.5) * spread * 2
      const west = hash(n + 7) > 0.48
      ;(west ? qin : peer).push(makeFallenSlot(x, z, west, n))
    }
  }
  for (let k = 0; k < 38; k++) {
    n++
    const z = LINE_SOUTH - FILE_GAP * (0.35 + hash(n + 1) * 2.8)
    const x = contactMid(LINE_START) + (hash(n + 3) - 0.5) * 0.024
    const west = hash(n + 7) > 0.5
    ;(west ? qin : peer).push(makeFallenSlot(x, z, west, n))
  }
}

function addCavalryFlanks(qin: Slot[], peer: Slot[], companies: Company[], along: number, z0: number) {
  const south = z0 - 0.018
  const north = z0 + (along - 1) * Z_PITCH + 0.018
  const x = FRONT_GAP / 2 + RANK_SPAN / 2 + 2 * X_PITCH
  addCompany(qin, companies, 'west', -x, south, 10, 6, Math.PI / 2 + 0.18, 1, 'cavalry', FILE_GAP * 1.7, RANK_GAP * 1.75)
  addCompany(qin, companies, 'west', -x, north, 10, 6, Math.PI / 2 - 0.18, 1, 'cavalry', FILE_GAP * 1.7, RANK_GAP * 1.75)
  addCompany(peer, companies, 'east', x, south, 10, 6, -Math.PI / 2 - 0.16, 1, 'cavalry', FILE_GAP * 1.7, RANK_GAP * 1.75)
  addCompany(peer, companies, 'east', x, north, 10, 6, -Math.PI / 2 + 0.16, 1, 'cavalry', FILE_GAP * 1.7, RANK_GAP * 1.75)
}

function layoutHost(along: number, deep: number): { qin: Slot[]; peer: Slot[]; companies: Company[] } {
  const qin: Slot[] = []
  const peer: Slot[] = []
  const companies: Company[] = []
  for (let layer = 0; layer < deep; layer++) {
    const live = layer === 0 ? 0.86 : layer === 1 ? 0.94 : 0.997
    const x = FRONT_GAP / 2 + RANK_SPAN / 2 + layer * X_PITCH
    for (let i = 0; i < along; i++) {
      const z = LINE_START + i * Z_PITCH
      addCompany(qin, companies, 'west', -x, z, HOST_FILES, HOST_RANKS, Math.PI / 2, live)
      addCompany(peer, companies, 'east', x, z + 0.0004, HOST_FILES, HOST_RANKS, -Math.PI / 2, live)
    }
  }
  addCavalryFlanks(qin, peer, companies, along, LINE_START)
  applyBiteAndYield(qin, peer)
  dressEdgesAndContact(qin)
  dressEdgesAndContact(peer)
  cutSouthGaps(qin)
  cutSouthGaps(peer)
  separateOpponents(qin, peer)
  plantClashFallen(qin, peer, along)
  assignLods(qin)
  assignLods(peer)
  return { qin, peer, companies }
}

function layoutClash(): { qin: Slot[]; peer: Slot[]; companies: Company[] } {
  return layoutHost(HOST_ALONG, HOST_DEEP)
}

function layoutEncircle(close: number): { qin: Slot[]; peer: Slot[]; companies: Company[] } {
  const qin: Slot[] = []
  const peer: Slot[] = []
  const companies: Company[] = []
  const pocket = 8
  for (let i = 0; i < pocket; i++) {
    const a = (i / pocket) * Math.PI * 2
    const x = Math.cos(a) * 0.028
    const z = Math.sin(a) * 0.024 + 0.16
    addCompany(peer, companies, 'pocket', x, z, 20, 14, a + Math.PI, 0.8)
  }
  const layers = 8
  const around = 18
  const radius0 = THREE.MathUtils.lerp(0.175, 0.12, close)
  for (let layer = 0; layer < layers; layer++) {
    const radius = radius0 + layer * 0.026
    for (let i = 0; i < around; i++) {
      const a = (i / around) * Math.PI * 2 - Math.PI / 2
      const cx = Math.cos(a) * radius
      const cz = Math.sin(a) * radius * 0.88 + 0.16
      addCompany(qin, companies, 'ring', cx, cz, 26, 16, a + Math.PI, layer === 0 ? 0.9 : 0.995)
    }
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2
    const r = radius0 + layers * 0.026 + 0.012
    addCompany(qin, companies, 'ring', Math.cos(a) * r, Math.sin(a) * r * 0.88 + 0.16, 8, 5, a + Math.PI, 1, 'cavalry', FILE_GAP * 1.7, RANK_GAP * 1.7)
  }
  assignLods(qin)
  assignLods(peer)
  return { qin, peer, companies }
}

function layoutMass(): { qin: Slot[]; peer: Slot[]; companies: Company[] } {
  return layoutHost(14, 10)
}

function slotXZ(slot: Slot, advance: number) {
  let x = slot.x
  let z = slot.z
  const push = advance * (slot.drive ?? 1)
  if (slot.side === 'west') x += push
  if (slot.side === 'east') x -= push
  if (slot.side === 'ring') {
    const len = Math.hypot(x, z - LINE_OFFSET) || 1
    x -= (x / len) * push * 0.55
    z -= ((z - LINE_OFFSET) / len) * push * 0.55
  }
  return { x, z }
}

function combatMotion(slot: Slot, time: number) {
  _combat.dx = 0
  _combat.dz = 0
  _combat.dy = 0
  _combat.lean = 0
  _combat.sway = 0
  _combat.spear = 0
  _combat.yaw = 0
  if (slot.kind === 'fallen' || !slot.live) return
  const intensity = slot.lod === 0 ? 1 : slot.lod === 1 ? (slot.rank < 3 ? 0.7 : 0.35) : 0.2
  if (slot.kind === 'banner') {
    _combat.sway = Math.sin(time * 1.7 + slot.seed * 5) * 0.12
    return
  }
  const faceX = Math.sin(slot.heading)
  const faceZ = Math.cos(slot.heading)
  const rightX = Math.cos(slot.heading)
  const rightZ = -Math.sin(slot.heading)
  if (slot.kind === 'cavalry') {
    const trot = time * (1.55 + slot.seed * 0.35) + slot.seed * 8
    const along = Math.sin(trot * 0.42) * 0.007
    const toward = Math.sin(trot * 0.42 + 0.8) * 0.0022
    _combat.dx = (rightX * along + faceX * toward) * intensity
    _combat.dz = (rightZ * along + faceZ * toward) * intensity
    // Tiny hoof bounce around the ground, never a hover.
    _combat.dy = Math.abs(Math.sin(trot * 2.2)) * 0.00005 * intensity
    _combat.yaw = Math.cos(trot * 0.42) * 0.18 * intensity
    _combat.lean = 0.05 * intensity
    return
  }
  const front = slot.rank < 3
  const phase = time * (2.05 + slot.seed * 0.7) + slot.seed * 6.283185
  const wave = Math.sin(phase)
  const thrust = Math.max(0, wave)
  const recoil = Math.min(0, wave)
  const depth = slot.rank === 0 ? 1 : slot.rank === 1 ? 0.62 : slot.rank === 2 ? 0.38 : 0.16
  const lunge = (thrust * 0.00078 * depth + recoil * 0.00018 * depth) * intensity
  const ripple = front ? 0 : Math.sin(time * 0.9 + slot.z * 40 + slot.seed * 3) * 0.00008 * intensity
  _combat.dx = faceX * (lunge + ripple)
  _combat.dz = faceZ * (lunge + ripple)
  // Squat into the thrust; never lift the planted foot off the loess.
  _combat.dy = front ? -thrust * 0.000025 * intensity : 0
  _combat.lean = (front ? 0.08 + thrust * 0.22 : 0.03 + Math.sin(time * 1.2 + slot.seed * 5) * 0.02) * intensity
  _combat.sway = Math.sin(time * 0.45 + slot.seed * 4) * (front ? 0.03 : 0.02) * intensity
  _combat.spear = (front ? thrust * 0.16 + recoil * 0.06 : Math.sin(time * 0.8 + slot.seed * 3) * 0.03) * intensity
}

function poseSlot(slot: Slot, scale: number, time: number, advance: number) {
  combatMotion(slot, time)
  const base = slotXZ(slot, advance)
  const x = base.x + _combat.dx
  const z = base.z + _combat.dz
  const height = terrainHeight(x, z)
  const fallen = slot.kind === 'fallen'
  _position.set(x, height + _combat.dy, z)
  if (fallen) {
    _euler.set(Math.PI / 2 - 0.18, slot.heading, (slot.seed - 0.5) * 0.5)
    _quaternion.setFromEuler(_euler)
  } else {
    _quaternion.setFromAxisAngle(Y_UP, slot.heading + _combat.sway + _combat.yaw)
    if (_combat.lean) {
      _leanQ.setFromAxisAngle(_axisX, _combat.lean)
      _quaternion.multiply(_leanQ)
    }
  }
  const s = scale * (slot.kind === 'cavalry' ? 1.28 : slot.kind === 'banner' ? 0.92 : fallen ? 0.96 : 1)
  const flutter = slot.kind === 'banner' ? 1 + Math.sin(time * 2.15 + slot.seed) * 0.05 : 1
  _scale.set(s * flutter, s, s)
  return { x, z, height, fallen, s }
}

function applySlot(mesh: THREE.InstancedMesh, index: number, slot: Slot, scale: number, time: number, advance: number) {
  poseSlot(slot, scale, time, advance)
  _matrix.compose(_position, _quaternion, _scale)
  mesh.setMatrixAt(index, _matrix)
}

function applySpear(mesh: THREE.InstancedMesh, index: number, slot: Slot, scale: number, time: number, advance: number) {
  const posed = poseSlot(slot, scale, time, advance)
  if (posed.fallen && slot.seed > 0.6) {
    _scale.set(0, 0, 0)
    _matrix.compose(_position, _quaternion, _scale)
    mesh.setMatrixAt(index, _matrix)
    return
  }
  _grip.set(SPEAR_GRIP.x, SPEAR_GRIP.y, SPEAR_GRIP.z).multiplyScalar(posed.s).applyQuaternion(_quaternion).add(_position)
  if (posed.fallen) {
    _grip.y = posed.height + 0.0002
    _euler.set(Math.PI / 2 - 0.08, slot.heading + (slot.seed - 0.5) * 0.8, 0)
    _spearQ.setFromEuler(_euler)
  } else {
    _pitchQ.setFromAxisAngle(_axisX, slot.spearPitch + _combat.spear)
    _spearQ.copy(_quaternion).multiply(_pitchQ)
  }
  _matrix.compose(_grip, _spearQ, _scale)
  mesh.setMatrixAt(index, _matrix)
}

function applyShadow(mesh: THREE.InstancedMesh, index: number, slot: Slot, scale: number, time: number, advance: number) {
  const posed = poseSlot(slot, scale, time, advance)
  _position.set(posed.x, posed.height + 0.00016, posed.z)
  _quaternion.setFromAxisAngle(Y_UP, slot.heading)
  const s = posed.s * (slot.kind === 'cavalry' ? 1.55 : posed.fallen ? 1.35 : 1.08)
  _scale.set(s, 1, s * 0.72)
  _matrix.compose(_position, _quaternion, _scale)
  mesh.setMatrixAt(index, _matrix)
}

function unitMaterial(roughness = 0.58, metalness = 0.14) {
  return new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness,
    metalness,
  })
}

function tintInstances(mesh: THREE.InstancedMesh, slots: Slot[]) {
  for (let i = 0; i < slots.length; i++) {
    _color.setRGB(1, 1, 1)
    const fallen = slots[i].kind === 'fallen'
    _color.offsetHSL((slots[i].seed - 0.5) * 0.03, 0, (slots[i].seed - 0.5) * 0.1 - (fallen ? 0.16 : 0))
    mesh.setColorAt(i, _color)
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}

function NorthAligned({ lat, lon, children }: { lat: number; lon: number; children: ReactNode }) {
  const quaternion = useMemo(() => {
    const origin = latLngToVector3(lat, lon, 1).normalize()
    const towardNorth = latLngToVector3(Math.min(89, lat + 0.35), lon, 1).normalize()
    const north = towardNorth.addScaledVector(origin, -towardNorth.dot(origin)).normalize()
    if (north.lengthSq() < 1e-8) north.set(0, 0, 1)
    const east = new THREE.Vector3().crossVectors(origin, north).normalize()
    const parentQ = new THREE.Quaternion().setFromUnitVectors(WORLD_UP, origin)
    const inv = parentQ.clone().invert()
    const localNorth = north.clone().applyQuaternion(inv)
    const localEast = east.clone().applyQuaternion(inv)
    const matrix = new THREE.Matrix4().makeBasis(localEast, Y_UP, localNorth)
    return new THREE.Quaternion().setFromRotationMatrix(matrix)
  }, [lat, lon])
  return <group quaternion={quaternion}>{children}</group>
}

function Ground({ companies }: { companies: Company[] }) {
  const texture = useMemo(() => makeGroundTexture(companies), [companies])
  const geometry = useMemo(() => {
    // Ring with many radial segments so terrainHeight is shared with soldiers
    // (a triangle-fan CircleGeometry stays nearly flat in the interior).
    const geo = new THREE.RingGeometry(0, PLAIN_RADIUS, 128, 96)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      pos.setY(i, terrainHeight(x, z))
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [])
  useEffect(
    () => () => {
      geometry.dispose()
      texture?.dispose()
    },
    [geometry, texture],
  )
  return (
    <mesh name="loess-plain" geometry={geometry} position={[0, 0, 0]} receiveShadow={false}>
      <meshLambertMaterial
        map={texture ?? undefined}
        color={texture ? '#ffffff' : '#8a7350'}
        depthWrite
      />
    </mesh>
  )
}

function Sky({ appear }: { appear: number }) {
  const texture = useMemo(() => makeSkyTexture(), [])
  useEffect(() => () => texture?.dispose(), [texture])
  if (appear <= 0.04) return null
  return (
    <mesh rotation={[0, 0.4, 0]} renderOrder={-2}>
      <sphereGeometry args={[2.4, 48, 24]} />
      <meshBasicMaterial
        map={texture ?? undefined}
        color={texture ? '#ffffff' : '#b7b3a6'}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        transparent
        opacity={appear}
      />
    </mesh>
  )
}

function Scatter({ appear }: { appear: number }) {
  const treeGeom = useMemo(() => createTreeGeometry(), [])
  const rockGeom = useMemo(() => createRockGeometry(), [])
  const treeMat = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true }), [])
  const rockMat = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true }), [])
  const trees = useMemo(
    () =>
      [
        [-0.38, 0.3, 1.15],
        [-0.4, 0.16, 1.05],
        [-0.36, -0.08, 0.95],
        [0.39, 0.28, 1.2],
        [0.41, 0.08, 1.0],
        [0.37, 0.36, 0.9],
        [-0.22, 0.4, 1.1],
        [0.2, 0.41, 1.05],
        [-0.42, 0.22, 0.85],
        [0.43, 0.18, 0.88],
        [-0.34, -0.14, 0.8],
        [0.33, -0.13, 0.9],
        [-0.3, 0.38, 1.0],
        [0.28, 0.39, 0.92],
      ] as Array<[number, number, number]>,
    [],
  )
  const rocks = useMemo(
    () =>
      [
        [-0.34, 0.36, 0.004],
        [0.35, 0.34, 0.0036],
        [-0.4, 0.12, 0.0032],
        [0.41, -0.06, 0.003],
        [0.18, 0.4, 0.0028],
        [-0.16, -0.12, 0.0034],
        [0.3, -0.11, 0.0026],
        [-0.42, 0.2, 0.0038],
      ] as Array<[number, number, number]>,
    [],
  )
  useEffect(
    () => () => {
      treeGeom.dispose()
      rockGeom.dispose()
      treeMat.dispose()
      rockMat.dispose()
    },
    [rockGeom, rockMat, treeGeom, treeMat],
  )
  return (
    <group visible={appear > 0.05}>
      {trees.map(([x, z, s], index) => (
        <mesh key={`t${index}`} geometry={treeGeom} material={treeMat} position={[x, terrainHeight(x, z), z]} scale={s * 0.0034} />
      ))}
      {rocks.map(([x, z, s], index) => (
        <mesh key={`r${index}`} geometry={rockGeom} material={rockMat} position={[x, terrainHeight(x, z), z]} scale={s * 1.1} />
      ))}
    </group>
  )
}

function Grass({ appear }: { appear: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.0007, 0.0014)
    geo.translate(0, 0.0007, 0)
    return geo
  }, [])
  const material = useMemo(
    () => new THREE.MeshLambertMaterial({ color: '#5a6840', side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
    [],
  )
  const positions = useMemo(() => {
    const list: Array<[number, number, number]> = []
    for (let i = 0; i < 1400; i++) {
      const a = hash(i + 1) * Math.PI * 2
      const r = 0.22 + hash(i + 4) * 0.22
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r * 0.95 + 0.12
      if (Math.abs(x) < 0.36 && z > -0.04 && z < 0.42) continue
      list.push([x, terrainHeight(x, z), z])
    }
    return list
  }, [])
  useEffect(() => {
    if (!mesh.current) return
    for (let i = 0; i < positions.length; i++) {
      const [x, y, z] = positions[i]
      const s = 0.7 + hash(i + 9) * 0.7
      _position.set(x, y, z)
      _quaternion.setFromAxisAngle(Y_UP, hash(i + 2) * Math.PI)
      _scale.set(s, s, s)
      _matrix.compose(_position, _quaternion, _scale)
      mesh.current.setMatrixAt(i, _matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  }, [positions])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  material.opacity = 0.35 + appear * 0.5
  return <instancedMesh ref={mesh} args={[geometry, material, positions.length]} frustumCulled={false} />
}

function ClashDust({ appear, mode, motion }: { appear: number; mode: BattleMode; motion: RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const texture = useMemo(() => makeSmokeTexture(), [])
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture ?? undefined,
        color: '#c4ae8a',
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: true,
      }),
    [texture],
  )
  const puffs = useMemo(() => {
    const count = mode === 'encircle' ? 48 : 90
    return Array.from({ length: count }, (_, i) => {
      if (mode === 'encircle') {
        const a = (i / count) * Math.PI * 2
        return { x: Math.cos(a) * 0.04, z: Math.sin(a) * 0.035 + 0.16, seed: hash(i + 21), s: 0.01 + hash(i + 5) * 0.01 }
      }
      const z = LINE_START + hash(i + 9) * HOST_SPAN_Z
      const mid = contactMid(z)
      const bite = Math.max(0, -contactGap(z))
      const spread = 0.0016 + bite * 1.05 + hash(i + 11) * 0.0045
      return {
        x: mid + (hash(i + 2) - 0.5) * spread * 2,
        z,
        seed: hash(i + 21),
        s: 0.007 + bite * 0.9 + hash(i + 5) * 0.012,
      }
    })
  }, [mode])
  useFrame(() => {
    if (!mesh.current) return
    const t = motion.current
    for (let i = 0; i < puffs.length; i++) {
      const puff = puffs[i]
      const rise = (t * (0.22 + puff.seed * 0.12) + puff.seed) % 1
      const x = puff.x + Math.sin(t * 0.6 + puff.seed * 8) * 0.0012
      const z = puff.z + Math.cos(t * 0.5 + puff.seed * 5) * 0.001
      const y = terrainHeight(x, z) + 0.0012 + rise * 0.01
      const s = puff.s * (0.8 + rise * 1.3)
      _position.set(x, y, z)
      _quaternion.setFromAxisAngle(Y_UP, puff.seed * 6 + t * 0.15)
      _scale.set(s * 1.6, s, s * 1.6)
      _matrix.compose(_position, _quaternion, _scale)
      mesh.current.setMatrixAt(i, _matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    material.opacity = appear * 0.28
  })
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      texture?.dispose()
    },
    [geometry, material, texture],
  )
  if (appear <= 0.04) return null
  return <instancedMesh ref={mesh} args={[geometry, material, puffs.length]} frustumCulled={false} renderOrder={5} />
}

function Smoke({ appear, mode, motion }: { appear: number; mode: BattleMode; motion: RefObject<number> }) {
  const texture = useMemo(() => makeSmokeTexture(), [])
  const group = useRef<THREE.Group>(null)
  const columns = useMemo(() => {
    if (mode === 'encircle') {
      return Array.from({ length: 12 }, (_, i) => ({
        x: Math.cos((i / 12) * Math.PI * 2) * 0.08,
        z: Math.sin((i / 12) * Math.PI * 2) * 0.07 + 0.16,
        h: 0.016 + (i % 3) * 0.004,
        seed: i * 0.2,
      }))
    }
    return Array.from({ length: 22 }, (_, i) => {
      const z = LINE_START + (i / 21) * HOST_SPAN_Z
      const mid = contactMid(z)
      const bite = Math.max(0, -contactGap(z))
      return {
        x: mid + (hash(i + 3) - 0.5) * (0.004 + bite * 0.8),
        z,
        h: 0.008 + (i % 3) * 0.003 + bite * 0.004,
        seed: i * 0.17,
      }
    })
  }, [mode])
  useFrame(() => {
    if (!group.current) return
    const t = motion.current
    group.current.children.forEach((child, index) => {
      const mesh = child as THREE.Mesh
      const material = mesh.material as THREE.MeshBasicMaterial
      const seed = columns[index]?.seed ?? 0
      // Keep a low veil at the contact line, not an opaque column over faces.
      material.opacity = appear * (0.14 + Math.sin(t * 0.3 + seed * 6) * 0.045)
      mesh.position.y = columns[index].h * 0.55 + Math.sin(t * 0.34 + seed) * 0.0005
    })
  })
  useEffect(() => () => texture?.dispose(), [texture])
  return (
    <group ref={group}>
      {columns.map((column, index) => (
        <mesh key={index} position={[column.x, column.h * 0.55, column.z]} renderOrder={4}>
          <planeGeometry args={[0.034, column.h]} />
          <meshBasicMaterial
            map={texture ?? undefined}
            color="#c6b496"
            transparent
            opacity={0.2}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog
          />
        </mesh>
      ))}
    </group>
  )
}

function ArmyInstances({
  slots,
  palette,
  visible,
  motion,
}: {
  slots: Slot[]
  palette: Palette
  visible: number
  motion: RefObject<number>
}) {
  const lod0 = useMemo(() => slots.filter((slot) => (slot.kind === 'foot' || slot.kind === 'fallen') && slot.lod === 0), [slots])
  const lod1Front = useMemo(
    () => slots.filter((slot) => (slot.kind === 'foot' || slot.kind === 'fallen') && slot.lod === 1 && slot.rank < 3),
    [slots],
  )
  const lod1Rear = useMemo(
    () => slots.filter((slot) => (slot.kind === 'foot' || slot.kind === 'fallen') && slot.lod === 1 && slot.rank >= 3),
    [slots],
  )
  const lod2Front = useMemo(
    () => slots.filter((slot) => (slot.kind === 'foot' || slot.kind === 'fallen') && slot.lod === 2 && slot.rank < 3),
    [slots],
  )
  const lod2Rear = useMemo(
    () => slots.filter((slot) => (slot.kind === 'foot' || slot.kind === 'fallen') && slot.lod === 2 && slot.rank >= 3),
    [slots],
  )
  const cavalry = useMemo(() => slots.filter((slot) => slot.kind === 'cavalry'), [slots])
  const banners = useMemo(() => slots.filter((slot) => slot.kind === 'banner'), [slots])
  const shadows = useMemo(() => slots.filter((slot) => slot.kind !== 'banner' && slot.lod === 0), [slots])
  const soldierGeom = useMemo(() => createSoldierGeometry(palette), [palette])
  const spearGeom = useMemo(() => createSpearGeometry(palette), [palette])
  const lod1FrontGeom = useMemo(() => createLodSoldierGeometry(palette, 1, 1.18), [palette])
  const lod1RearGeom = useMemo(() => createLodSoldierGeometry(palette, 1, 0.32), [palette])
  const lod2FrontGeom = useMemo(() => createLodSoldierGeometry(palette, 2, 1.18), [palette])
  const lod2RearGeom = useMemo(() => createLodSoldierGeometry(palette, 2, 0.32), [palette])
  const horseGeom = useMemo(() => createHorseGeometry(palette), [palette])
  const bannerGeom = useMemo(() => createBannerGeometry(palette), [palette])
  const shadowGeom = useMemo(() => createShadowGeometry(), [])
  const material = useMemo(() => unitMaterial(0.58, 0.14), [])
  const spearMat = useMemo(() => unitMaterial(0.42, 0.28), [])
  const lod1Mat = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true }), [])
  const lod2Mat = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true }), [])
  const horseMat = useMemo(() => unitMaterial(0.62, 0.08), [])
  const bannerMat = useMemo(() => unitMaterial(0.78, 0.04), [])
  const shadowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  const soldierRef = useRef<THREE.InstancedMesh>(null)
  const spearRef = useRef<THREE.InstancedMesh>(null)
  const lod1FrontRef = useRef<THREE.InstancedMesh>(null)
  const lod1RearRef = useRef<THREE.InstancedMesh>(null)
  const lod2FrontRef = useRef<THREE.InstancedMesh>(null)
  const lod2RearRef = useRef<THREE.InstancedMesh>(null)
  const horseRef = useRef<THREE.InstancedMesh>(null)
  const bannerRef = useRef<THREE.InstancedMesh>(null)
  const shadowRef = useRef<THREE.InstancedMesh>(null)
  const tinted = useRef(false)
  const staticWritten = useRef(false)
  const frame = useRef(0)

  useEffect(() => {
    tinted.current = false
    staticWritten.current = false
  }, [slots])

  useFrame(() => {
    const time = motion.current
    const dive = useJourney.getState().diveProgress
    const advance = dive * 0.0007
    frame.current += 1
    const write = (
      mesh: THREE.InstancedMesh | null,
      list: Slot[],
      apply: (mesh: THREE.InstancedMesh, index: number, slot: Slot, scale: number, time: number, advance: number) => void,
    ) => {
      if (!mesh || list.length === 0) return
      if (!tinted.current) tintInstances(mesh, list)
      for (let i = 0; i < list.length; i++) apply(mesh, i, list[i], SOLDIER, time, advance)
      mesh.instanceMatrix.needsUpdate = true
    }
    if (visible > 0.02) {
      write(soldierRef.current, lod0, applySlot)
      write(spearRef.current, lod0, applySpear)
      write(horseRef.current, cavalry, applySlot)
      write(bannerRef.current, banners, applySlot)
      if (dive <= 0.92 || frame.current % 2 === 0) write(shadowRef.current, shadows, applyShadow)
      // Near mid-field stays alive without touching the far write-once lods.
      if (frame.current % 2 === 0) write(lod1FrontRef.current, lod1Front, applySlot)
      if (frame.current % 6 === 0) write(lod1RearRef.current, lod1Rear, applySlot)
      if (!staticWritten.current) {
        write(lod2FrontRef.current, lod2Front, applySlot)
        write(lod2RearRef.current, lod2Rear, applySlot)
        staticWritten.current = true
      }
      tinted.current = true
    }
  })

  useEffect(
    () => () => {
      soldierGeom.dispose()
      spearGeom.dispose()
      lod1FrontGeom.dispose()
      lod1RearGeom.dispose()
      lod2FrontGeom.dispose()
      lod2RearGeom.dispose()
      horseGeom.dispose()
      bannerGeom.dispose()
      shadowGeom.dispose()
      material.dispose()
      spearMat.dispose()
      lod1Mat.dispose()
      lod2Mat.dispose()
      horseMat.dispose()
      bannerMat.dispose()
      shadowMat.dispose()
    },
    [
      bannerGeom,
      bannerMat,
      horseGeom,
      horseMat,
      lod1FrontGeom,
      lod1Mat,
      lod1RearGeom,
      lod2FrontGeom,
      lod2Mat,
      lod2RearGeom,
      material,
      shadowGeom,
      shadowMat,
      soldierGeom,
      spearGeom,
      spearMat,
    ],
  )

  return (
    <group visible={visible > 0.02}>
      {shadows.length > 0 && <instancedMesh name="army-shadow" ref={shadowRef} args={[shadowGeom, shadowMat, shadows.length]} frustumCulled={false} renderOrder={1} />}
      {lod2Rear.length > 0 && <instancedMesh name="army-foot-lod2-rear" ref={lod2RearRef} args={[lod2RearGeom, lod2Mat, lod2Rear.length]} />}
      {lod2Front.length > 0 && <instancedMesh name="army-foot-lod2-front" ref={lod2FrontRef} args={[lod2FrontGeom, lod2Mat, lod2Front.length]} />}
      {lod1Rear.length > 0 && <instancedMesh name="army-foot-lod1-rear" ref={lod1RearRef} args={[lod1RearGeom, lod1Mat, lod1Rear.length]} />}
      {lod1Front.length > 0 && <instancedMesh name="army-foot-lod1-front" ref={lod1FrontRef} args={[lod1FrontGeom, lod1Mat, lod1Front.length]} />}
      {lod0.length > 0 && <instancedMesh name="army-foot-lod0" ref={soldierRef} args={[soldierGeom, material, lod0.length]} frustumCulled={false} />}
      {lod0.length > 0 && <instancedMesh name="army-spear-lod0" ref={spearRef} args={[spearGeom, spearMat, lod0.length]} frustumCulled={false} />}
      {cavalry.length > 0 && <instancedMesh name="army-horse" ref={horseRef} args={[horseGeom, horseMat, cavalry.length]} frustumCulled={false} />}
      {banners.length > 0 && <instancedMesh name="army-banner" ref={bannerRef} args={[bannerGeom, bannerMat, banners.length]} frustumCulled={false} />}
    </group>
  )
}


function Footprints({ appear }: { appear: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(1, 8)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#5a4630',
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  const stamps = useMemo(() => {
    const list: Array<{ x: number; z: number; r: number; a: number; s: number }> = []
    for (let i = 0; i < 620; i++) {
      const alongContact = hash(i + 2) > 0.38
      const z = alongContact
        ? LINE_START + hash(i + 5) * HOST_SPAN_Z
        : LINE_SOUTH - FILE_GAP * (0.2 + hash(i + 5) * 3.4) + (hash(i + 8) - 0.5) * 0.01
      const mid = contactMid(Math.max(LINE_START, Math.min(LINE_START + HOST_SPAN_Z, z)))
      const spread = alongContact ? 0.006 + Math.max(0, -contactGap(z)) * 1.2 : 0.02
      const x = mid + (hash(i + 11) - 0.5) * spread * 2
      list.push({
        x,
        z,
        r: hash(i + 13) * Math.PI,
        a: 0.12 + hash(i + 17) * 0.18,
        s: 0.00055 + hash(i + 19) * 0.0007,
      })
    }
    return list
  }, [])
  useEffect(() => {
    if (!mesh.current) return
    for (let i = 0; i < stamps.length; i++) {
      const stamp = stamps[i]
      _position.set(stamp.x, terrainHeight(stamp.x, stamp.z) + 0.00012, stamp.z)
      _quaternion.setFromAxisAngle(Y_UP, stamp.r)
      _scale.set(stamp.s * 1.35, 1, stamp.s * 0.7)
      _matrix.compose(_position, _quaternion, _scale)
      mesh.current.setMatrixAt(i, _matrix)
      _color.setRGB(0.32, 0.24, 0.16)
      mesh.current.setColorAt(i, _color)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [stamps])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  material.opacity = 0.1 + appear * 0.18
  if (appear <= 0.04) return null
  return <instancedMesh ref={mesh} args={[geometry, material, stamps.length]} frustumCulled={false} />
}

const layoutCache = new Map<string, { qin: Slot[]; peer: Slot[]; companies: Company[] }>()

function cachedLayout(mode: BattleMode, reducedMotion: boolean) {
  const key = mode === 'encircle' ? `encircle:${reducedMotion ? 'rm' : 'full'}` : mode
  const hit = layoutCache.get(key)
  if (hit) return hit
  const layouts = mode === 'encircle'
    ? layoutEncircle(reducedMotion ? 0.85 : 0.4)
    : mode === 'mass'
      ? layoutMass()
      : layoutClash()
  layoutCache.set(key, layouts)
  return layouts
}

function BattleStage({ mode }: { mode: BattleMode }) {
  const diveProgress = useJourney((store) => store.diveProgress)
  const reducedMotion = useReducedMotion()
  const world = useRef<THREE.Group>(null)
  const motion = useRef(0)
  const appear = THREE.MathUtils.smoothstep(diveProgress, 0.9, 0.97)
  const skyAppear = THREE.MathUtils.smoothstep(diveProgress, 0.89, 0.952)
  const armyAppear = THREE.MathUtils.smoothstep(diveProgress, 0.915, 0.98)

  const layouts = useMemo(() => cachedLayout(mode, reducedMotion), [mode, reducedMotion])

  useFrame(({ camera, scene }, delta) => {
    if (!world.current) return
    world.current.visible = appear > 0.02
    if (world.current.visible && scene.fog instanceof THREE.Fog) {
      // The shared surface haze suits a ground camera, but hides the entire host from aloft.
      const distance = camera.position.distanceTo(world.current.getWorldPosition(_stageOrigin))
      const aerialHaze = THREE.MathUtils.smoothstep(distance, 0.17, 0.48)
        * THREE.MathUtils.smoothstep(diveProgress, 0.9, 0.95)
      scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, 0.53, aerialHaze)
      scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, 1.3, aerialHaze)
    }
    if (world.current.visible && !reducedMotion && useNarration.getState().status !== 'paused') {
      motion.current += Math.min(delta, 0.05)
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} color="#cbb89a" />
      <hemisphereLight args={['#f0e2c4', '#6a4e2a', 1.05]} />
      <directionalLight position={[0.16, 0.12, -0.08]} intensity={1.8} color="#ffd4a0" />
      <directionalLight position={[0.08, 0.05, -0.1]} intensity={0.85} color="#e7ecfa" />
      <group ref={world} visible={false}>
        <Sky appear={skyAppear} />
        <Ground companies={layouts.companies} />
        {mode !== 'encircle' && <Footprints appear={appear} />}
        <Scatter appear={appear} />
        <Grass appear={appear} />
        <Smoke appear={appear} mode={mode} motion={motion} />
        <ClashDust appear={appear} mode={mode} motion={motion} />
        <group visible={armyAppear > 0.02}>
          <ArmyInstances slots={layouts.qin} palette={QIN} visible={armyAppear} motion={motion} />
          <ArmyInstances slots={layouts.peer} palette={PEER} visible={armyAppear} motion={motion} />
        </group>
      </group>
    </>
  )
}

export function MassBattle({
  lat,
  lon,
  mode,
}: {
  lat: number
  lon: number
  mode: BattleMode
}) {
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS + BATTLE_SURFACE_LIFT}>
      <NorthAligned lat={lat} lon={lon}>
        <BattleStage mode={mode} />
      </NorthAligned>
    </SurfaceAnchor>
  )
}
