import ChartsScreen from '@screens/Charts'
import { render } from '@testing-library/react-native'
import React from 'react'

describe('ChartsScreen', () => {
  it('Should render correcting', () => {
    const { getByText } = render(<ChartsScreen />)
    expect(getByText('Chart Screen')).toBeTruthy()
  })
})
