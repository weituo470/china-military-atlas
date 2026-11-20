import { bi } from './sources'
import type { Unit } from './content'
// Four contemporary texts, encountered here as later editions. No claim to own a manuscript.
export const documents = {
  first: {
    date:'1934.12.18', zhTitle:'中共中央政治局关于战略方针之决定', enTitle:'Political Bureau decision on the strategic direction',
    institution: bi('中共中央党史和文献研究院 · 文献选刊','Institute of Party History and Literature · digital edition'),
    read: bi('这份决定写在到达遵义以前。把它与黎平、遵义两个节点并读，可以分清“决定往哪里走”和“部队已经走到哪里”。印本另见《建党以来重要文献选编》第十一册，第656页起。',
      'Read the decision beside the Liping and Zunyi entries: a destination was chosen before the army reached it. The published text also starts on p. 656 of vol. 11 of Selected Important Documents since the Founding of the Party.'),
    url:'https://ebook.dswxyjy.org.cn/dswxbooks/2026/010/13/641e3637-d3ed-402e-8d8a-7c097de94112/mobile/index.html'
  },
  red25:{
    date:'1935.09.27', zhTitle:'原中共鄂豫陕省委关于西征北上会合陕甘红军之决定经过向中央的报告', enTitle:'Report to the Central Committee on the decision to head west and north',
    institution:bi('宁夏回族自治区档案馆编 ·《红军长征在宁夏——档案史料汇编》','Ningxia Regional Archives · archival document collection'),
    read:bi('报告写于永坪会师以后，开头回述七月在长安附近接获文件的经过。写作日期不是七月那次行动的日期。链接为汇编试读，不是原件全幅。','Written after the Yongping reunion, the report opens by recalling the receipt of documents near Chang’an in July. Its date is not the date of the earlier event. The link offers a transcribed preview, not a full facsimile.'),
    url:'https://ccmusic.dps.qikan.cn/pc/book/text-read?bid=147f2ce1-0199-476f-ad88-575641f7c51e&id=ds06456311'
  },
  fourth:{
    date:'1935.06.28', zhTitle:'中共中央政治局决定——关于一、四方面军会合后的战略方针', enTitle:'Decision on strategy following the meeting of the First and Fourth Front Armies',
    institution:bi('中共中央党史和文献研究院 · 文献选刊','Institute of Party History and Literature · digital edition'),
    read:bi('两河口会议后形成的决定写的是两军打算如何北上。将它与后来分路、南下、再次北上的记录对照，就能看到决定和实际经历并不相同。','This decision records what was intended after the Lianghekou meeting. The later entries on separation, turning south and heading north again show why a plan cannot be used as a record of the march itself.'),
    url:'https://ebook.dswxyjy.org.cn/dswxbooks/2026/010/13/3048dca2-7014-4635-9ea9-f8e496ea4edf/mobile/index.html'
  },
  second:{
    date:'1934.07.23',zhTitle:'中共中央书记处、中革军委关于红六军团向湖南中部转移的训令',enTitle:'Directive on moving the Sixth Corps to central Hunan',
    institution:bi('中共中央党史和文献研究院 · 文献选刊','Institute of Party History and Literature · digital edition'),
    read:bi('先辨发文对象：这是给红六军团的训令。它可以解释先遣西征的背景，却不能把1934年写成“红二方面军从桑植出发”的年份。','Notice which formation the directive names: the Sixth Corps. It helps explain the earlier westward movement, but it does not date the later joint departure from Sangzhi to 1934.'),
    url:'https://ebook.dswxyjy.org.cn/dswxbooks/2026/010/09/01026527-1576-4cf5-95e4-7165bb7ee239/mobile/index.html'
  }
} satisfies Record<Unit,{date:string;zhTitle:string;enTitle:string;institution:ReturnType<typeof bi>;read:ReturnType<typeof bi>;url:string}>

