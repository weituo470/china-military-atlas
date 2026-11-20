import { useRef, useState } from 'react'

/** A site-local pin, never a desktop overlay or a public attachment. */
export function SpacePinnedMark({ src, zh, onClose }: { src: string; zh: boolean; onClose: () => void }) {
  const [pos, setPos] = useState({ x: 12, y: 12 })
  const [small, setSmall] = useState(false)
  const panel = useRef<HTMLElement>(null)
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null)
  function move(x: number, y: number) {
    setPos({ x: Math.max(0, Math.min(x, window.innerWidth - (panel.current?.offsetWidth ?? 0))),
      y: Math.max(0, Math.min(y, window.innerHeight - (panel.current?.offsetHeight ?? 0))) })
  }
  return <aside ref={panel} className="space-pinned-mark" style={{ left: pos.x, top: pos.y }} aria-label={zh ? '置顶的标注截图' : 'Pinned annotation'} data-space-capture-exclude>
    <header><button type="button" className="pin-handle" title={zh ? '拖动或用方向键移动' : 'Drag or use arrow keys to move'}
      onPointerDown={e => { drag.current = { id: e.pointerId, dx: e.clientX - pos.x, dy: e.clientY - pos.y }; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={e => { const d = drag.current; if (d?.id === e.pointerId) move(e.clientX - d.dx, e.clientY - d.dy) }}
      onLostPointerCapture={() => { drag.current = null }} onKeyDown={e => {
        if (!e.key.startsWith('Arrow')) return
        e.preventDefault(); e.stopPropagation()
        move(pos.x + (e.key === 'ArrowLeft' ? -16 : e.key === 'ArrowRight' ? 16 : 0), pos.y + (e.key === 'ArrowUp' ? -16 : e.key === 'ArrowDown' ? 16 : 0))
      }}>{zh ? '已钉截图' : 'Pinned image'}</button>
      <button type="button" aria-expanded={!small} aria-label={zh ? '收起或展开' : 'Collapse or expand'} onClick={() => setSmall(!small)}>{small ? '+' : '−'}</button>
      <button type="button" aria-label={zh ? '取消钉图' : 'Unpin image'} onClick={onClose}>×</button></header>
    {!small && <img src={src} alt={zh ? '标注截图' : 'Marked screenshot'} />}
  </aside>
}
