import { ARCHIVE_AUDIO } from '../../publicEdition'
import { useNarration } from '../../store/narration'
import { useJourney } from '../../store/journey'
import { COPY, tr } from './locales'
import { koreaAudioDuration, restartKoreaAudio, toggleKoreaAudio, useKoreaAudio, useKoreaLanguage, useKoreaStatus } from './playback'

function formatTime(seconds: number) {
  const whole = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

function RecordedPlayer() {
  const language = useKoreaLanguage()
  const status = useKoreaStatus()
  const beatIndex = useJourney(value => value.beatIndex)
  const chineseTime = useNarration(value => value.currentTime)
  const chineseDuration = useNarration(value => value.duration)
  const chineseError = useNarration(value => value.voiceNote === 'error')
  const foreignTime = useKoreaAudio(value => value.time)
  const foreignError = useKoreaAudio(value => value.error)
  const time = language === 'zh' ? chineseTime : foreignTime
  const duration = language === 'zh' ? chineseDuration : koreaAudioDuration(language, beatIndex)
  const error = language === 'zh' ? chineseError : foreignError
  const progress = duration > 0 ? Math.min(1, Math.max(0, time / duration)) : 0
  const primary = status === 'playing' ? COPY.pauseNarration
    : status === 'paused' ? COPY.resumeNarration
    : status === 'ended' ? COPY.replayNarration
    : COPY.playNarration

  return (
    <div className="journey-player journey-player-bar">
      <div className="journey-player-actions">
        <button type="button"
          className={`journey-play-button${status === 'playing' ? ' is-playing' : status === 'idle' ? ' is-cta' : ''}`}
          onClick={toggleKoreaAudio}
          title={tr(COPY.audioEdition, language)} aria-description={tr(COPY.audioEdition, language)}
          aria-label={tr(primary, language)}>
          <span aria-hidden="true" className="korea-play-reserve">{tr(COPY.playNarration, language)}</span>
          <span>{tr(primary, language)}</span>
        </button>
        <button type="button" className="journey-text-button" onClick={restartKoreaAudio}>
          {tr(COPY.replayNarration, language)}
        </button>
        <span className="journey-player-time">{formatTime(time)} / {formatTime(duration)}</span>
      </div>
      <div className="journey-player-track" role="progressbar" aria-valuemin={0}
        aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}
        aria-label={tr(COPY.narrationProgress, language)}>
        <i style={{ width: `${progress * 100}%` }} />
      </div>
      {error && <p className="journey-play-error" role="status">{tr(COPY.narrationError, language)}</p>}
    </div>
  )
}

export function KoreaJourneyPlayer() {
  const language: string = useKoreaLanguage()
  if (ARCHIVE_AUDIO) return <RecordedPlayer  />
  return <small className="open-reading-note">{language === 'zh' ? '阅读版 · 可逐段浏览' : language === 'ja' ? '閲覧版 · 段落ごとに表示' : 'Reading edition · browse by paragraph'}</small>
}
