interface IItem {
  id: number;
  title: string;
  dateId: string;
  category: string;
  paid: boolean;
  price: number;
  installments: number;
  currentInstallment: number;
}

export interface ICategoryData {
  id: string;
  name: string;
  color: string;
}
