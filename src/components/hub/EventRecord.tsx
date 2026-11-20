import { archiveView, decades, type RecordEntry } from './archive'
import type { HubCopy, HubLocale } from './i18n/locales'
import { useState, useEffect } from 'react'

function CaseRow({ entry, open, toggle }: { entry:RecordEntry; open:boolean; toggle:()=>void }) {
  const {date}=entry
  return <li data-case={date}><details open={open}>
    <summary onClick={e=>{e.preventDefault();toggle()}}><time dateTime={date} dir="ltr">{date.replaceAll('-', '.')}</time><span>{entry.title}</span><i aria-hidden="true"/></summary>
    <div className="atlas-record-body"><p>{entry.account}</p>
      <p><b>{entry.contextLabel}</b>{' · '}{entry.context}</p>
      <div className="atlas-record-links">{entry.sources.map(([label,url])=><a key={url} href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>
    </div></details></li>
}
export function EventRecord({copy,locale,selected,step}:{copy:HubCopy;locale:HubLocale;selected:string;step:number}) {
  const selectedDate=selected==='opening'||selected==='author'?null:selected
  const [decade,setDecade]=useState(''),[open,setOpen]=useState<string|null>(selectedDate)
  const {terms,entries}=archiveView(locale,copy)
  useEffect(()=>{setDecade('');setOpen(selectedDate)},[selectedDate,step])
  return <section className="atlas-record" aria-labelledby="record-title">
    <header><h2 id="record-title">{copy.record}</h2><span>{copy.newest} ↓</span></header>
    <p className="atlas-record-note">{terms[6]}</p>
    <div className="atlas-record-nav" role="group" aria-label={terms[5]}>{['',...decades].map(d=><button type="button" key={d} data-decade={d} aria-pressed={d===decade} onClick={()=>setDecade(d)}>{d ? <bdi dir="ltr">{d}0–{d.slice(-1)}9</bdi> : <>{terms[0]} <bdi>{entries.length}</bdi></>}</button>)}</div>
    <ol>{entries.filter(e=>e.date.startsWith(decade)).map(e=><CaseRow key={e.date} entry={e} open={open===e.date} toggle={()=>setOpen(open===e.date?null:e.date)}/>)}</ol>
  </section>
}
