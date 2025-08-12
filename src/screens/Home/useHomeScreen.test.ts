import { Category } from '@models/category'
import { useAppNavigation } from '@navigation/hooks/useAppNavigation'
import { ROUTES } from '@navigation/routes'
import { act, renderHook } from '@testing-library/react-hooks'
import { useHomeScreen } from './useHomeScreen'

jest.mock('@navigation/hooks/useAppNavigation', () => ({
  useAppNavigation: jest.fn(),
}))

jest.mock('@models/category', () => ({
  Category: {
    getCategories: jest.fn(),
  },
}))

describe('useHomeScreen', () => {
  const mockCategories = [
    { id: '1', title: 'Category 1', icon: 'cart', color: '#FF0000' },
    { id: '2', title: 'Category 2', icon: 'home', color: '#00FF00' },
  ]

  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAppNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    })
    ;(Category.getCategories as jest.Mock).mockReturnValue(mockCategories)
  })

  it('should return categories with expected and spent values', () => {
    const { result } = renderHook(() => useHomeScreen())

    expect(result.current.categories).toHaveLength(mockCategories.length)
    result.current.categories.forEach(category => {
      expect(category).toHaveProperty('totalExpected')
      expect(category).toHaveProperty('totalSpent')
      expect(typeof category.totalExpected).toBe('number')
      expect(typeof category.totalSpent).toBe('number')
    })
  })

  it('should navigate to category details when handleCategoryPress is called', () => {
    const { result } = renderHook(() => useHomeScreen())

    const category = mockCategories[0]
    act(() => {
      result.current.handleCategoryPress(category)
    })

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CATEGORY_DETAILS, { category })
  })

  it('should toggle new purchase modal visibility', () => {
    const { result } = renderHook(() => useHomeScreen())

    expect(result.current.showNewPurchaseModal).toBe(false)

    act(() => {
      result.current.openNewPurchaseModal()
    })
    expect(result.current.showNewPurchaseModal).toBe(true)

    act(() => {
      result.current.closeNewPurchaseModal()
    })
    expect(result.current.showNewPurchaseModal).toBe(false)
  })

  it('should close modal when purchase is saved', () => {
    const { result } = renderHook(() => useHomeScreen())

    act(() => {
      result.current.openNewPurchaseModal()
    })

    const mockPurchase = {
      title: 'Test Purchase',
      amount: 100,
      date: new Date(),
      categoryId: '1',
    }

    act(() => {
      result.current.handleSavePurchase(mockPurchase)
    })

    expect(result.current.showNewPurchaseModal).toBe(false)
  })
})
