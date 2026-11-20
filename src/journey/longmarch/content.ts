import { bi, type Copy, type SourceId } from './sources'
export type Unit = 'first' | 'red25' | 'fourth' | 'second'
export type Cue = { at: number; date: Copy; place: string; label: Copy; words: Copy; refs: SourceId[]; unit?: Unit }
type Beat = { id: string; short: Copy; title: Copy; cues: Cue[]; note?: Copy }
const cue = (at: number, date: Copy, place: string, label: Copy, words: Copy, refs: SourceId[], unit?: Unit): Cue => ({ at, date, place, label, words, refs, unit })
export const title = bi('红军长征','The Red Army’s Long March')
export const description = bi('沿四支队伍的不同路线，读懂红军为何出发、付出什么代价，又如何走向会师。','Follow four distinct routes to learn why the Red Army set out, what it cost, and how its forces reunited.')

export const beats: Beat[] = [
  { id:'atlas', short:bi('总览','Overview'), title:bi('四支队伍，不是一条路','Four forces, not one route'), cues:[
    cue(19361023,bi('1934—1936','1934–1936'),'all',bi('四条路线','Four routes'),bi(
      '长征不是一支队伍从起点走到终点。两年间，中央红军、红二十五军、红四方面军和后来组成红二方面军的队伍，从不同根据地出发。',
      'The Long March was not one army on one road. Over two years, the Central Red Army, the 25th Army, the Fourth Front Army, and the forces that would form the Second Front Army set out from different bases.'),['out','years']),
    cue(19351019,bi('1935年10月19日','19 OCT 1935'),'wuqi',bi('抵达陕北','Arrival in northern Shaanxi'),bi(
      '中央红军主力在一九三五年十月到达陕北吴起镇。但这不是整个长征的终点。',
      'The Central Red Army’s main force reached Wuqi in northern Shaanxi in October 1935. That was not the end of the Long March as a whole.'),['history'],'first'),
    cue(19361023,bi('1936年10月','OCT 1936'),'jiangtai',bi('三大主力会师','Reunion of the three front armies'),bi(
      '整整一年后，红一、二、四方面军才在会宁、将台堡等地先后会师。要讲清这一年之差，得从为什么出发讲起。',
      'A full year later, the First, Second and Fourth Front Armies reunited at Huining, Jiangtaibu and nearby sites. To understand that gap, start with why they left.'),['years','reunion']),
  ]},
  { id:'departure', short:bi('出发','Departure'), title:bi('为什么要离开根据地？','Why leave the base areas?'), cues:[
    cue(19341017,bi('1934年10月','OCT 1934'),'yudu',bi('离开中央苏区','Leaving the Central Soviet'),bi(
      '一九三四年秋，中央红军第五次反“围剿”失败，中央苏区已难以守住。十月，中央红军主力在江西于都一带集结渡河，离开根据地。',
      'In autumn 1934, the Central Red Army failed to repel the Nationalists’ fifth encirclement campaign. The Central Soviet had become untenable. In October the main force gathered near Yudu, Jiangxi, and crossed the river to leave the base.'),['out','history'],'first'),
    cue(19341116,bi('1934年11月16日','16 NOV 1934'),'hejia',bi('红二十五军另路出发','A separate departure'),bi(
      '程子华、吴焕先、徐海东等率红二十五军从河南罗山何家冲出发。他们离开的是鄂豫皖根据地，后来在陕南开辟了新根据地。',
      'Cheng Zihua, Wu Huanxian and Xu Haidong led the 25th Army out of Hejiachong, Henan. They left the Hubei–Henan–Anhui base and later established a new one in southern Shaanxi.'),['red25','xu'],'red25'),
  ]},
  { id:'xiang', short:bi('湘江','Xiang River'), title:bi('渡过去的代价','The cost of crossing'),
    note:bi('八万六千余和三万余是中央红军在两个时间点的兵力。差额不是湘江战役的阵亡人数，也不是全体红军的统计。','The figures over 86,000 and 30,000 describe one force at two points in time. Their difference is neither a death toll for the Xiang River battle nor a count for the whole Red Army.'),
    cues:[
    cue(19341201,bi('1934年11月下旬—12月初','LATE NOV–EARLY DEC 1934'),'xiang',bi('中央红军渡湘江','Crossing the Xiang River'),bi(
      '在广西北部，中央红军遇上湘江阻击。按《中国共产党的九十年》的记载，中央红军从出发时八万六千多人，减到渡过湘江时三万多人。',
      'In northern Guangxi, the Central Red Army met resistance on the Xiang River. Ninety Years of the CPC records that its strength fell from more than 86,000 at departure to just over 30,000 by the time it crossed.'),['history'],'first'),
    cue(19341201,bi('1934年末','LATE 1934'),'xiang',bi('后卫没有全数归来','The rearguard did not all return'),bi(
      '陈树湘率红三十四师掩护主力渡江。主力过去了，他的部队却被隔在江东，大部牺牲。陈树湘负伤被俘，未能生还。',
      'Chen Shuxiang led the 34th Division in covering the crossing. The main force got across, but his division was cut off east of the river and most of its soldiers were killed. Chen was wounded and captured; he did not survive.'),['xiang'],'first'),
  ]},
  { id:'zunyi', short:bi('改道','New course'), title:bi('黎平与遵义：改变计划','Liping and Zunyi: changing course'), cues:[
    cue(19341218,bi('1934年12月18日','18 DEC 1934'),'liping',bi('黎平改道','A new destination at Liping'),bi(
      '中央红军原计划去湘西北会合红二、红六军团。渡过湘江后，这条路已经很难走通。中共中央政治局在黎平决定改变计划，转向黔北。',
      'The original plan was to meet the Second and Sixth Corps in northwestern Hunan. After the Xiang River, that plan was increasingly hard to carry out. At Liping, the CPC Political Bureau decided to head for northern Guizhou instead.'),['history'],'first'),
    cue(19350117,bi('1935年1月15—17日','15–17 JAN 1935'),'zunyi',bi('遵义会议','Zunyi Conference'),bi(
      '遵义会议讨论此前的军事失利和领导问题，增选毛泽东为中央政治局常委。路线已经改变，指挥也随之调整。',
      'The Zunyi Conference addressed military setbacks and leadership. Mao Zedong was elected to the Political Bureau’s Standing Committee. The route had changed, and the command arrangements changed as well.'),['history','central'],'first'),
  ]},
  { id:'dawai', short:bi('相遇','Convergence'), title:bi('两路走到川西','Two forces meet in western Sichuan'), note:bi('达维先头部队的番号有不同记述：《中国共产党的九十年》写红三十军李先念部，新华网夹金山专题具体写到红九军二十五师七十四团。本章只采用两者一致的事实：两路先头在达维地区相遇。','Accounts differ on the advance unit at Dawei: Ninety Years of the CPC identifies Li Xiannian’s 30th Army, while Xinhuanet’s Mount Jiajin feature names the 74th Regiment of the 25th Division, 9th Army. The narration retains the common point: advance units met in the Dawei area.'), cues:[
    cue(19350328,bi('1935年3月','MAR 1935'),'cangxi',bi('红四方面军渡嘉陵江','Fourth Front Army crosses the Jialing'),bi(
      '三月，红四方面军从川陕根据地向西发展，在四川苍溪一带渡过嘉陵江。这是红四方面军自己的长征起点。',
      'In March the Fourth Front Army moved west from its Sichuan–Shaanxi base, crossing the Jialing River near Cangxi. This was the start of its own march.'),['fourth'],'fourth'),
    cue(19350529,bi('1935年5月','MAY 1935'),'luding',bi('中央红军向川西行进','Central Red Army enters western Sichuan'),bi(
      '中央红军在川、滇、黔交界一带辗转，五月渡过金沙江，又穿过大渡河一线，向川西高地行进。接下来挡在面前的是雪山。',
      'After moving through the Sichuan–Yunnan–Guizhou border region, the Central Red Army crossed the Jinsha and then the Dadu in May. Ahead, in the western highlands, were snow-covered mountains.'),['central','history'],'first'),
    cue(19350612,bi('1935年6月12日','12 JUN 1935'),'dawei',bi('达维先头部队会合','Advance units meet at Dawei'),bi(
      '翻过夹金山的中央红军先头部队，在懋功附近的达维，同红四方面军先头部队会合。这是两路会师，不是三军大会师。',
      'After crossing Mount Jiajin, advance units of the Central Red Army met advance units of the Fourth Front Army at Dawei, near Maogong. This was a meeting of two forces, not the final reunion of three armies.'),['history','meets','jiajin']),
  ]},
  { id:'grassland', short:bi('分路','Parting'), title:bi('过了草地，两路再分','The grasslands, and another parting'), cues:[
    cue(19350829,bi('1935年8月','AUG 1935'),'grass',bi('两路穿越高原湿地','Two columns cross the wetlands'),bi(
      '在川西北，两路人马穿过高海拔湿地，经历饥饿、寒冷和沼泽。八月下旬，左路军到了阿坝一带，右路军到了巴西一带。',
      'In northwestern Sichuan, two columns crossed high-altitude wetlands, facing hunger, cold and bogs. By late August the left column was near Aba and the right column near Baxi.'),['grass','history']),
    cue(19350914,bi('1935年9月','SEP 1935'),'ejie',bi('北上与南下','One force goes north, another south'),bi(
      '会师没有消除行军方向的分歧。九月，中央红军主力继续北上，张国焘坚持南下。红四方面军部分队伍再次穿越草地和山岭。',
      'The reunion did not resolve disagreements over where to go. In September the Central Red Army continued north, while Zhang Guotao insisted on going south. Some Fourth Front Army units crossed the grasslands and mountains again.'),['history','li','fourth']),
  ]},
  { id:'shaanbei', short:bi('陕北','Shaanxi'), title:bi('谁先到陕北？','Who reached northern Shaanxi first?'),
    note:bi('徐海东传略把抵达和会师合写在9月15日；新华社的专题报道区分15日抵达、16日会师。本图志从后者。','Xu Haidong’s biography groups the arrival and reunion on September 15. Xinhua distinguishes arrival on the 15th from reunion on the 16th; this atlas follows that distinction.'),
    cues:[
    cue(19350916,bi('1935年9月15—16日','15–16 SEP 1935'),'yongping',bi('红二十五军抵永坪','25th Army reaches Yongping'),bi(
      '最先到陕北的长征队伍是红二十五军。九月十五日，他们到达延川永坪，次日与西北红军第二十六、二十七军会师，随后合编为红十五军团。',
      'The 25th Army was the first marching force to reach northern Shaanxi. It arrived at Yongping on September 15 and met the Northwestern Red Army’s 26th and 27th Armies the next day. Together they formed the 15th Corps.'),['red25','meets','xu'],'red25'),
    cue(19350922,bi('1935年9月','SEP 1935'),'hadapu',bi('哈达铺整编','Reorganization at Hadapu'),bi(
      '同一时期，中央红军主力到了甘肃哈达铺，改编为陕甘支队，继续向陕北进发。那里已经有接应的力量。',
      'Around the same time, the Central Red Army’s main force reached Hadapu. Reorganized as the Shaanxi–Gansu Detachment, it continued toward northern Shaanxi, where allied forces were already in place.'),['history','years'],'first'),
    cue(19351019,bi('1935年10月19日','19 OCT 1935'),'wuqi',bi('中央红军主力抵吴起镇','Central Red Army reaches Wuqi'),bi(
      '十月十九日，陕甘支队到达吴起镇，中央红军主力结束长征。常说的“二万五千里”指这一路的历程，不是四条路线的总长。',
      'On October 19 the detachment reached Wuqi, ending the march of the Central Red Army’s main force. The familiar 25,000 li refers to this journey, not the sum of all four routes.'),['history','meets'],'first'),
  ]},
  { id:'ganzi', short:bi('甘孜','Garzê'), title:bi('还有一支队伍刚出发','Another force is just setting out'), cues:[
    cue(19351119,bi('1935年11月19日','19 NOV 1935'),'sangzhi',bi('红二、红六军团离湘','Second and Sixth Corps leave Hunan'),bi(
      '中央红军到达吴起镇一个月后，贺龙、任弼时等率红二、红六军团，从湖南桑植的刘家坪、瑞塔铺等地出发。各路红军并不在同一时期行军。',
      'A month after the Central Red Army reached Wuqi, He Long, Ren Bishi and others led the Second and Sixth Corps out of Liujiaping, Ruitapu and nearby sites in Sangzhi, Hunan. The forces did not all march at the same time.'),['second','years'],'second'),
    cue(19360430,bi('1936年春','SPRING 1936'),'ganzi',bi('靠谁筹粮？','Who helped secure food?'),bi(
      '在甘孜，红四方面军面临粮食短缺。当地的五世格达活佛协助筹粮，并救护伤病员。长征的路，也靠沿途有人伸出援手。',
      'In Garzê, the Fourth Front Army faced food shortages. The Fifth Geda Living Buddha helped secure food and care for the sick and wounded. The march also depended on people who helped along the way.'),['geda','fourth'],'fourth'),
    cue(19360705,bi('1936年7月初','EARLY JUL 1936'),'ganzi',bi('甘孜会师与整编','Reunion and reorganization in Garzê'),bi(
      '红二、红六军团辗转到达甘孜，与红四方面军会师。七月初，两个军团与红三十二军组成红二方面军，随后与红四方面军一同北上。',
      'The Second and Sixth Corps reached Garzê and met the Fourth Front Army. In early July the two corps and the 32nd Army formed the Second Front Army, which then headed north alongside the Fourth.'),['meets','years','reunion']),
  ]},
  { id:'reunions', short:bi('会师','Reunions'), title:bi('会师发生在不止一处','The reunions happened in more than one place'),
    note:bi('会宁采用10月9日红四方面军指挥部入城、双方会师的记述，不等同于各部第一次接触。将台堡当时属甘肃，今属宁夏西吉。','October 9 marks the arrival of Fourth Front Army headquarters at Huining, not the first contact between units. Jiangtaibu was then in Gansu and is now in Xiji, Ningxia.'),
    cues:[
    cue(19361009,bi('1936年10月9日','9 OCT 1936'),'huining',bi('红一、四方面军会师','First and Fourth reunite at Huining'),bi(
      '一九三六年十月九日，红四方面军指挥部进入甘肃会宁，同接应的红一方面军部队会师。此时，红二方面军还没到最后的会合地点。',
      'On October 9, 1936, Fourth Front Army headquarters entered Huining and reunited with troops of the First Front Army. The Second Front Army had not yet reached its final rendezvous.'),['years','reunion']),
    cue(19361022,bi('1936年10月22—23日','22–23 OCT 1936'),'jiangtai',bi('红一、二方面军先后会合','First and Second reunite in stages'),bi(
      '十月二十二日，红二方面军总指挥部和红二军团在将台堡与红一方面军会师。第二天，红六军团在附近的兴隆镇会合。',
      'On October 22, the Second Front Army headquarters and Second Corps met the First Front Army at Jiangtaibu. The Sixth Corps joined the following day at nearby Xinglong.'),['reunion','years']),
    cue(19361023,bi('1936年10月','OCT 1936'),'all',bi('从四支队伍到三大主力','Four marching forces, three front armies'),bi(
      '记住两个不同的终点：一九三五年十月，中央红军主力到达陕北。一九三六年十月，红一、二、四方面军先后会师。红二十五军此前已在陕北合编，有自己的长征路线，却不另算作三大主力之一。',
      'Remember two different endings: in October 1935 the Central Red Army’s main force reached northern Shaanxi. In October 1936 the First, Second and Fourth Front Armies reunited in stages. The 25th Army had its own march, but it had already been incorporated into another formation and was not one of the three front armies.'),['years','meets','reunion']),
  ]},
]

