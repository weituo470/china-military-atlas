import { label, type AtlasPlate } from '../plate'
const localPlates=import.meta.glob<string>('./*.webp',{eager:true,query:'?url',import:'default'})
const i2p0=localPlates['./i2p0.webp']
const i2p1=localPlates['./i2p1.webp']
const i2p2=localPlates['./i2p2.webp']
const i2p3=localPlates['./i2p3.webp']
const i3p0=localPlates['./i3p0.webp']
const i3p1=localPlates['./i3p1.webp']
const i3p2=localPlates['./i3p2.webp']
const i3p3=localPlates['./i3p3.webp']


export const inlandPlates = [
  {
    src: i2p0,
    caption: label('给备件抽屉补货', 'Restocking the parts drawer', '予備部品を補充する'),
    alt: label(
      '工作台抽屉里分放着轴承和轴瓦，一只手把纸包放进空位。',
      'A hand places a paper parcel in a drawer beside two ball bearings and a row of bearing shells.',
      '作業台の引き出しには玉軸受と半円形の軸受が並び、空いた所に紙包みを置く手が見える。',
    ),
  },
  {
    src: i2p1,
    caption: label('站台上的养路工', 'The track worker on the platform', 'ホームに立つ保線員'),
    alt: label(
      '站台边，工人扶着装有枕木的手推车，一列蒸汽客车正从旁经过。',
      'A track worker holds a handcart loaded with sleepers as a steam locomotive passes with passenger coaches.',
      '枕木を載せた手押し車を支える保線員のそばを、客車を引く蒸気機関車が通る。',
    ),
  },
  {
    src: i2p2,
    caption: label('桌上的茶壶，门外的货车', 'A teapot on the table, a lorry outside', '卓上の急須、戸外のトラック'),
    alt: label(
      '木桌上摆着茶壶和茶碗，两旁的工匠各忙手中的活，门外可见一辆老式货车。',
      'A teapot and bowls sit on a wooden table between two working artisans; a period lorry is visible through the doorway.',
      '木の卓には急須と茶碗が並ぶ。両側で職人が作業し、開いた戸の向こうには旧式のトラックが見える。',
    ),
  },
  {
    src: i2p3,
    caption: label('检修台上的皮带轮', 'A pulley on the repair stand', '点検台に載ったベルト車'),
    alt: label(
      '一名维修工扶着竖立的大皮带轮，另一人俯身查看轮缘，旁边停着木板推车。',
      'One mechanic steadies a large upright pulley while another leans in to inspect its rim. A wooden trolley stands nearby.',
      '一人が立てた大きなベルト車を支え、もう一人がかがんで外周を確かめる。横には木の台車がある。',
    ),
  },
  {
    src: i3p0,
    caption: label('轧机送出的钢坯', 'Steel emerging from the rolling mill', '圧延機を出る鋼材'),
    alt: label(
      '高大的钢架厂房里，一块炽亮的钢坯从轧辊间伸向前方的辊道，两名工人站在左侧。',
      'Beneath tall steel roof trusses, a bright slab emerges between two rollers onto a roller table. Two workers stand to the left.',
      '鉄骨の工場で、光る鋼材が二本のロールの間から手前の搬送台へ出てくる。左には二人の作業員が立つ。',
    ),
  },
  {
    src: i3p1,
    caption: label('山间立起的厂房', 'A workshop rises in the hills', '山あいに建つ工場'),
    alt: label(
      '山坡下的新厂房尚未铺上屋面，工人用吊架起吊钢梁，成排屋架向远处延伸。',
      'Below a mountain slope, workers lift a steel beam beside an unfinished brick workshop with a row of exposed roof trusses.',
      '山の斜面を背にしたレンガの工場で、作業員が鉄骨の梁をつり上げる。まだ屋根のない骨組みが奥へ続く。',
    ),
  },
  {
    src: i3p2,
    caption: label('机器搬走以后', 'After the machines moved out', '機械が去ったあと'),
    alt: label(
      '空厂房的地面留下两座带螺栓的机座，敞开的门框里是桥、房屋和层层山岭。',
      'Two bare concrete machine bases with anchor bolts remain on the workshop floor. The open doorway frames a bridge, buildings and hills.',
      '空いた工場の床にボルトの突き出た二つの機械基礎が残る。開いた扉の向こうには橋と家並み、山の稜線が見える。',
    ),
  },
  {
    src: i3p3,
    caption: label('一对同型水泵', 'A pair of matching pumps', '同じ型のポンプが二台'),
    alt: label(
      '两组同型水泵错落排开，近处的电机搭着防尘布，工人站在另一组旁低头记着笔记。',
      'Two matching pump sets stand on separate bases. A cloth covers the nearer motor while a worker takes notes beside the other.',
      '同型のポンプが別々の台に据えられている。手前のモーターには布が掛かり、奥の一台のそばで作業員が記録を取る。',
    ),
  },
] as const satisfies readonly AtlasPlate[]
