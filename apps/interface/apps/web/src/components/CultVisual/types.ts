export type UploadedImageField<T> = { value: T } & ({
  status: 'ok'
} | {
  status: 'critical' | 'warning'
  reason: string
})

export interface UploadedImage {
  url: string
  metadata: {
    size: UploadedImageField<number>
    dimensions: UploadedImageField<{ width: number; height: number }>
    type: UploadedImageField<string>
  }
}

export type Status = UploadedImageField<any>['status']
