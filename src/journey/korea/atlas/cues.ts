import { useEffect, useState } from 'react'
import { readKoreaClock, useKoreaStatus } from '../playback'
import type { KoreaLang } from '../locales'
import { words, type Words, type Front } from './stages'

// Absolute seconds in each shipped beat MP3 (not percentages of translated text).
// Stage is the nearest documented map plate; the spoken date is kept separate.
type Scene = { stage:number; date:string; title:Words; ref?: 'sep30'|'oct05' }
function s(stage:number,date:string,zh:string,en:string,ja:string,ref?: Scene['ref']):Scene {
  return {stage,date,title:words(zh,en,ja),ref}
}
export const scenes = {
  opening:s(0,'1950.06.25','半岛战争爆发','War begins on the peninsula','半島で開戦'),
  fleet:s(0,'1950.06.27','杜鲁门声明与第七舰队','Truman’s statement and the Seventh Fleet','トルーマン声明と第7艦隊'),
  inchon:s(3,'1950.09','仁川登陆，战线转向北方','Inchon and the turn north','仁川上陸と北進'),
  warning:s(3,'1950.10.03','经印度大使发出的警告','The warning through India’s ambassador','インド大使を介した警告','sep30'),
  decision:s(3,'1950.10.13','出兵决定：志愿军尚未渡江','Decision to intervene, before the crossing','参戦の決断、渡河の前','oct05'),
  crossing:s(4,'1950.10.19','志愿军开始渡过鸭绿江','The Volunteers begin crossing the Yalu','志願軍が鴨緑江を渡り始める'),
  first:s(4,'1950.10–11','入朝初期与第一次战役','Entry and the first campaign','参戦初期と第一次戦役'),
  peak:s(5,'1950.11','北进的最远阶段','The northern limit of the advance','北進の最遠期'),
  second:s(5,'1950.11','11月下旬：第二次战役初期','Late November: the second campaign','11月下旬・第二次戦役の初期'),
  winter:s(5,'1950.11–12','冬季战场与补给','Winter conditions and supplies','冬の戦場と補給'),
  reversal:s(6,'1950.12','数周之后：重回三八线一带','Weeks later: back near the parallel','数週間後、再び38度線付近へ'),
  stalemate:s(10,'1951–1953','相持阶段','The stalemate years','戦線の膠着期'),
  treaty:s(10,'1951.09','对日媾和与美日安保','The peace and security treaties with Japan','対日講和と日米安保'),
  armistice:s(13,'1953.07.27','板门店停战','Armistice at Panmunjom','板門店での休戦'),
  report:s(13,'1953.09.12','停战后的报告','A report after the armistice','休戦後の報告'),
  seat:s(13,'1971','战后延伸：联合国代表权','Postwar context: representation at the UN','戦後の文脈：国連代表権'),
  overview:s(0,'1950–1953','三八线与鸭绿江 · 开战时的半岛','The parallel and the Yalu · prewar boundary','38度線と鴨緑江・開戦時の境界'),
} as const
export const referenceFronts:Record<'sep30'|'oct05',{date:string;front:Front}> = {
  // DVA sequence, Sep 30 / Oct 5. Broad fronts, not isolated pockets.
  sep30:{date:'1950.09.30',front:[[[126.51,37.66],[126.94,37.67],[127.23,37.53],[127.6,37.41],[128.02,37.39],[128.43,37.64],[128.76,37.99]]]},
  oct05:{date:'1950.10.05',front:[[[126.57,37.86],[126.85,37.93],[127.15,38.15],[127.23,38.31],[127.42,38.29]],[[127.72,38.04],[128.1,38.10],[128.49,38.32]]]},
}
export type SceneId=keyof typeof scenes
type Change = readonly [zh:number,en:number,ja:number,id:SceneId]
type Cue = {start:SceneId; changes:readonly Change[]; zhAudio?:SceneId}
const c=(start:SceneId,changes:readonly Change[]=[],zhAudio?:SceneId):Cue=>({start,changes,zhAudio})
const cues:readonly (readonly Cue[])[]=[
  [c('opening',[[8.8,10.4,12.4,'warning'],[15.2,18.5,27.6,'peak'],[19.9,22.6,34.1,'reversal']]),
   c('opening',[[21.88,32.0,49.9,'crossing']],'crossing'),c('overview')],
  [c('opening',[[8.9,13.2,15.4,'fleet']]), c('inchon',[[26.8,34.92,45.2,'warning']]),c('decision',[[63.2,79.8,100.5,'crossing']])],
  [c('first'),c('first'),c('decision',[[50.8,74.2,87.6,'second']])],
  [c('crossing',[[14.5,21.5,29.2,'first']]),c('winter'),c('stalemate')],
  [c('crossing'),c('peak',[[13.6,18.9,24.1,'second']]),c('peak',[[35.3,49.4,60.1,'reversal']])],
  [c('fleet',[[11.8,16.9,19.2,'seat']]),c('treaty'),c('armistice',[[42.0,56.8,75.5,'report']])],
  [c('armistice'),c('armistice'),c('armistice')],
]
export function spokenScene(beat:number,paragraph:number,lang:KoreaLang,time:number|null):SceneId {
  const cue=cues[beat]?.[paragraph] ?? cues[0][0]
  // A reader sees the paragraph's focal date; a listener follows the original MP3 clock.
  if (time === null) {
    if (beat === 0 && paragraph === 1) return 'crossing'
    if (beat === 1 && paragraph === 0) return 'fleet'
    if (beat === 4 && paragraph === 2) return 'reversal'
  }
  let id=(time!==null && lang==='zh' && cue.zhAudio) || cue.start
  if (time!==null) for(const change of cue.changes) if(time>=change[lang==='zh'?0:lang==='en'?1:2]) id=change[3]
  return id
}
export function useSpokenScene(beat:number,paragraph:number,lang:KoreaLang):SceneId {
  const status=useKoreaStatus()
  const read=()=>{
    const k=readKoreaClock()
    return spokenScene(beat,paragraph,lang,k.status==='idle'||k.paragraphIndex!==paragraph||k.beatIndex!==beat?null:k.currentTime)
  }
  const [id,setId]=useState(read)
  useEffect(()=>{
    const update=()=>setId(read())
    update()
    if(status!=='playing')return
    const timer=window.setInterval(update,100)
    return ()=>clearInterval(timer)
    // read() samples the audio element; it must not subscribe to every timeupdate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[beat,paragraph,lang,status])
  return id
}

