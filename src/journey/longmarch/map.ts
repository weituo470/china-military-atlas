import { bi } from './sources'
import { getDossier } from './dossiers'
import type { Unit } from './content'
export const width = 800, height = 528
export const xy = (lon: number, lat: number) => [(lon - 92) * width / 25, (39 - lat) * height / 16] as const
// Fifteen chapter pins name the same localities as catalogue entries; resolve their
// positions from the entries instead of maintaining a second coordinate list.
// Grasslands is a region, and Ejie a chapter-only place: neither is a route pin.
const dossierAnchor = (unit:Unit, id:string) => {
  const entry = getDossier(unit).stops.find(stop=>stop.id===id)
  if (!entry) throw new Error('Guide map has no route anchor: ' + unit + '/' + id)
  return { lon:entry.lon, lat:entry.lat }
}
export const places = {
  yudu: { name: bi('于都','Yudu'), ...dossierAnchor('first','yudu'), start:true },
  hejia: { name: bi('何家冲','Hejiachong'), ...dossierAnchor('red25','25-hejiachong'), start:true },
  xiang: { name: bi('湘江','Xiang River'), ...dossierAnchor('first','xiang') },
  liping: { name: bi('黎平','Liping'), ...dossierAnchor('first','liping') },
  zunyi: { name: bi('遵义','Zunyi'), ...dossierAnchor('first','zunyi') },
  cangxi: { name: bi('苍溪','Cangxi'), ...dossierAnchor('fourth','cangxi'), start:true },
  luding: { name: bi('泸定','Luding'), ...dossierAnchor('first','luding') },
  dawei: { name: bi('达维','Dawei'), ...dossierAnchor('first','dawei') },
  grass: { name: bi('川西北草地','NW Sichuan grasslands'), lon: 102.70, lat: 33.06 },
  ejie: { name: bi('俄界','Ejie'), lon: 103.28, lat: 33.96 },
  yongping: { name: bi('永坪','Yongping'), ...dossierAnchor('red25','25-yongping-arrival') },
  hadapu: { name: bi('哈达铺','Hadapu'), ...dossierAnchor('first','hadapu') },
  wuqi: { name: bi('吴起镇','Wuqi'), ...dossierAnchor('first','wuqi') },
  sangzhi: { name: bi('桑植','Sangzhi'), ...dossierAnchor('second','2-sangzhi'), start:true },
  ganzi: { name: bi('甘孜','Garzê'), ...dossierAnchor('second','2-ganzi') },
  huining: { name: bi('会宁','Huining'), ...dossierAnchor('fourth','huining') },
  jiangtai: { name: bi('将台堡','Jiangtaibu'), ...dossierAnchor('second','2-jiangtaibu') },
} satisfies Record<string,{ name: ReturnType<typeof bi>; lon: number; lat: number; start?: boolean }>
type Pt={lon:number;lat:number;at:number}
type Route={id:Unit;tag:string;name:ReturnType<typeof bi>;time:ReturnType<typeof bi>;ink:string;dash?:string;paths:Pt[][]}
const styles:Omit<Route,'paths'>[]=[
  {id:'first',tag:'01',name:bi('中央红军','Central Red Army'),time:bi('1934.10 → 1935.10','OCT ’34 → OCT ’35'),ink:'#962b24'},
  {id:'red25',tag:'02',name:bi('红二十五军','25th Army'),time:bi('1934.11 → 1935.09','NOV ’34 → SEP ’35'),ink:'#286058',dash:'2 5'},
  {id:'fourth',tag:'03',name:bi('红四方面军','Fourth Front Army'),time:bi('1935.03 → 1936.10','MAR ’35 → OCT ’36'),ink:'#745019',dash:'11 5'},
  {id:'second',tag:'04',name:bi('红二、六军团 → 红二方面军','Second & Sixth Corps → Second Front Army'),time:bi('1935.11 → 1936.10','NOV ’35 → OCT ’36'),ink:'#39547c',dash:'13 4 2 4'},
]
// No dated interpolation: each displayed vertex has a corresponding cited dossier entry.
// Unrelated formations and broken itineraries start new segments.
export const routes:Route[]=styles.map(r=>{
  const paths:Pt[][]=[]
  for(const s of getDossier(r.id).stops){
    if(!paths.length||s.breakBefore)paths.push([])
    paths[paths.length-1].push({lon:s.lon,lat:s.lat,at:s.by})
  }
  return {...r,paths}
})
export const caption=bi('路线示意 · 实点为路线志选点。虚实线区分队伍；连线不复原道路，不推算每日驻地或里程。','Schematic · Dots are documented entries. Line styles distinguish forces; links do not reconstruct actual roads, daily positions or distance.')
