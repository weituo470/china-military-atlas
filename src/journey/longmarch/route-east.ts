import type { RouteDossier } from './dossier-types'

/** Editorial gazetteer; town/area anchors, not geolocated traces of individual units.
 * by = conservative display gate (end of a dated range); never print it as a newly inferred date.
 * Source locators name passages, images, or underlying documents, not invented page numbers.
 */
const b = (zh: string, en: string) => ({ zh, en })
type Stop = RouteDossier['stops'][number]
const stop = (id: string, by: number, date: ReturnType<typeof b>, place: ReturnType<typeof b>, lon: number, lat: number, body: ReturnType<typeof b>, refs: string[], breakBefore = false): Stop =>
  ({ id, by, date, place, lon, lat, body, refs, ...(breakBefore ? { breakBefore: true } : {}) })
const source = (id: string, title: ReturnType<typeof b>, publisher: ReturnType<typeof b>, url: string, locator: ReturnType<typeof b>) =>
  ({ id, title, publisher, url, locator })

const fengxian = source('east-fengxian', b('秦岭深处的红色火种——三支红军队伍在凤县的故事', 'Three Red Army forces in Feng County'), b('宝鸡市人民政府，2016', 'Baoji Municipal Government, 2016'),
  'https://www.baoji.gov.cn/col26/col95/201609/t20160929_10340.html',
  b('分读“红二十五军”及“红二方面军”两节：1935年7月31日、1936年9月19日的双石铺记录属于不同队伍。', 'Compare the 25th Army and Second Front Army sections: the Shuangshipu entries for 31 July 1935 and 19 September 1936 concern different forces.'))
const meetings = source('east-meetings', b('红军长征八次会师（正文题：红军长征中的会师）', 'Eight reunions during the Long March'), b('徐平，中国军网，2025', 'Xu Ping, China Military Online, 2025'),
  'https://www.81.cn/yljnt_208627/lsda_208656/16418526.html',
  b('小标题“木黄会师”“永坪会师”“甘孜会师”“将台堡会师”；甘孜节分别列6月3日、6月30日、7月1日、2日、5日。', 'See the Muhuang, Yongping, Garzê and Jiangtaibu sections. Garzê distinguishes 3 and 30 June from 1, 2 and 5 July.'))

export const eastRoutes: RouteDossier[] = [
  {
    id: 'red25', title: b('红二十五军：从大别山到陕北', '25th Army: from the Dabie Mountains to northern Shaanxi'),
    lead: b('这支队伍不是跟着中央红军向西走的。它从鄂豫皖出发，在秦岭东南建立新的根据地，留下了传单和地方政权的记录；随后又从关中南缘向西绕行，经陇东折往陕北。', 'The 25th Army did not follow the Central Red Army west. Leaving the Hubei–Henan–Anhui base, it established a new base in the southeastern Qinling, leaving behind leaflets and records of local government. It then headed west along the southern rim of the Guanzhong plain before turning through eastern Gansu toward northern Shaanxi.'),
    scope: b('对象为红二十五军主力。陕南数月是创建根据地的时期，不是一段连续向西的行军。永坪（亦写永平）分“到镇”和“会师”两条记录；终点不延长到1936年会宁。图钉约指聚落或所在地域，不是原址测绘。', 'The subject is the main body of the 25th Army. Months spent establishing a base in southern Shaanxi were not continuous westward movement. Yongping has separate entries for arrival and reunion; the route does not extend to Huining in 1936. Pins identify approximate settlements or districts, not surveyed historic sites.'),
    stops: [
      stop('25-hejiachong', 19341116, b('1934年11月16日', '16 November 1934'), b('河南罗山 · 何家冲', 'Hejiachong, Luoshan, Henan'), 114.28, 31.81,
        b('程子华、吴焕先、徐海东等率部离开大别山。出发宣言所用的公开称号是“中国工农红军北上抗日第二先遣队”；“第二先遣队”不是红二方面军的番号。', 'Cheng Zihua, Wu Huanxian and Xu Haidong led the departure from the Dabie Mountains. The declaration styled the column the Second Anti-Japanese Advance Detachment Marching North. “Second” here did not denote the Second Front Army.'), ['25-interview','25-hubei']),
      stop('25-dushu', 19341127, b('1934年11月26—27日', '26–27 November 1934'), b('河南方城 · 独树镇至伏牛山东麓', 'Dushu, Fangcheng, to the eastern Funiu foothills'), 113.16, 33.32,
        b('桐柏山区没有成为预想的新根据地。队伍向伏牛山行进，在独树镇附近受阻；詹大南回忆当夜部队另寻出路。27日拂晓到达山麓，但还没有摆脱追兵。', 'The Tongbai Mountains had not become the new base the column sought. On its way to the Funiu range it was stopped near Dushu. Veteran Zhan Danan recalled a change of route that night. By dawn on the 27th the army was at the foothills, still under pursuit.'), ['25-interview','25-dushu-study']),
      stop('25-yujiahe', 19341210, b('1934年12月9—10日', '9–10 December 1934'), b('陕西 · 庾家河（今丹凤县）', 'Yujiahe, now in Danfeng County, Shaanxi'), 110.42, 33.88,
        b('9日，队伍翻过蟒岭，在庾家河宿营。次日，省委在春茂永药铺讨论建立鄂豫陕根据地；会议因战斗中断，程子华、徐海东均负重伤。此后数月的中心任务，是在三省边界立足，而非直奔陕北。', 'The army crossed Mangling and camped at Yujiahe on the 9th. The next day provincial party leaders met at the Chunmaoyong pharmacy to discuss a border base. Fighting interrupted the meeting; both Cheng and Xu were seriously wounded. The task for the coming months was to establish a foothold, not to march directly to northern Shaanxi.'), ['25-yujiahe-study','25-hubei']),
      stop('25-longjuzhai', 19350509, b('1935年春 · 5月9日', 'Spring 1935 · 9 May'), b('陕南 · 龙驹寨（今丹凤）', 'Longjuzhai, present-day Danfeng'), 110.33, 33.70,
        b('主力在鄂豫陕边活动，郧西等地建立了乡村苏维埃。湖北省档案馆的专题列有当年《什么是红军》传单的馆藏图；它把“建根据地”落实到向百姓解释政策的纸页上。5月9日，抱病随军的省委书记徐宝珊在龙驹寨病逝。', 'While the army moved across the border region, village soviets were organized in places including Yunxi. A leaflet entitled What Is the Red Army?, reproduced in the Hubei archive feature, shows how policy was explained to residents. On 9 May provincial party secretary Xu Baoshan, who had remained with the army despite illness, died at Longjuzhai.'), ['25-hubei']),
      stop('25-fengyukou', 19350716, b('1935年7月16日', '16 July 1935'), b('陕西长安 · 沣峪口', 'Fengyukou, Chang’an, Shaanxi'), 108.82, 34.04,
        b('从西安以南的沣峪口重新出发时，部队先向西，而不是沿地图直线北上。它希望策应已经向北行动的红军主力；新建根据地和继续长征，是前后相接的两段经历。', 'At Fengyukou, south of Xi’an, the army resumed its march by heading west, not straight north. It sought to support other Red Army forces moving north. Building a base and resuming the march were successive phases of this route.'), ['east-fengxian','east-meetings']),
      stop('25-shuangshipu', 19350802, b('1935年7月31日—8月2日', '31 July–2 August 1935'), b('陕西凤县 · 双石铺', 'Shuangshipu, Feng County, Shaanxi'), 106.52, 33.91,
        b('经留坝江口，红二十五军于7月31日进至双石铺。宝鸡地方记述载有休整、走访居民和张贴标语；8月2日，部队离镇向西进入甘肃两当方向。同一座镇子一年后还会出现在另一支长征队伍的记录里。', 'After passing Jiangkou in Liuba, the 25th Army entered Shuangshipu on 31 July. Baoji’s local account records a halt, visits to residents and notices posted in town. On 2 August the column left westward for Liangdang, Gansu. The same town appears in a different force’s records the following year.'), ['east-fengxian']),
      stop('25-longde', 19350817, b('1935年8月17日', '17 August 1935'), b('隆德 · 六盘山西麓', 'Longde, western foot of the Liupan Mountains'), 106.12, 35.62,
        b('红二十五军进入隆德县城。此后它翻越六盘山向东行进：从沣峪口一路向西的行程，在这里转向陇东，并非穿过山岭后立即到达陕北。', 'The 25th Army entered the county seat of Longde. It subsequently crossed the Liupan Mountains eastward. After the westward arc from Fengyukou, its route now led through eastern Gansu, not directly from the mountains into northern Shaanxi.'), ['25-interview']),
      stop('25-sipo', 19350821, b('1935年8月21日', '21 August 1935'), b('甘肃泾川 · 四坡村一带', 'Sipo area, Jingchuan, Gansu'), 107.31, 35.32,
        b('部队在四坡村一带渡汭河时遇敌，军政委吴焕先在战斗中牺牲。从何家冲带队出发的人，并没有都走到终点。', 'The army encountered Nationalist troops as it crossed the Rui River near Sipo. Its political commissar, Wu Huanxian, was killed. Not everyone who had led the column out of Hejiachong would see its destination.'), ['25-interview','25-hubei']),
      stop('25-yongping-arrival', 19350915, b('1935年9月15日', '15 September 1935'), b('陕西延川 · 永坪（抵达）', 'Yongping, Yanchuan: arrival'), 109.97, 37.08,
        b('新华社采访报道把抵达永坪镇记在15日，并把与当地红军会合另记为次日。有的回顾文章把两件事合写在15日；本志保留这一口径差别。', 'Xinhua’s interview feature dates arrival in Yongping to the 15th and the formal meeting with local Red Army forces to the next day. Some retrospectives describe both together under the 15th. This atlas distinguishes the two events.'), ['25-interview','25-hubei']),
      stop('25-yongping-reunion', 19350916, b('1935年9月16日', '16 September 1935'), b('陕西延川 · 永坪（会师）', 'Yongping, Yanchuan: reunion'), 109.97, 37.08,
        b('红二十五军在永坪与当地红二十六、二十七军会师，随后三军合编为红十五军团。这是红二十五军自己的长征终点，不是中央红军抵吴起，也不是次年三个方面军会师。', 'The 25th Army met the local 26th and 27th Armies at Yongping. The three were subsequently reorganized as the 15th Corps. This was the endpoint of the 25th Army’s march, not the Central Red Army’s arrival at Wuqi or the reunion of the three front armies a year later.'), ['25-interview','east-meetings']),
    ],
    sources: [
      source('25-interview', b('90个第一丨红军长征到达陕北的第一支部队：红25军', 'The 25th Army: the first marching force to reach northern Shaanxi'), b('新华社采访，中国军网刊载，2018', 'Xinhua interview, published by China Military Online, 2018'), 'https://www.81.cn/2018zt/2018-06/12/content_8059517.htm',
        b('詹大南回忆及翟清华采访；末三段连读隆德、四坡村、永坪，分别记载15日到达、次日会师。', 'See veteran Zhan Danan’s recollections and the interview with historian Zhai Qinghua; the last three paragraphs distinguish arrival on the 15th from reunion the next day.')),
      source('25-dushu-study', b('血战独树镇：红25军战略转移中的关键之战', 'Dushu and the transfer of the 25th Army'), b('王晶，中国军网·解放军报，2024', 'Wang Jing, PLA Daily via China Military Online, 2024'), 'https://www.81.cn/js_208592/16353834.html',
        b('第一节“桐柏山区”后的走向；第三节引程子华、刘华清《艰苦转战，长征入陕》，并记27日拂晓进入伏牛山东麓。', 'Section I on the change of direction in Tongbai; section III cites Cheng Zihua and Liu Huaqing’s recollection and records the arrival in the foothills on the 27th.')),
      source('25-yujiahe-study', b('庾家河战斗：彻底粉碎国民党军的追堵计划（正文题：殊死血战庾家河）', 'The fighting at Yujiahe'), b('尹霞，中国军网·解放军报，2024', 'Yin Xia, PLA Daily via China Military Online, 2024'), 'https://www.81.cn/js_208592/16357533.html',
        b('正文先记8日铁锁关、次日庾家河，再记10日药铺会议、中断原因以及两名指挥员负伤。', 'Opening chronology of Tiesuoguan and Yujiahe, followed by the pharmacy meeting, its interruption and the two commanders’ wounds.')),
      source('25-hubei', b('孤军万里红旗展 赤胆忠心铸丰碑——红二十五军绝境拓途的长征壮歌', 'The 25th Army’s Long March: evidence from Hubei archives'), b('黄敏，《中国档案报》2026年10月30日第4511期第1版；湖北省档案馆编发', 'Huang Min, China Archives News, issue 4511, p. 1, 30 Oct 2026; Hubei Provincial Archives'), 'https://www.hbda.gov.cn/info/7108',
        b('查“创建鄂豫陕革命根据地”中的郧西政权及《什么是红军》传单图注（原件藏郧西县档案馆）；末节记徐宝珊病逝及四坡村。该文把抵达和会师合记于15日。', 'Under the base-area section see the Yunxi village soviets and caption for the leaflet held by Yunxi County Archives. The closing section records Xu Baoshan’s death and Sipo; it groups the Yongping events under the 15th.')),
      fengxian, meetings,
    ],
  },
  {
    id: 'second', title: b('红二、六军团至红二方面军：从桑植到将台堡、兴隆镇', 'From the Second and Sixth Corps to the Second Front Army: Sangzhi to Jiangtaibu and Xinglong'),
    lead: b('这条线有一段前史：1934年红六军团从湘赣根据地西征，10月在贵州木黄与贺龙的红三军会合；红三军随后恢复红二军团番号。这里从两军团1935年共同离开桑植讲起。直到1936年7月，红二方面军这个番号才成立。', 'In 1934 the Sixth Corps marched west from the Hunan–Jiangxi base and in October met He Long’s Third Army at Muhuang, Guizhou. The Third Army then resumed its Second Corps designation. The itinerary below starts with the two corps’ joint departure from Sangzhi in 1935. The Second Front Army itself was not formed until July 1936.'),
    scope: b('记录两军团主力及相关分队，区分总部、先遣部分和不同时抵达的单位。图上以一处地名代表几个渡口或一片驻地时，正文注明；将台堡与兴隆镇是不同部队的会合点，不将两点误连为同一部队次日行程。', 'The itinerary distinguishes the main body, headquarters and detachments. One map anchor may stand for several ferries or a wider area, as noted. Jiangtaibu and Xinglong were rendezvous sites for different units, not consecutive stops of one column.'),
    stops: [
      stop('2-sangzhi', 19351119, b('1935年11月19日', '19 November 1935'), b('湖南桑植 · 刘家坪、瑞塔铺', 'Liujiaping and Ruitapu, Sangzhi, Hunan'), 110.23, 29.46,
        b('11月初，刘家坪会议面对的已是补给困难、根据地缩小的问题。19日两军团分别在刘家坪干田坝、瑞塔铺枫树塔誓师，当晚出发，留下红十八师掩护。图钉取刘家坪，不表示全部人员同过一个起点。', 'Early in November the Liujiaping meeting faced supply shortages and a shrinking base. On the 19th the two corps assembled separately at Gantianba in Liujiaping and Fengshuta in Ruitapu, then left that evening. The 18th Division stayed behind. The pin marks Liujiaping, not a single starting point for everyone.'), ['2-sangzhi-study','east-meetings']),
      stop('2-shiqian', 19360119, b('1936年1月12—19日', '12–19 January 1936'), b('贵州石阡 · 县城', 'Shiqian, Guizhou'), 108.23, 27.52,
        b('从湘西南入黔后，留在后方的红十八师先在江口磨湾追上了红六军团；12日进入石阡县城的是红二军团。19日，两军团领导在石阡讨论粮食困难，决定向乌江以西另寻立足之处。', 'After the move from southwestern Hunan into Guizhou, the 18th Division caught up with the Sixth Corps at Mowan in Jiangkou. It was the Second Corps that entered Shiqian on the 12th. On the 19th the leadership met there: with food scarce, it decided to look for a base west of the Wu River.'), ['2-sangzhi-study','2-guizhou']),
      stop('2-bijie', 19360229, b('1936年2月', 'February 1936'), b('贵州毕节 · 黔西北', 'Bijie, northwestern Guizhou'), 105.29, 27.30,
        b('两军团进入黔西、大定、毕节地区，尝试经营新的根据地。毕节政治部旧址保留了一个可以定位的机关驻地；当地征募的新兵也随部队启程。这不是原有队伍不变人数的简单迁移。', 'The corps moved into the Qianxi–Dading–Bijie region and attempted to establish a new base. The former political department in Bijie identifies one headquarters site. New recruits from the area joined the march: the force leaving was not simply the one that had arrived.'), ['2-guizhou']),
      stop('2-panxian', 19360330, b('1936年3月下旬 · 30日会议', 'Late March 1936 · meeting on the 30th'), b('贵州盘县旧城（今盘州）', 'Old Pan County seat, now Panzhou, Guizhou'), 104.66, 25.80,
        b('在乌蒙山区辗转后，军团领导在盘县旧城开会。此时面临的选择不再是把新根据地设在哪里，而是是否离开云贵边，向西经云南过金沙江，去同红四方面军会合。30日会议选择了后者。', 'After the detour through the Wumeng Mountains, the corps leaders met in the old Pan County seat. The choice was no longer just where to establish a base: they could leave the Guizhou–Yunnan borderlands, go west across Yunnan and cross the Jinsha to meet the Fourth Front Army. On the 30th they chose that course.'), ['2-guizhou','2-boatmen']),
      stop('2-shigu', 19360428, b('1936年4月下旬 · 28日报捷', 'Late April 1936 · crossing reported on the 28th'), b('云南丽江 · 石鼓至巨甸渡江地段', 'Shigu–Judian ferry stretch, Lijiang, Yunnan'), 99.96, 26.87,
        b('这不是在石鼓一处通过：船工在石鼓至巨甸之间多个渡口摆渡，沿岸木匠、铁匠协助制筏。渡河也有损失，格子渡口一船倾覆，有战士溺亡。纪念馆资料将27日的过江叙述与28日贺龙等向总部报告已到北岸的电报分别记载。', 'This was not a single crossing at Shigu. Boatmen worked several ferries toward Judian, with local carpenters and ironworkers helping build rafts. Soldiers drowned when a boat capsized at Gezi. The museum account distinguishes its description of the crossing on the 27th from the commanders’ telegram on the 28th reporting that the corps were on the north bank.'), ['2-jinsha','2-boatmen']),
      stop('2-ganzi', 19360705, b('1936年7月1—5日', '1–5 July 1936'), b('四川甘孜 · 集结与整编', 'Garzê, Sichuan: assembly and reorganization'), 99.99, 31.62,
        b('会师不是一天发生的：红六军团6月3日已在理化以南的甲洼与红三十二军一部相遇；红二军团6月30日在甘孜以西的绒坝岔遇到红四方面军部队。7月1日两军团在甘孜地区集结，2日庆祝，5日与红三十二军合编为红二方面军。', 'The reunion took place in stages. On 3 June the Sixth Corps met part of the 32nd Army at Jiawa, south of Lihua; on 30 June the Second Corps met Fourth Front Army troops at Rongbacha west of Garzê. The corps assembled in the Garzê area on 1 July, celebrated on the 2nd and formed the Second Front Army with the 32nd Army on the 5th.'), ['east-meetings']),
      stop('2-shuangshipu', 19360919, b('1936年9月19日', '19 September 1936'), b('陕甘交界 · 凤县双石铺一带', 'Shuangshipu, Feng County, on the Shaanxi–Gansu border'), 106.52, 33.91,
        b('北上穿过草地、岷山后，红二方面军进入陇南。宝鸡地方资料记录其中部队由两当到达双石铺、张家窑；萧克率教导团到了凤州。这里可同红二十五军1935年的双石铺记录对读：地点一样，部队和年份都不一样。', 'After crossing grasslands and the Min Mountains, the Second Front Army reached southern Gansu. Baoji’s account traces units from Liangdang to Shuangshipu and Zhangjiayao; Xiao Ke led a training regiment to Fengzhou. Compare this with the 25th Army’s 1935 entry for Shuangshipu: same place, different force and year.'), ['east-fengxian']),
      stop('2-jiangtaibu', 19361022, b('1936年10月22日', '22 October 1936'), b('将台堡（今宁夏西吉）', 'Jiangtaibu, present-day Xiji, Ningxia'), 105.84, 35.82,
        b('北渡渭河后，红二方面军总指挥部和红二军团在将台堡与红一方面军部队会师。左权、聂荣臻当夜的电报向上级报告贺龙等人已到、尚有部队未到；这份同时代电报说明了为什么不能把全军都标在同一地点。', 'After crossing the Wei River, Second Front Army headquarters and the Second Corps met First Front Army troops at Jiangtaibu. A telegram sent that night by Zuo Quan and Nie Rongzhen reported that He Long and others had arrived while other units were still expected. This contemporary document is a reason not to place the whole army at a single pin.'), ['2-final','east-meetings']),
      stop('2-xinglong', 19361023, b('1936年10月23日', '23 October 1936'), b('兴隆镇（今宁夏西吉）', 'Xinglong, present-day Xiji, Ningxia'), 105.81, 35.71,
        b('会合的是红六军团与红一军团第一师，地点在将台堡以南的兴隆镇。这里是另一支分队的到达记录，不是贺龙所率总部从将台堡继续南行一日；图上的两个终点应当并读。', 'At Xinglong, south of Jiangtaibu, the Sixth Corps met the First Division of the First Corps. This is the arrival of another unit, not an extra day of southward marching by He Long’s headquarters. Read the two endpoints together.'), ['2-final'], true),
    ],
    sources: [
      meetings, fengxian,
      source('2-sangzhi-study', b('红二、六军团突围长征：浴血关山战犹酣', 'The departure of the Second and Sixth Corps from Sangzhi'), b('中国军网，2020', 'China Military Online, 2020'), 'https://www.81.cn/zt/2020nzt/zgrmjfjjj93zn/hsjy/yxbd_196609/9865360.html',
        b('正文从11月4日刘家坪会议起；分记19日两处誓师，以及1月9日江口磨湾、12日石阡。这里不采用导语对最终会师地点的笼统表述。', 'From the 4 November meeting onward: the two assemblies on the 19th, Mowan on 9 January and Shiqian on the 12th. The introduction’s broad description of the final reunions is not used here.')),
      source('2-guizhou', b('记忆贵州｜红二、红六军团在贵州发生的红色故事', 'Memory of Guizhou: the Second and Sixth Corps in Guizhou'), b('贵州广播电视台《记忆贵州》，2021', 'Guizhou Radio and Television, Memory of Guizhou, 2021'), 'https://movement.gzstv.com/news/detail/9rlMN/',
        b('依次查“红二、红六军团总指挥部旧址陈列馆”“红二、红六军团政治部旧址”“盘县会议会址”；分述石阡、毕节及3月30日盘县会议。', 'Three site sections in sequence: former headquarters at Shiqian; former political department at Bijie; Pan County conference site and the 30 March meeting.')),
      source('2-jinsha', b('红军长征过丽江纪念馆：红军长征再渡金沙江', 'The Lijiang Long March Memorial: crossing the Jinsha again'), b('中共云南省委党史研究室，2023', 'Yunnan Provincial Party History Research Office, 2023'), 'https://www.ynds.yn.gov.cn/html/hongseyinji/2023/12/3/4ebe0df8-f81d-4dac-8cb7-3e7835414254.html',
        b('纪念馆介绍中，定位“4月25日中午”先头部队到石鼓，以及其后分记27日渡江、28日三人联名电报的段落；只用于丽江段。', 'Lijiang section only: find the advance unit at Shigu on 25 April, then the passage distinguishing the 27th from the joint telegram on the 28th.')),
      source('2-boatmen', b('金沙水拍云崖暖——云南船工帮助红军抢渡金沙江', 'Yunnan boatmen and the Red Army crossings of the Jinsha'), b('中共云南党史网，2022', 'Yunnan Party History portal, 2022'), 'https://www.ynds.yn.gov.cn/html/hongsedibiaoyunlingfengbei/2022/7/8/624f38f9-1706-4338-8afc-3ca0c0f5fa41.html',
        b('见第二节“云南船工帮助红军二、六军团成功抢渡金沙江”：3月30日电令、桑乐天与船工、格子渡江事故。勿混用第一节所记1935年中央红军渡江。', 'Use section II, specifically the order of 30 March, Sang Letian and the boatmen, and the capsizing at Gezi. Section I concerns the Central Red Army’s different crossing in 1935.')),
      source('2-final', b('红旗漫卷六盘山', 'Red flags over the Liupan Mountains'), b('《解放军报》，中国共产党新闻网转载，2026年11月1日', 'PLA Daily, via CPC News, 1 November 2026'), 'https://cpc.people.com.cn/n1/2026/1101/c443712-40825293.html',
        b('第三节：中国人民革命军事博物馆藏10月22日深夜电报手稿的引文；其后“渡过渭河后”一段分述22日、23日会师对象与地点。此条据报刊转录，非原件扫描。', 'Section III quotes the telegram in the Military Museum collection. The paragraph following the Wei crossing identifies the units meeting on the 22nd and 23rd. This is a newspaper transcription, not a scan of the original.')),
    ],
  },
]
