import { Polygon, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const LetterK = createIcon({
  name: 'LetterK',
  getIcon: (props) => (
    <Svg viewBox="0 0 80 80" fill="currentColor" {...props}>
      <Polygon points="20 10 10 0 0 0 0 30 20 30 20 10" />
      <Polygon points="80 10 80 0 60 0 30 30 20 30 0 50 0 80 10 80 20 70 20 50 30 50 60 80 80 80 80 70 50 40 80 10" />
    </Svg>
  ),
})
