import { WindowCard } from 'components/Card/WindowCard'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Button, Flex, Image as ImageComponent, styled, Text, useSigilColors } from 'ui/src'
import { Upload } from 'ui/src/components/icons'
import { useHover } from '@tamagui/react-native-web-internals'
import { useForm } from 'react-hook-form'
import useResizeObserver from 'use-resize-observer'
import { parseFileSize, formatFileSize, parseFileType, formatFileType, parseFileDimensions, formatFileDimensions, STATUS_PRIORITY, WORSE_ACCEPTABLE_STATUS } from 'components/CultVisual/CultVisualHelpers'
import { Status, UploadedImage, UploadedImageField } from 'components/CultVisual/types'
import { VisualDataField } from 'components/CultVisual/VisualDataField'
import { useSetCultVisual } from 'state/summon/hooks'

const UploadBox = styled(Flex, {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  borderStyle: 'solid',
  background: '$surface1',
  cursor: 'pointer',

  "$platform-web": {
    borderImageRepeat: 'round',
    borderImageSlice: 1,
  }
})

const VisualPreview = styled(Flex, {
  borderWidth: 1,
  borderStyle: 'solid',
  p: 1,

  variants: {
    status: {
      ok: {
        borderColor: '$accent1',
      },
      warning: {
        borderColor: '$statusWarning',
      },
      critical: {
        borderColor: '$statusCritical',
      },
    },
  }
})

export function CultVisual() {
  const [IsUploadBoxHovered, setIsUploadBoxHovered] = useState(false)
  const [preview, setPreview] = useState<UploadedImage | null>(null)
  const [worseStatus, setWorseStatus] = useState<UploadedImageField<any>['status'] | null>(null)

  // form
  const { register } = useForm()

  const { ref: registerRef, ...rest } = register('visual')

  // global state
  const setCultVisual = useSetCultVisual()

  // upload logic
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) {
        return
      }

      // Ensure it's an image
      if (file.type.startsWith('image/')) {
        // Get filename
        const image = new Image()
        const imageUrl = URL.createObjectURL(file)

        image.onload = () => {
          const preview = {
            url: imageUrl,
            metadata: {
              dimensions: parseFileDimensions(image.width, image.height),
              size: parseFileSize(file.size),
              type: parseFileType(file.type),
            }
          }

          setPreview(preview)

          // compute the worse status
          const worseStatus = Object.values(preview.metadata).reduce<Status>((acc, { status }) => {
            return STATUS_PRIORITY.indexOf(status) < STATUS_PRIORITY.indexOf(acc) ? status : acc
          }, STATUS_PRIORITY[STATUS_PRIORITY.length - 1])

          // save the worse status
          setWorseStatus(worseStatus)

          // compare it to the worse acceptable status and update the state accordingly
          if (STATUS_PRIORITY.indexOf(worseStatus) >= STATUS_PRIORITY.indexOf(WORSE_ACCEPTABLE_STATUS)) {
            setCultVisual(imageUrl)
          }
        }

        image.src = imageUrl
      }
    },
    []
  )

  // reset upload
  const reset = useCallback(() => {
    setCultVisual(null)

    if (preview?.url) {
      URL.revokeObjectURL(preview.url)
    }

    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setPreview(null)
  }, [preview?.url])

  // image upload
  const onUploadImage = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // upload box dashed border
  const colors = useSigilColors()

  const uploadBoxStyles = useMemo(() => {
    const encodedColor = encodeURIComponent(IsUploadBoxHovered ? colors.accent1Hovered.val : colors.borderColor.val)

    return { borderImageSource: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='${encodedColor}' width='18' height='18' viewBox='0 0 18 18'%3E%3Cpolyline points='.5 6 .5 .5 6 .5'/%3E%3Cpolyline points='17.5 6 17.5 .5 12 .5'/%3E%3Cpolyline points='.5 12 .5 17.5 6 17.5'/%3E%3Cpolyline points='17.5 12 17.5 17.5 12 17.5'/%3E%3C/svg%3E")` }
  }, [colors.borderColor.val, colors.accent1Hovered.val, IsUploadBoxHovered])

  // upload box hover
  const uploadBoxRef = useRef(null)

  const onHoverStart = useCallback(() => setIsUploadBoxHovered(true), [])
  const onHoverEnd = useCallback(() => setIsUploadBoxHovered(false), [])

  useHover(uploadBoxRef, { onHoverStart, onHoverEnd })

  // Preview styling
  const previewBoxRef = useRef(null)
  const { height } = useResizeObserver({ ref: previewBoxRef})

  return (
    <WindowCard title="Cult Visual" height={320} backgroundColor="$surface2">
      <Flex flex={1}>
        {!!preview && (
          <Flex ref={previewBoxRef} flex={1} flexDirection="row" gap="$gap32">
            <VisualPreview status={worseStatus ?? undefined} width={height} height={height}>
              <ImageComponent flex={1} src={preview.url} />
            </VisualPreview>

            <Flex flex={1} gap="$gap16" py="$spacing8">
              <VisualDataField fieldName="dimensions" formatter={formatFileDimensions} {...preview.metadata.dimensions} />
              <VisualDataField fieldName="size" formatter={formatFileSize} {...preview.metadata.size} />
              <VisualDataField fieldName="type" formatter={formatFileType} {...preview.metadata.type} />

              <Button theme="tertiary_Button" mt="auto" onPress={reset}>
                <Text variant="body2">Reset</Text>
              </Button>
            </Flex>
          </Flex>
        )}

        <Flex display={preview ? 'none' : 'flex'} gap="$gap16" flex={1}>
          <UploadBox ref={uploadBoxRef} onPress={onUploadImage} flex={1} style={uploadBoxStyles}>
            <Upload size={32} color="$accent1" />
          </UploadBox>

          <Text variant="body3" color="$neutral2" textAlign="center">Upload a square photo - PNG, JPG or GIF files only</Text>
        </Flex>
      </Flex>

      <input
        type="file"
        ref={(e) => {
          registerRef(e)
          fileInputRef.current = e
        }}
        {...rest}
        onChange={handleImageUpload}
        accept="image/png, image/jpeg, image/gif"
        style={{
          visibility: 'hidden',
          height: 0,
        }}
      />
    </WindowCard>
  )
}
