import { useCallback, useEffect, useRef, useState } from 'react'
import type { HubLocale } from '../i18n/locales'
import intros from '../intro-recordings.json'
import clips from './recordings.json'
import scripts from './scripts.json'
export { default as tourLabels } from './labels.json'
export const stops = ['opening', ...Object.keys(scripts).sort().reverse(), 'author']
type Voice = keyof typeof intros
type Clip = { audioHash:string; duration:number }
const tracks: Record<string,Partial<Record<Voice,Clip>>> = clips
export function tourVoice(locale:HubLocale):Voice { return Object.hasOwn(intros,locale) ? locale as Voice : 'en' }
function source(index:number,locale:HubLocale) {
  const voice=tourVoice(locale), id=stops[index], clip=tracks[id]?.[voice]
  if (!clip && id!=='author') throw new Error('Missing tour clip: '+id+' '+voice)
  const path=clip ? `tour/${id}-${voice}` : voice
  return `${import.meta.env.BASE_URL}audio/hub/${path}.mp3?v=${(clip??intros[voice]).audioHash.slice(0,12)}`
}
type Mode='loading'|'blocked'|'playing'|'paused'|'finished'|'failed'
// All segments share a single audio element, including the author's standalone shortcut.
export function useAudioTour(locale:HubLocale, active:boolean) {
  const audio=useRef<HTMLAudioElement>(null), token=useRef(0), position=useRef(0), wanted=useRef(false)
  const handoff=useRef<{index:number; play:boolean}|null>(null)
  const [index,setIndex]=useState(0),[mode,setMode]=useState<Mode>('loading'),[follow,setFollow]=useState(0)
  const go=useCallback((n:number, play:boolean, scroll=true)=>{
    const el=audio.current;if(!active||!el||n<0||n>=stops.length)return
    const call=++token.current; wanted.current=play;position.current=n;setIndex(n)
    if(scroll)setFollow(t=>t+1)
    const url=source(n,locale)
    if(el.getAttribute('src')!==url||el.error){el.pause();el.preload=play?'auto':'none';el.src=url;el.load()}
    if(!play){el.pause();setMode('paused');return}
    setMode('loading')
    void el.play().then(()=>{if(call===token.current)setMode('playing')}).catch((e:unknown)=>{
      if(call!==token.current)return
      wanted.current=false
      setMode(e instanceof DOMException && e.name==='NotAllowedError'?'blocked':'failed')
    })
  },[locale,active])
  const pause=useCallback(()=>{++token.current;wanted.current=false;audio.current?.pause();setMode('paused')},[])
  useEffect(()=>{
    const el=audio.current;if(!active||!el){handoff.current=null;return}
    function ended(){if(!wanted.current)return; const next=position.current+1;if(next<stops.length)go(next,true);else{wanted.current=false;setMode('finished')}}
    function failed(){if(!el?.error)return;++token.current;wanted.current=false;setMode('failed')}
    function nativePause(){if(el?.paused&&!el.ended&&wanted.current&&el.readyState>=2)pause()}
    el.addEventListener('ended',ended);el.addEventListener('error',failed);el.addEventListener('pause',nativePause);window.addEventListener('pagehide',pause)
    const previous=handoff.current;handoff.current=null;setFollow(0);go(previous?.index??0,previous?.play??true,false)
    return ()=>{handoff.current={index:position.current,play:wanted.current};++token.current;wanted.current=false;el.removeEventListener('ended',ended);el.removeEventListener('error',failed);el.removeEventListener('pause',nativePause);window.removeEventListener('pagehide',pause);el.pause();el.removeAttribute('src');el.load()}
  },[go,pause,active])
  return {audio,index,mode,follow,id:stops[index],toggle:()=>{if(wanted.current)pause();else if(mode==='finished')go(0,true);else go(index,true,false)},jump:(n:number)=>go(n,wanted.current),author:()=>go(stops.length-1,true)}
}

