import React from 'react'
import { render } from '@testing-library/react-native'
import SettingsScreen from './index'

describe('SettingsScreen', () => {
  it('Should render correcting', () => {
    const { getByText } = render(<SettingsScreen />)
    expect(getByText('Settings Screen')).toBeTruthy()
  })
})
