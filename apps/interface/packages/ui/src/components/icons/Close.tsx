import { Polygon, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const Close = createIcon({
  name: 'Close',
  getIcon: (props) => (
    <Svg viewBox="0 0 42 42" fill="currentColor" {...props}>
      <Polygon points="42 7 35 0 21 14 7 0 0 7 14 21 0 35 7 42 42 7" />
      <Polygon points="24.5 31.5 31.5 24.5 42 35 35 42 24.5 31.5" />
    </Svg>
  ),
})
