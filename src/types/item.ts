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
};

export type IItem = IPurchaseItem & {
  id: number;
  paid: boolean;
  currentInstallment: number;
};
