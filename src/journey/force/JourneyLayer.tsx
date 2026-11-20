import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'
import type { JourneyLang, JourneySite } from '../types'
import { t } from '../types'
import { FORMATIONS, INSTITUTION_PANELS, WEAPONS } from './content'
import { BEAT_STAGING, CHANGPING_SITE, INSTITUTION_SITES, THEATER_SITES, WEAPON_RACK, offsetLatLon } from './sites'
import { WeaponModel } from './weapons'
import { JourneyWarLayer, readFormationEmphasis } from './JourneyWarLayer'

const Y_UP = new THREE.Vector3(0, 1, 0)
const HATCH_TEXTURE = createHatchTexture()

function createHatchTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')
  if (!context) return null
  context.fillStyle = '#c9a56a'
  context.fillRect(0, 0, 32, 32)
  context.strokeStyle = 'rgba(8, 12, 16, 0.72)'
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
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
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
    const pulse = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 1.6) * 0.5 + 0.5
    const scale = selected ? 1.18 + pulse * 0.08 : 1 + pulse * 0.06
    ring.current.scale.setScalar(scale)
    const material = ring.current.material as THREE.MeshBasicMaterial
    material.opacity = selected ? 0.9 : 0.45 + pulse * 0.2
  })
  return (
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.028, 0.036, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
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
  // Centered lore stage occupies mid-screen; front-facing Html chips covered the scroll.
  // Labels stay out of the frame for this chapter.
  void title
  void note
  void active
  void onClick
  return null
}

function InstitutionStele({ site, language, selected, reducedMotion }: { site: JourneySite; language: JourneyLang; selected: boolean; reducedMotion: boolean }) {
  const openCard = useJourney((store) => store.openCard)
  const panel = INSTITUTION_PANELS.find((item) => item.id === site.id)
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const target = selected ? 1.12 : 1
    const scale = reducedMotion ? target : THREE.MathUtils.damp(group.current.scale.x, target, 8, delta)
    group.current.scale.setScalar(scale)
    group.current.position.y = reducedMotion ? 0.03 : 0.03 + Math.sin(clock.elapsedTime * 1.1) * 0.004
  })
  return (
    <SurfaceAnchor lat={site.lat} lon={site.lon} altitude={EARTH_RADIUS * 1.022}>
      <group ref={group}>
        <mesh position={[0, 0.03, 0]} onClick={(event) => { event.stopPropagation(); openCard('institution', site.id, { lat: site.lat, lon: site.lon, distance: 2.55 }) }}>
          <boxGeometry args={[0.034, 0.07, 0.01]} />
          <meshStandardMaterial color={selected ? '#d7c4a0' : '#8a7a62'} roughness={0.7} metalness={0.08} />
        </mesh>
        <mesh position={[0, 0.066, 0]}>
          <boxGeometry args={[0.04, 0.006, 0.014]} />
          <meshStandardMaterial color="#b08a4f" roughness={0.4} metalness={0.65} />
        </mesh>
      </group>
      <JourneyLabel
        title={t(panel?.title, language)}
        note={language === 'zh' ? '类型学标记' : 'Typological mark'}
        active={selected}
        onClick={() => openCard('institution', site.id, { lat: site.lat, lon: site.lon, distance: 2.55 })}
      />
    </SurfaceAnchor>
  )
}

function WeaponRack({ language, selectedId, exploded, reducedMotion }: { language: JourneyLang; selectedId: string | null; exploded: boolean; reducedMotion: boolean }) {
  const openCard = useJourney((store) => store.openCard)
  return (
    <>
      {WEAPON_RACK.slots.map((slot) => {
        const placed = offsetLatLon(WEAPON_RACK.lat, WEAPON_RACK.lon, slot.offsetKm[0], slot.offsetKm[1])
        const selected = selectedId === slot.id
        const scale = slot.id === 'ge' ? 0.046 : slot.id === 'crossbow' ? 0.07 : 0.062
        return (
          <SurfaceAnchor key={slot.id} lat={placed.lat} lon={placed.lon} altitude={EARTH_RADIUS * 1.028}>
            <group
              scale={selected ? scale * 1.18 : scale}
              rotation={slot.id === 'crossbow' ? [0.2, 0.6, 0] : [0.08, 0.35, 0]}
              onClick={(event) => { event.stopPropagation(); openCard('weapon', slot.id, { lat: placed.lat, lon: placed.lon, distance: 2.35 }) }}
              onPointerOver={() => { document.body.style.cursor = 'pointer' }}
              onPointerOut={() => { document.body.style.cursor = '' }}
            >
              <WeaponModel id={slot.id} exploded={selected && exploded} reducedMotion={reducedMotion} />
              <mesh visible={false}>
                <sphereGeometry args={[1.1, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            </group>
            <JourneyLabel
              title={t(WEAPONS.find((weapon) => weapon.id === slot.id)?.short, language)}
              note={t(WEAPON_RACK.precisionNote, language)}
              active={selected}
              onClick={() => openCard('weapon', slot.id, { lat: placed.lat, lon: placed.lon, distance: 2.35 })}
            />
          </SurfaceAnchor>
        )
      })}
    </>
  )
}

function FormationField({
  formation,
  lat,
  lon,
  language,
  selected,
  compact,
  reducedMotion,
}: {
  formation: (typeof FORMATIONS)[number]
  lat: number
  lon: number
  language: JourneyLang
  selected: boolean
  compact: boolean
  reducedMotion: boolean
}) {
  const openCard = useJourney((store) => store.openCard)
  const columns = formation.kind === 'claim' ? 30 : Math.min(10, Math.max(5, Math.ceil(Math.sqrt(formation.count))))
  const rows = Math.ceil(formation.count / columns)
  const pitch = compact && formation.kind === 'claim' ? 0.01 : 0.012
  const mesh = useMemo(() => {
    const geometry = new THREE.BoxGeometry(0.009, 0.009, 0.009)
    const material = new THREE.MeshStandardMaterial({
      color: formation.kind === 'claim' ? '#c9a56a' : '#d9c6a0',
      roughness: formation.kind === 'claim' ? 0.7 : 0.45,
      metalness: 0.08,
      map: formation.kind === 'claim' ? HATCH_TEXTURE : null,
    })
    const instanced = new THREE.InstancedMesh(geometry, material, formation.count)
    const matrix = new THREE.Matrix4()
    for (let index = 0; index < formation.count; index += 1) {
      const column = index % columns
      const row = Math.floor(index / columns)
      matrix.makeTranslation((column - (columns - 1) / 2) * pitch, 0.008, (row - (rows - 1) / 2) * pitch)
      instanced.setMatrixAt(index, matrix)
    }
    instanced.instanceMatrix.needsUpdate = true
    return instanced
  }, [columns, formation.count, formation.kind, pitch, rows])

  useEffect(() => () => {
    mesh.geometry.dispose()
    const material = mesh.material
    if (Array.isArray(material)) material.forEach((item) => item.dispose())
    else material.dispose()
  }, [mesh])

  useFrame(({ clock }) => {
    const emphasis = readFormationEmphasis(formation.id, reducedMotion)
    // Highlight a formation with light, not by temporarily changing its headcount.
    const material = mesh.material as THREE.MeshStandardMaterial
    material.emissive = new THREE.Color(formation.kind === 'claim' ? '#8a5a20' : '#6a5428')
    if (emphasis.pulse && !reducedMotion) {
      material.emissiveIntensity = 0.12 + (Math.sin(clock.elapsedTime * 2) * 0.5 + 0.5) * 0.28
    } else {
      material.emissiveIntensity = 0.08 + emphasis.emphasis * 0.28
    }
  })

  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.024}>
      <group
        onClick={(event) => { event.stopPropagation(); openCard('formation', formation.id, { lat, lon, distance: 3.15 }) }}
        scale={selected ? 1.06 : 1}
      >
        <primitive object={mesh} />
      </group>
      <JourneyLabel
        title={t(formation.short, language)}
        note={t(formation.caption, language)}
        active={selected}
        onClick={() => openCard('formation', formation.id, { lat, lon, distance: 3.15 })}
      />
    </SurfaceAnchor>
  )
}

function ChangpingMark({ language, selected, reducedMotion }: { language: JourneyLang; selected: boolean; reducedMotion: boolean }) {
  const openCard = useJourney((store) => store.openCard)
  return (
    <SurfaceAnchor lat={CHANGPING_SITE.lat} lon={CHANGPING_SITE.lon} altitude={EARTH_RADIUS * 1.02}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.018, 0.042, 64]} />
        <meshBasicMaterial color="#c45c4a" transparent opacity={selected ? 0.8 : 0.48} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <PulseRing color="#e08a72" selected={selected} reducedMotion={reducedMotion} />
      <mesh
        onClick={(event) => { event.stopPropagation(); openCard('changping', 'site', { lat: CHANGPING_SITE.lat, lon: CHANGPING_SITE.lon, distance: 2.12 }) }}
      >
        <sphereGeometry args={[0.012, 16, 12]} />
        <meshStandardMaterial color="#e8c9b0" roughness={0.4} metalness={0.2} emissive="#7a2e22" emissiveIntensity={0.35} />
      </mesh>
      <JourneyLabel
        title={language === 'zh' ? '长平 · 前260年' : 'Changping  ·  260 BCE'}
        note={t(CHANGPING_SITE.precisionNote, language)}
        active={selected}
        onClick={() => openCard('changping', 'site', { lat: CHANGPING_SITE.lat, lon: CHANGPING_SITE.lon, distance: 2.12 })}
      />
    </SurfaceAnchor>
  )
}

const FORMATION_SITES: Record<string, { lat: number; lon: number }> = {
  sicily: { lat: 37.5, lon: 14.0 },
  alexander: { lat: 36.4, lon: 43.3 },
  rome: THEATER_SITES.rome,
  'qin-claim': { lat: 33.9, lon: 111.2 },
}

export function JourneyLayer() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney((store) => store.language)
  const selectedCardKind = useJourney((store) => store.selectedCardKind)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const lockExploded = useJourney((store) => store.lockExploded)
  const diveProgress = useJourney((store) => store.diveProgress)
  const reducedMotion = useReducedMotion()
  const [compact] = useState(() => {
    if (typeof navigator === 'undefined') return false
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
    return memory <= 4 || (navigator.hardwareConcurrency || 8) <= 4
  })

  if (activeJourney !== 'force') return null
  const staging = BEAT_STAGING[beatIndex] ?? BEAT_STAGING[0]
  const marks = diveProgress < 0.02

  return (
    <group name="force-journey-layer">
      <group visible={marks}>
      {staging.showInstitutions && INSTITUTION_SITES.map((site) => (
        <InstitutionStele
          key={site.id}
          site={site}
          language={language}
          selected={selectedCardKind === 'institution' && selectedCardId === site.id}
          reducedMotion={reducedMotion}
        />
      ))}
      {staging.showWeapons && (
        <WeaponRack
          language={language}
          selectedId={selectedCardKind === 'weapon' ? selectedCardId : null}
          exploded={lockExploded}
          reducedMotion={reducedMotion}
        />
      )}
      {staging.showFormations && FORMATIONS.map((formation) => {
        const site = FORMATION_SITES[formation.id]
        if (!site) return null
        return (
          <FormationField
            key={formation.id}
            formation={formation}
            lat={site.lat}
            lon={site.lon}
            language={language}
            selected={selectedCardKind === 'formation' && selectedCardId === formation.id}
            compact={compact}
            reducedMotion={reducedMotion}
          />
        )
      })}
      {staging.showChangping && (
        <ChangpingMark
          language={language}
          selected={selectedCardKind === 'changping'}
          reducedMotion={reducedMotion}
        />
      )}
      </group>
      <JourneyWarLayer />
    </group>
  )
}
