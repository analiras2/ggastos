import SettingsScreen from '@screens/Settings'
import { render } from '@testing-library/react-native'
import React from 'react'

describe('SettingsScreen', () => {
  it('Should render correcting', () => {
    const { getByText } = render(<SettingsScreen />)
    expect(getByText('Settings Screen')).toBeTruthy()
  })
})
