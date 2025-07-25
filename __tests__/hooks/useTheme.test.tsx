import { NavigationContainer } from '@react-navigation/native'
import { renderHook } from '@testing-library/react-hooks'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { theme } from '@theme/index'
import React, { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <NavigationContainer theme={theme as any}>{children}</NavigationContainer>
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
