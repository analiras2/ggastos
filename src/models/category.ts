import {ICategoryData, IItem} from '~types/category';

export class Category {
  id: string;
  name: string;
  color: string;
  dateId: string;
  items: IItem[];
  totalSpent: number;
  totalExpected: number;

  constructor(data: ICategoryData, dateId: string) {
    this.id = data.id;
    this.name = data.name;
    this.color = data.color;
    this.dateId = dateId;
    this.items = [];
    this.totalSpent = 0;
    this.totalExpected = 0;

    this.getTotalSpent();
    this.getTotalExpected();
  }

  getTotalSpent(): void {
    this.totalSpent = this.items.reduce((prevVal, item) => {
      if (item.paid) {
        return prevVal + item.price;
      }
      return prevVal;
    }, 0);
  }

  getTotalExpected(): void {
    this.totalExpected = this.items.reduce(
      (prevVal, item) => prevVal + item.price,
      0,
    );
  }

  static getCategories: ICategoryData[] = [
    {
      id: 'income',
      name: 'Renda',
      color: '#60af50',
    },
    {
      id: 'investiment',
      name: 'Investimento',
      color: '#e8c140',
    },
    {
      id: 'food',
      name: 'Alimentação',
      color: '#7c4baf',
    },
    {
      id: 'expenses',
      name: 'Desp. Pessoais',
      color: '#EF5350',
    },
    {
      id: 'transport',
      name: 'Transporte',
      color: '#329ed1',
    },
    {
      id: 'recreation',
      name: 'Lazer',
      color: '#e84c78',
    },
    {
      id: 'education',
      name: 'Educação',
      color: '#f76d47',
    },
    {
      id: 'health',
      name: 'Saúde',
      color: '#22b5c9',
    },
    {
      id: 'home',
      name: 'Moradia',
      color: '#5e5dba',
    },
  ];
}
