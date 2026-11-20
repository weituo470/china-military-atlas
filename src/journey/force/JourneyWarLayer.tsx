import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, lazy, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { readNarrationClock, useNarration } from '../../store/narration'
import { useJourney } from '../../store/journey'
import { EARTH_RADIUS, greatCirclePoint, latLngToVector3, sampleGreatCircle } from '../../utils/geo'
import { t, type JourneyLang } from '../types'
import { UI } from './content'
import { CHANGPING_SITE, CHINA_REGIONAL_FOCUS, INSTITUTION_SITES, THEATER_SITES, WEAPON_RACK, offsetLatLon } from './sites'
import { SurfaceAnchor } from './surfaceAnchor'

const MassBattle = lazy(() => import('./MassBattle').then((module) => ({ default: module.MassBattle })))

function shouldMountBattle(beatIndex: number, diveProgress: number, narrationStatus: string) {
  if (beatIndex !== 0 && beatIndex !== 4 && beatIndex !== 5) return false
  if (diveProgress >= 0.02) return true
  // Warm the battlefield while listening, never while browsing the static plates.
  return narrationStatus === 'playing' || narrationStatus === 'paused'
}

const Y_UP = new THREE.Vector3(0, 1, 0)
const QIN_GOLD = '#e2b36a'
const QIN_RED = '#c45c4a'
const QIN_WARM = '#d9a05a'
const MED_SLATE = '#8aa4b5'
const MED_BLUE = '#6a8ea3'
const AFTERMATH = '#2a1614'

const QIN_HEARTLAND = { lat: 34.3, lon: 108.9 }
const PEERS = {
  chu: { lat: 30.5, lon: 114.3 },
  qi: { lat: 36.7, lon: 118.0 },
  zhao: { lat: 35.80, lon: 112.93 },
  yan: { lat: 39.9, lon: 116.4 },
  wei: { lat: 34.8, lon: 114.3 },
  han: { lat: 34.2, lon: 113.0 },
} as const
const ATHENS = { lat: 37.97, lon: 23.72 }
const SPARTA = { lat: 37.08, lon: 22.43 }
const PELLA = { lat: 40.8, lon: 22.5 }
const GAUGAMELA = { lat: 36.5, lon: 43.4 }
const HYPHASIS = { lat: 31.6, lon: 75.0 }
const SYRACUSE = { lat: 37.07, lon: 15.29 }
const HANDAN = { lat: 36.62, lon: 114.49 }
const QIN_APPROACH = { lat: 35.15, lon: 111.55 }

const CHINA_ARCS: { id: string; to: { lat: number; lon: number } }[] = [
  { id: 'chu', to: PEERS.chu },
  { id: 'qi', to: PEERS.qi },
  { id: 'zhao', to: PEERS.zhao },
  { id: 'yan', to: PEERS.yan },
  { id: 'wei', to: PEERS.wei },
  { id: 'han', to: PEERS.han },
]

type ArcPhase = { visible: boolean; progress: number; opacity: number }

function easeOut(t: number) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return 1 - (1 - x) * (1 - x)
}

function stagger(progress: number, index: number, count: number, window = 0.55) {
  const delay = (index / Math.max(1, count)) * (1 - window)
  return easeOut(THREE.MathUtils.clamp((progress - delay) / window, 0, 1))
}

function readPhase(reducedMotion: boolean) {
  const clock = readNarrationClock()
  const resting = clock.status === 'idle' && !clock.hasStarted && clock.beatIndex === 0
  const paragraphIndex = resting ? 0 : clock.paragraphIndex
  const progress = reducedMotion || clock.status === 'idle' || clock.status === 'ended' ? 1 : clock.progress
  return { ...clock, paragraphIndex, progress, resting }
}

function GlobeArc({
  from,
  to,
  color,
  dashed = false,
  altitude = EARTH_RADIUS * 1.02,
  bulge = 0.016,
  lineWidth = 1.7,
  glowWidth = 4.2,
  ember = true,
  segments = 56,
  attend,
}: {
  from: { lat: number; lon: number }
  to: { lat: number; lon: number }
  color: string
  dashed?: boolean
  altitude?: number
  bulge?: number
  lineWidth?: number
  glowWidth?: number
  ember?: boolean
  segments?: number
  attend: () => ArcPhase
}) {
  const reducedMotion = useReducedMotion()
  const { size } = useThree()
  const points = useMemo(
    () => sampleGreatCircle(from.lat, from.lon, to.lat, to.lon, segments, altitude, bulge),
    [altitude, bulge, from.lat, from.lon, segments, to.lat, to.lon],
  )
  const group = useMemo(() => {
    const coreGeom = new LineGeometry()
    const glowGeom = new LineGeometry()
    const flat = points.flatMap((point) => point.toArray())
    coreGeom.setPositions(flat)
    glowGeom.setPositions(flat)
    const colorHex = new THREE.Color(color).getHex()
    const coreMat = new LineMaterial({
      color: colorHex,
      linewidth: lineWidth,
      transparent: true,
      opacity: 0.9,
      depthTest: true,
      depthWrite: false,
      dashed,
      dashSize: 0.045,
      gapSize: 0.03,
      dashScale: 1,
    })
    const glowMat = new LineMaterial({
      color: colorHex,
      linewidth: glowWidth,
      transparent: true,
      opacity: 0.18,
      depthTest: true,
      depthWrite: false,
      dashed: false,
    })
    coreMat.resolution.set(size.width, size.height)
    glowMat.resolution.set(size.width, size.height)
    const core = new Line2(coreGeom, coreMat)
    const glow = new Line2(glowGeom, glowMat)
    core.computeLineDistances()
    glow.computeLineDistances()
    core.raycast = () => {}
    glow.raycast = () => {}
    core.frustumCulled = false
    glow.frustumCulled = false
    const root = new THREE.Group()
    root.add(glow)
    root.add(core)
    return { root, core, glow, coreGeom, glowGeom, coreMat, glowMat, flat }
  }, [color, dashed, glowWidth, lineWidth, points, size.height, size.width])

  useEffect(() => {
    group.coreMat.resolution.set(size.width, size.height)
    group.glowMat.resolution.set(size.width, size.height)
  }, [group, size.height, size.width])

  useEffect(() => () => {
    group.coreGeom.dispose()
    group.glowGeom.dispose()
    group.coreMat.dispose()
    group.glowMat.dispose()
  }, [group])

  const emberRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const phase = attend()
    const progress = reducedMotion && phase.visible ? 1 : phase.progress
    group.root.visible = phase.visible && progress > 0.008
    if (!group.root.visible) {
      if (emberRef.current) emberRef.current.visible = false
      return
    }
    const count = Math.max(2, Math.ceil(progress * (points.length - 1)) + 1)
    const slice = group.flat.slice(0, count * 3)
    if (count < points.length) {
      // LineGeometry needs a complete pair; pad last point if needed
    }
    group.coreGeom.setPositions(slice.length >= 6 ? slice : group.flat.slice(0, 6))
    group.glowGeom.setPositions(slice.length >= 6 ? slice : group.flat.slice(0, 6))
    group.core.computeLineDistances()
    group.coreMat.opacity = phase.opacity
    group.glowMat.opacity = phase.opacity * 0.22
    group.coreMat.dashed = dashed
    if (dashed) group.coreMat.needsUpdate = true
    if (emberRef.current) {
      const show = ember && !reducedMotion && progress > 0.05 && progress < 0.985 && phase.visible
      emberRef.current.visible = show
      if (show) {
        const index = Math.min(points.length - 1, count - 1)
        emberRef.current.position.copy(points[index])
        const prev = points[Math.max(0, index - 1)]
        const tangent = points[index].clone().sub(prev)
        if (tangent.lengthSq() > 1e-8) {
          emberRef.current.quaternion.setFromUnitVectors(Y_UP, tangent.normalize())
        }
      }
    }
  })

  return (
    <>
      <primitive object={group.root} />
      {ember && (
        <group ref={emberRef} visible={false}>
          <mesh>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.016, 0]}>
            <coneGeometry args={[0.006, 0.02, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.88} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      )}
    </>
  )
}

function ExpandingRipple({
  lat,
  lon,
  color,
  active,
  reducedMotion,
}: {
  lat: number
  lon: number
  color: string
  active: boolean
  reducedMotion: boolean
}) {
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ring.current) return
    const material = ring.current.material as THREE.MeshBasicMaterial
    if (!active) {
      ring.current.visible = false
      return
    }
    ring.current.visible = true
    if (reducedMotion) {
      ring.current.scale.setScalar(2.4)
      material.opacity = 0.18
      return
    }
    const cycle = (clock.elapsedTime * 0.22) % 1
    ring.current.scale.setScalar(0.8 + cycle * 3.2)
    material.opacity = 0.28 * (1 - cycle)
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.014}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.05, 0.064, 72]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </SurfaceAnchor>
  )
}

function WarLabel({
  lat,
  lon,
  title,
  note,
  altitude = EARTH_RADIUS * 1.04,
}: {
  lat: number
  lon: number
  title: string
  note?: string
  altitude?: number
}) {
  const position = useMemo(() => latLngToVector3(lat, lon, altitude), [altitude, lat, lon])
  return (
    <Html center position={position} distanceFactor={4.2} zIndexRange={[4, 1]} style={{ pointerEvents: 'none' }}>
      <div className="journey-war-label">
        <strong>{title}</strong>
        {note ? <span>{note}</span> : null}
      </div>
    </Html>
  )
}

function ComparisonAnchor({
  lat,
  lon,
  color,
  title,
  note,
  active,
  reducedMotion,
}: {
  lat: number
  lon: number
  color: string
  title: string
  note: string
  active: boolean
  reducedMotion: boolean
}) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.visible = active
    const material = mesh.current.material as THREE.MeshStandardMaterial
    const pulse = reducedMotion || !active ? 0 : Math.sin(clock.elapsedTime * 1.5) * 0.5 + 0.5
    material.emissiveIntensity = 0.22 + pulse * 0.35
  })
  if (!active) return null
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.02}>
      <mesh ref={mesh}>
        <sphereGeometry args={[0.012, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.35} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <WarLabel lat={lat} lon={lon} title={title} note={note} altitude={EARTH_RADIUS * 1.055} />
    </SurfaceAnchor>
  )
}

function MovingStandard({
  from,
  to,
  color,
  attend,
  altitude = EARTH_RADIUS * 1.026,
}: {
  from: { lat: number; lon: number }
  to: { lat: number; lon: number }
  color: string
  attend: () => ArcPhase & { t?: number }
  altitude?: number
}) {
  const reducedMotion = useReducedMotion()
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!group.current) return
    const phase = attend()
    const t = reducedMotion && phase.visible ? 1 : (phase.t ?? phase.progress)
    group.current.visible = phase.visible && t > 0.02
    if (!group.current.visible) return
    const position = greatCirclePoint(from.lat, from.lon, to.lat, to.lon, THREE.MathUtils.clamp(t, 0, 1), altitude, 0.01)
    group.current.position.copy(position)
    group.current.quaternion.setFromUnitVectors(Y_UP, position.clone().normalize())
  })
  return (
    <group ref={group} visible={false}>
      <mesh position={[0, 0.028, 0]}>
        <cylinderGeometry args={[0.0015, 0.0018, 0.056, 6]} />
        <meshStandardMaterial color="#c9b48a" metalness={0.45} roughness={0.38} />
      </mesh>
      <mesh position={[0.01, 0.044, 0]}>
        <boxGeometry args={[0.02, 0.014, 0.002]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.55} metalness={0.08} />
      </mesh>
    </group>
  )
}

function Encirclement({
  lat,
  lon,
  attend,
  reducedMotion,
}: {
  lat: number
  lon: number
  attend: () => ArcPhase
  reducedMotion: boolean
}) {
  const count = 12
  const refs = useRef<Array<THREE.Group | null>>([])
  useFrame(() => {
    const phase = attend()
    const progress = reducedMotion && phase.visible ? 1 : phase.progress
    const radiusKm = THREE.MathUtils.lerp(88, 24, easeOut(progress))
    for (let index = 0; index < count; index += 1) {
      const node = refs.current[index]
      if (!node) continue
      node.visible = phase.visible && progress > 0.06
      if (!node.visible) continue
      const angle = (index / count) * Math.PI * 2 + Math.PI * 0.15
      const placed = offsetLatLon(lat, lon, Math.cos(angle) * radiusKm, Math.sin(angle) * radiusKm)
      const position = latLngToVector3(placed.lat, placed.lon, EARTH_RADIUS * 1.021)
      node.position.copy(position)
      node.quaternion.setFromUnitVectors(Y_UP, position.clone().normalize())
      const material = (node.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial
      material.opacity = phase.opacity
    }
  })
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <group
          key={index}
          ref={(node) => { refs.current[index] = node }}
          visible={false}
        >
          <mesh>
            <sphereGeometry args={[0.0055, 8, 8]} />
            <meshBasicMaterial color={QIN_RED} transparent opacity={0.85} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function AftermathMark({ language, active }: { language: JourneyLang; active: boolean }) {
  const marks = useMemo(() => {
    const items: { lat: number; lon: number }[] = []
    for (let index = 0; index < 11; index += 1) {
      const angle = (index / 11) * Math.PI * 2
      const radius = 4 + (index % 4) * 2.2
      items.push(offsetLatLon(CHANGPING_SITE.lat, CHANGPING_SITE.lon, Math.cos(angle) * radius, Math.sin(angle * 1.7) * radius * 0.7))
    }
    return items
  }, [])
  if (!active) return null
  return (
    <group>
      <SurfaceAnchor lat={CHANGPING_SITE.lat} lon={CHANGPING_SITE.lon} altitude={EARTH_RADIUS * 1.017}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.018, 28]} />
          <meshBasicMaterial color={AFTERMATH} transparent opacity={0.55} depthWrite={false} toneMapped={false} />
        </mesh>
      </SurfaceAnchor>
      {marks.map((mark, index) => (
        <SurfaceAnchor key={index} lat={mark.lat} lon={mark.lon} altitude={EARTH_RADIUS * 1.019}>
          <mesh>
            <sphereGeometry args={[0.0034, 6, 6]} />
            <meshBasicMaterial color="#3a1f1c" transparent opacity={0.8} depthWrite={false} toneMapped={false} />
          </mesh>
        </SurfaceAnchor>
      ))}
      <WarLabel
        lat={CHANGPING_SITE.lat}
        lon={CHANGPING_SITE.lon + 0.35}
        title={t(UI.changpingCaution, language)}
        altitude={EARTH_RADIUS * 1.05}
      />
    </group>
  )
}

function LiveWeaponGlows({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      {WEAPON_RACK.slots.map((slot) => (
        <LiveWeaponGlow key={slot.id} slotId={slot.id} reducedMotion={reducedMotion} />
      ))}
    </>
  )
}

function LiveWeaponGlow({ slotId, reducedMotion }: { slotId: string; reducedMotion: boolean }) {
  const slot = WEAPON_RACK.slots.find((item) => item.id === slotId)
  const placed = slot ? offsetLatLon(WEAPON_RACK.lat, WEAPON_RACK.lon, slot.offsetKm[0], slot.offsetKm[1]) : null
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ring.current || !placed) return
    const highlight = readWeaponHighlight(reducedMotion)
    const active = highlight === slotId
    ring.current.visible = active
    if (!active) return
    const material = ring.current.material as THREE.MeshBasicMaterial
    if (reducedMotion) {
      ring.current.scale.setScalar(1.12)
      material.opacity = 0.7
      return
    }
    const pulse = Math.sin(clock.elapsedTime * 2.1) * 0.5 + 0.5
    ring.current.scale.setScalar(1.04 + pulse * 0.2)
    material.opacity = 0.48 + pulse * 0.4
  })
  if (!placed) return null
  return (
    <SurfaceAnchor lat={placed.lat} lon={placed.lon} altitude={EARTH_RADIUS * 1.02}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.03, 0.042, 40]} />
        <meshBasicMaterial color={QIN_GOLD} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </SurfaceAnchor>
  )
}

export function readWeaponHighlight(reducedMotion = false): string | null {
  const phase = readPhase(reducedMotion)
  if (phase.beatIndex !== 3) return null
  if (phase.paragraphIndex <= 0) return phase.progress < 0.5 ? 'ge' : 'crossbow'
  return phase.progress < 0.5 ? 'jian' : 'cavalry'
}

export function readFormationEmphasis(id: string, reducedMotion = false) {
  const phase = readPhase(reducedMotion)
  const med = id === 'sicily' || id === 'alexander' || id === 'rome'
  if (phase.beatIndex !== 4) return { emphasis: 0, reveal: 1, pulse: false }
  if (phase.paragraphIndex === 0) {
    if (med) {
      const local = reducedMotion ? 1 : easeOut(phase.progress)
      return { emphasis: 1, reveal: local, pulse: false }
    }
    return { emphasis: 0, reveal: 0.2, pulse: false }
  }
  if (med) return { emphasis: 0.3, reveal: 1, pulse: false }
  return { emphasis: 1, reveal: 1, pulse: !reducedMotion }
}


function PhaseRipple({
  lat,
  lon,
  color,
  scale,
  reducedMotion,
  attend,
}: {
  lat: number
  lon: number
  color: string
  scale: number
  reducedMotion: boolean
  attend: () => ArcPhase
}) {
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ring.current) return
    const phase = attend()
    ring.current.visible = phase.visible
    if (!phase.visible) return
    const material = ring.current.material as THREE.MeshBasicMaterial
    if (reducedMotion) {
      ring.current.scale.setScalar(1.35 * scale)
      material.opacity = 0.28 * phase.opacity
      return
    }
    const pulse = Math.sin(clock.elapsedTime * 1.35) * 0.5 + 0.5
    ring.current.scale.setScalar((1.12 + pulse * 0.55) * scale)
    material.opacity = (0.16 + pulse * 0.24) * phase.opacity
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.016}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.04, 0.054, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.24} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </SurfaceAnchor>
  )
}

function TreatiseRings({ lat, lon, active, reducedMotion }: { lat: number; lon: number; active: boolean; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.visible = active
    if (!active) return
    group.current.children.forEach((child, index) => {
      const mesh = child as THREE.Mesh
      const material = mesh.material as THREE.MeshBasicMaterial
      if (reducedMotion) {
        mesh.scale.setScalar(1 + index * 0.4)
        material.opacity = 0.16
        return
      }
      const pulse = Math.sin(clock.elapsedTime * 0.7 + index * 0.9) * 0.5 + 0.5
      mesh.scale.setScalar(1 + index * 0.42 + pulse * 0.08)
      material.opacity = 0.08 + pulse * 0.12
    })
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.015}>
      <group ref={group} visible={false}>
        {[0.055, 0.09, 0.13].map((radius) => (
          <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.004, 72]} />
            <meshBasicMaterial color={QIN_GOLD} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </SurfaceAnchor>
  )
}

function UnificationGlow({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.visible = active
    const material = mesh.current.material as THREE.MeshBasicMaterial
    if (!active) return
    if (reducedMotion) {
      material.opacity = 0.22
      mesh.current.scale.setScalar(1)
      return
    }
    const pulse = Math.sin(clock.elapsedTime * 0.8) * 0.5 + 0.5
    material.opacity = 0.12 + pulse * 0.14
    mesh.current.scale.setScalar(0.92 + pulse * 0.12)
  })
  const china = THEATER_SITES.china
  return (
    <SurfaceAnchor lat={china.lat} lon={china.lon} altitude={EARTH_RADIUS * 1.012}>
      <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <circleGeometry args={[0.16, 48]} />
        <meshBasicMaterial color={QIN_WARM} transparent opacity={0.16} depthWrite={false} toneMapped={false} />
      </mesh>
    </SurfaceAnchor>
  )
}

function QuietEmber({ lat, lon, color, active, delayed }: { lat: number; lon: number; color: string; active: boolean; delayed: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const reducedMotion = useReducedMotion()
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.visible = active
    if (!active) return
    const material = mesh.current.material as THREE.MeshBasicMaterial
    if (reducedMotion) {
      material.opacity = 0.7
      mesh.current.scale.setScalar(1)
      return
    }
    const pulse = Math.sin(clock.elapsedTime * 1.1 + delayed) * 0.5 + 0.5
    material.opacity = 0.4 + pulse * 0.5
    mesh.current.scale.setScalar(0.85 + pulse * 0.3)
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.03}>
      <mesh ref={mesh} visible={false}>
        <sphereGeometry args={[0.01, 10, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} depthWrite={false} toneMapped={false} />
      </mesh>
    </SurfaceAnchor>
  )
}

function HookScene({ language, reducedMotion }: { language: JourneyLang; reducedMotion: boolean }) {
  const china = THEATER_SITES.china
  const greece = THEATER_SITES.greece
  const nearEast = THEATER_SITES['near-east']
  const greeceGroup = useRef<THREE.Group>(null)
  const nearGroup = useRef<THREE.Group>(null)

  useFrame(() => {
    const phase = readPhase(reducedMotion)
    const on = phase.beatIndex === 0 && !phase.resting
    const p1 = on && phase.paragraphIndex >= 1
    if (greeceGroup.current) greeceGroup.current.visible = Boolean(p1)
    if (nearGroup.current) nearGroup.current.visible = Boolean(p1 && (reducedMotion || phase.progress > 0.42))
  })

  return (
    <group>
      <PhaseRipple lat={china.lat} lon={china.lon} color={QIN_GOLD} scale={1.2} reducedMotion={reducedMotion} attend={() => {
        const phase = readPhase(reducedMotion)
        return { visible: phase.beatIndex === 0, progress: phase.progress, opacity: phase.resting ? 0.45 : 0.85 }
      }} />
      <group ref={greeceGroup} visible={false}>
        <ComparisonAnchor
          lat={greece.lat}
          lon={greece.lon}
          color={MED_SLATE}
          title={language === 'zh' ? '希腊世界 · 对照' : 'Greek world · comparison'}
          note={t(UI.warTypological, language)}
          active
          reducedMotion={reducedMotion}
        />
      </group>
      <group ref={nearGroup} visible={false}>
        <ComparisonAnchor
          lat={nearEast.lat}
          lon={nearEast.lon}
          color={MED_BLUE}
          title={language === 'zh' ? '近东 · 对照' : 'Near East · comparison'}
          note={t(UI.warTypological, language)}
          active
          reducedMotion={reducedMotion}
        />
      </group>
    </group>
  )
}

function TimelineScene({ language, reducedMotion }: { language: JourneyLang; reducedMotion: boolean }) {
  return (
    <group>
      {CHINA_ARCS.map((arc, index) => (
        <GlobeArc
          key={arc.id}
          from={QIN_HEARTLAND}
          to={arc.to}
          color={QIN_WARM}
          altitude={EARTH_RADIUS * 1.022}
          bulge={0.014}
          lineWidth={1.55}
          attend={() => {
            const phase = readPhase(reducedMotion)
            if (phase.beatIndex !== 1) return { visible: false, progress: 0, opacity: 0 }
            if (phase.paragraphIndex === 0) {
              return { visible: true, progress: stagger(phase.progress, index, CHINA_ARCS.length), opacity: 0.9 }
            }
            return { visible: true, progress: 1, opacity: 0.28 }
          }}
        />
      ))}
      <WarLabel
        lat={34.9}
        lon={113.2}
        title={t(UI.warringStatesArcs, language)}
        note={t(UI.warTypological, language)}
      />
      <GlobeArc
        from={ATHENS}
        to={SPARTA}
        color={MED_SLATE}
        altitude={EARTH_RADIUS * 1.018}
        bulge={0.008}
        lineWidth={1.8}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 1 || phase.paragraphIndex < 1) return { visible: false, progress: 0, opacity: 0 }
          return { visible: true, progress: Math.min(1, phase.progress / 0.35), opacity: 0.92 }
        }}
      />
      <GlobeArc
        from={PELLA}
        to={GAUGAMELA}
        color={MED_BLUE}
        altitude={EARTH_RADIUS * 1.024}
        bulge={0.02}
        lineWidth={1.6}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 1 || phase.paragraphIndex < 1) return { visible: false, progress: 0, opacity: 0 }
          return { visible: true, progress: stagger(phase.progress, 1, 3, 0.5), opacity: 0.85 }
        }}
      />
      <GlobeArc
        from={GAUGAMELA}
        to={HYPHASIS}
        color={MED_BLUE}
        altitude={EARTH_RADIUS * 1.024}
        bulge={0.02}
        lineWidth={1.45}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 1 || phase.paragraphIndex < 1) return { visible: false, progress: 0, opacity: 0 }
          return { visible: true, progress: stagger(phase.progress, 2, 3, 0.5), opacity: 0.7 }
        }}
      />
      <GlobeArc
        from={ATHENS}
        to={SYRACUSE}
        color={MED_SLATE}
        dashed
        altitude={EARTH_RADIUS * 1.02}
        bulge={0.012}
        lineWidth={1.2}
        ember={false}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 1 || phase.paragraphIndex < 1) return { visible: false, progress: 0, opacity: 0 }
          return { visible: true, progress: Math.min(1, Math.max(0, (phase.progress - 0.25) / 0.5)), opacity: 0.4 }
        }}
      />
      <PhaseRipple
        lat={THEATER_SITES['near-east'].lat}
        lon={THEATER_SITES['near-east'].lon}
        color={MED_SLATE}
        scale={0.9}
        reducedMotion={reducedMotion}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 1 || phase.paragraphIndex < 1) return { visible: false, progress: 0, opacity: 0 }
          return { visible: true, progress: 1, opacity: 0.8 }
        }}
      />
    </group>
  )
}

function InstitutionsScene({ reducedMotion }: { reducedMotion: boolean }) {
  const edges: [{ lat: number; lon: number }, { lat: number; lon: number }][] = [
    [INSTITUTION_SITES[0], INSTITUTION_SITES[1]],
    [INSTITUTION_SITES[1], INSTITUTION_SITES[2]],
    [INSTITUTION_SITES[2], INSTITUTION_SITES[3]],
    [INSTITUTION_SITES[3], INSTITUTION_SITES[0]],
    [INSTITUTION_SITES[0], INSTITUTION_SITES[2]],
  ]
  return (
    <group>
      {edges.map((edge, index) => (
        <GlobeArc
          key={index}
          from={edge[0]}
          to={edge[1]}
          color={QIN_GOLD}
          altitude={EARTH_RADIUS * 1.026}
          bulge={0.008}
          lineWidth={1.25}
          glowWidth={3.2}
          ember
          attend={() => {
            const phase = readPhase(reducedMotion)
            if (phase.beatIndex !== 2) return { visible: false, progress: 0, opacity: 0 }
            const progress = phase.paragraphIndex === 0 ? stagger(phase.progress, index, edges.length, 0.7) : 1
            return { visible: true, progress, opacity: phase.paragraphIndex >= 1 ? 0.7 : 0.88 }
          }}
        />
      ))}
    </group>
  )
}

function ExpandingRippleGated({ reducedMotion }: { reducedMotion: boolean }) {
  const mesh = useRef<THREE.Group>(null)
  useFrame(() => {
    const phase = readPhase(reducedMotion)
    if (mesh.current) mesh.current.visible = phase.beatIndex === 2 && phase.paragraphIndex >= 1
  })
  const guanzhong = INSTITUTION_SITES[0]
  return (
    <group ref={mesh} visible={false}>
      <ExpandingRipple lat={guanzhong.lat} lon={guanzhong.lon} color={QIN_WARM} active reducedMotion={reducedMotion} />
    </group>
  )
}

function ChangpingScene({ language, reducedMotion }: { language: JourneyLang; reducedMotion: boolean }) {
  const northWing = offsetLatLon(CHANGPING_SITE.lat, CHANGPING_SITE.lon, 18, 42)
  const southWing = offsetLatLon(CHANGPING_SITE.lat, CHANGPING_SITE.lon, 22, -38)
  const eastClose = offsetLatLon(CHANGPING_SITE.lat, CHANGPING_SITE.lon, 36, 4)
  const label = useRef<THREE.Group>(null)
  const aftermath = useRef<THREE.Group>(null)
  useFrame(() => {
    const phase = readPhase(reducedMotion)
    const on = phase.beatIndex === 5
    if (label.current) label.current.visible = on && phase.paragraphIndex === 0
    if (aftermath.current) aftermath.current.visible = on && phase.paragraphIndex >= 1
  })
  return (
    <group>
      <GlobeArc
        from={QIN_HEARTLAND}
        to={QIN_APPROACH}
        color={QIN_GOLD}
        altitude={EARTH_RADIUS * 1.02}
        bulge={0.01}
        lineWidth={1.3}
        ember={false}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 5) return { visible: false, progress: 0, opacity: 0 }
          if (phase.paragraphIndex >= 1) return { visible: true, progress: 1, opacity: 0.2 }
          return { visible: true, progress: Math.min(1, phase.progress / 0.28), opacity: 0.55 }
        }}
      />
      <GlobeArc
        from={QIN_APPROACH}
        to={CHANGPING_SITE}
        color={QIN_RED}
        altitude={EARTH_RADIUS * 1.022}
        bulge={0.008}
        lineWidth={1.8}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 5) return { visible: false, progress: 0, opacity: 0 }
          if (phase.paragraphIndex >= 1) return { visible: true, progress: 1, opacity: 0.22 }
          return { visible: true, progress: Math.min(1, Math.max(0, (phase.progress - 0.08) / 0.32)), opacity: 0.92 }
        }}
      />
      <GlobeArc
        from={HANDAN}
        to={CHANGPING_SITE}
        color={MED_SLATE}
        dashed
        altitude={EARTH_RADIUS * 1.021}
        bulge={0.006}
        lineWidth={1.5}
        ember={false}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 5) return { visible: false, progress: 0, opacity: 0 }
          if (phase.paragraphIndex >= 1) return { visible: true, progress: 1, opacity: 0.08 }
          const drawn = Math.min(1, Math.max(0, (phase.progress - 0.12) / 0.3))
          const fade = phase.progress > 0.72 ? Math.max(0.12, 1 - (phase.progress - 0.72) / 0.28) : 1
          return { visible: drawn > 0, progress: drawn, opacity: 0.85 * fade }
        }}
      />
      <GlobeArc
        from={QIN_APPROACH}
        to={northWing}
        color={QIN_WARM}
        altitude={EARTH_RADIUS * 1.02}
        bulge={0.006}
        lineWidth={1.35}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 5 || phase.paragraphIndex >= 1) return { visible: phase.beatIndex === 5 && phase.paragraphIndex >= 1, progress: 1, opacity: 0.16 }
          const t = Math.max(0, (phase.progress - 0.38) / 0.3)
          return { visible: t > 0, progress: Math.min(1, t), opacity: 0.8 }
        }}
      />
      <GlobeArc
        from={northWing}
        to={eastClose}
        color={QIN_RED}
        altitude={EARTH_RADIUS * 1.02}
        bulge={0.004}
        lineWidth={1.35}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 5) return { visible: false, progress: 0, opacity: 0 }
          if (phase.paragraphIndex >= 1) return { visible: true, progress: 1, opacity: 0.16 }
          const t = Math.max(0, (phase.progress - 0.52) / 0.28)
          return { visible: t > 0, progress: Math.min(1, t), opacity: 0.8 }
        }}
      />
      <GlobeArc
        from={QIN_APPROACH}
        to={southWing}
        color={QIN_WARM}
        altitude={EARTH_RADIUS * 1.02}
        bulge={0.006}
        lineWidth={1.35}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 5) return { visible: false, progress: 0, opacity: 0 }
          if (phase.paragraphIndex >= 1) return { visible: true, progress: 1, opacity: 0.16 }
          const t = Math.max(0, (phase.progress - 0.42) / 0.3)
          return { visible: t > 0, progress: Math.min(1, t), opacity: 0.8 }
        }}
      />
      <GlobeArc
        from={southWing}
        to={eastClose}
        color={QIN_RED}
        altitude={EARTH_RADIUS * 1.02}
        bulge={0.004}
        lineWidth={1.35}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 5) return { visible: false, progress: 0, opacity: 0 }
          if (phase.paragraphIndex >= 1) return { visible: true, progress: 1, opacity: 0.16 }
          const t = Math.max(0, (phase.progress - 0.56) / 0.28)
          return { visible: t > 0, progress: Math.min(1, t), opacity: 0.8 }
        }}
      />
      <MovingStandard
        from={QIN_APPROACH}
        to={CHANGPING_SITE}
        color={QIN_RED}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 5) return { visible: false, progress: 0, opacity: 0 }
          const t = phase.paragraphIndex >= 1 ? 0.88 : Math.min(0.88, Math.max(0, (phase.progress - 0.08) / 0.4))
          return { visible: phase.paragraphIndex === 0 || phase.paragraphIndex >= 1, progress: t, t, opacity: phase.paragraphIndex >= 1 ? 0.35 : 1 }
        }}
      />
      <MovingStandard
        from={HANDAN}
        to={CHANGPING_SITE}
        color={MED_SLATE}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 5) return { visible: false, progress: 0, opacity: 0 }
          const t = phase.paragraphIndex >= 1 ? 0.55 : Math.min(0.72, Math.max(0, (phase.progress - 0.1) / 0.35))
          return { visible: true, progress: t, t, opacity: phase.paragraphIndex >= 1 ? 0.2 : 1 }
        }}
      />
      <Encirclement
        lat={CHANGPING_SITE.lat}
        lon={CHANGPING_SITE.lon}
        reducedMotion={reducedMotion}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 5) return { visible: false, progress: 0, opacity: 0 }
          if (phase.paragraphIndex >= 1) return { visible: true, progress: 1, opacity: 0.25 }
          const t = Math.max(0, (phase.progress - 0.4) / 0.5)
          return { visible: t > 0, progress: Math.min(1, t), opacity: 0.9 }
        }}
      />
      <group ref={label}>
        <WarLabel
          lat={CHANGPING_SITE.lat - 0.55}
          lon={CHANGPING_SITE.lon + 0.15}
          title={t(UI.encircleStarve, language)}
          note={t(UI.warTypological, language)}
        />
      </group>
      <group ref={aftermath} visible={false}>
        <AftermathMark language={language} active />
      </group>
    </group>
  )
}

function StrategyScene({ language, reducedMotion }: { language: JourneyLang; reducedMotion: boolean }) {
  const farNear = useRef<THREE.Group>(null)
  const treatise = useRef<THREE.Group>(null)
  const unify = useRef<THREE.Group>(null)
  useFrame(() => {
    const phase = readPhase(reducedMotion)
    const on = phase.beatIndex === 6
    if (treatise.current) treatise.current.visible = on && phase.paragraphIndex === 0
    if (farNear.current) farNear.current.visible = on && phase.paragraphIndex >= 1
    if (unify.current) unify.current.visible = on && phase.paragraphIndex >= 2
  })
  return (
    <group>
      <group ref={treatise} visible={false}>
        <TreatiseRings lat={THEATER_SITES.china.lat} lon={THEATER_SITES.china.lon} active reducedMotion={reducedMotion} />
      </group>
      <group ref={farNear} visible={false}>
        <GlobeArc
          from={QIN_HEARTLAND}
          to={PEERS.qi}
          color={QIN_GOLD}
          dashed
          altitude={EARTH_RADIUS * 1.026}
          bulge={0.02}
          lineWidth={1.7}
          attend={() => {
            const phase = readPhase(reducedMotion)
            if (phase.beatIndex !== 6 || phase.paragraphIndex < 1) return { visible: false, progress: 0, opacity: 0 }
            return { visible: true, progress: Math.min(1, phase.paragraphIndex === 1 ? phase.progress / 0.4 : 1), opacity: phase.paragraphIndex >= 2 ? 0.45 : 0.9 }
          }}
        />
        {([PEERS.han, PEERS.wei, PEERS.zhao] as const).map((target, index) => (
          <GlobeArc
            key={index}
            from={QIN_HEARTLAND}
            to={target}
            color={QIN_RED}
            altitude={EARTH_RADIUS * 1.022}
            bulge={0.01}
            lineWidth={1.6}
            attend={() => {
              const phase = readPhase(reducedMotion)
              if (phase.beatIndex !== 6 || phase.paragraphIndex < 1) return { visible: false, progress: 0, opacity: 0 }
              const local = phase.paragraphIndex === 1 ? stagger(Math.max(0, phase.progress - 0.15), index, 3, 0.5) : 1
              return { visible: true, progress: local, opacity: phase.paragraphIndex >= 2 ? 0.4 : 0.88 }
            }}
          />
        ))}
        <GlobeArc
          from={PELLA}
          to={GAUGAMELA}
          color={MED_BLUE}
          altitude={EARTH_RADIUS * 1.02}
          bulge={0.014}
          lineWidth={1.15}
          ember={false}
          attend={() => {
            const phase = readPhase(reducedMotion)
            if (phase.beatIndex !== 6 || phase.paragraphIndex < 1) return { visible: false, progress: 0, opacity: 0 }
            return { visible: true, progress: Math.min(1, phase.paragraphIndex === 1 ? Math.max(0, (phase.progress - 0.35) / 0.4) : 1), opacity: 0.4 }
          }}
        />
        <GlobeArc
          from={GAUGAMELA}
          to={HYPHASIS}
          color={MED_BLUE}
          altitude={EARTH_RADIUS * 1.02}
          bulge={0.012}
          lineWidth={1.05}
          ember={false}
          attend={() => {
            const phase = readPhase(reducedMotion)
            if (phase.beatIndex !== 6 || phase.paragraphIndex < 1) return { visible: false, progress: 0, opacity: 0 }
            return { visible: true, progress: Math.min(1, phase.paragraphIndex === 1 ? Math.max(0, (phase.progress - 0.5) / 0.4) : 1), opacity: 0.32 }
          }}
        />
        <Encirclement
          lat={CHANGPING_SITE.lat}
          lon={CHANGPING_SITE.lon}
          reducedMotion={reducedMotion}
          attend={() => {
            const phase = readPhase(reducedMotion)
            if (phase.beatIndex !== 6 || phase.paragraphIndex !== 1) return { visible: false, progress: 0, opacity: 0 }
            const t = Math.max(0, (phase.progress - 0.55) / 0.4)
            return { visible: t > 0, progress: Math.min(1, t), opacity: 0.7 }
          }}
        />
        <WarLabel
          lat={35.6}
          lon={114.8}
          title={t(UI.farNear, language)}
          note={t(UI.warTypological, language)}
        />
      </group>
      <group ref={unify} visible={false}>
        <UnificationGlow active reducedMotion={reducedMotion} />
      </group>
    </group>
  )
}

function CloseScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      {CHINA_ARCS.slice(0, 4).map((arc) => (
        <GlobeArc
          key={arc.id}
          from={QIN_HEARTLAND}
          to={arc.to}
          color={QIN_WARM}
          altitude={EARTH_RADIUS * 1.02}
          bulge={0.012}
          lineWidth={1.2}
          ember={false}
          attend={() => {
            const phase = readPhase(reducedMotion)
            if (phase.beatIndex !== 7) return { visible: false, progress: 0, opacity: 0 }
            const fade = 1 - phase.progress * 0.75
            return { visible: fade > 0.08, progress: Math.max(0.2, fade), opacity: 0.22 * fade }
          }}
        />
      ))}
      <GlobeArc
        from={PELLA}
        to={GAUGAMELA}
        color={MED_SLATE}
        altitude={EARTH_RADIUS * 1.02}
        bulge={0.014}
        lineWidth={1.05}
        ember={false}
        attend={() => {
          const phase = readPhase(reducedMotion)
          if (phase.beatIndex !== 7) return { visible: false, progress: 0, opacity: 0 }
          const fade = 1 - phase.progress * 0.8
          return { visible: fade > 0.08, progress: Math.max(0.18, fade), opacity: 0.18 * fade }
        }}
      />
      <QuietEmber lat={THEATER_SITES.china.lat} lon={THEATER_SITES.china.lon} color={QIN_GOLD} delayed={0} active />
      <QuietEmber lat={WEAPON_RACK.lat} lon={WEAPON_RACK.lon} color={QIN_WARM} delayed={0.8} active />
      <QuietEmber lat={CHANGPING_SITE.lat} lon={CHANGPING_SITE.lon} color={QIN_RED} delayed={1.6} active />
    </group>
  )
}

export function JourneyWarLayer() {
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney((store) => store.language)
  const status = useJourney((store) => store.activeJourney)
  const diveProgress = useJourney((store) => store.diveProgress)
  const narrationStatus = useNarration((store) => store.status)
  const reducedMotion = useReducedMotion()
  if (status !== 'force') return null
  const ornaments = diveProgress < 0.02
  const showBattle = shouldMountBattle(beatIndex, diveProgress, narrationStatus)

  return (
    <group name="force-war-layer">
      <Suspense fallback={null}>
        {showBattle && beatIndex === 0 && (
          <MassBattle lat={CHINA_REGIONAL_FOCUS.lat} lon={CHINA_REGIONAL_FOCUS.lon} mode="clash" />
        )}
        {showBattle && beatIndex === 4 && (
          <MassBattle lat={CHINA_REGIONAL_FOCUS.lat} lon={CHINA_REGIONAL_FOCUS.lon} mode="mass" />
        )}
        {showBattle && beatIndex === 5 && (
          <MassBattle lat={CHANGPING_SITE.lat} lon={CHANGPING_SITE.lon} mode="encircle" />
        )}
      </Suspense>
      {ornaments && beatIndex === 0 && <HookScene language={language} reducedMotion={reducedMotion} />}
      {ornaments && beatIndex === 1 && <TimelineScene language={language} reducedMotion={reducedMotion} />}
      {ornaments && beatIndex === 2 && (
        <>
          <InstitutionsScene reducedMotion={reducedMotion} />
          <ExpandingRippleGated reducedMotion={reducedMotion} />
        </>
      )}
      {ornaments && beatIndex === 3 && <LiveWeaponGlows reducedMotion={reducedMotion} />}
      {ornaments && beatIndex === 5 && <ChangpingScene language={language} reducedMotion={reducedMotion} />}
      {ornaments && beatIndex === 6 && <StrategyScene language={language} reducedMotion={reducedMotion} />}
      {ornaments && beatIndex === 7 && <CloseScene reducedMotion={reducedMotion} />}
    </group>
  )
}
