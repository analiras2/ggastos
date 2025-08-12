import React from 'react'
import { Strings } from '@constants/strings'
import { render } from '@testing-library/react-native'
import SimpleHeader from './index'

describe('SimpleHeader', () => {
  const defaultProps = {
    title: 'Test Title',
    testID: 'simple-header',
  }

  const renderComponent = (props = defaultProps) => {
    return render(<SimpleHeader {...props} />)
  }

  it('renders correctly with all required props', () => {
    const { getByText } = renderComponent()

    expect(getByText(Strings.appName)).toBeTruthy()
    expect(getByText(defaultProps.title)).toBeTruthy()
  })

  it('applies correct styles to container', () => {
    const { getByTestId } = renderComponent()
    const container = getByTestId('simple-header-container')

    expect(container.props.style).toEqual(
      expect.objectContaining({
        height: 100,
        backgroundColor: '#333',
        paddingHorizontal: 20,
        justifyContent: 'center',
      })
    )
  })

  it('renders with different title', () => {
    const newTitle = 'Different Title'
    const { getByText } = renderComponent({
      title: newTitle,
      testID: defaultProps.testID,
    })

    expect(getByText(newTitle)).toBeTruthy()
  })
})
