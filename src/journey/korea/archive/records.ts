import { words, type Words } from '../atlas/stages'
import type { SceneId } from '../atlas/cues'

const nara='https://www.archives.gov/education/lessons/korean-conflict'
const truman='https://www.trumanlibrary.gov/'
const mil='https://dhc.westpoint.edu/atlases/'
type RecordPlate={src:string; kind:Words; title:Words; alt:Words; credit:string; url:string; painting?:boolean}
const document=words('档案原件影印','Document facsimile','公文書の複製')
const photo=words('历史照片','Archival photograph','記録写真')
const map=words('馆藏地图','Archive map','所蔵地図')
const urls=import.meta.glob<string>('./*.webp',{eager:true,query:'?url',import:'default'})
function painting(file:string,title:Words,alt:Words):RecordPlate {
 const src=import.meta.env.BASE_URL+'art/korea/'+file+'.jpg'
 return {src,url:src,kind:words('原有绘画 · 示意','Illustration · not a photograph','既存の挿画・模式図'),title,alt,credit:'',painting:true}
}
const illustrations={
 sky:painting('mig-alley',words('白天的天空','The sky by day','昼の空'),words('画中飞机掠过雪地上的行军队伍，用来说明制空权差距；不是具体空袭的现场图。','Aircraft pass above a column in snow. The painting illustrates unequal air power, not a particular air raid.','雪中を進む隊列の上空に航空機が見える。航空戦力の差を示す挿画で、特定の空襲の記録ではない。')),
 supply:painting('logistics',words('铁路、江岸与补给','Rails, riverbanks and supplies','鉄道・川岸・補給'),words('旧有绘画把江岸、铁路和行军队伍放在同一幅图中。它说明补给处境，不是某日的部队定位。','The project’s illustration brings a riverbank, railway and marching troops into one scene; it does not locate a unit on any particular day.','川岸、鉄道、行軍する隊列を描いた既存の挿画。補給の状況を示し、特定の日の部隊配置を再現したものではない。')),
 decision:painting('strategy',words('十月的出兵抉择','The October decision','10月の参戦決定'),words('摊开的地图与灯下的案头对应出兵决策。这是示意，不是十月十三日电报原件或会议室实景。','A map on a lamplit desk illustrates the decision to intervene. It is neither the 13 October telegram nor a photograph of the meeting.','灯りの下の地図で参戦の決断を示す。10月13日の電報原本でも実際の会議室の写真でもない。')),
 overview:painting('timeline',words('朝鲜半岛的山地与海岸','Mountains and coast of Korea','朝鮮半島の山地と海岸'),words('山地沿半岛绵延。平壤在西侧，鸭绿江在更北面。此图表现地形，不是战线图。','This landscape evokes the mountainous peninsula. Pyongyang lies on its western side; the Yalu is farther north. It is not a map of the front.','半島に連なる山地を描いた挿画。平壌は西側に、鴨緑江はさらに北に位置する。戦線を示す地図ではない。')),
}
function record(file:string,kind:Words,title:Words,alt:Words,credit:string,url:string):RecordPlate {
 return {src:urls['./'+file+'.webp'],kind,title,alt,credit,url}
}
const records={
 seoul:record('seoul',photo,words('开战四天后 · 汉城附近','Four days after the outbreak · Near Seoul','開戦の4日後・ソウル近郊'),words('1950年6月29日，麦克阿瑟与随员在汉城附近了解战况。不是6月25日开战当天的照片。','MacArthur and his staff near Seoul on 29 June 1950. The photograph was taken four days after the outbreak.','1950年6月29日、ソウル近郊で状況を確認するマッカーサーと随員。開戦当日ではない。'),'Ray Turnbull / US Army · Truman 2007-431',truman+'photograph-records/2007-431'),
 warning:record('warning',words('档案转录页','Archive transcription','公文書の翻刻'),words('1950.10.04 · 警告传到华盛顿','4 October 1950 · The warning in Washington','1950.10.04・ワシントンに届いた警告'),words('美国国务院次日的备忘录记录了10月3日周恩来与潘尼迦的会面。这是文献转录，不是会面照片。','The State Department’s memorandum the following day discusses Zhou’s 3 October warning through Panikkar. This is a transcription, not a photo of the meeting.','米国務省が翌日の覚書で10月3日の周恩来・パニッカル会談を検討した。会談写真ではなく翻刻。'),'FRUS 1950 · VII · 606','https://history.state.gov/historicaldocuments/frus1950v07/d606'),
 june:record('june-map',map,words('1950年6月下旬 · 越过三八线','Late June 1950 · Across the dividing line','1950年6月下旬・38度線を越えて'),words('由四幅地图拼成的原图，以红蓝铅笔记录开战初期朝韩双方的动向。','Four map sheets joined together. Red and blue markings trace the two Korean armies in the opening days.','4枚を貼り合わせた当時の地図。赤と青の書き込みが開戦直後の両軍の動きを示す。'),'Truman Library · M99',truman+'maps/m99-map-north-korean-invasion-south-korea'),
 fleet:record('statement',document,words('1950.06.27 · 杜鲁门声明','27 June 1950 · Truman’s statement','1950.06.27・トルーマン声明'),words('白宫发布的声明。介入朝鲜与派第七舰队进入台湾海峡，出现在同一份文件中。','The White House release addresses both US intervention in Korea and the Seventh Fleet in the Taiwan Strait.','朝鮮への介入と台湾海峡への第7艦隊派遣を同じ文書で表明した。'),'US National Archives',nara),
 inchon:record('inchon',photo,words('1950.09.15 · 仁川登陆','15 September 1950 · The Inchon landing','1950.09.15・仁川上陸'),words('从美军运输舰拍下的韩国海军陆战队员，正等待在仁川登陆。图中不是中国志愿军。','South Korean marines preparing to land at Inchon, seen from USS Pickaway.','仁川上陸を前に待機する韓国海兵隊員。米輸送艦ピッカウェイから撮影。'),'US Army / Truman Library · 2007-674',truman+'photograph-records/2007-674'),
 bridge:record('bridges',photo,words('1950.11 · 鸭绿江上的补给线','November 1950 · The Yalu supply link','1950.11・鴨緑江の補給路'),words('新义州边境桥梁的战时航拍，记录交通线承受空袭。不是志愿军渡江当夜的照片。','Wartime aerial photograph of the bridges at Sinuiju under air attack. It does not show the October crossing.','空襲を受ける新義州の橋を上空から撮影。10月の渡河当夜の写真ではない。'),'US Navy / NARA · 80-G-423495','https://www.history.navy.mil/our-collections/photography/numerical-list-of-images/nara-series/80-g/80-G-420000/80-G-423495.html'),
 peak:record('front-map',words('战史地图','Historical atlas','戦史地図'),words('1950.11.24 · 北进最远时的战线','24 November 1950 · The northern front','1950.11.24・北進の最遠期'),words('西点战史地图回绘北进最远阶段。分开的前沿不是一道横贯半岛的直线。','A retrospective West Point map of the northern advance, showing separated fronts rather than one continuous line.','北進の最遠期を描いた陸軍士官学校の戦史地図。各方面の前線は連続していない。'),'West Point · Korea 14',mil),
 treaty:record('treaty',photo,words('1951.09.08 · 旧金山对日和会','8 September 1951 · San Francisco','1951.09.08・サンフランシスコ講和会議'),words('美国国务卿艾奇逊在对日和会上签字。这是讲解战后同盟格局的配图，不是朝鲜停战签字。','Dean Acheson signs at the Japanese peace conference. This is the peace with Japan, not the Korean armistice.','対日講和会議で署名するアチソン米国務長官。朝鮮休戦協定の調印ではない。'),'J. S. Wright / US State Department · Truman 98-141',truman+'photograph-records/98-141'),
 signing:record('signing',photo,words('1953.07.27 · 停战签字','27 July 1953 · Signing the armistice','1953.07.27・休戦協定の調印'),words('档案馆保存的停战签字现场照片。谈判以停战协定告结，并非缔结和平条约。','The signing ceremony. The agreement brought about a ceasefire, not a peace treaty.','調印の場を写した写真。結ばれたのは平和条約ではなく休戦協定だった。'),'US National Archives',nara),
 cover:record('cover',document,words('1953.07.27 · 停战协定第一卷','27 July 1953 · Armistice, volume I','1953.07.27・休戦協定 第1巻'),words('档案馆收藏本的封面，书脊旁可见“Armistice Agreement”字样。','The bound cover of volume I identifies the instrument as an armistice agreement.','第1巻の表紙には、休戦協定であることが明記されている。'),'US National Archives',nara),
 article:record('agreement',document,words('1953.07.27 · 协定中的军事分界线','27 July 1953 · The demarcation line','1953.07.27・協定上の軍事境界線'),words('停战协定首页：第一条规定军事分界线和非军事区。它不是把三八线重新画一遍。','The first page introduces Article I on the military demarcation line and demilitarized zone. This was not simply a line of latitude.','協定の冒頭。第1条は軍事境界線と非武装地帯を定める。緯度線とは一致しない。'),'US National Archives','https://www.archives.gov/milestone-documents/armistice-agreement-restoration-south-korean-state'),
}
function atlas(n:string,date:string,topic:Words):RecordPlate {
 return record('wp'+n,words('战史地图','Historical atlas','戦史地図'),
  words(date+' · '+topic.zh,date+' · '+topic.en,date+'・'+topic.ja),
  words('西点战史地图回绘：'+topic.zh+'。标题日期是这张图的参照期。',
    'West Point’s historical atlas: '+topic.en+'. The date printed here is the plate’s reference period.',
    '陸軍士官学校の戦史地図：'+topic.ja+'。表題の日付は図の対象時期。'),
  'West Point · Korea '+n,'https://dhc.westpoint.edu/wp-content/uploads/sites/6/2025/04/Korea'+n+'-01.jpg')
}
const reviewRecords:(RecordPlate|undefined)[]=[
 records.june,atlas('10','1950.06.25–08.05',words('开战后的南推','The advance south','開戦後の南進')),
 atlas('11a','1950.08.26',words('釜山防御圈','Pusan perimeter','釜山防衛線')),records.inchon,undefined,records.peak,
 atlas('15','1950.12.05',words('12月上旬的战线回撤','The early December retreat','12月上旬の後退')),
 atlas('16','1951.01.24',words('汉城以南的战线','South of Seoul','ソウル以南の戦線')),
 atlas('17','1951.04.22',words('战线回到三八线一带','Return to the parallel','38度線付近へ')),
 atlas('20','1951.05.20',words('春季攻势','Spring offensive','春季攻勢')),
 atlas('21','1951.11.27',words('谈判期间的战线','The front during negotiations','交渉中の戦線')),
 undefined,atlas('22','1951.11–1953.07',words('停战谈判期间的总体战线','The front during the armistice talks','休戦交渉期の戦線')),records.signing
]
export const reviewArchive=(index:number)=>reviewRecords[index]
export function archiveFor(beat:string,p:number,id:SceneId):RecordPlate|undefined{
 if(id==='warning')return records.warning
 if(beat==='hook'&&p===2)return illustrations.overview
 if((beat==='why'||beat==='means')&&p===2&&id==='decision')return illustrations.decision
 if(beat==='means'&&p===1)return illustrations.sky
 if(beat==='hardship'&&p===0)return illustrations.supply
 if(beat==='hook'){
   if(p===0 && id==='peak')return records.peak
   if(p===0&&id==='opening')return records.seoul
   if(p===1&&id==='opening')return records.june
 }
 if(beat==='why'&&p===0)return id==='fleet'?records.fleet:records.june
 if(beat==='why'&&p===1&&id==='inchon')return records.inchon
 if(beat==='hardship'&&p===1)return records.bridge
 if(beat==='unexpected'&&p===1&&id==='peak')return records.peak
 if(beat==='world')return p===0?(id==='fleet'?records.fleet:undefined):p===1?records.treaty:records.signing
 if(beat==='close')return p===0?records.article:p===2?records.cover:undefined
 return undefined
}

