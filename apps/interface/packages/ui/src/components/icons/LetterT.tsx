import { Polygon, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const LetterT = createIcon({
  name: 'LetterT',
  getIcon: (props) => (
    <Svg viewBox="0 0 80 80" fill="currentColor" {...props}>
      <Polygon points="0 0 0 10 10 20 30 20 30 70 40 80 50 80 50 20 30 0 0 0" />
      <Polygon points="50 20 70 20 80 10 80 0 50 0 50 20" />
    </Svg>
  ),
})
