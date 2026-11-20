import { bi, type Copy } from './sources'
import type { Unit } from './content'
import { places as guidePlaces } from './map'

type Ref = { label:Copy; url:string; locator:Copy }
function ref(zh:string,en:string,url:string,loc:string,enLoc:string):Ref {return {label:bi(zh,en),url,locator:bi(loc,enLoc)}}
export const momentSources = {
 hist:ref('《中国共产党的九十年》节选','Ninety Years of the CPC (excerpt)','https://www.miit.gov.cn/ztzl/rdzt/dsxxjyzl/xxzl/art/2021/art_a43d76bc5e694806889c07fc36ec6adc.html','工信部转载，2021年；见“红军北上，一、二、四方面军会师”节，吴起镇、红十五军团建制及桑植三段。','MIIT, 2021. In the section on the northward march, see the paragraphs on Wuqi, the 15th Corps and Sangzhi.'),
 red25:ref('红军长征到达陕北的第一支部队：红25军','First marching force to reach northern Shaanxi: the 25th Army','http://www.81.cn/2018zt/2018-06/12/content_8059517.htm','新华社报道，中国军网转载，2018年；见9月15日抵永坪、次日会师段。','Xinhua, via China Military Online, 2018: arrival at Yongping on September 15 and reunion the next day.'),
 ganquan:ref('《甘泉县志》','Ganquan County Gazetteer','https://dfz.shaanxi.gov.cn/zslm/fzzlk/xbsxsxz/xbsxz/yas_16203/201405/P020240923613502099321.pdf','甘泉县地方志编纂委员会编，陕西人民出版社，1993年10月第1版；见“大事记”1935年10月1日劳山条。','Ganquan County Gazetteer Committee, Shaanxi People’s Publishing House, first edition, October 1993. Chronology: Laoshan, October 1, 1935.'),
 danba:ref('金昭典长征回忆录','Jin Zhaodian’s Long March memoir','http://hajnd.org.cn/Item/1015_3.aspx','湖北红安革命纪念地管理中心刊载，第3页；金昭典回忆南下的右纵队，分列12日绥靖、16日丹巴。','Hubei Hong’an Revolutionary Memorial Centre, page 3. The right column’s entry into Suijing on the 12th and Danba on the 16th.'),
 sang:ref('红二、六军团突围长征','The Second and Sixth Corps leave Sangzhi','http://www.81.cn/zt/2020nzt/zgrmjfjjj93zn/hsjy/yxbd_196609/9865360.html','中国军网，2020年；见11月19日刘家坪、瑞塔铺分别举行誓师大会及当晚出发的记述。','China Military Online, 2020. Find the account of assemblies at Liujiaping and Ruitapu and departure on November 19.'),
 reun:ref('三军大会师——红军长征三大主力会师全纪录','The reunions of the three front armies','https://www.cac.gov.cn/2016-08/22/c_1119432029.htm','新华网，2016年8月22日，中央网信办转载；按日期查10月2日骑兵团、9日四方面军指挥部、22日将台堡及23日兴隆镇四处记述。','Xinhuanet, August 22, 2016, via the CAC. See October 2 (cavalry), October 9 (Fourth headquarters), October 22 (Jiangtaibu) and October 23 (Xinglong).'),
 gangu:ref('《甘谷县志》','Gangu County Gazetteer','https://www.tianshui.gov.cn/virtual_attach_file.vsb?afc=Ko77ObL8UsoR7anxmfkn77PMl7sL4lJDoRvbMmUaLNV2UNC0gihFp2hmCIa062TApjMw6ITjpsC0C5n8CIMwg4G0QDVJQsrZqIVJLR-Jv2nto4OeoDnt_tWjvYhXptQ0g47sMmL0LzCsLSbw6208c','天水市政府方志资料；见“大事记·民国二十五年（1936）”10月9日条，右纵队行经磐安、过渭河。','Gazetteer hosted by Tianshui municipal government. Chronology, Republican year 25 (1936), October 9: the right column passes Pan’an and crosses the Wei.'),
}
export type Place = 'wuqi'|'laoshan'|'danba'|'huining'|'panan'|'jiangtai'
export const momentPlaces:Record<Place,{name:Copy;lon:number;lat:number}> = {
 wuqi:guidePlaces.wuqi, laoshan:{name:bi('劳山一带','Laoshan area'),lon:109.42,lat:36.39},
 danba:{name:bi('丹巴','Danba'),lon:101.89,lat:30.88}, huining:guidePlaces.huining,
 panan:{name:bi('磐安镇','Pan’an'),lon:105.12,lat:34.75}, jiangtai:guidePlaces.jiangtai,
}
export type RecordKind = 'on'|'prior'|'future'|'lineage'
export type MomentRow = {id:Unit;name:Copy;status:Copy;date:Copy;kind:RecordKind;point?:Place;body:Copy;refs:(keyof typeof momentSources)[]}
export type Moment = {at:number;date:Copy;label:Copy;lead:Copy;rows:MomentRow[]}
const central=bi('中央红军主力','Central Red Army main force'), first=bi('红一方面军','First Front Army'), fourth=bi('红四方面军','Fourth Front Army'), second=bi('红二方面军','Second Front Army'), old25=bi('原红二十五军','Former 25th Army')
const lineage:MomentRow = {
 id:'red25',name:old25,status:bi('已编入红一方面军','No separate army'),date:bi('1935年秋整编；1936年10月2日会宁另有骑兵团记录','Reorganized in autumn 1935; cavalry recorded at Huining on Oct 2, 1936'),
 kind:'lineage',body:bi('红二十五军等部合编成红十五军团。红一方面军恢复番号后，红十五军团编入其建制。1936年10月2日到会宁的是该军团直属骑兵团，不能据此把原红二十五军画成第四支独立会师队伍。','The 25th and other armies formed the 15th Corps, which joined the reconstituted First Front Army. It was the corps’ cavalry regiment that reached Huining on October 2, 1936. That is not evidence of a fourth independent army at the reunions.'),refs:['hist','reun']
}
export const moments:Moment[]=[
 {at:19351019,date:bi('1935年10月19日','October 19, 1935'),label:bi('吴起镇','Wuqi'),lead:bi('中央红军主力抵达吴起镇时，有的队伍已在陕北，有的还没从桑植出发。','The main force at Wuqi was not the first to reach northern Shaanxi, and its arrival did not end everyone’s march.'),rows:[
 {id:'first',name:central,status:bi('陕甘支队抵吴起镇','Detachment arrives at Wuqi'),kind:'on',point:'wuqi',date:bi('10月19日 · 陕北吴起镇','Oct 19 · Wuqi, northern Shaanxi'),body:bi('中央红军北上的主力此时称陕甘支队。10月19日抵吴起镇，标志这一支主力结束长征；这并不等于三个方面军已经会师。','The northbound main force was then called the Shaanxi–Gansu Detachment. Its arrival on October 19 ended this force’s Long March, not the marches of all three front armies.'),refs:['hist']},
 {id:'red25',name:old25,status:bi('先抵陕北，已合编','Already in northern Shaanxi; reorganized'),kind:'prior',point:'laoshan',date:bi('9月15—16日 · 永坪；10月1日 · 劳山','Sep 15–16 · Yongping; Oct 1 · Laoshan'),body:bi('红二十五军9月15日抵永坪，次日与西北红军会师，继而合编为红十五军团。《甘泉县志》在10月1日记载红十五军团在劳山的活动。劳山标的是这条此前记录，不是10月19日驻地。','The 25th Army reached Yongping on September 15, met the Northwestern Red Army the next day and became part of the 15th Corps. The Ganquan gazetteer places the corps at Laoshan on October 1; that is not its position on October 19.'),refs:['red25','ganquan','hist']},
 {id:'fourth',name:fourth,status:bi('南下途中，未到陕北','Moving south, not in northern Shaanxi'),kind:'prior',point:'danba',date:bi('10月16日 · 川西丹巴（右纵队）','Oct 16 · Danba, western Sichuan (right column)'),body:bi('两路分开后，红四方面军转向南方。金昭典回忆南下的右纵队10月16日进占丹巴。可以标出这支纵队三天前的行程，不能把它当作19日整个方面军的位置。','After the forces parted, the Fourth Front Army turned south. Jin Zhaodian recalled the southbound right column entering Danba on October 16. That locates one column three days earlier, not the whole army on the 19th.'),refs:['danba','hist']},
 {id:'second',name:bi('红二、红六军团','Second and Sixth Corps'),status:bi('尚未从桑植共同出发','Joint departure from Sangzhi still ahead'),kind:'future',date:bi('下一节点：11月19日 · 湖南桑植','Next: Nov 19 · Sangzhi, Hunan'),body:bi('10月19日尚早于这两个军团从桑植一带共同出发的日期；红二方面军的番号也尚未成立。这不表示两支部队此前没有行动。这里不据未来出发地推定当日驻地。','The two corps had not yet set out together from the Sangzhi area, nor had the Second Front Army been formed. They had been active before this departure. A later starting point cannot establish their October 19 position.'),refs:['sang','hist']},
 ]},
 {at:19361009,date:bi('1936年10月9日','October 9, 1936'),label:bi('会宁','Huining'),lead:bi('会宁相迎的是一、四方面军；二方面军的一支纵队，当天还在渭河边。','The First and Fourth Front Armies met at Huining while one column of the Second was still passing the Wei River.'),rows:[
 {id:'first',name:first,status:bi('在会宁接应四方面军','Reception at Huining'),kind:'on',point:'huining',date:bi('10月9日 · 会宁（接应部队）','Oct 9 · Huining (receiving units)'),body:bi('红一方面军部队在甘肃会宁接应红四方面军。这里记的是接应部队与新到指挥部相会，不是把去年结束的中央红军主力长征再续画到会宁。','Units of the First Front Army received the Fourth at Huining. This records a reception, not an extension to the Central Red Army’s main-force march of the previous year.'),refs:['reun','hist']},
 lineage,
 {id:'fourth',name:fourth,status:bi('指挥部进入会宁县城','Headquarters enters Huining'),kind:'on',point:'huining',date:bi('10月9日 · 会宁（指挥部）','Oct 9 · Huining (headquarters)'),body:bi('10月9日，红四方面军指挥部进入会宁县城，与红一方面军会师。日期对应指挥部入城，不能用作各梯队第一次接触的共同时间。','Fourth Front Army headquarters entered Huining on October 9 and met the First Front Army. The date refers to headquarters’ arrival, not the first contact of every detachment.'),refs:['reun','hist']},
 {id:'second',name:second,status:bi('右纵队行经甘谷磐安','Right column passes Pan’an'),kind:'on',point:'panan',date:bi('10月9日晚 · 甘肃甘谷（右纵队）','Evening of Oct 9 · Gangu (right column)'),body:bi('《甘谷县志》记载：右纵队当晚经磐安镇渡过渭河，宿营于北岸谢家坪一带。与会宁记录是同一天，却不在同一地点；地图只标行经的磐安，不标全军驻地。','The Gangu gazetteer records that the right column passed Pan’an that evening, crossed the Wei and camped near Xiejiaping on its north bank. The date matches Huining, but not the place. Pan’an marks passage by one column.'),refs:['gangu']},
 ]},
 {at:19361022,date:bi('1936年10月22日','October 22, 1936'),label:bi('将台堡','Jiangtaibu'),lead:bi('三大主力先后会合；不是三支队伍同一天到同一座城。','The three front armies reunited in stages, not by all arriving at one town on one day.'),rows:[
 {id:'first',name:first,status:bi('在将台堡接应二方面军','Reception at Jiangtaibu'),kind:'on',point:'jiangtai',date:bi('10月22日 · 将台堡（红一军团部队）','Oct 22 · Jiangtaibu (First Corps units)'),body:bi('这一次，红一军团部队在将台堡与红二方面军指挥部、红二军团会合。会宁与将台堡是两次不同的接应，不能合并成一个点。','Here First Corps units met the Second Front Army headquarters and Second Corps. The receptions at Huining and Jiangtaibu were separate events at distinct places.'),refs:['reun']},
 lineage,
 {id:'fourth',name:fourth,status:bi('已在会宁与一方面军会师','Already reunited at Huining'),kind:'prior',point:'huining',date:bi('此前会师：10月9日 · 会宁','Earlier reunion: Oct 9 · Huining'),body:bi('红四方面军与红一方面军会师的指挥部节点已发生在13天前。图上保留会宁供对照，不表示指挥部在22日仍驻会宁，也不表示它去了将台堡。','The Fourth Front Army headquarters’ reunion with the First took place thirteen days earlier. Huining remains on this map for comparison, not as its location on October 22 or as evidence that it went to Jiangtaibu.'),refs:['reun','hist']},
 {id:'second',name:second,status:bi('指挥部、红二军团会师','Headquarters and Second Corps reunite'),kind:'on',point:'jiangtai',date:bi('10月22日 · 将台堡（今宁夏西吉）','Oct 22 · Jiangtaibu (now Xiji, Ningxia)'),body:bi('到将台堡的是红二方面军指挥部和红二军团；红六军团于次日在附近的兴隆镇会合。“三大主力会师”概括的是一串会合事件，不是一幅全员同地的合影。','Second Front Army headquarters and the Second Corps met at Jiangtaibu. The Sixth Corps joined at nearby Xinglong the next day. The phrase “reunion of the three front armies” describes a series of meetings, not one assembly.'),refs:['reun','hist']},
 ]},
]

