import { Polygon, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const Prompt = createIcon({
  name: 'Prompt',
  getIcon: (props) => (
    <Svg viewBox="0 0 160 120" fill="currentColor" {...props}>
      <Polygon points="80 40 100 20 60 20 60 0 50 0 40 10 40 20 20 20 0 40 0 50 20 70 80 70 80 80 20 80 0 100 40 100 40 120 50 120 60 110 60 100 80 100 100 80 100 70 80 50 20 50 20 40 80 40" />
      <Polygon points="120 100 160 60 120 20 120 100" />
    </Svg>
  ),
})
