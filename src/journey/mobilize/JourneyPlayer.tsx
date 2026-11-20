import { ARCHIVE_AUDIO } from '../../publicEdition'
import { UI } from './content'
import { ml, tri, useMobilizeLanguage } from './locale'
import { replayMobilize, toggleMobilizePlayback, useMobilizeMediaValue } from './playback'

function formatTime(seconds: number) {
  const whole = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(whole / 60)}:${(whole % 60).toString().padStart(2, '0')}`
}

function RecordedPlayer() {
  const language = useMobilizeLanguage()
  const status = useMobilizeMediaValue('status')
  const currentTime = useMobilizeMediaValue('currentTime')
  const duration = useMobilizeMediaValue('duration')
  const failed = useMobilizeMediaValue('failed')
  const playing = status === 'playing' || status === 'loading'
  const replayLabel = ml(UI.replayNarration, language, '最初から再生')
  const label = status === 'loading' ? tri(language, '正在载入', 'Loading narration', '読み込み中')
    : playing ? ml(UI.pauseNarration, language, '一時停止')
      : status === 'paused' ? ml(UI.resumeNarration, language, '再生を再開')
        : status === 'ended' ? replayLabel : ml(UI.playNarration, language, '音声解説を再生')

  return (
    <div className="journey-player journey-player-bar">
      <div className="journey-player-actions">
        <button type="button" className="journey-play-button" aria-busy={status === 'loading'}
          onClick={toggleMobilizePlayback}>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M4 2.5v11l9-5.5Z" />}
          </svg>
          {label}
        </button>
        <button type="button" className="journey-text-button mobilize-replay"
          disabled={status === 'ended'} onClick={replayMobilize}>
          {replayLabel}
        </button>
        <span className="journey-player-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
      <progress className="mobilize-audio-progress" value={duration > 0 ? Math.min(Math.max(0, currentTime), duration) / duration : 0}
        max={1} aria-label={tri(language, '本段解说进度', 'Narration progress', '音声解説の再生位置')} />
      {failed && <p className="journey-play-error" role="status">{ml(UI.narrationError, language, '音声を読み込めませんでした。画面の解説は引き続き読めます。')}</p>}
    </div>
  )
}

export function MobilizeJourneyPlayer() {
  const language: string = useMobilizeLanguage()
  if (ARCHIVE_AUDIO) return <RecordedPlayer  />
  return <small className="open-reading-note">{language === 'zh' ? '阅读版 · 可逐段浏览' : language === 'ja' ? '閲覧版 · 段落ごとに表示' : 'Reading edition · browse by paragraph'}</small>
}
