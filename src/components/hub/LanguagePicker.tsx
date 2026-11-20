import { useRef } from 'react'
import { localeTag, locales, type HubCopy, type HubLocale } from './i18n/locales'

function LanguageFlag({ id }: { id: HubLocale }) {
  return <img className="atlas-locale-flag" width={32} height={24} alt="" draggable={false}
    src={`${import.meta.env.BASE_URL}flags/${locales[id].flag}.svg`} />
}
const quickLanguages: readonly HubLocale[] = ['zh', 'en', 'ja']
const moreLanguages = (Object.keys(locales) as HubLocale[]).filter(id => !quickLanguages.includes(id))

export function LanguagePicker({ locale, copy, select }: { locale: HubLocale; copy: HubCopy; select: (id: HubLocale) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const fromMore = moreLanguages.includes(locale)
  return <div className="atlas-picker">
    <div className="atlas-language-bar" role="group" aria-label={copy.language}>
      {quickLanguages.map(id => <button key={id} className="atlas-language-shortcut" type="button"
        data-locale={id} lang={localeTag(id)} aria-label={locales[id].name} title={locales[id].name}
        aria-pressed={locale === id} onClick={() => select(id)}>
        <LanguageFlag id={id} /><bdi>{locales[id].name}</bdi>
      </button>)}
      <button className="atlas-picker-trigger" type="button" data-current={fromMore || undefined}
        aria-label={fromMore ? copy.moreLanguages + ' · ' + locales[locale].name : copy.moreLanguages}
        title={copy.moreLanguages} aria-haspopup="dialog" aria-controls="hub-languages" onClick={() => {
          const panel = dialog.current
          if (!panel) return
          panel.showModal()
          const target = panel.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
            ?? panel.querySelector<HTMLButtonElement>('[data-locale]')
          target?.focus()
        }}>
        {fromMore && <LanguageFlag id={locale} />}
        <bdi>{fromMore ? locales[locale].name : copy.moreLanguages}</bdi><span aria-hidden="true">▾</span>
      </button>
    </div>
    <dialog ref={dialog} id="hub-languages" aria-labelledby="hub-languages-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close() }}>
      <div className="atlas-picker-inner">
        <header><div><small dir="ltr">+{String(moreLanguages.length).padStart(2, '0')}</small><h2 id="hub-languages-title">{copy.moreLanguages}</h2></div>
          <button className="atlas-picker-close" type="button" aria-label={copy.close} onClick={() => dialog.current?.close()}>×</button></header>
        <div className="atlas-picker-grid">{moreLanguages.map(id => <button key={id} type="button" data-locale={id} lang={localeTag(id)} aria-pressed={locale === id} onClick={() => {
          select(id); dialog.current?.close()
        }}>
          <LanguageFlag id={id} /><bdi>{locales[id].name}</bdi><span aria-hidden="true">{locale === id ? '✓' : ''}</span>
        </button>)}</div>
      </div>
    </dialog>
  </div>
}
