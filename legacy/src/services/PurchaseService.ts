import { IPurchase, IPurchaseItem } from '@/models/purchase/types'
import { PurchaseModel } from '@models/purchase/PurchaseModel'
import { StorageService } from './StorageService'

export class PurchaseService {
  private storageService: StorageService

  constructor() {
    this.storageService = StorageService.getInstance()
  }

  private getStorageKey(year: number, month: number): string {
    return `purchases_${year}_${month.toString().padStart(2, '0')}`
  }

  private createInstallmentPurchase(
    baseItem: IPurchaseItem,
    installmentNumber: number,
    totalInstallments: number,
    installmentDate: Date
  ): IPurchaseItem {
    return {
      ...baseItem,
      price: baseItem.price / totalInstallments,
      date: installmentDate,
      currentInstallment: installmentNumber,
      installmentValue: baseItem.price / totalInstallments,
    }
  }

  async savePurchase(purchaseItem: IPurchaseItem): Promise<PurchaseModel[]> {
    try {
      const purchaseDate = new Date(purchaseItem.date)
      const installments = purchaseItem.installments || 1
      const savedPurchases: PurchaseModel[] = []

      // Criar uma compra para cada parcela
      for (let i = 1; i <= installments; i++) {
        const installmentDate = new Date(purchaseDate)
        installmentDate.setMonth(purchaseDate.getMonth() + (i - 1))

        const year = installmentDate.getFullYear()
        const month = installmentDate.getMonth()

        const installmentPurchase = this.createInstallmentPurchase(
          purchaseItem,
          i,
          installments,
          installmentDate
        )

        const purchase = new PurchaseModel(installmentPurchase)
        const existingPurchases = await this.getPurchasesByMonth(year, month)

        existingPurchases.push(purchase)

        const key = this.getStorageKey(year, month)
        await this.storageService.save(
          key,
          existingPurchases.map(p => p.toJSON())
        )

        savedPurchases.push(purchase)
      }

      return savedPurchases
    } catch (error) {
      throw new Error(`Erro ao salvar compra: ${error}`)
    }
  }

  async getPurchasesByMonth(year: number, month: number): Promise<PurchaseModel[]> {
    try {
      const key = this.getStorageKey(year, month)
      const data = await this.storageService.load<IPurchase[]>(key)

      if (!data) return []

      return data.map(purchase => PurchaseModel.fromJSON(purchase))
    } catch (error) {
      throw new Error(`Erro ao buscar compras: ${error}`)
    }
  }

  async updatePurchase(
    purchaseId: number,
    year: number,
    month: number,
    updates: Partial<IPurchase>
  ): Promise<PurchaseModel | null> {
    try {
      const purchases = await this.getPurchasesByMonth(year, month)
      const purchaseIndex = purchases.findIndex(p => p.id === purchaseId)

      if (purchaseIndex === -1) return null

      Object.assign(purchases[purchaseIndex], updates)

      const key = this.getStorageKey(year, month)
      await this.storageService.save(
        key,
        purchases.map(p => p.toJSON())
      )

      return purchases[purchaseIndex]
    } catch (error) {
      throw new Error(`Erro ao atualizar compra: ${error}`)
    }
  }

  async deletePurchase(purchaseId: number, year: number, month: number): Promise<boolean> {
    try {
      const purchases = await this.getPurchasesByMonth(year, month)
      const filteredPurchases = purchases.filter(p => p.id !== purchaseId)

      if (filteredPurchases.length === purchases.length) return false

      const key = this.getStorageKey(year, month)
      await this.storageService.save(
        key,
        filteredPurchases.map(p => p.toJSON())
      )

      return true
    } catch (error) {
      throw new Error(`Erro ao deletar compra: ${error}`)
    }
  }

  async getPurchasesByCategory(
    year: number,
    month: number,
    categoryId: string
  ): Promise<PurchaseModel[]> {
    try {
      const allPurchases = await this.getPurchasesByMonth(year, month)
      return allPurchases.filter(purchase => purchase.category === categoryId)
    } catch (error) {
      throw new Error(`Erro ao buscar compras por categoria: ${error}`)
    }
  }

  async getAllInstallments(purchaseId: number): Promise<PurchaseModel[]> {
    try {
      const baseId = Math.floor(purchaseId / 1000) * 1000
      const allInstallments: PurchaseModel[] = []

      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 6)

      for (let i = 0; i < 12; i++) {
        const currentDate = new Date(startDate)
        currentDate.setMonth(currentDate.getMonth() + i)
        
        const purchases = await this.getPurchasesByMonth(
          currentDate.getFullYear(),
          currentDate.getMonth()
        )

        const installments = purchases.filter(p => 
          Math.floor(p.id / 1000) === Math.floor(baseId / 1000)
        )

        allInstallments.push(...installments)
      }

      return allInstallments.sort((a, b) => 
        a.currentInstallment - b.currentInstallment
      )
    } catch (error) {
      throw new Error(`Erro ao buscar parcelas: ${error}`)
    }
  }

  async getMonthlyStats(year: number, month: number) {
    try {
      const purchases = await this.getPurchasesByMonth(year, month)

      const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.price, 0)
      const totalByCategory = purchases.reduce(
        (acc, purchase) => {
          acc[purchase.category] = (acc[purchase.category] || 0) + purchase.price
          return acc
        },
        {} as Record<string, number>
      )

      const installmentPurchases = purchases.filter(p => p.installments > 1)
      const singlePurchases = purchases.filter(p => p.installments === 1)

      return {
        totalSpent,
        totalByCategory,
        totalPurchases: purchases.length,
        paidPurchases: purchases.filter(p => p.paid).length,
        pendingPurchases: purchases.filter(p => !p.paid).length,
        installmentPurchases: installmentPurchases.length,
        singlePurchases: singlePurchases.length,
        totalInstallmentsValue: installmentPurchases.reduce((sum, p) => sum + p.price, 0),
        totalSingleValue: singlePurchases.reduce((sum, p) => sum + p.price, 0),
      }
    } catch (error) {
      throw new Error(`Erro ao calcular estatísticas: ${error}`)
    }
  }

  async updateAllInstallments(
    purchaseId: number,
    updates: Partial<IPurchase>
  ): Promise<PurchaseModel[]> {
    try {
      const allInstallments = await this.getAllInstallments(purchaseId)
      const updatedInstallments: PurchaseModel[] = []

      for (const installment of allInstallments) {
        const year = new Date(installment.date).getFullYear()
        const month = new Date(installment.date).getMonth()

        const updated = await this.updatePurchase(
          installment.id,
          year,
          month,
          updates
        )

        if (updated) {
          updatedInstallments.push(updated)
        }
      }

      return updatedInstallments
    } catch (error) {
      throw new Error(`Erro ao atualizar parcelas: ${error}`)
    }
  }
}
