import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ComponentProps, type ReactNode } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'
import type { JourneySite, Localized } from '../types'
import { selectBaselineLocale, t, tri, type BaselineLocale } from './locale'
import { japaneseCards } from './locale-copy'
import {
  DOCTRINE_CARDS,
  INDUSTRY_CARDS,
  INTERFACE_CARDS,
  PLATFORM_CARDS,
  THEATER_CARDS,
} from './content'
import {
  COLUMN_GAP,
  COLUMN_WIDTH,
  COMPARISON_AXES,
  GLOBE_COUNTRIES,
  columnHeight,
  compareLabelAnchor,
  type ComparisonCountry,
} from './comparison'
import { ReviewFormation, CarrierSilhouette, DestroyerSilhouette } from './ReviewLayer'
import {
  BEAT_STAGING,
  DOCTRINE_SITE,
  INDUSTRY_SITES,
  KOREA_INTERFACE_SITE,
  PLATFORM_SITES,
  THEATER_SITES,
  WEST_PACIFIC_ARC,
} from './sites'

const Y_UP = new THREE.Vector3(0, 1, 0)

function wrapLon(lon: number) {
  let value = lon
  while (value > 180) value -= 360
  while (value < -180) value += 360
  return value
}
const HATCH_TEXTURE = createHatchTexture()

function createHatchTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')
  if (!context) return null
  context.fillStyle = '#9eb4c4'
  context.fillRect(0, 0, 32, 32)
  context.strokeStyle = 'rgba(12, 22, 32, 0.72)'
  context.lineWidth = 3
  for (let offset = -32; offset < 64; offset += 8) {
    context.beginPath()
    context.moveTo(offset, 0)
    context.lineTo(offset + 32, 32)
    context.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 8)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}


const PERSONNEL_FOCUS = new Set(['china', 'india', 'united-states', 'north-korea', 'russia'])
const ARMS_FOCUS = new Set(['united-states', 'china', 'russia', 'india'])

/** Hide globe labels that would sit over the centered paper sheet. */
const LABEL_OCCLUDERS = ['.baseline-paper', '.journey-progress'] as const

function labelOverlapsOccluder(labelBox: DOMRect, pad: number) {
  if (labelBox.width <= 0) return false
  for (const selector of LABEL_OCCLUDERS) {
    const el = document.querySelector(selector)
    if (!el) continue
    const box = el.getBoundingClientRect()
    const overlaps = !(
      labelBox.right < box.left - pad
      || labelBox.left > box.right + pad
      || labelBox.bottom < box.top - pad
      || labelBox.top > box.bottom + pad
    )
    if (overlaps) return true
  }
  return false
}

function ScrollSafeLabel({
  children,
  position,
  ...htmlProps
}: { children: ReactNode; position?: [number, number, number] } & Omit<ComponentProps<typeof Html>, 'children' | 'position'>) {
  const gate = useRef<HTMLDivElement>(null)
  const marker = useRef<THREE.Group>(null)
  const visible = useRef(true)
  useFrame(({ camera, size }) => {
    if (!marker.current || !gate.current) return
    const projected = new THREE.Vector3()
    marker.current.getWorldPosition(projected)
    projected.project(camera)
    let show = projected.z < 1
    if (show) {
      const labelBox = gate.current.getBoundingClientRect()
      if (labelOverlapsOccluder(labelBox, 12)) show = false
      const clipped = (
        labelBox.width > 0
        && (
          labelBox.bottom > size.height - 6
          || labelBox.top < 6
          || labelBox.right > size.width + 8
          || labelBox.left < -8
        )
      )
      if (clipped) show = false
    }
    if (show !== visible.current) {
      visible.current = show
      gate.current.style.opacity = show ? '1' : '0'
      gate.current.style.pointerEvents = show ? 'auto' : 'none'
      gate.current.setAttribute('aria-hidden', show ? 'false' : 'true')
      gate.current.inert = !show
    }
  })
  return (
    <group ref={marker} position={position}>
      <Html {...htmlProps}>
        <div ref={gate} className="baseline-label-gate">{children}</div>
      </Html>
    </group>
  )
}

function surfacePose(lat: number, lon: number, altitude = EARTH_RADIUS * 1.018) {
  const position = latLngToVector3(lat, lon, altitude)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(Y_UP, position.clone().normalize())
  return { position, quaternion }
}

function SurfaceAnchor({ lat, lon, altitude, children }: { lat: number; lon: number; altitude?: number; children: ReactNode }) {
  const pose = useMemo(() => surfacePose(lat, lon, altitude), [altitude, lat, lon])
  return <group position={pose.position} quaternion={pose.quaternion}>{children}</group>
}

function PulseRing({ color, selected, reducedMotion }: { color: string; selected: boolean; reducedMotion: boolean }) {
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ring.current) return
    const pulse = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 1.5) * 0.5 + 0.5
    const scale = selected ? 1.16 + pulse * 0.08 : 1 + pulse * 0.05
    ring.current.scale.setScalar(scale)
    const material = ring.current.material as THREE.MeshBasicMaterial
    material.opacity = selected ? 0.88 : 0.42 + pulse * 0.2
  })
  return (
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.03, 0.038, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function JourneyLabel({
  title,
  note,
  active,
  onClick,
}: {
  title: string
  note: string
  active: boolean
  onClick: () => void
}) {
  return (
    <ScrollSafeLabel center position={[0, 0.055, 0]} distanceFactor={3.4} zIndexRange={[80, 24]} style={{ pointerEvents: 'auto', width: 'max-content' }}>
      <button type="button" className={`journey-globe-label is-baseline${active ? ' is-active' : ''}`} onClick={(event) => { event.stopPropagation(); onClick() }}>
        <strong>{title}</strong>
        <span>{note}</span>
      </button>
    </ScrollSafeLabel>
  )
}

function TheaterPin({
  site,
  title,
  note,
  language,
  selected,
  reducedMotion,
}: {
  site: JourneySite
  title: Localized
  note: Localized
  language: BaselineLocale
  selected: boolean
  reducedMotion: boolean
}) {
  const openCard = useJourney((store) => store.openCard)
  return (
    <SurfaceAnchor lat={site.lat} lon={site.lon} altitude={EARTH_RADIUS * 1.02}>
      <mesh>
        <sphereGeometry args={[0.015, 16, 12]} />
        <meshStandardMaterial color={selected ? '#e8f2f6' : '#9ec4d4'} roughness={0.3} metalness={0.45} emissive={selected ? '#6a9aac' : '#1c3a48'} emissiveIntensity={selected ? 0.55 : 0.22} />
      </mesh>
      <PulseRing color="#c9e4ee" selected={selected} reducedMotion={reducedMotion} />
      <JourneyLabel
        title={language === 'ja' ? japaneseCards[site.id][1] : t(title, language)}
        note={tri(language, note.zh, note.en, '戦区の代表地点 · 模式表示')}
        active={selected}
        onClick={() => openCard('theater', site.id, { lat: site.lat, lon: site.lon, distance: 3.05 })}
      />
    </SurfaceAnchor>
  )
}

function IndustryMark({
  site,
  title,
  language,
  selected,
  reducedMotion,
}: {
  site: JourneySite
  title: Localized
  language: BaselineLocale
  selected: boolean
  reducedMotion: boolean
}) {
  const openCard = useJourney((store) => store.openCard)
  const mark = useRef<THREE.Group>(null)
  const visible = useRef(true)
  useFrame(({ camera, size }) => {
    if (!mark.current) return
    const projected = new THREE.Vector3()
    mark.current.getWorldPosition(projected)
    projected.project(camera)
    let show = projected.z < 1
    if (show) {
      const x = (projected.x * 0.5 + 0.5) * size.width
      const y = (-projected.y * 0.5 + 0.5) * size.height
      const dock = document.querySelector('.journey-progress')
      if (dock) {
        const box = dock.getBoundingClientRect()
        const pad = 18
        if (x > box.left - pad && x < box.right + pad && y > box.top - pad && y < box.bottom + pad) show = false
      }
    }
    if (show !== visible.current) {
      visible.current = show
      mark.current.visible = show
    }
  })
  return (
    <SurfaceAnchor lat={site.lat} lon={site.lon} altitude={EARTH_RADIUS * 1.02}>
      <group ref={mark}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.022, 0.04, 4]} />
          <meshBasicMaterial color={selected ? '#f0e2c4' : '#c4b48a'} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
        <PulseRing color="#d8c9a0" selected={selected} reducedMotion={reducedMotion} />
        <JourneyLabel
          title={language === 'ja' ? japaneseCards[site.id][1] : t(title, language)}
          note={tri(language, '产业带 · 示意', 'Industrial region · schematic', '産業集積地 · 模式表示')}
          active={selected}
          onClick={() => openCard('platform', site.id, { lat: site.lat, lon: site.lon, distance: 2.9 })}
        />
      </group>
    </SurfaceAnchor>
  )
}


function FighterSilhouette() {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0.05)
    s.lineTo(0.028, -0.036)
    s.lineTo(0, -0.02)
    s.lineTo(-0.028, -0.036)
    s.closePath()
    return s
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#cfd6dc" roughness={0.3} metalness={0.55} side={THREE.DoubleSide} />
    </mesh>
  )
}

function PlatformMark({
  site,
  id,
  title,
  language,
  selected,
  reducedMotion,
}: {
  site: JourneySite
  id: string
  title: Localized
  language: BaselineLocale
  selected: boolean
  reducedMotion: boolean
}) {
  const openCard = useJourney((store) => store.openCard)
  const scale = selected ? 1.18 : 1
  return (
    <SurfaceAnchor lat={site.lat} lon={site.lon} altitude={EARTH_RADIUS * 1.028}>
      <group
        scale={scale}
        onClick={(event) => { event.stopPropagation(); openCard('platform', id, { lat: site.lat, lon: site.lon, distance: 2.7 }) }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        {id === 'carriers' && <CarrierSilhouette />}
        {id === 'type055' && <DestroyerSilhouette />}
        {id === 'j20' && <FighterSilhouette />}
      </group>
      <PulseRing color="#dce6ec" selected={selected} reducedMotion={reducedMotion} />
      <JourneyLabel
        title={language === 'ja' ? japaneseCards[site.id][1] : t(title, language)}
        note={tri(language, '类型学剪影 · 示意', 'Typological silhouette · schematic', '装備のシルエット · 模式図')}
        active={selected}
        onClick={() => openCard('platform', id, { lat: site.lat, lon: site.lon, distance: 2.7 })}
      />
    </SurfaceAnchor>
  )
}

/** Visual thickness only — locked comparison figures stay in comparison.ts. */
const COLUMN_VISUAL_WIDTH = COLUMN_WIDTH * 1.42

function HatchColumn({
  color,
  hatch,
  height,
}: {
  color: string
  hatch: string
  height: number
}) {
  if (height <= 0) return null
  return (
    <group>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[COLUMN_VISUAL_WIDTH, height, COLUMN_VISUAL_WIDTH]} />
        <meshStandardMaterial
          color={color}
          roughness={0.68}
          metalness={0.08}
          map={HATCH_TEXTURE}
          emissive={hatch}
          emissiveIntensity={0.16}
        />
      </mesh>
      <mesh position={[0, height + 0.005, 0]}>
        <boxGeometry args={[COLUMN_VISUAL_WIDTH * 1.18, 0.007, COLUMN_VISUAL_WIDTH * 1.18]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  )
}

function ComparisonCluster({
  country,
  language,
  selected,
  reducedMotion,
  paragraphIndex,
}: {
  country: ComparisonCountry
  language: BaselineLocale
  selected: boolean
  reducedMotion: boolean
  paragraphIndex: number
}) {
  const openCard = useJourney((store) => store.openCard)
  const site = country.site
  if (!site) return null
  const heights = {
    personnel: columnHeight('personnel', country.personnel),
    spending: columnHeight('spending', country.spending),
    aircraft: columnHeight('aircraft', country.aircraft),
  }
  const tallest = Math.max(heights.personnel, heights.spending, heights.aircraft, 0.08)
  const spoken = paragraphIndex <= 0
    || (paragraphIndex === 1 && PERSONNEL_FOCUS.has(country.id))
    || (paragraphIndex >= 2 && ARMS_FOCUS.has(country.id))
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (!group.current) return
    const target = selected ? 1.1 : spoken ? 1.04 : 0.92
    const scale = reducedMotion ? target : THREE.MathUtils.damp(group.current.scale.x, target, 8, delta)
    group.current.scale.setScalar(scale)
  })
  const pitch = COLUMN_VISUAL_WIDTH + COLUMN_GAP
  const showSpending = heights.spending > 0
  const left = showSpending ? -pitch : -pitch / 2
  const right = showSpending ? pitch : pitch / 2
  const focus = { lat: site.lat, lon: site.lon, distance: 3.85 }
  const anchor = compareLabelAnchor(country, paragraphIndex)
  const labelPos = anchor.offset ?? [0, 0, 0]
  const labelGeo = anchor.geo
  const badge = (
    <ScrollSafeLabel
      center
      position={labelGeo ? [0, 0.05, 0] : [labelPos[0], tallest + 0.05 + labelPos[1], labelPos[2]]}
      distanceFactor={3.8}
      zIndexRange={[90, 30]}
      style={{ pointerEvents: 'auto', width: 'max-content' }}
    >
      <button
        type="button"
        className={`journey-globe-label is-baseline is-compare${selected ? ' is-active' : ''}`}
        onClick={(event) => { event.stopPropagation(); openCard('estimate', country.id, focus) }}
      >
        <strong>{language === 'ja' ? japaneseCards[country.id][1] : t(country.short, language)}</strong>
        <span>{tri(language, '示意 · 外部估计', 'schematic · estimate', '模式図 · 外部推計')}</span>
      </button>
    </ScrollSafeLabel>
  )
  return (
    <group>
    <SurfaceAnchor lat={site.lat} lon={site.lon} altitude={EARTH_RADIUS * 1.02}>
      <group
        ref={group}
        onClick={(event) => { event.stopPropagation(); openCard('estimate', country.id, focus) }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        <group position={[left, 0, 0]}>
          <HatchColumn color={COMPARISON_AXES[0].color} hatch={COMPARISON_AXES[0].hatch} height={heights.personnel} />
        </group>
        {showSpending && (
          <group position={[0, 0, 0]}>
            <HatchColumn color={COMPARISON_AXES[1].color} hatch={COMPARISON_AXES[1].hatch} height={heights.spending} />
          </group>
        )}
        <group position={[right, 0, 0]}>
          <HatchColumn color={COMPARISON_AXES[2].color} hatch={COMPARISON_AXES[2].hatch} height={heights.aircraft} />
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <ringGeometry args={[0.028, 0.034, 32]} />
          <meshBasicMaterial color={selected ? '#e8f0f4' : '#9aa8b0'} transparent opacity={selected ? 0.7 : 0.35} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      {!labelGeo && badge}
    </SurfaceAnchor>
    {labelGeo && (
      <SurfaceAnchor lat={site.lat + labelGeo.dLat} lon={wrapLon(site.lon + labelGeo.dLon)} altitude={EARTH_RADIUS * 1.028}>
        {badge}
      </SurfaceAnchor>
    )}
    </group>
  )
}

function WestPacArc({ language, reducedMotion }: { language: BaselineLocale; reducedMotion: boolean }) {
  const points = useMemo(
    () => WEST_PACIFIC_ARC.points.map((point) => latLngToVector3(point.lat, point.lon, EARTH_RADIUS * 1.03)),
    [],
  )
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.15), [points])
  const linePoints = useMemo(() => curve.getPoints(64), [curve])
  const mid = WEST_PACIFIC_ARC.points[2]
  const band = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!band.current || reducedMotion) return
    const material = band.current.material as THREE.MeshBasicMaterial
    material.opacity = 0.16 + Math.sin(clock.elapsedTime * 0.9) * 0.05
  })
  return (
    <group>
      <Line points={linePoints} color="#c5e4f0" transparent opacity={0.85} lineWidth={1.6} />
      <mesh ref={band}>
        <tubeGeometry args={[curve, 64, 0.018, 8, false]} />
        <meshBasicMaterial color="#8fb8c8" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
      </mesh>
      <SurfaceAnchor lat={mid.lat} lon={mid.lon} altitude={EARTH_RADIUS * 1.032}>
        <JourneyLabel
          title={tri(language, '西太平洋取景', 'Western Pacific framing', '西太平洋の広域図')}
          note={tri(language, WEST_PACIFIC_ARC.precisionNote.zh, WEST_PACIFIC_ARC.precisionNote.en, '西太平洋の海域を広く見渡す模式表示です。')}
          active={false}
          onClick={() => { /* framing only; the scroll already states the caution */ }}
        />
      </SurfaceAnchor>
    </group>
  )
}

function DoctrineMark({ language, selected, reducedMotion }: { language: BaselineLocale; selected: boolean; reducedMotion: boolean }) {
  const openCard = useJourney((store) => store.openCard)
  const card = DOCTRINE_CARDS[0]
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const target = selected ? 1.12 : 1
    const scale = reducedMotion ? target : THREE.MathUtils.damp(group.current.scale.x, target, 8, delta)
    group.current.scale.setScalar(scale)
    group.current.position.y = reducedMotion ? 0.03 : 0.03 + Math.sin(clock.elapsedTime * 1.1) * 0.004
  })
  return (
    <SurfaceAnchor lat={DOCTRINE_SITE.lat} lon={DOCTRINE_SITE.lon} altitude={EARTH_RADIUS * 1.022}>
      <group ref={group}>
        <mesh
          position={[0, 0.03, 0]}
          onClick={(event) => { event.stopPropagation(); openCard('doctrine', card.id, { lat: DOCTRINE_SITE.lat, lon: DOCTRINE_SITE.lon, distance: 2.7 }) }}
        >
          <boxGeometry args={[0.036, 0.07, 0.01]} />
          <meshStandardMaterial color={selected ? '#e8eef2' : '#9aa8b0'} roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.068, 0]}>
          <boxGeometry args={[0.042, 0.006, 0.014]} />
          <meshStandardMaterial color="#8a3b32" roughness={0.4} metalness={0.2} />
        </mesh>
      </group>
      <JourneyLabel
        title={language === 'ja' ? japaneseCards[card.id][1] : t(card.title, language)}
        note={tri(language, '官方公开词汇', 'Official public vocabulary', '公式の公開用語')}
        active={selected}
        onClick={() => openCard('doctrine', card.id, { lat: DOCTRINE_SITE.lat, lon: DOCTRINE_SITE.lon, distance: 2.7 })}
      />
    </SurfaceAnchor>
  )
}

function InterfaceMark({ language, selected, reducedMotion }: { language: BaselineLocale; selected: boolean; reducedMotion: boolean }) {
  const openCard = useJourney((store) => store.openCard)
  const card = INTERFACE_CARDS[0]
  const site = KOREA_INTERFACE_SITE
  return (
    <SurfaceAnchor lat={site.lat} lon={site.lon} altitude={EARTH_RADIUS * 1.022}>
      <mesh>
        <sphereGeometry args={[0.012, 14, 10]} />
        <meshStandardMaterial color={selected ? '#f0e0c8' : '#c4a070'} roughness={0.4} metalness={0.25} emissive={selected ? '#8a6a38' : '#3a2a14'} emissiveIntensity={selected ? 0.4 : 0.15} />
      </mesh>
      <PulseRing color="#e6d0a8" selected={selected} reducedMotion={reducedMotion} />
      <JourneyLabel
        title={language === 'ja' ? japaneseCards[card.id][1] : t(card.title, language)}
        note={tri(language, '平行导览接口', 'Sibling-journey interface', '別のガイドへの目印')}
        active={selected}
        onClick={() => openCard('doctrine', card.id, { lat: site.lat, lon: site.lon, distance: 3.4 })}
      />
    </SurfaceAnchor>
  )
}

export function Baseline2026Layer() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney(selectBaselineLocale)
  const selectedCardKind = useJourney((store) => store.selectedCardKind)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const reducedMotion = useReducedMotion()
  const paragraphIndex = useNarration((store) => store.paragraphIndex)

  if (activeJourney !== 'baseline2026') return null
  const staging = BEAT_STAGING[beatIndex] ?? BEAT_STAGING[0]

  return (
    <group name="baseline2026-journey-layer">
      {staging.visibleTheaters.map((id) => {
        const site = THEATER_SITES[id]
        const theater = THEATER_CARDS.find((item) => item.id === id)
        if (!site || !theater) return null
        return (
          <TheaterPin
            key={id}
            site={site}
            title={theater.title}
            note={{ en: 'Theater region · typological', zh: '战区地域 · 类型学' }}
            language={language}
            selected={selectedCardKind === 'theater' && selectedCardId === id}
            reducedMotion={reducedMotion}
          />
        )
      })}
      {staging.showIndustry && Object.values(INDUSTRY_SITES).map((site) => {
        const card = INDUSTRY_CARDS.find((item) => item.id === site.id)
        if (!card) return null
        return (
          <IndustryMark
            key={site.id}
            site={site}
            title={card.title}
            language={language}
            selected={selectedCardKind === 'platform' && selectedCardId === site.id}
            reducedMotion={reducedMotion}
          />
        )
      })}
      {staging.showPlatforms && Object.values(PLATFORM_SITES).map((site) => {
        const card = PLATFORM_CARDS.find((item) => item.id === site.id)
        if (!card) return null
        return (
          <PlatformMark
            key={site.id}
            site={site}
            id={site.id}
            title={card.title}
            language={language}
            selected={selectedCardKind === 'platform' && selectedCardId === site.id}
            reducedMotion={reducedMotion}
          />
        )
      })}
      {staging.showScale && GLOBE_COUNTRIES.map((country) => (
        <ComparisonCluster
          key={country.id}
          country={country}
          language={language}
          selected={selectedCardKind === 'estimate' && selectedCardId === country.id}
          reducedMotion={reducedMotion}
          paragraphIndex={paragraphIndex}
        />
      ))}
      {staging.showReview && (
        <ReviewFormation
          language={language}
          selectedId={selectedCardKind === 'platform' ? selectedCardId : null}
          paragraphIndex={paragraphIndex}
          reducedMotion={reducedMotion}
        />
      )}
      {staging.showWestPacArc && <WestPacArc language={language} reducedMotion={reducedMotion} />}
      {staging.showDoctrine && (
        <DoctrineMark
          language={language}
          selected={selectedCardKind === 'doctrine' && selectedCardId === 'vocabulary'}
          reducedMotion={reducedMotion}
        />
      )}
      {staging.showInterfaces && (
        <InterfaceMark
          language={language}
          selected={selectedCardKind === 'doctrine' && selectedCardId === 'korea-interface'}
          reducedMotion={reducedMotion}
        />
      )}
    </group>
  )
}

export { Baseline2026Layer as JourneyLayer }
