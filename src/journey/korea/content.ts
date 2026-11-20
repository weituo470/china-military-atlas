/** Chapter metadata and legacy recording scripts. Display prose lives in reading-copy.json. */
import reading from './reading-copy.json'
import { PROJECT_NAME } from '../../brand'
import { BEAT_COUNT } from './sites'
import type { JourneyBeat, Localized } from '../types'

export const JOURNEY_META = {
  id: 'korea' as const,
  queryValue: 'korea',
  title: { en: 'Resist US Aggression and Aid Korea', zh: '抗美援朝' } satisfies Localized,
  window: { en: '1950–1953', zh: '1950–1953年' } satisfies Localized,
}

export const UI = {
  brandKicker: PROJECT_NAME,
  brandTitle: { en: 'Resist US Aggression and Aid Korea', zh: '抗美援朝' } satisfies Localized,
  exit: { en: 'Exit journey', zh: '退出导览' } satisfies Localized,
  enter: { en: 'This chapter', zh: '进入本导览' } satisfies Localized,
  enterForce: { en: 'Chapter I: Warring States', zh: '第一章：战国' } satisfies Localized,
  enterKorea: { en: 'Resist US Aggression and Aid Korea', zh: '抗美援朝' } satisfies Localized,
  reenter: { en: 'Re-enter the journey', zh: '再次进入导览' } satisfies Localized,
  sourcesBtn: { en: 'Sources', zh: '史料与注释' } satisfies Localized,
  sourcesKicker: { en: 'Notes for judges and readers', zh: '供评委与读者核对' } satisfies Localized,
  sourcesTitle: { en: 'Sources & cautions', zh: '史料与审慎说明' } satisfies Localized,
  close: { en: 'Close', zh: '关闭' } satisfies Localized,
  langEn: 'EN',
  langZh: '中文',
  languageLabel: { en: 'Language', zh: '语言' } satisfies Localized,
  hints: {
    en: '0–6 jump beats   ·   ← → change beat   ·   Space play/pause   ·   Drag the globe   ·   Click a site or mark   ·   Esc to exit',
    zh: '0–6 跳转段落   ·   ← → 切换段落   ·   空格播放或暂停   ·   拖动地球   ·   点击地点或标记   ·   Esc 退出',
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
    en: 'Schematic / typological — not exact campaign routes or a troop census.',
    zh: '示意 / 类型学，并非精确进军路线，也不是兵力普查。',
  } satisfies Localized,
  illustrationCaution: {
    en: 'Illustration · not an archival photo',
    zh: '照片风格示意 · 非历史原照',
  } satisfies Localized,
  briefingRoll: { en: 'Operations brief', zh: '作战简报' } satisfies Localized,
  comparisonReady: {
    en: 'An armistice, not a peace treaty.',
    zh: '停战协定不等于和平条约。',
  } satisfies Localized,
  clickSites: {
    en: 'Click a campaign site, equipment mark, or place-name on the globe.',
    zh: '可点击地球上的战役地点、装备标记或地名。',
  } satisfies Localized,
}

export const BEATS = [
  {
    id: 'hook',
    name: reading.hook.chapter,
    kicker: reading.hook.chapter,
    title: reading.hook.sections[0].title,
    body: reading.hook.sections[0].body,
    narration: {
      en: [
        "Look at the Korean Peninsula. Set the clock to 1950. Remember four sentences first: we did not start this war on the peninsula; we warned before we entered, and the warning was treated as a bluff; we did not fight because we had better guns; and we pushed the best-equipped army on earth from the Yalu back near the 38th parallel.",
        "When war broke out on 25 June 1950, the People’s Republic was less than a year old. By 19 October, when the Chinese People’s Volunteer Army began crossing the Yalu, it had passed its first anniversary. The decision was a state decision, and the cost would be borne by the state. The force was called a volunteer army to avoid a formal declaration of war with the United States, but sending it was a decision of the state.",
        "For listeners abroad, this is not a campaign chronology, and not a contest of raw numbers. It is four questions: why we fought, how we could fight at all, what we had to overcome, and what results appeared that should not have appeared, given the equipment gap.",
      ],
      zh: [
        "请看朝鲜半岛。把时间拨到一九五〇年。先记住四句话：我们不是这场半岛战争的发起者；出兵前先作了警告，却被当成虚声恫吓；我们不是靠更好的枪去打；我们把当时世界上装备最强的军队，从鸭绿江打回到三八线附近。",
        "六月二十五日，半岛战争爆发时，新中国成立还不满一年。到十月十九日，志愿军开始渡过鸭绿江时，新中国已过了一周岁生日。决定是国家作出的，代价也要由国家承担。部队叫“志愿军”，是为了避免与美国正式宣战，但出兵是国家决策。",
        "对外国听众，我们要讲的不是战役年表，也不是比谁的数字更大。是四个问题：我们为什么打，凭什么打，克服了哪些困难，又创造了哪些按装备对比本不该出现的结果。",
      ],
    },
  },
  {
    id: 'why',
    name: reading.why.chapter,
    kicker: reading.why.chapter,
    title: reading.why.sections[0].title,
    body: reading.why.sections[0].body,
    narration: {
      en: [
        "When the war broke out on the peninsula on 25 June 1950, the People’s Republic was less than a year old. What it wanted most was to build, not to fight another war. On 27 June, in one and the same statement, Truman ordered US forces into Korea and sent the Seventh Fleet into the Taiwan Strait. For Beijing, these were not two unrelated moves.",
        "After the Incheon landing, UN Command crossed the 38th parallel and drove toward the Yalu. On 3 October, Zhou Enlai told the Indian ambassador, Panikkar, to pass this to the American side: if US troops crossed the 38th and widened the war, “we will not sit idly by; we will intervene.” The warning reached Washington the same day. It was treated as a bluff.",
        "In a telegram to Zhou on 13 October, Mao put the stakes without leftover room: we should enter, we must enter; it would be greatly advantageous for China, for Korea, for the East, and for the world. If we did not send troops and let the enemy press up to the Yalu, the Northeast would be the first to suffer. We entered after the warning was ignored, when the fighting had already reached our door.",
      ],
      zh: [
        "一九五〇年六月二十五日，战争在半岛爆发时，新中国成立还不满一年。它最想要的是建设，不是再打一仗。六月二十七日，杜鲁门在同一份声明里，下令美军介入朝鲜，并派第七舰队进入台湾海峡。对北京来说，这不是两件不相干的事。",
        "仁川登陆以后，联合国军越过三八线，向鸭绿江推进。十月三日，周恩来经印度驻华大使潘尼迦转告美方：美军如果越过三八线扩大战争，“我们不能坐视不顾，我们要管。”这份警告当天到了华盛顿，却被看成吓唬人。",
        "毛泽东在十月十三日给周恩来的电报里把利害说死了：应当参战，必须参战；对中国、对朝鲜、对东方、对世界都极为有利。不出兵，让敌人压到鸭绿江边，首先对东北更不利。我们是在警告被忽略之后，在战争已经顶到国门的时候，才进去的。",
      ],
    },
  },
  {
    id: 'means',
    name: reading.means.chapter,
    kicker: reading.means.chapter,
    title: reading.means.sections[0].title,
    body: reading.means.sections[0].body,
    narration: {
      en: [
        "We did not fight because we had better guns. One layer is the reason: the warning came first, and the defense of the homeland came after — this was not an army that appeared out of nowhere. The other layer is the capacity: these soldiers had just come through the War of Resistance against Japan and the civil war. They already knew how to fight at night, up close, in the mountains, and how to stay alive without control of the sky.",
        "By day, the sky was not ours. A line in the documentary Duan Dao, “Broken Blade,” puts it plainly: they “only owned the moon.” Before the war, Deng Hua already stressed that the fight had to be settled at close range, where tanks and heavy guns could not work as they were designed to. Once the two sides were locked together, aircraft could not bomb freely at low altitude, and artillery could not safely pour fire into a melee.",
        "On 13 October the Politburo asked a hard question: if Soviet air cover could not arrive in time, should China still go in? The answer was yes. Arms later improved. But the weeks that reversed the campaign were carried mainly by light infantry, terrain, night, and resolve — not by matching steel.",
      ],
      zh: [
        "凭什么打，不是因为枪更好。一层是理由：警告在先，国防在后，不是突然从天而降的军队。另一层是能力：部队刚打完抗日战争和解放战争，习惯夜战、近战、山地机动，也习惯在没有制空权时活下来。",
        "白天的天空不是我们的。《断刀》里有一句形象的话，叫“只拥有月亮”。邓华在战前就强调，要在近距离解决战斗，让坦克和大炮发挥不出威力。一接近，飞机就不好低飞乱炸，炮兵也不敢向混战区倾泻火力。",
        "十月十三日，政治局讨论的是：苏联空军不能及时掩护，还打不打。结论是还要打。后来才有装备补强，但扭转战局的那几周，主要靠的是轻步兵、地形、夜色和决心，不是对等的钢铁。",
      ],
    },
  },
  {
    id: 'hardship',
    name: reading.hardship.chapter,
    kicker: reading.hardship.chapter,
    title: reading.hardship.sections[0].title,
    body: reading.hardship.sections[0].body,
    narration: {
      en: [
        "On paper, almost every condition was a shortfall: no control of the air, no control of the sea, few guns and vehicles, and a supply line exposed to the other side’s aircraft. The original plan — to hold a line in the north, re-equip for about six months, then fight — was overtaken as soon as the army crossed the river. In the first campaign, the 38th Army was delayed on the Xichuan axis, and Peng Dehuai was furious. Crossing the Yalu was not an unbroken string of successes.",
        "The grain and ammunition a soldier carried often lasted only about five to seven days. The other side soon learned this, and used what was later called “magnetic tactics” to fight inside that supply window. In the east there was also the winter cold. To keep going, the army had to change the rules: march at night, fight at night, repair and haul under air interdiction, and post anti-aircraft sentries along the roads.",
        "In the later stalemate the method changed again: tunnel defense, and “nibble the taffy” — small annihilation fights, not the fantasy of swallowing a heavy group in one bite. Open military newspapers have given this kind of comparison: the guns of one PVA army were only a little more than half those of a US division, and they were older, more mixed, and shorter on ammunition. I will not invent headcounts, and I will not turn casualties into a spectacle on the globe.",
      ],
      zh: [
        "纸面上几乎全是短板：没有制空权，也没有制海权，火炮和车辆少，补给线暴露在对方飞机底下。原定在北线设防、换装大约半年再打的计划，一过江就来不及了。第一次战役里，第三十八军在熙川方向延误，彭德怀震怒。不是一过江就无往不利。",
        "战士身上背的粮弹，往往只能维持大约五到七天。对手很快摸到这一点，用所谓“磁性战术”打你的补给窗口。东线还有严寒。要打下去，就得改规则：夜间行军，夜间作战，在空中绞杀之下抢修抢运，还设立了防空哨。",
        "相持阶段又改成坑道防御和“零敲牛皮糖”，打小歼灭战，不再幻想一口吃掉重兵集团。公开军报里有过这样的对比：一个军的火炮，大约只相当于美军一个师的一半出头，而且还更杂、更旧、弹药更少。人数我不会随口报，也不把伤亡数字做成画面上的奇观。",
      ],
    },
  },
  {
    id: 'unexpected',
    name: reading.unexpected.chapter,
    kicker: reading.unexpected.chapter,
    title: reading.unexpected.sections[0].title,
    body: reading.unexpected.sections[0].body,
    narration: {
      en: [
        "Hundreds of thousands of troops crossed the river at night, in secret. For a long time the other side did not judge the scale. That is an operational effect of concealment, not a myth.",
        "MacArthur was still preparing to have the soldiers home by Christmas. In the second campaign, the 113th Division of the 38th Army force-marched more than 140 Chinese li in about fourteen hours, seized Sansoli ahead of the enemy, then pushed toward Longyuanli, and cut the withdrawal road of a mechanized force. Peng Dehuai wrote: “Long live the Chinese People’s Volunteer Army! Long live the 38th Army!”",
        "In a matter of weeks the front moved from the Yalu back near the 38th parallel. Please read this as a schematic of approach, infiltration, and cutting a line of retreat — not as a precise reconstruction of force strengths. For listeners abroad, this is not the occupation of all Korea. It is this: a state barely one year old, clearly behind in equipment, stopped the strongest army on earth from remaining at its door.",
      ],
      zh: [
        "数十万部队在夜间秘密过江，对手很长时间没有判断出规模。这是隐蔽带来的作战效果，不是神话。",
        "麦克阿瑟还在准备让士兵回家过圣诞。第二次战役里，第三十八军第一一三师大约十四个小时强行军一百四十余华里，先敌抢占三所里，再插向龙源里，把机械化部队的退路切断。彭德怀写下：“中国人民志愿军万岁！三十八军万岁！”",
        "战线在数周内，从鸭绿江回到三八线附近。请把它看成接近、穿插、切断退路的示意，不是精确的兵力复原图。对外国听众，这不是占领了整个朝鲜，而是：一个成立才一年、装备明显落后的国家，把当时世界上最强的军队，挡在了家门口之外。",
      ],
    },
  },
  {
    id: 'world',
    name: reading.world.chapter,
    kicker: reading.world.chapter,
    title: reading.world.sections[0].title,
    body: reading.world.sections[0].body,
    narration: {
      en: [
        "Two days after the war broke out, the US Seventh Fleet entered the Taiwan Strait. The window for armed liberation of Taiwan was closed, and the confrontation across the strait became a long-term condition. The question of China’s seat at the United Nations was frozen until 1971.",
        "Japan, through special procurement, the San Francisco peace, and the US–Japan security treaty, was folded into America’s western Pacific line. Farther away, the war also drove a large American military buildup, and NATO changed from a looser undertaking into a more substantial military alliance.",
        "On 27 July 1953 the armistice was signed at Panmunjom. It is an armistice, not a peace treaty, and the peninsula is still under an armistice system. In a report on 12 September that year, Peng Dehuai said: the age when Western aggressors could occupy a country in the East merely by planting a few cannons on a coast was gone, never to return.",
      ],
      zh: [
        "战争爆发两天后，美国第七舰队进入台湾海峡。武力解放台湾的窗口被关上，两岸对峙由此长期化。中国在联合国的席位问题，也被冻结到一九七一年。",
        "日本则靠特需、对日媾和与美日安保，被编入美国的西太平洋防线。在更远的地方，这场战争也推动美国大幅扩军，北约从较松散的约定，变成更实质性的军事同盟。",
        "一九五三年七月二十七日，停战协定在板门店签字。这是停战，不是和平条约，半岛至今仍是停战体制。彭德怀在当年九月十二日的报告里说：西方侵略者几百年来只要在东方一个海岸上架起几尊大炮就可以霸占一个国家的时代，一去不复返了。",
      ],
    },
  },
  {
    id: 'close',
    name: reading.close.chapter,
    kicker: reading.close.chapter,
    title: reading.close.sections[0].title,
    body: reading.close.sections[0].body,
    narration: {
      en: [
        "The military demarcation line runs near the 38th parallel; it is not identical with it. The political division of the peninsula did not end there.",
        "What the record can defend is not a myth, and not a wager between competing tallies. It is the answers to four questions: why we fought, how we could fight, what we overcame, and which results appeared that should not have appeared, given the equipment gap.",
        "Look once more at Panmunjom: the agreement signed here was an armistice, not a peace treaty. The line on the map is the military demarcation line, not the 38th parallel.",
      ],
      zh: [
        "军事分界线靠近三八线，并不与它重合。半岛的政治分裂，并没有就此结束。",
        "文献能够站得住的，不是神话，也不是把各方数字拿来对赌。而是这四个问题的答案：为什么打，凭什么打，克服了什么，以及出现了哪些按装备对比本不该出现的结果。",
        "最后再看一眼板门店：在这里签下的是停战协定，不是和平条约。地图上划出的是军事分界线，并不与三八线重合。",
      ],
    },
  },
] as const satisfies readonly JourneyBeat[]

const _beatsMatchStaging: typeof BEATS.length extends typeof BEAT_COUNT
  ? typeof BEAT_COUNT extends typeof BEATS.length ? true : never
  : never = true
void _beatsMatchStaging

export const SITE_CARDS = [
  {
    id: 'yalu',
    kind: 'site' as const,
    kicker: { en: "China–Korea border · October 1950", zh: "中朝边境 · 1950年10月" },
    title: { en: "Crossing the Yalu", zh: "渡过鸭绿江" },
    body: { en: "Andong, now Dandong, stands across the river from Sinuiju. On the evening of 19 October 1950, the first Chinese volunteer units began entering Korea at several points along the Yalu.", zh: "江北的安东（今丹东）与江南的新义州隔水相望。1950年10月19日晚，首批中国人民志愿军从鸭绿江沿岸多处进入朝鲜。" },
    note: { en: "The marker shows the Dandong–Sinuiju area, not a single crossing used by every unit.", zh: "图上标出丹东与新义州一带，并不表示所有部队都在此处过江。" },
  },
  {
    id: 'incheon',
    kind: 'campaign' as const,
    kicker: { en: 'Incheon  ·  15 September 1950', zh: '仁川  ·  一九五〇年九月十五日' },
    title: { en: 'The Incheon landing', zh: '仁川登陆' },
    body: {
      en: 'UN Command, under General Douglas MacArthur, landed at Incheon (仁川) on 15 September 1950. It is presented here as an operational surprise that reversed the campaign in the south, shown typologically, not ship by ship.',
      zh: '一九五〇年九月十五日，联合国军在麦克阿瑟指挥下于仁川登陆。这里把它作为扭转南部战局的战役突然性来介绍，只作类型学示意，不是逐舰复原。',
    },
    note: {
      en: 'See US official histories of the landing and the subsequent drive on Seoul. The pin is near Wolmido / Incheon on the present-day globe.',
      zh: '登陆及随后向汉城推进，见美国官方战史。钉位在今月尾岛 / 仁川一带。',
    },
  },
  {
    id: 'unsan',
    kind: 'campaign' as const,
    kicker: { en: 'Unsan  ·  Yunshan  ·  late October 1950', zh: '云山  ·  一九五〇年十月下旬' },
    title: { en: 'Unsan, typological', zh: '云山，类型学' },
    body: {
      en: 'The fighting at Unsan (云山) was among the first major encounters after the Volunteer Army entered Korea: approach, contact, and envelopment. It is a typological campaign mark, not a reconstruction of order-of-battle numbers.',
      zh: '云山之战是志愿军入朝后较早的大规模遭遇：接近、接敌与迂回包围。这是类型学战役标记，不是一份兵力编成复原。',
    },
    note: {
      en: 'Chinese campaign histories and US official narratives (including Appleman) both treat Unsan as a sudden and costly contact. They should be read side by side; this card does not adjudicate their figures.',
      zh: '中国战史与美国官方叙述（包括 Appleman）都把云山视为一次突然且代价沉重的接触。宜对照阅读；本卡不对各方数字作裁决。',
    },
  },
  {
    id: 'changjin',
    kind: 'campaign' as const,
    kicker: { en: 'Changjin  ·  Chosin  ·  winter 1950', zh: '长津湖  ·  一九五〇年冬' },
    title: { en: 'Changjin / the Chosin Reservoir', zh: '长津湖 / 长津水库' },
    body: {
      en: 'Changjin Lake is the Chosin Reservoir in Western accounts. Winter mountains, a strained supply line, contact, and withdrawal all belong to this typological picture. The pin is a site / representative coordinate, not a surveyed line of march.',
      zh: '长津湖在西方文献中常称作长津水库（Chosin Reservoir）。冬季山地、紧张的补给、接敌与撤离，都属于这幅类型学图景。钉位是遗址/代表性坐标，不是测过的进军轨迹。',
    },
    note: {
      en: 'The later withdrawal toward the coast (typologically marked at Hungnam) is shown as a bearing, not as a roster of the evacuation.',
      zh: '此后向海岸方向的撤离（在兴南作类型学标记）只表示方向，不是撤离名册。',
    },
  },
  {
    id: 'shangganling',
    kind: 'campaign' as const,
    kicker: { en: "Kumhwa area · autumn 1952", zh: "金化一带 · 1952年秋" },
    title: { en: "The heights at Shangganling", zh: "上甘岭的高地" },
    body: { en: "Even during negotiations, the heights near Kumhwa remained contested. Chinese histories call the fighting there in autumn 1952 the Shangganling campaign. English-language accounts often use the name Triangle Hill.", zh: "谈判期间，双方仍在争夺金化附近的高地。中国战史把这里1952年秋的战斗称为上甘岭战役，英文战史中常见“三角山”（Triangle Hill）这一地名。" },
    note: { en: "On a map of the whole peninsula, the contested hills occupy only a small area.", zh: "在全半岛的地图上，这片反复争夺的山地只占很小一块。" },
  },
  {
    id: 'panmunjom',
    kind: 'site' as const,
    kicker: { en: "Panmunjom · 27 July 1953", zh: "板门店 · 1953年7月27日" },
    title: { en: "Where was the armistice signed?", zh: "停战协定在哪里签署？" },
    body: { en: "Armistice talks began at Kaesong in July 1951 and later moved to Panmunjom. When the delegates signed here, fighting at the front had not yet stopped. The ceasefire took effect at 10 p.m. on 27 July 1953.", zh: "停战谈判于1951年7月在开城开始，后来转移到板门店。双方代表在这里签署协定时，前线的战斗还没有停止。停火从1953年7月27日晚十点开始。" },
    note: { en: "The present-day Joint Security Area is near the 1953 signing site; its buildings should not be mistaken for the original hall.", zh: "今天地图上的共同警备区在当年签字场址附近，两者不是同一座建筑。" },
  },
  {
    id: 'thirty-eighth',
    kind: 'site' as const,
    kicker: { en: 'The 38th parallel', zh: '三八线' },
    title: { en: 'A line that is near, not identical', zh: '靠近，并不重合' },
    body: {
      en: 'The 38th parallel was the 1945 occupation dividing line, and the war began across it. The 1953 military demarcation line came to rest near this latitude, cutting southwest to northeast. The mark on the globe is typological.',
      zh: '三八线是一九四五年的占领分界，战争也从这条线打起。一九五三年的军事分界线停在这条纬线附近，呈西南—东北走向。地球上的标记是类型学示意。',
    },
  },
  {
    id: 'peninsula',
    kind: 'site' as const,
    kicker: { en: "Korean Peninsula", zh: "朝鲜半岛" },
    title: { en: "From Pusan to the Yalu", zh: "从釜山到鸭绿江" },
    body: { en: "Pusan is at the southeastern tip; the Yalu forms the northwestern border. In a few months in 1950 the fighting moved from outside Pusan into mountains near China. The 1953 demarcation line lay between them, near the 38th parallel.", zh: "釜山在半岛东南端，鸭绿江在西北边境。1950年，战场在几个月里从釜山外围移到靠近中国边境的山地。1953年停战时，军事分界线却在这两处之间，靠近三八线。" },
  },
  {
    id: 'dandong',
    kind: 'site' as const,
    kicker: { en: "North bank of the Yalu", zh: "鸭绿江北岸" },
    title: { en: "Dandong was then called Andong", zh: "今天的丹东，当年的安东" },
    body: { en: "Supplies for Korea were assembled in northeastern China. Andong was a major crossing: bridges linked the railways on either bank, and air attacks could interrupt traffic on both sides.", zh: "运往朝鲜的物资先在中国东北集结，安东是重要的过江通道。桥梁把中国的铁路与朝鲜的铁路接起来，也让江两岸的运输都受到空袭的影响。" },
  },
  {
    id: 'shenyang',
    kind: 'site' as const,
    kicker: { en: 'Shenyang  ·  typological rear', zh: '沈阳  ·  类型学后方' },
    title: { en: 'A Northeast logistics hinterland', zh: '东北的后勤腹地' },
    body: {
      en: 'A regional typological mark at present-day Shenyang, evoking the Northeast as a logistics hinterland. It is not a named depot, and it is not a count of trains or trucks.',
      zh: '今沈阳的地区性类型学标记，用以提示东北作为后勤腹地。这不是某一座仓库，也不是车辆或列车的清点。',
    },
  },
  {
    id: 'busan',
    kind: 'site' as const,
    kicker: { en: 'Busan  ·  Pusan', zh: '釜山' },
    title: { en: 'The southern end of the 1950 campaign', zh: '一九五〇年战局的南端' },
    body: {
      en: 'A regional anchor at present-day Busan (Pusan), used only to mark the southern end of the early campaign, including the Pusan Perimeter before the Incheon landing.',
      zh: '今釜山的地区锚点，仅用于标出战争初期战局的南端，包括仁川登陆前的釜山防御圈。',
    },
  },
  {
    id: 'hungnam',
    kind: 'site' as const,
    kicker: { en: 'Hungnam  ·  typological bearing', zh: '兴南  ·  类型学方向' },
    title: { en: 'A coastal bearing for withdrawal', zh: '撤离的海岸方向' },
    body: {
      en: 'A typological coastal mark at present-day Hungnam. It indicates a withdrawal bearing after the Changjin / Chosin fighting, not a roster of the evacuation.',
      zh: '今兴南的类型学海岸标记。它只表示长津湖作战之后的撤离方向，不是撤离名册。',
    },
  },
  {
    id: 'taiwan',
    kind: 'site' as const,
    kicker: { en: "Taiwan Strait · June 1950", zh: "台湾海峡 · 1950年6月" },
    title: { en: "The Seventh Fleet enters the strait", zh: "第七舰队进入海峡" },
    body: { en: "On 27 June Truman ordered the Seventh Fleet to prevent an attack on Taiwan. He also called on the authorities in Taiwan to cease air and sea operations against the mainland. Both measures followed the outbreak of war in Korea.", zh: "6月27日，杜鲁门命令第七舰队阻止对台湾的进攻，同时要求台湾方面停止对大陆的海空行动。这是美国在朝鲜战争爆发后对台湾海峡采取的措施。" },
    note: { en: "The marker identifies the strait, not the position of a ship.", zh: "此处标的是海峡的位置，不是某艘军舰的位置。" },
  },
  {
    id: 'sansoli',
    kind: 'campaign' as const,
    kicker: { en: "Northwestern Korea · November 1950", zh: "朝鲜西北部 · 1950年11月" },
    title: { en: "Sansoli on the western front", zh: "西部战场上的三所里" },
    body: { en: "During the second Chinese campaign, Sansoli was an important road junction south of the Chongchon River. The village figures in accounts of fighting between Chinese troops and retreating UN forces.", zh: "第二次战役期间，三所里是清川江以南的一处交通要地。志愿军与南撤的联合国军在这一带交战，使这个小地名出现在战史里。" },
    note: { en: "Troops in the west withdrew south; those at the Chosin Reservoir in the east withdrew toward Hungnam.", zh: "西线部队向南撤退；东线长津湖一带的部队则撤向兴南港。" },
  },
] as const

export const EQUIPMENT_CARDS = [
  {
    id: 'light-infantry',
    kicker: { en: 'Equipment  ·  typological', zh: '装备  ·  类型学' },
    title: { en: 'Light infantry', zh: '轻装步兵' },
    body: {
      en: 'Early Volunteer Army units are shown here as typological light infantry: small arms, limited organic artillery and armor, moving mainly on foot. This is a contrast of kinds, not a museum collection and not a census of divisions.',
      zh: '战争初期的志愿军在此示意为类型学上的轻装步兵：轻武器为主，建制内的炮兵与装甲有限，主要靠徒步行军。这是种类上的对照，不是博物馆藏品，也不是师团普查。',
    },
    note: {
      en: 'Chinese official histories themselves describe the early force as lightly equipped relative to UN Command. No headcount is added on this card.',
      zh: '中国官方战史本身也把战争初期的部队，描述为相对联合国军装备较轻。本卡不附加人数。',
    },
  },
  {
    id: 'un-firepower',
    kicker: { en: 'Equipment  ·  typological', zh: '装备  ·  类型学' },
    title: { en: 'UN air, armor, and artillery', zh: '联合国军的空军、坦克与大炮' },
    body: {
      en: 'UN Command’s typological advantage is shown as air power, armor, and artillery — the modern combined-arms kit that the early Volunteer Army could not match one-for-one. The marks are schematic, not a table of order-of-battle.',
      zh: '联合国军的类型学优势，在此示意为空军、坦克与大炮——战争初期志愿军无法一对一对等的现代化合成装备。标记是示意，不是一份编制表。',
    },
  },
  {
    id: 'mig-15',
    kicker: { en: 'MiG-15  ·  MiG Alley', zh: '米格十五  ·  米格走廊' },
    title: { en: 'A typological corridor along the Yalu', zh: '鸭绿江一带的类型学走廊' },
    body: {
      en: 'From late 1950 and more clearly in 1951, MiG-15 jet fighters appeared over northwestern Korea, in the airspace later nicknamed “MiG Alley.” The band on the globe is typological. It is not a reconstruction of sorties or of any one aircraft.',
      zh: '自一九五〇年末，更清楚是在一九五一年，米格十五喷气式战斗机出现在西北朝鲜上空，这片空域后来常被称作“米格走廊”。地球上的色带是类型学示意，不是出动架次或某一架飞机的复原。',
    },
    note: {
      en: 'The aircraft were flown from bases on the Chinese side of the Yalu as well as over the corridor itself. This chapter does not unroll a separate air-order-of-battle.',
      zh: '飞机既从鸭绿江中国一侧的机场起飞，也在走廊上空活动。本章不另展开一份空军编制。',
    },
  },
  {
    id: 'supply-line',
    kicker: { en: 'Logistics  ·  typological', zh: '后勤  ·  类型学' },
    title: { en: 'A line that was cut and repaired', zh: '一条被切断又被抢修的线' },
    body: {
      en: 'The typological supply line runs from a Northeast hinterland across the Yalu and southward under air interdiction. Official and memoir accounts agree that the line was repeatedly damaged and repaired. Surviving that interdiction is part of the equipment and mobilization story, not a claim that the road was ever safe.',
      zh: '类型学补给线从东北腹地越过鸭绿江向南延伸，并处在空中封锁之下。官方记载与回忆都同意：这条线多次被打坏，又被抢修。在封锁下把线保住，属于装备与动员故事的一部分，并不是说这条路曾经安全。',
    },
  },
] as const

export const SOURCE_SECTIONS = [
  {
    title: { en: 'How this chapter handles evidence', zh: '本章如何处理证据' },
    paragraphs: [
      {
        en: 'This is a colloquial popular-science tour, not a literature recitation and not a scoreboard. Spoken commentary avoids death totals. Where a figure must appear in a card or in these notes, it is attributed to an official series or to a named scholar, and disagreement is left visible. A mid-point of a range is never presented as fact. Campaign marks on the globe are typological schematics, labeled as such, never a troop census and never a visualization of the dead.',
        zh: '这是给听众的通俗讲解，不是念文献，也不是记分牌。口播解说避免使用死亡总数。若卡片或本说明必须出现数字，会归到某一官方系列或具名学者，并保留分歧。不以区间中值充当事实。地球上的战役标记都是类型学示意，并加以标明，绝不是兵力普查，也绝不把阵亡可视化。',
      },
    ],
  },
  {
    title: { en: 'Names and dates used on the globe', zh: '地球上使用的名称与年代' },
    items: [
      {
        en: 'Chinese People’s Volunteer Army (中国人民志愿军, PVA); the Korean People’s Army (朝鲜人民军); UN Command (联合国军). Period-accurate Chinese place names are used with present-day identifications: 仁川 (Incheon), 鸭绿江 (Yalu / Amnok), 三八线 (the 38th parallel), 板门店 (Panmunjom), 云山 (Unsan), 长津湖 (Changjin / Chosin Reservoir), 上甘岭 (Shangganling / Triangle Hill), 丹东 (then 安东, Andong).',
        zh: '中国人民志愿军（PVA）、朝鲜人民军、联合国军（UN Command）。年代上使用当时的中文地名，并附今地图标识：仁川、鸭绿江、三八线、板门店、云山、长津湖（Chosin Reservoir）、上甘岭（三角山 / Triangle Hill）、丹东（当时称安东）。',
      },
      {
        en: 'Outbreak, 25 June 1950; Incheon landing, 15 September 1950; PVA crossing of the Yalu beginning 19 October 1950, following Chinese official campaign histories; five campaigns from late October 1950 into the spring of 1951; talks from 10 July 1951 (first at Kaesong, later Panmunjom); Shangganling / Triangle Hill in the autumn of 1952; Armistice Agreement signed at Panmunjom on 27 July 1953.',
        zh: '一九五〇年六月二十五日战争爆发；九月十五日仁川登陆；按中国官方战史，志愿军自十月十九日起渡过鸭绿江；自一九五〇年十月下旬至一九五一年春为五次战役；一九五一年七月十日开始谈判（先在开城，后在板门店）；一九五二年秋为上甘岭 / 三角山之战；一九五三年七月二十七日《朝鲜停战协定》在板门店签字。',
      },
    ],
  },
  {
    title: { en: 'Chinese official and memoir accounts', zh: '中国官方战史与回忆' },
    items: [
      {
        en: 'Military History Research Department, Academy of Military Science, History of the War to Resist US Aggression and Aid Korea (抗美援朝战争史), Military Science Press — the standard official Chinese campaign history (three volumes in the widely cited edition).',
        zh: '军事科学院军事历史研究部《抗美援朝战争史》，军事科学出版社——广泛引用的中国官方战役史（通行本为三卷）。',
      },
      {
        en: 'Peng Dehuai, Peng Dehuai’s Self-Account (彭德怀自述), for the commander’s later account of the decision to enter the war and of the campaigns. This is a memoir, not a statistical yearbook; it is cited as testimony, not as a census.',
        zh: '彭德怀《彭德怀自述》，可见决策入朝与战役过程的当事人事后叙述。这是回忆，不是统计年鉴；作证词引用，不作普查引用。',
      },
      {
        en: 'Hong Xuezhi, Recollections of the War to Resist US Aggression and Aid Korea (抗美援朝战争回忆), a senior logistics commander’s account of the supply line under air attack.',
        zh: '洪学智《抗美援朝战争回忆》，一位主管后勤的高级指挥员对空袭下运输线的叙述。',
      },
    ],
  },
  {
    title: { en: 'Scholarship on decision and archives', zh: '决策与档案研究' },
    items: [
      {
        en: 'Shen Zhihua (沈志华), Mao Zedong, Stalin and the Korean War (毛泽东、斯大林与朝鲜战争), and related work drawing on published Russian and Chinese archival material, on the international decision to enter the war and on alliance politics. Page numbers are not invented here; readers should use the edition to hand.',
        zh: '沈志华《毛泽东、斯大林与朝鲜战争》及利用已刊俄国与中国档案的相关研究，讨论参战的国际决策与同盟政治。此处不编造页码；请以手边版本为准。',
      },
      {
        en: 'Chen Jian, China’s Road to the Korean War (Cornell University Press, 1994), on the PRC’s path to intervention.',
        zh: '陈兼（Chen Jian），China’s Road to the Korean War（康奈尔大学出版社，1994），讨论中华人民共和国走向参战的道路。',
      },
      {
        en: 'Allen S. Whiting, China Crosses the Yalu (Macmillan, 1960), an early English-language study of the crossing decision, to be read with later archival work.',
        zh: 'Allen S. Whiting，China Crosses the Yalu（Macmillan，1960），关于渡江决策的早期英文研究，宜与后来的档案研究对照阅读。',
      },
    ],
  },
  {
    title: { en: 'United States official histories', zh: '美国官方战史' },
    items: [
      {
        en: 'Roy E. Appleman, South to the Naktong, North to the Yalu (June–November 1950), United States Army in the Korean War — official US Army history covering the Naktong / Pusan fighting, the Incheon landing, the advance north, and first contact including Unsan.',
        zh: 'Roy E. Appleman，South to the Naktong, North to the Yalu（1950年6–11月），美国陆军《朝鲜战争中的美国陆军》系列——涵盖洛东江 / 釜山防御、仁川登陆、北进，以及包括云山在内的初次接触。',
      },
      {
        en: 'Billy C. Mossman, Ebb and Flow, November 1950–July 1951, United States Army in the Korean War — official US Army history of the winter of 1950–51, including the Chosin / Changjin campaign and the later stabilization of the front.',
        zh: 'Billy C. Mossman，Ebb and Flow, November 1950–July 1951，同系列美国陆军官方战史——涵盖一九五〇至五一年之冬，包括长津湖战役及此后战线的稳定。',
      },
      {
        en: 'Walter G. Hermes, Truce Tent and Fighting Front, United States Army in the Korean War — official history of the armistice talks and the fighting that continued during them, including the 1952 positional battles.',
        zh: 'Walter G. Hermes，Truce Tent and Fighting Front，同系列官方战史——停战谈判及谈期间的作战，包括一九五二年的阵地战。',
      },
      {
        en: 'Robert F. Futrell, The United States Air Force in Korea, 1950–1953, a standard official US Air Force history, relevant to air interdiction and to the fighting along “MiG Alley.”',
        zh: 'Robert F. Futrell，The United States Air Force in Korea, 1950–1953，美国空军官方战史的通行本，与空中封锁及“米格走廊”上的作战有关。',
      },
    ],
  },
  {
    title: { en: 'The armistice document', zh: '停战文件' },
    items: [
      {
        en: 'Agreement concerning a military armistice in Korea, signed at Panmunjom, 27 July 1953, with its annexes on the military demarcation line and the demilitarized zone. The text establishes a cease-fire and a military demarcation line; it is not a peace treaty between the parties.',
        zh: '《关于朝鲜军事停战的协定》，一九五三年七月二十七日在板门店签字，并附军事分界线与非军事区等附件。文本确立停火与军事分界线；它不是各方之间的和平条约。',
      },
    ],
  },
  {
    title: { en: 'Documents and narrative references added for this chapter', zh: '本章增补的文献与叙述参考' },
    items: [
      {
        en: 'Harry S. Truman, “Statement by the President on the Situation in Korea,” 27 June 1950, Public Papers of the Presidents, Truman Library: https://www.trumanlibrary.gov/library/public-papers/173/statement-president-situation-korea — the statement that both intervened in Korea and sent the Seventh Fleet into the Taiwan Strait.',
        zh: '哈里·杜鲁门，Statement by the President on the Situation in Korea，一九五〇年六月二十七日，总统公开文件，杜鲁门图书馆：https://www.trumanlibrary.gov/library/public-papers/173/statement-president-situation-korea ——同一份声明既介入朝鲜，也派第七舰队进入台湾海峡。',
      },
      {
        en: 'Foreign Relations of the United States, 1950, Volume VII, Korea, document 589, recording that Zhou Enlai’s 3 October warning, passed through the Indian ambassador K. M. Panikkar, reached Washington the same day. The receipt records delivery, not whether officials considered it a bluff: https://history.state.gov/historicaldocuments/frus1950v07/d589',
        zh: '《美国对外关系文件》1950年第七卷（朝鲜）第589号文件，记录周恩来经印度驻华大使潘尼迦于十月三日发出的警告，于当天到达华盛顿。收报时间可证送达；「被当成恫吓」是叙述判断，不是这封电报的结论：https://history.state.gov/historicaldocuments/frus1950v07/d589',
      },
      {
        en: 'Mao Zedong’s telegram to Zhou Enlai of 13 October 1950, on entering the war, is cited from Selected Military Writings of Mao Zedong (《毛泽东军事文选》). Readers should use the edition to hand; a page number is not invented here.',
        zh: '毛泽东一九五〇年十月十三日致周恩来、谈参战利害的电报，见《毛泽东军事文选》。请以手边版本为准；此处不编造页码。',
      },
      {
        en: 'Peng Dehuai, “Report on the Work of the Chinese People’s Volunteer Army in the War to Resist US Aggression and Aid Korea,” 12 September 1953, available at Wikisource: https://zh.wikisource.org/zh-hans/关于中国人民志愿军抗美援朝工作报告',
        zh: '彭德怀《关于中国人民志愿军抗美援朝工作的报告》，一九五三年九月十二日，可见维基文库：https://zh.wikisource.org/zh-hans/关于中国人民志愿军抗美援朝工作报告',
      },
      {
        en: 'Li Ying (李鹰), Duan Dao — The Great Reversal on the Korean Battlefield (《断刀——朝鲜战场大逆转》, 2010), a documentary / narrative reference (including the line about “only owning the moon”), not a primary archive: http://jishi.cntv.cn/20121210/100068.shtml',
        zh: '李鹰《断刀——朝鲜战场大逆转》（2010），纪录片/叙述参考（包括“只拥有月亮”一语），不是原始档案：http://jishi.cntv.cn/20121210/100068.shtml',
      },
      {
        en: 'Open PLA Daily / 81.cn comparisons of equipment and transport, already used in this chapter typologically (for example, the guns of one PVA army set beside those of a US division). They are published military-newspaper comparisons, not a new census invented here. Appleman and the other US official histories already listed remain the English-language campaign reference.',
        zh: '《解放军报》/ 中国军网（81.cn）等公开军报中已见的装备与运输对比，本章只作类型学使用（例如一个军的火炮与美军一个师的对照）。这是已刊军报对比，不是在此新编的普查。Appleman 及其他已列美国官方战史，仍是英文战役叙述的参考。',
      },
    ],
  },
  {
    title: { en: 'A note on numbers', zh: '关于数字的说明' },
    paragraphs: [
      {
        en: 'Official Chinese tallies, official US and UN tallies, and later scholarly estimates of strength and losses do not agree, and they are not always counting the same thing (killed, wounded, missing, captured; Chinese, Korean, and UN national subtotals; different closing dates). This chapter therefore does not place a death total in the spoken hook, does not visualize casualty totals, and does not offer a mid-point as a fact. Readers who need a figure should return to the official series and to the archival scholarship named above, and should expect the sources to disagree.',
        zh: '中国官方统计、美国与联合国官方统计，以及后来学者对兵力与损失的估计，并不一致；它们也未必在数同一件事（阵亡、负伤、失踪、被俘；中、朝与联合国军各国分项；不同的截止日）。因此本章不在口播开场里放置死亡总数，不把“伤亡数字”可视化，也不把区间中值当作事实。需要数字的读者，应回到上面点名的官方系列与档案研究，并预期来源之间存在分歧。',
      },
    ],
  },
] as const

export type KoreaCard = (typeof SITE_CARDS)[number] | (typeof EQUIPMENT_CARDS)[number]

export function findKoreaCard(kind: string, id: string) {
  if (kind === 'equipment') return EQUIPMENT_CARDS.find((item) => item.id === id) ?? null
  return SITE_CARDS.find((item) => item.id === id) ?? null
}
