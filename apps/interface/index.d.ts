declare type Address = string

declare module 'toformat' {
  export default function toFormat<T>(value: T): T
}
