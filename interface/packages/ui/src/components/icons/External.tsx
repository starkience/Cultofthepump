import { Polygon, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const External = createIcon({
  name: 'External',
  getIcon: (props) => (
    <Svg viewBox="0 0 80 80" fill="currentColor" {...props}>
      <Polygon points="69.997437 70 9.999634 70 9.999634 10 29.998901 10 29.998901 0 0 0 0 72.928955 7.070542 80 79.99707 80 79.99707 50 69.997437 50 69.997437 70" />
      <Polygon points="37.571378 35.354614 44.641432 42.424561 70.000366 17.074707 80 7.074707 72.929946 .004639 72.92604 .008545 72.92604 0 42.927139 0 42.927139 10 62.935195 10 62.930313 10.004639 37.571378 35.354614" />
      <Polygon points="70.000366 37.074707 80 37.074707 80 14.134644 70.000366 24.134644 70.000366 37.074707" />
    </Svg>
  ),
})
