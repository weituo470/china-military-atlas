import records from './records.json'
import legacy from './legacy-plates.json'
import labels from './labels.json'
import captures from './source-captures.json'
import { sourceUrls } from '../i18n/sourceUrls'
import type { HubLocale, HubCopy } from '../i18n/locales'

type Series<T> = Record<string,T>
const languages = import.meta.glob<Series<string[]>>('./text/*.json', { eager: true, import: 'default' })
const plates:Series<{width:number;height:number;source:string;credit:string;published:string}> = captures
export const archiveDates = [...Object.keys(records), ...Object.keys(legacy)].sort().reverse()
export const decades = [...new Set(archiveDates.map(date => date.slice(0,3)))]

export function archiveView(locale:HubLocale, copy:HubCopy) {
  const terms = labels[locale]
  const words = languages['./text/'+locale+'.json']
  return { terms, entries: archiveDates.map(date=>{
    const old = Object.hasOwn(legacy,date) ? date as keyof typeof legacy : undefined
    const newEntry = old ? undefined : records[date as keyof typeof records]
    const entry = old ? copy.events[old] : undefined
    const [title, account, context] = entry ? [entry.title, entry.account, entry.response] : words[date]
    const sources = entry && old ? sourceUrls[old].map((url,i)=>[entry.sources[i],url]) : newEntry!.sources
    const plate = plates[date]
    return { date, title, account, context, contextLabel: old ? copy.response : terms[4], sources,
      tag:terms[3], plate,
      img:import.meta.env.BASE_URL+'art/hub-sources/'+date+'.webp' }
  })}
}
export type RecordEntry = ReturnType<typeof archiveView>['entries'][number]