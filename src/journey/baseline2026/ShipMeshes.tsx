/**
 * Typological ship meshes for the 2026 baseline journey.
 *
 * Popular-science parade silhouettes, readable at a close sea-level view:
 * STOBAR ski-jump carriers (Liaoning / Shandong), a flat-deck carrier
 * (Fujian), a longer US CVN with a minimal angled-deck outline, a
 * tumblehome Type 055 with an enclosed mast and an aft helicopter pad,
 * a Type 075-class through-deck amphibious ship (shorter than a carrier,
 * island aft), a Type 071-class LPD (forward house, aft pad), a
 * large-deck escort, and a narrow generic escort. Navy tint only.
 * Generic marks have no pennant numbers. Only the three named carriers
 * reuse the real-time film's original exterior artwork.
 *
 * Mid-Pacific review ships sit on the night hemisphere at the 2026-07-01
 * noon-UTC Earth window, so decks use unlit / slightly emissive materials
 * and stay readable under the existing shared Earth lighting. A fill light
 * scoped to the review group is applied in ReviewLayer.
 */
import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { latLngToVector3 } from '../../utils/geo'
import { GlobeCarrier } from './film/GlobeCarrier'
import type { CarrierId } from './film/ships'
import { REVIEW_GROUND, type ReviewShipKind } from './review'

type Station = readonly [x: number, halfBeam: number]

function planformPrism(
  stations: readonly Station[],
  y0: number,
  y1: number,
  topScale = 1,
): THREE.BufferGeometry {
  const count = stations.length
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const x0 = stations[0][0]
  const x1 = stations[count - 1][0]
  const span = x1 - x0 || 1
  const maxBeam = Math.max(...stations.map((station) => station[1]), 0.0001)

  const push = (x: number, y: number, z: number) => {
    positions.push(x, y, z)
    uvs.push((x - x0) / span, (z / maxBeam) * 0.5 + 0.5)
    return positions.length / 3 - 1
  }

  const top: number[] = []
  const bot: number[] = []
  for (const [x, beam] of stations) {
    const topBeam = beam * topScale
    top.push(push(x, y1, -topBeam), push(x, y1, topBeam))
    bot.push(push(x, y0, -beam), push(x, y0, beam))
  }

  const quad = (a: number, b: number, c: number, d: number) => {
    indices.push(a, b, c, a, c, d)
  }

  for (let i = 0; i < count - 1; i += 1) {
    const i0 = i * 2
    const i1 = (i + 1) * 2
    quad(top[i0], top[i0 + 1], top[i1 + 1], top[i1])
    quad(bot[i0 + 1], bot[i0], bot[i1], bot[i1 + 1])
    quad(top[i0], top[i1], bot[i1], bot[i0])
    quad(top[i1 + 1], top[i0 + 1], bot[i0 + 1], bot[i1 + 1])
  }

  const sternTopP = top[0]
  const sternTopS = top[1]
  const sternBotP = bot[0]
  const sternBotS = bot[1]
  quad(sternTopS, sternTopP, sternBotP, sternBotS)

  const bow = count - 1
  const bowBeam = stations[bow][1] * topScale
  if (bowBeam < 0.0008) {
    indices.push(top[bow * 2], bot[bow * 2], bot[bow * 2 + 1])
    indices.push(top[bow * 2], bot[bow * 2 + 1], top[bow * 2 + 1])
  } else {
    quad(top[bow * 2], top[bow * 2 + 1], bot[bow * 2 + 1], bot[bow * 2])
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function skiJumpGeometry(length: number, width: number, rise: number) {
  const hw = width / 2
  const positions = new Float32Array([
    0, 0, -hw,  0, 0, hw,  length, rise, hw,  length, rise, -hw,
    0, 0, -hw,  0, 0, hw,  length, 0, hw,    length, 0, -hw,
    0, 0, hw,   length, 0, hw,     length, rise, hw,
    0, 0, -hw,  length, rise, -hw, length, 0, -hw,
    length, 0, -hw, length, 0, hw, length, rise, hw, length, rise, -hw,
  ])
  const indices = [
    0, 1, 2, 0, 2, 3,
    4, 7, 6, 4, 6, 5,
    8, 9, 10,
    11, 12, 13,
    14, 15, 16, 14, 16, 17,
  ]
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function box(w: number, h: number, d: number) {
  return new THREE.BoxGeometry(w, h, d)
}

const STOBAR_DECK: Station[] = [
  [-0.044, 0.0100],
  [-0.042, 0.0120],
  [-0.020, 0.0128],
  [0.004, 0.0130],
  [0.022, 0.0122],
  [0.034, 0.0090],
  [0.042, 0.0052],
  [0.0470, 0.0008],
]
const STOBAR_HULL: Station[] = [
  [-0.0432, 0.0084],
  [-0.041, 0.0102],
  [-0.020, 0.0110],
  [0.004, 0.0112],
  [0.022, 0.0102],
  [0.033, 0.0074],
  [0.040, 0.0038],
  [0.0454, 0.0005],
]

const FLAT_DECK: Station[] = [
  [-0.049, 0.0112],
  [-0.047, 0.0134],
  [-0.022, 0.0142],
  [0.006, 0.0144],
  [0.026, 0.0138],
  [0.040, 0.0110],
  [0.048, 0.0064],
  [0.0525, 0.0012],
]
const FLAT_HULL: Station[] = [
  [-0.0482, 0.0094],
  [-0.046, 0.0114],
  [-0.022, 0.0122],
  [0.006, 0.0124],
  [0.026, 0.0116],
  [0.039, 0.0088],
  [0.047, 0.0048],
  [0.0510, 0.0006],
]

const CVN_DECK: Station[] = [
  [-0.054, 0.0116],
  [-0.051, 0.0140],
  [-0.022, 0.0150],
  [0.008, 0.0152],
  [0.030, 0.0142],
  [0.044, 0.0110],
  [0.053, 0.0060],
  [0.0575, 0.0010],
]
const CVN_HULL: Station[] = [
  [-0.053, 0.0096],
  [-0.050, 0.0118],
  [-0.022, 0.0128],
  [0.008, 0.0130],
  [0.030, 0.0120],
  [0.043, 0.0088],
  [0.051, 0.0046],
  [0.0558, 0.0006],
]

const DEST055_DECK: Station[] = [
  [-0.0290, 0.0056],
  [-0.0274, 0.0072],
  [-0.0140, 0.0080],
  [0.0000, 0.0080],
  [0.0120, 0.0072],
  [0.0220, 0.0054],
  [0.0285, 0.0028],
  [0.0324, 0.0004],
]
const DEST055_HULL: Station[] = [
  [-0.0284, 0.0064],
  [-0.0266, 0.0082],
  [-0.0140, 0.0090],
  [0.0000, 0.0090],
  [0.0120, 0.0082],
  [0.0215, 0.0060],
  [0.0276, 0.0030],
  [0.0316, 0.0004],
]

const LHD_DECK: Station[] = [
  [-0.0360, 0.0116],
  [-0.0344, 0.0132],
  [-0.0160, 0.0138],
  [0.0020, 0.0138],
  [0.0160, 0.0132],
  [0.0260, 0.0110],
  [0.0325, 0.0064],
  [0.0368, 0.0008],
]
const LHD_HULL: Station[] = [
  [-0.0354, 0.0104],
  [-0.0336, 0.0120],
  [-0.0160, 0.0126],
  [0.0020, 0.0126],
  [0.0160, 0.0120],
  [0.0254, 0.0096],
  [0.0316, 0.0054],
  [0.0356, 0.0005],
]

const LPD_DECK: Station[] = [
  [-0.0320, 0.0080],
  [-0.0304, 0.0096],
  [-0.0140, 0.0104],
  [0.0020, 0.0104],
  [0.0140, 0.0094],
  [0.0240, 0.0070],
  [0.0300, 0.0036],
  [0.0338, 0.0005],
]
const LPD_HULL: Station[] = [
  [-0.0314, 0.0072],
  [-0.0296, 0.0088],
  [-0.0140, 0.0096],
  [0.0020, 0.0096],
  [0.0140, 0.0086],
  [0.0234, 0.0062],
  [0.0292, 0.0030],
  [0.0328, 0.0004],
]

const ESCORT_DECK: Station[] = [
  [-0.034, 0.0088],
  [-0.0324, 0.0104],
  [-0.012, 0.0116],
  [0.004, 0.0116],
  [0.016, 0.0102],
  [0.026, 0.0064],
  [0.032, 0.0028],
  [0.0352, 0.0005],
]
const ESCORT_HULL: Station[] = [
  [-0.0334, 0.0072],
  [-0.0316, 0.0088],
  [-0.012, 0.0098],
  [0.004, 0.0098],
  [0.016, 0.0084],
  [0.025, 0.0052],
  [0.031, 0.0022],
  [0.0342, 0.0004],
]

const DESTROYER_DECK: Station[] = [
  [-0.032, 0.0044],
  [-0.0304, 0.0054],
  [-0.012, 0.0062],
  [0.004, 0.006],
  [0.016, 0.005],
  [0.026, 0.0032],
  [0.032, 0.0014],
  [0.0356, 0.00035],
]
const DESTROYER_HULL: Station[] = [
  [-0.0314, 0.0036],
  [-0.0296, 0.0046],
  [-0.012, 0.0052],
  [0.004, 0.005],
  [0.016, 0.0042],
  [0.025, 0.0026],
  [0.031, 0.001],
  [0.0346, 0.00025],
]

const GEOM = {
  stobarDeck: planformPrism(STOBAR_DECK, 0.0072, 0.0094),
  stobarHull: planformPrism(STOBAR_HULL, 0.0006, 0.0074),
  stobarJump: skiJumpGeometry(0.0165, 0.0104, 0.0082),
  flatDeck: planformPrism(FLAT_DECK, 0.0074, 0.0096),
  flatHull: planformPrism(FLAT_HULL, 0.0006, 0.0076),
  cvnDeck: planformPrism(CVN_DECK, 0.0074, 0.0098),
  cvnHull: planformPrism(CVN_HULL, 0.0006, 0.0076),
  dest055Deck: planformPrism(DEST055_DECK, 0.0058, 0.0078, 0.84),
  dest055Hull: planformPrism(DEST055_HULL, 0.0005, 0.0060, 0.84),
  lhdDeck: planformPrism(LHD_DECK, 0.0080, 0.0104),
  lhdHull: planformPrism(LHD_HULL, 0.0006, 0.0082),
  lpdDeck: planformPrism(LPD_DECK, 0.0062, 0.0080),
  lpdHull: planformPrism(LPD_HULL, 0.0006, 0.0068),
  escortDeck: planformPrism(ESCORT_DECK, 0.0062, 0.0082),
  escortHull: planformPrism(ESCORT_HULL, 0.0006, 0.0064),
  destroyerDeck: planformPrism(DESTROYER_DECK, 0.0054, 0.0072),
  destroyerHull: planformPrism(DESTROYER_HULL, 0.0005, 0.0056),
  carrierIsland: box(0.016, 0.015, 0.0084),
  carrierIslandCap: box(0.010, 0.005, 0.0062),
  carrierMast: box(0.0022, 0.012, 0.0022),
  flatIsland: box(0.015, 0.016, 0.0080),
  cvnIsland: box(0.014, 0.016, 0.0080),
  angledDeck: box(1, 1, 1),
  escortIsland: box(0.014, 0.014, 0.010),
  escortIslandCap: box(0.008, 0.0046, 0.0074),
  dest055House: box(0.026, 0.0076, 0.0108),
  dest055HouseFwd: box(0.010, 0.0058, 0.0092),
  dest055Mast: new THREE.CylinderGeometry(0.0024, 0.0052, 0.020, 8),
  dest055Pad: box(0.011, 0.0005, 0.0090),
  lhdIsland: box(0.013, 0.016, 0.0088),
  lpdHouse: box(0.022, 0.012, 0.0124),
  lpdHouseTop: box(0.012, 0.006, 0.0090),
  lpdPad: box(0.014, 0.0005, 0.0104),
  scaleHull: planformPrism(
    [
      [-0.0110, 0.0030],
      [-0.0096, 0.0038],
      [-0.0020, 0.0042],
      [0.0040, 0.0040],
      [0.0084, 0.0026],
      [0.0112, 0.0004],
    ],
    0.0005,
    0.0042,
  ),
  scaleDeck: planformPrism(
    [
      [-0.0106, 0.0026],
      [-0.0092, 0.0034],
      [-0.0020, 0.0038],
      [0.0040, 0.0036],
      [0.0080, 0.0022],
      [0.0106, 0.0003],
    ],
    0.0040,
    0.0052,
  ),
  scaleSubHull: planformPrism(
    [
      [-0.0100, 0.0018],
      [-0.0070, 0.0026],
      [0.0000, 0.0028],
      [0.0060, 0.0022],
      [0.0100, 0.0010],
      [0.0124, 0.0002],
    ],
    0.0004,
    0.0030,
  ),
  destBridge: box(0.012, 0.009, 0.0072),
  destStack: box(0.01, 0.007, 0.0062),
  destAft: box(0.01, 0.005, 0.0054),
  destMast: box(0.0016, 0.008, 0.0016),
  markLong: box(1, 1, 1),
  wake: box(1, 1, 1),
  rail: box(1, 1, 1),
}

function colorMix(hex: string, toward: string, t: number) {
  const color = new THREE.Color(hex)
  color.lerp(new THREE.Color(toward), t)
  return `#${color.getHexString()}`
}

function BodyMaterial({
  color,
  emissiveIntensity = 0.24,
  roughness = 0.74,
  metalness = 0.07,
}: {
  color: string
  emissiveIntensity?: number
  roughness?: number
  metalness?: number
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={color}
      emissiveIntensity={emissiveIntensity}
      envMapIntensity={0.18}
    />
  )
}

function DeckMaterial({ color }: { color: string }) {
  return <meshBasicMaterial color={color} toneMapped={false} />
}

function MarkMaterial({ color, opacity = 0.92 }: { color: string; opacity?: number }) {
  return (
    <meshBasicMaterial
      color={color}
      transparent
      opacity={opacity}
      toneMapped={false}
      depthWrite={false}
      polygonOffset
      polygonOffsetFactor={-2}
      polygonOffsetUnits={-2}
    />
  )
}

function DeckMark({
  position,
  size,
  color,
  opacity,
  rotation,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  opacity?: number
  rotation?: [number, number, number]
}) {
  return (
    <mesh position={position} rotation={rotation} geometry={GEOM.markLong} scale={size} renderOrder={2}>
      <MarkMaterial color={color} opacity={opacity} />
    </mesh>
  )
}

function DeckCenterline({ ink, deckY, length, x = 0 }: { ink: string; deckY: number; length: number; x?: number }) {
  return <DeckMark position={[x, deckY + 0.00035, 0]} size={[length, 0.00028, 0.00095]} color={ink} opacity={0.55} />
}

function TypologicalWake({ length, width, opacity = 0.4 }: { length: number; width: number; opacity?: number }) {
  const tail = -length / 2 - 0.002
  return (
    <group>
      <mesh
        position={[tail + length * 0.18, 0.0009, 0]}
        scale={[length * 0.36, 0.0004, width]}
        geometry={GEOM.wake}
        renderOrder={1}
      >
        <meshBasicMaterial color="#d7e4ea" transparent opacity={opacity} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh
        position={[tail - length * 0.2, 0.0007, 0]}
        scale={[length * 0.58, 0.00035, width * 0.55]}
        geometry={GEOM.wake}
        renderOrder={1}
      >
        <meshBasicMaterial color="#c5d8e0" transparent opacity={opacity * 0.55} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function IslandBlock({
  geometry,
  cap,
  mast,
  position,
  island,
}: {
  geometry: THREE.BufferGeometry
  cap?: { geometry: THREE.BufferGeometry; y: number }
  mast?: { geometry: THREE.BufferGeometry; y: number }
  position: [number, number, number]
  island: string
}) {
  const islandBody = colorMix(island, '#ece8e0', 0.14)
  return (
    <group>
      <mesh geometry={geometry} position={position}>
        <BodyMaterial color={islandBody} emissiveIntensity={0.34} roughness={0.66} />
      </mesh>
      {cap && (
        <mesh geometry={cap.geometry} position={[position[0], cap.y, position[2]]}>
          <BodyMaterial color={colorMix(islandBody, '#f0ece4', 0.2)} emissiveIntensity={0.38} roughness={0.62} />
        </mesh>
      )}
      {mast && (
        <mesh geometry={mast.geometry} position={[position[0] + 0.002, mast.y, position[2]]}>
          <BodyMaterial color={colorMix(island, '#d8d4cc', 0.15)} emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  )
}

function StobarCarrierBody({ hull, island }: { hull: string; island: string }) {
  const deck = colorMix(hull, '#f3efe6', 0.44)
  const shell = colorMix(hull, '#2a3034', 0.28)
  const ink = colorMix(island, '#2a2622', 0.45)
  return (
    <group>
      <mesh geometry={GEOM.stobarHull}>
        <BodyMaterial color={shell} emissiveIntensity={0.2} />
      </mesh>
      <mesh geometry={GEOM.stobarDeck}>
        <DeckMaterial color={deck} />
      </mesh>
      <mesh geometry={GEOM.stobarJump} position={[0.0328, 0.0094, 0]}>
        <DeckMaterial color={colorMix(deck, '#e7e0d4', 0.2)} />
      </mesh>
      <DeckCenterline ink={ink} deckY={0.0094} length={0.058} x={-0.004} />
      <IslandBlock
        geometry={GEOM.carrierIsland}
        cap={{ geometry: GEOM.carrierIslandCap, y: 0.0262 }}
        mast={{ geometry: GEOM.carrierMast, y: 0.0328 }}
        position={[-0.004, 0.0168, 0.0090]}
        island={island}
      />
    </group>
  )
}

function FlatCarrierBody({ hull, island }: { hull: string; island: string }) {
  const deck = colorMix(hull, '#f4f1ea', 0.4)
  const shell = colorMix(hull, '#2a3034', 0.28)
  const ink = colorMix(island, '#2a2622', 0.4)
  return (
    <group>
      <mesh geometry={GEOM.flatHull}>
        <BodyMaterial color={shell} emissiveIntensity={0.2} />
      </mesh>
      <mesh geometry={GEOM.flatDeck}>
        <DeckMaterial color={deck} />
      </mesh>
      <DeckCenterline ink={ink} deckY={0.0096} length={0.072} x={0.0} />
      <IslandBlock
        geometry={GEOM.flatIsland}
        cap={{ geometry: GEOM.carrierIslandCap, y: 0.0274 }}
        mast={{ geometry: GEOM.carrierMast, y: 0.0340 }}
        position={[-0.012, 0.0174, 0.0096]}
        island={island}
      />
    </group>
  )
}

function CvnCarrierBody({ hull, island }: { hull: string; island: string }) {
  const deck = colorMix(hull, '#f2efe8', 0.38)
  const shell = colorMix(hull, '#2a3034', 0.28)
  const ink = colorMix(island, '#2a2622', 0.4)
  const angle = colorMix(deck, '#d9d4ca', 0.28)
  return (
    <group>
      <mesh geometry={GEOM.cvnHull}>
        <BodyMaterial color={shell} emissiveIntensity={0.2} />
      </mesh>
      <mesh geometry={GEOM.cvnDeck}>
        <DeckMaterial color={deck} />
      </mesh>
      {/* Minimal angled-deck outline on the port side — typological shape only, no arresting gear or landing lines. */}
      <mesh
        geometry={GEOM.angledDeck}
        position={[-0.006, 0.01015, -0.0064]}
        rotation={[0, 0.16, 0]}
        scale={[0.072, 0.00032, 0.011]}
        renderOrder={2}
      >
        <MarkMaterial color={angle} opacity={0.95} />
      </mesh>
      <DeckCenterline ink={ink} deckY={0.0098} length={0.078} x={0.004} />
      <IslandBlock
        geometry={GEOM.cvnIsland}
        cap={{ geometry: GEOM.carrierIslandCap, y: 0.0278 }}
        mast={{ geometry: GEOM.carrierMast, y: 0.0344 }}
        position={[-0.006, 0.0178, 0.0100]}
        island={island}
      />
    </group>
  )
}

function Type055Body({ hull, island }: { hull: string; island: string }) {
  const deck = colorMix(hull, '#eef0f2', 0.3)
  const shell = colorMix(hull, '#2a3034', 0.32)
  const house = colorMix(island, '#ece8e0', 0.12)
  const mast = colorMix(island, '#d8d4cc', 0.08)
  return (
    <group>
      <mesh geometry={GEOM.dest055Hull}>
        <BodyMaterial color={shell} emissiveIntensity={0.22} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh geometry={GEOM.dest055Deck}>
        <DeckMaterial color={deck} />
      </mesh>
      {/* Long, continuous, low deckhouse — no through-deck. */}
      <mesh geometry={GEOM.dest055House} position={[0.0, 0.0114, 0]}>
        <BodyMaterial color={house} emissiveIntensity={0.32} roughness={0.66} />
      </mesh>
      <mesh geometry={GEOM.dest055HouseFwd} position={[0.014, 0.0108, 0]}>
        <BodyMaterial color={colorMix(house, island, 0.12)} emissiveIntensity={0.3} roughness={0.68} />
      </mesh>
      {/* Enclosed integrated mast / tower, typological faceted solid. */}
      <mesh geometry={GEOM.dest055Mast} position={[-0.002, 0.0216, 0]}>
        <BodyMaterial color={mast} emissiveIntensity={0.3} roughness={0.58} metalness={0.12} />
      </mesh>
      {/* Aft helicopter pad, typological only. */}
      <mesh geometry={GEOM.dest055Pad} position={[-0.020, 0.00815, 0]}>
        <DeckMaterial color={colorMix(deck, '#d8dce0', 0.2)} />
      </mesh>
    </group>
  )
}

function AmphibLhdBody({ hull, island }: { hull: string; island: string }) {
  const deck = colorMix(hull, '#f0eee8', 0.34)
  const shell = colorMix(hull, '#2a3034', 0.3)
  const ink = colorMix(island, '#2a2622', 0.4)
  return (
    <group>
      <mesh geometry={GEOM.lhdHull}>
        <BodyMaterial color={shell} emissiveIntensity={0.2} />
      </mesh>
      <mesh geometry={GEOM.lhdDeck}>
        <DeckMaterial color={deck} />
      </mesh>
      <DeckCenterline ink={ink} deckY={0.0104} length={0.048} />
      {/* Island well aft and to starboard — shorter through-deck than a carrier. */}
      <IslandBlock
        geometry={GEOM.lhdIsland}
        cap={{ geometry: GEOM.carrierIslandCap, y: 0.0270 }}
        position={[-0.016, 0.0184, 0.0092]}
        island={island}
      />
    </group>
  )
}

function AmphibLpdBody({ hull, island }: { hull: string; island: string }) {
  const deck = colorMix(hull, '#eef0f2', 0.26)
  const shell = colorMix(hull, '#2a3034', 0.3)
  const house = colorMix(island, '#ece8e0', 0.1)
  return (
    <group>
      <mesh geometry={GEOM.lpdHull}>
        <BodyMaterial color={shell} emissiveIntensity={0.2} />
      </mesh>
      <mesh geometry={GEOM.lpdDeck}>
        <DeckMaterial color={deck} />
      </mesh>
      {/* Forward / mid ship-like superstructure, not a through flight deck. */}
      <mesh geometry={GEOM.lpdHouse} position={[0.006, 0.0140, 0]}>
        <BodyMaterial color={house} emissiveIntensity={0.32} roughness={0.68} />
      </mesh>
      <mesh geometry={GEOM.lpdHouseTop} position={[0.004, 0.0228, 0]}>
        <BodyMaterial color={colorMix(house, island, 0.16)} emissiveIntensity={0.3} roughness={0.66} />
      </mesh>
      <mesh geometry={GEOM.lpdPad} position={[-0.020, 0.00835, 0]}>
        <DeckMaterial color={colorMix(deck, '#d8dce0', 0.18)} />
      </mesh>
    </group>
  )
}

function LargeDeckEscortBody({ hull, island }: { hull: string; island: string }) {
  const deck = colorMix(hull, '#f0eee8', 0.36)
  const shell = colorMix(hull, '#2a3034', 0.28)
  const ink = colorMix(island, '#2a2622', 0.45)
  return (
    <group>
      <mesh geometry={GEOM.escortHull}>
        <BodyMaterial color={shell} emissiveIntensity={0.2} />
      </mesh>
      <mesh geometry={GEOM.escortDeck}>
        <DeckMaterial color={deck} />
      </mesh>
      <DeckCenterline ink={ink} deckY={0.0082} length={0.04} />
      {/* Starboard island, through-deck, no ski-jump — official 護衛艦 silhouette. */}
      <IslandBlock
        geometry={GEOM.escortIsland}
        cap={{ geometry: GEOM.escortIslandCap, y: 0.0246 }}
        position={[0.0, 0.0152, 0.0076]}
        island={island}
      />
    </group>
  )
}

function DestroyerBody({ hull, island }: { hull: string; island: string }) {
  const deck = colorMix(hull, '#eef0f2', 0.28)
  const shell = colorMix(hull, '#2a3034', 0.3)
  const house = colorMix(island, '#ece8e0', 0.1)
  return (
    <group>
      <mesh geometry={GEOM.destroyerHull}>
        <BodyMaterial color={shell} emissiveIntensity={0.2} />
      </mesh>
      <mesh geometry={GEOM.destroyerDeck}>
        <DeckMaterial color={deck} />
      </mesh>
      <mesh geometry={GEOM.destBridge} position={[0.008, 0.0116, 0]}>
        <BodyMaterial color={house} emissiveIntensity={0.3} roughness={0.7} />
      </mesh>
      <mesh geometry={GEOM.destStack} position={[-0.004, 0.0106, 0]}>
        <BodyMaterial color={colorMix(house, island, 0.25)} emissiveIntensity={0.28} roughness={0.7} />
      </mesh>
      <mesh geometry={GEOM.destAft} position={[-0.016, 0.0094, 0]}>
        <BodyMaterial color={colorMix(house, island, 0.15)} emissiveIntensity={0.26} roughness={0.72} />
      </mesh>
      <mesh geometry={GEOM.destMast} position={[0.008, 0.019, 0]}>
        <BodyMaterial color={colorMix(island, '#d8d4cc', 0.15)} emissiveIntensity={0.26} />
      </mesh>
    </group>
  )
}

function shipBody(kind: ReviewShipKind, hull: string, island: string) {
  switch (kind) {
    case 'carrier-stobar':
      return <StobarCarrierBody hull={hull} island={island} />
    case 'carrier-flat':
      return <FlatCarrierBody hull={hull} island={island} />
    case 'carrier-cvn':
      return <CvnCarrierBody hull={hull} island={island} />
    case 'destroyer-055':
      return <Type055Body hull={hull} island={island} />
    case 'amphib-lhd':
      return <AmphibLhdBody hull={hull} island={island} />
    case 'amphib-lpd':
      return <AmphibLpdBody hull={hull} island={island} />
    case 'large-deck-escort':
      return <LargeDeckEscortBody hull={hull} island={island} />
    case 'scale-unit':
      return <ScaleUnitBody hull={hull} />
    case 'scale-sub':
      return <ScaleSubBody hull={hull} />
    default:
      return <DestroyerBody hull={hull} island={island} />
  }
}

function ScaleUnitBody({ hull }: { hull: string }) {
  const deck = colorMix(hull, '#eef1f3', 0.38)
  const shell = colorMix(hull, '#2a3034', 0.3)
  return (
    <group>
      <mesh geometry={GEOM.scaleHull}>
        <BodyMaterial color={shell} emissiveIntensity={0.18} />
      </mesh>
      <mesh geometry={GEOM.scaleDeck}>
        <DeckMaterial color={deck} />
      </mesh>
    </group>
  )
}

/** Very simple typological sub token — a low hull only, no sail or masts. */
function ScaleSubBody({ hull }: { hull: string }) {
  const shell = colorMix(hull, '#2a3034', 0.4)
  const deck = colorMix(hull, '#cfd6db', 0.2)
  return (
    <group>
      <mesh geometry={GEOM.scaleSubHull}>
        <BodyMaterial color={shell} emissiveIntensity={0.14} roughness={0.8} />
      </mesh>
      <mesh geometry={GEOM.scaleSubHull} scale={[0.92, 0.18, 0.72]} position={[0, 0.0031, 0]}>
        <DeckMaterial color={deck} />
      </mesh>
    </group>
  )
}

function wakeFor(kind: ReviewShipKind) {
  if (kind === 'carrier-cvn') return { length: 0.12, width: 0.018 }
  if (kind === 'carrier-flat' || kind === 'carrier-stobar') return { length: 0.10, width: 0.016 }
  if (kind === 'amphib-lhd') return { length: 0.085, width: 0.016 }
  if (kind === 'amphib-lpd') return { length: 0.075, width: 0.013 }
  if (kind === 'large-deck-escort') return { length: 0.075, width: 0.013 }
  if (kind === 'destroyer-055') return { length: 0.07, width: 0.011 }
  if (kind === 'scale-unit' || kind === 'scale-sub') return { length: 0.028, width: 0.004 }
  return { length: 0.06, width: 0.008 }
}

export function CarrierSilhouette({
  hull = '#d7dde2',
  island = '#8a96a0',
  scale = 1,
}: {
  hull?: string
  island?: string
  scale?: number
}) {
  return (
    <group scale={scale}>
      <StobarCarrierBody hull={hull} island={island} />
    </group>
  )
}

export function DestroyerSilhouette({
  hull = '#c5d0d6',
  island = '#7b8892',
  scale = 1,
}: {
  hull?: string
  island?: string
  scale?: number
}) {
  return (
    <group scale={scale}>
      <Type055Body hull={hull} island={island} />
    </group>
  )
}

/** Typological large-deck escort (official 護衛艦), visually distinct from a carrier. */
export function LargeDeckEscortSilhouette({
  hull = '#d0d6dc',
  island = '#7a868f',
  scale = 1,
}: {
  hull?: string
  island?: string
  scale?: number
}) {
  return (
    <group scale={scale}>
      <LargeDeckEscortBody hull={hull} island={island} />
    </group>
  )
}

export function TypologicalShip({
  kind,
  hull,
  island,
  scale,
  wake = false,
  carrierId,
}: {
  carrierId?: CarrierId
  kind: ReviewShipKind
  hull: string
  island: string
  scale: number
  wake?: boolean
}) {
  const trail = wakeFor(kind)
  return (
    <group scale={scale}>
      {wake && <TypologicalWake length={trail.length} width={trail.width} />}
      {carrierId ? <GlobeCarrier id={carrierId} /> : shipBody(kind, hull, island)}
    </group>
  )
}

/** Lights on this layer do not illuminate the shared Earth or other journeys. */
export const REVIEW_LIGHT_LAYER = 7

export function ReviewLit({ children }: { children: ReactNode }) {
  const root = useRef<THREE.Group>(null)
  useLayoutEffect(() => {
    if (!root.current) return
    root.current.traverse((node) => {
      if ((node as THREE.Light).isLight) return
      node.layers.enable(REVIEW_LIGHT_LAYER)
    })
  })
  return <group ref={root}>{children}</group>
}

export function ReviewFillLight() {
  const zenith = useMemo(
    () => latLngToVector3(REVIEW_GROUND.lat, REVIEW_GROUND.lon, 1).normalize(),
    [],
  )
  const east = useMemo(() => {
    const here = latLngToVector3(REVIEW_GROUND.lat, REVIEW_GROUND.lon, 1)
    const beside = latLngToVector3(REVIEW_GROUND.lat, REVIEW_GROUND.lon + 8, 1)
    return beside.sub(here).normalize()
  }, [])
  const keyPos = useMemo(
    () => zenith.clone().multiplyScalar(2.4).addScaledVector(east, 3.2).addScaledVector(new THREE.Vector3(0, 1, 0), 0.4),
    [east, zenith],
  )
  const fillPos = useMemo(
    () => zenith.clone().multiplyScalar(1.6).addScaledVector(east, -2.4),
    [east, zenith],
  )
  const key = useRef<THREE.DirectionalLight>(null)
  const fill = useRef<THREE.DirectionalLight>(null)
  const sky = useRef<THREE.DirectionalLight>(null)
  useLayoutEffect(() => {
    for (const light of [key.current, fill.current, sky.current]) {
      if (!light) continue
      light.layers.disable(0)
      light.layers.enable(REVIEW_LIGHT_LAYER)
    }
  }, [])
  return (
    <>
      <directionalLight ref={key} position={keyPos.toArray()} intensity={2.55} color="#f4efe4" />
      <directionalLight ref={fill} position={fillPos.toArray()} intensity={0.72} color="#9bb0be" />
      <directionalLight ref={sky} position={zenith.clone().multiplyScalar(4).toArray()} intensity={0.55} color="#d5e0e6" />
    </>
  )
}
