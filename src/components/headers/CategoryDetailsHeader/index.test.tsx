import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { CategoryDetailsHeader } from './index'

describe('CategoryDetailsHeader', () => {
  const defaultProps = {
    title: 'Test Category',
    balance: {
      expected: 1000,
      current: 800,
    },
    color: '#FF0000',
    onBackPress: jest.fn(),
    testID: 'category-header',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    const { getByTestId, getByText } = render(<CategoryDetailsHeader {...defaultProps} />)

    expect(getByTestId('category-header')).toBeTruthy()
    expect(getByText('Test Category')).toBeTruthy()
    expect(getByTestId('category-header-expected-balance')).toBeTruthy()
    expect(getByTestId('category-header-current-balance')).toBeTruthy()
  })

  it('calls onBackPress when back button is pressed', () => {
    const { getByTestId } = render(<CategoryDetailsHeader {...defaultProps} />)

    fireEvent.press(getByTestId('category-header-back-button'))
    expect(defaultProps.onBackPress).toHaveBeenCalledTimes(1)
  })

  it('displays correct balance values', () => {
    const { getByText } = render(<CategoryDetailsHeader {...defaultProps} />)

    expect(getByText('R$1000,00')).toBeTruthy()
    expect(getByText('R$800,00')).toBeTruthy()
  })

  it('applies accent color to bottom border', () => {
    const { getByTestId } = render(<CategoryDetailsHeader {...defaultProps} />)

    const container = getByTestId('category-header')
    expect(container.props.style).toHaveProperty('borderBottomColor', '#FF0000')
  })
})
