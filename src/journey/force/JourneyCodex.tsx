import { ARCHIVE_ART } from '../../publicEdition'
import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { paragraphs, t, type JourneyLang } from '../types'
import { BEATS, UI } from './content'
import { CODEX_BEATS, preloadCodexArt, type CodexBeatSpec, type CodexPlate } from './codex'
import { focusForParagraph } from './sites'
import { JourneyPlayer } from './JourneyPlayer'
import '../../styles/codex.css'
import './force-codex.css'

const CLOSE_MS = 420
const OPEN_MS = 720

type Surface = {
  key: string
  material: 'bamboo' | 'parchment'
  plate?: CodexPlate
  compact: boolean
  crop?: 'east' | 'west'
  line: string
  showTitle: boolean
}

function asideFor(beatId: string, language: JourneyLang) {
  if (beatId === 'weapons') return t(UI.inspectHint, language)
  if (beatId === 'strategy') return t(UI.strategyHint, language)
  return ''
}

function resolveSurface(spec: CodexBeatSpec, beatId: string, line: string, paragraphIndex: number, showTitle: boolean): Surface {
  const emphasis = spec.emphasize[Math.min(paragraphIndex, spec.emphasize.length - 1)] ?? spec.emphasize[0]
  const compact = beatId === 'hook' && paragraphIndex === 3

  // One surface for the whole chapter: the torn cream parchment the user referenced.
  // Keep east/west plates so the illustration still follows the narration.
  if (beatId === 'scale' && spec.sharedPlate) {
    return {
      key: `${beatId}-${paragraphIndex}`,
      material: 'parchment',
      plate: spec.sharedPlate,
      compact: false,
      crop: paragraphIndex === 0 ? 'west' : 'east',
      line,
      showTitle,
    }
  }

  if (beatId === 'close' && spec.sharedPlate) {
    return {
      key: `${beatId}-${paragraphIndex}`,
      material: 'parchment',
      plate: spec.sharedPlate,
      compact: false,
      line,
      showTitle,
    }
  }

  const plate = compact
    ? undefined
    : emphasis === 'parchment'
      ? (spec.parchmentPlate ?? spec.bambooPlate)
      : (spec.bambooPlate ?? spec.parchmentPlate)

  return {
    key: `${beatId}-${paragraphIndex}-parchment`,
    material: 'parchment',
    plate,
    compact,
    line,
    showTitle,
  }
}

function PlateView({
  plate,
  language,
  crop,
}: {
  plate: CodexPlate
  language: JourneyLang
  crop?: 'east' | 'west'
}) {
  return (
    <div className="codex-plate" data-aspect={plate.aspect} data-crop={crop}>
      <figure>
        <img src={plate.src} alt={t(plate.alt, language)} />
        <figcaption className="codex-plate-caption">
          {plate.dual && (
            <div className="codex-dual">
              <p>
                <i>{language === 'zh' ? '左 · 东' : 'Left · East'}</i>
                <strong>{t(plate.dual.east, language)}</strong>
              </p>
              <p>
                <i>{language === 'zh' ? '右 · 西' : 'Right · West'}</i>
                <strong>{t(plate.dual.west, language)}</strong>
              </p>
            </div>
          )}
          {t(plate.caption, language)}
          {plate.note && <span>{t(plate.note, language)}</span>}
        </figcaption>
      </figure>
    </div>
  )
}

function SpokenLine({ line, dropCap }: { line: string; dropCap: boolean }) {
  if (!dropCap || !line) return <p className="codex-spoken">{line}</p>
  return (
    <p className="codex-spoken is-drop">
      <span className="codex-drop">{line[0]}</span>
      {line.slice(1)}
    </p>
  )
}

function TornParchment({
  surface,
  beat,
  language,
  note,
}: {
  surface: Surface
  beat: (typeof BEATS)[number]
  language: JourneyLang
  note?: string
}) {
  const aside = surface.showTitle ? asideFor(beat.id, language) : ''
  return (
    <article className={`torn-parchment${surface.compact ? ' is-compact' : ''}${surface.plate ? ' has-plate' : ''}`}>
      <div key={surface.key} className="torn-parchment-sheet">
        <div className="torn-parchment-split">
          <div className="torn-copy">
            {surface.showTitle && <p className="codex-kicker">{t(beat.kicker, language)}</p>}
            {surface.showTitle && <h1 className="codex-title">{t(beat.title, language)}</h1>}
            <SpokenLine line={surface.line} dropCap={surface.showTitle} />
            {beat.id === 'scale' && note ? (
              <details className="force-scale-note">
                <summary>{t(UI.blockLegend, language)}</summary>
                <p className="codex-aside">{note}</p>
              </details>
            ) : (
              (aside || note) && <p className="codex-aside force-margin-note">{note || aside}</p>
            )}
            <p className="codex-geo-caution">{t(UI.coordinateCaution, language)}</p>
          </div>
          {surface.plate && <PlateView plate={surface.plate} language={language} crop={surface.crop} />}
        </div>
      </div>
    </article>
  )
}

export function JourneyCodex() {
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney((store) => store.language)
  const setFocus = useJourney((store) => store.setFocus)
  const diveProgress = useJourney((store) => store.diveProgress)
  const status = useNarration((store) => store.status)
  const paragraphIndex = useNarration((store) => store.paragraphIndex)
  const reducedMotion = useReducedMotion()

  const [visible, setVisible] = useState({ beatIndex, paragraphIndex })
  const [motion, setMotion] = useState<'open' | 'closing' | 'opening'>('opening')

  useEffect(() => {
    preloadCodexArt(beatIndex)
  }, [beatIndex])

  useEffect(() => {
    setFocus(focusForParagraph(beatIndex, paragraphIndex))
  }, [beatIndex, paragraphIndex, setFocus])

  useEffect(() => {
    if (visible.beatIndex === beatIndex && visible.paragraphIndex === paragraphIndex) return
    if (reducedMotion) {
      setVisible({ beatIndex, paragraphIndex })
      setMotion('open')
      return
    }
    setMotion('closing')
    const closeTimer = window.setTimeout(() => {
      setVisible({ beatIndex, paragraphIndex })
      setMotion('opening')
    }, CLOSE_MS)
    return () => window.clearTimeout(closeTimer)
  }, [beatIndex, paragraphIndex, reducedMotion, visible.beatIndex, visible.paragraphIndex])

  useEffect(() => {
    if (motion !== 'opening') return
    if (reducedMotion) {
      setMotion('open')
      return
    }
    const openTimer = window.setTimeout(() => setMotion('open'), OPEN_MS)
    return () => window.clearTimeout(openTimer)
  }, [motion, reducedMotion, visible])

  const spec = CODEX_BEATS[visible.beatIndex] ?? CODEX_BEATS[0]
  const beat = BEATS[visible.beatIndex] ?? BEATS[0]
  const lines = paragraphs(beat.narration, language)
  const line = lines[Math.min(visible.paragraphIndex, Math.max(0, lines.length - 1))] ?? lines[0] ?? ''
  const surface = resolveSurface(spec, beat.id, line, visible.paragraphIndex, visible.paragraphIndex === 0)
  if (!ARCHIVE_ART) surface.plate = undefined
  const strategyNote = beat.id === 'strategy' && visible.paragraphIndex === 2
    ? t(UI.farNear, language)
    : beat.id === 'scale' ? (language === 'zh'
      ? '每格一千人。雅典 27 格：据修昔底德卷六编成估算，含桨手；高加米拉 47 格：参阿利安《远征记》三卷十二节，步骑合计约 4.7 万；罗马 20 格：参波利比乌斯《历史》卷六的两军团及盟军编制，取 1.6–2 万估算的上限。秦 600 格：《史记·白起王翦列传》记王翦攻楚六十万，非名册。'
      : 'Each block is 1,000 people. Athens: 27, estimated with crews from Thucydides VI. Gaugamela: 47, infantry and cavalry combined (Arrian III.12). Rome: 20, upper bound of the 16–20,000 estimate for two legions with allies (organisation: Polybius VI). Qin: 600, the Shiji biography of Bai Qi and Wang Jian on the Chu campaign, not a muster.') : undefined

  const diving = diveProgress > 0.12
  const divingDeep = diveProgress > 0.93
  const battleCaption = language === 'zh'
    ? '示意：列国交战的阵列与密度，不是某一战场的复原，也不把文献里的巨大数字铺到画面上。'
    : 'Typological: formations and density of Warring States armies — not a reconstruction of one battlefield, and not a source’s unverified total.'

  const stageClass = [
    'codex-stage',
    `is-${motion}`,
    `is-${surface.material}`,
    reducedMotion ? 'is-static' : '',
    status === 'playing' ? 'is-playing' : '',
    status === 'paused' ? 'is-paused' : '',
    surface.compact ? 'is-compact' : '',
    diving ? 'is-diving' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={`journey-codex force-codex${diving ? ' is-diving' : ''}${divingDeep ? ' is-diving-deep' : ''}`}
      aria-live="polite"
      data-beat={spec.id}
      data-material={surface.material}
    >
      <div className="codex-vignette" aria-hidden="true" />
      <div className={stageClass} inert={diving}>
        <TornParchment surface={surface} beat={beat} language={language} note={strategyNote} />
      </div>
      <p className="battle-caption">{battleCaption}</p>
      {language === 'zh' && beat.id === 'hook' && surface.showTitle && (
        <div className="codex-footer" inert={diving}>
          <JourneyPlayer placement="codex" />
        </div>
      )}
    </div>
  )
}
