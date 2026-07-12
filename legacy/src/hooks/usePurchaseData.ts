import { useCallback, useEffect, useState } from 'react'
import { IPurchaseItem } from '@/models/purchase/types'
import { useDateContext } from '@contexts/DateContext'
import { useSnackbar } from '@contexts/SnackbarContext'
import { PurchaseModel } from '@models/purchase/PurchaseModel'
import { PurchaseService } from '@services/PurchaseService'

export const usePurchaseData = () => {
  const { dateSelection } = useDateContext()
  const { showSnackbar } = useSnackbar()
  const [purchases, setPurchases] = useState<PurchaseModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const purchaseService = new PurchaseService()

  const loadPurchases = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await purchaseService.getPurchasesByMonth(
        dateSelection.selectedYear,
        dateSelection.selectedMonth.id
      )
      setPurchases(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      showSnackbar({ message: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateSelection.selectedYear, dateSelection.selectedMonth.id])

  const savePurchase = async (purchaseItem: IPurchaseItem): Promise<boolean> => {
    try {
      setLoading(true)
      const newPurchase = await purchaseService.savePurchase(
        purchaseItem,
        dateSelection.selectedYear,
        dateSelection.selectedMonth.id
      )

      setPurchases(prev => [...prev, newPurchase])
      showSnackbar({ message: 'Compra salva com sucesso!', type: 'success' })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar compra'
      setError(errorMessage)
      showSnackbar({ message: errorMessage, type: 'error' })
      return false
    } finally {
      setLoading(false)
    }
  }

  const deletePurchase = async (purchaseId: number): Promise<boolean> => {
    try {
      const success = await purchaseService.deletePurchase(
        purchaseId,
        dateSelection.selectedYear,
        dateSelection.selectedMonth.id
      )

      if (success) {
        setPurchases(prev => prev.filter(p => p.id !== purchaseId))
        showSnackbar({ message: 'Compra removida com sucesso!', type: 'success' })
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover compra'
      setError(errorMessage)
      showSnackbar({ message: errorMessage, type: 'error' })
      return false
    }
  }

  useEffect(() => {
    loadPurchases()
  }, [loadPurchases])

  return {
    purchases,
    loading,
    error,
    savePurchase,
    deletePurchase,
    refetch: loadPurchases,
  }
}
