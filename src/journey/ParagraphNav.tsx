import { useJourney } from '../store/journey'
import { useNarration } from '../store/narration'
import { getJourneyBeats } from './runtime'

export function ParagraphNav() {
  const route = useJourney(s => s.activeJourney)
  const beat = useJourney(s => s.beatIndex)
  const lang = useJourney(s => s.language)
  const index = useNarration(s => s.paragraphIndex)
  const read = useNarration(s => s.readParagraph)
  const pending = useNarration(s => s.manifest?.beats[beat]?.paragraphs[index]?.pendingRecording)
  if (!route) return null
  const count = getJourneyBeats(route)[beat].narration[lang].length
  const zh = lang === 'zh'
  return <div className="paragraph-reader">
    <div role="group" aria-label={zh ? '静音阅读' : 'Silent reading'}>
      <button type="button" disabled={!index} onClick={() => read(index - 1)}>{zh ? '上一小段' : 'Previous paragraph'}</button>
      <span>{index + 1} / {count}</span>
      <button type="button" disabled={index >= count - 1} onClick={() => read(index + 1)}>{zh ? '下一小段' : 'Next paragraph'}</button>
    </div>
    {pending && zh && <p>本小段以修订文字为准，录音待更新。</p>}
  </div>
}
