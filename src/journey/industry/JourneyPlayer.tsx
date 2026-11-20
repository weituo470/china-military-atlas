import { ARCHIVE_AUDIO } from '../../publicEdition'
import { useEffect } from 'react'
import { initNarration, useNarration } from '../../store/narration'
import { useJourney } from '../../store/journey'
import { industryLocale, phrase, t } from './locale'
import { UI } from './content'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  const rest = whole % 60
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

function RecordedPlayer({ placement }: { placement: 'progress' | 'codex' }) {
  const language = useJourney(industryLocale)
  const status = useNarration((store) => store.status)
  const currentTime = useNarration((store) => store.currentTime)
  const duration = useNarration((store) => store.duration)
  const voiceNote = useNarration((store) => store.voiceNote)
  const hasStarted = useNarration((store) => store.hasStarted)
  const play = useNarration((store) => store.play)
  const pause = useNarration((store) => store.pause)
  const resume = useNarration((store) => store.resume)
  const replay = useNarration((store) => store.replay)

  useEffect(() => {
    void initNarration('industry')
  }, [])

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0
  const primaryLabel = status === 'playing'
    ? t(UI.pauseNarration, language)
    : status === 'paused'
      ? t(UI.resumeNarration, language)
      : status === 'ended'
        ? t(UI.replayNarration, language)
        : t(UI.playNarration, language)

  const onPrimary = () => {
    if (status === 'playing') pause()
    else if (status === 'paused') resume()
    else play()
  }

  const sealLabel = status === 'playing'
    ? phrase(language, '暂停', 'Pause', '停止')
    : status === 'paused'
      ? phrase(language, '继续播放', 'Resume', '再開')
      : status === 'ended'
        ? phrase(language, '从头播放', 'Replay', '再聴')
        : phrase(language, '播放解说', 'Play', '再生')

  if (placement === 'codex') {
    return (
      <div className="journey-player journey-player-codex industry-player-codex">
        <button
          type="button"
          className={`industry-seal${status === 'playing' ? ' is-playing' : ''}`}
          onClick={onPrimary}
          aria-label={primaryLabel}
        >
          <em>{sealLabel}</em>
        </button>
        <div>
          <p className="codex-play-hint">{t(UI.playHint, language)}</p>
          {voiceNote === 'error' && <p className="codex-play-error">{t(UI.narrationError, language)}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="journey-player journey-player-bar">
      <div className="journey-player-actions">
        <button
          type="button"
          className={`journey-play-button${status === 'playing' ? ' is-playing' : ''}${status === 'idle' && !hasStarted ? ' is-cta' : ''}`}
          onClick={onPrimary}
          aria-label={primaryLabel}
        >
          {primaryLabel}
        </button>
        <button type="button" className="journey-text-button" onClick={() => replay()}>
          {t(UI.replayNarration, language)}
        </button>
        <span className="journey-player-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
      <div
        className="journey-player-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration * 10) / 10}
        aria-valuenow={Math.round(currentTime * 10) / 10}
        aria-label={phrase(language, '本段解说进度', 'Current beat narration', '解説の再生位置')}
      >
        <i style={{ width: `${progress * 100}%` }} />
      </div>
      {voiceNote === 'error' && <p className="journey-play-error">{t(UI.narrationError, language)}</p>}
    </div>
  )
}

export function JourneyPlayer({ placement }: { placement: 'progress' | 'codex' }) {
  const language: string = useJourney(industryLocale)
  if (ARCHIVE_AUDIO) return <RecordedPlayer placement={placement} />
  if (placement === 'codex') return null
  return <small className="open-reading-note">{language === 'zh' ? '阅读版 · 可逐段浏览' : language === 'ja' ? '閲覧版 · 段落ごとに表示' : 'Reading edition · browse by paragraph'}</small>
}
