import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'
import { industryLocale, t } from './locale'
import { SITES } from './sites'

const Y_UP = new THREE.Vector3(0, 1, 0)
const INK = '#7eb8d0'

function surfacePose(lat: number, lon: number, altitude = EARTH_RADIUS * 1.016) {
  const position = latLngToVector3(lat, lon, altitude)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(Y_UP, position.clone().normalize())
  return { position, quaternion }
}

function SurfaceAnchor({ lat, lon, altitude, children }: { lat: number; lon: number; altitude?: number; children: ReactNode }) {
  const pose = useMemo(() => surfacePose(lat, lon, altitude), [altitude, lat, lon])
  return <group position={pose.position} quaternion={pose.quaternion}>{children}</group>
}

function RegionWash({
  lat,
  lon,
  radius = 0.18,
  color = INK,
  active,
  reducedMotion,
}: {
  lat: number
  lon: number
  radius?: number
  color?: string
  active: boolean
  reducedMotion: boolean
}) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    const pulse = reducedMotion ? 0.5 : Math.sin(clock.elapsedTime * 0.9) * 0.5 + 0.5
    const material = mesh.current.material as THREE.MeshBasicMaterial
    material.opacity = active ? 0.22 + pulse * 0.1 : 0
    mesh.current.scale.setScalar(active ? 1 + pulse * 0.04 : 0.85)
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.008}>
      <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </SurfaceAnchor>
  )
}

function greatCirclePoints(a: { lat: number; lon: number }, b: { lat: number; lon: number }, segments = 32) {
  const start = latLngToVector3(a.lat, a.lon, EARTH_RADIUS * 1.012)
  const end = latLngToVector3(b.lat, b.lon, EARTH_RADIUS * 1.012)
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const point = start.clone().lerp(end, i / segments).normalize().multiplyScalar(EARTH_RADIUS * 1.012)
    points.push(point)
  }
  return points
}

function SurfaceArc({
  from,
  to,
  color = INK,
  dashed = false,
  active,
  breakPulse = false,
  reducedMotion,
}: {
  from: { lat: number; lon: number }
  to: { lat: number; lon: number }
  color?: string
  dashed?: boolean
  active: boolean
  breakPulse?: boolean
  reducedMotion: boolean
}) {
  const object = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(greatCirclePoints(from, to))
    const material = dashed || breakPulse
      ? new THREE.LineDashedMaterial({ color, transparent: true, opacity: 0, dashSize: 0.05, gapSize: 0.03, depthWrite: false, toneMapped: false })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    const line = new THREE.Line(geom, material)
    if (dashed || breakPulse) line.computeLineDistances()
    return line
  }, [breakPulse, color, dashed, from, to])
  useFrame(({ clock }) => {
    const material = object.material as THREE.LineDashedMaterial | THREE.LineBasicMaterial
    const pulse = reducedMotion ? 0.5 : Math.sin(clock.elapsedTime * (breakPulse ? 1.6 : 0.8)) * 0.5 + 0.5
    material.opacity = active ? (breakPulse ? 0.2 + pulse * 0.65 : 0.45 + pulse * 0.2) : 0
  })
  return <primitive object={object} />
}

function GlowDot({
  lat,
  lon,
  active,
  dim = false,
  reducedMotion,
  color = INK,
}: {
  lat: number
  lon: number
  active: boolean
  dim?: boolean
  reducedMotion: boolean
  color?: string
}) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!mesh.current) return
    const pulse = reducedMotion ? 0.5 : Math.sin(clock.elapsedTime * 1.4) * 0.5 + 0.5
    mesh.current.scale.setScalar(active ? (dim ? 0.55 : 1 + pulse * 0.15) : 0.01)
    const material = mesh.current.material as THREE.MeshBasicMaterial
    material.opacity = active ? (dim ? 0.18 : 0.7 + pulse * 0.2) : 0
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.02}>
      <mesh ref={mesh}>
        <sphereGeometry args={[0.014, 12, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </SurfaceAnchor>
  )
}

function EntryLabel({ title, note, active }: { title: string; note: string; active: boolean }) {
  if (!active) return null
  return (
    <Html center position={[0, 0.045, 0]} distanceFactor={3.6} zIndexRange={[4, 1]} style={{ pointerEvents: 'none' }}>
      <div className={`journey-globe-label${active ? ' is-active' : ''}`} style={{ pointerEvents: 'none' }}>
        <strong>{title}</strong>
        <span>{note}</span>
      </div>
    </Html>
  )
}

const SHIP_BANDS = [
  { lat: 38.7, lon: 119.4, radius: 0.2 },
  { lat: 31.3, lon: 122.0, radius: 0.18 },
  { lat: 22.4, lon: 113.6, radius: 0.16 },
]

const COASTAL_CITIES = [
  { lat: 31.23, lon: 121.47 },
  { lat: 39.12, lon: 117.2 },
  { lat: 23.12, lon: 113.26 },
  { lat: 36.07, lon: 120.38 },
]

const BACKUP_DOTS = [
  { lat: 45.7, lon: 126.6 },
  { lat: 41.8, lon: 123.4 },
  { lat: 30.7, lon: 104.1 },
  { lat: 34.3, lon: 108.9 },
  { lat: 36.06, lon: 103.8 },
  { lat: 26.65, lon: 106.63 },
  { lat: 29.56, lon: 106.55 },
]

const NETWORK_DOTS = [
  { lat: 41.8, lon: 123.4 },
  { lat: 39.0, lon: 117.2 },
  { lat: 31.2, lon: 121.5 },
  { lat: 30.6, lon: 114.3 },
  { lat: 30.7, lon: 104.1 },
  { lat: 23.1, lon: 113.3 },
  { lat: 36.1, lon: 103.8 },
  { lat: 34.3, lon: 108.9 },
]

export function IndustryJourneyLayer() {
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney(industryLocale)
  const paragraphIndex = useNarration((store) => store.paragraphIndex)
  const reducedMotion = useReducedMotion()
  const lang = language

  const showGuanzhong = beatIndex === 1 && paragraphIndex === 0
  const showArsenals = beatIndex === 1 && paragraphIndex === 2
  const showYellowSea = beatIndex === 1 && paragraphIndex >= 3
  const showTransport = beatIndex === 2 && paragraphIndex === 1
  const showNortheast = (beatIndex === 2 && paragraphIndex >= 2) || (beatIndex === 3 && paragraphIndex === 0)
  const showCoastal = beatIndex === 3 && paragraphIndex === 0
  const showFronts = beatIndex === 3 && paragraphIndex === 1
  const showSouthwest = beatIndex === 3 && paragraphIndex === 2
  const showBackup = beatIndex === 3 && paragraphIndex >= 3
  const showYangtze = beatIndex === 4 && paragraphIndex <= 1
  const showNetwork = beatIndex === 4 && paragraphIndex >= 2
  const showShipbands = beatIndex === 5 && paragraphIndex === 0
  const showRails = beatIndex === 6 && paragraphIndex <= 1
  const showEntries = beatIndex === 7 && paragraphIndex >= 3
  const interior = beatIndex === 0 && paragraphIndex >= 2

  return (
    <group>
      <RegionWash lat={SITES.westPacific.lat} lon={SITES.westPacific.lon} radius={0.08} active={beatIndex === 0 && paragraphIndex === 0} reducedMotion={reducedMotion} />
      <RegionWash lat={SITES.eastAsia.lat} lon={SITES.eastAsia.lon} radius={0.32} active={(beatIndex === 0 && paragraphIndex === 1) || (beatIndex === 2 && paragraphIndex === 0)} reducedMotion={reducedMotion} />
      <RegionWash lat={SITES.eastAsiaNight.lat} lon={SITES.eastAsiaNight.lon} radius={0.28} active={interior} reducedMotion={reducedMotion} />
      <RegionWash lat={SITES.guanzhong.lat} lon={SITES.guanzhong.lon} radius={0.14} active={showGuanzhong} reducedMotion={reducedMotion} />
      <GlowDot lat={SITES.shanghai.lat} lon={SITES.shanghai.lon} active={showArsenals} reducedMotion={reducedMotion} />
      <GlowDot lat={SITES.mawei.lat} lon={SITES.mawei.lon} active={showArsenals} reducedMotion={reducedMotion} />
      {showArsenals && (
        <>
          <SurfaceAnchor lat={SITES.shanghai.lat} lon={SITES.shanghai.lon}>
            <EntryLabel title={lang === 'zh' ? '上海' : 'Shanghai'} note="1865" active />
          </SurfaceAnchor>
          <SurfaceAnchor lat={SITES.mawei.lat} lon={SITES.mawei.lon}>
            <EntryLabel title={lang === 'zh' ? '福州马尾' : 'Mawei, Fuzhou'} note="1866" active />
          </SurfaceAnchor>
        </>
      )}
      <RegionWash lat={SITES.yellowSea.lat} lon={SITES.yellowSea.lon} radius={0.22} active={showYellowSea} reducedMotion={reducedMotion} />
      <SurfaceArc
        from={{ lat: 41.8, lon: 123.4 }}
        to={{ lat: 40.1, lon: 127.4 }}
        active={showTransport}
        breakPulse={showTransport}
        dashed
        reducedMotion={reducedMotion}
      />
      <RegionWash lat={SITES.northeast.lat} lon={SITES.northeast.lon} radius={0.2} active={showNortheast} reducedMotion={reducedMotion} />
      {COASTAL_CITIES.map((city) => (
        <GlowDot key={`${city.lat}-${city.lon}`} lat={city.lat} lon={city.lon} active={showCoastal} reducedMotion={reducedMotion} />
      ))}
      <RegionWash lat={23.0} lon={118.0} radius={0.42} color="#9ec4d4" active={showFronts} reducedMotion={reducedMotion} />
      <RegionWash lat={32.0} lon={110.0} radius={0.3} color="#6ea0b8" active={showFronts} reducedMotion={reducedMotion} />
      <RegionWash lat={33.0} lon={103.0} radius={0.22} color="#3e6f88" active={showFronts} reducedMotion={reducedMotion} />
      <RegionWash lat={SITES.southwestNorthwest.lat} lon={SITES.southwestNorthwest.lon} radius={0.26} active={showSouthwest} reducedMotion={reducedMotion} />
      {BACKUP_DOTS.map((dot, index) => (
        <GlowDot key={`backup-${index}`} lat={dot.lat} lon={dot.lon} active={showBackup} dim={showBackup && index === 2} reducedMotion={reducedMotion} />
      ))}
      <RegionWash lat={SITES.yangtzeBelt.lat} lon={SITES.yangtzeBelt.lon} radius={0.2} active={showYangtze} reducedMotion={reducedMotion} />
      {showNetwork && NETWORK_DOTS.map((dot, index) => (
        <GlowDot key={`net-${index}`} lat={dot.lat} lon={dot.lon} active reducedMotion={reducedMotion} />
      ))}
      {showNetwork && NETWORK_DOTS.slice(1).map((dot, index) => (
        <SurfaceArc key={`net-arc-${index}`} from={NETWORK_DOTS[index]} to={dot} active dashed reducedMotion={reducedMotion} />
      ))}
      {SHIP_BANDS.map((band) => (
        <RegionWash key={`band-${band.lon}`} lat={band.lat} lon={band.lon} radius={band.radius} active={showShipbands} reducedMotion={reducedMotion} />
      ))}
      {showRails && (
        <>
          <SurfaceArc from={{ lat: 39.0, lon: 117.5 }} to={{ lat: 31.2, lon: 121.5 }} active dashed reducedMotion={reducedMotion} />
          <SurfaceArc from={{ lat: 39.9, lon: 116.4 }} to={{ lat: 30.6, lon: 114.3 }} active dashed reducedMotion={reducedMotion} />
          <SurfaceArc from={{ lat: 30.6, lon: 114.3 }} to={{ lat: 30.7, lon: 104.1 }} active dashed reducedMotion={reducedMotion} />
          <SurfaceArc from={{ lat: 23.1, lon: 113.3 }} to={{ lat: 31.2, lon: 121.5 }} active dashed reducedMotion={reducedMotion} />
        </>
      )}
      {showEntries && (
        <>
          <GlowDot lat={SITES.forceEntry.lat} lon={SITES.forceEntry.lon} active reducedMotion={reducedMotion} color="#d4b06a" />
          <GlowDot lat={SITES.koreaEntry.lat} lon={SITES.koreaEntry.lon} active reducedMotion={reducedMotion} color="#c07a6a" />
          <GlowDot lat={SITES.mobilizeEntry.lat} lon={SITES.mobilizeEntry.lon} active reducedMotion={reducedMotion} color="#7ec8d0" />
          <GlowDot lat={SITES.baselineEntry.lat} lon={SITES.baselineEntry.lon} active reducedMotion={reducedMotion} color="#9aa7b4" />
          <SurfaceAnchor lat={SITES.forceEntry.lat} lon={SITES.forceEntry.lon}>
            <EntryLabel title={t({ en: 'Warring States', zh: '战国', ja: '戦国時代' }, lang)} note={t({ en: 'Entry', zh: '入口', ja: '入口' }, lang)} active />
          </SurfaceAnchor>
          <SurfaceAnchor lat={SITES.koreaEntry.lat} lon={SITES.koreaEntry.lon}>
            <EntryLabel title={t({ en: 'Korea', zh: '抗美援朝', ja: '朝鮮戦争' }, lang)} note={t({ en: 'Entry', zh: '入口', ja: '入口' }, lang)} active />
          </SurfaceAnchor>
          <SurfaceAnchor lat={SITES.mobilizeEntry.lat} lon={SITES.mobilizeEntry.lon}>
            <EntryLabel title={t({ en: 'Mobilization', zh: '灾难动员', ja: '災害動員' }, lang)} note={t({ en: 'Entry', zh: '入口', ja: '入口' }, lang)} active />
          </SurfaceAnchor>
          <SurfaceAnchor lat={SITES.baselineEntry.lat} lon={SITES.baselineEntry.lon}>
            <EntryLabel title={t({ en: '2026 baseline', zh: '2026 军力', ja: '2026年の軍事力' }, lang)} note={t({ en: 'Entry', zh: '入口', ja: '入口' }, lang)} active />
          </SurfaceAnchor>
        </>
      )}
    </group>
  )
}
