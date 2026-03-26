import { WindowCard } from 'components/Card/WindowCard'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Button, Flex, Image as ImageComponent, SpinningLoader, styled, Text, useSigilColors } from 'ui/src'
import { TextInput } from 'ui/src'
import { Upload } from 'ui/src/components/icons'
import { useHover } from '@tamagui/react-native-web-internals'
import { useForm } from 'react-hook-form'
import useResizeObserver from 'use-resize-observer'
import { parseFileSize, formatFileSize, parseFileType, formatFileType, parseFileDimensions, formatFileDimensions, STATUS_PRIORITY, WORSE_ACCEPTABLE_STATUS } from 'components/CultVisual/CultVisualHelpers'
import { Status, UploadedImage, UploadedImageField } from 'components/CultVisual/types'
import { VisualDataField } from 'components/CultVisual/VisualDataField'
import { useSetCultVisual } from 'state/summon/hooks'

// Upload via the metadata API proxy → catbox.moe (avoids CORS)
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('http://localhost:8080/upload-image', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const { url } = await res.json()
  if (!url?.startsWith('https://')) throw new Error(`Unexpected response: ${url}`)
  return url
}

function isHttpUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url.trim())
}

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

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export function CultVisual() {
  const [isUploadBoxHovered, setIsUploadBoxHovered] = useState(false)
  const [preview, setPreview] = useState<UploadedImage | null>(null)
  const [worseStatus, setWorseStatus] = useState<UploadedImageField<any>['status'] | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { register } = useForm()
  const { ref: registerRef, ...rest } = register('visual')

  const setCultVisual = useSetCultVisual()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !file.type.startsWith('image/')) return

      setUploadError(null)

      // Load image to get dimensions and validate
      const imageUrl = URL.createObjectURL(file)
      const image = new Image()

      image.onload = async () => {
        const previewData: UploadedImage = {
          url: imageUrl,
          metadata: {
            dimensions: parseFileDimensions(image.width, image.height),
            size: parseFileSize(file.size),
            type: parseFileType(file.type),
          },
        }

        setPreview(previewData)

        const worse = Object.values(previewData.metadata).reduce<Status>((acc, { status }) => {
          return STATUS_PRIORITY.indexOf(status) < STATUS_PRIORITY.indexOf(acc) ? status : acc
        }, STATUS_PRIORITY[STATUS_PRIORITY.length - 1])

        setWorseStatus(worse)

        if (STATUS_PRIORITY.indexOf(worse) < STATUS_PRIORITY.indexOf(WORSE_ACCEPTABLE_STATUS)) {
          // Image fails validation — don't upload
          return
        }

        setUploadState('uploading')
        try {
          const hostedUrl = await uploadImage(file)
          URL.revokeObjectURL(imageUrl)
          setPreview((prev) => prev ? { ...prev, url: hostedUrl } : null)
          setCultVisual(hostedUrl)
          setUploadState('done')
        } catch (err) {
          setUploadState('error')
          setUploadError('Upload failed. Paste an image URL below instead.')
          // Still allow summoning with blob URL as fallback; image won't persist externally
          setCultVisual(imageUrl)
        }
      }

      image.src = imageUrl
    },
    []
  )

  const handleUrlChange = useCallback((url: string) => {
    setUrlInput(url)
    if (isHttpUrl(url)) {
      if (preview?.url?.startsWith('blob:')) URL.revokeObjectURL(preview.url)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setPreview(null)
      setUploadState('idle')
      setUploadError(null)
      setCultVisual(url.trim())
    } else {
      setCultVisual(null)
    }
  }, [preview?.url, setCultVisual])

  const reset = useCallback(() => {
    setCultVisual(null)
    setUrlInput('')
    setUploadState('idle')
    setUploadError(null)
    if (preview?.url?.startsWith('blob:')) URL.revokeObjectURL(preview.url)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setPreview(null)
  }, [preview?.url, setCultVisual])

  const onUploadImage = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const colors = useSigilColors()
  const uploadBoxStyles = useMemo(() => {
    const encodedColor = encodeURIComponent(isUploadBoxHovered ? colors.accent1Hovered.val : colors.borderColor.val)
    return { borderImageSource: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='${encodedColor}' width='18' height='18' viewBox='0 0 18 18'%3E%3Cpolyline points='.5 6 .5 .5 6 .5'/%3E%3Cpolyline points='17.5 6 17.5 .5 12 .5'/%3E%3Cpolyline points='.5 12 .5 17.5 6 17.5'/%3E%3Cpolyline points='17.5 12 17.5 17.5 12 17.5'/%3E%3C/svg%3E")` }
  }, [colors.borderColor.val, colors.accent1Hovered.val, isUploadBoxHovered])

  const uploadBoxRef = useRef(null)
  const onHoverStart = useCallback(() => setIsUploadBoxHovered(true), [])
  const onHoverEnd = useCallback(() => setIsUploadBoxHovered(false), [])
  useHover(uploadBoxRef, { onHoverStart, onHoverEnd })

  const previewBoxRef = useRef(null)
  const { height } = useResizeObserver({ ref: previewBoxRef })

  return (
    <WindowCard title="Cult Visual" backgroundColor="$surface2">
      <Flex flex={1} gap="$gap16">
        {!!preview && (
          <Flex ref={previewBoxRef} flexDirection="row" gap="$gap32" minHeight={200}>
            <VisualPreview status={worseStatus ?? undefined} width={height} height={height}>
              <ImageComponent flex={1} src={preview.url} />
            </VisualPreview>

            <Flex flex={1} gap="$gap16" py="$spacing8">
              <VisualDataField fieldName="dimensions" formatter={formatFileDimensions} {...preview.metadata.dimensions} />
              <VisualDataField fieldName="size" formatter={formatFileSize} {...preview.metadata.size} />
              <VisualDataField fieldName="type" formatter={formatFileType} {...preview.metadata.type} />

              {uploadState === 'uploading' && (
                <Flex flexDirection="row" gap="$gap8" alignItems="center">
                  <SpinningLoader size={14} />
                  <Text variant="body3" color="$neutral2">Uploading image...</Text>
                </Flex>
              )}

              {uploadState === 'done' && (
                <Text variant="body3" color="$accent1">Image uploaded successfully.</Text>
              )}

              {uploadState === 'error' && (
                <Text variant="body3" color="$statusCritical">{uploadError}</Text>
              )}


              <Button theme="tertiary_Button" mt="auto" onPress={reset}>
                <Text variant="body2">Reset</Text>
              </Button>
            </Flex>
          </Flex>
        )}

        {!preview && (
          <UploadBox ref={uploadBoxRef} onPress={onUploadImage} height={120} style={uploadBoxStyles}>
            <Upload size={32} color="$accent1" />
          </UploadBox>
        )}

        <Flex gap="$gap8">
          <Text variant="body3" color="$neutral2">Or paste an image URL</Text>
          <TextInput
            value={urlInput}
            onChangeText={handleUrlChange}
            placeholder="https://..."
          />
          {urlInput.length > 0 && !isHttpUrl(urlInput) && (
            <Text variant="body3" color="$statusCritical">Must be a valid http(s) URL</Text>
          )}
          {urlInput.length > 0 && isHttpUrl(urlInput) && (
            <Text variant="body3" color="$accent1">URL accepted.</Text>
          )}
          {uploadState === 'error' && (
            <Text variant="body3" color="$statusCritical">{uploadError}</Text>
          )}
        </Flex>

        {!preview && (
          <Text variant="body3" color="$neutral2" textAlign="center">
            Upload a square photo — PNG, JPG or GIF files only
          </Text>
        )}
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
        style={{ visibility: 'hidden', height: 0 }}
      />
    </WindowCard>
  )
}
