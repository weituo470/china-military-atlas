import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { tri, t, type BaselineLocale } from './locale'
import { japaneseCards } from './locale-copy'
import {
  COMPARISON_AXES,
  COMPARISON_COUNTRIES,
  COMPARISON_MAX,
  formatAircraft,
  formatPersonnel,
  formatSpendingBillions,
  type ComparisonAxisId,
  type ComparisonCountry,
} from './comparison'

function barWidth(axis: ComparisonAxisId, value: number | undefined): string {
  if (value == null || value <= 0) return '0%'
  return `${Math.max(3, (value / COMPARISON_MAX[axis]) * 100)}%`
}

function cellValue(country: ComparisonCountry, axis: ComparisonAxisId, language: BaselineLocale): string {
  if (axis === 'personnel') {
    return country.personnel != null ? formatPersonnel(country.personnel, language === 'ja' ? 'zh' : language) : '—'
  }
  if (axis === 'spending') {
    if (country.spending == null) {
      return tri(language, '表1未列', 'not in Table 1', '表1に記載なし')
    }
    const value = formatSpendingBillions(country.spending, language === 'ja' ? 'zh' : language, Boolean(country.spendingEstimated))
    return language === 'ja' ? value.replace(' 亿美元', ' 億米ドル') : value
  }
  return country.aircraft != null ? formatAircraft(country.aircraft, language === 'ja' ? 'en' : language) + (language === 'ja' ? ' 機' : '') : '—'
}

function axisValue(country: ComparisonCountry, axis: ComparisonAxisId): number | undefined {
  if (axis === 'personnel') return country.personnel
  if (axis === 'spending') return country.spending
  return country.aircraft
}

function axisSpoken(paragraphIndex: number, axis: ComparisonAxisId): boolean {
  if (paragraphIndex <= 0) return true
  if (paragraphIndex === 1) return axis === 'personnel'
  return axis === 'spending' || axis === 'aircraft'
}

export function ComparisonChart({ language }: { language: BaselineLocale }) {
  const openCard = useJourney((store) => store.openCard)
  const selectedCardKind = useJourney((store) => store.selectedCardKind)
  const selectedCardId = useJourney((store) => store.selectedCardId)
  const paragraphIndex = useNarration((store) => store.paragraphIndex)
  const copy = (zh: string, en: string, ja: string) => tri(language, zh, en, ja)
  const japaneseAxes = { personnel: '現役', spending: '軍事支出', aircraft: '作戦機' } as const

  return (
    <div className="baseline-compare-chart" role="group" aria-label={copy('主要力量量级对照，示意', 'Schematic magnitude comparison', '主要国の規模比較（模式図）')}>
      <header>
        <p className="baseline-compare-kicker">{copy('对照表  ·  示意  ·  不是记分牌', 'Comparison  ·  schematic  ·  not a scoreboard', '比較表（模式図） · 順位表ではありません')}</p>
      </header>
      <div className="baseline-compare-table" role="table">
        <div className="baseline-compare-head" role="row">
          <span role="columnheader">{copy('国家', 'Country', '国')}</span>
          {COMPARISON_AXES.map((axis) => (
            <span key={axis.id} role="columnheader" className={axisSpoken(paragraphIndex, axis.id) ? 'is-spoken' : 'is-muted'}>{language === 'ja' ? japaneseAxes[axis.id] : t(axis.short, language)}</span>
          ))}
        </div>
        {COMPARISON_COUNTRIES.map((country) => {
          const active = selectedCardKind === 'estimate' && selectedCardId === country.id
          const focus = country.site
            ? { lat: country.site.lat, lon: country.site.lon, distance: 3.85 }
            : undefined
          return (
            <button
              key={country.id}
              type="button"
              className={`baseline-compare-row${active ? ' is-active' : ''}${country.onGlobe ? '' : ' is-chart-only'}`}
              role="row"
              onClick={() => openCard('estimate', country.id, focus)}
            >
              <strong role="cell">{language === 'ja' ? japaneseCards[country.id][1] : t(country.name, language)}</strong>
              {COMPARISON_AXES.map((axis) => {
                const value = axisValue(country, axis.id)
                const spoken = axisSpoken(paragraphIndex, axis.id)
                const fullValue = cellValue(country, axis.id, language)
                const displayValue = value == null ? '—' : fullValue.replace(/^\$| billion$| 亿美元$| 億米ドル$| 架$| 機$/g, '')
                return (
                  <span key={axis.id} role="cell" className={`is-${axis.id}${spoken ? ' is-spoken' : ' is-muted'}`} aria-label={fullValue}>
                    {value != null && <b aria-hidden="true" style={{ width: barWidth(axis.id, value) }} />}
                    <small aria-hidden="true">{displayValue}</small>
                  </span>
                )
              })}
            </button>
          )
        })}
      </div>
      <footer>
        <p className="baseline-compare-keep">
          {copy('德国、英国仅列表；朝鲜军费未列。', 'Germany and the UK are chart-only; DPRK spending is not listed.', 'ドイツと英国は表のみ。北朝鮮の軍事支出は掲載なし。')}
        </p>
        <p>
          {copy('斜线为外部估计。现役：IISS；2025 军费（亿美元）：SIPRI；作战飞机（架）：FlightGlobal。',
            'Hatching: external estimates. Active personnel: IISS; 2025 spending (USD bn): SIPRI; combat aircraft: FlightGlobal.',
            '斜線は外部推計。現役：IISS、2025年の軍事支出（億米ドル）：SIPRI、作戦機（機）：FlightGlobal。')}
        </p>
      </footer>
    </div>
  )
}
