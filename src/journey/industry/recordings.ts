import type { NarrationManifest } from '../../store/narration'

const files = import.meta.glob<string>('./audio/*/*.{mp3,json}', { eager: true, query: '?url', import: 'default' })

export async function loadIndustryNarration(language: 'en' | 'ja'): Promise<NarrationManifest> {
  const base = `./audio/${language}/`
  const manifestUrl = files[base + 'manifest.json']
  if (!manifestUrl) throw new Error('Industry narration manifest is missing')
  const result = await fetch(manifestUrl)
  if (!result.ok) throw new Error(`Industry narration manifest: ${result.status}`)
  const data: NarrationManifest = await result.json()
  const asset = (name: string) => {
    const url = files[base + name]
    if (!url) throw new Error('Industry narration track is missing')
    return new URL(url, window.location.href).href
  }
  return {
    ...data,
    beats: data.beats.map((beat) => ({
      ...beat,
      src: asset(beat.src),
      ...(beat.solo && { solo: { ...beat.solo, src: asset(beat.solo.src) } }),
    })),
  }
}
