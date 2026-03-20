//
// @deprecated Prefer Modal from packages/uniswap/src/components/modals/Modal.tsx
//
// TODO(WEB-4886): Remove this
//
import { DialogContent, DialogOverlay } from '@reach/dialog'
import { WindowCard, WindowCardProps } from 'components/Card/WindowCard'
import React, { KeyboardEvent, useCallback, useRef } from 'react'
import { animated, easings, useSpring, useTransition } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import { styled, useSigilColors } from 'ui/src'
import { zIndices } from 'ui/src/theme'
import { isMobileWeb } from 'utilities/src/platform'
import { useOnClickOutside } from 'utilities/src/react/hooks/useOnClickOutside'

export const MODAL_TRANSITION_DURATION = 200

const AnimatedDialogOverlay = animated(DialogOverlay)

const StyledDialogOverlay = styled(AnimatedDialogOverlay, {
  "$platform-web": {
    willChange: 'transform, opacity',
  }
})

interface ModalStyleProps {
  height?: Dimension
  minHeight?: Dimension
  maxHeight?: Dimension
  scrollOverlay?: boolean
  hideBorder?: boolean
  maxWidth: Dimension
}

function ModalStyle(props: ModalStyleProps) {
  const colors = useSigilColors()

  return (
    <style>
      {`
        div[data-reach-dialog-overlay] {
          z-index: ${zIndices.modalBackdrop};
          background-color: transparent;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: ${props.scrollOverlay && 'scroll'};
          background-color: ${colors.scrim.val};
        }

        div[data-reach-dialog-content] {
          background: transparent;
          margin: auto;
          box-shadow: 12px 16px 24px rgba(0, 0, 0, 0.24), 12px 8px 12px rgba(0, 0, 0, 0.24), 4px 4px 8px rgba(0, 0, 0, 0.32);
          padding: 0px;
          width: 50vw;
          overflow-y: auto;
          overflow-x: hidden;
          ${props.height ? `height: ${dimensionsToCss(props.height)};` : ''}
          ${props.maxHeight ? `max-height: ${dimensionsToCss(props.maxHeight)};` : ''}
          ${props.minHeight ? `min-height: ${dimensionsToCss(props.minHeight)};` : ''}
          ${props.maxWidth ? `max-width: ${dimensionsToCss(props.maxWidth)};` : ''}
          display: ${props.scrollOverlay ? 'inline-table' : 'flex'};
        }
      `}
    </style>
  )
}

type Dimension = number | string

function dimensionsToCss(dimensions: Dimension) {
  if (typeof dimensions === 'number') {
    return `${dimensions}px`
  }
  return dimensions
}

const AnimatedDialogContent = animated(DialogContent)
const StyledDialogContent = styled(AnimatedDialogContent, {
  "$platform-web": {
    overflowY: 'auto',
  },
})

interface ModalProps extends WindowCardProps {
  isOpen: boolean
  onDismiss?: () => void
  onSwipe?: () => void
  height?: Dimension
  minHeight?: Dimension
  maxHeight?: Dimension
  maxWidth?: Dimension
  initialFocusRef?: React.RefObject<any>
  children?: React.ReactNode
  scrollOverlay?: boolean
  hideBorder?: boolean
  slideIn?: boolean
}

export default function Modal({
  isOpen,
  onDismiss,
  minHeight,
  maxHeight = '90vh',
  maxWidth = 420,
  height,
  initialFocusRef,
  children,
  onSwipe = onDismiss,
  scrollOverlay,
  hideBorder = false,
  slideIn,
  ...props
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => (isOpen && onDismiss ? onDismiss() : undefined))

  const handleEscape = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && isOpen && onDismiss) {
        onDismiss()
      }
    },
    [isOpen, onDismiss],
  )

  const fadeTransition = useTransition(isOpen, {
    config: { duration: MODAL_TRANSITION_DURATION },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  const slideTransition = useTransition(isOpen, {
    config: { duration: MODAL_TRANSITION_DURATION, easing: easings.easeInOutCubic },
    from: { transform: 'translateY(40px)' },
    enter: { transform: 'translateY(0px)' },
    leave: { transform: 'translateY(40px)' },
  })

  const [{ y }, set] = useSpring(() => ({ y: 0, config: { mass: 1, tension: 210, friction: 20 } }))
  const bind = useGesture({
    onDrag: (state) => {
      set({
        y: state.down ? state.movement[1] : 0,
      })
      if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
        onSwipe?.()
      }
    },
  })

  return (
    <div tabIndex={0} onKeyUp={handleEscape}>
      <ModalStyle
        height={height}
        minHeight={minHeight}
        maxHeight={maxHeight}
        scrollOverlay={scrollOverlay}
        hideBorder={hideBorder}
        maxWidth={maxWidth}
      />
      {fadeTransition(
        ({ opacity }, item) =>
          item && (
            <StyledDialogOverlay
              style={{ opacity: opacity.to({ range: [0.0, 1.0], output: [0, 1] }) }}
              onDismiss={onDismiss}
              initialFocusRef={initialFocusRef}
              unstable_lockFocusAcrossFrames={false}
            >
              {slideTransition(
                (styles, item) =>
                  item && (
                    <StyledDialogContent
                      ref={ref}
                      {...(isMobileWeb
                        ? {
                            ...bind(),
                            style: { transform: y.interpolate((y) => `translateY(${(y as number) > 0 ? y : 0}px)`) },
                          }
                        : slideIn
                          ? { style: styles }
                          : {})}
                      aria-label="dialog"
                    >
                      {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                      {!initialFocusRef && isMobileWeb ? <div tabIndex={1} /> : null}
                      <WindowCard width="100%" onClose={onDismiss} {...props}>{children}</WindowCard>
                    </StyledDialogContent>
                  ),
              )}
            </StyledDialogOverlay>
          ),
      )}
    </div>
  )
}
