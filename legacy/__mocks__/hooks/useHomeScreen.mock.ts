export const useHomeScreen = jest.fn().mockReturnValue({
  categories: [],
  showNewPurchaseModal: false,
  handleCategoryPress: jest.fn(),
  handleSavePurchase: jest.fn(),
  openNewPurchaseModal: jest.fn(),
  closeNewPurchaseModal: jest.fn(),
})
