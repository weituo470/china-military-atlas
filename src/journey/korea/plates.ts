import { ARCHIVE_ART } from '../../publicEdition'
type Caption = { zh: string; en: string; ja: string }
const words = (zh: string, en: string, ja: string): Caption => ({ zh, en, ja })

export type KoreaPlate = {
  src: string
  alt: Caption
  caption: Caption
  title: Caption
}

const asset = (file: string) => `${import.meta.env.BASE_URL}art/korea/${file}`

function plate(
  file: string,
  title: Caption,
  alt: Caption,
  caption: Caption,
): KoreaPlate {
  return { src: asset(file), alt, caption, title }
}

/** Original illustrations; archival selections are resolved separately in archive/records.ts. */
export const KOREA_PLATES: Record<string, readonly KoreaPlate[]> = {
  hook: [
    plate(
      'hook-photo.jpg',
      words("边境江岸", "At the border river", "国境の川辺"),
      words("边境江面与狭窄山地半岛。", "A border river and a narrow mountainous peninsula.", "山あいの集落と舟が浮かぶ国境の川。渡河の原写真ではない。"),
      words("鸭绿江隔开中国东北与朝鲜西北部，远在开战时的三八线以北。", "The Yalu separates northeastern China from northwestern Korea, well north of the prewar boundary.", "鴨緑江は中国東北部と朝鮮北西部の境を流れる。開戦時の38度線よりはるか北にある。"),
    ),
    plate(
      'hook-1-photo.jpg',
      words("鸭绿江上的渡船", "Boats on the Yalu", "鴨緑江の渡し舟"),
      words("步兵在边境江上登船。", "Mid-century infantry boarding wooden boats on a wide border river.", "国境の川で木造船に乗り込む歩兵のイメージ。"),
      words("志愿军从1950年10月19日起陆续渡江。画面描绘的是渡河情景，并非当晚的照片。", "Chinese troops began crossing on 19 October 1950. This illustration evokes a crossing; it is not a photograph from that night.", "志願軍は1950年10月19日から順次渡河した。この挿図はその夜の記録写真ではない。"),
    ),
    plate(
      'hook-2-photo.jpg',
      words("东亚地图上的朝鲜半岛", "Korea in East Asia", "東アジアの中の朝鮮半島"),
      words("转向东亚的地球仪与半岛地图。", "A globe turned to East Asia and a folded map of a narrow peninsula.", "東アジアを向いた地球儀と、半島の折り地図。"),
      words("半岛西北与中国隔江相望，东南隔海就是日本。", "China lies across the river to the northwest of Korea; Japan lies across the sea to the southeast.", "半島の北西には川を挟んで中国が、南東には海を隔てて日本がある。"),
    ),
  ],
  why: [
    plate(
      'why-photo.jpg',
      words("台湾海峡的舰影", "A warship in the strait", "台湾海峡の艦影"),
      words("海峡中军舰。", "A mid-century warship in a wide strait.", "広い海峡に見える軍艦。特定の艦の写真ではない。"),
      words("1950年6月27日，杜鲁门命令第七舰队阻止对台湾的进攻。图中不指某一艘军舰。", "On 27 June 1950 Truman ordered the Seventh Fleet to prevent an attack on Taiwan. No particular vessel is depicted.", "1950年6月27日、トルーマンは台湾への攻撃を阻止するよう第7艦隊に命じた。特定の軍艦を描いたものではない。"),
    ),
    plate(
      'why-1-photo.jpg',
      words("西海岸的潮滩", "Tidal flats on the west coast", "西海岸の干潟"),
      words("潮滩外运输舰。", "Mid-century transport ships off a tidal mudflat, evoking an Incheon-like shore.", "干潟の沖の輸送船。仁川上陸そのものの再現ではない。"),
      words("仁川位于汉城以西。1950年9月的登陆使战场从釜山外围转回半岛中部。", "Inchon lies west of Seoul. The September landing shifted the fighting from the Pusan perimeter back to central Korea.", "仁川はソウルの西に位置する。9月の上陸を機に、戦場は釜山周辺から半島中部へ移った。"),
    ),
    plate(
      'why-2-photo.jpg',
      words("地图与电报", "Map and telegram", "地図と電報"),
      words("一九五〇年公文案头与东亚地图。", "A 1950 official study and an East Asia map.", "公文書の載った机と東アジアの地図。特定の執務室ではない。"),
      words("10月13日，毛泽东致电周恩来，主张出兵朝鲜。画中的案头并非电报原件。", "Mao argued for intervention in a telegram to Zhou on 13 October. The illustration does not show the original document.", "10月13日、毛沢東は周恩来に電報を送り派兵を主張した。挿図に電報の原本が写っているわけではない。"),
    ),
  ],
  means: [
    plate(
      'means-0-photo.jpg',
      words("步兵走过山路", "Infantry on a mountain road", "山道を歩く歩兵"),
      words("白昼里轻装步兵走陡峭山路。", "Light infantry on a steep mountain trail in daylight.", "昼間、険しい山道を歩く軽歩兵。"),
      words("首批入朝的志愿军以步兵为主，部队的车辆远少于美军。", "The first Chinese formations were chiefly infantry and had far fewer vehicles than US forces.", "最初に参戦した志願軍は歩兵が中心で、米軍に比べて車両がはるかに少なかった。"),
    ),
    plate(
      'means-photo.jpg',
      words("月下的山路", "A mountain path by moonlight", "月明かりの山道"),
      words("满月下轻装步兵走山地小路。", "Light infantry walking a mountain path under a full moon.", "満月の下、山道を進む軽歩兵。夜戦の原写真ではない。"),
      words("图中队伍在夜里行进。对缺少空中掩护的步兵，天色也影响一天能走多远。", "The column is moving at night. For infantry with little air cover, daylight limited the distance they could travel.", "隊列は夜道を進んでいる。航空支援の乏しい歩兵には、移動できる時間も制約だった。"),
    ),
    plate(
      'means-2-photo.jpg',
      words("决定出兵时的难题", "The question of air support", "航空支援をめぐる判断"),
      words("简朴会议室与半岛地图。", "A modest meeting room and a peninsula map.", "簡素な会議室と朝鮮半島の地図。政治局の会議を再現したものではない。"),
      words("首批志愿军渡江时，苏联的空中掩护尚未到位。此图并非决策会议的现场记录。", "Soviet air cover was not yet available for the first crossing. This is not a record of the meeting.", "志願軍の先発部隊が渡河した時、ソ連の航空支援はまだ整っていなかった。会議の記録写真ではない。"),
    ),
  ],
  hardship: [
    plate(
      'hardship-0-photo.jpg',
      words("山路上的队列", "A column on a mountain road", "山道の隊列"),
      words("荒寒山路上瘦长行军队伍。", "A thin infantry column on a bleak mountain road.", "荒れた山道に伸びる歩兵の列。第一次戦役の原写真ではない。"),
      words("离江岸越远，粮食和药品要走的山路就越长。", "The farther the troops moved from the river, the longer the overland journey for food and medicine.", "部隊が川岸から遠ざかるほど、食糧や医薬品を運ぶ陸路も長くなった。"),
    ),
    plate(
      'hardship-photo.jpg',
      words("桥上的运输队", "Supplies crossing a bridge", "橋を渡る輸送隊"),
      words("夜间补给队伍与抢修浮桥。", "A supply column and a repaired pontoon at night.", "夜の補給隊と復旧された浮橋のイメージ。"),
      words("桥梁把江岸和前线连在一起。它们一旦受损，补给和后送伤员都会受阻。", "Bridges connected the river to the front. Damage could delay deliveries as well as the return of wounded soldiers.", "橋は川岸と前線を結んでいた。壊れれば物資の補給も負傷者の後送も滞った。"),
    ),
    plate(
      'hardship-2-photo.jpg',
      words("高地上的坑道口", "A hillside shelter", "高地の坑道入口"),
      words("山坡坑道入口。", "A hillside dugout and timber tunnel entrance.", "山腹に設けられた木組みの坑道入口。"),
      words("战线稳定后，争夺往往集中在几座山头。图中是山地阵地的示意，并非上甘岭实景。", "After the front settled, fighting often centred on individual heights. This hillside position is illustrative, not a view of Triangle Hill.", "戦線が膠着すると、個々の高地に戦闘が集中した。挿図は山地陣地のイメージで、上甘嶺の実景ではない。"),
    ),
  ],
  unexpected: [
    plate(
      'unexpected-0-photo.jpg',
      words("夜里的江面", "Boats after dark", "夜の川面"),
      words("满月下江面许多小船。", "Many boats on a wide river under a full moon.", "満月に照らされた川に浮かぶ小舟。秘密渡河の原写真ではない。"),
      words("从10月19日开始渡江，到25日在朝鲜北部交战，相隔六天。", "Six days separated the start of the crossings on 19 October from the fighting in northern Korea on 25 October.", "10月19日に渡河が始まり、25日に朝鮮北部で交戦するまで、6日間だった。"),
    ),
    plate(
      'unexpected-photo.jpg',
      words("三所里一带的山村", "A mountain village near Sansoli", "三所里周辺の山村"),
      words("黎明时分山地村落强行军。", "A force-march through a mountain hamlet at dawn.", "夜明けの山村を進む部隊。三所里の現地を再現したものではない。"),
      words("三所里位于西部战场。这是山村行军的示意，不是三所里的现场照片。", "Sansoli lay on the western front. The scene evokes a march through a village rather than showing Sansoli itself.", "三所里は西部戦線に位置する。挿図は山村を進む隊列を描いたもので、三所里の実景ではない。"),
    ),
    plate(
      'unexpected-2-photo.jpg',
      words("三八线附近的山地", "Hills near the parallel", "38度線付近の山地"),
      words("秋山里平静战线。", "A quiet autumn front in the hills.", "秋の静かな山並み。実際の戦線の再現ではない。"),
      words("1950年12月，战线再度回到三八线一带，但这次回撤并未带来停火。", "The front returned to the vicinity of the parallel in December 1950. The withdrawal did not bring a ceasefire.", "1950年12月、戦線は再び38度線付近に戻ったが、停戦には至らなかった。"),
    ),
  ],
  world: [
    plate(
      'world-0-photo.jpg',
      words("隔海相望", "Across the Taiwan Strait", "台湾海峡を挟んで"),
      words("亚热带岸边望向海峡远处军舰。", "A subtropical shore looking out over a strait toward a distant warship.", "亜熱帯の岸辺から望む海峡と遠くの艦影。"),
      words("舰队进入台湾海峡，是朝鲜战争影响半岛以外地区的一个例子。", "The fleet’s entry into the Taiwan Strait was one way the war reached beyond Korea.", "艦隊の台湾海峡への進出は、戦争の影響が半島の外に及んだ一例である。"),
    ),
    plate(
      'world-photo.jpg',
      words("西太平洋的港口", "A western Pacific port", "西太平洋の港"),
      words("一九五〇年代西太平洋港口。", "A 1950s West Pacific harbor.", "1950年代の西太平洋の港のイメージ。特定の港ではない。"),
      words("日本的港口为在朝鲜作战的联合国军供应物资。图中不指某一座港口。", "Japanese ports supplied UN forces in Korea. This illustration does not identify a particular harbour.", "日本の港は朝鮮半島の国連軍に物資を供給した。特定の港を描いたものではない。"),
    ),
    plate(
      'world-2-photo.jpg',
      words("海岸上的火炮", "A gun on the coast", "海岸の砲"),
      words("黄昏里沉默岸炮。", "A silent coastal gun at dusk, evoking the end of an age.", "夕暮れの海岸に据えられた砲。戦闘の写真ではない。"),
      words("停战后，毛泽东在谈到中国的安全时用了海岸火炮的比喻。此图并非战斗场面。", "Mao referred to coastal guns when discussing China’s security after the armistice. No battle is depicted here.", "休戦後、毛沢東は中国の安全を語る際に海岸の砲をたとえに用いた。挿図は戦闘場面ではない。"),
    ),
  ],
  close: [
    plate(
      'close-photo.jpg',
      words("停战谈判桌", "The armistice table", "休戦の交渉卓"),
      words("空着的停战桌对着秋山。", "An empty armistice table opening onto autumn hills.", "秋の山を望む無人の調印机。実際の調印写真ではない。"),
      words("1953年7月27日，双方代表在板门店签字。桌椅为示意，非签署现场。", "Delegates signed at Panmunjom on 27 July 1953. The table is illustrative, not the one photographed at the signing.", "1953年7月27日、双方の代表が板門店で署名した。挿図の机は実際の調印会場のものではない。"),
    ),
    plate(
      'close-1-photo.jpg',
      words("山地间的分界线", "A boundary through the hills", "山地を横切る境界線"),
      words("黄昏里狭窄山地半岛。", "A narrow mountainous peninsula at evening.", "夕暮れの細長い山がちな半島。地図や死傷者の図表ではない。"),
      words("军事分界线沿停战时的前线划定，不像三八线那样笔直。", "The demarcation line follows the front at the armistice, not the straight course of the parallel.", "軍事境界線は休戦時の前線に沿って引かれ、38度線のような直線ではない。"),
    ),
    plate(
      'close-2-photo.jpg',
      words("分界线两侧", "On either side of the line", "境界線の両側"),
      words("秋野里一条淡色界线。", "Autumn fields crossed by a pale marker line, evoking a military demarcation near.", "秋の野を横切る淡い境界線。軍事境界線を想起させるイメージ。"),
      words("军事分界线两侧各有两公里宽的非军事区。画面表现的是分隔，不是实地测绘。", "The demilitarized zone extends two kilometres on either side of the line. The scene evokes division rather than surveying the boundary.", "非武装地帯は軍事境界線の南北にそれぞれ2キロずつ広がる。挿図は境界を実測したものではない。"),
    ),
  ],
}

export function plateFor(beatId: string, paragraphIndex: number): KoreaPlate | undefined {
  const list = KOREA_PLATES[beatId]
  if (!list?.length) return undefined
  const index = Math.min(Math.max(0, paragraphIndex), list.length - 1)
  return list[index]
}

export function preloadKoreaPlates() {
  if (!ARCHIVE_ART) return
  if (typeof document === 'undefined') return
  for (const list of Object.values(KOREA_PLATES)) {
    for (const item of list) {
      const image = new Image()
      image.src = item.src
    }
  }
}
