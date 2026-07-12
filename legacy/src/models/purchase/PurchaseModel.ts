import { IPurchase, IPurchaseItem, PaymentMethod } from './types'

export class PurchaseModel implements IPurchase {
  id: number
  title: string
  date: Date
  data: string
  category: string
  price: number
  paymentMethod: PaymentMethod
  installments: number
  note: string
  paid: boolean
  currentInstallment: number
  installmentValue: number

  constructor(purchaseItem: IPurchaseItem, id?: number) {
    this.id = id || Date.now()
    this.title = purchaseItem.title
    this.date = purchaseItem.date
    this.data = this.formatDate(purchaseItem.date)
    this.category = purchaseItem.category
    this.price = purchaseItem.price
    this.paymentMethod = purchaseItem.paymentMethod
    this.installments = purchaseItem.installments
    this.note = purchaseItem.note
    this.paid = false
    this.currentInstallment = 1
    this.installmentValue = this.calculateInstallmentValue()
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private calculateInstallmentValue(): number {
    return this.price / this.installments
  }

  get isInstallment(): boolean {
    return this.installments > 1
  }

  get remainingInstallments(): number {
    return this.installments - this.currentInstallment
  }

  get totalPaid(): number {
    return this.installmentValue * this.currentInstallment
  }

  get remainingAmount(): number {
    return this.price - this.totalPaid
  }

  markAsPaid(): void {
    this.paid = true
  }

  payNextInstallment(): boolean {
    if (this.currentInstallment < this.installments) {
      this.currentInstallment++
      if (this.currentInstallment === this.installments) {
        this.paid = true
      }
      return true
    }
    return false
  }

  toJSON(): IPurchase {
    return {
      id: this.id,
      title: this.title,
      date: this.date,
      data: this.data,
      category: this.category,
      price: this.price,
      paymentMethod: this.paymentMethod,
      installments: this.installments,
      note: this.note,
      paid: this.paid,
      currentInstallment: this.currentInstallment,
      installmentValue: this.installmentValue,
    }
  }

  static fromJSON(data: IPurchase): PurchaseModel {
    const purchase = new PurchaseModel(
      {
        title: data.title,
        date: new Date(data.date),
        category: data.category,
        price: data.price,
        paymentMethod: data.paymentMethod,
        installments: data.installments,
        note: data.note,
      },
      data.id
    )

    purchase.paid = data.paid
    purchase.currentInstallment = data.currentInstallment
    return purchase
  }
}
