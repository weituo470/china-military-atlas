import { useEffect, useRef, type ReactNode } from 'react'
import { useJourney } from '../store/journey'

export function SourcesDialog({ titleId, children }: { titleId: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const close = useJourney(s => s.toggleSources)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])
  return <dialog ref={ref} className="journey-sources" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); close(false) }}>{children}</dialog>
}
