import Icon from '@react-native-vector-icons/ionicons'

export type IconName = React.ComponentProps<typeof Icon>['name']

jest.mock('@react-native-vector-icons/ionicons', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react')
  const MockIcon = (props: IconName) => React.createElement('Icon', props)
  return MockIcon
})
