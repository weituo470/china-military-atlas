import { BEATS, UI as original } from './content'
import { t, type BaselineLocale, type BaselineText } from './locale'
import japaneseNarration from './narration-ja.json'

const inJapanese = (value: BaselineText, ja: string) => ({ ...value, ja })

export const UI = {
  ...original,
  brandKicker: inJapanese(original.brandKicker, '中国の軍事力'),
  brandTitle: inJapanese(original.brandTitle, '2026年の軍事力基準'),
  brandWindow: inJapanese(original.brandWindow, '現在の地球を舞台に、2026年の公開資料を読む'),
  exit: inJapanese(original.exit, 'ガイドを終了'),
  sourcesBtn: inJapanese(original.sourcesBtn, '出典と注記'),
  sourcesKicker: inJapanese(original.sourcesKicker, '解説と資料を照合するために'),
  sourcesTitle: inJapanese(original.sourcesTitle, '出典と読み方の注意'),
  close: inJapanese(original.close, '閉じる'),
  languageLabel: { zh: '文字与解说语言', en: 'Text and narration language', ja: '表示・音声の言語' },
  hints: inJapanese(original.hints, '0–8：章を選択 · ← →：前後の章 · スペース：再生／一時停止 · 地球儀をドラッグ · 印や表の行を選択 · Esc：閉じる／終了'),
  playNarration: inJapanese(original.playNarration, '解説を再生'),
  pauseNarration: inJapanese(original.pauseNarration, '一時停止'),
  resumeNarration: inJapanese(original.resumeNarration, '再生を続ける'),
  replayNarration: inJapanese(original.replayNarration, '最初から再生'),
  narrationError: inJapanese(original.narrationError, '音声を読み込めませんでした。画面の解説をお読みいただけます。'),
  dossierLabel: inJapanese(original.dossierLabel, '公開資料'),
  estimateLabel: inJapanese(original.estimateLabel, '外部推計'),
  officialLabel: inJapanese(original.officialLabel, '公式発表'),
  theaterHint: inJapanese(original.theaterHint, '戦区の印を選ぶと説明を読めます。印は各地域の代表点です。'),
  platformHint: inJapanese(original.platformHint, '装備のシルエットや産業集積地の印を選べます。'),
  westPacHint: inJapanese(original.westPacHint, '弧は西太平洋を広く見渡すための目印です。'),
  closeHint: inJapanese(original.closeHint, '第一章は同じ三つの力を古代の目盛りで見たものです。1950～53年は別のガイドで扱います。'),
}

type Beat = (typeof BEATS)[number]
const beatCopy = {
  hook: ['はじめに', 'まず、ものさしをそろえましょう。'],
  timeline: ['時間の目盛り', '同じ三つの力を、現代の目盛りで。'],
  structure: ['編成', 'まず、公式に示された編成から。'],
  equipment: ['装備', 'すでに公開された装備だけを見る。'],
  scale: ['規模', '同じ表で、まず規模の輪郭を見る。'],
  review: ['観艦式', '太平洋を舞台にした模式的な観艦式。'],
  seas: ['近海と遠海', '西太平洋を広く見渡す。'],
  doctrine: ['軍事思想', '公開資料から読む近代化の構想。'],
  close: ['まとめ', '大きな規模、編成改革、産業の支え。'],
} satisfies Record<Beat['id'], readonly [string, string]>

export function beatName(beat: Beat, language: BaselineLocale) {
  return language === 'ja' ? beatCopy[beat.id][0] : t(beat.name, language)
}
export function beatTitle(beat: Beat, language: BaselineLocale) {
  return language === 'ja' ? beatCopy[beat.id][1] : t(beat.title, language)
}
export function beatLines(beat: Beat, language: BaselineLocale): readonly string[] {
  return language === 'ja' ? japaneseNarration[beat.id] : beat.narration[language]
}

for (const beat of BEATS) {
  if (japaneseNarration[beat.id].length !== beat.narration.zh.length) {
    throw new Error(`Japanese baseline reading has a paragraph mismatch in ${beat.id}`)
  }
}

type CardCopy = readonly [kicker: string, title: string, body: string, note: string]
const theater = '戦区の代表地点 · 模式表示'
const equipment = '公開装備 · 模式図'
const industry = '産業集積地 · 模式表示'
const regional = '地域を示す模式的な印で、施設の位置ではありません。'
const ceremonial = '太平洋上の模式的な配置で、駐留地や航路ではありません。'
const external = '外部推計 · 規模の目安'
const chartOnly = '表のみ。地球儀に柱や司令部の印は置いていません。'
const estimates = (people: string, spending: string, aircraft: string) =>
  `IISS『ミリタリー・バランス2026』の公開紹介による2025年の現役兵力は約${people}。SIPRI表1の2025年軍事支出は${spending}。FlightGlobal『World Air Forces 2026』が数える作戦機は${aircraft}です。`

export const japaneseCards: Readonly<Record<string, CardCopy>> = {
  eastern: [theater, '東部戦区', '2016年2月1日に旧軍区に代わって発足した五つの戦区の一つです。印は東部戦区の地理的な代表点です。', regional],
  southern: [theater, '南部戦区', '2016年に発足した公式の戦区です。印は南部戦区の代表点で、司令部、港、島を指していません。', regional],
  western: [theater, '西部戦区', '西部戦区は広い内陸と高原にまたがります。印は地球儀で位置関係を読み取るための代表点です。', regional],
  northern: [theater, '北部戦区', '2016年に発足した五つの戦区の一つです。印は北部戦区の代表点で、司令部の都市を示すものではありません。', regional],
  central: [theater, '中部戦区', '2016年に発足した公式の戦区です。印は中部戦区の代表点で、北京や司令部の所在地を示すものではありません。', regional],
  carriers: [equipment, '空母：遼寧、山東、福建', '遼寧は2012年、山東は2019年に就役しました。福建は2022年6月に進水し、2025年11月5日に就役の式典が行われました。海軍報道官は就役後も試験と艦載機の訓練が続くと説明しています。', '新華社・中国国防部の公式発表。即応性の評価は加えていません。'],
  type055: [equipment, '055型駆逐艦', '一番艦の南昌は2020年1月12日に正式就役しました（新華社・中国国防部）。同型艦も公開されていますが、模式図は保有総数を示しません。', '艦型のシルエットで、造船所を示すものではありません。'],
  j20: [equipment, '戦闘機 J-20', '2017～18年の公式発表で、人民解放軍空軍への配備が確認されました。観兵式や航空ショーでも公開されています。', '機種の模式図。機数や飛行場の位置は示しません。'],
  bohai: [industry, '渤海沿岸の産業集積地', '公開資料で言及される渤海沿岸の造船・重工業を、沿岸地域として示します。', regional],
  yangtze: [industry, '長江河口の産業集積地', '公開資料で言及される長江河口周辺の産業集積地を、おおまかな地域として示します。', regional],
  pearl: [industry, '珠江デルタの産業集積地', '中国南部の造船・航空産業を、公開資料に基づくおおまかな沿岸地域として示します。', regional],
  'review-plan': ['観艦式 · 空母は公式、艦艇総数は外部推計', '中国人民解放軍海軍', '空母3隻は公式に就役した遼寧（2012年9月25日）、山東（2019年12月17日）、福建（2025年11月5日）です。福建は就役後も試験と艦載機訓練が続きます。一方、艦艇・潜水艦370隻超、うち主要水上戦闘艦140隻超は米国防総省2024年版の外部推計です。37個の印は下限の規模を示します。2025年版から新たな総数は採っていません。055型や揚陸艦は艦型の例です。', '空母数は公式、艦艇総数は外部推計。米海軍の公式値とは集計範囲が異なります。' + ceremonial],
  'review-us': ['観艦式 · 公式発表', '米海軍', '米議会調査局RS20643（2025年12月4日）は、ニミッツ級10隻とジェラルド・R・フォード1隻の計11隻を挙げています。未引き渡しのジョン・F・ケネディは含めません。RL32665による2025年10月1日現在の戦闘部隊艦艇293隻は、約10隻を一単位とする29個の印で示します。中国側の外部推計とは集計範囲が異なります。', '公表時点を明記。法定下限（10 U.S.C. 8062(b)）は保有数の根拠に代えていません。' + ceremonial],
  'review-japan': ['観艦式 · 公式発表', '海上自衛隊', '令和7年版防衛白書の資料7では、2025年3月31日現在、護衛艦51、潜水艦22、機雷戦艦艇20、哨戒艦艇6、輸送艦艇11、補助艦艇30です。図では護衛艦と潜水艦を約10隻につき1個の印で示します。いずも型は公式区分の護衛艦として数え、空母に読み替えません。', '防衛白書の公式区分。他国の艦艇総数とは直接比較できません。' + ceremonial],
  'review-australia': ['観艦式 · 公式発表', 'オーストラリア海軍', '国防年報2024–25の表D.6では、アンザック級フリゲート、ホバート級ミサイル駆逐艦、コリンズ級潜水艦を合わせて主要戦闘艦艇16隻。図では約10隻を一単位として2個の印で示します。海軍全体の艦艇数ではありません。', '2024–25年度の公式集計区分です。' + ceremonial],
  'review-rok': ['観艦式 · 模式的な隊列のみ', '韓国海軍', '模式的な隊列だけを示します。艦艇総数は掲載せず、約10隻を一単位とする縮尺も使っていません。', ceremonial],
  'review-russia': ['観艦式 · 模式的な隊列のみ', 'ロシア太平洋艦隊', '模式的な隊列だけを示します。艦艇総数は掲載せず、約10隻を一単位とする縮尺も使っていません。', ceremonial],
  china: [external, '中国', estimates('203万5千人', '推計3,360億米ドル', '1,814機') + ' 人員は約200万人という規模で読みます。SIPRIの軍事支出は2026年の公式予算1兆9,400億元より集計範囲が広い別の指標です。米国防総省2024年報告の艦艇・潜水艦370隻超（主要水上戦闘艦140隻超）も外部推計で、米海軍の公式値293隻とは直接比較できません。', '地球儀の三本の斜線柱は外部推計です。' + regional],
  india: [external, 'インド', estimates('150万1千人', '921億米ドル', '600機'), regional],
  'united-states': [external, '米国', estimates('134万人', '9,540億米ドル', '2,718機') + ' 同じ航空年鑑の全機種合計13,033機は別の指標です。米議会調査局による2025年10月1日現在の戦闘部隊艦艇293隻は公式値で、中国側の外部推計と同じ集計範囲ではありません。', regional],
  'north-korea': [external, '北朝鮮', 'IISSの公開紹介による2025年の現役兵力は約128万人。FlightGlobalの作戦機集計は455機です。SIPRIの2025年版資料の表1に北朝鮮の支出額は掲載されていないため、軍事支出の柱は表示しません。', regional],
  russia: [external, 'ロシア', estimates('126万4千人', '推計1,900億米ドル', '1,559機'), regional],
  'south-korea': [external, '韓国', estimates('45万人', '478億米ドル', '340機'), '国別比較の印で、朝鮮戦争のガイドを示す印とは別です。'],
  japan: [external, '日本', estimates('24万7千人', '622億米ドル', '264機'), regional],
  france: [external, 'フランス', estimates('20万4千人', '680億米ドル', '223機'), regional],
  germany: [external, 'ドイツ', 'SIPRI表1の2025年軍事支出は1,140億米ドル。FlightGlobalの作戦機集計は190機です。現役兵力の数字は、このガイドで用いたIISSの公開紹介からは採っていません。', chartOnly],
  'united-kingdom': [external, '英国', 'SIPRI表1の2025年軍事支出は890億米ドル。FlightGlobalの作戦機集計は141機です。このガイドで用いたIISSの公開紹介は英国の現役兵力を示していないため、欄を空けています。', chartOnly],
  vocabulary: ['公式の公開用語', '研究開発と軍事思想', '世界一流の軍隊の建設、機械化・情報化・知能化の一体的な発展、統合作戦などが公式資料に登場します。習近平の強軍思想も、公式の公開用語としてのみ取り上げます。', '公開された計画と言葉に限ります。'],
  'korea-interface': ['別のガイドへの目印', '朝鮮戦争（1950～53年）', '朝鮮戦争はこの地球上のもう一つの比較点です。この章では扱わず、別のガイドに引き継ぎます。', '地域を示す印で、作戦図や戦場の再現ではありません。'],
}
