import { useEffect, useRef, useState, type RefObject } from 'react'
import { LANG_TAG, phrase, type IndustryLanguage } from '../locale'
import './screening.css'

// Let Vite fingerprint the local masters and honour the deployment's base path.
// Only URLs enter the JS bundle; no movie is requested until the viewer opens.
const filmUrls = import.meta.glob<string>(
  ['./films/industry-zh.mp4', './films/industry-en.mp4', './films/industry-ja.mp4'],
  { eager: true, import: 'default', query: '?url' },
)
const posterUrls = import.meta.glob<string>('./films/poster.jpg', { eager: true, import: 'default', query: '?url' })
const subtitles = import.meta.glob<string>('./edit/*.srt', { eager: true, import: 'default', query: '?raw' })

export function screeningLabel(lang: IndustryLanguage) {
  return phrase(lang, '高光短片', 'Highlight film', 'ハイライト映像')
}

type Props = {
  language: IndustryLanguage
  triggerRef: RefObject<HTMLButtonElement | null>
  onDismiss: () => void
}

export function Screening({ language, triggerRef, onDismiss }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const playerRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const src = filmUrls[`./films/industry-${language}.mp4`]
  const srt = subtitles[`./edit/${language}.srt`]
  // Native controls consume WebVTT; the editor can download the original SRT.
  const captions = srt && 'data:text/vtt;charset=utf-8,' + encodeURIComponent('WEBVTT\n\n' +
    srt.replace(/^\uFEFF/, '').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2'))
  const title = phrase(language, '水线之下', 'Below the Waterline', '水面の下で')

  useEffect(() => {
    const dialog = dialogRef.current
    const player = playerRef.current
    const trigger = triggerRef.current
    dialog?.showModal()
    player?.focus({ preventScroll: true })
    // Some browsers reject autoplay; native controls remain available in that case.
    if (player) void player.play().catch(() => {})
    return () => {
      player?.pause()
      dialog?.close()
      if (trigger?.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [triggerRef])

  return (
    <dialog ref={dialogRef} className="industry-screening" lang={LANG_TAG[language]}
      aria-labelledby="industry-screening-title"
      onCancel={event => { event.preventDefault(); onDismiss() }}
      onClick={event => { if (event.target === event.currentTarget) onDismiss() }}>
      <div className="industry-screening-sheet">
        <header>
          <div>
            <small>{screeningLabel(language)} <span aria-hidden="true">/</span> 16:9</small>
            <h2 id="industry-screening-title">{title}</h2>
          </div>
          <button type="button" className="industry-screening-close" onClick={onDismiss}>
            {phrase(language, '关闭', 'Close', '閉じる')} <span aria-hidden="true">×</span>
          </button>
        </header>
        {src && !failed ? (
          <video ref={playerRef} controls playsInline tabIndex={0} preload="metadata" src={src}
            poster={posterUrls['./films/poster.jpg']} aria-label={`${title} · ${screeningLabel(language)}`}
            onError={event => { if (event.target === event.currentTarget) setFailed(true) }}>
            {captions && <track kind="captions" src={captions} srcLang={LANG_TAG[language]}
              label={phrase(language, '中文', 'English', '日本語')} />}
          </video>
        ) : (
          <p role="status" className="industry-screening-notice">
            {phrase(language, '此版本暂时无法播放。', 'This edition cannot be played right now.', 'この版は現在再生できません。')}
          </p>
        )}
        <footer>
          <span>{phrase(language, '中文解说', 'English narration', '日本語ナレーション')}</span>
          <div className="industry-screening-files">
            {srt && <a href={'data:application/x-subrip;charset=utf-8,' + encodeURIComponent(srt)}
              download={`industry-${language}.srt`}>{phrase(language, '字幕 SRT', 'Captions SRT', '字幕 SRT')}</a>}
            {src && <a href={src} download={`industry-${language}.mp4`}>
              {phrase(language, '下载 MP4', 'Download MP4', 'MP4 を保存')} <span aria-hidden="true">↓</span>
            </a>}
          </div>
        </footer>
      </div>
    </dialog>
  )
}
