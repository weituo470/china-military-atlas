import type { JourneyLang, Localized } from '../types'
import type { SpaceBeatId } from './content'
import historic from './plates/science-credits.json'
import orbital from './plates/orbital-credits.json'
import opening from './plates/guide-opening.svg'
import dfh from './plates/dfh.webp'
import launch from './plates/launch.webp'
import tiangong from './plates/tiangong.webp'
import moon from './plates/guide-moon.svg'
import beidou from './plates/beidou.webp'
import fast from './plates/fast.webp'
import closing from './plates/guide-closing.svg'

type PlateCredit = {
  title: Localized
  alt: Localized
  note: Localized
  author: string
  license: string
  licenseUrl: string
  sourceUrl: string
  originalTitle: string
  edits: Localized
}
const schematic = (title: Localized, note: Localized): PlateCredit => ({
  title, alt: title, note, author: 'China Military Atlas', license: 'MIT',
  licenseUrl: '', sourceUrl: '', originalTitle: '', edits: {zh:'原创矢量示意，非任务照片，不按比例。',en:'Original diagram, not mission photography. Not to scale.'}
})
const science = {
  beidou: historic.beidou,
  opening: schematic({zh:'示意图 · 从地球望向月球', en:'Diagram · Earth and Moon'}, {zh:'圆弧标出地球与月球的相对位置；图中没有使用卫星照片。',en:'The drawing places the Earth and Moon in a shared frame. It is not a satellite image.'}),
  moon: schematic({zh:'示意图 · 月背通信中继',en:'Diagram · lunar far-side relay'},{zh:'月球挡住从背面直达地球的视线。示意线表示经中继传回信号的路径，不表示真实轨道。',en:'The Moon blocks the direct line of sight to Earth. The dotted line illustrates the role of a relay, not its actual orbit.'}),
  closing: schematic({zh:'示意图 · 观测、通信与探索',en:'Diagram · observing, connecting, exploring'},{zh:'地球、天体与观测信号把本展的主题连在一起。',en:'Earth, a distant body and a line of observation connect the themes of the guide.'}),
}
export const credits = { ...orbital, ...science } satisfies Record<SpaceBeatId, PlateCredit>
const images = { opening, dfh, launch, tiangong, moon, beidou, fast, closing } satisfies Record<SpaceBeatId, string>

export function MissionPlate({ beat, lang }: { beat: SpaceBeatId; lang: JourneyLang }) {
  return <img className="space-plate" width={1600} height={900} decoding="async"
    src={images[beat]} alt={credits[beat].alt[lang]} />
}

export function PlateDetails({ beat, lang }: { beat: SpaceBeatId; lang: JourneyLang }) {
  const plate = credits[beat]
  return <>
    <MissionPlate beat={beat} lang={lang} />
    <div className="space-plate-story">
      <p>{plate.note[lang]}</p>
      <div className="space-plate-credit">
        <span className="space-credit-name">{plate.author}</span>
        {plate.sourceUrl && <a className="space-credit-source" href={plate.sourceUrl} target="_blank" rel="noreferrer"
          title={plate.originalTitle}>{lang === 'zh' ? '原图与出处' : 'Original image'} ↗</a>}
        {plate.licenseUrl ? <a className="space-credit-license" href={plate.licenseUrl} target="_blank" rel="noreferrer">{plate.license}</a> : <span>{plate.license}</span>}
        <small>{plate.edits[lang]}</small>
      </div>
    </div>
  </>
}

