import { Polygon, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const Upload = createIcon({
  name: 'Upload',
  getIcon: (props) => (
    <Svg viewBox="0 0 80 70" fill="currentColor" {...props}>
      <Polygon points="45 14.145012 59.14209 28.286606 66.213379 21.215809 45 .003662 45 .003906 45 0 35 0 35 14.139275 35 49.997384 45 49.997384 45 14.145012" />
      <Polygon points="30 19.149023 30 4.999738 13.790039 21.218861 20.859863 28.288559 30 19.149023" />
      <Polygon points="70 40.001569 70 60.000523 10 60.000523 10 40.001569 0 40.001569 0 70 80 70 80 40.001569 70 40.001569" />
    </Svg>
  ),
})
