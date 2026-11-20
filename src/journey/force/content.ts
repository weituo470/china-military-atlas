/**
 * Bilingual copy for Chapter I of the Force journey.
 * Chinese is the default overlay language; English is a complete peer, not a gloss.
 * Ancient numerical claims are labeled as source statements, never as established fact.
 * Ported from the standalone Chapter 1 prototype and rewritten for this app.
 */
import { BEAT_STAGING } from './sites'
import type { JourneyBeat, Localized } from '../types'

export const JOURNEY_META = {
  id: 'force' as const,
  chapter: 1,
  totalChapters: 5,
  queryValue: 'force',
}

export const UI = {
  brandKicker: { en: 'Chapter I', zh: '第一章' } satisfies Localized,
  brandTitle: { en: 'Intensity, Arms, and Strategy', zh: '烈度、兵器与谋略' } satisfies Localized,
  continueHint: {
    en: 'Later chapters will turn to theory, will, and the present. They are not in this build.',
    zh: '后四章将转向兵法、意志与当下。它们不在本构建中。',
  },
  exit: { en: 'Exit journey', zh: '退出导览' } satisfies Localized,
  enter: { en: 'Chapter I', zh: '第一章' } satisfies Localized,
  sourcesBtn: { en: 'Sources', zh: '史料与注释' } satisfies Localized,
  sourcesKicker: { en: 'Notes for judges and readers', zh: '供评委与读者核对' } satisfies Localized,
  sourcesTitle: { en: 'Sources & cautions', zh: '史料与审慎说明' } satisfies Localized,
  close: { en: 'Close', zh: '关闭' } satisfies Localized,
  langEn: 'EN',
  langZh: '中文',
  languageLabel: { en: 'Language', zh: '语言' } satisfies Localized,
  hints: {
    en: '0–7 jump beats   ·   ← → change beat   ·   Space play/pause   ·   Drag the globe   ·   Click a theater or weapon   ·   Esc to exit',
    zh: '0–7 跳转段落   ·   ← → 切换段落   ·   空格播放或暂停   ·   拖动地球   ·   点击战场或兵器   ·   Esc 退出',
  } satisfies Localized,
  commentary: { en: 'Commentary', zh: '解说' } satisfies Localized,
  strategyHint: {
    en: 'Click the China or Greek theater on the globe.',
    zh: '可点击地球上的中国或希腊战场。',
  } satisfies Localized,
  inspectHint: {
    en: 'Click a weapon for its card. On the crossbow, open the bronze lock.',
    zh: '点击兵器查看说明。弩可打开青铜弩机。',
  } satisfies Localized,
  openLock: { en: 'Open the bronze lock', zh: '打开青铜弩机' } satisfies Localized,
  closeLock: { en: 'Reassemble the lock', zh: '合上弩机' } satisfies Localized,
  blockLegend: {
    en: 'One block = 1,000 people. Solid blocks are modern estimates. Hatched blocks are source claims, not musters.',
    zh: '一方块 = 1,000人。实心为现代估计；阴影为文献记载，不是名册。',
  } satisfies Localized,
  coordinateCaution: {
    en: 'Pins use representative or site coordinates on the present-day globe, not excavated meter precision.',
    zh: '图钉为今地图上的代表性或遗址坐标，并非发掘测得的米级精度。',
  } satisfies Localized,
  playNarration: { en: 'Play narration', zh: '播放解说' } satisfies Localized,
  pauseNarration: { en: 'Pause', zh: '暂停' } satisfies Localized,
  resumeNarration: { en: 'Resume', zh: '继续播放' } satisfies Localized,
  replayNarration: { en: 'Replay from the start', zh: '从头播放' } satisfies Localized,
  playHint: {
    en: 'After you click, the globe turns to each region and the war is shown schematically.',
    zh: '点击后，镜头会转到对应位置并演示战争',
  } satisfies Localized,
  voiceChineseOnly: {
    en: 'Spoken narration is Chinese-only for now. On-screen text stays in English.',
    zh: '语音解说目前仅为中文。画面文字仍可切换为英文。',
  } satisfies Localized,
  narrationError: {
    en: 'Voice could not be loaded. You can still walk the globe and read the commentary.',
    zh: '语音未能载入。仍可浏览地球并阅读解说。',
  } satisfies Localized,
  warTypological: {
    en: 'Schematic / typological — not exact campaign routes.',
    zh: '示意 / 类型学，并非精确进军路线。',
  } satisfies Localized,
  warringStatesArcs: { en: 'Schematic interstate fighting', zh: '列国交战示意' } satisfies Localized,
  encircleStarve: { en: 'Schematic encirclement and supply cut', zh: '包围与断粮示意' } satisfies Localized,
  changpingCaution: {
    en: 'Archaeology shows remains on the order of a hundred; the Shiji’s 400,000 is not visualized.',
    zh: '考古所见为百人量级，不可视化史记四十万',
  } satisfies Localized,
  farNear: { en: 'Schematic “befriend the distant, attack the near”', zh: '远交近攻示意' } satisfies Localized,
  illustrationCaution: {
    en: 'Typological illustration — not a photograph of the event.',
    zh: '历史想象图，并非事件照片。',
  } satisfies Localized,
  bambooSlips: { en: 'Bamboo slips', zh: '竹简' } satisfies Localized,
  parchmentRoll: { en: 'Parchment roll', zh: '羊皮卷' } satisfies Localized,
  weaponsPlateCaution: {
    en: 'Typological illustration, not a named excavated object. The typological weapons on the globe remain the accurate models.',
    zh: '类型学想象图，不是某一件出土器。地球上的兵器架才是准确的类型学模型。',
  } satisfies Localized,
  changpingPlateTitle: {
    en: 'Changping campaign, schematic · typological illustration',
    zh: '长平作战示意 · 历史想象图',
  } satisfies Localized,
  changpingPlateNote: {
    en: 'Encirclement and a cut supply road — not a precise battlefield reconstruction.',
    zh: '包围与断粮，非精确战场复原',
  } satisfies Localized,
  scaleEastCaption: {
    en: 'The feeling of a literature-claim host — not a muster.',
    zh: '文献记载的规模感 · 非名册',
  } satisfies Localized,
  scaleWestCaption: {
    en: 'A countable landing — the feeling of a modern estimate.',
    zh: '可计数的登陆与会战 · 现代估计的感觉',
  } satisfies Localized,
}

export const BEATS = [
  {
    id: 'hook',
    name: { en: 'Hook', zh: '开场' },
    kicker: { en: 'Chapter I  ·  c. 475–221 BCE', zh: '第一章  ·  约前475–前221年' },
    title: { en: 'Go back to that century.', zh: '先回到那个世纪。' },
    body: {
      en: 'We are going to compare, on one shared timeline, how intensely ancient states could make war — not as a legend, and not by reciting books.',
      zh: '我们要在同一条时间尺上，比较古代国家能把战争打到什么烈度。这是给听众的讲解，不是念文献。',
    },
    narration: {
      en: [
        'Set the clock to the fifth through third centuries BCE. In the east, along the Yellow River and across the Central Plains, the states already stood on a land reshaped by war.',
        'This is the Warring States. Banners face each other, dust rises, and ranks spread company by company. It is not tribal raiding, and not a couple of set-piece battles. For more than two centuries, states were almost continuously at war with one another. The state that could keep fighting was the one more likely to survive.',
        'On that same timeline the Mediterranean is living through the Peloponnesian War, the Persian empire is entering its last chapter, and Alexander’s campaigns belong in this window too. Rome only brushes the tail of this age, right at the end.',
        'What we will compare is not who feels more mysterious. It is several dimensions of the intensity of ancient war: how long it could be sustained, how far a state could mobilize, how arms and industry were organized, and how strategy was written down as a method. When a source gives a huge number, I will flag it. I will not treat it as a verified headcount.',
      ],
      zh: [
        '把时间拨到公元前五世纪到三世纪。那时的东方，黄河两岸，中原列国并立，已经是一整片被战争改变的土地。',
        '这里是战国。旌旗相对，尘土扬起，阵列一层层铺开。这不是几次部落袭扰，也不是一两次会战定胜负，而是两个多世纪里，国家与国家几乎一直在打。谁能把战争持续下去，谁就更可能活到最后。',
        '同一条时间尺上，地中海正在经历伯罗奔尼撒战争，波斯帝国走到尾声，亚历山大的远征也在这个时段里。罗马要到最后，才刚刚碰到这个时代的尾巴。',
        '我们要比的，不是谁更神秘，而是古代战争烈度的几个维度：打得有多持续，国家能动员到什么程度，兵器和军工怎样组织，谋略怎样写成一套方法。遇到文献里的大数字，我会单独标明，不把它当成已经核对过的人数。',
      ],
    },
  },
  {
    id: 'timeline',
    name: { en: 'Timeline', zh: '时间尺' },
    kicker: { en: 'Beat 1  ·  A shared century', zh: '第一段  ·  同一世纪' },
    title: { en: 'Intensity begins with time.', zh: '烈度，先从时间看起。' },
    body: {
      en: 'In the east, war could last more than two centuries, and defeat could mean the end of a state. In the Mediterranean, the famous wars of the same age were usually shorter.',
      zh: '东方的战争可以持续两个多世纪，战败可能亡国。同一时代的地中海，那些著名战争通常更短。',
    },
    narration: {
      en: [
        'The intensity of the Warring States shows first in time: almost continuous war for more than two centuries, until Qin unified the land in 221 BCE. Defeat was often not a treaty and a journey home. It could mean the death of a state.',
        'In the Mediterranean, the Peloponnesian War lasted about a generation, not two centuries. Alexander’s march into Asia was brilliant, and short. Near Eastern empires could move supplies on a grand scale, but the million-man armies in Greek writing cannot be taken at face value. So when we compare intensity, we compare how long the fighting lasted, and how costly it was to lose.',
      ],
      zh: [
        '战国的烈度，首先是时间：几乎连续打了两个多世纪，直到公元前二百二十一年秦统一。那时候，战败往往不是签一份和约就回家，而是可能亡国。',
        '地中海这边，伯罗奔尼撒战争打了大约一代人，不是两个世纪。亚历山大打到亚洲，很辉煌，但很短。近东帝国的后勤确实可观，可希腊作家笔下的百万大军，今天不能照单全收。所以比烈度，先比它持续了多久，以及失败的代价有多沉重。',
      ],
    },
  },
  {
    id: 'institutions',
    name: { en: 'Institutions', zh: '制度' },
    kicker: { en: 'Beat 2  ·  Mobilization', zh: '第二段  ·  动员' },
    title: { en: 'Look at the machine first.', zh: '先看国家这部机器。' },
    body: {
      en: 'Before we compare headcounts, look at what a state could mobilize: registers, granaries, and counties in the east; citizen armies and alliances in the Mediterranean.',
      zh: '比人头之前，先看国家能动员什么：东方的户籍、粮仓和县制，地中海的公民军与同盟。',
    },
    narration: {
      en: [
        'Before we count heads, look at the machine of the state. Household registers, granaries, and county administration turned people and grain into resources that could be levied again and again. Shang Yang’s reforms are the best-documented case, but the other states were moving the same way: the government that could mobilize its whole territory was more likely to survive.',
        'Greek city-states and kingdoms of the same age also raised troops, formed alliances, and moved supplies. Few, though, pushed household registration, county government, and mass conscription this far. To compare intensity, look at this machine first, and only then at the numbers.',
      ],
      zh: [
        '比人头之前，先看国家这部机器。户籍、粮仓、县制，把人和粮食变成可以反复征发的战争资源。商鞅变法是记载最清楚的样本，可列国都在往这个方向走：谁更能把全境动员起来，谁就越可能活下来。',
        '同时代的希腊城邦和王国，也有征兵、同盟和后勤，但很少把编户、县政和大规模征发推到这种程度。比较烈度，要先看这部机器，再看人数。',
      ],
    },
  },
  {
    id: 'weapons',
    name: { en: 'Weapons', zh: '兵器' },
    kicker: { en: 'Beat 3  ·  A craft of mass armies', zh: '第三段  ·  面向大军的工艺' },
    title: { en: 'The craft behind the weapons.', zh: '兵器背后，是一套军工。' },
    body: {
      en: 'The point is not a magical weapon. It is whether an army could be armed, again and again, and whether tactics could change with that craft.',
      zh: '重点不是神兵，而是一支军队能否被反复武装起来，以及战术能否跟着这套工艺一起变。',
    },
    narration: {
      en: [
        'These weapons are typological, not a single museum piece. The ge is a formation polearm made to hook and peck. The key to the crossbow is a bronze trigger lock, which made a powerful shot possible without a lifetime of composite-bow training. The best evidence for a high degree of standardization comes from the Qin and Han; the Warring States are the formative period of that craft.',
        'Iron is the same story. The point is not that the steel was always sharper, but whether a war economy could put serviceable iron into many hands. Zhao’s reform of Hu-style mounted archery then added a mobile arm to an infantry and crossbow core.',
      ],
      zh: [
        '这些兵器是示意，不是某一件博物馆孤品。戈是阵列里用来钩啄的长兵。弩的关键是青铜机括，让较强的发射不必依赖像复合弓那样长年训练。高度标准化的最佳证据在秦、汉，战国是它的形成期。',
        '铁也一样。重点不是钢一定更锋利，而是战争经济能不能把可用的铁器交到许多人手里。赵武灵王的胡服骑射，则是给步兵和弩兵，补上机动的一臂。',
      ],
    },
  },
  {
    id: 'scale',
    name: { en: 'Scale', zh: '规模' },
    kicker: { en: 'Beat 4  ·  How large is large?', zh: '第四段  ·  何谓大规模' },
    title: { en: 'The numbers we can actually check.', zh: '能核对的，是数万这个量级。' },
    body: {
      en: 'In the Mediterranean, the better-checked armies of this age are usually in the tens of thousands. Huge figures in Chinese and other texts are source claims, not musters.',
      zh: '地中海这边，比较能核对的军队，通常是数万。中文和其他文献里的巨大数字，只作记载，不是名册。',
    },
    narration: {
      en: [
        'In the Mediterranean, start with the figures we can actually check. When Athens sailed to Sicily, the first landing of hoplites was about 5,100; with crews and allies, the first wave was about 27,000. At Gaugamela, modern estimates often put Alexander near 47,000. A Roman consular army was about 16,000 to 20,000, and it belongs only at the very end of the Warring States — we will not bring it forward.',
        'Chinese texts speak of 100,000 to 600,000, for example Wang Jian’s campaign against Chu, claimed at 600,000. Greek and Latin writers also gave the Nanda 200,000 infantry. Treat all of these as reports, not as verified musters. Solid blocks are modern estimates; hatched blocks are claims in the sources. When we compare intensity, we should not stack unverified headcounts on top of one another.',
      ],
      zh: [
        '地中海这边，先从能核对的量级说起。雅典去西西里，最初登陆的重装步兵大约五千一百人；连同桨手和盟军，第一波大约两万七千人。亚历山大在高加米拉，现代估计常常约四万七千人。罗马的执政官军队大约一万六千到两万人，只在战国最末期的重叠处出现，我们不把它提前来比。',
        '中文记载里会出现十万到六十万，比如王翦攻楚，号称六十万。希腊罗马文献也写过，难陀有步兵二十万。这些都只作记载，不是已经核实的名册。实心方块是现代估计，阴影是文献记载。比较烈度，不要把还没核实的人头叠在一起。',
      ],
    },
  },
  {
    id: 'changping',
    name: { en: 'Changping', zh: '长平' },
    kicker: { en: 'Beat 5  ·  A case, 260 BCE', zh: '第五段  ·  个案，前260年' },
    title: { en: 'What Changping can show, and what it cannot.', zh: '长平能看见什么，不能看见什么。' },
    body: {
      en: 'A campaign of encirclement and starvation is clearly visible here. The famous total of 400,000 is a source narrative, not something this chapter will put on the screen.',
      zh: '这里能看清的，是包围和断粮。史记里的四十万是文献叙述，本章不会把它铺到画面上。',
    },
    narration: {
      en: [
        'Changping lies near present-day Gaoping, in Shanxi. This is a representative site, not a trench grid. The Qin army first drew the Zhao force out, then closed around it, and cut the grain road. The Shiji says that after Bai Qi cut the grain and encircled the Zhao army, 400,000 Zhao soldiers were killed, and only 240 youths were spared.',
        'Later archaeology does confirm a great battle and a massacre here. But the remains in a single pit are on the order of a hundred people, not 400,000. Many historians read that figure as rhetorical exaggeration. We will not invent a different number to replace it. What can be confirmed here is the method: lure, encircle, cut the grain, and then destroy a trapped army.',
      ],
      zh: [
        '长平，在今天的山西高平一带。这是遗址的代表性位置，不是探方网格。秦军先把赵军诱出，再一步步合围，切断粮道。史记里说，白起断粮、包围赵军之后，赵卒四十万降而尽杀，只留下二百四十名少年。',
        '后来的考古，证实这里发生过大战和屠杀。可单个坑位的遗骸，大约是百人量级，远不是四十万。许多史家把它看作修辞性的夸大。我们不会另造一个数字来代替它。这里真正能确认的，是诱出、包围、断粮，然后解决一支被困的军队。',
      ],
    },
  },
  {
    id: 'strategy',
    name: { en: 'Strategy', zh: '谋略' },
    kicker: { en: 'Beat 6  ·  Strategy', zh: '第六段  ·  谋略' },
    title: { en: 'Strategy is more than famous lines.', zh: '谋略，不只是名句。' },
    body: {
      en: 'In the east, war was already being written as a craft of the state. In the west, command and misjudgment were being written down too. The comparison belongs on the same globe.',
      zh: '东方已经把战争写成国家的技艺。西方也在写下指挥与误判。这两种传统，同在这颗地球上。',
    },
    narration: {
      en: [
        'Strategy is more than famous sentences. The Sunzi that has come down to us was most likely written gradually in the mid-to-late Warring States, in conversation with the wars of that age — not a book already finished very early. These texts talk about winning in advance, about supply lines and terrain, and they count politics and diplomacy as part of war.',
        'The west of the same age was not without strategy. The Sicilian expedition was written as a study of strategic misjudgment; Xenophon wrote on marching and governance; Alexander’s combined-arms army and long-range logistics were high command in practice.',
        'The difference is this: Warring States military books more systematically turned “how a state remakes itself for war” into a craft that could be taught. Qin’s way of befriending the distant and striking the near was a cold strategy paired with reform at home. Remember that, in the same century, China was already writing war as a craft of the state, not only as the order of battle on the day of a clash.',
      ],
      zh: [
        '谋略不能只靠名句。传世的孙子兵法，多半是在战国中后期逐渐写定的，和当时的战争相互发明，不是一本很早就定稿的书。它们讲先胜、粮道、地形，也把政治和外交算进战争。',
        '同时代的西方并非没有谋略。西西里远征，被写成一次战略误判；色诺芬写下行军和治理；亚历山大的合成军队和远程后勤，是实践里的高明指挥。',
        '可差别在于：战国兵书更系统地把“国家如何为战争改造自己”，写成一套可以传授的技艺。秦的远交近攻，就是和自强改革配套的冷酷谋略。请记住，在同一个世纪里，中国已经把战争写成国家技艺，而不只是会战当天的阵列。',
      ],
    },
  },
  {
    id: 'close',
    name: { en: 'Close', zh: '收束' },
    kicker: { en: 'Beat 7  ·  What can be defended', zh: '第七段  ·  能够站得住的判断' },
    title: { en: 'What can stand is not a myth.', zh: '能够站住的，不是神话。' },
    body: {
      en: 'Not a legend of invincibility, and not a contest of numbers: three capacities you can already see, and a cost of confrontation that was already extremely high.',
      zh: '不是无敌传说，也不是数字竞赛：是三种已经看得见的能力，以及一种在古代就已经极高的对抗代价。',
    },
    narration: {
      en: [
        'What can stand is not a myth of invincibility, and not a contest of numbers. It is three capacities already in view: sustained high-intensity war supported by household registers and counties; military industry typified by the crossbow lock and the making of iron; and a tradition of strategy that wrote logistics, diplomacy, and battlefield calculation into military books. Even in antiquity, the cost of fighting a state system like this was already extraordinarily high.',
      ],
      zh: [
        '能够站住的结论，不是无敌神话，也不是数字竞赛。是三种已经看得见的能力：用编户和县制支撑的持续高烈度，以弩机和铁器生产为代表的军工组织，以及把后勤、外交和战场计算写进兵书的谋略传统。即使在古代，和这样的国家体系作战，代价也已经极高。',
      ],
    },
  },
] as const satisfies readonly JourneyBeat[]

type _BeatsMatchStaging = typeof BEATS['length'] extends typeof BEAT_STAGING['length']
  ? typeof BEAT_STAGING['length'] extends typeof BEATS['length']
    ? true
    : never
  : never
true satisfies _BeatsMatchStaging

if (BEATS.length !== BEAT_STAGING.length) {
  throw new Error(`Chapter I beat/staging length mismatch: ${BEATS.length} vs ${BEAT_STAGING.length}`)
}


export const THEATERS = [
  {
    id: 'china',
    kicker: { en: 'East Asia', zh: '东亚' },
    title: { en: 'Warring States China', zh: '战国中国' },
    short: { en: 'Warring States China', zh: '战国中国' },
    body: {
      en: 'Conventionally dated c. 475–221 BCE (some historians prefer 403, when the Zhou court recognized the partition of Jin). Seven major territorial states — Qin, Chu, Qi, Yan, Zhao, Wei, Han — fought nearly continuous interstate wars until Qin’s unification in 221 BCE. Shang Yang’s reforms in Qin (mid-fourth century) typify the era’s fiscal-military state.',
      zh: '通常起迄约为前475–前221年（亦有学者以周室承认三家分晋的前403年为始）。秦、楚、齐、燕、赵、魏、韩等大型领土国家几乎连续作战，至前221年秦统一。秦国商鞅变法（前四世纪中叶）是这一时代财政-军事国家的典型。',
    },
    note: {
      en: 'Duration and institutions are the firmest comparative points. Army totals in the Shiji and related texts are not used here as raw facts.',
      zh: '比较中最稳妥的是战争持续时间与制度能力。《史记》等文献中的兵力数字，不在此当作原始事实使用。',
    },
  },
  {
    id: 'greece',
    kicker: { en: 'Eastern Mediterranean', zh: '东地中海' },
    title: { en: 'Greek world', zh: '希腊世界' },
    short: { en: 'Greek world', zh: '希腊世界' },
    body: {
      en: 'The Peloponnesian War (431–404 BCE) lasted a generation, not two centuries. Typical hoplite armies were in the low tens of thousands or fewer. Athens’ Sicilian expedition of 415 BCE landed about 5,100 hoplites at the outset; with crews and allies the first wave is often estimated around 27,000 men (Thucydides; modern summaries). Later Hellenistic field armies grow, but remain in a comparable order of magnitude.',
      zh: '伯罗奔尼撒战争（前431–前404）持续一代人，而非两个世纪。典型重装步兵部队通常在数万或更少。前415年雅典西西里远征最初登陆约5,100名重装步兵；连同桨手与盟军，第一波现代估计约2.7万人（修昔底德及现代综述）。此后希腊化野战军有所扩大，但仍在同一量级。',
    },
    note: {
      en: 'These are among the better-documented Mediterranean figures of the age, and they set a useful scale: tens of thousands, not hundreds of thousands.',
      zh: '这是该时代地中海世界中记载较好的数字，可作量级参照：是数万，不是数十万。',
    },
  },
  {
    id: 'near-east',
    kicker: { en: 'Near East', zh: '近东' },
    title: { en: 'Achaemenid & early Hellenistic', zh: '阿契美尼德与希腊化早期' },
    short: { en: 'Near East', zh: '近东' },
    body: {
      en: 'Herodotus’ millions for Xerxes are not used. A cautious modern reading of the 480 BCE invasion allows a land army on the order of tens of thousands of soldiers (some estimates start around 50,000 combatants, plus large non-combat trains). Alexander crossed into Asia in 334 BCE with roughly 30,000–47,000 men (ancient authorities differ; modern accounts commonly stay in this band). At Gaugamela (331) his army is often placed near 47,000. Persian totals opposite him are much less certain and are frequently exaggerated in Greek sources.',
      zh: '希罗多德所记薛西斯“百万大军”不足采信。对前480年入侵的审慎现代估计，陆军作战部队约在数万（有估计以约5万士兵为下限，另有庞大随行人员）。亚历山大于前334年进入亚洲时，兵力约3.0–4.7万（古代记载有出入，现代研究多落在此区间）。高加米拉（前331）一役，其军常被估计约4.7万。对面波斯兵力远不确定，希腊文献往往夸大。',
    },
    note: {
      en: 'Imperial logistics in the Near East were formidable. That is not the same thing as accepting Greek parade totals.',
      zh: '近东帝国的后勤能力确实可观，但这不等于接受希腊作家的阅兵式数字。',
    },
  },
  {
    id: 'south-asia',
    kicker: { en: 'South Asia', zh: '南亚' },
    title: { en: 'Late Mahajanapada to Nanda', zh: '列国晚期至难陀' },
    short: { en: 'South Asia', zh: '南亚' },
    body: {
      en: 'By the late fourth century BCE, Magadha under the Nandas was the dominant North Indian power — the horizon Alexander’s army faced at the Hyphasis in 326 BCE. Greek and Latin writers report a Nanda force of 200,000 infantry (Curtius, Diodorus, Plutarch agree on infantry; cavalry, chariots, and elephants diverge, and Plutarch is higher). These are reports that reached a foreign army, not audited musters. They must be treated with the same caution as large Chinese totals.',
      zh: '至前四世纪末，难陀治下的摩揭陀已是北印度主导力量——也是前326年亚历山大军队在贝阿斯河（希法西斯）所面对的前方。希腊罗马作家记难陀有步兵二十万（库尔提乌斯、狄奥多罗斯、普鲁塔克在步兵数上一致；骑兵、战车与象军数字分歧，普鲁塔克偏高）。这是传到外国军队中的传闻，不是经核验的名册，须与中国文献中的大数字同样审慎对待。',
    },
    note: {
      en: 'South Asia belongs on this timeline. Its source totals are not treated as confirmed strength.',
      zh: '南亚必须出现在这条时间尺上；其文献数字不作为已确认兵力。',
    },
  },
  {
    id: 'rome',
    kicker: { en: 'Central Italy  ·  late overlap only', zh: '意大利中部  ·  仅末期重叠' },
    title: { en: 'Mid-Republican Rome', zh: '罗马共和中期' },
    short: { en: 'Rome (late overlap)', zh: '罗马（末期重叠）' },
    body: {
      en: 'Rome enters this comparison only at the end of the Warring States. The Samnite Wars (343–290 BCE) overlap the late fourth and early third centuries; the First Punic War begins in 264 BCE, still before Qin’s unification in 221. A mid-Republican consular army was typically two legions plus allies — often on the order of 16,000–20,000; larger four-legion efforts with allies could exceed 40,000. Cannae (216 BCE) is after 221 and is not treated here as a contemporary set piece.',
      zh: '罗马只在战国最末期进入比较。萨莫奈战争（前343–前290）与前四世纪末、前三世纪初重叠；第一次布匿战争始于前264年，仍早于前221年秦统一。共和中期一支执政官军团通常为两个罗马军团加盟军，约1.6–2.0万；更大的四军团加盟军行动可超过4万。坎尼（前216）已在前221年之后，不作同时代战例使用。',
    },
    note: {
      en: 'Chronology first: overlap is real, but late and limited. Later Punic War battles are not silently back-dated.',
      zh: '首先要卡住年代：重叠是真实的，但晚且有限。不把此后的布匿战争场面暗中提前。',
    },
  },
];

export const WEAPONS = [
  {
    id: 'ge',
    kicker: { en: 'Polearm  ·  ge  戈', zh: '长兵  ·  戈' },
    title: { en: 'The dagger-axe', zh: '戈' },
    short: { en: 'Ge  戈', zh: '戈' },
    body: {
      en: 'The ge is the characteristic bronze polearm of early China: a dagger blade set at right angles to the shaft, often with a downward hu for lashing. It remains central into the Warring States, later joined and partly superseded by the ji halberd (ge plus a spear point). It is a formation weapon — made to hook, hook-and-pull, and fight in ranks.',
      zh: '戈是早期中国最具识别度的青铜长兵：援与柲大致垂直，常有向下的胡以便缚绳。战国时期仍是主力，后与戟（戈矛合体）并存并部分被取代。它是阵列兵器，用于钩、啄与近距离横队作战。',
    },
    note: {
      en: 'Form follows ranks: this is a weapon of organized infantry, not of a lone champion.',
      zh: '形制服务于阵列：这是有组织步兵的兵器，不是个人英雄的兵器。',
    },
  },
  {
    id: 'crossbow',
    kicker: { en: 'Missile  ·  nu  弩', zh: '远射  ·  弩' },
    title: { en: 'The bronze-lock crossbow', zh: '青铜弩机' },
    short: { en: 'Crossbow  弩', zh: '弩' },
    body: {
      en: 'Bronze trigger locks appear in the archaeological record by the mid-first millennium BCE and are widespread in Warring States graves. The lock — a housing, nut, sear, and hanging trigger — made a powerful shot possible with less lifetime training than a composite bow. Qin-era triggers from the Terracotta Army (slightly later, but the same craft) show batch production and interchangeable parts. That is industry, not a one-off masterpiece.',
      zh: '青铜弩机在公元前一千年中叶已有出土，战国墓葬中已较常见。郭、牙、牛、悬刀组成的机件，使较强的发射不必依赖如复合弓那样长年的训练。秦始皇陵兵马俑中的弩机（略晚，但是同一工艺传统）显示出分批生产与零件可互换。这是工业，而不是孤品。',
    },
    note: {
      en: 'The wooden bows and stocks rarely survive; the bronze locks do. Open the mechanism to see why it mattered.',
      zh: '木弓与弩臂大多不存，青铜机件仍在。打开机件，才能看到它何以重要。',
    },
  },
  {
    id: 'jian',
    kicker: { en: 'Sidearm  ·  iron jian  铁剑', zh: '短兵  ·  铁剑' },
    title: { en: 'Iron in the late period', zh: '战国晚期的铁' },
    short: { en: 'Iron jian  剑', zh: '铁剑' },
    body: {
      en: 'Bronze never disappears, but by the late Warring States iron and steel blades are widespread in many regions. A straight double-edged jian is shown here as a typological stand-in, not a named excavated sword. The historical point is access: a territorial state that can put serviceable iron into many hands has a different war economy from one that cannot.',
      zh: '青铜并未退出，但战国晚期许多地区铁与钢刃已经普及。这里的直刃双锋剑是类型学上的示意，不是某把有名的出土器。真正的历史要点是供给能力：一个能把可用铁器交到许多人手中的领土国家，其战争经济与不能如此的国家不同。',
    },
    note: {
      en: 'No single blade is treated as a talisman. The argument is metallurgy at scale.',
      zh: '不以某一柄剑为神器。要论证的是规模化的金属工艺。',
    },
  },
  {
    id: 'cavalry',
    kicker: { en: 'Reform  ·  307 BCE', zh: '改革  ·  前307年' },
    title: { en: 'King Wuling of Zhao', zh: '赵武灵王胡服骑射' },
    short: { en: 'Zhao cavalry  307 BCE', zh: '胡服骑射' },
    body: {
      en: 'In 307 BCE King Wuling of Zhao adopted Hu-style dress and mounted archery (hufu qishe), chiefly to fight northern peoples and the state of Zhongshan. Cavalry does not replace the infantry-crossbow core; it adds a mobile arm to a territorial army already built on registers and ranks. The short bow on the stand is a typological piece for that reform.',
      zh: '前307年，赵武灵王推行胡服骑射，主要用以应对北方族群与中山。骑兵并未取代步兵-弩兵的主体，而是给已经建立在户籍与阵列之上的领土军队增加了机动力量。架上的短弓是这一改革的类型学示意。',
    },
    note: {
      en: 'Dated and local: a court reform in Zhao, not a timeless Chinese essence.',
      zh: '这是有年代、有地点的赵国朝政改革，不是抽象的民族特质。',
    },
  },
];

export const TIMELINE_EVENTS = [
  { year: -475, label: { en: 'c. 475  Warring States (conventional start)', zh: '约前475  战国（习惯起始）' }, short: { en: '475  Warring States', zh: '前475  战国' } },
  { year: -431, label: { en: '431–404  Peloponnesian War', zh: '前431–前404  伯罗奔尼撒战争' }, short: { en: '431  Peloponnesian War', zh: '前431  伯罗奔尼撒' } },
  { year: -403, label: { en: '403  Partition of Jin recognized', zh: '前403  周室承认三家分晋' } },
  { year: -356, label: { en: 'c. 356  Shang Yang reforms in Qin', zh: '约前356  秦商鞅变法' } },
  { year: -334, label: { en: '334–323  Alexander in Asia', zh: '前334–前323  亚历山大亚洲之役' }, short: { en: '334  Alexander', zh: '前334  亚历山大' } },
  { year: -326, label: { en: '326  Hyphasis; Nanda reports', zh: '前326  希法西斯河；难陀传闻' } },
  { year: -307, label: { en: '307  Zhao cavalry reform', zh: '前307  赵武灵王胡服骑射' }, short: { en: '307  Zhao cavalry', zh: '前307  胡服骑射' } },
  { year: -264, label: { en: '264  First Punic War begins (late overlap)', zh: '前264  第一次布匿战争开始（末期重叠）' } },
  { year: -260, label: { en: '260  Changping', zh: '前260  长平之战' }, short: { en: '260  Changping', zh: '前260  长平' } },
  { year: -221, label: { en: '221  Qin unification', zh: '前221  秦统一' }, short: { en: '221  Unification', zh: '前221  统一' } },
];

export const FORMATIONS = [
  {
    id: 'sicily',
    count: 27,
    unit: 1000,
    kind: 'estimate',
    title: { en: 'Athens, Sicily 415 BCE', zh: '雅典西西里远征，前415' },
    short: { en: 'Athens  415 BCE  ·  27,000', zh: '雅典  前415  ·  2.7万' },
    caption: {
      en: 'First wave, modern estimate ≈ 27,000 including crews. Hoplites at landing: 5,100.',
      zh: '第一波现代估计约2.7万（含桨手）。登陆重装步兵：5,100。',
    },
  },
  {
    id: 'alexander',
    count: 47,
    unit: 1000,
    kind: 'estimate',
    title: { en: 'Alexander, Gaugamela 331 BCE', zh: '亚历山大，高加米拉，前331' },
    short: { en: 'Alexander  331 BCE  ·  47,000', zh: '亚历山大  前331  ·  4.7万' },
    caption: {
      en: 'Modern estimates often near 47,000. Crossing figures in 334 are commonly 30,000–47,000.',
      zh: '现代估计常约4.7万。前334年渡海兵力通常作3.0–4.7万。',
    },
  },
  {
    id: 'rome',
    count: 20,
    unit: 1000,
    kind: 'estimate',
    title: { en: 'Rome, consular army (mid-Republic)', zh: '罗马执政官军队（共和中期）' },
    short: { en: 'Rome · 16–20,000 (upper bound shown)', zh: '罗马 · 1.6–2万（图示上限）' },
    caption: {
      en: 'Typical two legions plus allies, often ≈ 16,000–20,000. Larger efforts could exceed 40,000. Dated only where chronology overlaps.',
      zh: '典型为两个军团加盟军，约1.6–2.0万。更大行动可超过4万。仅在年代重叠处引入。',
    },
  },
  {
    id: 'qin-claim',
    count: 600,
    unit: 1000,
    kind: 'claim',
    title: { en: 'Chinese narrative claims', zh: '中国文献中的记载' },
    short: { en: 'Wang Jian against Chu · Shiji: 600,000', zh: '王翦攻楚 ·《史记》记六十万' },
    caption: {
      en: 'Shiji and related texts speak of 100,000–600,000 (e.g. a 600,000-man Qin expedition against Chu in 224 BCE). Shown hatched: a source claim, not a verified muster.',
      zh: '《史记》等文献出现十万至六十万（如前224年王翦攻楚号称六十万）。以阴影表示：这是文献记载，不是已核实的名册。',
    },
  },
];

export const INSTITUTION_PANELS = [
  {
    id: 'registers',
    title: { en: 'Household registers', zh: '户籍' },
    body: {
      en: 'States enrolled households so that taxes, labor service, and military duty could be levied in predictable quotas. This is the precondition for armies that can be replaced, not only gathered once.',
      zh: '国家编户齐民，使赋税、徭役与兵役可以按配额征发。这是军队能够被补充、而不只是一次性聚集的前提。',
    },
  },
  {
    id: 'granaries',
    title: { en: 'Granaries', zh: '粮仓' },
    body: {
      en: 'Stored grain turns a seasonal levy into a campaign that can last through a year or several years. Long wars are a logistics achievement before they are a battlefield achievement.',
      zh: '仓储把季节性征发变成可以跨越一年乃至数年的战役。长期战争首先是后勤成就，然后才是战场成就。',
    },
  },
  {
    id: 'counties',
    title: { en: 'County administration', zh: '县制' },
    body: {
      en: 'The xian (county) brought extraction and conscription down to a local office answerable to the court. Qin’s reforms are the best documented; the pattern is wider than Qin.',
      zh: '县把征收与征兵下沉到对朝廷负责的地方官署。秦的改革记载最清楚，但这一格局并不限于秦。',
    },
  },
  {
    id: 'conscription',
    title: { en: 'Mass conscription', zh: '大规模征兵' },
    body: {
      en: 'Infantry and crossbow ranks, not a thin chariot aristocracy, become the core. The visual of the next beat — weapons made in batches — belongs with this social fact.',
      zh: '步兵与弩兵阵列成为主体，而不再是稀薄的贵族车战。下一节将看到的批量兵器，与这一社会事实是一体的。',
    },
  },
];

export const CHANGPING = {
  facts: [
    {
      title: { en: 'The campaign', zh: '战役过程' },
      body: {
        en: 'In 260 BCE Qin and Zhao fought a protracted campaign at Changping (near present-day Gaoping, Shanxi). After a stalemate under Lian Po, Zhao Kuo took command, the Qin army under Bai Qi cut Zhao’s supply, and the Zhao force was starved, then broken.',
        zh: '前260年，秦、赵在长平（今山西高平一带）长期对峙。廉颇持重相持后，赵括接掌指挥；白起率秦军切断赵军补给，赵军饥饿后被击溃。',
      },
    },
    {
      title: { en: 'What the Shiji claims', zh: '《史记》的记载' },
      body: {
        en: 'Sima Qian records that 400,000 Zhao soldiers surrendered and were killed, with 240 youths spared. The number has been famous — and doubted — for centuries.',
        zh: '司马迁记载赵卒四十万降而尽杀，仅二百四十名少年得免。这一数字流传极广，也被怀疑了极久。',
      },
    },
    {
      title: { en: 'What scholarship allows', zh: '研究能够承认的' },
      body: {
        en: 'Since the 1990s, excavations have found male skeletons with sharp-force injuries, consistent with a massacre, but not with a burial of 400,000. Many modern historians treat the figure as rhetorical inflation; a few argue it is not impossible if “soldiers” is defined very broadly. This chapter does not choose a replacement number.',
        zh: '1990年代以来的发掘出土了带锐器伤的男性骸骨，与屠杀相符，但远不足以对应四十万丛葬。许多现代史家视其为修辞性夸大；也有学者认为，若“卒”的定义极宽，数字未必不可能。本章不另造一个替代数字。',
      },
    },
  ],
};

export const SOURCE_SECTIONS = [
  {
    title: { en: 'A standing caution', zh: '一条总的审慎原则' },
    paragraphs: [
      {
        en: 'Ancient army totals are a poor kind of fact. Chroniclers inherited round numbers, used them as rank-labels, and sometimes inflated them for praise or terror. This chapter therefore prefers duration, institutions, archaeology, and conservative modern estimates. Where a famous ancient figure is shown, it is labeled as a source claim.',
        zh: '古代兵力数字是一种脆弱的“事实”。史家承袭整数，或用其表示编制层级，或为颂扬与震慑而夸大。故本章更重战争持续时间、制度、考古与审慎的现代估计。凡出示著名古代数字，皆标明为文献记载。',
      },
    ],
  },
  {
    title: { en: 'Primary and near-primary sources', zh: '基本文献' },
    items: [
      {
        en: 'Sima Qian, Shiji (Records of the Grand Historian), especially the biographies of Bai Qi and Wang Jian, and the basic annals of Qin — for the narrative of Changping, the 400,000 figure, and later claims such as the 600,000-man expedition against Chu (224 BCE).',
        zh: '司马迁《史记》，尤白起、王翦列传及秦本纪：长平叙事与四十万之数，以及其后如前224年王翦攻楚六十万等记载。',
      },
      {
        en: 'Thucydides, History of the Peloponnesian War, Book 6 — order of battle for the Sicilian expedition of 415 BCE (5,100 hoplites at the outset; ships and crews).',
        zh: '修昔底德《伯罗奔尼撒战争史》卷六：前415年西西里远征的兵力编成（最初重装步兵5,100，以及船队与桨手）。',
      },
      {
        en: 'Arrian, Anabasis; Diodorus Siculus, Book 17; and the authorities quoted by Plutarch — for Alexander’s crossing strength (commonly 30,000–47,000 in modern synthesis).',
        zh: '阿利安《亚历山大远征记》、狄奥多罗斯第十七卷，以及普鲁塔克所引各家：亚历山大渡海兵力（现代综合通常作3.0–4.7万）。',
      },
      {
        en: 'Quintus Curtius Rufus, Diodorus, and Plutarch, Life of Alexander 62 — Greek and Latin reports of Nanda strength (200,000 infantry, with diverging cavalry, chariot, and elephant figures).',
        zh: '库尔提乌斯、狄奥多罗斯，以及普鲁塔克《亚历山大传》第62节：希腊罗马文献中难陀兵力（步兵二十万，骑兵、战车与象军数字有分歧）。',
      },
    ],
  },
  {
    title: { en: 'Archaeology and institutions', zh: '考古与制度' },
    items: [
      {
        en: 'Bronze crossbow trigger locks from Warring States burials; metrical study of Qin triggers from the Terracotta Army pits (batch production, standardized parts) — e.g. work associated with the Museum of the Terracotta Army / UCL Institute of Archaeology on Qin craft organization.',
        zh: '战国墓葬出土青铜弩机；秦始皇陵兵马俑坑弩机的计量研究（分批生产、零件标准化）——如秦俑博物馆与伦敦大学学院考古所等关于秦工艺组织的研究。',
      },
      {
        en: 'Changping site archaeology near Gaoping, Shanxi, from the mid-1990s onward, including the 1995 excavation at Yonglu and later reports: remains of a major engagement and skeletons with weapon trauma; not a burial on the scale of the Shiji total (Shi and Song, 1996, and later reports).',
        zh: '山西高平一带长平遗址自1990年代中期以来的考古，包括1995年永录发掘及后续报告：大规模交战遗存与带兵器创伤的骸骨；并不能对应《史记》所载规模的丛葬（如石卫国、宋建忠等1996年及后续报告）。',
      },
      {
        en: 'Qin documentary evidence for administration and long service, including the Liye Qin slips, used by historians to discuss conscription, garrisons, and logistics (see, among others, work in the Journal of Chinese Military History).',
        zh: '反映行政与兵役的秦代文书，包括里耶秦简，史家用以讨论征发、戍守与后勤（可参《中国军事史期刊》Journal of Chinese Military History 等研究）。',
      },
    ],
  },
  {
    title: { en: 'Modern discussions used for framing', zh: '用于定调的现代讨论' },
    items: [
      {
        en: 'Mark Edward Lewis and others on the Warring States fiscal-military state, mass infantry, and the need to read narrative army sizes as relative rather than absolute (see also the cautions summarized in standard surveys of Warring States military history).',
        zh: '陆威仪（Mark Edward Lewis）等关于战国财政-军事国家、步兵主体，以及应将文献兵力视为相对而非绝对数字的讨论（亦见战国军事史综述中的惯常审慎）。',
      },
      {
        en: 'On Changping specifically: long-standing skepticism of the 400,000 figure (already in Zhu Xi; modern treatments include Lan 1979 and later Chinese scholarship; a 2017 discussion in Journal of Chinese Military History reviews the doubt and the archaeology). A 2025 study in the same field continues to treat the campaign as historically major while re-examining the language of kengsha.',
        zh: '关于长平：对四十万数字的怀疑由来已久（朱熹已疑之；现代如蓝永蔚1979及此后中文研究；2017年《中国军事史期刊》一文回顾了怀疑与考古）。近年研究仍视此役为重大战役，同时重新检讨“坑杀”的语义。',
      },
      {
        en: 'On Mediterranean and Near Eastern numbers: conservative modern ranges for Alexander; skeptical treatment of Herodotus on Xerxes (logistical readings that allow tens of thousands of combatants, not millions). Mid-Republican Roman figures follow standard accounts of the manipular consular army in the Samnite and early Punic period.',
        zh: '关于地中海与近东数字：对亚历山大取审慎现代区间；对希罗多德所记薛西斯取怀疑态度（后勤视角允许数万作战部队，而非百万）。罗马共和中期数字依据萨莫奈战争与布匿战争初期执政府军团（中队战术）的标准叙述。',
      },
    ],
  },
  {
    title: { en: 'Research used in this commentary', zh: '用于本次解说的研究文献' },
    items: [
      {
        en: 'Mark Edward Lewis, Sanctioned Violence in Early China (SUNY, 1990); also his discussions of Warring States political and military institutions in the Cambridge History of Ancient China.',
        zh: '陆威仪（Mark Edward Lewis），Sanctioned Violence in Early China（纽约州立大学出版社 SUNY，1990）；以及他在 Cambridge History of Ancient China 中关于战国政治与军事的讨论。',
      },
      {
        en: 'Victoria Tin-bor Hui, War and State Formation in Ancient China and Early Modern Europe (Cambridge University Press, 2005); and “Toward a Dynamic Theory of International Politics,” International Organization 58.1 (2004). Her European comparison is mainly with early modern Europe. It is used here for the argument about the Chinese system and Qin’s stratagems, not as a contemporaneous parallel with Republican Rome.',
        zh: '许田波（Victoria Tin-bor Hui），War and State Formation in Ancient China and Early Modern Europe（剑桥大学出版社，2005）；以及 “Toward a Dynamic Theory of International Politics,” International Organization 58.1（2004）。需要说明：她的欧洲对照主要是近代早期欧洲。本章借用来讨论中国国家体系与秦的谋略，不是把共和罗马当作同时代对照。',
      },
      {
        en: 'Yuri Pines and related work on Shang Yang and the Book of Lord Shang, including his chapter on Warring States institutional reforms in the Oxford Handbook.',
        zh: '尤锐（Yuri Pines）及有关商鞅与《商君书》的研究，包括他在牛津手册（Oxford Handbook）中关于战国制度改革的章节。',
      },
      {
        en: 'Joseph Needham and Robin D. S. Yates, Science and Civilisation in China, Vol. 5, Part 6: Military Technology: Missiles and Sieges (Cambridge, 1994), on military writing and the crossbow.',
        zh: '李约瑟（Joseph Needham）与叶山（Robin D. S. Yates），Science and Civilisation in China 第五卷第六分册 Military Technology: Missiles and Sieges（剑桥，1994），涉及兵书传统与弩。',
      },
      {
        en: 'David Williams, “Mass-Produced Pre-Han Chinese Bronze Crossbow Triggers,” Arms & Armour 5.2 (2008), discussing interchangeable manufacture (after Yates 2007); and the metrical and craft-organization study of Terracotta Army bronze triggers by Li, Bevan, and colleagues, published in Antiquity.',
        zh: 'David Williams，“Mass-Produced Pre-Han Chinese Bronze Crossbow Triggers，” Arms & Armour 5.2（2008），讨论可互换制造（在 Yates 2007 之后）；以及 Li、Bevan 等对兵马俑坑青铜弩机的计量与工艺组织研究（发表于 Antiquity）。',
      },
      {
        en: 'On iron: work by Yaxiong Liu, including the UCL dissertation Iron production in the state of Qin during the Warring States period, and Liu & Wood in Internet Archaeology 69, on the coexistence of bloomery and cast iron and on cast iron’s role in mass-producing tools. This chapter does not claim that Chinese swords were universally superior.',
        zh: '关于冶铁：Yaxiong Liu 的研究，包括其伦敦大学学院学位论文 Iron production in the state of Qin during the Warring States period，以及 Liu 与 Wood 发表于 Internet Archaeology 第69期的讨论，指出块炼铁与生铁铸造可以并存，并强调生铁在批量生产工具中的作用。本章并不主张中国刀剑必然更锋利。',
      },
      {
        en: 'Ralph D. Sawyer, The Seven Military Classics of Ancient China, for the received grouping of the military canon. The Song-dynasty canon itself is not back-dated here as a Warring States institution.',
        zh: 'Ralph D. Sawyer，The Seven Military Classics of Ancient China，用于说明后世所见的“武经”分组。宋代武经本身不在此提前写成战国制度。',
      },
    ],
  },
  {
    title: { en: 'Dating notes', zh: '年代说明' },
    paragraphs: [
      {
        en: '“Warring States” is given here as c. 475–221 BCE, a common textbook framing. 403 BCE is a strong alternative start, and nothing in the argument depends on the earlier date alone. Cannae (216 BCE) and later Punic set pieces are after Qin unification and are excluded from the contemporaneous comparison.',
        zh: '本章取约前475–前221年为“战国”，此为常见教材分期。前403年是有力的另一起点，论证并不单独依赖更早的年代。坎尼（前216）及此后布匿战争场面已在秦统一之后，不纳入同时代比较。',
      },
    ],
  },
];

