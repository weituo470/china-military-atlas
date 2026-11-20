import { useAtlas } from './visit'
import { useEffect } from 'react'
import { atlasIds,fleetCatalog,navyNames,words } from './catalog'
import { tri,type BaselineLocale } from '../locale'
import { useJourney } from '../../../store/journey'
import type { ReviewNavyId } from '../review'
import './live.css'

export function FleetControls({language}:{language:BaselineLocale}){
  const ready=useAtlas(s=>s.ready),mode=useAtlas(s=>s.mode),berth=useAtlas(s=>s.berth),bearing=useAtlas(s=>s.bearing)
  const custom=useAtlas(s=>Math.abs(s.yaw)+Math.abs(s.pitch)>.018)
  if(!ready)return null
  const id=berth.modelId!, entry=fleetCatalog[id],copy=(zh:string,en:string,ja:string)=>tri(language,zh,en,ja)
  const name=words(entry.name,language),country=words(navyNames[entry.navy],language)
  const headings={ship:copy('看单舰','Ship view','個艦を見る'),formation:copy('看全队','Fleet overview','全体を見る'),notes:copy('读档案','Read dossier','資料を読む')}
  const angleNames={bow:copy('舰艏','Bow','艦首'),beam:copy('舷侧','Broadside','舷側'),overhead:copy('俯瞰','Above','俯瞰')}
  const access=useAtlas.getState()
  return <section className="fleet-console" aria-label={copy('地球海面阅舰','Fleet on the globe','地球儀上の観艦')}>
    <div className="fleet-heading">
      <div className="fleet-title">
        <small>{copy('太平洋 · 示意阅舰场','Pacific · illustrative fleet review','太平洋・模式観艦式')}{mode==='ship'?' / '+country:''}</small>
        <strong>{mode==='ship'?name:mode==='formation'?copy('海上全景','Fleet on the Pacific','海上の全景'):copy('阅舰档案','Fleet dossier','観艦資料')}</strong>
      </div>
      <div className="fleet-modes" role="group" aria-label={copy('阅舰视图','Review view','表示モード')}>
        {(['ship','formation','notes'] as const).map(m=><button key={m} type="button" aria-pressed={mode===m} data-fleet-mode={m} onClick={()=>{useJourney.getState().closeCard();access.show(m)}}>{headings[m]}</button>)}
        {mode!=='notes'&&<button type="button" data-fleet-clean onClick={access.toggleClean} title={copy('隐藏界面；轻点画面或按 H 返回','Hide controls; tap the view or press H to return','画面だけ表示。タップまたは H で戻る')}>{copy('净画面','Clean view','映像のみ')}</button>}
      </div>
    </div>
    {mode!=='notes'&&<div className="fleet-tools">
      <label className="fleet-choose"><span>{copy('选舰','Choose ship','艦を選択')}</span>
        <select value={mode==='ship'?id:''} aria-label={copy('选舰近观','Inspect a ship','近くで見る艦を選択')} onChange={e=>{const v=atlasIds.find(k=>k===e.target.value);if(v)access.choose(v)}}>
          {mode==='formation'&&<option value="">{copy('选择舰型…','Choose a type…','艦型を選択…')}</option>}
          {(['review-plan','review-us','review-japan','review-rok','review-russia','review-australia'] as ReviewNavyId[]).map(n=><optgroup key={n} label={words(navyNames[n],language)}>{atlasIds.filter(k=>fleetCatalog[k].navy===n).map(k=><option value={k} key={k}>{words(fleetCatalog[k].name,language)}</option>)}</optgroup>)}
        </select>
      </label>
      {mode==='ship'&&<div className="fleet-angles" role="group" aria-label={copy('观察角度','Camera angle','視点')}>
        {(['bow','beam','overhead'] as const).map(k=><button type="button" key={k} data-fleet-angle={k} aria-pressed={bearing===k&&!custom} onClick={()=>access.angle(k)}>{angleNames[k]}</button>)}
      </div>}
      {mode==='ship'&&<div className="fleet-angles fleet-zoom" role="group" aria-label={copy('画面缩放','Zoom','拡大・縮小')}>
        <button type="button" aria-label={copy('拉远','Zoom out','縮小')} onClick={()=>access.magnify(.84)}>−</button>
        <button type="button" aria-label={copy('拉近','Zoom in','拡大')} onClick={()=>access.magnify(1.19)}>＋</button>
      </div>}
      <p className="fleet-caption">{mode==='ship'?words(entry.detail,language):copy('点舰体可近观。细标每枚约十艘；位置仅为取景。','Select a hull to look closer. Each tally mark represents about ten vessels; positions are illustrative.','艦体を選ぶと拡大します。細い印は1個で約10隻を表し、配置は演出上のものです。')}{mode==='ship'&&<small>{copy('拖动环视，滚轮或双指缩放。','Drag to orbit; scroll or pinch to zoom.','ドラッグで回転、スクロールまたはピンチで拡大・縮小。')}</small>}</p>
    </div>}
  </section>
}

export function RestoreFleetControls({language}:{language:BaselineLocale}){
  const clean=useAtlas(s=>s.clean)
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{
      if(e.code==='KeyH'&&!e.repeat&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!useJourney.getState().sourcesOpen&&!useJourney.getState().selectedCardId
        && !(e.target instanceof Element&&e.target.closest('input,select,textarea,[contenteditable=true]'))){useAtlas.getState().toggleClean()}
    }
    let down:{x:number;y:number}|undefined
    const start=(e:PointerEvent)=>{if(e.target instanceof HTMLCanvasElement&&useAtlas.getState().clean)down={x:e.clientX,y:e.clientY}}
    const click=(e:MouseEvent)=>{
      const restore=down&&e.target instanceof HTMLCanvasElement&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5
      down=undefined
      if(restore&&useAtlas.getState().clean){e.stopImmediatePropagation();useAtlas.getState().toggleClean()}
    }
    window.addEventListener('keydown',key);window.addEventListener('pointerdown',start,true);window.addEventListener('click',click,true)
    return ()=>{window.removeEventListener('keydown',key);window.removeEventListener('pointerdown',start,true);window.removeEventListener('click',click,true)}
  },[])
  return clean?<button type="button" className="fleet-restore" onClick={useAtlas.getState().toggleClean}>
    {tri(language,'恢复界面 · H','Show controls · H','操作に戻る · H')}
  </button>:null
}
