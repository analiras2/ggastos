import HomeScreen from '@screens/Home'
import { render } from '@testing-library/react-native'
import React from 'react'

describe('HomeScreen', () => {
  it('Should render correcting', () => {
    const { getByText } = render(<HomeScreen />)
    expect(getByText('G-Gastos')).toBeTruthy()
  })
})
