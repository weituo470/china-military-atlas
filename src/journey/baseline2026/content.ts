/**
 * Bilingual copy for the 2026 China military baseline journey.
 * Chinese is the default overlay language; English is a complete peer, not a gloss.
 * Official announcements and external estimates are labeled throughout.
 * This is a popular-science tour, not an intelligence briefing.
 */
import { PROJECT_NAME } from '../../brand'
import { BEAT_STAGING, PARAGRAPH_FOCUS } from './sites'
import type { JourneyBeat, Localized } from '../types'

export const JOURNEY_META = {
  id: 'baseline2026' as const,
  queryValue: 'baseline2026',
  chapterTitle: {
    en: `${PROJECT_NAME.en} · 2026 Military Baseline`,
    zh: `${PROJECT_NAME.zh} · 2026 军力基线`,
  } satisfies Localized,
}

export const UI = {
  brandKicker: PROJECT_NAME,
  brandTitle: { en: '2026 Military Baseline', zh: '2026 军力基线' } satisfies Localized,
  brandWindow: {
    en: 'A public baseline on the present-day Earth  ·  calendar cursor 2026',
    zh: '在今日地球上的公开基线  ·  时间窗为 2026 年',
  } satisfies Localized,
  exit: { en: 'Exit journey', zh: '退出导览' } satisfies Localized,
  enter: { en: '2026 Baseline', zh: '2026 军力基线' } satisfies Localized,
  sourcesBtn: { en: 'Sources', zh: '信源与注释' } satisfies Localized,
  sourcesKicker: { en: 'Notes for presenters and readers', zh: '供讲解者与听众核对' } satisfies Localized,
  sourcesTitle: { en: 'Sources & cautions', zh: '信源与审慎说明' } satisfies Localized,
  close: { en: 'Close', zh: '关闭' } satisfies Localized,
  langEn: 'EN',
  langZh: '中文',
  languageLabel: { en: 'Language', zh: '语言' } satisfies Localized,
  hints: {
    en: '0–8 jump beats   ·   ← → change beat   ·   Space play/pause   ·   Drag the globe   ·   Click a regional mark, a typological column, or a chart row   ·   Esc to exit',
    zh: '0–8 跳转段落   ·   ← → 切换段落   ·   空格播放或暂停   ·   拖动地球   ·   点击地区标记、示意编队或对照表行   ·   Esc 退出',
  } satisfies Localized,
  commentary: { en: 'Commentary', zh: '解说' } satisfies Localized,
  playNarration: { en: 'Play narration', zh: '播放解说' } satisfies Localized,
  pauseNarration: { en: 'Pause', zh: '暂停' } satisfies Localized,
  resumeNarration: { en: 'Resume', zh: '继续播放' } satisfies Localized,
  replayNarration: { en: 'Replay from the start', zh: '从头播放' } satisfies Localized,
  playHint: {
    en: 'After you click, the globe turns to each region. Spoken audio is Chinese-only for now.',
    zh: '点击后，镜头会转到对应地区。语音解说目前仅为中文。',
  } satisfies Localized,
  voiceChineseOnly: {
    en: 'Spoken narration is Chinese-only for now. On-screen text stays in English.',
    zh: '语音解说目前仅为中文。画面文字仍可切换为英文。',
  } satisfies Localized,
  narrationError: {
    en: 'Voice could not be loaded. You can still walk the globe and read the commentary.',
    zh: '语音未能载入。仍可浏览地球并阅读解说。',
  } satisfies Localized,
  coordinateCaution: {
    en: 'Marks are regional or typological positions on the present-day globe, to give a sense of place.',
    zh: '标记是今地图上的地区性或类型学位置，用来给一个方位感。',
  } satisfies Localized,
  illustrationCaution: {
    en: 'Schematic / typological drawings, to help you read the types.',
    zh: '示意 / 类型学图样，便于认读类型。',
  } satisfies Localized,
  dossierLabel: { en: 'Public dossier', zh: '公开卷宗' } satisfies Localized,
  estimateLabel: { en: 'External estimate', zh: '外部估计' } satisfies Localized,
  officialLabel: { en: 'Official announcement', zh: '官方公布' } satisfies Localized,
  blockLegend: {
    en: 'Hatched columns are external estimates: personnel (IISS), 2025 spending (SIPRI), combat aircraft (FlightGlobal). Units and definitions differ, so compare only the outline of magnitude. Where a column stands shows which country it belongs to.',
    zh: '阴影柱为外部估计：人数（IISS）、2025 年军费（SIPRI）、作战飞机（FlightGlobal）。单位与口径不同，只比量级、看轮廓。柱子立在哪里，只是示意它属于哪个国家。',
  } satisfies Localized,
  theaterHint: {
    en: 'Click a theater region. The marks sit at regional centers in each theater, to give a sense of place.',
    zh: '可点击战区地域。标记标在各战区地域的地区中心，给一个方位感。',
  } satisfies Localized,
  platformHint: {
    en: 'Click a typological silhouette or an industrial-belt mark.',
    zh: '可点击类型学剪影或产业带标记。',
  } satisfies Localized,
  reviewHint: {
    en: 'Official and estimated figures are labeled separately. 1 mark ≈ 10 ships. Click a column or badge.',
    zh: '官方公布与外部估计分开标明。一标约十艘。可点击编队或数字徽标。',
  } satisfies Localized,
  westPacHint: {
    en: 'The arc is a wide framing of the western Pacific.',
    zh: '这条弧线是西太平洋的开阔取景。',
  } satisfies Localized,
  closeHint: {
    en: 'Chapter I is the ancient tick of the same three capacities. Korea 1950–53 belongs to a sibling journey.',
    zh: '第一章是同一组能力在古代的刻度。一九五〇到五三年属于一条平行导览。',
  } satisfies Localized,
  continueHint: {
    en: 'A later sibling journey can take 1950–53. It is not in this build.',
    zh: '一条平行导览可以讲述一九五〇到五三年。它不在本次构建中。',
  } satisfies Localized,
}

export const BEATS = [
  {
    id: 'hook',
    name: { en: 'Hook', zh: '开场' },
    kicker: { en: '2026 baseline  ·  first, straighten the ruler', zh: '2026 年基线  ·  先把尺子摆正' },
    title: { en: 'First, straighten the ruler.', zh: '先把尺子摆正。' },
    body: {
      en: 'Still the Earth from Chapter I — this time we set out a public baseline. We follow three axes: force structure, arms and industry, and the public language of modernization.',
      zh: '还是第一章那颗地球，这一次摆上的是一份公开基线。我们沿三条轴看：体量与编成，装备与工业，研发方向与战争思想。',
    },
    narration: {
      en: [
        'First, straighten the ruler. This is the same Earth as in Chapter I; we turn the clock to 2026. What follows is a public baseline, told for you to hear, drawn entirely from open sources. We will follow three axes: force structure, arms and industry, and the public language of modernization.',
        'Along the way I will keep official announcements and external estimates apart. China’s public manpower figures are fairly summary — there is no detailed open order of battle like some countries publish. Where the open record does not add up, I will say so plainly, and leave that figure blank.',
      ],
      zh: [
        '先把尺子摆正。这颗地球，还是第一章里那颗地球，我们把时间拨到二〇二六年。接下来这一段，是讲给各位听的一份公开基线，材料全都公开可查。我们沿着三条轴看：体量与编成，装备与工业，研发方向与战争思想。',
        '一路上，哪些是官方公布，哪些是外部估计，我都会分开讲明。中国公开的兵力数字比较概括，没有有些国家那样细的总表。所以遇到公开记录里还对不上的数字，我会直说：这一处还不清楚，就让它先空着。',
      ],
    },
  },
  {
    id: 'timeline',
    name: { en: 'Timeline', zh: '时间尺' },
    kicker: { en: 'Beat 1  ·  Why a baseline', zh: '第一段  ·  为什么要有基线' },
    title: { en: 'The same three capacities, the tick moved to today.', zh: '还是那三种能力，刻度拨到了今天。' },
    body: {
      en: 'Chapter I left three visible capacities on this Earth. This journey asks what they look like in the open record of 2026. The Korean War of 1950–53 is a calibration point on a parallel tour.',
      zh: '第一章在这颗地球上留下了三种看得见的能力。这条线要问：到了二〇二六年的公开记录里，它们长成了什么样子。一九五〇到五三年的朝鲜战争，是另一条平行导览上的校准点。',
    },
    narration: {
      en: [
        'Please first recall the three capacities that already stand in Chapter I: household registers and counties, turning people and grain into resources that can be levied again and again; military industry, putting usable weapons into many hands; and strategy written down as a statecraft that can be taught.',
        'Now we bring the same question to 2026: in the open record, what have these three capacities grown into? The Korean War of 1950–53 is another calibration point on this Earth, left for a parallel tour to tell in full.',
      ],
      zh: [
        '先请各位回想第一章里站得住的三种能力：靠编户和县制，把人和粮食变成可以反复征发的资源；靠军工，把可用的武器交到许多人手里；再把谋略写成可以传授的国家技艺。',
        '现在，把同样的问题带到二〇二六年：在公开记录里，这三种能力长成了什么样子？一九五〇到五三年的朝鲜战争，是这颗地球上的另一个校准点，留给一条平行的导览去细讲。',
      ],
    },
  },
  {
    id: 'structure',
    name: { en: 'Structure', zh: '编成' },
    kicker: { en: 'Beat 2  ·  Size and organization', zh: '第二段  ·  体量与编成' },
    title: { en: 'Start with the official structure.', zh: '先看官方写明的结构。' },
    body: {
      en: 'The public structure is clear: the Central Military Commission, the five theater commands after the 2016 reform, and the services and arms. Personnel and the wider spending estimates come from outside sources, and will be labeled as such.',
      zh: '公开结构很清楚：中央军委，二〇一六年改革后的五大战区，以及各军种、兵种。人数和口径更宽的军费估计来自外部，会单独标明。',
    },
    narration: {
      en: [
        'Start with the official structure — this part is down in black and white. At the top is the Central Military Commission. On 1 February 2016, the Eastern, Southern, Western, Northern, and Central Theater Commands were formally established, replacing the old military regions. The five marks on the globe sit at regional centers in each theater, to give you a sense of place.',
        'On 19 April 2024, officials announced the new Information Support Force, abolished the designation of the Strategic Support Force, and adjusted the leadership of the Aerospace Force and the Cyberspace Force. The Defense Ministry said that day that the armed forces as a whole now form a new layout under the Commission: the Army, Navy, Air Force, and Rocket Force among the services, together with the Aerospace Force, Cyberspace Force, Information Support Force, and Joint Logistic Support Force among the arms. Remember these official names; we will stop at the names.',
        'Personnel is a different matter. China’s public manpower figures are fairly summary, so here we borrow an external estimate. The International Institute for Strategic Studies’ Military Balance 2026, in public retellings, puts PLA active personnel at about 2.035 million. That is an external estimate; we take only the order of magnitude — about two million — and leave the fine count for later checking. Spending also has to be read apart. The 2026 National People’s Congress announced a national general public budget for defense of 1.94 trillion yuan, up 6.9 percent from the previous year’s outturn; the central-level figure is 1.91 trillion yuan, up 7 percent. That is official. SIPRI estimates China’s 2025 military spending at about 336 billion US dollars. That is an external estimate, on a wider definition, and the year is still 2025.',
      ],
      zh: [
        '先看官方写明的结构，这一部分白纸黑字。最上面是中央军委。二〇一六年二月一日，东部、南部、西部、北部、中部五大战区正式成立，取代了原来的军区。地球上的五个标记，标在各战区地域的地区中心，给各位一个方位感。',
        '二〇二四年四月十九日，官方宣布新组建信息支援部队，同时撤销战略支援部队番号，并调整军事航天部队和网络空间部队的领导管理关系。国防部当天说明，军队总体形成了军委领导指挥下的新布局：陆军、海军、空军、火箭军等军种，加上军事航天部队、网络空间部队、信息支援部队、联勤保障部队等兵种。记住这几个官方名称就够了，我们也只讲到名称为止。',
        '人数就是另一回事了。中国公开的兵力数字比较概括，这里要借外部估计。国际战略研究所《军事平衡》二〇二六年版，按公开转述，把解放军现役写成约二百零三点五万人。这是外部估计，我们只取约二百万人这个量级，细数留待核对。军费也要分开看。二〇二六年全国两会公布：全国一般公共预算安排国防支出一点九四万亿元，比上年执行数增长百分之六点九；其中中央本级一点九一万亿元，增长百分之七。这是官方公布。斯德哥尔摩国际和平研究所估计，二〇二五年中国军费约三千三百六十亿美元。这是外部估计，口径比官方预算宽，年份也还停在二〇二五年。',
      ],
    },
  },
  {
    id: 'equipment',
    name: { en: 'Equipment', zh: '装备' },
    kicker: { en: 'Beat 3  ·  Arms and industry', zh: '第三段  ·  装备与工业' },
    title: { en: 'Only the equipment already shown in public.', zh: '只讲已经公开亮相的装备。' },
    body: {
      en: 'This beat stays with types already shown in public: commissioned aircraft carriers, the first officially commissioned Type 055, and the J-20, fielded and displayed on official occasions. Industry is marked at the level of coastal belts; the Rocket Force is named as a public service.',
      zh: '这一段只谈公开亮相过的装备类型：已入列的航母，官方入列的〇五五型首舰，已列装并在官方场合展示过的歼-20。工业标到沿海产业带这一层，火箭军讲到公开军种这一层。',
    },
    narration: {
      en: [
        'The ship and aircraft silhouettes in front of you are typological — here to help you recognize the types. Liaoning was commissioned in 2012, Shandong in 2019; both are officially announced active carriers. Fujian was launched and named in June 2022, and held its commissioning and flag-presentation ceremony on 5 November 2025. A navy spokesperson later said trials and ship-aircraft training would continue after commissioning. The open record stops here, and so do we.',
        'Nanchang, the lead ship of the 10,000-ton Type 055 destroyers, was formally commissioned on 12 January 2020. The J-20 was officially confirmed in service in 2017 and 2018, and has been shown at parades and air shows. The Rocket Force is a public service; here we stop at the name of the service.',
        'Industrial capacity, likewise, is read only from public accounts. Official media and outside analysts both talk about the scale of shipbuilding and aviation. The marks on the globe sit at the rough position of coastal industrial belts — typological again.',
      ],
      zh: [
        '眼前的舰影和机影，是类型学示意，帮各位认一认舰型和机型。辽宁舰二〇一二年入列，山东舰二〇一九年入列，都是官方公布的现役航母。福建舰二〇二二年六月下水命名，二〇二五年十一月五日举行入列授旗仪式。海军发言人随后说明，入列后还要继续试验验证和舰机适配训练。公开信息到这里，我们也讲到这里。',
        '万吨级驱逐舰〇五五型的首舰南昌舰，二〇二〇年一月十二日正式入列。歼-20在二〇一七年、二〇一八年已由官方确认列装，也在阅兵、航展这些官方场合展示过。火箭军是公开的军种，我们在这里点到军种的名字为止。',
        '工业能力，同样只看公开叙述。造船和航空工业的规模，官方媒体在讲，外部分析也在谈。地球上的标记，标的是沿海产业带的大致位置，同样是类型学示意。',
      ],
    },
  },
  {
    id: 'scale',
    name: { en: 'Scale', zh: '量级' },
    kicker: { en: 'Beat 4  ·  A global reading of magnitude', zh: '第四段  ·  把主要力量的量级放到同一张图上' },
    title: { en: 'On one chart, start with magnitude.', zh: '同一张图上，先看量级。' },
    body: {
      en: 'The hatched columns are external estimates on published definitions: active personnel from the International Institute for Strategic Studies, 2025 spending from SIPRI, and combat aircraft from FlightGlobal. Units and definitions differ, so we compare only the order of magnitude — the outline. Ship counts wait for the next beat: a typological review on the Pacific.',
      zh: '阴影柱是按已公布口径所作的外部估计：现役人数取自国际战略研究所，二〇二五年军费取自斯德哥尔摩国际和平研究所，作战飞机取自飞行国际。单位和口径各不相同，所以只比量级、看轮廓。海军艘数留到下一场：太平洋上的类型学阅舰式。',
    },
    narration: {
      en: [
        'Please pull the Earth back. On each country’s territory stand three columns, drawn to published definitions, to show magnitude. Units differ, and so do the definitions, so please read only the outline. Hatching means an external estimate. Where a column stands is only to show which country it belongs to.',
        'Start with personnel. IISS Military Balance 2026, in public retellings, for active forces in 2025: China about 2.035 million, India about 1.501 million, the United States about 1.34 million, North Korea about 1.28 million, Russia about 1.264 million. All of these are external estimates. China’s public manpower figures are fairly summary, so China’s column is still to be read as an order of magnitude: about two million.',
        'Arms and spending draw a different picture. SIPRI’s 2025 figures: the United States 954 billion dollars, China an estimated 336 billion, Russia an estimated 190 billion, then Germany, India, and the United Kingdom. Combat aircraft use FlightGlobal’s World Air Forces 2026 definition — fighters, attack aircraft, and bombers as it defines them: the United States 2,718, China 1,814, Russia 1,559, India 600. That is an external count. Navy hull totals differ too widely among sources, so they wait for the next beat: for the PLAN we keep only the already-checked wording of the US Defense Department’s 2024 public report; aircraft stay with this same air almanac.',
      ],
      zh: [
        '请把地球拉远。各国地域上立起三根柱子，都是按已经公布的口径画出来的量级。单位不同，口径也不同，所以请各位只看大小轮廓。带阴影的，表示外部估计。柱子立在哪里，只是示意它属于哪个国家。',
        '先看人数。国际战略研究所《军事平衡》二〇二六年版，按公开转述、以二〇二五年的现役计：中国约二百零三点五万人，印度约一百五十点一万人，美国约一百三十四万人，朝鲜约一百二十八万人，俄罗斯约一百二十六点四万人。这些都是外部估计。中国公开的兵力数字比较概括，所以中国这一根，还是只当约二百万人这个量级来看。',
        '武器和军费，画出来是另一幅图。斯德哥尔摩国际和平研究所对二〇二五年的统计：美国九千五百四十亿美元，中国估计三千三百六十亿美元，俄罗斯估计一千九百亿美元，往后是德国、印度、英国。作战飞机用飞行国际《世界空军》二〇二六年版的口径，按它自己的定义，包括战斗机、攻击机和轰炸机：美国二千七百一十八架，中国一千八百一十四架，俄罗斯一千五百五十九架，印度六百架。这是外部清点。海军舰艇各家口径差得太远，单独留到下一场讲：人民海军只沿用已经核对过的美国国防部二〇二四年表述，飞机则统一用这一份航空名录。',
      ],
    },
  },
  {
    id: 'review',
    name: { en: 'Review', zh: '阅舰式' },
    kicker: { en: 'Beat 5  ·  A typological Pacific fleet review', zh: '第五段  ·  太平洋上的一场类型学阅舰式' },
    title: { en: 'On the Pacific, a schematic fleet review.', zh: '太平洋上，一场示意阅舰式。' },
    body: {
      en: 'The main Pacific-facing navies are invited onto open water and formed up once, for viewing. Officially commissioned carriers are drawn 1:1; broader hull totals, on differing definitions, are shown with one typological mark for about ten ships, and are read apart. The camps are a visual grouping by national affiliation, not an alliance. The silhouettes are typological; their places are set for the shot.',
      zh: '把面向太平洋的主要海军，请到开阔水面上列一次队。已正式入列的航母按一比一画出；更宽的艘数口径各异，用一标约十艘的比例单位分开来读。左右阵营只按国家归属示意分组，不是联盟。舰影是类型学示意，位置为取景而设。',
    },
    narration: {
      en: [
        'Please read what is in front of you as a typological fleet review on open Pacific water. The west side is the China camp, the east side the non-China camp: a visual grouping by national affiliation, not a formal alliance, and not a deployment map. The ships are schematic, and their places are set by the camera; in reality, of course, each navy is in its own waters. The three officially commissioned PLAN carriers are drawn 1:1, with a ski-jump or a flat deck as each ship has it; Type 055 destroyers and amphibious ships appear only as typological silhouettes, not as a full hull count. Broader hull totals use one typological mark for about ten ships, rounded; the exact figures stay on the badges, and the definitions still have to be read apart.',
        'Start with officially commissioned aircraft carriers. China has three: Liaoning, Shandong, and Fujian, which held its commissioning and flag-presentation ceremony on 5 November 2025; trials and ship-aircraft training continue after commissioning. For the United States, a Congressional Research Service report of December 2025 states that eleven nuclear-powered carriers are in service; John F. Kennedy has not yet been delivered, so the picture shows eleven.',
        'Broader hull totals should be read apart. For the PLAN, this tour keeps the wording of the US Defense Department’s 2024 public report: a battle force of more than 370 ships and submarines, including more than 140 major surface combatants — an external estimate, shown here as thirty-seven typological marks at one mark for about ten ships. The United States figure is official: as of 1 October 2025, a battle force of 293 ships, shown as twenty-nine marks on the same unit. The definitions differ, so each is read on its own, and placed on its own; this is not a like-for-like stack.',
        'Now the other columns in the same review. Japan’s official defense white paper for fiscal year Reiwa 7 records, as of 31 March 2025, fifty-one escort vessels and twenty-two submarines, shown as five plus two marks on the same ten-ship unit; Izumo and Kaga remain official escort vessels, and we count them on that official definition. Australia officially counts sixteen major combatants: Anzac-class frigates, Hobart-class destroyers, and Collins-class submarines — a narrower definition than a whole-navy total, shown as two marks. The Republic of Korea Navy and the Russian Pacific Fleet appear as typological columns only, not on that scale; their totals are left blank.',
      ],
      zh: [
        '请把眼前看成太平洋开阔水面上的一场类型学阅舰式。左边是中国阵营，右边是非中国阵营，只按国家归属做示意分组，不是正式联盟，也不是部署图。舰影是示意，位置由镜头来定；现实里，各国海军当然各在各的海域。人民海军三艘航母按官方入列一比一画出跳台与平直两种甲板；〇五五型驱逐舰和两栖舰只作类型学示意，不是按总艘数来排的。更宽的艘数，全场用同一比例单位：一标约十艘，四舍五入，精确数字看徽章；口径不同，仍要分开来读。',
        '先看已正式入列的航空母舰。中国三艘：辽宁舰、山东舰，还有二〇二五年十一月五日入列授旗的福建舰，入列后仍要继续试验和舰机训练。美国方面，国会研究处二〇二五年十二月写明，现役核动力航母十一艘；肯尼迪号尚未交付，所以画面上就画十一艘。',
        '更宽的艘数，要分开来念。人民海军沿用美国国防部二〇二四年的表述：战斗舰艇与潜艇三百七十艘以上，其中主要水面战斗舰艇一百四十艘以上，这是外部估计，画面上用三十七个比例单位来表示，一标约十艘。美国是官方数字：截至二〇二五年十月一日，战斗舰艇二百九十三艘，用二十九标，还是这个单位。两边口径不同，所以各念各的，分开摆放，不能当成同一口径的对照柱。',
        '再看同一场阅舰式里的其他队列。日本令和七年防卫白书写明，截至二〇二五年三月三十一日，护卫舰五十一艘、潜艇二十二艘，画面上用五标加两标，仍是一标约十艘这个单位；出云、加贺在官方口径里仍列为护卫舰，我们就照这个口径来数。澳大利亚官方计入的是主要作战舰艇十六艘，指安扎克级护卫舰、霍巴特级驱逐舰和柯林斯级潜艇，这个口径比全海军总艘数要窄，画面上是两标。韩国海军和俄罗斯太平洋舰队，只以示意编队出场，不用这个比例单位，总数留白。',
      ],
    },
  },
  {
    id: 'seas',
    name: { en: 'Seas', zh: '近海与远海' },
    kicker: { en: 'Beat 6  ·  Two public voices', zh: '第六段  ·  两种公开的声音' },
    title: { en: 'The western Pacific, a wide open frame.', zh: '西太平洋，一片开阔取景。' },
    body: {
      en: 'The official language of the 2019 defense white paper is defensive: safeguarding sovereignty, security, and development interests. Outside analysts speak instead of near-seas capabilities, and of a growing set of power-projection tools. Both voices are set on the table; the camera stays on a wide frame of the western Pacific.',
      zh: '二〇一九年国防白皮书的官方语言是防御性的：捍卫主权、安全、发展利益。外部分析另谈近海能力，以及正在增多的力量投送工具。两种声音都摆上桌面，镜头停在西太平洋的开阔取景上。',
    },
    narration: {
      en: [
        'First, the official language. The 2019 white paper, China’s National Defense in the New Era, remains, as of 2026, the most recent comprehensive defense white paper. It states that China is committed to a defensive national defense policy, whose fundamental goal is to safeguard national sovereignty, security, and development interests.',
        'Outside analysts use their own voice: they talk about near-seas capabilities, and about a growing set of tools for far-seas power projection. We set both voices on the table, for you to hear. Please pull the Earth back: what you see is a wide open frame of the western Pacific. We are looking at the broad outline of this sea; islands and bases are left unmarked.',
      ],
      zh: [
        '先听官方的语言。二〇一九年的《新时代的中国国防》白皮书，到二〇二六年，仍是最近一份全面的国防白皮书。里面写明：中国始终不渝奉行防御性国防政策，根本目标是捍卫国家主权、安全、发展利益。',
        '外部分析用的是他们自己的口气，谈的是近海能力，以及正在增多的远海力量投送工具。两种声音，我们都摆上桌面，请各位自己听。现在请把地球拉远，眼前是西太平洋的一片开阔取景。我们看的是这片海的大轮廓，岛屿和基地，都不在标注之列。',
      ],
    },
  },
  {
    id: 'doctrine',
    name: { en: 'Thought', zh: '思想' },
    kicker: { en: 'Beat 7  ·  Research and military thought', zh: '第七段  ·  研发方向与战争思想' },
    title: { en: 'Modernization, written as a plan that can be told in public.', zh: '现代化，写成了一套可以公开讲述的规划。' },
    body: {
      en: 'Official public vocabulary includes building a world-class military, informatization, intelligentization, joint operations, and Xi Jinping Thought on Strengthening the Military as an official public formulation. Equipment is limited to what has been shown in public; science and industry are quoted only from official statements.',
      zh: '官方公开词汇包括建设世界一流军队、信息化、智能化、联合作战，以及作为官方公开表述的习近平强军思想。装备只提公开展示过的，科技与工业只引官方表述。',
    },
    narration: {
      en: [
        'Now the third axis: research directions and the public language of war. In the official public vocabulary there is building a world-class military, the integrated development of mechanization, informatization, and intelligentization, joint operations, and Xi Jinping Thought on Strengthening the Military as an official public formulation.',
        'Please set this beside Chapter I. Then, strategy was written as a statecraft that can be taught; today, modernization is written as a construction plan that can be told in public. We mention only equipment already shown in public, and only official language on science and industry. Projects not yet announced can wait until they are.',
      ],
      zh: [
        '再看第三条轴：研发方向与战争思想。翻开官方的公开词汇，有建设世界一流军队，有机械化信息化智能化融合发展，有联合作战，也有作为官方公开表述的习近平强军思想。',
        '请各位把它和第一章对照着看。那时候，谋略被写成一种可以传授的国家技艺；今天，现代化被写成一套可以公开讲述的建设规划。装备，我们只提已经公开展示过的；科技与工业，只引官方的表述。还没公布的项目，就等它公布了再讲。',
      ],
    },
  },
  {
    id: 'close',
    name: { en: 'Close', zh: '收束' },
    kicker: { en: 'Beat 8  ·  What the public record can defend', zh: '第八段  ·  公开记录能站住的结论' },
    title: { en: 'Large in scale, reformed, backed by industry.', zh: '规模很大，经过改革，有工业支撑。' },
    body: {
      en: 'What the open record can support is a large, reformed, industry-backed force, in the midst of the joint, high-tech modernization already written in official plans. Many key figures still come from external estimates. Chapter I is the ancient tick; this is the tick for 2026; 1950–53 is left to a parallel tour.',
      zh: '公开记录能够站住的，是一支规模很大、经过改革、有工业支撑的军队，正处在官方已经写出的联合化、高科技现代化进程之中。许多关键数字，仍然来自外部估计。第一章是古代的刻度，这是二〇二六年的刻度；一九五〇到五三年，交给一条平行导览。',
    },
    narration: {
      en: [
        'Pull the Earth back a little further. What the open record can support is, in the end, quite plain: a large, reformed, industry-backed force, in the midst of the joint, high-tech modernization already written in official plans. And please remember: many key figures still come from external estimates.',
        'Chapter I is the ancient tick of the same capacities on this Earth; this chapter is the tick for 2026. The years 1950–53 are left to that parallel tour. The ruler is straight. We pause here; the next step starts from here as well.',
      ],
      zh: [
        '把地球再拉远一点。公开记录站得住的结论，其实很朴素：这是一支规模很大、经过改革、有工业支撑的军队，正处在官方已经写出的联合化、高科技现代化进程之中。同时也请记住，许多关键数字，仍然来自外部估计。',
        '第一章，是同一组能力在这颗地球上的古代刻度；这一章，是二〇二六年的刻度。一九五〇到五三年，交给那条平行的导览。尺子已经摆正。我们在这里停一停，下一步，也从这里出发。',
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
  throw new Error(`baseline2026 beat/staging length mismatch: ${BEATS.length} vs ${BEAT_STAGING.length}`)
}
if (BEATS.some((beat, index) => beat.narration.zh.length !== PARAGRAPH_FOCUS[index]?.length || beat.narration.en.length !== PARAGRAPH_FOCUS[index]?.length)) {
  const mismatch = BEATS.map((beat, index) => `${beat.id}:${beat.narration.zh.length}/${beat.narration.en.length} vs focus ${PARAGRAPH_FOCUS[index]?.length}`).join(', ')
  throw new Error(`baseline2026 narration/paragraph-focus length mismatch: ${mismatch}`)
}

export const THEATER_CARDS = [
  {
    id: 'eastern',
    kicker: { en: 'Theater region  ·  typological', zh: '战区地域  ·  类型学' },
    title: { en: 'Eastern Theater region', zh: '东部战区地域' },
    body: {
      en: 'One of the five theater commands established on 1 February 2016, in an official reform that replaced the former military regions. This mark is a regional centroid for the eastern theater area, not a headquarters address.',
      zh: '二〇一六年二月一日正式成立的五大战区之一，取代原来的军区。此标记是东部战区地域的地区中心，不是总部地址。',
    },
    note: {
      en: 'Official structure. No street-level headquarters, base, or yard is implied.',
      zh: '官方结构。不表示总部、基地或船坞的街道位置。',
    },
  },
  {
    id: 'southern',
    kicker: { en: 'Theater region  ·  typological', zh: '战区地域  ·  类型学' },
    title: { en: 'Southern Theater region', zh: '南部战区地域' },
    body: {
      en: 'The southern theater command is an official 2016 formation. The pin is a regional centroid of the southern theater area, not a headquarters, a port, or an island objective.',
      zh: '南部战区是二〇一六年正式组建的战区。此钉位是南部战区地域的地区中心，不是总部、军港，也不是岛屿目标。',
    },
    note: {
      en: 'A regional framing only.',
      zh: '仅为地区性取景。',
    },
  },
  {
    id: 'western',
    kicker: { en: 'Theater region  ·  typological', zh: '战区地域  ·  类型学' },
    title: { en: 'Western Theater region', zh: '西部战区地域' },
    body: {
      en: 'The western theater covers a vast inland and plateau region. The mark is a regional centroid chosen for readability on the globe, not an installation.',
      zh: '西部战区覆盖广阔的内陆与高原。此标记是为了在地球上可读而取的地区中心，不是某一设施。',
    },
    note: {
      en: 'Not a base or a training-ground coordinate.',
      zh: '不是基地或训练场坐标。',
    },
  },
  {
    id: 'northern',
    kicker: { en: 'Theater region  ·  typological', zh: '战区地域  ·  类型学' },
    title: { en: 'Northern Theater region', zh: '北部战区地域' },
    body: {
      en: 'The northern theater command is one of the five official 2016 theaters. The pin is a regional centroid in the northern theater area, not a headquarters city.',
      zh: '北部战区是二〇一六年正式成立的五大战区之一。此钉位是北部战区地域的地区中心，不是某一总部所在城市。',
    },
    note: {
      en: 'Regional only.',
      zh: '仅为地区性标记。',
    },
  },
  {
    id: 'central',
    kicker: { en: 'Theater region  ·  typological', zh: '战区地域  ·  类型学' },
    title: { en: 'Central Theater region', zh: '中部战区地域' },
    body: {
      en: 'The central theater command is an official 2016 formation. The mark sits on a regional centroid of the central theater area — not Beijing, and not a headquarters street.',
      zh: '中部战区是二〇一六年正式组建的战区。标记落在中部战区地域的地区中心，不是北京，也不是总部街道。',
    },
    note: {
      en: 'A typological regional pin.',
      zh: '类型学的地区钉位。',
    },
  },
] as const

export const PLATFORM_CARDS = [
  {
    id: 'carriers',
    kicker: { en: 'Public platforms  ·  typological', zh: '公开装备  ·  类型学' },
    title: { en: 'Liaoning, Shandong, and Fujian', zh: '辽宁舰、山东舰与福建舰' },
    body: {
      en: 'Liaoning was officially commissioned in 2012, Shandong in 2019. Fujian was officially launched in June 2022 and commissioned at an official ceremony on 5 November 2025. A navy spokesperson said trials and ship-aircraft training would continue after commissioning. The silhouette is typological, not a berth.',
      zh: '辽宁舰二〇一二年入列，山东舰二〇一九年入列。福建舰二〇二二年六月下水，二〇二五年十一月五日举行入列授旗仪式。海军发言人表示，入列后仍将继续试验与舰机训练。剪影为类型学示意，不是泊位。',
    },
    note: {
      en: 'Official induction and launch/commissioning reports (Xinhua, Ministry of National Defense). No operational readiness claim is added.',
      zh: '依据新华社与国防部等官方入列、下水报道。不额外断言形成战斗力的时间。',
    },
  },
  {
    id: 'type055',
    kicker: { en: 'Public platforms  ·  typological', zh: '公开装备  ·  类型学' },
    title: { en: 'Type 055, first ship officially commissioned', zh: '〇五五型首舰官方入列' },
    body: {
      en: 'Nanchang, the first Type 055 destroyer, was officially commissioned on 12 January 2020, as reported by Xinhua and the Ministry of National Defense. Later ships of the class have also been publicly shown. This mark does not count a complete inventory.',
      zh: '〇五五型驱逐舰首舰南昌舰于二〇二〇年一月十二日正式入列，见新华社与国防部报道。同型后续舰也有公开亮相。此标记并不清点完整艘数。',
    },
    note: {
      en: 'Typological silhouette, not a hull at a named yard.',
      zh: '类型学剪影，不是某船厂里的一艘舰。',
    },
  },
  {
    id: 'j20',
    kicker: { en: 'Public platforms  ·  typological', zh: '公开装备  ·  类型学' },
    title: { en: 'J-20, officially in service', zh: '歼-20，官方已经列装' },
    body: {
      en: 'Official statements in 2017 and 2018 confirmed that the J-20 had been inducted into PLA Air Force combat units. It has been displayed at official parades and air shows. The mark is typological, not an airfield.',
      zh: '二〇一七年、二〇一八年的官方表态确认，歼-20已列装空军作战部队，并在官方阅兵和航展中展示过。此标记为类型学位置，不是机场。',
    },
    note: {
      en: 'No inventory of aircraft or bases is given.',
      zh: '不清点机数，不标基地。',
    },
  },
] as const

export const INDUSTRY_CARDS = [
  {
    id: 'bohai',
    kicker: { en: 'Industry region  ·  typological', zh: '产业带  ·  类型学' },
    title: { en: 'Bohai-rim industrial region', zh: '渤海沿岸产业带' },
    body: {
      en: 'A typological coastal industrial region, used here to stand for publicly discussed shipbuilding and heavy-industry capacity around the Bohai rim. It is not a yard, a berth, or a named plant.',
      zh: '沿海产业带的类型学标记，用以提示公开讨论中渤海沿岸的造船与重工业能力。不是某一船厂、泊位或厂区。',
    },
    note: {
      en: 'Schematic region only.',
      zh: '仅为示意地域。',
    },
  },
  {
    id: 'yangtze',
    kicker: { en: 'Industry region  ·  typological', zh: '产业带  ·  类型学' },
    title: { en: 'Yangtze-mouth industrial region', zh: '长江口产业带' },
    body: {
      en: 'A typological mark for the publicly discussed industrial belt near the mouth of the Yangtze. Not a shipyard coordinate.',
      zh: '用以提示公开讨论中长江口一带产业带的类型学标记，不是船厂坐标。',
    },
    note: {
      en: 'Schematic region only.',
      zh: '仅为示意地域。',
    },
  },
  {
    id: 'pearl',
    kicker: { en: 'Industry region  ·  typological', zh: '产业带  ·  类型学' },
    title: { en: 'Southern coastal industrial region', zh: '南部沿海产业带' },
    body: {
      en: 'A typological coastal region standing for publicly discussed shipbuilding and aviation-industrial capacity in the south. Not a dock or an airfield.',
      zh: '南部沿海产业带的类型学标记，用以提示公开讨论中的造船与航空工业能力。不是码头，也不是机场。',
    },
    note: {
      en: 'Schematic region only.',
      zh: '仅为示意地域。',
    },
  },
] as const


export const REVIEW_CARDS = [
  {
    id: 'review-plan',
    kicker: { en: 'Typological review  ·  official carriers, estimated total', zh: '类型学阅舰式  ·  航母为官方公布，总艘数为外部估计' },
    title: { en: 'People’s Liberation Army Navy', zh: '人民海军' },
    body: {
      en: 'Three typological carrier silhouettes stand for the officially inducted Liaoning (commissioned 25 September 2012), Shandong (17 December 2019), and Fujian (launch June 2022; official commissioning and flag-presentation 5 November 2025). A PLAN spokesperson said trials and ship-aircraft training would continue after commissioning. No fourth carrier is shown. The “370+” badge and the field of thirty-seven typological marks (1 mark ≈ 10 ships, rounded) repeat the already-checked wording of the US Defense Department’s Military and Security Developments Involving the PRC 2024: numerically the world’s largest navy, a battle force of more than 370 ships and submarines, including more than 140 major surface combatants. That is an external estimate, not a 1:1 field of hulls, and not a live position. A 2025 edition of the report exists; this tour does not invent a newer PLAN hull count from it. Type 055 and amphibious silhouettes in this column are typological 示意, not an inventory.',
      zh: '三艘类型学航母剪影，对应已正式入列的辽宁舰（2012年9月25日）、山东舰（2019年12月17日）与福建舰（2022年6月下水，2025年11月5日入列授旗）。海军发言人说明，入列后还要继续试验与舰机训练。此处不画第四艘。「370+」徽标与三十七个比例单位（一标约十艘，四舍五入），沿用美国国防部《中国军事与安全发展报告》2024年版已经核对过的表述：按舰艇数量计为世界最大海军，战斗舰艇与潜艇合计三百七十艘以上，其中主要水面战斗舰艇一百四十艘以上。这是外部估计，不是一比一清点，也不是实时位置。同一系列2025年版已经发布；本导览不从中另造更新的人民海军艘数。本列的〇五五型与两栖舰剪影只作类型学示意，不是编成总数。',
    },
    note: {
      en: 'Official carrier count; broader hull total is an external estimate under a US definition that is not the same as the official US battle-force figure. Typological mid-Pacific placement, not a station or a track.',
      zh: '航母艘数为官方公布；更宽的总艘数是美国口径下的外部估计，与美国海军官方战斗舰艇数字不可直接对照。太平洋中部的类型学位置，不是驻地或航迹。',
    },
  },
  {
    id: 'review-us',
    kicker: { en: 'Typological review  ·  official announcement', zh: '类型学阅舰式  ·  官方公布' },
    title: { en: 'United States Navy', zh: '美国海军' },
    body: {
      en: 'Eleven typological CVN silhouettes follow CRS Report RS20643, updated 4 December 2025: “The Navy’s current aircraft carrier force consists of 11 CVNs, including 10 Nimitz-class ships (CVNs 68 through 77) that entered service between 1975 and 2009, and one Gerald R. Ford (CVN-78) class ship that was commissioned into service on July 22, 2017.” CVN-79 (John F. Kennedy) is scheduled for delivery in March 2027 in the Navy FY2026 budget submission cited by that report, and is not shown. The “293” badge and the field of twenty-nine typological marks (1 mark ≈ 10 ships, rounded) are the official US battle-force total as of 1 October 2025, from CRS Report RL32665 — not 293 individual hulls, and not a live position. That official figure is not under the same definition as the 2024 DoD wording on the PLAN, and the two are not stacked as like-for-like inventories.',
      zh: '十一艘类型学核动力航母剪影，依据美国国会研究处报告 RS20643（2025年12月4日更新）：现役航母为十一艘核动力航母，其中包括一九七五年至二〇〇九年入列的十艘尼米兹级（CVN-68至CVN-77），以及二〇一七年七月二十二日入列的一艘福特号（CVN-78）。同一报告所引海军二〇二六财年预算，肯尼迪号（CVN-79）计划于二〇二七年三月交付，故不画第十二艘。「293」徽标与二十九个比例单位（一标约十艘，四舍五入），是国会研究处报告 RL32665 所记、截至二〇二五年十月一日的美国海军官方战斗舰艇数字，不是二百九十三艘舰的一比一清点，也不是实时位置。这一官方数字与美国国防部二〇二四年对人民海军的表述口径不同，故不叠成同一口径的对照柱。',
    },
    note: {
      en: 'Official US figures, cited with their dates. Typological mid-Pacific placement, not a station or a track. 10 U.S.C. 8062(b) requires not less than eleven operational carriers; that statutory floor is not a substitute for the inventory sentence used here.',
      zh: '美国官方数字，并写明截至日期。太平洋中部的类型学位置，不是驻地或航迹。美国法典第十编第8062(b)条要求作战航母不少于十一艘，那是法定下限，不能代替此处所引的现役清点句。',
    },
  },
  {
    id: 'review-japan',
    kicker: { en: 'Typological review  ·  official announcement', zh: '类型学阅舰式  ·  官方公布' },
    title: { en: 'Japan Maritime Self-Defense Force', zh: '日本海上自卫队' },
    body: {
      en: 'The badge cites the official table in the Reiwa 7 (2025) Defense of Japan white paper, Materials 7, “numbers of major vessels in commission,” as of 31 March 2025: 51 escort vessels (護衛艦), 22 submarines, 20 mine-warfare vessels, 6 patrol vessels, 11 transport vessels, and 30 auxiliary vessels. Spoken narration leads with the 51 escorts and 22 submarines, shown as five typological scale marks plus two typological sub-tokens (1 mark ≈ 10 ships, rounded), not 51 or 22 individual hulls. The two typological large-deck silhouettes at the head of this column are official escort vessels (including the Izumo and Kaga class, officially 護衛艦 / DDH), clearly not relabeled as aircraft carriers. Official F-35B modification and testing is a matter of public official activity; this tour does not convert the official category. These official escort and submarine counts are a narrower definition than the PLAN 370+ estimate or the official US battle-force total, and are not stacked as like-for-like inventories.',
      zh: '徽标数字引自令和七年（2025）《防卫白书》资料7「主要舰艇的就役数」，截至2025年3月31日：护卫舰51艘、潜艇22艘、水雷舰艇20艘、巡逻舰艇6艘、运输舰艇11艘、辅助舰艇30艘。解说以护卫舰51艘、潜艇22艘为主要官方数字，画面上用五标加两标（一标约十艘，四舍五入），不是五十一或二十二艘的一比一清点。列队前端的两艘类型学大甲板剪影，是官方护卫舰（包括出云、加贺所在的护卫舰 / DDH 类别），明确不改称航空母舰。官方已公开进行的 F-35B 改装与试验，只作为已经公开的官方活动提及，本导览不因此改写官方类别。这一官方护卫舰与潜艇口径，比人民海军370+的外部估计、以及美国官方战斗舰艇总数都更窄，不能当成同一口径的对照柱。',
    },
    note: {
      en: 'Official white-paper categories, as of 31 March 2025. Typological mid-Pacific placement, not a station or a track.',
      zh: '官方白书口径，截至2025年3月31日。太平洋中部的类型学位置，不是驻地或航迹。',
    },
  },
  {
    id: 'review-australia',
    kicker: { en: 'Typological review  ·  official announcement', zh: '类型学阅舰式  ·  官方公布' },
    title: { en: 'Royal Australian Navy', zh: '澳大利亚海军' },
    body: {
      en: 'The badge cites an official bundled category, not a whole-navy hull total. Defence Annual Report 2024–25, Table D.6, and the Portfolio Budget Statements 2024–25 list 16 major combatants for 2024–25, shown as two typological marks (1 mark ≈ 10 ships, rounded). Note 2 of that reporting defines the category: “Major combatants comprises Anzac Class frigates, Hobart Class guided missile destroyers and Collins Class submarines.” Surface combatants and submarines are counted together under that official definition. This is not comparable to the official US battle-force total or to the 2024 DoD wording on the PLAN, and is not a live position.',
      zh: '徽标所引的是官方捆绑口径，不是全海军总艘数。澳大利亚国防部《2024–25年度报告》表 D.6，以及 2024–25 年预算说明书，把 2024–25 年度的主要作战舰艇列为 16 艘，画面上用两标表示（一标约十艘，四舍五入）。该报告注释 2 写明：主要作战舰艇包括安扎克级护卫舰、霍巴特级导弹驱逐舰和柯林斯级潜艇。水面作战舰与潜艇在这一官方口径下算在一起。它与美国海军官方战斗舰艇数字、以及美国国防部 2024 年对人民海军的表述，都不可直接对照，也不是实时位置。',
    },
    note: {
      en: 'Official 2024–25 definition, cited as a bundled category. Typological mid-Pacific placement, not a station or a track.',
      zh: '2024–25 年官方口径，作为捆绑类别引用。太平洋中部的类型学位置，不是驻地或航迹。',
    },
  },
  {
    id: 'review-rok',
    kicker: { en: 'Typological review  ·  schematic column only', zh: '类型学阅舰式  ·  仅作示意编队' },
    title: { en: 'Republic of Korea Navy', zh: '韩国海军' },
    body: {
      en: 'This column is typological only. No hull total is invented for the Republic of Korea Navy. The short typological cluster is a ceremonial 示意编队, not on the ten-ship scale used for published totals, not an inventory, and not a live position.',
      zh: '本列仅为类型学示意。本导览不为韩国海军另造舰艇总数。短示意簇不是用于已公布艘数的「一标约十艘」比例单位，不是清点，也不是实时位置。',
    },
    note: {
      en: 'No GFP-style count. Typological mid-Pacific placement, not a station or a track.',
      zh: '不采用全球火力一类的清点。太平洋中部的类型学位置，不是驻地或航迹。',
    },
  },
  {
    id: 'review-russia',
    kicker: { en: 'Typological review  ·  schematic column only', zh: '类型学阅舰式  ·  仅作示意编队' },
    title: { en: 'Russian Pacific Fleet', zh: '俄罗斯太平洋舰队' },
    body: {
      en: 'This column is typological only. No hull total is invented for the Russian Pacific Fleet. The short typological cluster is a ceremonial 示意编队, not on the ten-ship scale used for published totals, not an inventory, and not a live position.',
      zh: '本列仅为类型学示意。本导览不为俄罗斯太平洋舰队另造舰艇总数。短示意簇不是用于已公布艘数的「一标约十艘」比例单位，不是清点，也不是实时位置。',
    },
    note: {
      en: 'No invented inventory. Typological mid-Pacific placement, not a station or a track.',
      zh: '不另造清单。太平洋中部的类型学位置，不是驻地或航迹。',
    },
  },
] as const

export const ESTIMATE_CARDS = [
  {
    id: 'china',
    kicker: { en: 'External estimate  ·  typological', zh: '外部估计  ·  类型学' },
    title: { en: 'China  ·  a schematic reading', zh: '中国  ·  示意对照' },
    body: {
      en: 'IISS The Military Balance 2026, in an open summary of active forces during 2025, lists about 2.035 million personnel. China does not publish a detailed public end-strength table; this tour still treats that figure as an order of two million. SIPRI estimates 2025 spending at [336] billion dollars — a broader definition than the official 2026 budget of 1.94 trillion yuan already introduced. FlightGlobal World Air Forces 2026 counts 1,814 combat aircraft. The US Defense Department’s 2024 public report described the PLAN as numerically the world’s largest navy, with a battle force of more than 370 ships and submarines, including more than 140 major surface combatants. A 2025 edition of that report exists; this tour does not invent a newer PLAN hull count from it. CRS, as of 1 October 2025, gives an official US Navy battle-force total of 293 ships; the definitions are not the same, so the two figures are not stacked. A typological Pacific fleet review in the next beat shows official carriers 1:1, without planting 370 or 293 individual hulls.',
      zh: '国际战略研究所《军事平衡》二〇二六年版的公开转述，把二〇二五年现役约写成二百零三点五万人。中国不公布一份很细的公开兵力总表；本导览仍只把它当作约二百万人这个量级。SIPRI对二〇二五年军费的估计为三千三百六十亿美元，口径宽于前面已经介绍的二〇二六年官方预算一点九四万亿元。飞行国际《世界空军》二〇二六年版计入作战飞机一千八百一十四架。美国国防部二〇二四年公开报告，把人民海军写成按舰艇数量计的世界最大海军，战斗舰艇与潜艇合计三百七十艘以上，其中主要水面战斗舰艇一百四十艘以上。同一系列二〇二五年报告已经发布；本导览不从中另造更新的人民海军艘数。美国国会研究处写明，截至二〇二五年十月一日，美国海军战斗舰艇为二百九十三艘；口径不同，故不叠成一根柱子。下一场太平洋类型学阅舰式按官方航母一比一出示，而不会把三百七十或二百九十三画成一片舰艇。',
    },
    note: {
      en: 'All three globe columns are hatched external estimates. Schematic regional mark, not a headquarters or a base.',
      zh: '地球上的三根柱子都是阴影，表示外部估计。类型学地区标记，不是总部或基地。',
    },
  },
  {
    id: 'india',
    kicker: { en: 'External estimate  ·  typological', zh: '外部估计  ·  类型学' },
    title: { en: 'India  ·  a schematic reading', zh: '印度  ·  示意对照' },
    body: {
      en: 'IISS open summary of The Military Balance 2026: about 1.501 million active personnel in 2025. SIPRI Table 1: 92.1 billion dollars in 2025. FlightGlobal World Air Forces 2026: 600 combat aircraft. All three are external counts under those published definitions.',
      zh: '国际战略研究所《军事平衡》二〇二六年版公开转述：二〇二五年现役约一百五十点一万人。SIPRI表1：二〇二五年九百二十一亿美元。飞行国际《世界空军》二〇二六年版：作战飞机六百架。三项都是按各公表口径所作的外部清点。',
    },
    note: {
      en: 'Hatched = external estimate. Typological mark in central India, not a headquarters.',
      zh: '阴影 = 外部估计。印度中部的类型学标记，不是总部。',
    },
  },
  {
    id: 'united-states',
    kicker: { en: 'External estimate  ·  typological', zh: '外部估计  ·  类型学' },
    title: { en: 'United States  ·  a schematic reading', zh: '美国  ·  示意对照' },
    body: {
      en: 'IISS open summary of The Military Balance 2026: about 1.340 million active personnel in 2025. SIPRI Table 1: 954 billion dollars in 2025, the world’s largest total that year. FlightGlobal World Air Forces 2026: 2,718 combat aircraft. The same directory gives a US all-aircraft total of 13,033, about a quarter of a world total of 52,231; that broader total is not interchangeable with the combat-aircraft column. CRS reports that as of 1 October 2025 the US Navy included 293 battle force ships. That official US figure is not under the same definition as the 2024 DoD wording on the PLAN, and the two are not stacked here. Official carriers appear 1:1 in the typological Pacific review that follows; the 293 total is a badge, not a field of hulls.',
      zh: '国际战略研究所《军事平衡》二〇二六年版公开转述：二〇二五年现役约一百三十四万人。SIPRI表1：二〇二五年九千五百四十亿美元，为当年世界最高。飞行国际《世界空军》二〇二六年版：作战飞机二千七百一十八架。同一名录所记美国军用飞机总数为一万三千零三十三架，约占世界五万二千二百三十一架的四分之一；这一总数与作战飞机栏不可混用。美国国会研究处写明，截至二〇二五年十月一日，美国海军战斗舰艇为二百九十三艘。这一官方数字与美国国防部二〇二四年对人民海军的表述口径不同，故不叠在一起比较。随后的太平洋类型学阅舰式按官方航母一比一出示；二百九十三是徽标，不是一片舰艇。',
    },
    note: {
      en: 'Hatched = external estimate on the globe. Typological mark in the continental interior, not a base.',
      zh: '地球上的阴影柱为外部估计。大陆内部的类型学标记，不是基地。',
    },
  },
  {
    id: 'north-korea',
    kicker: { en: 'External estimate  ·  typological', zh: '外部估计  ·  类型学' },
    title: { en: 'North Korea  ·  a schematic reading', zh: '朝鲜  ·  示意对照' },
    body: {
      en: 'IISS open summary of The Military Balance 2026: about 1.280 million active personnel in 2025. SIPRI’s 2025 fact-sheet Table 1 does not publish a 2025 expenditure figure for North Korea, so this tour plants no spending column. FlightGlobal World Air Forces 2026: 455 combat aircraft, an external count under that directory’s definition. No official public end-strength table is used here.',
      zh: '国际战略研究所《军事平衡》二〇二六年版公开转述：二〇二五年现役约一百二十八万人。SIPRI二〇二五年概况表1未公布朝鲜当年军费，故本导览不立军费柱。飞行国际《世界空军》二〇二六年版计入作战飞机四百五十五架，这是该目录口径下的外部清点。此处不采用一份官方公开兵力总表。',
    },
    note: {
      en: 'National typological mark, not a base and not a headquarters city.',
      zh: '全国性的类型学标记，不是基地，也不是总部城市。',
    },
  },
  {
    id: 'russia',
    kicker: { en: 'External estimate  ·  typological', zh: '外部估计  ·  类型学' },
    title: { en: 'Russia  ·  a schematic reading', zh: '俄罗斯  ·  示意对照' },
    body: {
      en: 'IISS open summary of The Military Balance 2026: about 1.264 million active personnel in 2025. SIPRI Table 1 estimates 2025 spending at [190] billion dollars. FlightGlobal World Air Forces 2026: 1,559 combat aircraft. All three are external figures. The mark sits in the interior, not at a capital or a headquarters.',
      zh: '国际战略研究所《军事平衡》二〇二六年版公开转述：二〇二五年现役约一百二十六点四万人。SIPRI表1对二〇二五年军费的估计为一千九百亿美元。飞行国际《世界空军》二〇二六年版：作战飞机一千五百五十九架。三项都是外部数字。标记落在内陆，不是首都或总部。',
    },
    note: {
      en: 'Hatched = external estimate. Schematic only.',
      zh: '阴影 = 外部估计。仅为示意。',
    },
  },
  {
    id: 'south-korea',
    kicker: { en: 'External estimate  ·  typological', zh: '外部估计  ·  类型学' },
    title: { en: 'South Korea  ·  a schematic reading', zh: '韩国  ·  示意对照' },
    body: {
      en: 'IISS open summary of The Military Balance 2026: about 450,000 active personnel in 2025. SIPRI Table 1: 47.8 billion dollars in 2025. FlightGlobal World Air Forces 2026: 340 combat aircraft. This is a national comparison mark, not the sibling-journey interface and not a campaign map.',
      zh: '国际战略研究所《军事平衡》二〇二六年版公开转述：二〇二五年现役约四十五万人。SIPRI表1：二〇二五年四百七十八亿美元。飞行国际《世界空军》二〇二六年版：作战飞机三百四十架。这是全国性的对照标记，不是平行导览接口，也不是战役图。',
    },
    note: {
      en: 'Offset from the 1950–53 interface mark. Typological, not a headquarters.',
      zh: '与一九五〇到五三年接口标记错开。类型学位置，不是总部。',
    },
  },
  {
    id: 'japan',
    kicker: { en: 'External estimate  ·  typological', zh: '外部估计  ·  类型学' },
    title: { en: 'Japan  ·  a schematic reading', zh: '日本  ·  示意对照' },
    body: {
      en: 'IISS open summary of The Military Balance 2026: about 247,000 active personnel in 2025. SIPRI Table 1: 62.2 billion dollars in 2025. FlightGlobal World Air Forces 2026: 264 combat aircraft. The mark is typological, on central Honshu, not a base or a capital.',
      zh: '国际战略研究所《军事平衡》二〇二六年版公开转述：二〇二五年现役约二十四万七千人。SIPRI表1：二〇二五年六百二十二亿美元。飞行国际《世界空军》二〇二六年版：作战飞机二百六十四架。标记为本州中部的类型学位置，不是基地或首都。',
    },
    note: {
      en: 'Hatched = external estimate.',
      zh: '阴影 = 外部估计。',
    },
  },
  {
    id: 'france',
    kicker: { en: 'External estimate  ·  typological', zh: '外部估计  ·  类型学' },
    title: { en: 'France  ·  a schematic reading', zh: '法国  ·  示意对照' },
    body: {
      en: 'IISS open summary of The Military Balance 2026: about 204,000 active personnel in 2025. SIPRI Table 1: 68.0 billion dollars in 2025. FlightGlobal World Air Forces 2026: 223 combat aircraft. The mark is typological, in central France, not a headquarters.',
      zh: '国际战略研究所《军事平衡》二〇二六年版公开转述：二〇二五年现役约二十万四千人。SIPRI表1：二〇二五年六百八十亿美元。飞行国际《世界空军》二〇二六年版：作战飞机二百二十三架。标记为法国中部的类型学位置，不是总部。',
    },
    note: {
      en: 'Hatched = external estimate.',
      zh: '阴影 = 外部估计。',
    },
  },
  {
    id: 'germany',
    kicker: { en: 'External estimate  ·  spending chart', zh: '外部估计  ·  军费对照' },
    title: { en: 'Germany  ·  on the spending chart', zh: '德国  ·  见于军费对照' },
    body: {
      en: 'Germany is among SIPRI’s top spenders in 2025, at 114 billion dollars (Table 1), and so appears on the scroll’s spending chart. It is not planted as a personnel cluster on the globe. FlightGlobal World Air Forces 2026 counts 190 combat aircraft. No IISS active-personnel figure from the locked open summary is shown here, because that list was not used as a source for Germany.',
      zh: '德国是SIPRI二〇二五年军费居前的国家之一，表1列为一千一百四十亿美元，故出现在卷轴的军费对照中。地球上不立人数柱。飞行国际《世界空军》二〇二六年版计入作战飞机一百九十架。本导览未采用那份已核对公开转述中的德国现役人数，故不在此另写人数。',
    },
    note: {
      en: 'Chart only. Not a globe column, and not a headquarters mark.',
      zh: '仅见于对照表。不是地球上的柱群，也不是总部标记。',
    },
  },
  {
    id: 'united-kingdom',
    kicker: { en: 'External estimate  ·  spending chart', zh: '外部估计  ·  军费对照' },
    title: { en: 'United Kingdom  ·  on the spending chart', zh: '英国  ·  见于军费对照' },
    body: {
      en: 'The United Kingdom is among SIPRI’s top spenders in 2025, at 89.0 billion dollars (Table 1), and so appears on the scroll’s spending chart. It was not in the Business Insider top-25 personnel list used for the IISS open summary, so this tour plants no personnel column and invents no end-strength figure. FlightGlobal World Air Forces 2026 counts 141 combat aircraft.',
      zh: '英国是SIPRI二〇二五年军费居前的国家之一，表1列为八百九十亿美元，故出现在卷轴的军费对照中。它不在本导览所据《商业内幕》IISS公开转述的现役人数前二十五名之列，故不立人数柱，也不另造兵力数字。飞行国际《世界空军》二〇二六年版计入作战飞机一百四十一架。',
    },
    note: {
      en: 'Chart only. Not a globe column, and not a headquarters mark.',
      zh: '仅见于对照表。不是地球上的柱群，也不是总部标记。',
    },
  },
] as const

export const DOCTRINE_CARDS = [
  {
    id: 'vocabulary',
    kicker: { en: 'Official public vocabulary', zh: '官方公开词汇' },
    title: { en: 'World-class, joint, and intelligentized', zh: '世界一流、联合与智能化' },
    body: {
      en: 'Official public language includes building a world-class military; the fused development of mechanization, informatization, and intelligentization; and joint operations. Xi Jinping Thought on Strengthening the Military is cited only as official public framing, not as a private primer.',
      zh: '官方公开表述包括建设世界一流军队，机械化信息化智能化融合发展，以及联合作战。习近平强军思想在此只作为官方公开表述提及，不是内部读本。',
    },
    note: {
      en: 'Public programs and official vocabulary only.',
      zh: '只涉及公开规划与官方词汇。',
    },
  },
] as const

export const INTERFACE_CARDS = [
  {
    id: 'korea-interface',
    kicker: { en: 'Sibling journey  ·  interface only', zh: '平行导览  ·  仅作接口' },
    title: { en: '1950–53, on another journey', zh: '一九五〇到五三年，在另一条线上' },
    body: {
      en: 'The Korean War of 1950–53 is another calibration point on this same Earth. It is not told in this chapter. A later sibling journey can take that window. This mark is a regional interface, not a campaign map and not a battlefield reconstruction.',
      zh: '一九五〇到五三年的朝鲜战争，是这颗地球上另一个校准点。本章不讲述它。一条后续的平行导览可以接过那段时间。此标记只是地区性接口，不是战役图，也不是战场复原。',
    },
    note: {
      en: 'A hook for a future journey, not an implementation of it.',
      zh: '为未来导览留下接口，不是已经实现的那一章。',
    },
  },
] as const

export const SOURCE_SECTIONS = [
  {
    title: { en: 'How to read this baseline', zh: '如何阅读这条基线' },
    paragraphs: [
      {
        en: 'This is a popular-science tour on a public baseline, not an intelligence briefing. Official announcements (NPC, Ministry of National Defense, Xinhua, State Council Information Office, Ministry of Finance) are labeled 官方公布 / official announcement. Figures from IISS, SIPRI, and the US Department of Defense are labeled 外部估计 / external estimate. Where a 2026 official number is not yet published, the latest confirmed year is used and dated. No number and no page reference is invented. No classified material, no targeting guide, and no campaign plan — including any Taiwan or other contingency how-to — belongs in this tour.',
        zh: '这是一条面向听众的公开基线科普导览，不是情报简报。全国人大、国防部、新华社、国务院新闻办、财政部等官方公布，标为「官方公布」。国际战略研究所、斯德哥尔摩国际和平研究所、美国国防部的数字，标为「外部估计」。若二〇二六年的官方数字尚未公布，则使用能够核对的最近年份，并写明截至某年。不虚造数字，也不虚造页码。本导览不含机密材料、目标指南或战役计划，尤其不包括任何关于台湾或其他作战预案的做法说明。',
      },
    ],
  },
  {
    title: { en: 'Official PRC sources', zh: '中国官方信源' },
    items: [
      {
        en: 'State Council Information Office, China’s National Defense in the New Era (July 2019). Official English title of 《新时代的中国国防》. As of 2026 this remains the most recent comprehensive defense white paper. Later official white papers on arms control (2025) and national security are not substitutes for a new comprehensive defense white paper.',
        zh: '国务院新闻办公室，《新时代的中国国防》（2019年7月），官方英译 China’s National Defense in the New Era。截至2026年，这仍是最近一份全面的国防白皮书。此后关于军控（2025）或国家安全的白皮书，不能代替一份新的全面国防白皮书。',
      },
      {
        en: 'Official establishment of the five theater commands on 1 February 2016, replacing the former military regions, as reported by official outlets including the Chinese government website and Xinhua.',
        zh: '2016年2月1日正式成立东部、南部、西部、北部、中部五大战区，取代原军区。见中国政府网、新华社等官方报道。',
      },
      {
        en: '19 April 2024: official ceremony founding the Information Support Force; the designation of the Strategic Support Force was abolished; leadership and management of the Military Aerospace Force and the Cyberspace Force were adjusted. Ministry of National Defense briefing the same day on the new layout of services and arms under the Central Military Commission, including the Joint Logistic Support Force. See the Chinese government website and Xinhua.',
        zh: '2024年4月19日：信息支援部队成立大会；同时撤销战略支援部队番号，并调整军事航天部队、网络空间部队领导管理关系。国防部当天介绍中央军委领导指挥下的新军兵种布局，其中包括联勤保障部队。见中国政府网与新华社。',
      },
      {
        en: '2026 official defense budget: national general public budget defense expenditure of 1.94 trillion yuan, up 6.9% from the previous year’s executed figure; central-level expenditure 1.91 trillion yuan, up 7%. Stated by Zhang Xiaogang, spokesperson for the PLA and PAP delegation, 10 March 2026 (Ministry of National Defense; also carried by People’s Daily). The Ministry of Finance 2026 central general public budget expenditure table lists 190,956.1 million yuan for central-level defense (published 24 March 2026). The budget report was approved by the fourth session of the 14th NPC on 12 March 2026.',
        zh: '2026年官方国防预算：全国一般公共预算安排国防支出1.94万亿元，比上年执行数增长6.9%；其中中央本级1.91万亿元，增长7%。见2026年3月10日解放军和武警部队代表团新闻发言人张晓刚说明（国防部网站，人民网转载）。财政部《2026年中央一般公共预算支出预算表》列中央本级国防支出19095.61亿元（2026年3月24日公布）。预算报告于2026年3月12日经十四届全国人大四次会议批准。',
      },
      {
        en: 'Liaoning officially commissioned 25 September 2012; Shandong officially commissioned 17 December 2019 (official Xinhua / government reports). Fujian officially launched and named in June 2022; official commissioning and flag-presentation ceremony on 5 November 2025 (Xinhua; Chinese government website). PLAN spokesperson remarks after commissioning, that trials and ship-aircraft integration training would continue (Ministry of National Defense, 8 November 2025).',
        zh: '辽宁舰2012年9月25日正式交接入列；山东舰2019年12月17日正式交接入列（新华社 / 中国政府网）。福建舰2022年6月下水命名；2025年11月5日举行入列授旗仪式（新华社、中国政府网）。海军新闻发言人在入列后说明，仍将继续试验验证与舰机适配训练（国防部，2025年11月8日）。',
      },
      {
        en: 'Type 055 first ship Nanchang officially commissioned 12 January 2020 (Xinhua; Ministry of National Defense). J-20: official confirmation of induction into PLAAF combat units in 2017–2018 (Ministry of National Defense / Xinhua), and later official parade and air-show displays.',
        zh: '〇五五型首舰南昌舰于2020年1月12日正式入列（新华社、国防部）。歼-20于2017–2018年由国防部 / 新华社确认列装空军作战部队，此后亦在官方阅兵和航展中展示。',
      },
    ],
  },
  {
    title: { en: 'Official foreign and US figures used in the fleet review', zh: '阅舰式所用的外国与美国官方数字' },
    items: [
      {
        en: 'Congressional Research Service, RS20643, Navy Ford (CVN-78) Class Aircraft Carrier Program: Background and Issues for Congress, updated 4 December 2025: “The Navy’s current aircraft carrier force consists of 11 CVNs, including 10 Nimitz-class ships (CVNs 68 through 77) that entered service between 1975 and 2009, and one Gerald R. Ford (CVN-78) class ship that was commissioned into service on July 22, 2017.” CVN-79 (John F. Kennedy) is scheduled for delivery in March 2027 in the Navy FY2026 budget submission cited by that report, and is not treated as delivered. 10 U.S.C. 8062(b) requires not less than 11 operational carriers; that statutory floor is not a substitute for the inventory sentence. Later public reporting (USNI News, 14 March 2026) said the Navy extended USS Nimitz to 2027 to align with JFK delivery; this tour still treats the in-commission force as 11 and does not invent a later official table. https://www.congress.gov/crs_external_products/RS/HTML/RS20643.web.html',
        zh: '美国国会研究处报告 RS20643《福特级（CVN-78）航空母舰计划》（2025年12月4日更新）写明：海军现役航母为 11 艘核动力航母，其中包括 1975 至 2009 年入列的 10 艘尼米兹级（CVN-68 至 CVN-77），以及 2017 年 7 月 22 日入列的 1 艘福特号（CVN-78）。同一报告所引海军 2026 财年预算，肯尼迪号（CVN-79）计划于 2027 年 3 月交付，本导览不把它当作已经交付。美国法典第十编第 8062(b) 条要求作战航母不少于 11 艘，那是法定下限，不能代替现役清点句。此后公开报道（USNI News，2026 年 3 月 14 日）称海军将尼米兹号延至 2027 年，以衔接肯尼迪号交付；本导览仍把在役力量按 11 艘计，不另造更新的官方表。https://www.congress.gov/crs_external_products/RS/HTML/RS20643.web.html',
      },
      {
        en: 'Congressional Research Service, RL32665, Navy Force Structure and Shipbuilding Plans: Background and Issues for Congress: “As of October 1, 2025, the Navy included 293 battle force ships.” Official US figure, cited with that date. Definitions are not identical to the 2024 DoD wording on the PLAN, so 370 and 293 are not stacked as a scoreboard, and neither total is planted as individual hulls on the globe. https://www.congress.gov/crs_external_products/RL/HTML/RL32665.web.html',
        zh: '美国国会研究处报告 RL32665《海军兵力结构与造船计划》写明：截至 2025 年 10 月 1 日，美国海军战斗舰艇为 293 艘。这是官方数字，并写明该日期。口径与美国国防部 2024 年对人民海军的表述不同，故不把 370 与 293 叠成记分牌，也不在地球上把任一总数画成一艘艘的舰。https://www.congress.gov/crs_external_products/RL/HTML/RL32665.web.html',
      },
      {
        en: 'Japan Ministry of Defense, Defense of Japan 2025 (令和7年版《防衛白書》), Materials 7, “主要艦艇の就役数” / numbers of major vessels in commission, as of 31 March 2025: escort vessels (護衛艦) 51, submarines 22, mine-warfare vessels 20, patrol vessels 6, transport vessels 11, auxiliary vessels 30. Official table image: https://www.mod.go.jp/j/press/wp/wp2025/image/siryo052_2.gif (page https://www.mod.go.jp/j/press/wp/wp2025/html/ns007000.html). Izumo, Kaga, and the Hyuga class remain official 護衛艦 / DDH escort vessels in this tour; they are not relabeled as aircraft carriers.',
        zh: '日本防卫省，令和7年版《防卫白书》资料7「主要舰艇的就役数」，截至2025年3月31日：护卫舰51艘、潜艇22艘、水雷舰艇20艘、巡逻舰艇6艘、运输舰艇11艘、辅助舰艇30艘。官方表图：https://www.mod.go.jp/j/press/wp/wp2025/image/siryo052_2.gif（页面 https://www.mod.go.jp/j/press/wp/wp2025/html/ns007000.html）。出云、加贺及日向级在本导览中仍是官方护卫舰 / DDH，不改称航空母舰。',
      },
      {
        en: 'Australian Department of Defence, Defence Annual Report 2024–25, Table D.6, and Portfolio Budget Statements 2024–25: 16 major combatants for 2024–25. Note 2: “Major combatants comprises Anzac Class frigates, Hobart Class guided missile destroyers and Collins Class submarines.” This is a bundled official category (surface combatants plus submarines), not a whole-navy hull total, and not comparable to the official US battle-force figure or to the 2024 DoD wording on the PLAN. https://www.transparency.gov.au/publications/defence/department-of-defence/department-of-defence-annual-report-2024-25/appendix-d%3A-other-mandatory-information/unit-availability-days%2C-flying-hours-and-hydroscheme-products',
        zh: '澳大利亚国防部《2024–25年度报告》表 D.6，以及 2024–25 年预算说明书：2024–25 年度主要作战舰艇 16 艘。注释 2 写明：主要作战舰艇包括安扎克级护卫舰、霍巴特级导弹驱逐舰和柯林斯级潜艇。这是把水面作战舰与潜艇算在一起的官方捆绑口径，不是全海军总艘数，也不可与美国海军官方战斗舰艇数字或美国国防部 2024 年对人民海军的表述直接对照。https://www.transparency.gov.au/publications/defence/department-of-defence/department-of-defence-annual-report-2024-25/appendix-d%3A-other-mandatory-information/unit-availability-days%2C-flying-hours-and-hydroscheme-products',
      },
      {
        en: 'Other official carrier navies (including the United Kingdom, France, and India) exist outside this mid-Pacific typological frame. Their hulls are not placed in the review. The Republic of Korea Navy and the Russian Pacific Fleet appear only as typological columns; no hull total is invented for either.',
        zh: '在这场太平洋中部的类型学取景之外，仍有其他正式拥有航母的海军（包括英国、法国与印度）。它们的舰影不放入本次阅舰式。韩国海军与俄罗斯太平洋舰队只作为示意编队出现，不为二者另造舰艇总数。',
      },
    ],
  },
  {
    title: { en: 'External estimates', zh: '外部估计' },
    items: [
      {
        en: 'International Institute for Strategic Studies, The Military Balance 2026, as published by Business Insider, “The largest militaries in the world, ranked by the number of active troops,” updated 26 October 2026, explicitly citing IISS MB 2026 and active armed forces during 2025: China 2,035,000; India 1,501,000; United States 1,340,000; North Korea 1,280,000; Russia 1,264,000; South Korea 450,000; Japan 247,000; France 204,000. This journey could not independently inspect a printed IISS page number and does not invent one. The China figure is still treated as an order of two million. IISS “defense budget” figures in that same article are not used (they differ from SIPRI); the spending axis uses SIPRI only. URL: https://www.businessinsider.com/largest-militaries-ranked-by-size',
        zh: '国际战略研究所（IISS），The Military Balance 2026。见《商业内幕》2026年10月26日更新的公开转述《按现役人数排列的世界最大军队》，并写明引自 IISS《军事平衡》2026、口径为2025年现役：中国 2,035,000；印度 1,501,000；美国 1,340,000；朝鲜 1,280,000；俄罗斯 1,264,000；韩国 450,000；日本 247,000；法国 204,000。本导览未能核对印刷页码，故不虚造页码。对中国数字，仍只当作约两百万人量级。同一篇文章中的 IISS“国防预算”数字与 SIPRI 不同，本导览不采用；军费轴只用 SIPRI。https://www.businessinsider.com/largest-militaries-ranked-by-size',
      },
      {
        en: 'Stockholm International Peace Research Institute, Trends in World Military Expenditure, 2025 (fact sheet, April 2026; SIPRI Military Expenditure Database, April 2026), Table 1, current US dollars. United States 954; China [336]; Russia [190]; Germany 114; India 92.1; United Kingdom 89.0; France 68.0; Japan 62.2; South Korea 47.8; world 2,887. The top five accounted for 58% of world spending. Square brackets mark SIPRI estimates. Coverage is 2025, not a 2026 SIPRI figure. SIPRI’s China figure is broader than the official 2026 PRC budget. North Korea has no published 2025 figure in Table 1, so no spending column is shown. https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025 and https://www.sipri.org/sites/default/files/2026-04/2604_milex_2025.pdf',
        zh: '斯德哥尔摩国际和平研究所（SIPRI），Trends in World Military Expenditure, 2025（2026年4月概况；SIPRI 军费数据库 2026年4月）表1，当年美元：美国 954；中国 [336]；俄罗斯 [190]；德国 114；印度 92.1；英国 89.0；法国 68.0；日本 62.2；韩国 47.8；世界 2,887。前五名合计占世界军费 58%。方括号为 SIPRI 估计。覆盖至2025年，不是对2026年的估计。SIPRI 的中国数字口径宽于2026年官方预算。表1未公布朝鲜2025年数字，故不立军费柱。https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025 与 https://www.sipri.org/sites/default/files/2026-04/2604_milex_2025.pdf',
      },
      {
        en: 'FlightGlobal, World Air Forces 2026 (Cirium data, 1 October 2025), combat-aircraft column: United States 2,718; China 1,814; Russia 1,559; India 600; North Korea 455; South Korea 340; Japan 264; France 223; Germany 190; United Kingdom 141. The same directory gives a US all-aircraft total of 13,033, about 25% of a world total of 52,231; totals and combat counts are not interchangeable. The FlightGlobal directory page itself may be paywalled; this tour cites FlightGlobal as the source and corroborates the combat and total figures from the Air Museums Almanac (explicitly attributing FlightGlobal WAF 2026) and Aerospace Global News. https://airmuseums.co.uk/numbers/air-forces-of-the-world and https://aerospaceglobalnews.com/news/world-combat-aircraft-fleets-2026/',
        zh: '飞行国际（FlightGlobal），World Air Forces 2026（Cirium 数据，截至2025年10月1日）作战飞机栏：美国 2,718；中国 1,814；俄罗斯 1,559；印度 600；朝鲜 455；韩国 340；日本 264；法国 223；德国 190；英国 141。同一名录所记美国军用飞机总数为 13,033，约占世界 52,231 的 25%；总数与作战飞机不可混用。FlightGlobal 目录页可能需付费；本导览以 FlightGlobal 为出处，并用明确署名为该目录的 Air Museums Almanac 以及 Aerospace Global News 作公开核对。https://airmuseums.co.uk/numbers/air-forces-of-the-world 与 https://aerospaceglobalnews.com/news/world-combat-aircraft-fleets-2026/',
      },
      {
        en: 'US Department of Defense, Military and Security Developments Involving the People’s Republic of China 2024: describes the PLAN as numerically the world’s largest navy, with a battle force of more than 370 ships and submarines, including more than 140 major surface combatants. This is a US government external estimate. The 2025 annual report in the same series was released on 23 December 2025; this tour cites the 2024 hull-count wording it could verify and does not invent a newer PLAN count from the later edition. No operational, targeting, or contingency material from these reports is used. Navy hull totals are not stacked into a globe column, because definitions of “total ships” vary too widely. The typological Pacific fleet review that follows this scale beat shows official carriers 1:1 and keeps the 370+ / 293 figures as labeled badges, not a 1:1 field of hulls.',
        zh: '美国国防部《中国军事与安全发展报告》2024年版：将人民海军表述为按舰艇数量计的世界最大海军，战斗舰艇与潜艇合计 370 艘以上，其中主要水面战斗舰艇 140 艘以上。这是美国政府的外部估计。同一系列 2025 年版于 2025 年 12 月 23 日发布；本导览只引用能够核对的 2024 年艘数表述，不从后一版另造人民海军更新数字。这些报告中的作战、目标或预案内容，一概不采用。海军总艘数因口径差异过大，不在地球上叠成一根柱子。量级段之后的太平洋类型学阅舰式，按官方航母一比一出示，并把 370+ 与 293 作为已标明的徽标，而不是一比一的舰艇阵面。',
      },
      {
        en: 'Congressional Research Service, RL32665, Navy Force Structure and Shipbuilding Plans: Background and Issues for Congress: “As of October 1, 2025, the Navy included 293 battle force ships.” This official US figure is cited with that date and is not treated as comparable, under one definition, with the 2024 DoD wording on the PLAN. https://www.congress.gov/crs_external_products/RL/HTML/RL32665.web.html',
        zh: '美国国会研究处报告 RL32665《海军兵力结构与造船计划》写明：截至 2025 年 10 月 1 日，美国海军战斗舰艇为 293 艘。本导览按该日期引用这一官方数字，并不把它与美国国防部 2024 年对人民海军的表述当作同一口径下的对照。https://www.congress.gov/crs_external_products/RL/HTML/RL32665.web.html',
      },
    ],
  },
  {
    title: { en: 'Geographic cautions', zh: '地理审慎' },
    paragraphs: [
      {
        en: 'Every globe mark is regional or typological, with certainty set to regional or representative. Comparison columns in the scale beat stand at typological regional centroids — not capitals, headquarters, bases, or docks — and are labeled 示意 / schematic. Theater pins are centroids of theater areas, not headquarters. Industrial marks are coastal regions, not yards or berths. Equipment silhouettes are typological, not parked at a named dock or airfield. The typological Pacific fleet review is staged on an open mid-Pacific parade ground, not at a named port, base, or yard, and not along a first-island-chain or kill-chain arc; ships are schematic ceremonial columns, not live positions or a deployment plot. The western Pacific arc is a wide framing, not a defense perimeter and not a targeting plot. No missile site is marked. A modest mark on the Korean Peninsula in the closing beat is only an interface for a future sibling journey, not a reconstruction of 1950–53.',
        zh: '地球上每一处标记都是地区性或类型学的，确定性为 regional 或 representative。量级段的对照柱立在类型学地区中心，不是首都、总部、基地或码头，并标为「示意」。战区钉位是战区地域的中心，不是总部。工业标记是沿海产业带，不是船厂或泊位。装备剪影是类型学示意，不是停在某一码头或机场。太平洋类型学阅舰式布置在中部开阔水面的示意阅舰场上，不落在具名军港、基地或船厂，也不沿第一岛链或杀伤链弧线展开；舰影是示意的礼仪编队，不是实时位置，也不是部署图。西太平洋弧线是开阔取景，不是防区，也不是目标图。不标导弹阵地。收束段在朝鲜半岛上的轻微标记，只是为未来平行导览留下的接口，不是对一九五〇到五三年的复原。',
      },
    ],
  },
  {
    title: { en: 'Dating notes', zh: '年代说明' },
    paragraphs: [
      {
        en: 'The calendar cursor uses this project’s time model in src/utils/time.ts. The representative date is 2026-07-01 (noon UTC lighting). JavaScript Date is not used to invent civil dates. Where a figure belongs to 2024 or 2025, the copy says so rather than restating it as a 2026 official number.',
        zh: '时间光标使用本项目 src/utils/time.ts 的历法模型。代表性日期为 2026-07-01（世界时正午光照）。不用 JavaScript Date 来编造民用日期。属于 2024 或 2025 年的数字，会在解说里写明，而不会改写成 2026 年的官方数字。',
      },
    ],
  },
]
