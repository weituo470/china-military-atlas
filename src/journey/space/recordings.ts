import manifest from './audio/manifest.json'
import type { NarrationManifest } from '../../store/narration'

const urls = import.meta.glob<string>('./audio/*.mp3', { eager: true, import: 'default', query: '?url' })
const base = import.meta.env.BASE_URL || '/'

// URLs are fingerprinted by Vite. The shared player resolves them relative to BASE_URL.
const data: NarrationManifest = {
  ...manifest,
  beats: manifest.beats.map(clip => {
    const url = urls[`./audio/${clip.id}.mp3`]
    return { ...clip, src: url?.startsWith(base) ? url.slice(base.length) : url }
  }),
}

export const SPACE_MANIFEST_URL = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`

