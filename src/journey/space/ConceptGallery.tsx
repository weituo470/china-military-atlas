import { useState } from 'react'
import type { JourneyLang } from '../types'
const j36=import.meta.glob<string>('./plates/concept-j36.webp',{eager:true,query:'?url',import:'default'})['./plates/concept-j36.webp']
const j50=import.meta.glob<string>('./plates/concept-j50.webp',{eager:true,query:'?url',import:'default'})['./plates/concept-j50.webp']

export const hasConcepts = Boolean(j36 && j50)
const works = [
  {
    id: 'J-36', src: j36,
    title: { zh: '云海晨光', en: 'First light above the clouds' },
    alt: { zh: 'J-36 灵感想象图：从斜上方望去，宽大的灰色无尾机翼迎着金色晨光，远山从云海中露出。', en: 'J-36-inspired concept art: a broad, grey tailless aircraft catches golden morning light above clouds and mountain peaks.' },
  },
  {
    id: 'J-50', src: j50,
    title: { zh: '海岸转弯', en: 'Banking over the coast' },
    alt: { zh: 'J-50 灵感想象图：银灰色飞机在碧蓝海岸上空轻轻侧倾，折线翼尖与远处山脊相映。', en: 'J-50-inspired concept art: a silver aircraft banks gently over a blue coastline, with angular wingtips against distant ridges.' },
  },
] as const

export function ConceptGallery({ lang }: { lang: JourneyLang }) {
  const [index, setIndex] = useState(0)
  const work = works[index]
  const zh = lang === 'zh'
  return (
    <div className="space-concept-gallery">
      <figure>
        <div className="space-concept-print">
          <img className="space-concept-art" src={work.src} width="1600" height="900" decoding="async" alt={work.alt[lang]} />
          <span>{zh ? 'AI 想象图 · 非实拍' : 'AI concept art · Not a photograph'}</span>
        </div>
        <figcaption>
          <div aria-live="polite"><h3>{work.title[lang]}</h3><span>{zh ? `以 ${work.id} 为灵感` : `Inspired by ${work.id}`}</span></div>
          <div className="space-concept-selector" role="group" aria-label={zh ? '选择作品' : 'Choose artwork'}>
            {works.map((item, i) => <button type="button" key={item.id} aria-pressed={index === i} onClick={() => setIndex(i)}>
              <img src={item.src} alt="" width="56" height="32" />{item.id}
            </button>)}
          </div>
        </figcaption>
      </figure>
      <p className="space-concept-note">{zh
        ? 'J-36、J-50 沿用公开报道中的称呼。两幅画是对外形的艺术想象，不是官方定型图。'
        : 'J-36 and J-50 are names used in public reporting. These artistic interpretations are not official depictions.'}</p>
    </div>
  )
}

