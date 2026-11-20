import type { ReactNode } from 'react'

/** Shared blueprint chrome: hairline frame, figure and source label. */
export function BlueprintFrame({
  children,
  caption,
  note,
  tag,
  dashed = false,
}: {
  children: ReactNode
  caption?: string
  note?: ReactNode
  tag?: string
  dashed?: boolean
}) {
  return (
    <figure className={`industry-plate${dashed ? ' is-dashed' : ''}`}>
      <div className="industry-plate-corners" aria-hidden="true">
        <i /><i /><i /><i />
      </div>
      <div className="industry-plate-draw">{children}</div>
      {(caption || note || tag) && (
        <figcaption className="industry-plate-caption">
          {tag && <span className="industry-schematic-tag">{tag}</span>}
          <span>{caption}{note && <> {note}</>}</span>
        </figcaption>
      )}
    </figure>
  )
}

function PlateImage({ file, alt }: { file: string; alt: string }) {
  return (
    <img
      className="industry-plate-img"
      src={`${import.meta.env.BASE_URL}art/industry/plates/${file}`}
      alt={alt}
      draggable={false}
    />
  )
}

export function CoverPlate() {
  return <PlateImage file="cover.png" alt="" />
}

export function LifeRingsPlate() {
  return <PlateImage file="life-rings.png" alt="" />
}

export function InfraPlate() {
  return <PlateImage file="infra.png" alt="" />
}

export function GeInscriptionPlate() {
  return <PlateImage file="ge-inscription.png" alt="" />
}

export function EraContrastPlate() {
  return <PlateImage file="era-contrast.png" alt="" />
}

export function ArsenalsPlate() {
  return <PlateImage file="arsenals.png" alt="" />
}

export function BrokenChainPlate() {
  return <PlateImage file="broken-chain.png" alt="" />
}

export function TimeAxisPlate() {
  return <PlateImage file="time-axis.png" alt="" />
}

export function TransportLinePlate() {
  return <PlateImage file="transport-line.png" alt="" />
}

export function BuildMoveRepairPlate() {
  return <PlateImage file="build-move-repair.png" alt="" />
}

export function Plan156Plate() {
  return <PlateImage file="plan156.png" alt="" />
}

export function ThreeFrontsPlate() {
  return <PlateImage file="three-fronts.png" alt="" />
}

export function MountainWorksPlate() {
  return <PlateImage file="mountain-works.png" alt="" />
}

export function BackupDotsPlate() {
  return <PlateImage file="backup-dots.png" alt="" />
}

export function ShipExplodedPlate() {
  return <PlateImage file="ship-exploded.png" alt="" />
}

export function ShipyardPlate() {
  return <PlateImage file="shipyard.png" alt="" />
}

export function TwoWayArrowPlate() {
  return <PlateImage file="two-way-arrow.png" alt="" />
}
