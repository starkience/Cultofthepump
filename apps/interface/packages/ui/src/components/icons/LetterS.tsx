import { Polygon, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const LetterS = createIcon({
  name: 'LetterS',
  getIcon: (props) => (
    <Svg viewBox="0 0 80 80" fill="currentColor" {...props}>
      <Polygon points="60 20 80 0 20 0 0 20 0 30 20 30 20 20 60 20" />
      <Polygon points="0 50 60 50 60 60 10 60 0 70 0 80 60 80 80 60 80 50 60 30 20 30 0 50" />
    </Svg>
  ),
})
