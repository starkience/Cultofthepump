import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const ANIM_DURATION = 200 // ms

const styles = `
@keyframes modal-backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes modal-backdrop-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes modal-panel-in {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes modal-panel-out {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to   { opacity: 0; transform: scale(0.92) translateY(12px); }
}
`

interface ModalShellProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: number
}

export function ModalShell({ open, onClose, children, width = 380 }: ModalShellProps) {
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setClosing(false)
    }
  }, [open])

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      setMounted(false)
      setClosing(false)
      onClose()
    }, ANIM_DURATION)
  }, [onClose])

  if (!mounted) return null

  const animState = closing ? 'out' : 'in'

  return createPortal(
    <>
      <style>{styles}</style>
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          animation: `modal-backdrop-${animState} ${ANIM_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width,
            background: '#0d0d0d',
            border: '1px solid rgba(156,255,147,0.08)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            animation: `modal-panel-${animState} ${ANIM_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
          }}
        >
          {children}
        </div>
      </div>
    </>,
    document.body,
  )
}
