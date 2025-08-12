import React from 'react'
import { Strings } from '@constants/strings'
import { render } from '@testing-library/react-native'
import { Balance } from './index'

describe('Balance', () => {
  const mockProps = {
    expected: 1000,
    current: 750.5,
    testID: 'balance-component',
  }

  it('renders correctly with provided values', () => {
    const { getByText, getByTestId } = render(<Balance {...mockProps} />)

    expect(getByTestId('balance-component')).toBeTruthy()
    expect(getByText('R$1000,00')).toBeTruthy()
    expect(getByText('R$750,50')).toBeTruthy()
  })

  it('displays correct labels', () => {
    const { getByText } = render(<Balance {...mockProps} />)

    expect(getByText(Strings.expectedBalance)).toBeTruthy()
    expect(getByText(Strings.currentBalance)).toBeTruthy()
  })
})
