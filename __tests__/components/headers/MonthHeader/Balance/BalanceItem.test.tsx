import { LabeledItem } from '@components/LabeledItem'
import { render } from '@testing-library/react-native'
import React from 'react'

describe('BalanceItem', () => {
  const mockProps = {
    label: 'Test Label',
    value: 1234.56,
    variant: 'title' as const,
  }

  it('renders label and formatted value', () => {
    const { getByText } = render(<LabeledItem {...mockProps} />)
    expect(getByText('Test Label')).toBeTruthy()
    expect(getByText('R$1234,56')).toBeTruthy()
  })

  it('applies different variants correctly', () => {
    const { rerender, getByText } = render(
      <LabeledItem {...mockProps} variant="header" />
    )

    const headerValue = getByText('R$1234,56')
    expect(headerValue.props.style).toContainEqual(
      expect.objectContaining({ fontSize: expect.any(Number) })
    )

    rerender(<LabeledItem {...mockProps} variant="title" />)

    const titleValue = getByText('R$1234,56')
    expect(titleValue.props.style).toContainEqual(
      expect.objectContaining({ fontSize: expect.any(Number) })
    )
  })
})
