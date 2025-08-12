import React from 'react'
import { render } from '@testing-library/react-native'
import ChartsScreen from './index'

describe('ChartsScreen', () => {
  it('Should render correcting', () => {
    const { getByText } = render(<ChartsScreen />)
    expect(getByText('Chart Screen')).toBeTruthy()
  })
})
