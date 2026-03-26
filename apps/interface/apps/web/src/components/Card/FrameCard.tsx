import React from 'react'
import { Flex, FlexProps, styled, TamaguiElement } from 'ui/src'

const DEFAULT_FRAME_SIZE = 10

const FrameCorner = styled(Flex, {
  position: 'absolute',
  borderColor: '$accent1',
  borderStyle: 'solid',
  borderWidth: 0,

  variants: {
    framePosition: {
      'top-left': {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        top: 0,
        left: 0,
      },
      'top-right': {
        borderTopWidth: 1,
        borderRightWidth: 1,
        top: 0,
        right: 0,
      },
      'bottom-right': {
        borderBottomWidth: 1,
        borderRightWidth: 1,
        bottom: 0,
        right: 0,
      },
      'bottom-left': {
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        bottom: 0,
        left: 0,
      },
    },
  },
})

function FrameCornerElement({
  frameSize,
  framePosition,
}: {
  frameSize: number
  framePosition: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'
}) {
  return (
    <FrameCorner
      width={frameSize}
      height={frameSize}
      framePosition={framePosition}
    />
  )
}

interface FrameCardProps extends FlexProps {
  frameSize?: number
}

export const FrameCard = React.forwardRef<TamaguiElement, FrameCardProps>(
  function FrameCard({ frameSize = DEFAULT_FRAME_SIZE, children, ...props }, ref) {
    return (
      <Flex ref={ref} position="relative" {...props}>
        <FrameCornerElement frameSize={frameSize} framePosition="top-left" />
        <FrameCornerElement frameSize={frameSize} framePosition="top-right" />
        <FrameCornerElement frameSize={frameSize} framePosition="bottom-right" />
        <FrameCornerElement frameSize={frameSize} framePosition="bottom-left" />
        {children}
      </Flex>
    )
  }
)
