import { ARCHIVE_AUDIO } from '../../publicEdition'
import { useJourney } from '../../store/journey'
import { useNarration } from '../../store/narration'
import { selectBaselineLocale, t, tri } from './locale'
import { UI } from './locale-copy'

function formatTime(seconds: number) {
  const whole = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(whole / 60)}:${(whole % 60).toString().padStart(2, '0')}`
}

function RecordedPlayer() {
  const language = useJourney(selectBaselineLocale)
  const status = useNarration((store) => store.status)
  const currentTime = useNarration((store) => store.currentTime)
  const duration = useNarration((store) => store.duration)
  const voiceNote = useNarration((store) => store.voiceNote)
  const hasStarted = useNarration((store) => store.hasStarted)
  const play = useNarration((store) => store.play)
  const pause = useNarration((store) => store.pause)
  const resume = useNarration((store) => store.resume)
  const replay = useNarration((store) => store.replay)

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0
  const primaryLabel = t(status === 'playing' ? UI.pauseNarration
    : status === 'paused' ? UI.resumeNarration
    : status === 'ended' ? UI.replayNarration : UI.playNarration, language)

  return (
    <div className="journey-player journey-player-bar">
      <div className="journey-player-actions">
        <button
          type="button"
          className={`journey-play-button${status === 'playing' ? ' is-playing' : ''}${status === 'idle' && !hasStarted ? ' is-cta' : ''}`}
          onClick={status === 'playing' ? pause : status === 'paused' ? resume : play}
        >
          {primaryLabel}
        </button>
        <button type="button" className="journey-text-button" onClick={replay}>
          {t(UI.replayNarration, language)}
        </button>
        <span className="journey-player-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
      <div className="journey-player-track" role="progressbar" aria-valuemin={0}
        aria-valuemax={Math.round(duration * 10) / 10}
        aria-valuenow={Math.round(Math.max(0, Math.min(currentTime, duration)) * 10) / 10}
        aria-label={tri(language, '本段解说进度', 'Current beat narration', 'この章の解説の進み具合')}>
        <i style={{ width: `${progress * 100}%` }} />
      </div>
      {voiceNote === 'error' && <p className="journey-play-error" role="status">{t(UI.narrationError, language)}</p>}
    </div>
  )
}

export function JourneyPlayer() {
  const language: string = useJourney(selectBaselineLocale)
  if (ARCHIVE_AUDIO) return <RecordedPlayer  />
  return <small className="open-reading-note">{language === 'zh' ? '阅读版 · 可逐段浏览' : language === 'ja' ? '閲覧版 · 段落ごとに表示' : 'Reading edition · browse by paragraph'}</small>
}
