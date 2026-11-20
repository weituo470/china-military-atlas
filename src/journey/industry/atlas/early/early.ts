import { label, type AtlasPlate } from '../plate'
const localPlates=import.meta.glob<string>('./*.webp',{eager:true,query:'?url',import:'default'})
const i0p0=localPlates['./i0p0.webp']
const i0p1=localPlates['./i0p1.webp']
const i0p2=localPlates['./i0p2.webp']
const i0p3=localPlates['./i0p3.webp']
const i1p0=localPlates['./i1p0.webp']
const i1p1=localPlates['./i1p1.webp']
const i1p2=localPlates['./i1p2.webp']
const i1p3=localPlates['./i1p3.webp']

export const earlyPlates = [
  { src: i0p0,
    caption: label('码头上，车、飞机和船各自排成行。', 'Lorries, aircraft and boats line the quay.', '波止場に並ぶトラック、飛行機、船。'),
    alt: label('平台上，平板货车斜列在两架螺旋桨飞机前，几艘工作船沿岸停靠。', 'A diagonal row of flatbed lorries stands in front of two propeller aircraft. Workboats are moored along the quay.', '平荷台のトラックが斜め一列に並び、その奥にプロペラ機が二機、岸壁には作業船が係留されている。') },
  { src: i0p1,
    caption: label('飞机进了机库，定检从轮旁展开。', 'In the hangar, a routine inspection reaches the landing gear.', '格納庫で、着陸装置を定期点検する。'),
    alt: label('一名工作人员在舷梯旁记录，两名同事蹲在起落架旁。前景的小车上放着一旧一新的机轮。', 'One worker writes beside the boarding steps while two colleagues crouch by the landing gear. A trolley holds a worn wheel and a replacement.', '搭乗階段の脇で一人が記録を取り、二人が着陸装置のそばにかがむ。手前の台車には使い込んだ車輪と交換用の車輪が載っている。') },
  { src: i0p2,
    caption: label('一处河湾，连着厂房、船坞、铁路和输电线。', 'Workshops, a dry dock, freight tracks and power lines share a river bend.', '川の湾曲部に集まる工場、乾ドック、貨物線、送電線。'),
    alt: label('货运机车沿弯道驶过锯齿顶厂房，右侧水边是空船坞，输电塔从厂后延伸到远处。', 'A freight locomotive rounds the curve in front of a sawtooth-roofed works. An empty dry dock borders the river, and power lines stretch into the distance.', '貨物機関車がのこぎり屋根の工場前をカーブする。川べりに空の乾ドックがあり、工場の後ろには送電鉄塔が続く。') },
  { src: i0p3,
    caption: label('门外看得见船，门内看得见修船的工作。', 'Beyond the workshop door is the ferry; inside are the people who keep it running.', '扉の向こうに船があり、手前にそれを支える仕事がある。'),
    alt: label('工作台上的直尺、角尺和台钳占据近景。一名工人推着零件车穿过机床间，敞开的厂门外有一艘渡船。', 'A straightedge, square and vise fill the foreground. A worker wheels parts past machine tools, with a ferry visible through the open door.', '手前の作業台に直定規、直角定規、万力がある。作業員が工作機械の間を部品の台車と進み、開いた扉の外に連絡船が見える。') },
  { src: i1p0,
    caption: label('从馆藏入手：青铜器残片和它的表面拓片。', 'Reading an object: a bronze fragment and a rubbing of its surface.', '収蔵品を観察する。青銅器の破片と、その表面の拓本。'),
    alt: label('研究人员举着放大镜观察软垫托盘里的铜戈残片；旁边的纸上拓出了锈蚀表面的轮廓与斑驳纹理。', 'A researcher examines a fragment of a bronze ge with a magnifier. Beside its padded tray, a rubbing records the outline and pitted surface.', '研究員がクッションを敷いた箱の銅戈の破片を拡大鏡で観察する。脇の拓本には、腐食した表面の輪郭と凹凸が写っている。') },
  { src: i1p1,
    caption: label('一边手工织布，一边由传动轴带动一排织机。', 'A handloom beside a row of looms driven by an overhead shaft.', '手織り機の隣に、頭上の軸で動く織機が並ぶ。'),
    alt: label('左侧织工坐在木机前织布，右侧工人照看成排的动力织机。皮带接向头顶的传动轴，远处可见大飞轮。', 'A weaver sits at a wooden handloom. Across the aisle, workers tend power looms beneath belts and shafting; a large flywheel stands beyond.', '左では一人が木製の機で布を織り、右では工員が並んだ動力織機を見ている。頭上を軸とベルトが走り、奥に大きなはずみ車が見える。') },
  { src: i1p2,
    caption: label('晚清船厂学堂：桌上是书，窗外是正在修造的轮船。', 'A late Qing dockyard classroom: books on the table, a steamship outside.', '清末の造船所の学び舎。机には書物、窓の外には汽船。'),
    alt: label('师生围桌翻阅书册，教师指向展开的一页。透过敞开的窗扇，可以看到船旁的脚手架和码头吊机。', 'A teacher points to an open page as students consult their books. Through the casements, scaffolding surrounds a ship beside a dock crane.', '生徒たちが机を囲んで本を開き、教師が紙面を指している。開いた窓の外に船の足場と岸壁のクレーンが見える。') },
  { src: i1p3,
    caption: label('船已靠岸，库里的配件却未必合得上。', 'The ship is in port, but the parts on the shelf may not fit.', '船は着いていても、庫内の部品が合うとは限らない。'),
    alt: label('工人将一件小轴承座与台上的大轴承座比对，另一人查看稀疏的货架。门外系着一艘轮船。', 'A worker compares two bearing housings of different sizes while a colleague searches the sparsely stocked shelves. A steamship is moored outside.', '一人が大小の軸受台を見比べ、もう一人が品物の少ない棚を調べている。戸口の向こうには汽船が係留されている。') },
] as const satisfies readonly AtlasPlate[]
