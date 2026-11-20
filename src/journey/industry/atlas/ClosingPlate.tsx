import { ChassisLayersPlate, LawTransportPlate } from '../vectorPlates'
import { useEffect } from 'react'
import { BlueprintFrame } from '../diagrams'
import { t, type IndustryLanguage } from '../locale'
const localPlates=import.meta.glob<string>('./*.webp',{eager:true,query:'?url',import:'default'})
const intermodal=localPlates['./intermodal.webp']
const ferry=localPlates['./ferry.webp']
const register=localPlates['./register.webp']
const planning=localPlates['./planning.webp']
const relief=localPlates['./relief.webp']
const gauges=localPlates['./gauges.webp']
const chassis=localPlates['./chassis.webp']
const workshop=localPlates['./workshop.webp']
const archives=localPlates['./archives.webp']
const harbour=localPlates['./harbour.webp']

type Label = Record<IndustryLanguage, string>
const label = (zh: string, en: string, ja: string): Label => ({ zh, en, ja })
type Plate = { src: string; caption: Label; alt: Label }

// Each interval in the recorded narration has its own subject and camera distance.
// All lettering lives outside the artwork, so the same drawing reads in each language.
const civil: Plate[] = [
  { src: intermodal,
    caption: label('民用联运码头：商船、货列与集装箱卡车。', 'A civil freight terminal: merchant ship, freight train and container truck.', '民間の貨物埠頭に並ぶ商船、貨物列車、コンテナトラック。'),
    alt: label('商船沿岸停靠，吊机吊起货箱；岸边铁路上的货列与前景集卡同框。', 'A crane lifts a container beside a moored ship. A freight train and a truck share the quay.', '接岸した商船の脇でクレーンがコンテナをつり上げ、岸壁には貨物列車とトラックが並ぶ。') },
  { src: ferry,
    caption: label('从岸上看滚装渡船的艉门与跳板。', 'A ferry’s stern ramp, seen from the quay.', '岸壁から見たフェリーの船尾扉とランプ。'),
    alt: label('厢式货车沿短跳板驶入敞开的渡船艉门，舱内停着小客车。', 'A box truck crosses the short ramp into an open ferry stern; cars are visible inside.', '箱型トラックが短いランプを上り、乗用車の見えるフェリーの車両甲板へ入る。') },
  { src: register,
    caption: label('交接台上的工具箱、吊签与复写联。', 'Tool case, inventory tags and a carbon-copy pad at the handover desk.', '引き渡し台に置かれた工具箱、荷札、複写式の伝票。'),
    alt: label('钢制工具箱系着空白吊签，旁边翻开复写纸；柜后可见档案柜与车床。', 'Blank tags hang from a steel tool case beside an open carbon-copy pad. A lathe stands behind the counter.', '鋼製の工具箱には白紙の荷札が付き、隣にはめくった複写伝票、奥には書類棚と旋盤が見える。') },
  { src: planning,
    caption: label('会图：把股道与库房放到同一张图纸上。', 'Planning together: tracks and a warehouse on one drawing.', '合同の図面確認。線路と倉庫を一枚の図面で見る。'),
    alt: label('几名工作人员围在长桌旁，指向展开的股道和仓库图，窗外可见港口吊机。', 'Several workers lean over an unfolded drawing of the tracks and warehouse, with a harbour crane beyond the windows.', '作業員たちが長机を囲み、広げた線路と倉庫の図面を指している。窓の外には港のクレーンが見える。') },
  { src: relief,
    caption: label('民用抢修现场：检修抽水泵，送来周转箱。', 'Civil emergency repairs: checking a pump and bringing supplies.', '民間の応急作業。排水ポンプを点検し、資材を運ぶ。'),
    alt: label('一人俯身检查泵组，软管伸向画外；同事从敞着后舱的维修车旁搬来物资箱。', 'One worker checks a pump connected to a large hose; a colleague carries a crate from an open service van.', '一人が太いホースにつながるポンプを点検し、もう一人が整備車から資材箱を運んでくる。') },
]

const chassisChapter: Plate[] = [
  { src: gauges,
    caption: label('检验台上的直尺、角尺与百分表。', 'Straightedge, square and dial indicator on the inspection bench.', '検査台に置かれた直定規、直角定規、ダイヤルゲージ。'),
    alt: label('直尺斜跨钢件，角尺靠住加工面，百分表的测头轻触工件。', 'A straightedge crosses a steel block, a square rests on its face and a dial indicator touches its surface.', '鋼材に長い直定規を渡し、加工面に直角定規とダイヤルゲージを当てている。') },
  { src: chassis,
    caption: label('上层是船，下层是托住它的工厂、船坞、铁路与电网。', 'Above, the vessel. Below, its industrial base: workshop, dock, railway and power grid.', '上段に船、下段にそれを支える工場、ドック、鉄道、送電網。'),
    alt: label('上方是钢船的侧视剖面。下方车间通向龙门吊下的船体钢肋，货运铁轨和输电塔沿一侧延伸。', 'A steel vessel in profile above a cutaway of shops, a hull frame beneath a gantry, freight tracks and a transmission tower.', '上段は鋼船の側面断面図。下段は工場から門型クレーン下の船体骨組みへ続き、脇に貨物線と送電鉄塔が並ぶ。') },
  { src: workshop,
    caption: label('回到车间：在船体钢肋上放样，在机床上加工零件。', 'On the shop floor: marking out a hull frame and machining a part.', '現場の仕事。船体の骨組みに墨付けし、旋盤で部品を加工する。'),
    alt: label('两位工人扶住角尺在钢肋上划线。右侧有人操作车床，轨道沿车间伸向远处。', 'Two workers use a square to mark a hull frame. A machinist works at a lathe beside tracks leading through the shop.', '二人が直角定規を当てて船体の骨組みに線を引く。右では作業員が旋盤を扱い、線路が工場の奥へ続く。') },
  { src: archives,
    caption: label('四件图像线索：铜器纹样、货运机车、工作灯与船图。', 'Four visual references: a bronze rubbing, a freight locomotive, a work lamp and a ship drawing.', '四つの手掛かり。青銅器の拓本、貨物機関車、作業灯、船の図面。'),
    alt: label('工作台上，铜器纹样拓片、蒸汽机车图像、手提工作灯与半卷的船图相互叠放。', 'On one table lie a bronze rubbing, an image of a steam locomotive, a portable work lamp and a partly rolled drawing of a ship.', '作業台に青銅器の拓本、蒸気機関車の写真、携帯作業灯、半ば巻いた船の図面が並ぶ。') },
  { src: harbour,
    caption: label('收卷：从工人的视线望向整座河港。', 'Closing view: the river port as seen by its workers.', '結び。作業員たちの視線の先に広がる川の港。'),
    alt: label('两位工人倚栏背望河面，船坞龙门、铁路和成排厂房沿岸展开。', 'Seen from behind, two workers look over a railing toward a river port lined with gantries, tracks and workshops.', '二人の作業員が欄干越しに川を望む。岸沿いに門型クレーン、鉄道、工場が続いている。') },
]

export function ClosingPlate({ beat, paragraph, language, tag }: {
  beat: 6 | 7; paragraph: number; language: IndustryLanguage; tag: string
}) {
  const pages = beat === 6 ? civil : chassisChapter
  const page = pages[paragraph] ?? pages[0]
  const nextSrc = pages[paragraph + 1]?.src
  useEffect(() => {
    if (nextSrc) new Image().src = nextSrc
  }, [nextSrc])
  if (!page.src) return <BlueprintFrame tag={tag}>{beat === 6 ? <LawTransportPlate language={language} /> : <ChassisLayersPlate language={language} />}</BlueprintFrame>
  return (
    <BlueprintFrame tag={tag} caption={t(page.caption, language)}>
      <img className="industry-plate-img" src={page.src} width={1664} height={936}
        alt={t(page.alt, language)} draggable={false} />
    </BlueprintFrame>
  )
}
