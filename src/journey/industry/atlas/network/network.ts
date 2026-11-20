import { label, type AtlasPlate } from '../plate'
const localPlates=import.meta.glob<string>('./*.webp',{eager:true,query:'?url',import:'default'})
const hull=localPlates['./i4p0.webp']
const airframe=localPlates['./i4p1.webp']
const handoff=localPlates['./i4p2.webp']
const specimens=localPlates['./i4p3.webp']

export const networkPlates = [
  {
    src: hull,
    caption: label('揭开一块船壳板：货舱的肋骨和机舱露出来。', 'Beneath the hull plating: the cargo hold’s frames and the engine room.', '外板を外すと、貨物倉の肋骨と機関室が見える。'),
    alt: label('通用货船从船艏一侧展开。近侧开口露出舱底和并排的肋骨，船尾开口露出主机。', 'A merchant ship seen from the bow. An opening reveals the hold floor and a row of frames; farther aft, another exposes the engine.', '船首側から見た貨物船。外板の開口部から船底と並んだ肋骨が、船尾側からは主機が見える。'),
  },
  {
    src: airframe,
    caption: label('民机装配车间：机身框架旁，线束和蒙皮正在等候装配。', 'In an airliner assembly hall, wiring harnesses and skin panels wait beside a fuselage section.', '旅客機の組立工場。胴体のそばに配線束と外板がそろう。'),
    alt: label('敞开的机身筒段占据机库一侧，内圈框架一层层延伸。检查员旁的推车上放着卷好的线束和弧形板。', 'An open fuselage barrel fills one side of a hangar. Beside an inspector, a trolley holds coiled cables and curved panels.', '格納庫の片側を占める胴体の内部に、円形の骨組みが連なる。検査員の隣の台車には配線束と曲面パネルが載っている。'),
  },
  {
    src: handoff,
    caption: label('铸件、轴承与线缆，在同一张工作台上相遇。', 'A casting, a bearing and cable arrive at the same bench.', '鋳物、軸受、ケーブルが一つの作業台に集まる。'),
    alt: label('两位工人分别扶住带法兰的铸件和滚动轴承，桌边还放着线缆。这是行业分工的示意，不是实际供应关系。', 'Two workers steady a flanged casting and a roller bearing. A cable lies nearby. This illustrates a division of labour, not an actual supplier relationship.', '二人がフランジ付きの鋳物と転がり軸受を支え、机の端にケーブルが置かれている。実在の供給関係を示すものではない。'),
  },
  {
    src: specimens,
    caption: label('图中数字为中国国民经济行业大类代码，不是联合国分类代码。', 'The numbers are Chinese industrial classification codes, not UN codes.', '番号は中国の産業大分類コードであり、国連の分類コードではありません。'),
    alt: label('矿石断面、加工好的齿轮与钢样、输电瓷绝缘子，从上到下作为三类工业实物示例。', 'From top to bottom: an ore specimen, a machined gear and steel sample, and a porcelain power-line insulator.', '上から鉱石の断面、加工された歯車と鋼材の見本、送電用の磁器がいしが並ぶ。'),
  },
] as const satisfies readonly AtlasPlate[]
