export enum PaymentMethod {
  CREDIT = 'C. Crédito',
  PIX = 'Pix',
  DEBIT = 'C. Débito',
  CASH = 'Dinheiro',
}

export interface IPurchaseItem {
  title: string
  date: Date
  category: string
  price: number
  paymentMethod: PaymentMethod
  installments: number
  note?: string
}

export type IPurchaseSaveItem = IPurchaseItem & {
  price: string
  installments: string
}

export type IPurchase = IPurchaseItem & {
  id: number
  data: string
  paid: boolean
  currentInstallment: number
  installmentValue: number
}
