import { theme } from '@theme/index'

describe('Theme', () => {
  it('Should have all props needed', () => {
    expect(theme).toBeDefined()
    expect(theme.colors).toBeDefined()
    expect(theme.spacing).toBeDefined()
    expect(theme.typography).toBeDefined()
    expect(theme.platform).toBeDefined()
    expect(theme.borderRadius).toBeDefined()
  })

  it('Should include corrects colors', () => {
    expect(theme.colors.primary).toBeDefined()
    expect(theme.colors.background).toBeDefined()
    expect(theme.colors.text).toBeDefined()
    expect(theme.colors.secondary).toBeDefined()
    expect(theme.colors.textLight).toBeDefined()
  })
})
