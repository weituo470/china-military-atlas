import { ARCHIVE_AUDIO } from '../../publicEdition'
import { useEffect } from 'react'
import { initNarration, useNarration } from '../../store/narration'
import { useJourney } from '../../store/journey'
import { t } from '../types'
import { UI } from './content'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  const rest = whole % 60
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

function RecordedPlayer({ placement }: { placement: 'caption' | 'progress' | 'codex' | 'ghost' }) {
  const language = useJourney((store) => store.language)
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
    void initNarration()
  }, [])

  const zh = language === 'zh'
  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0
  const showCaptionCta = placement === 'caption' && (status === 'idle' || status === 'ended' || language === 'en')
  if (placement === 'caption' && !showCaptionCta) return null

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
    ? '暂停'
    : status === 'paused'
      ? '继续播放'
      : status === 'ended'
        ? '从头播放'
        : '播放解说'

  if (placement === 'ghost') {
    return (
      <div className="journey-ghost">
        <button type="button" onClick={onPrimary} aria-label={primaryLabel} disabled={!zh}>
          {status === 'playing' ? '暂停' : status === 'paused' ? '继续' : sealLabel}
        </button>
      </div>
    )
  }

  if (placement === 'codex') {
    return (
      <div className="journey-player journey-player-codex">
        <button
          type="button"
          className={`codex-seal${status === 'playing' ? ' is-playing' : ''}`}
          onClick={onPrimary}
          disabled={!zh}
          aria-label={primaryLabel}
        >
          <span className="codex-seal-cord" aria-hidden="true" />
          <span className="codex-seal-clay"><em>{sealLabel}</em></span>
        </button>
        <div>
          {zh && <p className="codex-play-hint">{t(UI.playHint, language)}</p>}
          {language === 'en' && <p className="codex-play-hint">{t(UI.voiceChineseOnly, language)}</p>}
          {voiceNote === 'error' && <p className="codex-play-error">{t(UI.narrationError, language)}</p>}
        </div>
      </div>
    )
  }

  if (placement === 'caption') {
    return (
      <div className="journey-player journey-player-cta">
        {zh && (
          <button type="button" className="journey-play-cta" onClick={onPrimary}>
            {primaryLabel}
          </button>
        )}
        {zh && <p className="journey-play-hint">{t(UI.playHint, language)}</p>}
        {language === 'en' && <p className="journey-play-hint">{t(UI.voiceChineseOnly, language)}</p>}
        {voiceNote === 'error' && <p className="journey-play-error">{t(UI.narrationError, language)}</p>}
      </div>
    )
  }

  if (!zh) return <p className="journey-play-hint">{t(UI.voiceChineseOnly, language)}</p>

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
        <button
          type="button"
          className="journey-text-button"
          onClick={() => replay()}
        >
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
        aria-label={language === 'zh' ? '本段解说进度' : 'Current beat narration'}
      >
        <i style={{ width: `${progress * 100}%` }} />
      </div>
      {voiceNote === 'error' && <p className="journey-play-error">{t(UI.narrationError, language)}</p>}
    </div>
  )
}

export function JourneyPlayer({ placement }: { placement: 'caption' | 'progress' | 'codex' | 'ghost' }) {
  const language: string = useJourney(s=>s.language)
  if (ARCHIVE_AUDIO) return <RecordedPlayer placement={placement} />
  if (placement === 'ghost' || placement === 'codex') return null
  return <small className="open-reading-note">{language === 'zh' ? '阅读版 · 可逐段浏览' : language === 'ja' ? '閲覧版 · 段落ごとに表示' : 'Reading edition · browse by paragraph'}</small>
}
