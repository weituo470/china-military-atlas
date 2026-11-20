import { ARCHIVE_ART } from '../../publicEdition'
import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { selectBaselineLocale, t, tri, type BaselineLocale } from './locale'
import { UI, beatName, beatTitle, beatLines } from './locale-copy'
import { ComparisonChart } from './ComparisonChart'
import { FilmInsert } from './film/FilmInsert'
import { useAtlas } from './atlas/visit'
import { BEATS } from './content'
import { CODEX_BEATS, preloadCodexArt, type CodexBeatSpec, type CodexPlate, type CodexVoice } from './codex'
import { focusForParagraph } from './sites'
import '../../styles/baseline2026.css'
import './presentation.css'

const CLOSE_MS = 420
const OPEN_MS = 720

function asideFor(beatId: string, language: BaselineLocale) {
  if (beatId === 'structure') return t(UI.theaterHint, language)
  if (beatId === 'equipment') return t(UI.platformHint, language)
  if (beatId === 'seas') return t(UI.westPacHint, language)
  if (beatId === 'close') return t(UI.closeHint, language)
  return ''
}

function PlateView({ plate, language }: { plate: CodexPlate; language: BaselineLocale }) {
  return (
    <figure className="baseline-illustration">
      <img src={plate.src} width={1152} height={864} alt={t(plate.alt, language)} />
      <figcaption>
        {t(plate.caption, language)}
      </figcaption>
    </figure>
  )
}

function StructureKey({ language, mixed }: { language: BaselineLocale; mixed: boolean }) {
  const copy = (zh: string, en: string, ja: string) => tri(language, zh, en, ja)
  if (mixed) {
    return (
      <aside className="baseline-source-packets" aria-label={copy('按来源分列', 'Figures by source', '出典別の数字')}>
        <section className="baseline-source-slip is-official" aria-label={t(UI.officialLabel, language)}>
          <h2>{copy('官方预算 · 2026', 'Official budget · 2026', '公式予算 · 2026年')}</h2>
          <p>{copy('全国 1.94 万亿元；其中中央本级 1.91 万亿元。', 'CNY 1.94 trillion nationwide, including 1.91 trillion at central level.', '全国で1兆9,400億元、うち中央本級は1兆9,100億元。')}</p>
          <a href="https://www.mod.gov.cn/gfbw/qwfb/16447679.html" target="_blank" rel="noreferrer">{copy('国防部公开发布', 'Ministry of National Defense', '中国国防部の発表')}</a>
        </section>
        <section className="baseline-source-slip is-estimate" aria-label={t(UI.estimateLabel, language)}>
          <h2>{copy('外部估计 · 2025', 'External estimates · 2025', '外部推計 · 2025年')}</h2>
          <p>{copy('IISS（公开转述）：现役约 203.5 万人。', 'IISS (reported second-hand): approx. 2.035 million active personnel.', 'IISS（公開記事による紹介）：現役約203万5千人。')}</p>
          <p>{copy('SIPRI：支出约 3360 亿美元，口径较预算宽。', 'SIPRI: approx. USD 336 billion in expenditure, on a broader definition than the budget.', 'SIPRI：支出は約3,360億米ドル。公式予算より集計範囲が広い。')}</p>
          <a href="https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025" target="_blank" rel="noreferrer">{copy('SIPRI 数据说明', 'SIPRI fact sheet', 'SIPRIの資料')}</a>
        </section>
      </aside>
    )
  }
  const rows = [
    [copy('领导指挥', 'Command', '指揮'), copy('中央军委', 'Central Military Commission', '中央軍事委員会')],
    [copy('军种', 'Services', '軍種'), copy('陆军、海军、空军、火箭军', 'Army, Navy, Air Force, Rocket Force', '陸軍、海軍、空軍、ロケット軍')],
    [copy('兵种', 'Arms', '部隊'), copy('军事航天部队、网络空间部队、信息支援部队、联勤保障部队', 'Aerospace Force, Cyberspace Force, Information Support Force, Joint Logistic Support Force', '軍事宇宙部隊、サイバー空間部隊、情報支援部隊、統合後方支援部隊')],
  ]
  return <aside className="structure-key">
    <dl>{rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
    <a href="https://www.mod.gov.cn/gfbw/xwfyr/ztjzh/16302059.html" target="_blank" rel="noreferrer">{copy('国防部专题记者会 · 2024-04-19', 'Ministry of National Defense briefing · 19 Apr 2024', '中国国防部の記者会見 · 2024年4月19日')}</a>
  </aside>
}

function ReviewColorKey({ language, mixed, film }: { language: BaselineLocale; mixed: boolean; film: boolean }) {
  const live=useAtlas(s=>s.ready?s.mode:null)
  const copy = (zh: string, en: string, ja: string) => tri(language, zh, en, ja)
  return (
    <aside className="baseline-review-notes" aria-label={copy('阅舰式图例与注释', 'Fleet review key and notes', '観艦式の凡例と注記')}>
      {(!live||live==='notes')&&<FilmInsert language={language} inline={film && !live} />}
      <ul className="baseline-review-evidence">
        <li className="baseline-source-slip is-official">
          <strong>{t(UI.officialLabel, language)}</strong>
          {mixed && <><span>{copy('美国 293 艘', 'U.S. · 293 ships', '米国 · 293隻')}</span><span>{copy('2025 年 10 月 1 日', '1 Oct 2025', '2025年10月1日')}</span></>}
        </li>
        <li className="baseline-source-slip is-estimate">
          <strong>{t(UI.estimateLabel, language)}</strong>
          {mixed && <><span>{copy('中国 370+（下限）', 'China · 370+ (lower bound)', '中国 · 370隻超')}</span><span>{copy('美国国防部 2024 年报告', 'U.S. DoD report, 2024', '米国防総省2024年報告')}</span></>}
        </li>
      </ul>
      <p>{copy('舰影为示意，不是部署图。航母 1∶1 计数；规模标每个约十艘。', 'Schematic, not a deployment map. Carriers are counted 1:1; each scale mark represents about 10 ships.', '配置は模式図で、実際の配備ではありません。空母は1隻につき1艦影、規模の印は1個で約10隻です。')}</p>
      <p>{copy('舰艇总数口径不同，不作直接比较。', 'Fleet totals use different definitions and are not directly comparable.', '艦艇総数は集計範囲が異なるため、直接比較できません。')}</p>
    </aside>
  )
}

function BaselinePaper({
  voice,
  beat,
  language,
  line,
  showTitle,
  plate,
  showChart,
  showReviewKey,
}: {
  voice: CodexVoice
  beat: (typeof BEATS)[number]
  language: BaselineLocale
  line: string
  showTitle: boolean
  plate?: CodexPlate
  showChart?: boolean
  showReviewKey?: boolean
}) {
  const aside = showTitle ? asideFor(beat.id, language) : ''
  const tag = voice === 'mixed'
    ? showReviewKey
      ? { zh: '舰艇数字 · 两种口径', en: 'Fleet totals · Two definitions', ja: '艦艇数 · 二つの集計範囲' }
      : { zh: '人数、预算与支出 · 三种口径', en: 'Personnel, budget and expenditure · Three definitions', ja: '人員・予算・支出 · 三つの指標' }
    : voice === 'estimate' ? UI.estimateLabel
    : beat.id === 'structure' || beat.id === 'seas' || beat.id === 'doctrine' ? UI.officialLabel
    : UI.dossierLabel
  return (
    <div className="baseline-paper-cast">
      <article className={`baseline-paper is-${voice}`}>
        <div key={line} className="baseline-paper-sheet" role="region" aria-label={beatName(beat, language)} tabIndex={0}>
          <div className="baseline-reading-spread">
            <div className="baseline-copy">
              <span className="codex-material-tag">{t(tag, language)}</span>
              {showTitle && <h1 className="codex-title">{beatTitle(beat, language)}</h1>}
              <p className="codex-spoken">{line}</p>
              {aside && <p className="baseline-copy-note">{aside}</p>}
            </div>
            {beat.id === 'structure' ? <StructureKey language={language} mixed={voice === 'mixed'} /> : showChart ? <ComparisonChart language={language} /> : plate ? <PlateView plate={plate} language={language} /> : showReviewKey ? <ReviewColorKey language={language} mixed={voice === 'mixed'} film={showTitle} /> : null}
          </div>
        </div>
      </article>
    </div>
  )
}

export function JourneyCodex() {
  const beatIndex = useJourney((store) => store.beatIndex)
  const language = useJourney(selectBaselineLocale)
  const setFocus = useJourney((store) => store.setFocus)
  const status = useNarration((store) => store.status)
  const paragraphIndex = useNarration((store) => store.paragraphIndex)
  const reducedMotion = useReducedMotion()

  const [visible, setVisible] = useState({ beatIndex, paragraphIndex })
  const [motion, setMotion] = useState<'open' | 'closing' | 'opening'>('opening')

  useEffect(() => {
    preloadCodexArt()
  }, [])

  useEffect(() => {
    setFocus(focusForParagraph(beatIndex, paragraphIndex))
  }, [beatIndex, paragraphIndex, setFocus])

  useEffect(() => {
    if (visible.beatIndex === beatIndex && visible.paragraphIndex === paragraphIndex) {
      setMotion((previous) => reducedMotion ? 'open' : previous === 'closing' ? 'opening' : previous)
      return
    }
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

  const spec: CodexBeatSpec = CODEX_BEATS[visible.beatIndex] ?? CODEX_BEATS[0]
  const beat = BEATS[visible.beatIndex] ?? BEATS[0]
  const lines = beatLines(beat, language)
  const line = lines[Math.min(visible.paragraphIndex, Math.max(0, lines.length - 1))] ?? lines[0] ?? ''
  const voice = spec.emphasize[Math.min(visible.paragraphIndex, spec.emphasize.length - 1)] ?? 'dossier'
  const showTitle = visible.paragraphIndex === 0

  const stageClass = [
    'codex-stage',
    'baseline-stage',
    `is-${motion}`,
    `is-${voice}`,
    reducedMotion ? 'is-static' : '',
    status === 'playing' ? 'is-playing' : '',
    status === 'paused' ? 'is-paused' : '',
    showTitle ? '' : 'is-compact',
  ].filter(Boolean).join(' ')

  return (
    <div
      className="journey-codex baseline-codex"
      aria-live="polite"
      data-beat={spec.id}
      data-paragraph={visible.paragraphIndex}
      data-material={voice}
    >
      <div className="codex-vignette" aria-hidden="true" />
      <div className={stageClass}>
        <BaselinePaper
          voice={voice}
          beat={beat}
          language={language}
          line={line}
          showTitle={showTitle}
          plate={ARCHIVE_ART ? spec.plate : undefined}
          showChart={spec.id === 'scale'}
          showReviewKey={spec.id === 'review'}
        />
      </div>
    </div>
  )
}

