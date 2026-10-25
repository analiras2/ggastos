import { useCallback, useMemo, useState } from 'react';

import {
  pruneSelection,
  selectAllIds,
  selectRangeIds,
  sumSelectedCents,
  toggleSelection,
  type SelectableAmount,
  type SelectionSet,
} from '@/features/statements/selection-state';

export interface SelectionViewModel {
  isSelectionMode: boolean;
  selectedIds: SelectionSet;
  selectedCount: number;
  selectedTotalCents: number;
  isAllSelected: boolean;
  isSelected: (id: string) => boolean;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggle: (id: string) => void;
  toggleRange: (id: string) => void;
  selectAll: () => void;
  clear: () => void;
}

const EMPTY_SELECTION: SelectionSet = new Set();

export function useSelectionViewModel(items: readonly SelectableAmount[]): SelectionViewModel {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [rawSelection, setRawSelection] = useState<SelectionSet>(EMPTY_SELECTION);
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  // Rows that were categorized (or deleted) elsewhere drop out of the selection without an effect.
  const selectedIds = useMemo(() => pruneSelection(rawSelection, itemIds), [rawSelection, itemIds]);
  const selectedTotalCents = useMemo(() => sumSelectedCents(items, selectedIds), [items, selectedIds]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const clear = useCallback(() => {
    setRawSelection(EMPTY_SELECTION);
    setAnchorId(null);
  }, []);

  const enterSelectionMode = useCallback(() => setIsSelectionMode(true), []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    clear();
  }, [clear]);

  // Functional update keeps the callback identity stable, so memoized rows are not re-rendered.
  const toggle = useCallback((id: string) => {
    setRawSelection((previous) => toggleSelection(previous, id));
    setAnchorId(id);
  }, []);

  const toggleRange = useCallback(
    (id: string) => {
      setRawSelection(selectRangeIds(selectedIds, itemIds, anchorId, id));
      setAnchorId(id);
    },
    [anchorId, itemIds, selectedIds]
  );

  const selectAll = useCallback(() => {
    setRawSelection(selectAllIds(itemIds));
    setAnchorId(null);
  }, [itemIds]);

  return {
    isSelectionMode,
    selectedIds,
    selectedCount: selectedIds.size,
    selectedTotalCents,
    isAllSelected: itemIds.length > 0 && selectedIds.size === itemIds.length,
    isSelected,
    enterSelectionMode,
    exitSelectionMode,
    toggle,
    toggleRange,
    selectAll,
    clear,
  };
}
