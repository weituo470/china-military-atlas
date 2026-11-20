import { useEffect, useState, type ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useExperience } from '../../store/experience'
import { useJourney } from '../../store/journey'
import { initNarration, useNarration } from '../../store/narration'
import type { JourneyId } from '../types'
import { industryLocale, phrase, t, type IndustryLanguage } from './locale'
import {
  BEATS,
  JUMP_TICKETS,
  SOURCE_TAGS,
  UI,
  narrationForBeat,
} from './content'
import { OpeningPlate } from './atlas/OpeningPlate'
import { ClosingPlate } from './atlas/ClosingPlate'
import { JourneyPlayer } from './JourneyPlayer'
import { cursorForParagraph, focusForParagraph } from './sites'
import '../../styles/industry.css'
import './dossier.css'

const CLOSE_MS = 420
const OPEN_MS = 720

type TagKind = 'officialRelease' | 'officialDocument' | 'officialWording' | 'law' | 'externalEstimate'

function SourceTag({ kind, language, extra }: { kind: TagKind; language: IndustryLanguage; extra?: string }) {
  const dashed = kind === 'externalEstimate'
  return (
    <span className={`industry-tag${dashed ? ' is-dashed' : ''}${kind === 'law' ? ' is-law' : ''}`}>
      {t(SOURCE_TAGS[kind], language)}
      {extra ? `  ·  ${extra}` : ''}
    </span>
  )
}

function JumpButton({ id, language }: { id: keyof typeof JUMP_TICKETS; language: IndustryLanguage }) {
  const startJourney = useJourney((store) => store.startJourney)
  const ticket = JUMP_TICKETS[id]
  return (
    <button
      type="button"
      className="industry-jump"
      onClick={() => {
        startJourney(ticket.to)
        void initNarration(ticket.to as JourneyId)
      }}
    >
      <small>{t(ticket.hint, language)} →</small>
      <strong>{t(ticket.label, language)}</strong>
    </button>
  )
}

function plateFor(beatIndex: number, paragraphIndex: number, language: IndustryLanguage): ReactNode {
  const tag = t(UI.schematicMark, language)
  return beatIndex < 6
    ? <OpeningPlate beat={beatIndex} paragraph={paragraphIndex} language={language} tag={tag} />
    : <ClosingPlate beat={beatIndex === 6 ? 6 : 7} paragraph={paragraphIndex} language={language} tag={tag} />
}

function extrasFor(beatIndex: number, paragraphIndex: number, language: IndustryLanguage): ReactNode {
  if (beatIndex === 0 && paragraphIndex >= 2) {
    return <p className="industry-motto">{phrase(language, '看摆出来的，也看撑在后面的。', 'Look at what is lined up, and at what holds it up from behind.', "表に出ているものと、その背後で支えるものの両方を見る。")}</p>
  }
  if (beatIndex === 1 && paragraphIndex === 0) {
    return (
      <div className="industry-jumps">
        <JumpButton id="force" language={language} />
      </div>
    )
  }
  if (beatIndex === 1 && paragraphIndex === 1) {
    return <p className="industry-motto">{phrase(language, '差的不是一件兵器，是一个时代。', 'The gap was not one weapon. It was an era.', "違いは武器一つではなく、時代そのものだった。")}</p>
  }
  if (beatIndex === 1 && paragraphIndex >= 3) {
    return <p className="industry-motto">{phrase(language, '有了几座厂，还不等于有了工业。', 'A few plants are not yet an industry.', "工場がいくつかあっても、それだけでは産業にならない。")}</p>
  }
  if (beatIndex === 2 && paragraphIndex === 1) {
    return (
      <>
        <blockquote className="industry-quote">
          {phrase(language, '千条万条，运输第一条。', 'Of all the tasks, transport comes first.', "数ある仕事の中でも、まず輸送。")}
        </blockquote>
        <div className="industry-jumps">
          <JumpButton id="korea" language={language} />
        </div>
      </>
    )
  }
  if (beatIndex === 2 && paragraphIndex === 2) {
    return (
      <blockquote className="industry-quote">
        {phrase(language, '……但是，一辆汽车、一架飞机、一辆坦克、一辆拖拉机都不能造。', '… But we cannot make a single automobile, a single airplane, a single tank, or a single tractor.', "……だが、自動車一台、航空機一機、戦車一両、トラクター一台も造れない。")}
        <footer>{phrase(language, '毛泽东，1954 年 6 月', 'Mao Zedong, June 1954', "毛沢東、1954年6月")}</footer>
      </blockquote>
    )
  }
  if (beatIndex === 3 && paragraphIndex === 0) {
    return (
      <div className="industry-source-row">
        <SourceTag kind="officialWording" language={language} extra={phrase(language, '第一个五年计划 · 156 项', 'First Five-Year Plan · 156 projects', "第一次五カ年計画・156事業")} />
      </div>
    )
  }
  if (beatIndex === 3 && paragraphIndex === 1) {
    return (
      <div className="industry-source-row">
        <SourceTag kind="officialWording" language={language} extra="1964" />
      </div>
    )
  }
  if (beatIndex === 3 && paragraphIndex === 2) {
    return <p className="industry-motto">{phrase(language, '留下了什么，付出了什么。', 'What it left, and what it cost.', "何が残り、どんな代償を払ったのか。")}</p>
  }
  if (beatIndex === 3) {
    return <p className="industry-motto">{phrase(language, '纵深 · 备份', 'Depth · Backup', "地理的な広がり・予備能力")}</p>
  }
  if (beatIndex === 4 && paragraphIndex === 2) {
    return <p className="industry-motto">{phrase(language, '一张网的完整程度', 'How complete a network is', "産業網がどれだけつながっているか")}</p>
  }
  if (beatIndex === 4 && paragraphIndex >= 3) {
    return (
      <>
        <div className="industry-source-row">
          <SourceTag kind="officialWording" language={language} extra={phrase(language, 'S10 · 国新办发布会（2024-07-05）· 41 个工业大类 · 联合国产业分类中全部工业门类', 'S10 · SCIO briefing (2024-07-05) · 41 major categories · every UN industrial category', "S10 · 国務院新聞弁公室会見（2024年7月5日）・工業41大分類・国連の全工業分野")} />
        </div>
        <p className="industry-caution">{phrase(language, '门类全，不等于样样领先。', 'Having every category does not mean leading in every one.', "分野がそろうことは、すべての分野で先頭に立つことではない。")}</p>
      </>
    )
  }
  if (beatIndex === 5 && paragraphIndex === 0) {
    return (
      <>
        <div className="industry-source-row">
          <SourceTag kind="officialRelease" language={language} extra={phrase(language, '工业和信息化部：2025 年造船完工量占世界总量 56.1%（按载重吨）', 'MIIT: 2025 completions, 56.1% of world total (dwt)', "工業情報化部：2025年の造船完工量は世界の56.1%（載貨重量トン）")} />
        </div>
        <p className="industry-caution">{phrase(language, '商船市场统计，不可换算为军舰。', 'A commercial shipbuilding statistic. It cannot be converted into warships.', "商船市場の統計であり、軍艦数には換算できない。")}</p>
      </>
    )
  }
  if (beatIndex === 5 && paragraphIndex === 1) {
    return (
      <div className="industry-source-row">
        <SourceTag kind="externalEstimate" language={language} extra={phrase(language, 'S12 · 美国国防部：2022 年版判断各类舰艇建造能力在增强；2024 年版称按吨位为世界最大造船国。', 'S12 · US DoD: capacity for naval construction increasing (2022 report); top ship-producing nation by tonnage (2024 report).', "S12 · 米国防総省：2022年版は各種艦艇の建造能力向上、2024年版はトン数で世界最大の造船国と評価。")} />
      </div>
    )
  }
  if (beatIndex === 5 && paragraphIndex === 3) {
    return (
      <>
        <blockquote className="industry-quote">
          {phrase(language, '与世界先进军事水平相比差距还很大', 'Compared with advanced military levels in the world, the gap is still large.', "世界の先進水準とはなお大きな隔たりがある")}
          <footer>{phrase(language, '2019 年《新时代的中国国防》', '2019 white paper, China’s National Defense in the New Era', "2019年国防白書『新時代の中国の国防』")}</footer>
        </blockquote>
        <div className="industry-source-row">
          <SourceTag kind="officialDocument" language={language} extra="2019" />
        </div>
        <div className="industry-jumps">
          <JumpButton id="baseline2026" language={language} />
        </div>
      </>
    )
  }
  if (beatIndex === 6 && paragraphIndex === 1) {
    return (
      <>
        <div className="industry-source-row">
          <SourceTag kind="law" language={language} extra={phrase(language, '《国防交通法》', 'National Defense Transportation Law', "国防交通法")} />
        </div>
        <blockquote className="industry-quote">
          {phrase(language, '平时服务、急时应急、战时应战', 'Serve in peacetime, respond in emergencies, meet wartime needs.', "平時は社会に役立ち、緊急時は対応し、戦時は必要に応える")}
        </blockquote>
      </>
    )
  }
  if (beatIndex === 6 && paragraphIndex === 2) {
    return (
      <div className="industry-source-row">
        <SourceTag kind="law" language={language} extra={phrase(language, '《国防动员法》（2026 年修订）', 'National Defense Mobilization Law (2026 revision)', "国防動員法（2026年改正）")} />
      </div>
    )
  }
  if (beatIndex === 6 && paragraphIndex >= 3) {
    return (
      <>
        {paragraphIndex === 3 && (
          <p className="industry-motto">{phrase(language, '军民融合发展  ·  一体化国家战略体系和能力', 'Military-civil integration  ·  An integrated national strategic system and capacity', "軍民融合発展・一体化した国家戦略体系と能力")}</p>
        )}
        <div className="industry-jumps">
          <JumpButton id="mobilize" language={language} />
        </div>
      </>
    )
  }
  if (beatIndex === 7 && paragraphIndex === 2) {
    return (
      <>
        <p className="industry-motto">{phrase(language, '工业是军力的底盘。', 'Industry is the chassis of military power.', "産業は軍事力の土台だ。")}</p>
        <p className="industry-caution">{t(UI.noRank, language)}</p>
      </>
    )
  }
  if (beatIndex === 7 && paragraphIndex >= 3) {
    return (
      <>
        <div className="industry-jumps industry-jumps-index">
          <JumpButton id="force" language={language} />
          <JumpButton id="korea" language={language} />
          <JumpButton id="mobilize" language={language} />
          <JumpButton id="baseline2026" language={language} />
        </div>
      </>
    )
  }
  return null
}

export function JourneyCodex() {
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney(industryLocale)
  const setFocus = useJourney((store) => store.setFocus)
  const status = useNarration((store) => store.status)
  const paragraphIndex = useNarration((store) => store.paragraphIndex)
  const clipVariant = useNarration((store) => store.clipVariant)
  const reducedMotion = useReducedMotion()

  const [visible, setVisible] = useState({ beatIndex, paragraphIndex, clipVariant })
  const [motion, setMotion] = useState<'open' | 'closing' | 'opening'>('opening')

  useEffect(() => {
    setFocus(focusForParagraph(beatIndex, paragraphIndex))
    const cursor = cursorForParagraph(beatIndex, paragraphIndex)
    useExperience.setState({ calendarCursor: cursor })
  }, [beatIndex, paragraphIndex, setFocus, status])

  useEffect(() => {
    if (visible.beatIndex === beatIndex && visible.paragraphIndex === paragraphIndex && visible.clipVariant === clipVariant) {
      // Reversing a page turn before the swap must not leave the old sheet hidden.
      setMotion((current) => current === 'closing' ? 'opening' : current)
      return
    }
    if (reducedMotion) {
      setVisible({ beatIndex, paragraphIndex, clipVariant })
      setMotion('open')
      return
    }
    setMotion('closing')
    const closeTimer = window.setTimeout(() => {
      setVisible({ beatIndex, paragraphIndex, clipVariant })
      setMotion('opening')
    }, CLOSE_MS)
    return () => window.clearTimeout(closeTimer)
  }, [beatIndex, paragraphIndex, clipVariant, reducedMotion, visible.beatIndex, visible.paragraphIndex, visible.clipVariant])

  useEffect(() => {
    if (motion !== 'opening') return
    if (reducedMotion) {
      setMotion('open')
      return
    }
    const openTimer = window.setTimeout(() => setMotion('open'), OPEN_MS)
    return () => window.clearTimeout(openTimer)
  }, [motion, reducedMotion, visible])

  const viewBeat = visible.beatIndex
  const viewPara = visible.paragraphIndex
  const beat = BEATS[viewBeat] ?? BEATS[0]
  const solo = visible.clipVariant === 'solo'
  const lines = narrationForBeat(viewBeat, language, solo)
  const line = lines[Math.min(viewPara, Math.max(0, lines.length - 1))] ?? lines[0] ?? ''
  const title = t(beat.title, language)
  const paragraphNumber = String(viewPara + 1).padStart(2, '0')
  const paragraphCount = String(lines.length).padStart(2, '0')

  const extras = extrasFor(viewBeat, viewPara, language)
  const stageClass = [
    'codex-stage',
    'industry-stage',
    `is-${motion}`,
    reducedMotion ? 'is-static' : '',
    status === 'playing' ? 'is-playing' : '',
    status === 'paused' ? 'is-paused' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="journey-codex industry-codex" data-beat={beat.id} data-paragraph={viewPara}>
      <div className="codex-vignette" aria-hidden="true" />
      <div className={stageClass}>
        <article className="industry-paper has-plate" aria-live="polite">
          <div key={`${viewBeat}-${viewPara}-${visible.clipVariant}`} className="industry-paper-sheet" role="region" aria-label={title} tabIndex={0}>
            <div className="industry-titleblock">
              <small>{t(UI.brandKicker, language)}  ·  {t(beat.kicker, language)}</small>
              <div className="industry-file-index">
                {language === 'zh' && <span className="industry-en-title" lang="en">{beat.title.en}</span>}
                <span className="industry-folio" aria-label={phrase(language, `第 ${viewPara + 1} 小段，共 ${lines.length} 小段`, `Paragraph ${viewPara + 1} of ${lines.length}`, `第 ${viewPara + 1} 段落、全 ${lines.length} 段落`)}>
                  {paragraphNumber} / {paragraphCount}
                </span>
              </div>
            </div>
            <div className="industry-split">
              <div className="industry-copy">
                <div className="industry-reading">
                  <h1 className="codex-title">{title}</h1>
                  <p className="industry-spoken">{line}</p>
                  {viewBeat === 7 && viewPara === 0 && (
                    <div className="industry-summary">
                      <strong>{phrase(language, '本章要点', 'Chapter takeaway', "この章の要点")}</strong>
                      <p>{t(beat.body, language)}</p>
                    </div>
                  )}
                </div>
                {extras && <div className="industry-annotations">{extras}</div>}
                <p className="industry-caution industry-map-note">{t(UI.coordinateCaution, language)}</p>
              </div>
              {plateFor(viewBeat, viewPara, language)}
            </div>
          </div>
        </article>
      </div>
      <div className="codex-footer">
        <JourneyPlayer placement="codex" />
      </div>
    </div>
  )
}
