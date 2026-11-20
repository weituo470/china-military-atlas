import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { readKoreaClock, useKoreaParagraph, useKoreaStatus } from './playback'
import { EARTH_RADIUS, latLngToVector3, sampleGreatCircle } from '../../utils/geo'
import { t, type JourneyLang } from '../types'
import { UI } from './content'
import { ARMISTICE_LINE, PARALLEL_38, LOGISTICS_PATH, MIG_ALLEY_PATH, SITES } from './sites'

const Y_UP = new THREE.Vector3(0, 1, 0)
const PVA = '#c45c4a'
const PVA_WARM = '#d9a05a'
const UN = '#7a96a8'
const LINE_GOLD = '#e2d4a0'
const MIG = '#7ec8d4'

type ArcPhase = { visible: boolean; progress: number; opacity: number }

function easeOut(value: number) {
  const x = THREE.MathUtils.clamp(value, 0, 1)
  return 1 - (1 - x) * (1 - x)
}

function readPhase(reducedMotion: boolean) {
  const clock = readKoreaClock()
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

function ExpandingRipple({
  lat,
  lon,
  color,
  active,
  reducedMotion,
  inner = 0.04,
  outer = 0.054,
}: {
  lat: number
  lon: number
  color: string
  active: boolean
  reducedMotion: boolean
  inner?: number
  outer?: number
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
      ring.current.scale.setScalar(2.2)
      material.opacity = 0.18
      return
    }
    const cycle = (clock.elapsedTime * 0.24) % 1
    ring.current.scale.setScalar(0.8 + cycle * 2.8)
    material.opacity = 0.3 * (1 - cycle)
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.014}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[inner, outer, 72]} />
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
  visible,
}: {
  lat: number
  lon: number
  title: string
  note: string
  visible: boolean
}) {
  if (!visible) return null
  // Same reason as GlobeLabel: Html captions sat on top of the centered brief.
  // Typological caution already lives on the scroll. Pins and war marks stay visible.
  void lat
  void lon
  void title
  void note
  return null
}

const SEA_APPROACH = { lat: 37.05, lon: 125.85 }
const INCHEON = SITES.incheon
const YALU = SITES.yalu
const SINUIJU = SITES.sinuiju
const UNSAN = SITES.unsan
const SHANG = SITES.shangganling
const PANMUNJOM = SITES.panmunjom
const TAIWAN = SITES.taiwan
const BEIJING = SITES.beijing
const SASEBO = SITES.sasebo
const SANSOLI = SITES.sansoli

export function KoreaWarLayer() {
  const language = useJourney((store) => store.language) as JourneyLang
  useJourney((store) => store.beatIndex)
  useKoreaParagraph()
  useKoreaStatus()
  const reducedMotion = useReducedMotion()
  const typo = t(UI.warTypological, language)

  return (
    <group name="korea-war-layer">
      <GlobeArc
        from={PARALLEL_38[0]}
        to={PARALLEL_38[1]}
        color={LINE_GOLD}
        dashed
        bulge={0.004}
        lineWidth={1.5}
        attend={() => {
          const phase = readPhase(reducedMotion)
          const on = phase.beatIndex === 0 || phase.beatIndex === 1 || (phase.beatIndex === 4 && phase.paragraphIndex >= 2) || phase.beatIndex === 6
          return { visible: on, progress: on ? (phase.beatIndex === 0 && phase.paragraphIndex === 0 ? phase.progress : 1) : 0, opacity: 0.7 }
        }}
      />
      <Polyline
        path={ARMISTICE_LINE}
        color="#f0e6c0"
        lineWidth={2.1}
        attend={() => {
          const phase = readPhase(reducedMotion)
          const on = phase.beatIndex === 6 || (phase.beatIndex === 3 && phase.paragraphIndex >= 2) || (phase.beatIndex === 4 && phase.paragraphIndex >= 2)
          const emphasis = phase.beatIndex === 6 || (phase.beatIndex === 3 && phase.paragraphIndex >= 2)
          return { visible: on, progress: on ? (emphasis ? phase.progress : 1) : 0, opacity: emphasis ? 0.95 : 0.42 }
        }}
      />
      <GlobeArc
        from={YALU}
        to={SINUIJU}
        color={PVA}
        bulge={0.01}
        attend={() => {
          const phase = readPhase(reducedMotion)
          const on = (phase.beatIndex === 0 && phase.paragraphIndex >= 1)
            || (phase.beatIndex === 1 && phase.paragraphIndex >= 2)
            || phase.beatIndex === 2
            || (phase.beatIndex === 4 && phase.paragraphIndex === 0)
          return { visible: on, progress: on ? phase.progress : 0, opacity: 0.85 }
        }}
      />
      <GlobeArc
        from={SINUIJU}
        to={UNSAN}
        color={PVA}
        dashed
        attend={() => {
          const phase = readPhase(reducedMotion)
          const on = (phase.beatIndex === 0 && phase.paragraphIndex >= 1)
            || phase.beatIndex === 2
            || (phase.beatIndex === 4 && phase.paragraphIndex === 0)
          return { visible: on, progress: on ? (phase.beatIndex === 4 && phase.paragraphIndex === 0 ? easeOut(phase.progress) : phase.progress) : 0, opacity: phase.beatIndex === 4 && phase.paragraphIndex === 0 ? 0.55 + phase.progress * 0.35 : 0.75 }
        }}
      />
      <GlobeArc
        from={SEA_APPROACH}
        to={INCHEON}
        color={UN}
        bulge={0.03}
        lineWidth={2}
        attend={() => {
          const phase = readPhase(reducedMotion)
          const on = phase.beatIndex === 1 && phase.paragraphIndex === 1
          return { visible: on, progress: on ? phase.progress : 0, opacity: 0.88 }
        }}
      />
      <Polyline
        path={LOGISTICS_PATH}
        color={PVA_WARM}
        dashed
        attend={() => {
          const phase = readPhase(reducedMotion)
          const on = phase.beatIndex === 3
          return { visible: on, progress: on ? phase.progress : 0, opacity: 0.8 }
        }}
      />
      <Polyline
        path={MIG_ALLEY_PATH}
        color={MIG}
        attend={() => {
          const phase = readPhase(reducedMotion)
          const on = phase.beatIndex === 2 || phase.beatIndex === 3
          return { visible: on, progress: on ? (phase.beatIndex === 2 ? Math.min(1, phase.progress * 0.85 + 0.15) : phase.progress) : 0, opacity: phase.beatIndex === 2 ? 0.45 : 0.62 }
        }}
      />
      <GlobeArc
        from={{ lat: 40.05, lon: 125.55 }}
        to={SANSOLI}
        color={PVA}
        attend={() => {
          const phase = readPhase(reducedMotion)
          const on = phase.beatIndex === 4 && phase.paragraphIndex >= 1
          return { visible: on, progress: on ? phase.progress : 0, opacity: 0.9 }
        }}
      />
      <GlobeArc
        from={{ lat: 39.85, lon: 126.25 }}
        to={SANSOLI}
        color={PVA}
        dashed
        attend={() => {
          const phase = readPhase(reducedMotion)
          const on = phase.beatIndex === 4 && phase.paragraphIndex >= 1
          return { visible: on, progress: on ? easeOut(Math.max(0, phase.progress - 0.18) / 0.82) : 0, opacity: 0.8 }
        }}
      />
      <GlobeArc
        from={{ lat: 39.15, lon: 125.95 }}
        to={SANSOLI}
        color={UN}
        dashed
        attend={() => {
          const phase = readPhase(reducedMotion)
          const on = phase.beatIndex === 4 && phase.paragraphIndex === 1
          return { visible: on, progress: on ? easeOut(Math.max(0, phase.progress - 0.35) / 0.65) : 0, opacity: 0.72 }
        }}
      />
      <ExpandingRipple lat={YALU.lat} lon={YALU.lon} color={PVA} active={useRipple(0, 1, reducedMotion) || useRipple(1, 2, reducedMotion) || useRipple(2, 0, reducedMotion) || useRipple(4, 0, reducedMotion)} reducedMotion={reducedMotion} />
      <ExpandingRipple lat={INCHEON.lat} lon={INCHEON.lon} color={UN} active={useRipple(1, 1, reducedMotion)} reducedMotion={reducedMotion} />
      <ExpandingRipple lat={SANSOLI.lat} lon={SANSOLI.lon} color={PVA} active={useRipple(4, 1, reducedMotion)} reducedMotion={reducedMotion} />
      <ExpandingRipple lat={SHANG.lat} lon={SHANG.lon} color="#c9a07a" active={useRipple(3, 2, reducedMotion)} reducedMotion={reducedMotion} />
      <ExpandingRipple lat={PANMUNJOM.lat} lon={PANMUNJOM.lon} color={LINE_GOLD} active={useRipple(5, 2, reducedMotion) || useRipple(6, 0, reducedMotion) || useRipple(4, 2, reducedMotion)} reducedMotion={reducedMotion} />
      <ExpandingRipple lat={TAIWAN.lat} lon={TAIWAN.lon} color={UN} active={useRipple(1, 0, reducedMotion) || useRipple(5, 0, reducedMotion)} reducedMotion={reducedMotion} />
      <ExpandingRipple lat={SASEBO.lat} lon={SASEBO.lon} color={UN} active={useRipple(5, 1, reducedMotion)} reducedMotion={reducedMotion} />
      <ExpandingRipple lat={BEIJING.lat} lon={BEIJING.lon} color={PVA_WARM} active={useRipple(1, 2, reducedMotion) || useRipple(2, 2, reducedMotion)} reducedMotion={reducedMotion} />
      <ShangganlingRings reducedMotion={reducedMotion} />
      <SansoliCutoff reducedMotion={reducedMotion} />
      <WarLabel
        lat={38.0}
        lon={126.2}
        title={language === 'zh' ? '三八线  ·  示意' : '38th parallel  ·  schematic'}
        note={typo}
        visible={useLabelVisible([0, 1, 4, 6], reducedMotion)}
      />
      <WarLabel
        lat={40.05}
        lon={124.15}
        title={language === 'zh' ? '渡江示意' : 'Crossing, typological'}
        note={typo}
        visible={useLabelVisibleAt(0, 1, reducedMotion) || useLabelVisibleAt(1, 2, reducedMotion) || useLabelVisibleAt(2, 0, reducedMotion) || useLabelVisibleAt(4, 0, reducedMotion)}
      />
      <WarLabel
        lat={39.95}
        lon={124.85}
        title={language === 'zh' ? '米格走廊  ·  示意' : 'MiG Alley  ·  typological'}
        note={typo}
        visible={useLabelVisibleAt(2, 0, reducedMotion) || useLabelVisibleAt(3, 0, reducedMotion)}
      />
      <WarLabel
        lat={40.55}
        lon={126.7}
        title={language === 'zh' ? '后勤线  ·  示意' : 'Supply line  ·  typological'}
        note={typo}
        visible={useLabelVisibleAt(3, 0, reducedMotion)}
      />
      <WarLabel
        lat={37.956}
        lon={126.95}
        title={language === 'zh' ? '停战线  ·  示意' : 'Armistice line  ·  typological'}
        note={language === 'zh' ? '靠近三八线，并不重合' : 'Near the 38th, not identical'}
        visible={useLabelVisibleAt(5, 2, reducedMotion) || useLabelVisibleAt(6, 0, reducedMotion)}
      />
    </group>
  )
}

function useRipple(beatIndex: number, paragraphIndex: number, reducedMotion: boolean) {
  const phase = readPhase(reducedMotion)
  return phase.beatIndex === beatIndex && phase.paragraphIndex === paragraphIndex
}

function useLabelVisible(beats: number[], reducedMotion: boolean) {
  const phase = readPhase(reducedMotion)
  return beats.includes(phase.beatIndex)
}

function useLabelVisibleAt(beatIndex: number, paragraphIndex: number, reducedMotion: boolean) {
  const phase = readPhase(reducedMotion)
  return phase.beatIndex === beatIndex && phase.paragraphIndex >= paragraphIndex
}

function ProgressRing({
  lat,
  lon,
  color,
  scale,
  opacity,
  attend,
}: {
  lat: number
  lon: number
  color: string
  scale: number
  opacity: number
  attend: () => boolean
}) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (mesh.current) mesh.current.visible = attend()
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.015}>
      <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} scale={scale} visible={false}>
        <ringGeometry args={[0.02, 0.028, 64]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </SurfaceAnchor>
  )
}

function ShangganlingRings({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <ProgressRing lat={SHANG.lat} lon={SHANG.lon} color="#c9a07a" scale={1.1} opacity={0.5} attend={() => {
        const phase = readPhase(reducedMotion)
        return phase.beatIndex === 3 && phase.paragraphIndex >= 2 && phase.progress > 0.05
      }} />
      <ProgressRing lat={SHANG.lat} lon={SHANG.lon} color="#d9b08a" scale={1.8} opacity={0.4} attend={() => {
        const phase = readPhase(reducedMotion)
        return phase.beatIndex === 3 && phase.paragraphIndex >= 2 && phase.progress > 0.28
      }} />
      <ProgressRing lat={SHANG.lat} lon={SHANG.lon} color="#e2c4a0" scale={2.6} opacity={0.32} attend={() => {
        const phase = readPhase(reducedMotion)
        return phase.beatIndex === 3 && phase.paragraphIndex >= 2 && phase.progress > 0.55
      }} />
    </>
  )
}

function SansoliCutoff({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <ProgressRing lat={SANSOLI.lat} lon={SANSOLI.lon} color={PVA} scale={1.4} opacity={0.42} attend={() => {
        const phase = readPhase(reducedMotion)
        const on = phase.beatIndex === 4 && phase.paragraphIndex === 1
        return on && phase.progress > 0.2
      }} />
      <ProgressRing lat={SANSOLI.lat} lon={SANSOLI.lon} color={PVA_WARM} scale={2.2} opacity={0.32} attend={() => {
        const phase = readPhase(reducedMotion)
        const on = phase.beatIndex === 4 && phase.paragraphIndex === 1
        return on && phase.progress > 0.5
      }} />
    </>
  )
}
