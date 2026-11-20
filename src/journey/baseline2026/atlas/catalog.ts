import type { BaselineLocale } from '../locale'
import type { ReviewNavyId } from '../review'

type Trio=readonly [string,string,string]
type Entry={navy:ReviewNavyId;name:Trio;detail:Trio;length:number;beam:number}
const cn='review-plan', us='review-us', jp='review-japan', au='review-australia', kr='review-rok', ru='review-russia'
function ship(navy:ReviewNavyId,length:number,beam:number,name:Trio,detail:Trio):Entry{return {navy,length,beam,name,detail}}
export const fleetCatalog={
  liaoning:ship(cn,.094,.012,['辽宁舰 · 16','Liaoning · 16','遼寧 · 16'],['从舷侧看，舰艏的甲板向上翘起。','Seen broadside, the flight deck curves up at the bow.','舷側から見ると、艦首の飛行甲板が上に反っています。']),
  shandong:ship(cn,.095,.0125,['山东舰 · 17','Shandong · 17','山東 · 17'],['同为滑跃甲板；从舰艉辨认右舷的层叠舰桥。','Another ski-jump deck. From astern, look for the stepped bridge to starboard.','艦首はスキージャンプ式。艦尾側から右舷に重なる艦橋を見比べてください。']),
  fujian:ship(cn,.099,.014,['福建舰 · 18','Fujian · 18','福建 · 18'],['从舰艏看到舰艉，宽阔的飞行甲板不再上翘。','Follow the broad flight deck to the bow: there is no upward ramp.','広い飛行甲板は艦首まで平らで、反り上がりがありません。']),
  type055:ship(cn,.059,.007,['055 型驱逐舰','Type 055 destroyer','055型駆逐艦'],['高耸的前部舰桥和桅楼，与低平的舰艉平台形成高差。','The forward bridge and mast rise well above the low stern deck.','高い前部艦橋やマストと、低い艦尾甲板の段差に注目します。']),
  type075:ship(cn,.079,.010,['075 型两栖攻击舰','Type 075 landing helicopter dock','075型強襲揚陸艦'],['直通飞行甲板贯穿全舰，舰岛位于右舷。','A straight flight deck runs the length of the hull, with the island to starboard.','全通飛行甲板の右舷に艦橋構造物が立っています。']),
  type071:ship(cn,.070,.0085,['071 型船坞登陆舰','Type 071 landing platform dock','071型ドック型揚陸艦'],['舰桥在前，开敞平台在后；与 075 型的直通甲板不同。','The bridge is forward and the open deck aft, unlike the full-length deck of the Type 075.','艦橋は前、開けた甲板は後ろにあり、075型の全通甲板とは異なります。']),
  nimitz:ship(us,.105,.0135,['尼米兹级航母','Nimitz-class carrier','ニミッツ級空母'],['俯视斜角甲板，再与福特级的舰岛轮廓对照。','Look down on the angled deck, then compare the island with the Ford class.','斜めに延びる甲板と艦橋の形を、フォード級と見比べてください。']),
  ford:ship(us,.105,.0135,['福特级航母','Ford-class carrier','フォード級空母'],['同样是斜角甲板，较紧凑的舰岛更靠后。','The angled deck remains, but the more compact island sits farther aft.','斜めの甲板は共通ですが、より小さな艦橋は後方に寄っています。']),
  izumo:ship(jp,.079,.0098,['出云 · 护卫舰','JS Izumo · escort vessel','護衛艦いずも'],['按 2021 年公开外观绘制；在此按护卫舰列示。','Shown as photographed in 2021, under Japan’s official escort-vessel category.','2021年の公開写真に基づく外観。公式区分の「護衛艦」として表示しています。']),
  kaga:ship(jp,.079,.0098,['加贺 · 护卫舰','JS Kaga · escort vessel','護衛艦かが'],['按 2024 年公开外观绘制，注意方形舰艏。','The squared-off bow follows photographs from 2024.','2024年の公開写真に合わせ、艦首を角張った形で描いています。']),
  sejong:ship(kr,.054,.0069,['世宗大王级驱逐舰','Sejong the Great–class destroyer','世宗大王級駆逐艦'],['看前部舰桥和后部直升机甲板；本列仅作舰型示意。','Look from the forward bridge to the aft helicopter deck. This column illustrates a type, not a fleet total.','前部艦橋から艦尾の飛行甲板へ。この列は艦型の例で、隻数を示しません。']),
  udaloy:ship(ru,.054,.0063,['无畏级舰艇','Udaloy-class ship','ウダロイ級艦艇'],['两座桅杆勾出分段的上层轮廓；本列不是舰艇清点。','Two masts break up the silhouette. The column is not an inventory.','二つのマストが輪郭を分けます。この列は艦艇数を示しません。']),
  hobart:ship(au,.049,.0059,['霍巴特级驱逐舰','Hobart-class destroyer','ホバート級駆逐艦'],['看棱角分明的舰桥和艉部平台。它是舰型示例，不是规模标。','Look for the angular bridge and aft deck. This is a class example, not a counting mark.','角張った艦橋と艦尾甲板に注目。これは艦型の例で、集計の印ではありません。']),
  anzac:ship(au,.039,.0049,['安扎克级护卫舰','Anzac-class frigate','アンザック級フリゲート'],['舰体修长，舰艉留出直升机甲板。','A slender hull ends in an open helicopter deck.','細長い船体の艦尾にはヘリコプター甲板があります。']),
  collins:ship(au,.027,.0027,['柯林斯级潜艇','Collins-class submarine','コリンズ級潜水艦'],['水面航行示意：海面上只露出艇背、围壳和部分艉舵。','Shown surfaced: the casing, sail and part of the stern fin break the water.','浮上時の姿。水面には船体上部、セイル、艦尾の舵の一部が見えます。']),
} as const
export type AtlasId=keyof typeof fleetCatalog
export const atlasIds=Object.keys(fleetCatalog) as AtlasId[]
export const navyNames:Record<ReviewNavyId,Trio>={
  [cn]:['中国','China','中国'],[us]:['美国','United States','米国'],[jp]:['日本','Japan','日本'],[kr]:['韩国','Republic of Korea','韓国'],[ru]:['俄罗斯','Russia','ロシア'],[au]:['澳大利亚','Australia','オーストラリア'],
}
export const words=(v:Trio,l:BaselineLocale)=>v[l==='zh'?0:l==='en'?1:2]
export const atlasScale=.33

