import { Polygon, Svg } from 'react-native-svg'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { createIcon } from '../factories/createIcon'

export const Stake = createIcon({
  name: 'Stake',
  getIcon: (props) => (
    <Svg width="52.421875" viewBox="0 0 52.421875 80" fill="currentColor" {...props}>
      <Polygon points="7.070312 28.290039 16.209961 19.150024 16.209961 5 0 21.219971 7.070312 28.290039" />
      <Polygon points="31.209961 30 31.209961 14.146484 45.350586 28.287354 52.421875 21.216309 31.209961 .004395 31.209961 0 21.209961 0 21.209961 80 31.209961 80 31.209961 44.146484 45.350586 58.287354 52.421875 51.216309 31.209961 30.004395 31.209961 30" />
      <Polygon points="7.070312 58.290039 16.209961 49.150024 16.209961 35 0 51.219971 7.070312 58.290039" />
    </Svg>
  ),
})
