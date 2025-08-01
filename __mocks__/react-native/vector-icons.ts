jest.mock('@react-native-vector-icons/ionicons', () => {
  const React = require('react')
  const MockIcon = (props: any) => React.createElement('Icon', props)
  return MockIcon
})
