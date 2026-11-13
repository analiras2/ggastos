import type { WalletSheetMode } from '@/features/wallet';
import type { CategoryBudget, DashboardData } from '@/features/dashboard/dashboard-data';
import type { UncategorizedSummary } from '@/features/dashboard/uncategorized';
import type { CategoryDetailsView } from '@/features/dashboard/format-category-details';

export type BannerState = 'ok' | 'pending' | 'error';

export interface CategoryDetailsPanel {
  visible: boolean;
  isLoading: boolean;
  isError: boolean;
  details: CategoryDetailsView | null;
  togglingEntryId: string | null;
  onToggleEntryStatus: (entryId: string, isUndo: boolean) => void;
}

export interface DashboardViewModel {
  data: DashboardData;
  wallet: {
    value: string;
    balanceCents: number;
    isNegative: boolean;
    isConfigured: boolean;
    isLoading: boolean;
  };
  walletSheetMode: WalletSheetMode | null;
  handleOpenWalletSheet: () => void;
  handleCloseWalletSheet: () => void;
  handleRequestCloseMonth: () => void;
  handleWalletSheetDone: () => void;
  loadStatus: 'loading' | 'error' | 'ready';
  canCloseMonth: boolean;
  categoryDetails: CategoryDetailsPanel;
  isSearchVisible: boolean;
  handleOpenSearch: () => void;
  handleCloseSearch: () => void;
  handleSelectSearchCategory: (categoryId: string) => void;
  isAddPlanVisible: boolean;
  isStatementImportVisible: boolean;
  categoryReviewBatchId: string | null;
  monthKey: string;
  isCurrentMonth: boolean;
  isMonthClosed: boolean;
  isClosingMonth: boolean;
  closeMonthBanner: { state: BannerState; message: string } | null;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleGoToCurrentMonth: () => void;
  handleSelectMonth: (monthKey: string) => void;
  handleOpenCategory: (category: CategoryBudget) => void;
  uncategorized: UncategorizedSummary | null;
  handleOpenUncategorized: () => void;
  handleCloseCategoryDetails: () => void;
  handleAddPlan: () => void;
  handleCloseAddPlan: () => void;
  handleOpenStatementImport: () => void;
  handleCloseStatementImport: () => void;
  handleOpenCategoryReview: (batchId: string) => void;
  handleCloseCategoryReview: () => void;
  handleCloseMonth: () => void;
}
