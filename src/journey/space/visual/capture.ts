import { addAfterEffect, invalidate } from '@react-three/fiber'
import { BEATS, type SpaceBeatId } from '../content'
import { BEAT_STAGING } from '../sites'
import { credits } from '../MissionPlate'

type Box = { x: number; y: number; width: number; height: number }
type Glyph = { x: number; y: number; char: string }
type Run = { alternate?: string; glyphs: Glyph[] }
const words = new WeakMap<HTMLCanvasElement, Run[]>()

// Copy the real *composited* frame at the end of Fiber's render loop, before
// Chromium clears the unpreserved WebGL drawing buffer. No permanent changes to
// renderer settings or permission to capture a desktop/tab are needed.
function freezeGl(original: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const stop = addAfterEffect(() => {
      window.clearTimeout(timer)
      stop()
      try {
        const copy = document.createElement('canvas')
        copy.width = original.width
        copy.height = original.height
        const g = copy.getContext('2d')
        if (!g || !copy.width || !copy.height) throw new Error('Capture surface is not ready')
        g.drawImage(original, 0, 0)
        resolve(copy)
      } catch (e) { reject(e) }
    })
    const timer = window.setTimeout(() => { stop(); reject(new Error('Globe frame unavailable')) }, 4800)
    invalidate()
  })
}

const controlPairs = [
  ['科研航天','Science & spaceflight'],['六代机想象图','Aircraft concept art'],
  ['返回入口','Exit guide'],['地球视角','Earth view'],['解说词','Transcript'],['公开资料','Public sources'],
  ['标注建议','Suggest an edit'],['播放讲解','Play narration'],['暂停讲解','Pause narration'],['继续讲解','Resume narration'],
  ['开始导览','Begin guide'],['上一章','Previous'],['下一章','Next'],['中文口播 · 云扬','Chinese narration only'],
] as const

function hitText(doc: Document, root: HTMLElement, guide: HTMLElement, scale: number): Run[] {
  const chapter = guide.querySelector<HTMLElement>('.space-card')?.dataset.chapter as SpaceBeatId
  const idx = BEATS.findIndex(x => x.id === chapter)
  const lang = root.dataset.lang === 'en' ? 'en' : 'zh'
  const other = lang === 'zh' ? 'en' : 'zh'
  const beat = BEATS[idx]
  const matches = new Map<string, string>()
  for (const pair of controlPairs) {
    matches.set(pair[0], pair[1]); matches.set(pair[1], pair[0])
  }
  for (const b of BEATS) matches.set(b.name[lang], b.name[other])
  if (beat) {
    for (const value of [beat.title, beat.kicker, beat.body, credits[chapter].title, BEAT_STAGING[idx].ground]) {
      matches.set(value[lang], value[other])
    }
    beat.narration[lang].forEach((line,i) => matches.set(line, beat.narration[other][i]))
  }
  const result: Run[] = []
  const walker = doc.createTreeWalker(guide, NodeFilter.SHOW_TEXT)
  const bounds = root.getBoundingClientRect()
  const footer = guide.querySelector('.space-footer')?.getBoundingClientRect()
  const rail = guide.querySelector('.space-rail')?.getBoundingClientRect()
  const range = doc.createRange()
  while (walker.nextNode()) {
    const n = walker.currentNode as Text
    const host = n.parentElement
    if (!host || !n.data.trim() || host.closest('svg,[hidden],dialog,textarea,input,select,script,style,[data-space-capture-exclude]')) continue
    const coveredByFooter = footer && !host.closest('.space-footer')
    const inRail = rail && !!host.closest('.space-rail')
    const glyphs: Glyph[] = []
    let offset = 0
    for (const char of n.data) {
      range.setStart(n, offset); offset += char.length; range.setEnd(n, offset)
      const r = range.getBoundingClientRect()
      if (!r.width || !r.height) continue
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      if (cx < bounds.left || cx > bounds.right || cy < bounds.top || cy > bounds.bottom) continue
      if (coveredByFooter && cy >= footer.top && cy <= footer.bottom && cx >= footer.left && cx <= footer.right) continue
      if (inRail && (cx < rail.left || cx > rail.right)) continue
      glyphs.push({x: (cx - bounds.left)*scale, y: (cy - bounds.top)*scale, char})
    }
    if (glyphs.length) {
      const text = n.data.trim()
      result.push({ glyphs, alternate: matches.get(text) ?? (/^[\d.]+$/.test(text) ? text : undefined) })
    }
  }
  return result
}

/** Coordinates refer to pixels in the returned bitmap, not CSS or viewport pixels.
 * Reads the captured DOM text, never synthesizes OCR from the chapter photograph.
 * A partial translated selection yields the guide's corresponding whole text unit.
 */
export function getCaptureText(canvas: HTMLCanvasElement, box: Box, translate: boolean): string {
  const lines: string[] = []
  for (const run of words.get(canvas) ?? []) {
    const s = run.glyphs.filter(p => p.x >= box.x && p.x < box.x + box.width && p.y >= box.y && p.y < box.y + box.height)
      .map(p => p.char).join('').trim()
    if (s && (!translate || run.alternate)) lines.push(translate ? run.alternate! : s)
  }
  return lines.join('\n')
}

/** Only renders the first-party guide and the globe. With full=true, lays out
 * this chapter from the top to its actual scroll end in an isolated clone.
 * No scroll, style, dialog, focus or language on the live page is modified.
 */
export async function captureSpacePage(full = false): Promise<HTMLCanvasElement> {
  const root = document.querySelector<HTMLElement>('.app-root[data-journey="space"]')
  const guide = root?.querySelector<HTMLElement>('.space-guide')
  if (!root || !guide) throw new Error('Open a science and spaceflight chapter first.')
  const gl = root.querySelector<HTMLCanvasElement>('.earth-canvas canvas')
  const width = root.clientWidth
  const vh = root.clientHeight
  const height = full ? Math.max(vh, guide.scrollHeight) : vh
  if (!width || !height) throw new Error('Guide has no visible surface.')
  const scale = Math.min(window.devicePixelRatio || 1, 2, 4096 / Math.max(width, height), Math.sqrt(8000000 / (width * height)))
  const sy = guide.scrollTop, sx = guide.scrollLeft
  const railX = guide.querySelector('.space-rail')?.scrollLeft ?? 0
  const [renderer, frozen] = await Promise.all([import('html2canvas'), gl ? freezeGl(gl) : null])
  let runs: Run[] = []
  const image = await renderer.default(root, {
    width, height, scale, backgroundColor: '#08101b', logging: false, imageTimeout: 8000, removeContainer: true,
    ignoreElements: el => el === gl || el.matches('dialog,[data-space-capture-exclude],.atlas-hub,.canvas-noise,iframe,video,[hidden]'),
    onclone: (doc, copy) => {
      const section = copy.querySelector<HTMLElement>('.space-guide')!
      const globe = copy.querySelector<HTMLElement>('.earth-canvas')
      if (globe && frozen) {
        const layer = doc.createElement('canvas')
        layer.width = frozen.width
        layer.height = frozen.height
        layer.getContext('2d')!.drawImage(frozen, 0, 0)
        globe.style.height = vh + 'px'
        globe.prepend(layer)
      }
      if (full) {
        copy.style.height = height + 'px'
        section.style.height = height + 'px'
        section.style.boxSizing = 'border-box'
        section.style.overflow = 'visible'
        const footer = section.querySelector<HTMLElement>('.space-footer')
        if (footer) footer.style.position = 'static'
      }
      // html2canvas reuses clone.getBoundingClientRect(), so these coordinates
      // include the same scroll offset and sticky navigation as the output.
      section.scrollTop = full ? 0 : sy
      section.scrollLeft = sx
      const nav = section.querySelector<HTMLElement>('.space-rail')
      if (nav) nav.scrollLeft = railX
      for (const spread of section.querySelectorAll<HTMLElement>('.space-spread')) spread.style.animation = 'none'
      runs = hitText(doc, copy, section, scale)
    },
  })
  words.set(image, runs)
  return image
}
