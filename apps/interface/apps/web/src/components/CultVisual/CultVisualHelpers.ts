import { UploadedImage } from 'components/CultVisual/types'

export const STATUS_PRIORITY = ['critical', 'warning', 'ok'] as const
export const WORSE_ACCEPTABLE_STATUS = 'warning'

//
// SIZE
//

const MAX_FILE_SIZE = 5_000_000 // 5MB

export function parseFileSize(size: number): UploadedImage['metadata']['size'] {
  return {
    value: size,
    ...(size <= MAX_FILE_SIZE ? {
      status: 'ok'
    } : {
      status: 'critical',
      reason: `File size exceeds ${MAX_FILE_SIZE / 1_000_000}MB`
    }),
  }
}

export function formatFileSize(size: UploadedImage['metadata']['size']['value']): string {
  return `${Math.round(size / 1024)} KB`
}

//
// TYPE
//

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

export function parseFileType(type: string): UploadedImage['metadata']['type'] {
  return {
    value: type,
    ...(VALID_IMAGE_TYPES.includes(type) ? {
      status: 'ok'
    } : {
      status: 'critical',
      reason: 'Invalid file type'
    }),
  }
}

export function formatFileType(type: UploadedImage['metadata']['type']['value']): string {
  return type.split('/')[1].toUpperCase()
}

//
// DIMENSIONS
//

export function parseFileDimensions(width: number, height: number): UploadedImage['metadata']['dimensions'] {
  return {
    value: { width, height },
    ...(width === height ? {
      status: 'ok'
    } : {
      status: 'warning',
      reason: 'Image should be a square'
    }),
  }
}

export function formatFileDimensions({ width, height }: UploadedImage['metadata']['dimensions']['value']): string {
  return `${width}x${height}`
}
