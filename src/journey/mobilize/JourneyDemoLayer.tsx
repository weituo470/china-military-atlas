import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { readMobilizeClock } from './playback'
import { EARTH_RADIUS, latLngToVector3, sampleGreatCircle } from '../../utils/geo'
import {
  JINGJIANG_TRANSFER,
  LIFELINE_CORRIDORS,
  MEDICAL_ORIGINS,
  PAIRING_LINKS,
  RELIEF_CORRIDORS,
  SITES,
  WARNING_NET,
  YANGTZE_DEFENSE_LINE,
  BEAT_STAGING,
  resolvePoint,
} from './sites'

const Y_UP = new THREE.Vector3(0, 1, 0)
const TEAL = '#5ec4c8'
const AMBER = '#d9a05a'
const NAVY = '#7aa0c4'
const RED = '#c45c4a'
const GOLD = '#e2d4a0'

type ArcPhase = { visible: boolean; progress: number; opacity: number }

function easeOut(value: number) {
  const x = THREE.MathUtils.clamp(value, 0, 1)
  return 1 - (1 - x) * (1 - x)
}

function readPhase(reducedMotion: boolean) {
  const clock = readMobilizeClock()
  const resting = clock.status === 'idle' && !clock.hasStarted && clock.beatIndex === 0
  const paragraphIndex = resting ? 0 : clock.paragraphIndex
  const progress = reducedMotion || clock.status === 'idle' || clock.status === 'ended' ? 1 : clock.progress
  return { ...clock, paragraphIndex, progress, resting }
}

function surfacePose(lat: number, lon: number, altitude = EARTH_RADIUS * 1.016) {
  const position = latLngToVector3(lat, lon, altitude)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(Y_UP, position.clone().normalize())
  return { position, quaternion }
}

function SurfaceAnchor({ lat, lon, altitude, children }: { lat: number; lon: number; altitude?: number; children: ReactNode }) {
  const pose = useMemo(() => surfacePose(lat, lon, altitude), [altitude, lat, lon])
  return <group position={pose.position} quaternion={pose.quaternion}>{children}</group>
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

  useFrame(() => {
    const phase = attend()
    const progress = reducedMotion && phase.visible ? 1 : phase.progress
    group.root.visible = phase.visible && progress > 0.008
    if (!group.root.visible) return
    const count = Math.max(2, Math.ceil(progress * (points.length - 1)) + 1)
    const slice = group.flat.slice(0, count * 3)
    const positions = slice.length >= 6 ? slice : group.flat.slice(0, 6)
    group.coreGeom.setPositions(positions)
    group.glowGeom.setPositions(positions)
    group.core.computeLineDistances()
    group.coreMat.opacity = phase.opacity
    group.glowMat.opacity = phase.opacity * 0.22
    group.coreMat.dashed = dashed
    if (dashed) group.coreMat.needsUpdate = true
  })

  return <primitive object={group.root} />
}

function Polyline({
  path,
  color,
  dashed = false,
  altitude = EARTH_RADIUS * 1.018,
  lineWidth = 1.6,
  attend,
}: {
  path: readonly { lat: number; lon: number }[]
  color: string
  dashed?: boolean
  altitude?: number
  lineWidth?: number
  attend: () => ArcPhase
}) {
  const segments = useMemo(() => {
    const items: { from: { lat: number; lon: number }; to: { lat: number; lon: number } }[] = []
    for (let index = 0; index < path.length - 1; index += 1) {
      items.push({ from: path[index], to: path[index + 1] })
    }
    return items
  }, [path])
  return (
    <>
      {segments.map((segment, index) => (
        <GlobeArc
          key={`${segment.from.lat}-${segment.from.lon}-${index}`}
          from={segment.from}
          to={segment.to}
          color={color}
          dashed={dashed}
          altitude={altitude}
          bulge={0.006}
          lineWidth={lineWidth}
          glowWidth={lineWidth * 2.4}
          segments={24}
          attend={() => {
            const phase = attend()
            const local = easeOut((phase.progress - index / segments.length) / (1 / segments.length))
            return { visible: phase.visible, progress: THREE.MathUtils.clamp(local, 0, 1), opacity: phase.opacity }
          }}
        />
      ))}
    </>
  )
}

function HospitalPad({
  lat,
  lon,
  which,
  reducedMotion,
  color,
}: {
  lat: number
  lon: number
  which: 'huoshenshan' | 'leishenshan'
  reducedMotion: boolean
  color: string
}) {
  const group = useRef<THREE.Group>(null)
  const mats = useRef<THREE.MeshStandardMaterial[]>([])
  useFrame(() => {
    if (!group.current) return
    const phase = readPhase(reducedMotion)
    let shown = 0
    if (phase.beatIndex === 4) {
      if (phase.paragraphIndex >= 2) shown = 1
      else if (phase.paragraphIndex === 1) shown = Math.max(which === 'huoshenshan' ? 0.25 : 0.15, phase.progress * (which === 'huoshenshan' ? 1 : 0.85))
      else shown = which === 'huoshenshan' ? 0.15 : 0.1
    }
    if (reducedMotion && phase.beatIndex === 4) shown = 1
    group.current.visible = shown > 0.05
    group.current.scale.setScalar(0.4 + shown * 0.6)
    mats.current.forEach((material) => {
      material.opacity = 0.4 + shown * 0.55
    })
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.022}>
      <group ref={group}>
        {[-0.018, 0, 0.018].map((x, index) => (
          <mesh key={index} position={[x, 0.01 + index * 0.004, 0]}>
            <boxGeometry args={[0.014, 0.016, 0.02]} />
            <meshStandardMaterial
              ref={(material) => { if (material) mats.current[index] = material }}
              color={color}
              roughness={0.45}
              metalness={0.2}
              emissive="#4a3010"
              emissiveIntensity={0.28}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>
    </SurfaceAnchor>
  )
}

function WarningRipple({
  lat,
  lon,
  active,
  reducedMotion,
}: {
  lat: number
  lon: number
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
      ring.current.scale.setScalar(2.1)
      material.opacity = 0.18
      return
    }
    const cycle = (clock.elapsedTime * 0.28) % 1
    ring.current.scale.setScalar(0.8 + cycle * 2.6)
    material.opacity = 0.28 * (1 - cycle)
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.014}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.036, 0.05, 64]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </SurfaceAnchor>
  )
}

export function MobilizeDemoLayer() {
  const beatIndex = useJourney((store) => store.beatIndex)
  const reducedMotion = useReducedMotion()
  const staging = BEAT_STAGING[beatIndex] ?? BEAT_STAGING[0]

  return (
    <group name="mobilize-demo-layer">
      {staging.showFloodLine && (
        <Polyline
          path={YANGTZE_DEFENSE_LINE}
          color={NAVY}
          lineWidth={2.1}
          attend={() => {
            const phase = readPhase(reducedMotion)
            const visible = phase.beatIndex === 2
            const progress = phase.paragraphIndex === 0 ? Math.max(0.35, phase.progress) : 1
            return { visible, progress, opacity: visible ? 0.92 : 0 }
          }}
        />
      )}

      {staging.showTransfer && (
        <GlobeArc
          from={JINGJIANG_TRANSFER.from}
          to={JINGJIANG_TRANSFER.to}
          color={AMBER}
          dashed
          bulge={0.012}
          attend={() => {
            const phase = readPhase(reducedMotion)
            const visible = phase.beatIndex === 2 && phase.paragraphIndex >= 1
            return { visible, progress: visible ? (phase.paragraphIndex >= 2 ? 1 : Math.max(0.2, phase.progress)) : 0, opacity: visible ? 0.88 : 0 }
          }}
        />
      )}

      {staging.showReliefCorridors && RELIEF_CORRIDORS.map((link, index) => {
        const from = resolvePoint(link.from)
        const to = resolvePoint(link.to)
        return (
          <GlobeArc
            key={`${link.from}-${link.to}`}
            from={from}
            to={to}
            color={index === RELIEF_CORRIDORS.length - 1 ? AMBER : GOLD}
            dashed={index === RELIEF_CORRIDORS.length - 1}
            bulge={index === RELIEF_CORRIDORS.length - 1 ? 0.04 : 0.012}
            lineWidth={index === RELIEF_CORRIDORS.length - 1 ? 1.3 : 1.8}
            attend={() => {
              const phase = readPhase(reducedMotion)
              const visible = phase.beatIndex === 3
              const start = index / RELIEF_CORRIDORS.length
              const local = easeOut((phase.progress * 0.85 + (phase.paragraphIndex > 0 ? 0.3 : 0) - start) / 0.55)
              return { visible, progress: THREE.MathUtils.clamp(local, 0, 1), opacity: visible ? 0.9 : 0 }
            }}
          />
        )
      })}

      {staging.showMedicalRoutes && MEDICAL_ORIGINS.map((id, index) => {
        const from = SITES[id]
        const to = SITES.wuhan
        return (
          <GlobeArc
            key={`med-${id}`}
            from={from}
            to={to}
            color={TEAL}
            dashed
            bulge={0.03}
            lineWidth={1.35}
            glowWidth={3.2}
            attend={() => {
              const phase = readPhase(reducedMotion)
              const visible = phase.beatIndex === 4 && phase.paragraphIndex >= 2
              const local = easeOut((phase.progress - index / MEDICAL_ORIGINS.length) / 0.7)
              return { visible, progress: visible ? THREE.MathUtils.clamp(local, 0, 1) : 0, opacity: visible ? 0.82 : 0 }
            }}
          />
        )
      })}

      {staging.showHospitals && (
        <>
          <HospitalPad
            lat={SITES.huoshenshan.lat}
            lon={SITES.huoshenshan.lon}
            which="huoshenshan"
            reducedMotion={reducedMotion}
            color={AMBER}
          />
          <HospitalPad
            lat={SITES.leishenshan.lat}
            lon={SITES.leishenshan.lon}
            which="leishenshan"
            reducedMotion={reducedMotion}
            color="#e0c080"
          />
        </>
      )}

      {staging.showWarningNet && WARNING_NET.map((id) => {
        const site = SITES[id]
        return (
          <WarningRipple
            key={`warn-${id}`}
            lat={site.lat}
            lon={site.lon}
            active
            reducedMotion={reducedMotion}
          />
        )
      })}
      {staging.showWarningNet && WARNING_NET.slice(1).map((id, index) => (
        <GlobeArc
          key={`net-${id}`}
          from={SITES.beijing}
          to={SITES[id]}
          color={TEAL}
          dashed
          bulge={0.02}
          lineWidth={1.2}
          attend={() => {
            const phase = readPhase(reducedMotion)
            const visible = phase.beatIndex === 5
            const local = easeOut((phase.progress - index / (WARNING_NET.length - 1)) / 0.8)
            return { visible, progress: THREE.MathUtils.clamp(local, 0, 1), opacity: visible ? 0.7 : 0 }
          }}
        />
      ))}

      {staging.showPairing && PAIRING_LINKS.map((link, index) => {
        const to = resolvePoint(link.to)
        return (
          <GlobeArc
            key={`pair-${link.from.id}`}
            from={link.from}
            to={to}
            color={RED}
            bulge={0.035}
            lineWidth={1.15}
            glowWidth={2.8}
            attend={() => {
              const phase = readPhase(reducedMotion)
              const visible = phase.beatIndex === 6 && phase.paragraphIndex >= 1
              const local = easeOut((phase.progress * 0.7 + 0.2 - index / PAIRING_LINKS.length) / 0.65)
              return { visible, progress: THREE.MathUtils.clamp(local, 0, 1), opacity: visible ? 0.78 : 0 }
            }}
          />
        )
      })}

      {staging.showLifelines && LIFELINE_CORRIDORS.map((link) => {
        const from = resolvePoint(link.from)
        const to = resolvePoint(link.to)
        return (
          <GlobeArc
            key={`life-${link.from}-${link.to}`}
            from={from}
            to={to}
            color={GOLD}
            lineWidth={2}
            bulge={0.01}
            attend={() => {
              const phase = readPhase(reducedMotion)
              const visible = phase.beatIndex === 6 && phase.paragraphIndex >= 2
              return { visible, progress: visible ? Math.max(0.4, phase.progress) : 0, opacity: visible ? 0.9 : 0 }
            }}
          />
        )
      })}
    </group>
  )
}
