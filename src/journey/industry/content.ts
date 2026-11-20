import { PROJECT_NAME } from '../../brand'
import type { JourneyBeat, Localized, LocalizedParagraphs } from '../types'
import type { IndustryLanguage, IndustryText } from './locale'
import jaNarration from './narration-ja.json'

export const JOURNEY_META = {
  id: 'industry' as const,
  title: {
    en: 'The Chassis: How Industry Sustains Military Power',
    zh: '底盘：工业实力对军力的支撑',
    ja: '土台：産業が軍事力をどう支えるか',
  },
  englishTitleOnly: 'The Chassis: How Industry Sustains Military Power',
}

export const UI = {
  brandKicker: { ...PROJECT_NAME, ja: '中国の軍事力' },
  brandTitle: { en: 'The Chassis', zh: '底盘', ja: "土台" },
  brandWindow: { en: 'How Industry Sustains Military Power', zh: '工业实力对军力的支撑', ja: "産業が軍事力をどう支えるか" },
  enter: { en: 'Enter this volume', zh: '进入本卷', ja: "この章を開く" },
  reenter: { en: 'Return to the chassis', zh: '回到底盘', ja: "土台に戻る" },
  exit: { en: 'Leave', zh: '退出', ja: "退出" },
  close: { en: 'Close', zh: '关闭', ja: "閉じる" },
  sourcesBtn: { en: 'Sources', zh: '依据清单', ja: "出典一覧" },
  sourcesKicker: { en: 'Open sources only', zh: '公开依据', ja: "公開資料" },
  sourcesTitle: { en: 'Sources for this volume', zh: '本卷依据清单', ja: "この章の出典" },
  languageLabel: { en: 'Language', zh: '语言', ja: "言語" },
  playNarration: { en: 'Play narration', zh: '播放解说', ja: "解説を再生" },
  pauseNarration: { en: 'Pause', zh: '暂停', ja: "一時停止" },
  resumeNarration: { en: 'Resume', zh: '继续播放', ja: "再開" },
  replayNarration: { en: 'Replay', zh: '从头播放', ja: "最初から再生" },
  playHint: { en: 'Press play to start narration.', zh: '点击播放后开始口播，浏览器不会自动出声。', ja: '再生ボタンを押すと解説が始まります。' },
  narrationError: { en: 'The narration could not be started.', zh: '解说暂时无法播放。', ja: "解説を再生できませんでした。" },
  hints: {
    en: '0–7 jump beats   ·   ← → switch   ·   Space play or pause   ·   Drag the globe   ·   Esc to leave',
    zh: '0–7 跳转段落   ·   ← → 切换段落   ·   空格播放或暂停   ·   拖动地球   ·   Esc 退出',
    ja: '0〜7 で章へ移動 · ← → で切り替え · スペースで再生・停止 · ドラッグで地球を回転 · Esc で終了',
  },
  coordinateCaution: {
    en: 'Plants, yards, railways, grids, and linking lights are typological. They do not map real facilities or supply ties.',
    zh: '厂房、船坞、铁路、电网、光点与连线都是示意，不对应真实设施与真实供应关系。',
    ja: '工場、ドック、鉄道、送電網、点や線は模式図であり、実在の施設や供給関係を示すものではありません。',
  },
  noScore: { en: 'This volume does not rank or score.', zh: '本卷不作打分。', ja: "この章では点数を付けません。" },
  noRank: { en: 'This volume ends here. It does not rank, and it does not keep score.', zh: '本卷不排名次，不作打分。', ja: "この章では順位も点数も付けません。" },
  schematicMark: { en: 'Schematic', zh: '示意', ja: "模式図" },
}

/** Official / legal / document labels use a solid frame. External estimates use a dashed frame. */
export const SOURCE_TAGS = {
  officialRelease: { en: 'Official release', zh: '官方公布', ja: "公式発表" },
  officialDocument: { en: 'Official document', zh: '官方文件', ja: "公式文書" },
  officialWording: { en: 'Official wording', zh: '官方表述', ja: "公式見解" },
  law: { en: 'Law', zh: '法律', ja: "法律" },
  externalEstimate: { en: 'External estimate', zh: '外部估计', ja: "外部の推定" },
} as const

export type SourceTagId = keyof typeof SOURCE_TAGS

const I3_SEQUENTIAL_P0 =
  '于是先打底子。第一个五年计划，以苏联帮助设计的一百五十六个项目为中心，钢铁、煤炭、电力、机械一样样建起来，汽车、飞机这些部门从无到有。底子最厚的地方在东北，轻工业则多在沿海的几座大城市。'

const I3_SOLO_P0 =
  '新中国的工业，是从打底子开始的。第一个五年计划，以苏联帮助设计的一百五十六个项目为中心，钢铁、煤炭、电力、机械一样样建起来，汽车、飞机这些部门从无到有。底子最厚的地方在东北，轻工业则多在沿海的几座大城市。'

const I7_SEQUENTIAL_P0 = '回到开头那把尺子。'

const I7_SOLO_P0 = '看军力，有一把尺子要先摆正。'

export const SOLO_OPENERS = {
  i3: { sequential: I3_SEQUENTIAL_P0, solo: I3_SOLO_P0 },
  i7: { sequential: I7_SEQUENTIAL_P0, solo: I7_SOLO_P0 },
} as const

type IndustryBeat = JourneyBeat & { name: IndustryText; title: IndustryText; kicker: IndustryText; body: IndustryText }

export const BEATS: readonly IndustryBeat[] = [
  {
    id: 'i0',
    name: { en: 'The ruler', zh: '把尺子摆正', ja: "物差しを正す" },
    kicker: { en: 'I0  ·  Opening', zh: 'I0  ·  开场', ja: 'I0  ·  序章' },
    title: { en: 'Setting the Ruler Straight', zh: '把尺子摆正', ja: "物差しを正す" },
    body: {
      en: 'Look at what is lined up, and at what holds it up from behind.',
      zh: '看军力，既要看摆出来的，也要看撑在后面的。',
      ja: "軍事力を見るには、表に出ているものと、その裏で支えるものの両方を見る。",
    },
    narration: {
      en: [
        'When people talk about military power, they usually start by counting what they can see: how many ships, how many aircraft, how many vehicles. Those things can be counted, and they can be lined up.',
        'But equipment has a service life. Ships have to go into dock, aircraft need scheduled checks, each round of ammunition spent is one fewer, and a broken part has to be replaced. What an army has today is one question. What it still has tomorrow, next year, or after a hard fight, and what it can still replace, is another.',
        'That second question does not depend on the parade line. It depends on factories, docks, railways, and the power grid — on an industry that can build, repair, resupply, and absorb attrition.',
        'So this volume does not count equipment, and it does not keep score. It only wants to set the ruler straight: to look at military power, look at what is put on display, and also at what holds it up from behind.',
      ],
      zh: [
        '说起军力，人们最先数的，往往是看得见的东西：多少舰，多少机，多少车。这些数得清，也排得成队。',
        '可是装备有寿命。舰要进坞，飞机要定检，弹药打一发少一发，零件坏一个就得换一个。一支军队今天有什么，是一回事；明天、明年、打过一场硬仗之后还剩什么、还能补上什么，是另一回事。',
        '后面这件事，不取决于阵列，取决于工厂、船坞、铁路、电网，取决于一整套能造、能修、能补、能撑住消耗的工业。',
        '所以这一卷不数装备，也不比高下。只想把尺子摆正：看军力，既要看摆出来的，也要看撑在后面的。',
      ],
    },
  },
  {
    id: 'i1',
    name: { en: 'Workshop to machine', zh: '从作坊到机器', ja: "工房から機械へ" },
    kicker: { en: 'I1', zh: 'I1' },
    title: { en: 'From Workshop to Machine', zh: '从作坊到机器', ja: "工房から機械へ" },
    body: {
      en: 'A few plants are not yet an industry.',
      zh: '有了几座厂，还不等于有了工业。',
      ja: "工場がいくつかあっても、それだけでは産業にならない。",
    },
    narration: {
      en: [
        'Having the state organize the making of weapons is an old practice in China. In Qin during the Warring States, weapons were inscribed with the names of supervisors and craftsmen. If a link failed, the inscription led back to the person. The old books called this “the maker’s name on the object.” Workshops, armories, and unified specifications were already a system.',
        'But a workshop runs on human hands. By the nineteenth century the counterpart was the steam engine and steel, and the gap was no longer one weapon — it was an era.',
        'In 1865 the Jiangnan Arsenal was set up in Shanghai; the following year the Fuzhou Navy Yard opened at Mawei. They made guns and ships, ran schools, and translated books. That is when China first had a modern military industry.',
        'The step is worth remembering, and it need not be overstated. Machines can be bought and plants can be built, but steel, parts, technicians, and standards were not yet joined into one piece. By the year of the First Sino-Japanese War, guns and ammunition came in mixed models, and damaged warships were hard to repair in time. A few plants are not yet an industry.',
      ],
      zh: [
        '让国家来组织兵器生产，在中国是很老的事。战国时的秦，兵器上要刻下监造者和工匠的名字，哪一环出了毛病，顺着铭文就能追到人。古书把这叫作“物勒工名”。作坊、府库、统一的规格，已经是一套制度。',
        '但作坊靠的是人手。到了十九世纪，对手换成了蒸汽机和钢铁，差的就不是一件兵器，而是一个时代。',
        '一八六五年，江南制造总局在上海设立；第二年，福州船政在马尾开办。造枪炮，造轮船，办学堂，译书，中国由此开始有了近代军工。',
        '这一步值得记住，也不必说得太满。机器可以买来，厂子可以建起，可是钢材、配件、技师和标准，没有连成一片。到甲午年间，枪炮弹药型号繁杂，受损的军舰难以及时修复。有了几座厂，还不等于有了工业。',
      ],
    },
  },
  {
    id: 'i2',
    name: { en: 'Time in a fight', zh: '仗打的是时间', ja: "戦いを支える時間" },
    kicker: { en: 'I2', zh: 'I2' },
    title: { en: 'Staying in the Fight', zh: '仗打的是时间', ja: "戦いを支える時間" },
    body: {
      en: 'How long a front can hold depends on whether the rear can build, move, and repair.',
      zh: '前线能打多久，最终要看后方能不能造、能不能运、能不能修。',
      ja: "前線がどれだけ持ちこたえられるかは、後方で造り、運び、修理できるかにかかっている。",
    },
    narration: {
      en: [
        'Once a war starts, the test is not only the stock on the opening day, but the consumption and replenishment of every day that follows. Food, ammunition, fuel, and clothing have to go forward; broken vehicles and guns have to be hauled back for repair. An army does not exist only on a map. It also exists in time.',
        'A war not long after the founding of the People’s Republic wrote this lesson heavily. The story of the front is in another volume; here we speak only of the rear. The saying at the time was: of all the tasks, transport comes first. When railways and roads were bombed and cut, they were repaired and reopened, and a “steel transport line that could not be smashed or cut” was kept open.',
        'The trucks that ran on that line, and the aircraft in the sky, were not yet things the country could make itself. In 1954 Mao Zedong put it plainly: “What can we make now? We can make tables and chairs, teacups and teapots, we can grow grain and grind it into flour, and we can make paper. But we cannot make a single automobile, a single airplane, a single tank, or a single tractor.”',
        'How long the front can keep fighting, in the end, depends on whether the rear can build, can move, and can repair.',
      ],
      zh: [
        '仗打起来，比的不只是开战那一天的家底，更是此后每一天的消耗与补充。粮食、弹药、油料、被装要送上去，打坏的车和炮要拖下来修。军队不只存在于地图上，也存在于时间里。',
        '新中国成立不久的那场战争，把这个道理写得很沉重。前线的故事在另一卷里，这里只说后方。当时的说法是：千条万条，运输第一条。铁路和公路被炸断，就抢修接通，硬是维持出一条“打不烂、炸不断的钢铁运输线”。',
        '而线上跑的汽车，天上飞的飞机，当时都还不是自己能造的。一九五四年，毛泽东有一段很直白的话：“现在我们能造什么？能造桌子椅子，能造茶碗茶壶，能种粮食，还能磨成面粉，还能造纸，但是，一辆汽车、一架飞机、一辆坦克、一辆拖拉机都不能造。”',
        '前线能打多久，最终要看后方能不能造、能不能运、能不能修。',
      ],
    },
  },
  {
    id: 'i3',
    name: { en: 'Depth and backup', zh: '打底子再铺开', ja: "産業の広がりと備え" },
    kicker: { en: 'I3', zh: 'I3' },
    title: { en: 'Depth and Backup', zh: '打底子，再铺开', ja: "産業の広がりと備え" },
    body: {
      en: 'An industrial system needs depth, and it needs backup.',
      zh: '工业体系要有纵深，要有备份。',
      ja: "産業には地理的な広がりと、代わりを担う備えが必要だ。",
    },
    narration: {
      en: [
        'So the foundation came first. The First Five-Year Plan was built around one hundred and fifty-six projects designed with Soviet help. Steel, coal, electric power, and machinery were built up one after another, and sectors such as automobiles and aircraft were created from nothing. The thickest foundation was in the Northeast; light industry was mostly in a few large coastal cities.',
        'Once a foundation existed, another problem followed: industry could not all be stacked in one place. In 1964 the central leadership decided on the Third Front construction. The country was divided into first, second, and third fronts by distance from borders and the coast, and steel, energy, machinery, and railways were spread into the hinterland of the southwest and the northwest.',
        'It was a decision of a particular era, made for war preparedness. It left railways, power stations, and industrial cities in the mountains, and it also exacted a cost: some plants went into ravines, far from markets and supporting industries, and later went through adjustment and relocation.',
        'Apart from the cost, a principle remained: an industrial system needs depth, and it needs backup. If one place stops, another can still take over.',
      ],
      zh: [
        '于是先打底子。第一个五年计划，以苏联帮助设计的一百五十六个项目为中心，钢铁、煤炭、电力、机械一样样建起来，汽车、飞机这些部门从无到有。底子最厚的地方在东北，轻工业则多在沿海的几座大城市。',
        '底子有了，另一个问题跟着出来：工业不能全堆在一处。一九六四年，中央决定搞三线建设。按照离边境和海岸的远近，全国分成一线、二线、三线，把钢铁、能源、机械和铁路，往西南、西北的腹地铺开。',
        '这是特定年代、为备战作出的决定。它在深山里留下了铁路、电站和工业城市，也付出过代价：有些厂进了山沟，离市场和配套都远，后来又经历了调整和搬迁。',
        '代价之外，道理留了下来：工业体系要有纵深，要有备份。一处停摆，别处还能接上。',
      ],
    },
  },
  {
    id: 'i4',
    name: { en: 'A feeding network', zh: '互相喂养的网', ja: "互いを支える産業網" },
    kicker: { en: 'I4', zh: 'I4' },
    title: { en: 'A System That Feeds Itself', zh: '一张互相喂养的网', ja: "互いを支える産業網" },
    body: {
      en: 'Industrial strength is the completeness of a network, not the skill of a single plant.',
      zh: '工业实力不是某一座厂的本事，而是一张网的完整程度。',
      ja: "産業の強さは、一つの工場の能力ではなく、網全体がどれだけつながっているかだ。",
    },
    narration: {
      en: [
        'Take a ship apart and look. The hull needs steel plate, and steel plate needs iron ore, coke, and electricity. The main engine needs large castings and forgings and precision machine tools. Radar and communications need chips, software, and special materials. Once the ship is built, it still needs docks, fuel, spare parts, and people who can repair it.',
        'An aircraft or a rocket comes apart the same way. Behind each one is a chain of industries, feeding one another, and waiting on one another for materials.',
        'So industrial strength is not the skill of a single plant. It is how complete a network is. If one knot is missing, the finished product stalls there. The denser the net, the more substitute paths it has.',
        'In the wording of the Ministry of Industry and Information Technology, China has forty-one major industrial categories, and possesses every industrial category in the United Nations industrial classification. Having every category does not mean leading in every one. But it does mean that the chain a complex piece of equipment needs can, in the main, be joined up inside this territory.',
      ],
      zh: [
        '把一艘船拆开来看。船壳要钢板，钢板要铁矿、焦炭和电；主机要大型铸锻件和精密机床；雷达与通信要芯片、软件和特种材料；船造好了，还要码头、油料、备件，和会修它的人。',
        '一架飞机、一枚火箭，也是这样拆下去。每一样背后都是一串行业，行业与行业之间互相供料，互相等米下锅。',
        '所以工业实力不是某一座厂的本事，而是一张网的完整程度。网上缺一个结，成品就卡在那里；网越密，能替补的路越多。',
        '按照工业和信息化部的说法，中国有四十一个工业大类，拥有联合国产业分类中的全部工业门类。门类全，不等于样样领先。但门类全意味着，一件复杂装备所需要的链条，大体能在自己的版图里接起来。',
      ],
    },
  },
  {
    id: 'i5',
    name: { en: 'What can be seen', zh: '今天能公开看到的', ja: "公開資料から見えること" },
    kicker: { en: 'I5', zh: 'I5' },
    title: { en: 'What Can Be Seen Today', zh: '今天能公开看到的', ja: "公開資料から見えること" },
    body: {
      en: 'A large chassis is a fact; so is the need to leave room.',
      zh: '底盘大，是事实；余地要留，也是事实。',
      ja: "産業の土台が大きいのは事実だが、それだけでは結論は出せない。",
    },
    narration: {
      en: [
        'What can be seen in public today starts with ships. The Ministry of Industry and Information Technology released figures showing that in 2025 China’s completed shipbuilding tonnage accounted for more than half of the world total, and that its share of the three main indicators has led internationally for sixteen years running. This is a commercial shipbuilding statistic measured in deadweight tons. It cannot be converted directly into warships. What it shows is something else: docks, welders, steel plate, and supporting plants — the chassis of this industry is large.',
        'There are also observations from outside. The U.S. Department of Defense annual report says China is the world’s largest shipbuilding nation by tonnage, and judges that its capacity to build various classes of naval vessels is increasing. That is an external judgment, not a Chinese official figure. It is recorded here as such.',
        'Aviation, space, electronics, energy, and transport follow the same logic: what can be seen in public is the direction of an industry; what cannot be seen, this volume does not guess at.',
        'The official self-assessment is in fact quite restrained. The 2019 defense white paper wrote that, compared with advanced military levels in the world, the gap in the modernization of the armed forces is still large. A large chassis is a fact. So is the need to leave room.',
      ],
      zh: [
        '今天能公开看到的，先说船。工业和信息化部公布，二〇二五年中国造船完工量占世界总量的一半以上，三大指标的国际市场份额连续十六年领先。要说明的是，这是按载重吨计算的造船业统计，说的是商船市场，不能直接换算成军舰。它说明的是另一件事：船坞、焊工、钢板和配套厂，这个行业的底盘很大。',
        '外部也有观察。美国国防部的年度报告称，中国按吨位是世界最大的造船国，并判断其各类舰艇的建造能力在增强。这是外部的判断，不是中方公布的数字，这里只照录。',
        '航空、航天、电子、能源和交通，道理相同：能公开看到的，是产业的方向；看不到的，这一卷不猜。',
        '官方的自我评价其实相当克制。二〇一九年的国防白皮书写道，军队现代化水平与世界先进军事水平相比，差距还很大。底盘大，是事实；余地要留，也是事实。',
      ],
    },
  },
  {
    id: 'i6',
    name: { en: 'Civil and military', zh: '军民之间', ja: "軍と民間の間" },
    kicker: { en: 'I6', zh: 'I6' },
    title: { en: 'Between Civil and Military', zh: '军民之间', ja: "軍と民間の間" },
    body: {
      en: 'Mobilization runs both ways.',
      zh: '动员是双向的。',
      ja: "動員は双方向に働く。",
    },
    narration: {
      en: [
        'What do ordinary ships, vehicles, aircraft, and factories have to do with national defense? The published laws are clear. There is no need to guess.',
        'The National Defense Transportation Law provides that the categories of civilian vehicles required to incorporate national defense requirements are determined by the state and announced to the public, and that the added cost is borne by the state. What it asks of the transportation system is to “serve in peacetime, respond in emergencies, and meet wartime needs.”',
        'The National Defense Mobilization Law has a dedicated chapter on research, production, and maintenance of military products: in peacetime, reserve the capacity, and keep ready the equipment, materials, techniques, and teams. The law also writes down the limits: requisition requires registration and a certificate, items must be returned after use, losses must be compensated, and daily necessities of individuals and families are not subject to requisition.',
        'The phrase used in that transportation law is “military-civil integrated development.” The report of the 20th National Congress of the Communist Party of China speaks of “an integrated national strategic system and capacity.” Both refer to coordinated planning, institutional connection, and shared resources between the military and civilian sides.',
        'Looked at the other way, the same set of capacities is also used elsewhere: repair teams and reserved supplies can also hold when a major disaster comes. Mobilization runs both ways.',
      ],
      zh: [
        '平时的船、车、飞机和工厂，与国防有什么关系？公开的法律里写得很清楚，不需要猜。',
        '《国防交通法》规定，哪些类别的民用运载工具需要贯彻国防要求，由国家确定并向社会公布；因此增加的费用，由国家承担。它要的是交通体系“平时服务、急时应急、战时应战”。',
        '《国防动员法》专有一章，讲军品科研、生产与维修保障：平时储备能力，备好设备、材料、技术和队伍。法律也写明了边界：征用要登记、出凭证，用完要返还，有损失要补偿，个人和家庭的生活必需品不在征用之列。',
        '这部交通法里用的词，是“军民融合发展”；党的二十大报告的提法，是“一体化国家战略体系和能力”。说的都是军地之间规划统筹、制度衔接、资源共享。',
        '换个方向看，同一套能力也用在别处：抢修的队伍，储备的物资，遇到大灾时一样顶得上。动员是双向的。',
      ],
    },
  },
  {
    id: 'i7',
    name: { en: 'The chassis', zh: '底盘', ja: "土台" },
    kicker: { en: 'I7  ·  Close', zh: 'I7  ·  收束', ja: 'I7  ·  結び' },
    title: { en: 'The Chassis', zh: '底盘', ja: "土台" },
    body: {
      en: 'Industry is the chassis of military power. It does not decide the direction, and it does not guarantee victory. It decides how long a country can hold under pressure.',
      zh: '工业是军力的底盘。底盘不决定方向，也不保证胜负；它决定的是，一个国家在压力之下能撑多久。',
      ja: "産業は軍事力の土台だ。進む方向を決めるわけでも、勝利を約束するわけでもない。圧力の下でどれだけ持ちこたえられるかを左右する。",
    },
    narration: {
      en: [
        'Return to the ruler we started with.',
        'What sits at sea and waits at airfields is the visible part of military power. What lets them put to sea year after year, take to the air, be repaired when broken, and be replaced when short, is the invisible part: mines, power plants, steelworks, docks, railways, and the institutions and people that join them into one piece.',
        'Industry is the chassis of military power. The chassis does not decide the direction, and it does not guarantee victory. What it decides is how long a country can hold under pressure. This volume ends here. It does not rank, and it does not keep score.',
        'Further back is the Warring States, when the state first organized production into power. Closer to today are the supply lines of the War to Resist U.S. Aggression and Aid Korea, the whole-of-society mobilization when disaster comes, and the public baseline laid out for 2026.',
        'Four lines, four sides of the same word.',
      ],
      zh: [
        '回到开头那把尺子。',
        '摆在海上、停在机场的，是军力看得见的部分。让它们年复一年出得了港、升得了空、坏了修得回、少了补得上的，是看不见的部分：矿山、电厂、钢厂、船坞、铁路，以及把这些连成一体的制度和人。',
        '工业是军力的底盘。底盘不决定方向，也不保证胜负；它决定的是，一个国家在压力之下能撑多久。这一卷到此为止，不排名次，不作打分。',
        '再往前，是战国，国家第一次把生产组织成力量。离今天近一些的，是抗美援朝的补给线，是灾难来临时的全社会动员，是二〇二六年摆在明面上的那份公开基线。',
        '四条线，讲的是同一个字的四个侧面。',
      ],
    },
  },
]

export function narrationForBeat(beatIndex: number, language: IndustryLanguage, solo: boolean): string[] {
  const beat = BEATS[beatIndex] ?? BEATS[0]
  const lines = language === 'ja'
    ? [...(jaNarration.beats[beatIndex] ?? jaNarration.beats[0])]
    : [...beat.narration[language]]
  if (language === 'ja' && solo && (beat.id === 'i3' || beat.id === 'i7')) lines[0] = jaNarration.solo[beat.id]
  if (language === 'zh' && solo && beat.id === 'i3') lines[0] = I3_SOLO_P0
  if (language === 'zh' && solo && beat.id === 'i7') lines[0] = I7_SOLO_P0
  if (language === 'en' && solo && beat.id === 'i3') {
    lines[0] = 'Industry in the new China began by laying a foundation. The First Five-Year Plan was built around one hundred and fifty-six projects designed with Soviet help. Steel, coal, electric power, and machinery were built up one after another, and sectors such as automobiles and aircraft were created from nothing. The thickest foundation was in the Northeast; light industry was mostly in a few large coastal cities.'
  }
  if (language === 'en' && solo && beat.id === 'i7') {
    lines[0] = 'To look at military power, a ruler has to be set straight first.'
  }
  return lines
}

export const JUMP_TICKETS: Record<string, { to: 'force' | 'korea' | 'mobilize' | 'baseline2026'; label: IndustryText; hint: IndustryText }> = {
  force: {
    to: 'force',
    label: { en: 'The Warring States chapter', zh: '战国章', ja: '戦国時代' },
    hint: { en: 'The first time the state organized production into power', zh: '国家第一次把生产组织成力量', ja: '国家が生産を組織し、力に変える' },
  },
  korea: {
    to: 'korea',
    label: { en: 'Resist U.S. Aggression and Aid Korea', zh: '抗美援朝', ja: '朝鮮戦争：抗米援朝' },
    hint: { en: 'The story of the front is here', zh: '前线的故事在这里', ja: '前線で起きたこと' },
  },
  baseline2026: {
    to: 'baseline2026',
    label: { en: '2026 military baseline', zh: '2026 军力基线', ja: '2026年の軍事力' },
    hint: { en: 'The half that is placed in plain view', zh: '摆在明面上的那一半', ja: '公開資料から見える半分' },
  },
  mobilize: {
    to: 'mobilize',
    label: { en: 'Disaster response and mobilization', zh: '灾难动员', ja: '災害対応と動員' },
    hint: { en: 'The same capacity, the other direction', zh: '同一套能力，另一个方向', ja: '同じ力を、別の方向へ' },
  },
}

export const SOURCE_SECTIONS: { title: IndustryText; paragraphs?: IndustryText[]; items?: IndustryText[] }[] = [
  {
    title: { en: 'How to read this list', zh: '阅读说明', ja: '出典の読み方' },
    paragraphs: [
      {
        en: 'These sources support the volume. They are not read aloud. Official releases, official documents, and laws are marked with a solid frame on the plates; external estimates use a dashed frame. Schematics are marked as such and do not map real facilities.',
        zh: '以下依据只放在清单里，不进口播正文。卷面上，〔官方公布〕〔官方文件〕〔法律〕用实线框，〔外部估计〕用虚线框，【示意】用角标。厂房、船坞、铁路、电网与连线都不对应真实设施或真实供应关系。',
        ja: 'ここに記す出典は読み上げません。公式発表・公式文書・法律は実線、外部の推定は破線で区別しています。模式図の施設や線は実在の施設・取引関係を示しません。',
      },
    ],
  },
  {
    title: { en: 'Sources S1–S16', zh: '依据 S1–S16', ja: '出典 S1〜S16' },
    items: [
      { en: 'S1 · “The maker’s name on the object” in the Rites and Lüshi Chunqiu; Qin weapon inscriptions; Shuihudi Qin strips. Transmitted texts and museum publications.', zh: 'S1 · “物勒工名，以考其诚”见《礼记·月令》《吕氏春秋·孟冬纪》；秦兵器铭文；睡虎地秦简《工律》。传世文献与文博公开资料。', ja: "S1 · 「物に工人の名を刻んでその仕事を確かめる」という考え方。『礼記』月令、『呂氏春秋』孟冬紀、秦の兵器銘文、睡虎地秦簡の工律。伝世文献と博物館等の公開資料。" },
      { en: 'S2 · Jiangnan Arsenal, Shanghai, 1865; Fuzhou Navy Yard, Mawei, 1866. Years and places checked in secondary modern-history accounts; original archives were not consulted. Output figures were not used.', zh: 'S2 · 江南制造总局 1865 年设于上海；福州船政局 1866 年设于马尾。年份与地点经二手近代史叙述核对，未见原始档案。产量数字未采用。', ja: "S2 · 江南製造総局は1865年に上海、福州船政局は1866年に馬尾で設立。年代と所在地は近代史の二次資料で確認した。原史料は未確認。生産量の数字は採用していない。" },
      { en: 'S3 · Mixed models and hard-to-repair ships around the First Sino-Japanese War: a researcher’s commentary, not official statistics. Specific counts were not used.', zh: 'S3 · 甲午年间枪炮弹药型号繁杂、受损军舰难以及时修复：研究者评述，不是官方统计。具体厂数等数字未采用。', ja: "S3 · 日清戦争期の銃砲・弾薬の型式の不統一と損傷艦の修理難。研究者の評価であり、公式統計ではない。具体的な工場数などは採用していない。" },
      { en: 'S4 · “Of all the tasks, transport comes first”; the “steel transport line that could not be smashed or cut.” Official reporting. Casualty and mileage figures were not used.', zh: 'S4 · “千条万条，运输第一条”；“打不烂、炸不断的钢铁运输线”。官方报道。兵力、伤亡与里程数字未采用。', ja: "S4 · 「数ある仕事の中でも、まず輸送」「爆撃されても途切れない鋼鉄の輸送線」。公式報道。兵力・死傷者・距離の数字は採用していない。" },
      { en: 'S5 · Mao Zedong, 14 June 1954, on what could not yet be made. Quoted via a Party literature office article citing Collected Works of Mao Zedong, vol. 6, p. 329; the original volume was not opened in this pass.', zh: 'S5 · 毛泽东 1954 年 6 月 14 日讲话。经中央党史和文献研究院网站文章引用核对《毛泽东文集》第 6 卷第 329 页，未直接翻检原书。', ja: "S5 · 1954年6月14日の毛沢東の発言。中共中央党史・文献研究院の記事が引用した『毛沢東文集』第6巻329頁で確認。原書は未確認。" },
      { en: 'S6 · The First Five-Year Plan centered on 156 Soviet-aided projects. Official and Party-history accounts. The planned figure of 156 is used in narration; 150 actually built is noted only here.', zh: 'S6 · “一五”计划以苏联帮助设计的 156 个项目为中心。官方与党史表述。口播用官方“一百五十六个项目”；实际施工 150 项只记在清单里。', ja: "S6 · 第一次五カ年計画の中心は、ソ連の設計支援を受けた156事業。公式資料・党史による。解説は計画数156を用い、実際の着工数150はここにのみ記す。" },
      { en: 'S7 · Early heavy industry concentrated in the Northeast, light industry in a few coastal cities. Official media; narration stays qualitative.', zh: 'S7 · 建国初期重工业多在东北，轻工业多在沿海少数城市。官方媒体报道；口播只作定性表述。', ja: "S7 · 建国初期の重工業は主に東北部、軽工業は主に沿海部の一部都市に集中していた。公式メディアの報道をもとに、解説では定性的に述べた。" },
      { en: 'S8 · Third Front decision in 1964; first, second, and third fronts; emphasis on the southwest and northwest. Official and national-history accounts. Investment and project counts were not used.', zh: 'S8 · 三线建设 1964 年决策；划分一、二、三线；重点在西南、西北。官方与国史叙述。投资额、项目数等数字未采用。', ja: "S8 · 三線建設は1964年に決定。一線・二線・三線に区分し、西南部と西北部を重視した。公式資料・国史による。投資額や事業数は採用していない。" },
      { en: 'S9 · Costs and later adjustment of the Third Front: a restrained public historical judgment. The cited monograph was not checked against the original in this pass; wording was not expanded, and no figures were invented.', zh: 'S9 · 三线建设的代价与后续调整：克制的公开史学评价。本轮未对到所引原著；措辞不扩写，也不编数字。', ja: "S9 · 三線建設の代償と後年の再編については、公開された歴史研究の慎重な評価による。今回は引用元の原著を未確認。評価の文言や数値は追加していない。" },
      { en: 'S10 · 41 major industrial categories, covering every UN industrial category. Official remarks at State Council Information Office briefings, 2023-03-01 and 2024-07-05.', zh: 'S10 · 四十一个工业大类，拥有联合国产业分类中的全部工业门类。国务院新闻办发布会 2023-03-01、2024-07-05，工业和信息化部负责人发言。', ja: "S10 · 工業の41大分類と、国連産業分類に含まれる全工業分野の保有について。国務院新聞弁公室の2023年3月1日・2024年7月5日の会見における工業情報化部の発言。" },
      { en: 'S11 · 2025 completed shipbuilding 53.69 million dwt, 56.1% of the world total; sixteen years leading on the three indicators. MIIT Equipment Industry Department II, 2026-02-01; carried by Xinhua and gov.cn. Narration says “more than half” and “sixteen years”; the 56.1% figure is only on the plate, after this check. https://www.miit.gov.cn/gxsj/tjfx/zbgy/mycb/art/2026/art_fc5e4ed1d3f5421885e6c3afff91cbbc.html', zh: 'S11 · 2025 年造船完工量 5369 万载重吨，占世界总量 56.1%；三大指标连续 16 年领先。工信部装备工业二司 2026-02-01，新华社与中国政府网转载。口播只说“一半以上”和“连续十六年”；56.1% 仅上卷面，且已经本轮核对。https://www.miit.gov.cn/gxsj/tjfx/zbgy/mycb/art/2026/art_fc5e4ed1d3f5421885e6c3afff91cbbc.html', ja: "S11 · 2025年の造船完工量は5369万載貨重量トン、世界の56.1%。主要3指標で16年連続首位。工業情報化部装備工業二司、2026年2月1日。解説は「半分以上」と「16年連続」とし、56.1%は巻面にのみ記載。 https://www.miit.gov.cn/gxsj/tjfx/zbgy/mycb/art/2026/art_fc5e4ed1d3f5421885e6c3afff91cbbc.html" },
      { en: 'S12 · U.S. Department of Defense annual report: China as the world’s top ship-producing nation by tonnage. This pass verified the 2022 wording on increasing capacity for all naval classes, and the 2024 wording that China “is the world’s top ship-producing nation by tonnage” and is capable of producing a wide range of naval combatants, nearly self-sufficient for shipbuilding. The 2025 edition exists; its defense-industry chapter was not fully extracted here. Plate source year is the latest fully verified edition, 2024. Narration is unchanged and adds no ship counts.', zh: 'S12 · 美国国防部年度报告称中国按吨位为世界最大造船国。本轮核对到 2022 年版“正在提升各类舰艇建造能力”的表述，以及 2024 年版“按吨位为世界最大造船国、能够生产多种舰艇、造船需求近乎自给”。2025 年版已经发布，其国防工业章节本次未能完整提取。卷面来源年份改指最新完整核对到的 2024 年版。口播论点未改，不加舰数。', ja: "S12 · 米国防総省の年次報告。2022年版で各種艦艇の建造能力向上、2024年版でトン数世界最大、多様な艦艇の製造能力、造船需要のほぼ自給を確認。2025年版の該当章は確認が不完全なため、巻面は2024年版までを明示。艦艇数は追加していない。" },
      { en: 'S13 · 2019 white paper China’s National Defense in the New Era: the gap with advanced military levels in the world is still large.', zh: 'S13 · 2019 年《新时代的中国国防》：“与世界先进军事水平相比差距还很大。”', ja: "S13 · 2019年国防白書『新時代の中国の国防』は、軍の近代化水準について、世界の先進水準とはなお大きな隔たりがあると述べている。" },
      { en: 'S14 · National Defense Transportation Law: military-civil integration; serve in peacetime, respond in emergencies, meet wartime needs; civilian vehicles and state-borne added costs; reserve supplies may be used in rescue and disaster relief. NPC website.', zh: 'S14 · 《国防交通法》：军民融合发展；平时服务、急时应急、战时应战；民用运载工具贯彻国防要求，增加费用由国家承担；储备物资可用于抢险救灾。中国人大网。', ja: "S14 · 国防交通法。軍民融合発展、平時・緊急時・戦時の役割、民間輸送手段の要件と追加費用の国負担、救助・災害対応での備蓄物資の利用。中国全人代ウェブサイト。" },
      { en: 'S15 · National Defense Mobilization Law, 2026 revision: research, production, and maintenance of military products; registration, certificates, return, compensation, and exemptions for daily necessities.', zh: 'S15 · 《国防动员法》（2026 年修订）：军品科研、生产与维修保障；征用的登记、凭证、返还、补偿与生活必需品免征。', ja: "S15 · 国防動員法（2026年改正）。軍用品の研究・製造・修理。徴用の登録、証明書、返還、補償、生活必需品の適用除外。" },
      { en: 'S16 · Report to the 20th National Congress: consolidate and improve an integrated national strategic system and capacity.', zh: 'S16 · 党的二十大报告：“巩固提高一体化国家战略体系和能力。”', ja: "S16 · 中国共産党第二十回大会の報告。「一体化した国家戦略体系と能力を固め、高める」。" },
    ],
  },
]

export type { Localized, LocalizedParagraphs }
