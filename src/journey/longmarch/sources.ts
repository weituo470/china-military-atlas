export type Lang = 'zh' | 'en'
export type Copy = Record<Lang, string>
export const bi = (zh: string, en: string): Copy => ({ zh, en })
const source = (zh: string, en: string, publisher: Copy, url: string) => ({ title: bi(zh,en), publisher, url })
const army = bi('中国军网','China Military Online')
export const sources = {
  out: source('1934年：红军主力开始长征','1934: The principal Red Army forces begin the Long March',bi('国防部 · 2019','Ministry of National Defense · 2019'),'https://www.mod.gov.cn/gfbw/gfjy_index/js_214151/4852696.html'),
  history: source('遵义会议和红军长征的胜利','The Zunyi Conference and the Long March',bi('《中国共产党的九十年》· 工信部转载','Ninety Years of the CPC · excerpt hosted by MIIT'),'https://www.miit.gov.cn/ztzl/rdzt/dsxxjyzl/xxzl/art/2021/art_a43d76bc5e694806889c07fc36ec6adc.html'),
  xiang: source('湘江战役后卫部队','The rearguard at the Xiang River',army,'https://www.81.cn/yljnt_208627/lsda_208656/16347832.html'),
  central: source('红军长征十大历史事件','Ten events of the Long March',bi('中共云南党史网','Yunnan Party History Office'),'https://www.ynds.yn.gov.cn/html/zhongyanghongjunqiaodujinshajiang/2022/7/8/5b39519c-6ff1-4dc6-9b61-042094bb13d7.html'),
  fourth: source('红四方面军发展历程中的七大里程碑','Milestones of the Fourth Front Army',army,'https://www.81.cn/2021zt/2021-10/17/content_10099994.htm'),
  grass: source('毛儿盖会议与两路北上','Mao’ergai and the two columns',army,'https://photo.81.cn/tsjs/2016-08/04/content_7190024.htm'),
  li: source('李屏仁的长征经历','Li Pingren’s experience on the Long March',army,'https://www.81.cn/yljnt_208627/ylml/L_208641/7941215.html'),
  red25: source('红25军：最先抵达陕北的长征队伍','The 25th Army reaches northern Shaanxi first',bi('中国军网／新华社 · 2018','China Military Online / Xinhua · 2018'),'https://www.81.cn/2018zt/2018-06/12/content_8059517.htm'),
  xu: source('徐海东传略','Xu Haidong: biography',army,'https://www.81.cn/yljnt_208627/ylml/X_208653/16397025_4.html'),
  second: source('红二、六军团突围长征','The Second and Sixth Corps leave Sangzhi',army,'https://www.81.cn/zt/2020nzt/zgrmjfjjj93zn/hsjy/yxbd_196609/9865360.html'),
  meets: source('红军长征八次会师','Eight reunions of the Long March',army,'https://www.81.cn/yljnt_208627/lsda_208656/16418526.html'),
  geda: source('五世格达活佛与甘孜军民','The Fifth Geda Living Buddha and the Red Army',army,'https://www.81.cn/xxqgts/9525112.html'),
  years: source('中国共产党一百年大事记','A century of the CPC: chronology',bi('新华社 · 最高检转载 · 2021','Xinhua · hosted by the SPP · 2021'),'https://www.spp.gov.cn/zdgz/202106/t20210628_522564.shtml'),
  reunion: source('三大主力会师全纪录','The reunions of the three front armies',bi('新华社 · 中央网信办转载 · 2016','Xinhua · hosted by the CAC · 2016'),'https://www.cac.gov.cn/2016-08/22/c_1119432029.htm'),
  jiajin: source('万水千山只等闲之翻越夹金山','Crossing Mount Jiajin',bi('新华网 · 2026','Xinhuanet · 2026'),'https://www.xinhuanet.com/politics/20261001/565eea43978344a9bd7abf0eb6071402/c.html'),
  artifacts: source('观文物·忆长征（馆藏与旧址专题）','Artifacts and historic sites of the Long March',army,'https://photo.81.cn/zhuanti/gwwycz.htm'),
}
export type SourceId = keyof typeof sources

