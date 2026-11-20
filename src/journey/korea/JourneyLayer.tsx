import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'
import type { JourneyCardKind, JourneyLang, JourneySite, Localized } from '../types'
import { t } from '../types'
import { EQUIPMENT_CARDS, SITE_CARDS } from './content'
import { BEAT_STAGING, SITES, offsetLatLon } from './sites'
import { KoreaWarLayer } from './JourneyWarLayer'

const Y_UP = new THREE.Vector3(0, 1, 0)

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
      <ringGeometry args={[0.024, 0.032, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function GlobeLabel({
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
  // Centered brief occupies mid-screen; front-facing Html chips covered the scroll.
  // Keep 3D pins clickable. Place-name labels stay out of the frame for this chapter.
  void title
  void note
  void active
  void onClick
  return null
}

function cardKindFor(id: string): JourneyCardKind {
  const site = SITE_CARDS.find((item) => item.id === id)
  if (site) return site.kind
  if (EQUIPMENT_CARDS.some((item) => item.id === id)) return 'equipment'
  return 'site'
}

function SitePin({
  site,
  title,
  note,
  language,
  selected,
  reducedMotion,
  color = '#d9b574',
}: {
  site: JourneySite
  title: Localized
  note: Localized
  language: JourneyLang
  selected: boolean
  reducedMotion: boolean
  color?: string
}) {
  const openCard = useJourney((store) => store.openCard)
  const kind = cardKindFor(site.id)
  const focus = { lat: site.lat, lon: site.lon, distance: 2.22 }
  return (
    <SurfaceAnchor lat={site.lat} lon={site.lon} altitude={EARTH_RADIUS * 1.02}>
      <mesh onClick={(event) => { event.stopPropagation(); openCard(kind, site.id, focus) }}>
        <sphereGeometry args={[0.012, 16, 12]} />
        <meshStandardMaterial
          color={selected ? '#f0d7a0' : color}
          roughness={0.35}
          metalness={0.4}
          emissive={selected ? '#a7844a' : '#3d2a12'}
          emissiveIntensity={selected ? 0.55 : 0.2}
        />
      </mesh>
      <PulseRing color={color} selected={selected} reducedMotion={reducedMotion} />
      <GlobeLabel
        title={t(title, language)}
        note={t(note, language)}
        active={selected}
        onClick={() => openCard(kind, site.id, focus)}
      />
    </SurfaceAnchor>
  )
}

function EquipmentMark({
  id,
  lat,
  lon,
  language,
  selected,
  reducedMotion,
}: {
  id: (typeof EQUIPMENT_CARDS)[number]['id']
  lat: number
  lon: number
  language: JourneyLang
  selected: boolean
  reducedMotion: boolean
}) {
  const openCard = useJourney((store) => store.openCard)
  const card = EQUIPMENT_CARDS.find((item) => item.id === id)
  const focus = { lat, lon, distance: 2.28 }
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const target = selected ? 1.14 : 1
    const scale = reducedMotion ? target : THREE.MathUtils.damp(group.current.scale.x, target, 8, delta)
    group.current.scale.setScalar(scale)
    group.current.position.y = reducedMotion ? 0.02 : 0.02 + Math.sin(clock.elapsedTime * 1.2) * 0.004
  })
  const color = id === 'mig-15' ? '#7ec8d4' : id === 'un-firepower' ? '#8aa4b5' : id === 'supply-line' ? '#d9a05a' : '#c9b48a'
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.026}>
      <group
        ref={group}
        onClick={(event) => { event.stopPropagation(); openCard('equipment', id, focus) }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        {id === 'light-infantry' && (
          <mesh rotation={[0.2, 0.4, 0]}>
            <coneGeometry args={[0.018, 0.046, 3]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} emissive="#4a3820" emissiveIntensity={0.25} />
          </mesh>
        )}
        {id === 'un-firepower' && (
          <mesh rotation={[0.4, 0, 0.2]}>
            <boxGeometry args={[0.04, 0.012, 0.016]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.45} emissive="#243040" emissiveIntensity={0.3} />
          </mesh>
        )}
        {id === 'mig-15' && (
          <mesh rotation={[0.15, 0.8, 0.1]}>
            <coneGeometry args={[0.012, 0.05, 4]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.55} emissive="#1a3a44" emissiveIntensity={0.4} />
          </mesh>
        )}
        {id === 'supply-line' && (
          <mesh>
            <boxGeometry args={[0.028, 0.016, 0.02]} />
            <meshStandardMaterial color={color} roughness={0.55} metalness={0.15} emissive="#4a3010" emissiveIntensity={0.22} />
          </mesh>
        )}
      </group>
      <PulseRing color={color} selected={selected} reducedMotion={reducedMotion} />
      <GlobeLabel
        title={t(card?.title, language)}
        note={language === 'zh' ? '类型学装备' : 'Typological equipment'}
        active={selected}
        onClick={() => openCard('equipment', id, focus)}
      />
    </SurfaceAnchor>
  )
}

const SITE_LABELS: Record<string, { title: Localized; note: Localized }> = {
  peninsula: { title: { en: 'Korean Peninsula', zh: '朝鲜半岛' }, note: { en: 'Regional anchor', zh: '地区锚点' } },
  yalu: { title: { en: 'Yalu  ·  Amnok', zh: '鸭绿江' }, note: { en: 'Crossing, typological', zh: '渡江示意' } },
  dandong: { title: { en: 'Dandong  ·  Andong', zh: '丹东  ·  安东' }, note: { en: 'Chinese bank', zh: '江的这一侧' } },
  sinuiju: { title: { en: 'Sinuiju', zh: '新义州' }, note: { en: 'Korean bank', zh: '江的那一侧' } },
  incheon: { title: { en: 'Incheon', zh: '仁川' }, note: { en: 'Landing, typological', zh: '登陆示意' } },
  unsan: { title: { en: 'Unsan  ·  Yunshan', zh: '云山' }, note: { en: 'Encounter / envelopment', zh: '遭遇与包围' } },
  changjin: { title: { en: 'Changjin  ·  Chosin', zh: '长津湖' }, note: { en: 'Winter campaign', zh: '冬季作战' } },
  hungnam: { title: { en: 'Hungnam', zh: '兴南' }, note: { en: 'Withdrawal bearing', zh: '撤离方向' } },
  shangganling: { title: { en: 'Shangganling  ·  Triangle Hill', zh: '上甘岭' }, note: { en: 'Positional battle', zh: '阵地攻防' } },
  panmunjom: { title: { en: 'Panmunjom', zh: '板门店' }, note: { en: 'Armistice site', zh: '停战签字地' } },
  'thirty-eighth': { title: { en: '38th parallel', zh: '三八线' }, note: { en: 'Near, not identical', zh: '靠近，并不重合' } },
  pyongyang: { title: { en: 'Pyongyang', zh: '平壤' }, note: { en: 'Regional anchor', zh: '地区锚点' } },
  busan: { title: { en: 'Busan  ·  Pusan', zh: '釜山' }, note: { en: 'Southern end, 1950', zh: '一九五〇年南端' } },
  'mig-alley': { title: { en: 'MiG Alley', zh: '米格走廊' }, note: { en: 'Typological corridor', zh: '类型学走廊' } },
  shenyang: { title: { en: 'Shenyang', zh: '沈阳' }, note: { en: 'Typological rear', zh: '类型学后方' } },
  sasebo: { title: { en: 'Sasebo  ·  typological rear', zh: '佐世保  ·  类型学后方' }, note: { en: 'UN rear, brief', zh: '联合国军后方示意' } },
  beijing: { title: { en: 'Beijing', zh: '北京' }, note: { en: 'State decision', zh: '国家决策' } },
  anju: { title: { en: 'Chongchon  ·  Anju', zh: '清川江  ·  安州' }, note: { en: 'Corridor bound', zh: '走廊范围' } },
  taiwan: { title: { en: 'Taiwan Strait  ·  typological', zh: '台湾海峡  ·  类型学' }, note: { en: 'Not a campaign site', zh: '不是战役遗址' } },
  sansoli: { title: { en: 'Sansoli  ·  Samso-ri', zh: '三所里' }, note: { en: 'Cut-off, typological', zh: '切断退路示意' } },
}

const EQUIPMENT_PLACEMENTS = [
  { id: 'light-infantry' as const, at: offsetLatLon(SITES.unsan.lat, SITES.unsan.lon, -40, 20) },
  { id: 'un-firepower' as const, at: offsetLatLon(SITES.incheon.lat, SITES.incheon.lon, 30, -20) },
  { id: 'mig-15' as const, at: { lat: SITES['mig-alley'].lat, lon: SITES['mig-alley'].lon } },
  { id: 'supply-line' as const, at: { lat: SITES.dandong.lat, lon: SITES.dandong.lon } },
]

export function KoreaJourneyLayer() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney((store) => store.language)
  const selectedCardKind = useJourney((store) => store.selectedCardKind)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const reducedMotion = useReducedMotion()

  if (activeJourney !== 'korea') return null
  const staging = BEAT_STAGING[beatIndex] ?? BEAT_STAGING[0]

  return (
    <group name="korea-journey-layer">
      {staging.visibleSites.map((id) => {
        const site = SITES[id as keyof typeof SITES]
        const label = SITE_LABELS[id]
        if (!site || !label) return null
        return (
          <SitePin
            key={id}
            site={site}
            title={label.title}
            note={label.note}
            language={language}
            selected={selectedCardId === id}
            reducedMotion={reducedMotion}
            color={id === 'panmunjom' || id === 'thirty-eighth' ? '#e2d4a0' : id === 'yalu' || id === 'dandong' ? '#c45c4a' : '#d9b574'}
          />
        )
      })}
      {staging.showEquipment && EQUIPMENT_PLACEMENTS.map((item) => (
        <EquipmentMark
          key={item.id}
          id={item.id}
          lat={item.at.lat}
          lon={item.at.lon}
          language={language}
          selected={selectedCardKind === 'equipment' && selectedCardId === item.id}
          reducedMotion={reducedMotion}
        />
      ))}
      <KoreaWarLayer />
    </group>
  )
}
