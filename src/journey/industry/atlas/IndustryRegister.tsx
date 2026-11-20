import type { IndustryLanguage } from '../locale'
import { categoryGroups } from './classification'
import { label, type AtlasPlate } from './plate'
import './register.css'

const title = label('41 个工业大类', '41 industrial categories', '工業41大分類')

/** Typeset data, not a baked-in grid. The illustration is not the data source. */
export function IndustryRegister({ language, plate }: { language: IndustryLanguage; plate: AtlasPlate }) {
  return (
    <div className="industry-register-plate">
      <div className="industry-register-spread">
        <img className="industry-register-specimens" src={plate.src} alt={plate.alt[language]} draggable={false} />
        <div className="industry-register-index">
          <strong className="industry-register-title">{title[language]}</strong>
          {categoryGroups.map(({ section, name, range: [first, last] }) => (
            <div key={section} className="industry-register-section">
              <strong className="industry-register-heading"><span>{section}</span>{name[language]}</strong>
              <ol className="industry-register-codes" aria-label={name[language]} start={first}>
                {Array.from({ length: last - first + 1 }, (_, n) => {
                  const code = String(first + n).padStart(2, '0')
                  return <li key={code} data-industry-code={code}>{code}</li>
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
