export interface IPurchaseItem {
  title: string;
  date: Date;
  category: string;
  price: number;
  paymentMethod: string;
  installments: number;
  note?: string;
}

export type IPurchaseSaveItem = IPurchaseItem & {
  price: string;
  installments: string;
};

export type IPurchase = IPurchaseItem & {
  id: number;
  data: string;
  paid: boolean;
  currentInstallment: number;
  installmentValue: number;
};
