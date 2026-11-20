import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type ComponentProps, type ReactNode } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { EARTH_RADIUS, latLngToVector3 } from '../../utils/geo'
import { AtlasModel } from './atlas/AtlasModel'
import { atlasScale, fleetCatalog } from './atlas/catalog'
import { berths, useAtlas } from './atlas/visit'
import { ReviewSea, ShipWash } from './atlas/ReviewSea'
import { FleetPinProjection } from './atlas/FleetPins'
import { tri, type BaselineLocale } from './locale'
import {
  REVIEW_CAMPS,
  REVIEW_GROUND,
  REVIEW_HEADING_DEG,
  REVIEW_NAVIES,
  compactPin,
  labelAnchor,
  laneEnds,
  reviewDividerPoints,
  type ReviewCampId,
  type ReviewNavy,
} from './review'
import {
  ReviewFillLight,
  ReviewLit,
} from './ShipMeshes'

export { CarrierSilhouette, DestroyerSilhouette, LargeDeckEscortSilhouette } from './ShipMeshes'

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

/**
 * Mid-overhead beats used a 1.02 / 1.018 radial standoff so hulls cleared
 * the sphere in a space view. At the review's sea-level camera that gap
 * is several hull-heights and reads as ships flying through the sky.
 *
 * Mesh local Y is the keel plane (planform hulls start at y ≈ 0.0005–0.0006).
 * Place that plane a hair above the ocean to avoid z-fighting; do not lift
 * the whole typological ship. Wakes live in the same local space, just
 * above the keel, so they sit on the water with the hull.
 */
const REVIEW_KEEL_ALTITUDE = EARTH_RADIUS + 0.00035
const REVIEW_LANE_ALTITUDE = EARTH_RADIUS + 0.00028
const REVIEW_RING_ALTITUDE = EARTH_RADIUS + 0.00022
/** Badge anchor a little above the deck; the Html node adds its own local lift. */
const REVIEW_BADGE_ALTITUDE = EARTH_RADIUS + 0.009

function headingPose(lat: number, lon: number, headingDeg: number, altitude = REVIEW_KEEL_ALTITUDE) {
  const position = latLngToVector3(lat, lon, altitude)
  const normal = position.clone().normalize()
  const heading = (headingDeg * Math.PI) / 180
  const dLat = Math.cos(heading) * 0.08
  const dLon = (Math.sin(heading) * 0.08) / Math.max(0.2, Math.cos((lat * Math.PI) / 180))
  const ahead = latLngToVector3(lat + dLat, lon + dLon, altitude)
  const x = ahead.sub(position).normalize()
  const z = new THREE.Vector3().crossVectors(x, normal).normalize()
  x.crossVectors(normal, z).normalize()
  const matrix = new THREE.Matrix4().makeBasis(x, normal, z)
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix)
  return { position, quaternion }
}

function HeadingAnchor({
  lat,
  lon,
  headingDeg = REVIEW_HEADING_DEG,
  altitude,
  children,
}: {
  lat: number
  lon: number
  headingDeg?: number
  altitude?: number
  children: ReactNode
}) {
  const pose = useMemo(
    () => headingPose(lat, lon, headingDeg, altitude),
    [altitude, headingDeg, lat, lon],
  )
  return <group position={pose.position} quaternion={pose.quaternion}>{children}</group>
}

const REVIEW_DIM_SEA = new THREE.Color('#24343c')

/** drei Html scale is distanceFactor / camera-to-label. Sea-level review
 *  cameras sit about 0.22–0.40 from the labels, so the factor stays in
 *  that band and CSS pixels render near 1:1. */
const REVIEW_BADGE_DISTANCE_FACTOR = 0.25

function ReviewColumn({
  navy,
  language,
  selected,
  spoken,
  reducedMotion,
  paragraphIndex,
}: {
  navy: ReviewNavy
  language: BaselineLocale
  selected: boolean
  spoken: boolean
  reducedMotion: boolean
  paragraphIndex: number
}) {
  const openCard = useJourney((store) => store.openCard)
  const group = useRef<THREE.Group>(null)
  const ships = berths[navy.id]
  const mode=useAtlas(s=>s.mode), inspected=useAtlas(s=>s.berth)
  const inspecting=mode==='ship'
  const label = useMemo(() => labelAnchor(navy), [navy])
  const lane = useMemo(() => laneEnds(navy), [navy])
  const lanePoints = useMemo(
    () => [
      latLngToVector3(lane.tail.lat, lane.tail.lon, REVIEW_LANE_ALTITUDE),
      latLngToVector3(lane.head.lat, lane.head.lon, REVIEW_LANE_ALTITUDE),
    ],
    [lane],
  )

  // Geometry is static. Cache material references once instead of traversing
  // the entire fleet on every frame; do no work once a focus fade has settled.
  const materials = useRef<THREE.MeshStandardMaterial[]>([])
  const currentDim = useRef(Number.NaN)
  useLayoutEffect(() => {
    const seen = new Set<THREE.MeshStandardMaterial>()
    group.current?.traverse(node => {
      const mat = (node as THREE.Mesh).material
      if (!mat) return
      for (const m of Array.isArray(mat) ? mat : [mat]) {
        const material = m as THREE.MeshStandardMaterial
        if (!material.color || seen.has(material)) continue
        seen.add(material)
        if (material.userData.reviewBase) continue
        material.userData.reviewBase = {
          soft: Boolean(material.transparent && !material.depthWrite),
          color: material.color.clone(), opacity: material.opacity,
          emissive: material.emissive?.clone(),
        }
      }
    })
    materials.current = [...seen]
    currentDim.current = Number.NaN
    return () => { materials.current = [] }
  }, [ships])
  useFrame((_, delta) => {
    const target = mode!=='notes' || selected || spoken ? 1 : .72
    const previous = currentDim.current
    if (previous === target) return
    const d = reducedMotion || !Number.isFinite(previous)
      ? target : THREE.MathUtils.damp(previous, target, 8, delta)
    const dim = Math.abs(d - target) < .002 ? target : d
    currentDim.current = dim
    for (const material of materials.current) {
      const base = material.userData.reviewBase
      if (base.soft) material.opacity = dim * base.opacity
      else {
        material.color.copy(base.color).lerp(REVIEW_DIM_SEA, 1 - dim)
        if (base.emissive) material.emissive.copy(base.emissive).multiplyScalar(dim)
      }
    }
  })

  const open = () => openCard('platform', navy.id)
  const badgeKind = paragraphIndex === 1 && navy.capitalCount > 0 ? 'official' : navy.badgeKind
  const kindClass = ` is-${badgeKind}`
  const pin = compactPin(navy, language, paragraphIndex)

  return (
    <group>
      {!inspecting && <Line points={lanePoints} color={navy.tint.island} transparent opacity={selected || spoken ? 0.34 : 0.18} lineWidth={1.1} />}
      <group
        ref={group}
        onClick={(event) => { if(!inspecting && event.delta<=5){event.stopPropagation();open()} }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = '' }}
      >
        {ships.filter(ship=>ship.modelId).map(ship=>{
          const id=ship.modelId!, entry=fleetCatalog[id]
          // Inspect the original berth, never a detached copy. Isolate its hull
          // so other exaggerated map-scale hulls cannot protrude above the
          // curved horizon. All berths return together in the overview.
          const show=!inspecting||ship.key===inspected.key
          return <HeadingAnchor key={ship.key} lat={ship.lat} lon={ship.lon} altitude={REVIEW_KEEL_ALTITUDE}>
            <group name={'Fleet berth / '+ship.key} userData={{modelId:id,berth:ship.key}} visible={show} scale={atlasScale}
              onClick={e=>{if(!show)return;e.stopPropagation();if(e.delta<=5 && (!inspecting||ship.key!==inspected.key))useAtlas.getState().choose(id,ship.key)}}>
              <AtlasModel id={id} />
              <ShipWash length={entry.length} beam={entry.beam}/>
            </group>
          </HeadingAnchor>
        })}
        <group visible={!inspecting}><CountMarks navy={navy}/></group>
      </group>
      {mode==='notes' && (selected || (spoken && paragraphIndex > 0)) && (
        <HeadingAnchor lat={label.lat} lon={label.lon} altitude={REVIEW_BADGE_ALTITUDE}>
          <ScrollSafeLabel center position={[0, 0.028, 0]} distanceFactor={REVIEW_BADGE_DISTANCE_FACTOR} zIndexRange={[92, 30]} style={{ pointerEvents: 'auto', width: 'max-content' }}>
            <button
              type="button"
              className={`journey-globe-label is-baseline is-review is-badge${kindClass}${selected ? ' is-active' : ''} is-spoken`}
              onClick={(event) => { event.stopPropagation(); open() }}
            >
              <strong>{pin.name}</strong>
              {pin.note ? <span className="baseline-review-badge">{pin.note}</span> : null}
            </button>
          </ScrollSafeLabel>
        </HeadingAnchor>
      )}
    </group>
  )
}

// Scale marks are *graphic marks*, not hulls or extra vessels. One GPU batch
// per published category; the physical class examples always stay separate.
function CountMarks({navy}:{navy:ReviewNavy}){
  return <>{(['scale-unit','scale-sub'] as const).map(kind=>{
    const slots=berths[navy.id].filter(b=>b.kind===kind)
    return slots.length?<CountBatch key={kind} slots={slots} sub={kind==='scale-sub'} estimate={navy.badgeKind==='estimate'}/>:null
  })}</>
}
function CountBatch({slots,sub,estimate}:{slots:typeof berths[ReviewNavy['id']];sub:boolean;estimate:boolean}){
  const mesh=useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(()=>{
    if(!mesh.current)return
    const m=new THREE.Matrix4(),scale=new THREE.Vector3(.0043,.00055,sub?.0012:.00185)
    slots.forEach((b,i)=>{const p=headingPose(b.lat,b.lon,REVIEW_HEADING_DEG,EARTH_RADIUS+.0007);mesh.current!.setMatrixAt(i,m.compose(p.position,p.quaternion,scale))})
    mesh.current.instanceMatrix.needsUpdate=true;mesh.current.computeBoundingSphere()
  },[slots,sub])
  return <instancedMesh ref={mesh} name={'Fleet tally / '+(sub?'sub':'surface')} args={[undefined,undefined,slots.length]}>
    <boxGeometry args={[1,1,1]}/><meshBasicMaterial color={estimate?'#abbec5':'#e3d8b5'} toneMapped={false}/>
  </instancedMesh>
}

function ReviewGroundMark({ showRing }: { showRing: boolean }) {
  const ring = useRef<THREE.Mesh>(null)
  const reducedMotion = useReducedMotion()
  useFrame(({ clock }) => {
    if (!ring.current || reducedMotion) return
    const material = ring.current.material as THREE.MeshBasicMaterial
    material.opacity = 0.07 + Math.sin(clock.elapsedTime * 0.7) * 0.02
  })
  return (
    <HeadingAnchor lat={REVIEW_GROUND.lat} lon={REVIEW_GROUND.lon} altitude={REVIEW_RING_ALTITUDE}>
      {showRing && (
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.049, 0.052, 48]} />
          <meshBasicMaterial color="#9aadb6" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {/* Parade-ground name and long description live on the paper.
          Paragraph 0 keeps only the faint typological ring; the card is hidden. */}
    </HeadingAnchor>
  )
}

function CampDivider() {
  const points = useMemo(
    () => reviewDividerPoints().map((point) => latLngToVector3(point.lat, point.lon, REVIEW_LANE_ALTITUDE)),
    [],
  )
  return (
    <Line points={points} color="#c4b39a" transparent opacity={0.16} lineWidth={1} />
  )
}

function CampBanner({ camp, language }: { camp: ReviewCampId; language: BaselineLocale }) {
  const meta = REVIEW_CAMPS[camp]
  return (
    <HeadingAnchor lat={meta.label.lat} lon={meta.label.lon} altitude={REVIEW_BADGE_ALTITUDE}>
      <ScrollSafeLabel center position={[0, 0.030, 0]} distanceFactor={0.36} zIndexRange={[96, 40]} style={{ pointerEvents: 'none', width: 'max-content' }}>
        <div className={`baseline-review-camp is-${camp}`} aria-hidden="false">
          <strong>{tri(language, meta.short.zh, meta.short.en, camp === 'china' ? '西側の配置' : '東側の配置')}</strong>
          <span>{tri(language, meta.note.zh, meta.note.en, '演出上の区分で、同盟を示しません')}</span>
        </div>
      </ScrollSafeLabel>
    </HeadingAnchor>
  )
}

export function ReviewFormation({
  language,
  selectedId,
  paragraphIndex,
  reducedMotion,
}: {
  language: BaselineLocale
  selectedId: string | null
  paragraphIndex: number
  reducedMotion: boolean
}) {
  const mode=useAtlas(s=>s.mode)
  useLayoutEffect(()=>{useAtlas.getState().enter();return ()=>useAtlas.getState().leave()},[])
  useEffect(()=>useAtlas.getState().cue(paragraphIndex),[paragraphIndex])
  return (
    <group name="baseline2026-review">
      <ReviewFillLight />
      <ReviewSea closeup={mode==='ship'}/>
      {mode==='formation'&&<FleetPinProjection/>}
      {mode!=='ship'&&<><ReviewGroundMark showRing={paragraphIndex <= 0} /><CampDivider /></>}
      {mode==='notes'&&paragraphIndex === 0 && (
        <>
          <CampBanner camp="china" language={language} />
          <CampBanner camp="other" language={language} />
        </>
      )}
      <ReviewLit>
        {REVIEW_NAVIES.map((navy) => (
          <ReviewColumn
            key={navy.id}
            navy={navy}
            language={language}
            selected={selectedId === navy.id}
            spoken={navy.spokenIn.has(paragraphIndex)}
            reducedMotion={reducedMotion}
            paragraphIndex={paragraphIndex}
          />
        ))}
      </ReviewLit>
    </group>
  )
}
