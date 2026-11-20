import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import type { JourneyLang } from '../types'
import { BEATS, type SpaceBeatId } from './content'
import { credits } from './MissionPlate'
import './suggestion.css'

const MarkEditor = lazy(() => import('./visual/MarkEditor').then(m => ({ default: m.MarkEditor })))
type ClipBox = { x: number; y: number; width: number; height: number }

type Anchor = 'title' | 'summary' | 'image' | `paragraph:${number}`
type Category = 'correction' | 'addition' | 'other'
type Beat = typeof BEATS[number]
export type MarkedText = { chapter: string; lang: JourneyLang; anchor: Anchor; quote: string }

export function readMarkedText(chapter: SpaceBeatId, lang: JourneyLang): MarkedText | null {
  const s = window.getSelection()
  if (!s || s.isCollapsed || !s.rangeCount) return null
  const node = s.getRangeAt(0).commonAncestorContainer
  const el = (node instanceof Element ? node : node.parentElement)?.closest<HTMLElement>('[data-space-anchor]')
  const quote = s.toString().trim().slice(0, 500)
  if (!el || el.closest<HTMLElement>('[data-chapter]')?.dataset.chapter !== chapter || !quote) return null
  return { chapter, lang, anchor: el.dataset.spaceAnchor as Anchor, quote }
}

const copy = {
  zh: {
    title: '标注建议', chapter: '科研航天', target: '标注位置', titleOpt: '章节标题', summary: '章节简介', image: '配图与图注',
    para: '解说词 · 第 # 段', quote: '标注原文', selected: '选中的原文', type: '建议类型', correction: '纠正或修改', addition: '建议补充内容', other: '其他意见',
    msg: '你的建议', placeholder: '哪句话需要改？或希望这里增加什么？请具体说明。', url: '公开来源链接', optional: '选填',
    hint: '仅作者可见，不会直接改动页面。请只提交可公开核查的资料，不要填写个人信息。',
    send: '提交给作者', sending: '提交中…', close: '关闭', done: '返回导览', success: '建议已送达',
    receipt: '作者会看到这条建议及其对应的原文。页面内容尚未更改。', number: '回执编号',
    validation: '请填写 5 至 1500 个字符的建议，并确认链接以 http:// 或 https:// 开头。', busy: '提交较频繁，请稍后再试。', fail: '未能确认送达。已保留本页草稿，可重新提交。',
  },
  en: {
    title: 'Suggest an edit', chapter: 'Science & spaceflight', target: 'Passage or image', titleOpt: 'Chapter title', summary: 'Chapter summary', image: 'Image and caption',
    para: 'Transcript · paragraph #', quote: 'Original passage', selected: 'Selected text', type: 'Suggestion type', correction: 'Correction or edit', addition: 'Propose an addition', other: 'Other feedback',
    msg: 'Your suggestion', placeholder: 'What would you change or add here? Please be specific.', url: 'Public source link', optional: 'optional',
    hint: 'Only the author sees your suggestion; it does not edit the page. Use public sources and leave out personal information.',
    send: 'Send to the author', sending: 'Sending…', close: 'Close', done: 'Back to the guide', success: 'Suggestion received',
    receipt: 'The author can now read your note alongside the original passage. The published page is unchanged.', number: 'Receipt',
    validation: 'Write 5–1500 characters and, if adding a link, start it with http:// or https://.', busy: 'Too many requests. Please try again later.', fail: 'Delivery could not be confirmed. Your draft is still here; you can retry.',
  },
} as const

function uuid() {
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 15) | 64
  b[8] = (b[8] & 63) | 128
  const h = Array.from(b, n => n.toString(16).padStart(2, '0')).join('')
  return [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20)].join('-')
}
type Draft = { anchor: Anchor; quote: string; category: Category; message: string; sourceUrl: string; requestId: string; image?: string }
const tabDrafts = new Map<string, Draft>()

export function SpaceSuggestion({ beat, index, lang, marked, currentLine, onClose, onPin }: {
  beat: Beat; index: number; lang: JourneyLang; marked: MarkedText | null; currentLine: number; onClose: () => void; onPin: (image: string) => void
}) {
  const c = copy[lang]
  const items: { key: Anchor; label: string; text: string }[] = [
    { key: 'title', label: c.titleOpt, text: beat.title[lang] },
    { key: 'summary', label: c.summary, text: beat.body[lang] },
    ...beat.narration[lang].map((text, i) => ({ key: `paragraph:${i}` as const, label: c.para.replace('#', String(i + 1)), text })),
    { key: 'image', label: c.image, text: credits[beat.id].title[lang] },
  ]
  const storageKey = `space.suggestion.v1.${beat.id}.${lang}`
  const [draft, setDraft] = useState<Draft>(() => {
    const cached = tabDrafts.get(storageKey)
    if (cached) return cached
    try {
      const d = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
      if (d && items.some(x => x.key === d.anchor) && typeof d.message === 'string' && typeof d.sourceUrl === 'string'
        && typeof d.quote === 'string' && /^[a-f0-9-]{36}$/i.test(d.requestId)
        && (!d.image || (typeof d.image === 'string' && d.image.startsWith('data:image/jpeg;base64,') && d.image.length < 1400000))
        && ['correction', 'addition', 'other'].includes(d.category) && (d.message || d.sourceUrl || d.image)) return d
    } catch { /* Private browsing may disable storage. */ }
    const selection = marked?.chapter === beat.id && marked.lang === lang && items.some(x => x.key === marked.anchor && x.text.includes(marked.quote)) ? marked : null
    return { anchor: selection?.anchor ?? `paragraph:${currentLine}`, quote: selection?.quote ?? '', category: 'correction', message: '', sourceUrl: '', requestId: uuid() }
  })
  const active = items.find(x => x.key === draft.anchor) ?? items[0]
  const quote = draft.quote || active.text
  const dialog = useRef<HTMLDialogElement>(null)
  const pending = useRef<AbortController | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState('')
  const zh = lang === 'zh'
  const [token, setToken] = useState('')
  const [pass, setPass] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [expired, setExpired] = useState(false)
  const [shooting, setShooting] = useState(false)
  const [full, setFull] = useState(false)
  const [capture, setCapture] = useState<HTMLCanvasElement | null>(null)
  const [zoom, setZoom] = useState(false)
  const readClip = useRef<((box: ClipBox, translated: boolean) => string) | undefined>(undefined)
  const alive = useRef(false)
  const passInput = useRef<HTMLInputElement>(null)
  const authPending = useRef<AbortController | null>(null)
  const primaryCapture = !expired && !draft.image && !draft.message && !draft.sourceUrl
  const gateLabel = zh ? '标注口令' : 'Annotation passcode'

  useEffect(() => {
    const el = dialog.current!
    alive.current = true
    el.showModal()
    return () => { alive.current = false; if (el.open) el.close(); pending.current?.abort(); authPending.current?.abort() }
  }, [])
  useEffect(() => { if (!token) passInput.current?.focus() }, [token])
  useEffect(() => {
    const keep = !receipt && !!(draft.message || draft.sourceUrl || draft.image)
    if (keep) tabDrafts.set(storageKey, draft)
    else tabDrafts.delete(storageKey)
    try {
      if (keep) sessionStorage.setItem(storageKey, JSON.stringify(draft))
      else sessionStorage.removeItem(storageKey)
    } catch { /* In-memory draft remains usable. */ }
  }, [draft, receipt, storageKey])
  const change = (patch: Partial<Draft>) => {
    setError('')
    setDraft(d => ({ ...d, ...patch, requestId: uuid() }))
  }
  async function startCapture() {
    if (shooting) return
    setShooting(true); setError(''); setZoom(false)
    try {
      const [{ captureSpacePage, getCaptureText }] = await Promise.all([
        import('./visual/capture'), import('./visual/MarkEditor'),
        new Promise<void>(resolve => { requestAnimationFrame(() => requestAnimationFrame(() => resolve())) }),
      ])
      const screen = await captureSpacePage(full)
      if (!alive.current) return
      readClip.current = (box, translate) => getCaptureText(screen, box, translate)
      setCapture(screen)
    } catch {
      if (alive.current) setError(zh ? '未能截取本页。可以重试，也可以只发文字。' : 'The page could not be captured. Try again or send a text note.')
    } finally { if (alive.current) setShooting(false) }
  }
  function finishCapture(image?: string) {
    if (image) change({ image })
    readClip.current = undefined
    setCapture(null)
  }
  async function unlock(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!pass || authPending.current) return
    const button = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const draw = primaryCapture && button?.value !== 'note'
    const controller = new AbortController()
    authPending.current = controller; setUnlocking(true); setError('')
    const timer = setTimeout(() => controller.abort(), 10000)
    try {
      const r = await fetch(new URL('api/space-suggestions/unlock', document.baseURI), { method: 'POST', credentials: 'omit',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode: pass }), signal: controller.signal })
      if (r.status === 401) { setError(zh ? '口令不正确，请重新输入。' : 'Incorrect passcode. Try again.'); passInput.current?.select(); return }
      if (r.status === 429) { setError(c.busy); return }
      if (!r.ok) throw new Error('unlock')
      const d = await r.json()
      if (!d.ok || typeof d.token !== 'string' || !d.token) throw new Error('unlock')
      if (!alive.current) return
      setToken(d.token); setPass(''); setExpired(false)
      if (draw) await startCapture()
    } catch { if (alive.current) setError(zh ? '无法连接标注服务，请稍后重试。' : 'Cannot reach the annotation service. Please retry.') }
    finally { clearTimeout(timer); authPending.current = null; if (alive.current) setUnlocking(false) }
  }
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (pending.current || receipt || !token) return
    const message = draft.message.trim(), sourceUrl = draft.sourceUrl.trim()
    let validLink = true
    try { if (sourceUrl) { const u = new URL(sourceUrl); validLink = ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password } } catch { validLink = false }
    if ((!draft.image && message.length < 5) || message.length > 1500 || !validLink) { setError(c.validation); return }
    const ac = new AbortController()
    pending.current = ac
    setError(''); setSending(true)
    const timeout = window.setTimeout(() => ac.abort(), 15000)
    const [kind, para] = draft.anchor.split(':')
    try {
      const url = new URL('api/space-suggestions', document.baseURI)
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + token },
        credentials: 'omit', signal: ac.signal,
        body: JSON.stringify({ requestId: draft.requestId, chapterId: beat.id, lang, anchor: { kind,
          ...(para !== undefined ? { paragraphIndex: Number(para) } : {}), quote: quote.slice(0, 500) },
          category: draft.category, message, ...(draft.image ? { image: draft.image } : {}), ...(sourceUrl ? { sourceUrl } : {}) }) })
      if (r.status === 401) { setExpired(true); setToken(''); setError(''); return }
      if (r.status === 429) { setError(c.busy); return }
      if (!r.ok) { setError(r.status === 400 || r.status === 422 ? c.validation : c.fail); return }
      const data = await r.json()
      if (data.ok !== true || typeof data.id !== 'string' || !data.id) throw new Error('missing-receipt')
      setReceipt(data.id)
    } catch { setError(c.fail) }
    finally { clearTimeout(timeout); pending.current = null; setSending(false) }
  }
  return <dialog className={`space-source-dialog space-suggest-dialog${shooting ? ' space-capturing' : ''}`} data-space-capture-exclude ref={dialog} aria-labelledby="space-suggest-title"
    onCancel={e => { e.preventDefault(); onClose() }}>
    <div className="space-suggest-inner">
      <header><div><p className="space-suggest-locator">{c.chapter} / {String(index + 1).padStart(2, '0')} · {beat.name[lang]}</p>
        <h2 id="space-suggest-title">{receipt ? c.success : !token ? (zh ? '进入标注工作台' : 'Open the annotation desk') : c.title}</h2></div>
        <button className="space-suggest-close" type="button" aria-label={c.close} onClick={onClose}>×</button></header>
      {receipt ? <div className="space-suggest-receipt" role="status"><p>{c.receipt}</p><p>{c.number} <code>{receipt}</code></p>
        <button className="space-suggest-submit" type="button" onClick={onClose}>{c.done}</button></div>
      : !token ? <form className="space-auth-form" onSubmit={unlock}>
        <p>{expired ? (zh ? '口令验证已过期。图和留言都还在，请重新验证后提交。' : 'Your session expired. Verify again to send your saved draft.')
          : (zh ? '只截取此页的内容。框出需要改的地方，画箭头或写上说明，再发给作者。' : 'Capture this page, mark the part you would change, and send it directly to the author.')}</p>
        <label>{gateLabel}<input ref={passInput} name="passcode" type="password" value={pass} onChange={e => setPass(e.target.value)}
          autoComplete="off" maxLength={128} required aria-invalid={!!error || undefined} /></label>
        {primaryCapture && <label className="space-full-toggle"><input type="checkbox" checked={full} onChange={e => setFull(e.target.checked)} />
          {zh ? '长截图（包含本章屏外内容）' : 'Long capture (include offscreen chapter content)'}</label>}
        {error && <p className="space-suggest-error" role="alert">{error}</p>}
        <div className="space-auth-actions"><button className="space-suggest-submit" type="submit" value="draw" disabled={unlocking}>{unlocking ? (zh ? '验证中…' : 'Verifying…') : primaryCapture ? (zh ? '开始截图标注' : 'Capture and annotate') : (zh ? '继续这条建议' : 'Continue this draft')}</button>
          {primaryCapture && <button className="space-secondary-action" type="submit" value="note" disabled={unlocking}>{zh ? '只写留言' : 'Text note only'}</button>}</div>
      </form> : <form onSubmit={submit}>
        <fieldset disabled={sending}>
          <div className="space-suggest-attachment">
            {draft.image && <button type="button" className={'space-suggest-thumb' + (zoom ? ' is-zoomed' : '')}
              aria-label={zh ? '展开或收起已标注截图' : 'Expand or collapse the marked screenshot'} aria-expanded={zoom} onClick={() => setZoom(!zoom)}>
              <img src={draft.image} alt={zh ? '准备发送给作者的标注截图' : 'Marked screenshot ready to send'} /></button>}
            <div className="space-attachment-tools">
              <button className="space-secondary-action" type="button" data-action="capture-page" disabled={shooting} onClick={startCapture}>
                {shooting ? (zh ? '正在截取…' : 'Capturing…') : draft.image ? (zh ? '重新截图' : 'Retake') : (zh ? '截图并标注' : 'Capture and annotate')}</button>
              {draft.image && <><button className="space-secondary-action" type="button" onClick={() => onPin(draft.image!)}>{zh ? '钉在导览页' : 'Pin to the guide'}</button>
                <button className="space-secondary-action" type="button" onClick={() => { change({ image: undefined }); setZoom(false) }}>{zh ? '移除图片' : 'Remove image'}</button></>}
            </div>
            <label className="space-full-toggle"><input type="checkbox" checked={full} onChange={e => setFull(e.target.checked)} />
              {zh ? '截取本章长图' : 'Capture full chapter height'}</label>
          </div>
          <div className="space-suggest-pair">
            <label>{c.target}<select name="anchor" value={draft.anchor} onChange={e => change({ anchor: e.target.value as Anchor, quote: '' })}>
              {items.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}</select></label>
            <label>{c.type}<select name="category" value={draft.category} onChange={e => change({ category: e.target.value as Category })}>
              {(['correction', 'addition', 'other'] as const).map(x => <option key={x} value={x}>{c[x]}</option>)}</select></label>
          </div>
          <blockquote><small>{draft.quote ? c.selected : c.quote}</small>{quote}</blockquote>
          <label>{c.msg + (draft.image ? (zh ? '（有图可不填）' : ' (optional with image)') : '')}<textarea name="message" rows={3} required={!draft.image} minLength={draft.image ? undefined : 5} maxLength={1500} value={draft.message}
            placeholder={c.placeholder} onChange={e => change({ message: e.target.value })} /></label>
          <label><span>{c.url} <small>({c.optional})</small></span><input name="sourceUrl" type="url" placeholder="https://…" maxLength={2048}
            value={draft.sourceUrl} onChange={e => change({ sourceUrl: e.target.value })} /></label>
        </fieldset>
        <p className="space-suggest-hint">{c.hint}</p>
        {error && <p className="space-suggest-error" role="alert">{error}</p>}
        <button className="space-suggest-submit" type="submit" disabled={sending}>{sending ? c.sending : c.send}</button>
      </form>}
    </div>
    {capture && <Suspense fallback={null}><MarkEditor canvas={capture} lang={lang}
      onInspectText={readClip.current} onReadImage={async image => (await import('./visual/ocr')).readMarkedImage(image)}
      onDone={img => finishCapture(img)} onCancel={() => finishCapture()} /></Suspense>}
  </dialog>
}
