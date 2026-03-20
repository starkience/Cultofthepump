import { Polygon, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const LetterR = createIcon({
  name: 'LetterR',
  getIcon: (props) => (
    <Svg viewBox="0 0 80 80" fill="currentColor" {...props}>
      <Polygon points="20 0 0 20 0 30 20 30 20 20 60 20 60 30 20 30 0 50 0 80 10 80 20 70 20 50 30 50 60 80 80 80 80 70 60 50 80 50 80 20 60 0 20 0" />
    </Svg>
  ),
})
