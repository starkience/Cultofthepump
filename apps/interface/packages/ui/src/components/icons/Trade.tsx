import { Rect, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const Trade = createIcon({
  name: 'Trade',
  getIcon: (props) => (
    <Svg viewBox="0 0 16 18" fill="currentColor" {...props}>
      <Rect y="12" width="4" height="6" />
      <Rect x="6" y="6" width="4" height="12" />
      <Rect x="12" width="4" height="18" />
    </Svg>
  ),
})
