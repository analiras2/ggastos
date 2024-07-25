import AsyncStorageManager from '../service/asyncStorageManager';
import {ICategoryData} from '~types/category';
import {IItem} from '~types/item';
import {ItemModel} from '.';

export class CategoryModel {
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
  }

  async getItems(): Promise<void> {
    const storageManager = new AsyncStorageManager(ItemModel.storageKey);
    const allItems: IItem[] = await storageManager.getItems();

    this.items = allItems.filter(item => {
      const itemDate = new Date(item.date);
      const itemDateId = `${itemDate.getMonth() + 1}_${itemDate.getFullYear()}`;

      return itemDateId === this.dateId && item.category === this.id;
    });

    this.getTotalSpent();
    this.getTotalExpected();
  }

  getTotalSpent(): void {
    this.totalSpent = this.items.reduce((prevVal, item) => {
      if (item.paid && item.category === this.id) {
        return prevVal + item.price;
      }
      return prevVal;
    }, 0);
  }

  getTotalExpected(): void {
    this.totalExpected = this.items.reduce((prevVal, item) => {
      if (item.category === this.id) {
        return prevVal + item.installmentValue;
      }
      return prevVal;
    }, 0);
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
