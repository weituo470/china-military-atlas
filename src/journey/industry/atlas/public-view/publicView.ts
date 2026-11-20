import { label, type AtlasPlate } from '../plate'
const localPlates=import.meta.glob<string>('./*.webp',{eager:true,query:'?url',import:'default'})
const i5p0=localPlates['./i5p0.webp']
const i5p1=localPlates['./i5p1.webp']
const i5p2=localPlates['./i5p2.webp']
const i5p3=localPlates['./i5p3.webp']

export const publicViewPlates = [
  {
    src: i5p0,
    caption: label('干船坞里的商船。公开吨位统计说的是商船，不是军舰。',
      'A merchant ship in dry dock. The tonnage figures refer to commercial shipbuilding, not warships.',
      '乾ドックの商船。公表されたトン数は商船の統計で、軍艦の数字ではない。'),
    alt: label('从坞底仰望商船船首，船壳由墩块托起，两名工人在作业平台旁。',
      'Seen from the dock floor, the bow of a merchant ship rests on blocks beside two workers and a platform.',
      'ドックの底から見上げた商船の船首。盤木が船体を支え、脇の作業台に二人の作業員がいる。'),
  },
  {
    src: i5p1,
    caption: label('外部报告中的判断不等于中方公布的统计。',
      'An assessment in an outside report is not an official Chinese statistic.',
      '外部の報告書による評価と、中国側が公表した統計は別のもの。'),
    alt: label('阅览桌上放着一本合起的书。旁边，一只手用放大镜查看照片上的船坞。',
      'A closed volume lies on a reading desk beside a photograph of a shipyard being examined with a magnifying glass.',
      '閲覧机に閉じた本が置かれ、その横で造船所の写真を虫眼鏡で見ている。'),
  },
  {
    src: i5p2,
    caption: label('从卫星模型到客机：公开展品能说明产业方向。',
      'From a satellite model to an airliner: public exhibits illustrate industrial activity.',
      '衛星模型から旅客機まで。公開展示から産業の動向が見える。'),
    alt: label('展厅内有卫星模型和电子机架；门外可见屋顶光伏板、客机和行李拖车。',
      'A satellite model and an electronics rack stand in a hall. Outside are rooftop solar panels, an airliner and a baggage tug.',
      '展示場に衛星模型と電子機器のラックが並ぶ。屋外には屋上の太陽光パネル、旅客機、手荷物用のけん引車が見える。'),
  },
  {
    src: i5p3,
    caption: label('量具只检验眼前的零件，不能据此判断整个体系的水平。',
      'A gauge can test one part. It cannot assess an entire system.',
      '測定器で確かめられるのは目の前の部品で、全体の水準ではない。'),
    alt: label('检验台上，指示表的测头轻触一根阶梯轴；后方车间的轮廓逐渐淡去。',
      'A dial indicator touches a stepped shaft on an inspection bench; the rest of the workshop fades into the background.',
      '検査台でダイヤルゲージの測定子が段付き軸に触れている。背後の工場は淡い線で描かれている。'),
  },
] as const satisfies readonly AtlasPlate[]
