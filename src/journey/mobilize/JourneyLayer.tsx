import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'
import type { JourneyCardKind, JourneySite, Localized } from '../types'
import { ml, tri, useMobilizeLanguage, type MobilizeLanguage } from './locale'
import { JA_CARDS } from './jaRecords'
import { useMobilizeMediaValue } from './playback'
import { INSTITUTION_CARDS, SITE_CARDS } from './content'
import { BEAT_STAGING, SITES, offsetLatLon } from './sites'
import { MobilizeDemoLayer } from './JourneyDemoLayer'

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
      <ringGeometry args={[0.011, 0.014, 48]} />
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
  return (
    <Html center position={[0, 0.05, 0]} zIndexRange={[6, 4]} style={{ pointerEvents: 'auto' }}>
      <button type="button" className={`journey-globe-label is-mobilize${active ? ' is-active' : ''}`}
        title={note} aria-label={`${title} — ${note}`}
        onClick={(event) => { event.stopPropagation(); onClick() }}>
        <strong>{title}</strong>
      </button>
    </Html>
  )
}

function cardKindFor(id: string): JourneyCardKind {
  const site = SITE_CARDS.find((item) => item.id === id)
  if (site) return site.kind
  if (INSTITUTION_CARDS.some((item) => item.id === id)) {
    return INSTITUTION_CARDS.find((item) => item.id === id)!.kind
  }
  return 'site'
}

function SitePin({
  site,
  title,
  note,
  language,
  selected,
  reducedMotion,
  showLabel,
  color = '#7ec8d0',
}: {
  site: JourneySite
  title: Localized
  note: Localized
  language: MobilizeLanguage
  selected: boolean
  reducedMotion: boolean
  showLabel: boolean
  color?: string
}) {
  const openCard = useJourney((store) => store.openCard)
  const kind = cardKindFor(site.id)
  const focus = { lat: site.lat, lon: site.lon, distance: 2.22 }
  return (
    <SurfaceAnchor lat={site.lat} lon={site.lon} altitude={EARTH_RADIUS * 1.02}>
      <mesh onClick={(event) => { event.stopPropagation(); openCard(kind, site.id, focus) }}>
        <sphereGeometry args={[0.008, 16, 12]} />
        <meshStandardMaterial
          color={selected ? '#e8f4f4' : color}
          roughness={0.35}
          metalness={0.4}
          emissive={selected ? '#5a9aa0' : '#1a3a40'}
          emissiveIntensity={selected ? 0.55 : 0.22}
        />
      </mesh>
      <PulseRing color={color} selected={selected} reducedMotion={reducedMotion} />
      {(showLabel || selected) && <GlobeLabel
        title={ml(title, language, JA_CARDS[site.id as keyof typeof SITES].place)}
        note={ml(note, language, '模式図上の地点')}
        active={selected}
        onClick={() => openCard(kind, site.id, focus)}
      />}
    </SurfaceAnchor>
  )
}

function InstitutionMark({
  id,
  lat,
  lon,
  language,
  selected,
  reducedMotion,
}: {
  id: (typeof INSTITUTION_CARDS)[number]['id']
  lat: number
  lon: number
  language: MobilizeLanguage
  selected: boolean
  reducedMotion: boolean
}) {
  const openCard = useJourney((store) => store.openCard)
  const card = INSTITUTION_CARDS.find((item) => item.id === id)
  const focus = { lat, lon, distance: 2.28 }
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const target = selected ? 1.14 : 1
    const scale = reducedMotion ? target : THREE.MathUtils.damp(group.current.scale.x, target, 8, delta)
    group.current.scale.setScalar(scale)
    group.current.position.y = reducedMotion ? 0.02 : 0.02 + Math.sin(clock.elapsedTime * 1.2) * 0.004
  })
  return (
    <SurfaceAnchor lat={lat} lon={lon} altitude={EARTH_RADIUS * 1.026}>
      <group
        ref={group}
        onClick={(event) => { event.stopPropagation(); openCard(card?.kind ?? 'institution', id, focus) }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        <mesh rotation={[0.2, 0.3, 0]}>
          <boxGeometry args={[0.028, 0.02, 0.02]} />
          <meshStandardMaterial color="#d9b574" roughness={0.45} metalness={0.25} emissive="#4a3010" emissiveIntensity={0.22} />
        </mesh>
      </group>
      <PulseRing color="#d9b574" selected={selected} reducedMotion={reducedMotion} />
      {selected && <GlobeLabel
        title={card ? ml(card.title, language, JA_CARDS[id].title) : JA_CARDS[id].title}
        note={tri(language, '官方公布 · 类型学', 'Official · typological', '公式発表・模式図')}
        active={selected}
        onClick={() => openCard(card?.kind ?? 'institution', id, focus)}
      />}
    </SurfaceAnchor>
  )
}

const SITE_LABELS: Record<string, { title: Localized; note: Localized }> = {
  china: { title: { en: 'China', zh: '中国' }, note: { en: 'Typological stage', zh: '类型学舞台' } },
  beijing: { title: { en: 'Beijing', zh: '北京' }, note: { en: 'Institutions, typological', zh: '体制示意' } },
  wuhan: { title: { en: 'Wuhan', zh: '武汉' }, note: { en: 'Regional anchor', zh: '地区锚点' } },
  jingzhou: { title: { en: 'Jingzhou / Shashi', zh: '荆州 / 沙市' }, note: { en: 'Jingjiang defense', zh: '荆江防守' } },
  gongan: { title: { en: 'Jingjiang diversion area', zh: '荆江分洪区' }, note: { en: 'Transfer, typological', zh: '转移示意' } },
  'three-gorges': { title: { en: 'Three Gorges Dam', zh: '三峡大坝' }, note: { en: 'Official project facts', zh: '官方工程事实' } },
  yichang: { title: { en: 'Yichang', zh: '宜昌' }, note: { en: 'Mid-Yangtze approach', zh: '中游进入段' } },
  jiujiang: { title: { en: 'Jiujiang', zh: '九江' }, note: { en: 'Eastern bound, typological', zh: '东端示意' } },
  yingxiu: { title: { en: 'Yingxiu', zh: '映秀' }, note: { en: 'Site / representative', zh: '遗址 / 代表性坐标' } },
  wenchuan: { title: { en: 'Wenchuan', zh: '汶川' }, note: { en: 'County seat, typological', zh: '县城示意' } },
  chengdu: { title: { en: 'Chengdu', zh: '成都' }, note: { en: 'Projection hub', zh: '投送枢纽' } },
  dujiangyan: { title: { en: 'Dujiangyan', zh: '都江堰' }, note: { en: 'Approach / pairing', zh: '通道 / 对口' } },
  beichuan: { title: { en: 'Beichuan', zh: '北川' }, note: { en: 'Rebuilt seat, typological', zh: '新县城示意' } },
  mianzhu: { title: { en: 'Mianzhu', zh: '绵竹' }, note: { en: 'Counterpart county', zh: '对口援建县' } },
  shifang: { title: { en: 'Shifang', zh: '什邡' }, note: { en: 'Counterpart county', zh: '对口援建县' } },
  qingchuan: { title: { en: 'Qingchuan', zh: '青川' }, note: { en: 'Counterpart county', zh: '对口援建县' } },
  huoshenshan: { title: { en: 'Huoshenshan', zh: '火神山' }, note: { en: 'Official timeline', zh: '官方工期' } },
  leishenshan: { title: { en: 'Leishenshan', zh: '雷神山' }, note: { en: 'Official timeline', zh: '官方工期' } },
  shanghai: { title: { en: 'Shanghai', zh: '上海' }, note: { en: 'Coastal node', zh: '沿海节点' } },
  guangzhou: { title: { en: 'Guangzhou', zh: '广州' }, note: { en: 'Southern coastal node', zh: '南方沿海节点' } },
  harbin: { title: { en: 'Harbin', zh: '哈尔滨' }, note: { en: 'National span', zh: '全国跨度' } },
  urumqi: { title: { en: 'Ürümqi', zh: '乌鲁木齐' }, note: { en: 'Typological origin', zh: '类型学起点' } },
  lhasa: { title: { en: 'Lhasa', zh: '拉萨' }, note: { en: 'Typological origin', zh: '类型学起点' } },
  kunming: { title: { en: 'Kunming', zh: '昆明' }, note: { en: 'Typological origin', zh: '类型学起点' } },
  xian: { title: { en: 'Xi’an', zh: '西安' }, note: { en: 'Inland node', zh: '内陆节点' } },
  shenyang: { title: { en: 'Shenyang', zh: '沈阳' }, note: { en: 'Typological origin', zh: '类型学起点' } },
  lanzhou: { title: { en: 'Lanzhou', zh: '兰州' }, note: { en: 'Inland node', zh: '内陆节点' } },
}

const INSTITUTION_PLACEMENTS = [
  { id: 'response-levels' as const, at: offsetLatLon(SITES.beijing.lat, SITES.beijing.lon, 30, 18) },
  { id: 'fire-rescue' as const, at: offsetLatLon(SITES.beijing.lat, SITES.beijing.lon, -28, 16) },
  { id: 'defense-mobilization' as const, at: offsetLatLon(SITES.beijing.lat, SITES.beijing.lon, 8, -28) },
]

// The other sites remain selectable pins; showing every label at once hides
// closely spaced sites, particularly in the Jingjiang and Wuhan close-ups.
const ANCHOR_LABELS: readonly (readonly string[])[] = [
  ['yingxiu', 'china', 'china'],
  ['beijing'],
  ['jingzhou', 'gongan', 'three-gorges'],
  ['yingxiu', 'chengdu', 'beichuan'],
  ['wuhan', 'huoshenshan', 'wuhan'],
  ['shanghai', 'beijing', 'xian'],
  ['yingxiu', 'beichuan', 'dujiangyan'],
  ['china', 'yingxiu', 'china'],
]

export function MobilizeJourneyLayer() {
  const activeJourney = useJourney((store) => store.activeJourney)
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useMobilizeLanguage()
  const selectedCardKind = useJourney((store) => store.selectedCardKind)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const paragraphIndex = useMobilizeMediaValue('paragraphIndex')
  const reducedMotion = useReducedMotion()

  if (activeJourney !== 'mobilize') return null
  const staging = BEAT_STAGING[beatIndex] ?? BEAT_STAGING[0]
  const anchor = ANCHOR_LABELS[beatIndex]?.[paragraphIndex] ?? ANCHOR_LABELS[beatIndex]?.[0]

  return (
    <group name="mobilize-journey-layer">
      {staging.visibleSites.map((id) => {
        const site = SITES[id as keyof typeof SITES]
        const label = SITE_LABELS[id]
        if (!site || !label) return null
        const color = id === 'huoshenshan' || id === 'leishenshan'
          ? '#d9a05a'
          : id === 'yingxiu' || id === 'wenchuan' || id === 'beichuan'
            ? '#d9b574'
            : id === 'three-gorges' || id === 'jingzhou'
              ? '#5aa0c8'
              : '#7ec8d0'
        return (
          <SitePin
            key={id}
            site={site}
            title={label.title}
            note={label.note}
            language={language}
            selected={selectedCardId === id}
            reducedMotion={reducedMotion}
            showLabel={id === anchor && !selectedCardId}
            color={color}
          />
        )
      })}
      {staging.showInstitutions && INSTITUTION_PLACEMENTS.map((item) => (
        <InstitutionMark
          key={item.id}
          id={item.id}
          lat={item.at.lat}
          lon={item.at.lon}
          language={language}
          selected={selectedCardKind === 'institution' || selectedCardKind === 'doctrine' ? selectedCardId === item.id : false}
          reducedMotion={reducedMotion}
        />
      ))}
      <MobilizeDemoLayer />
    </group>
  )
}
