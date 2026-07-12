import React, { ReactNode } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { renderHook } from '@testing-library/react-hooks'
import { theme } from '@theme/index'
import { CustomTheme } from '../types'
import { useAppTheme } from './useAppTheme'

const wrapper = ({ children }: { children: ReactNode }) => (
  <NavigationContainer theme={theme as CustomTheme}>{children}</NavigationContainer>
)

describe('useTheme Hook', () => {
  it('Should return correct theme', () => {
    const { result } = renderHook(() => useAppTheme(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current.colors).toBeDefined()
    expect(result.current.colors.primary).toBe(theme.colors.primary)
    expect(result.current.platform).toBeDefined()
  })
})
