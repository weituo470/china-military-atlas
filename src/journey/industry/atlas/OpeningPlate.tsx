import { CategoriesPlate, ChassisLayersPlate, NetworkPlate, SectorIconsPlate } from '../vectorPlates'
import { useEffect } from 'react'
import { BlueprintFrame } from '../diagrams'
import type { IndustryLanguage } from '../locale'
import { INDUSTRY_CLASSIFICATION_URL } from './classification'
import { earlyPlates } from './early/early'
import { inlandPlates } from './inland/inland'
import { networkPlates } from './network/network'
import { publicViewPlates } from './public-view/publicView'
import { IndustryRegister } from './IndustryRegister'
import type { AtlasPlate } from './plate'

const sequence: readonly AtlasPlate[] = [...earlyPlates, ...inlandPlates, ...networkPlates, ...publicViewPlates]

export function OpeningPlate({ beat, paragraph, language, tag }: {
  beat: number; paragraph: number; language: IndustryLanguage; tag: string
}) {
  const i = beat * 4 + paragraph
  const plate = sequence[i] ?? sequence[0]
  const next = sequence[i + 1]?.src
  const isRegister = beat === 4 && paragraph === 3
  const isExternal = beat === 5 && paragraph === 1
  useEffect(() => {
    if (next) new Image().src = next
  }, [next])
  const Diagram = [ChassisLayersPlate, SectorIconsPlate, NetworkPlate, NetworkPlate, CategoriesPlate, SectorIconsPlate][beat] ?? ChassisLayersPlate
  if (!plate.src) return <BlueprintFrame tag={tag}><Diagram language={language} /></BlueprintFrame>
  return (
    <BlueprintFrame
      tag={isRegister || isExternal ? undefined : tag}
      dashed={isExternal}
      caption={plate.caption[language]}
      note={isRegister && <a href={INDUSTRY_CLASSIFICATION_URL} target="_blank" rel="noreferrer">GB/T 4754—2017</a>}
    >
      {isRegister
        ? <IndustryRegister language={language} plate={plate} />
        : <img className="industry-plate-img" src={plate.src} width={1664} height={936}
            alt={plate.alt[language]} draggable={false} />}
    </BlueprintFrame>
  )
}
