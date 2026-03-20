import React from 'react'
import { Flex, FlexProps, styled, TamaguiElement } from 'ui/src'

const DEFAULT_FRAME_SIZE = 10

const FrameCorner = styled(Flex, {
  position: 'absolute',
  borderColor: '$accent1',
  borderStyle: 'solid',
  borderWidth: 0,

  variants: {
    size: {
      '...': (size: number) => ({
        width: size,
        height: size,
      }),
    },

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

interface FrameCardProps extends FlexProps {
  frameSize?: number
}

export const FrameCard = React.forwardRef<TamaguiElement, FrameCardProps>(
  function FrameCard({ frameSize = DEFAULT_FRAME_SIZE, children, ...props }, ref) {
    return (
      <Flex ref={ref} position="relative" {...props}>
        <FrameCorner size={frameSize} framePosition="top-left" />
        <FrameCorner size={frameSize} framePosition="top-right" />
        <FrameCorner size={frameSize} framePosition="bottom-right" />
        <FrameCorner size={frameSize} framePosition="bottom-left" />
        {children}
      </Flex>
    )
  }
)
