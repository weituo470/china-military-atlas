import { useEffect, useRef } from 'react'
import { tri, type BaselineLocale } from '../locale'
import { useNarration } from '../../../store/narration'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
// The exporter writes these atomically. A source checkout can be opened even
// while a new master is rendering; absence must not take down the whole guide.
const audio = import.meta.glob<string>('./deliverables/*.m4a',{eager:true,query:'?url&no-inline',import:'default'})
const rooms = import.meta.glob<string>('./watch.html',{eager:true,query:'?url&no-inline',import:'default'})
const [zh,en,ja] = ['zh','en','ja'].map(id=>audio['./deliverables/fleet-review-'+id+'.m4a'])
const room = rooms['./watch.html']
const previews=import.meta.glob<string>('./deliverables/*.{mp4,webp}',{eager:true,query:'?url&no-inline',import:'default'})
const reel=previews['./deliverables/fleet-review-1080p.mp4']
const poster=previews['./deliverables/fleet-review-poster.webp']
const opening=previews['./deliverables/fleet-review-opening.webp']

export function FilmInsert({language, inline}:{language:BaselineLocale;inline:boolean}){
  const ref=useRef<HTMLVideoElement>(null)
  const playing=useNarration(s=>s.status==='playing')
  const reduce=useReducedMotion()
  useEffect(()=>{
    const video=ref.current
    if(!video)return
    if(inline&&playing&&!reduce)void video.play().catch(()=>{/* static poster remains usable */})
    else video.pause()
    return ()=>video.pause()
  },[inline,playing,reduce])
  const abs=(value:string)=>new URL(value,document.baseURI).href
  if(!reel || !poster || !room || !zh || !en || !ja)return null
  const link=new URL(room,document.baseURI)
  for(const [key,value] of Object.entries({m:reel,zh,en,ja}))link.searchParams.set(key,abs(value))
  if(opening)link.searchParams.set('o',abs(opening))
  link.searchParams.set('l',language)
  const txt=(a:string,b:string,c:string)=>tri(language,a,b,c)
  const title=txt('观看阅舰短片','Watch the fleet film','観艦映像を見る')
  return <a className={'baseline-film-link'+(inline?' is-illustrated':'')} href={link.href} target="_blank" rel="noopener"
    aria-label={txt('新窗口观看阅舰短片，下载无字母版','Watch in a new tab and download the clean master','新しいタブで観艦映像を再生し、字幕なし映像を保存')}
    onClick={()=>{if(useNarration.getState().status==='playing')useNarration.getState().pause()}}>
    {inline&&<video ref={ref} src={reel} poster={poster} muted playsInline preload="none" aria-hidden="true" tabIndex={-1}/>}
    <span><b aria-hidden="true">▷</b> {title} <small>00:25</small></span>
    {inline&&<em>{txt('原创 CG · 非现场实录','Original CG · not archival footage','オリジナルCG・記録映像ではありません')}</em>}
  </a>
}
