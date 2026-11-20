import { useEffect, useRef, useState } from 'react'
import recordings from './intro-recordings.json'
import type { HubCopy, HubLocale } from './i18n/locales'

export function IntroNarration({ locale, copy }: { locale: HubLocale; copy: HubCopy }) {
  const language = Object.hasOwn(recordings, locale) ? locale as keyof typeof recordings : 'en'
  const track = recordings[language]
  const seconds = Math.round(track.duration)
  const player = useRef<HTMLAudioElement>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const audio = player.current
    const stop = () => audio?.pause()
    window.addEventListener('pagehide', stop)
    return () => { stop(); window.removeEventListener('pagehide', stop) }
  }, [])

  return <figure className="atlas-narration">
    <figcaption id="atlas-voice-label">{copy.audioLabel}
      <time dir="ltr" dateTime={`PT${seconds}S`}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</time>
    </figcaption>
    <audio id="atlas-intro-audio" ref={player} controls preload="none" aria-labelledby="atlas-voice-label"
      src={`${import.meta.env.BASE_URL}audio/hub/${language}.mp3?v=${track.audioHash.slice(0, 12)}`}
      onError={() => setFailed(true)} onPlaying={() => setFailed(false)} />
    {failed && <p role="status">{copy.audioError}</p>}
  </figure>
}
