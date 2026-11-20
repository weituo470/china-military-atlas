import { ARMISTICE_LINE } from '../sites'
import type { KoreaLang } from '../locales'

export type Words = Record<KoreaLang, string>
export const words = (zh: string, en: string, ja: string): Words => ({ zh, en, ja })
export type Point = readonly [longitude: number, latitude: number]
export type Front = readonly (readonly Point[])[]
export const project = ([lon, lat]: Point): Point => [(lon - 120.4) * .79 * 45, (43.58 - lat) * 45]

// Theater-scale snapshots, not territorial polygons. Separate sectors are deliberately
// not joined across gaps. Intermediate animation is illustrative, never a daily estimate.
const parallel: Front = [[[124.5,38],[129.1,38]]]
const perimeter: Front = [[[128.38,34.99],[128.31,35.2],[128.24,35.32],[128.43,35.44],[128.36,35.66],[128.42,35.89],[128.37,36.02],[128.54,36.12],[128.75,36.11],[128.93,36.1],[129.09,36.16],[129.27,36.05],[129.42,36.07]]]
const stalemate: Front = [[[126.64,37.8],[126.81,37.96],[126.92,38.13],[127.14,38.23],[127.34,38.29],[127.55,38.37],[127.78,38.34],[127.96,38.32],[128.17,38.34],[128.25,38.41],[128.36,38.62]]]
const mdl: Front = [ARMISTICE_LINE.map(p => [p.lon,p.lat] as const)]
type Stage = { date: string; title: Words; summary: Words; front: Front }
const phase = (date: string, title: Words, summary: Words, front: Front): Stage => ({ date, title, summary, front })

export const STAGES = [
  phase('1950.06.25', words('从三八线开始','War across the 38th parallel','北緯38度線から開戦'),
    words('朝鲜人民军越过战前分界线，向南推进。','North Korean forces crossed the prewar dividing line and advanced south.','朝鮮人民軍は開戦前の境界線を越えて南下した。'), parallel),
  phase('1950.07', words('战线越过汉城，推进到大田','The advance reaches Taejon','戦線はソウルから大田へ'),
    words('汉城失守后，战场继续向半岛中南部移动。','After Seoul fell, the fighting moved into the south-central peninsula.','ソウル陥落後、戦場は半島中南部へ移った。'),
    [[[126.55,35.93],[126.88,36.04],[127.43,36.31],[127.75,36.49],[128.19,36.57],[128.5,36.65],[129.02,36.52],[129.41,36.42]]]),
  phase('1950.08–09', words('釜山防御圈','The Pusan perimeter','釜山防衛線'),
    words('韩军与联合国军退守东南一角。釜山港仍在防御圈内。','South Korean and UN forces held the southeastern corner, including Pusan harbor.','韓国軍と国連軍は、釜山港を含む半島南東部に防衛線を築いた。'), perimeter),
  phase('1950.09.15–28', words('仁川登陆，两处战场相接','Inchon changes the front','仁川上陸で戦線が反転'),
    words('联合国军在西海岸登陆，从釜山方向北进的部队与之会合，汉城易手。','UN forces landed on the west coast and linked up with troops advancing from the south. Seoul changed hands.','国連軍は西岸に上陸し、釜山方面から北上した部隊と合流。ソウルは再び支配者を変えた。'),
    [[[126.54,37.52],[126.72,37.66],[126.97,37.64],[127.08,37.5],[127.11,37.25],[127.14,36.94],[127.3,36.67],[127.58,36.55],[128.06,36.52],[128.39,36.48],[128.69,36.47],[129.08,36.4],[129.46,36.45]]]),
  phase('1950.10.19', words('北进平壤，志愿军渡江','Pyongyang and the Yalu crossing','平壌への北進と志願軍の渡河'),
    words('联合国军进入平壤。中国人民志愿军开始从鸭绿江入朝。','UN forces entered Pyongyang. Chinese People’s Volunteers began crossing the Yalu.','国連軍が平壌に入り、中国人民志願軍は鴨緑江を渡り始めた。'),
    [[[125.19,38.81],[125.52,38.99],[125.78,39.06],[126.05,39.03],[126.38,38.99]],[[126.99,39.21],[127.2,39.46],[127.36,39.77],[127.58,39.99],[127.81,39.97]]]),
  phase('1950.11.24', words('北进达到最远处','The northern high-water mark','北進が最も遠くまで達する'),
    words('西线逼近清川江，东北方向有部队抵达鸭绿江边。各方向并未连成一道整齐的横线。','The western front lay near the Chongchon. Farther northeast, some units reached the Yalu; the advance was uneven.','西部は清川江付近、北東部では一部が鴨緑江に達した。各方面の進出は一様ではなかった。'),
    [[[125.19,39.61],[125.26,39.88],[125.55,39.99],[125.81,39.94],[126.04,39.82],[126.35,39.81],[126.55,39.98]],[[126.62,40.03],[127.03,40.18],[127.25,40.33],[127.49,40.6],[127.8,40.79],[128.07,41.04],[128.16,41.32],[128.18,41.4]],[[128.2,41.40],[128.73,41.46],[129.15,41.55],[129.52,41.72],[129.79,41.82]]]),
  phase('1950.12', words('战线退回三八线一带','Back toward the 38th parallel','戦線は再び北緯38度線付近へ'),
    words('中朝军队南推，联合国军撤出平壤，随后撤离东北沿海。','Chinese and North Korean forces moved south. UN forces left Pyongyang and evacuated the northeastern coast.','中朝両軍の南下により、国連軍は平壌を離れ、北東部の沿岸からも撤退した。'),
    [[[125.1,38.09],[125.66,38.11],[126.32,38.04],[126.74,37.97],[127.06,38.03],[127.51,38.05],[128.02,38.02],[128.53,38.12],[128.7,38.17]]]),
  phase('1951.01', words('战线再次越过汉城','The front moves south of Seoul','戦線は再びソウルの南へ'),
    words('中朝军队再度向南。到一月下旬，汉城已在战线以北。','The Chinese and North Korean advance carried the front south of Seoul by late January.','中朝両軍がさらに南下し、1月下旬にはソウルが戦線の北側に位置した。'),
    [[[126.75,36.97],[127.06,37.01],[127.37,37.09],[127.7,37.23],[127.96,37.31],[128.21,37.23],[128.48,36.97],[128.68,37.26],[128.85,37.53],[129.05,37.58],[129.17,37.55]]]),
  phase('1951.03–04', words('汉城再易手，战线北移','Seoul changes hands again','ソウルを再奪取、戦線は北へ'),
    words('联合国军三月重入汉城，至四月下旬推进到三八线附近及其以北。','UN forces retook Seoul in March. By late April much of the front lay near or north of the parallel.','国連軍は3月にソウルを奪還し、4月下旬には戦線の多くが北緯38度線付近かその北に移った。'),
    [[[126.64,37.78],[126.82,37.91],[127.06,38.09],[127.31,38.15],[127.62,38.16],[127.9,38.16],[128.19,38.17],[128.52,38.23],[128.46,38.39],[128.5,38.43]]]),
  phase('1951.04–05', words('春季攻势，战线再向南摆动','The spring offensives','春季攻勢で再び南へ'),
    words('中朝军队春季攻势使战线再向南移动，但没有再占汉城。','The Chinese and North Korean spring offensives moved the front south again, without retaking Seoul.','中朝両軍の春季攻勢で戦線は再び南下したが、ソウルを再占領するには至らなかった。'),
    [[[126.55,37.73],[126.82,37.61],[127.06,37.67],[127.31,37.67],[127.54,37.7],[127.83,37.68],[128.05,37.81],[128.32,37.77],[128.57,37.79],[128.66,37.9],[128.75,38.02]]]),
  phase('1951.07–11', words('谈判开始，战线趋稳','Talks open; the front settles','交渉が始まり、戦線は膠着へ'),
    words('战线回到半岛中部。七月开始停战谈判，争夺仍在继续。','The fighting returned to central Korea. Truce talks opened in July, but fighting continued.','戦線は半島中部へ戻った。7月に休戦交渉が始まったが、戦闘は続いた。'), stalemate),
  phase('1952.10–11', words('上甘岭：高地仍在争夺','Triangle Hill: the hill battles','上甘嶺で続いた高地の争奪'),
    words('全半岛尺度下，战线移动不大；上甘岭一带的高地却反复争夺。','At peninsula scale the line barely moved, even as both sides fought over the heights at Triangle Hill.','半島全体で見ると線はほぼ動かない。それでも上甘嶺の高地では激戦が続いた。'), stalemate),
  phase('1953.07', words('金城突出部发生局部变化','A local shift near Kumsong','金城付近で戦線が動く'),
    words('停战前夕，金城一带的战斗改变了中部战线的一段，并非全线大幅南移。','Shortly before the armistice, fighting near Kumsong shifted part of the central front, not the whole line.','休戦直前、金城付近の戦闘で中部の一角が動いた。全線が大きく南下したわけではない。'),
    [[[126.64,37.8],[126.81,37.96],[126.92,38.13],[127.14,38.23],[127.34,38.29],[127.55,38.3],[127.65,38.3],[127.77,38.27],[127.96,38.32],[128.17,38.34],[128.25,38.41],[128.36,38.62]]]),
  phase('1953.07.27', words('停战：军事分界线不是三八线','Armistice: two different lines','休戦：軍事境界線と38度線'),
    words('板门店签署停战协定。军事分界线大致沿停火时的接触线，并不沿同一纬度。','The armistice signed at Panmunjom fixed a military demarcation line near the final positions, not along one latitude.','板門店で休戦協定が調印された。軍事境界線は最終的な接触線にほぼ沿い、一定の緯度を通る線ではない。'), mdl),
] as const

export const MAP_SOURCES = [
  [words('联合国安理会：1950年7月7日第84号决议','UN Security Council: Resolution 84, 7 July 1950','国連安保理：1950年7月7日の決議84'), 'https://digitallibrary.un.org/record/112027'],
  [words('美国国务院档案：10月3日警告的次日备忘录','US diplomatic records: memorandum on the 3 October warning','米外交文書：10月3日の警告に関する翌日の覚書'), 'https://history.state.gov/historicaldocuments/frus1950v07/d606'],
  [words('澳大利亚退役军人事务部：战线分期图','DVA: strategic map sequence','豪退役軍人省：戦線の推移'), 'https://anzacportal.dva.gov.au/wars-and-missions/korean-war/strategic-map'],
  [words('西点军校历史地图集：朝鲜战争','West Point: historical campaign atlas','米陸軍士官学校：朝鮮戦争地図集'), 'https://dhc.westpoint.edu/atlases/'],
  [words('中国外交部：抗美援朝与停战谈判','China MFA: intervention and armistice talks','中国外交部：参戦と休戦交渉'), 'https://www.fmprc.gov.cn/web/ziliao_674904/wjs_674919/2159_674923/200011/t20001107_7950018.shtml'],
  [words('美国陆军：金城战役与停战','US Army: Kumsong and armistice','米陸軍：金城と休戦'), 'https://www.army.mil/koreanwar/'],
  [words('海岸底图：Natural Earth 1:50m','Coastline: Natural Earth 1:50m','海岸線：Natural Earth 1:50m'), 'https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/'],
] as const
