import {ICategoryData} from '~types/category';
import {CategoryModel} from './category';

export class MonthModel {
  id: string;
  categories: CategoryModel[];
  totalBalance: number;
  currentBalance: number;
  totalExpected: number;

  constructor(dateId: string) {
    this.id = dateId;
    this.categories = [];
    this.totalBalance = 0;
    this.currentBalance = 0;
    this.totalExpected = 0;

    this.getCategories();
  }

  getCategories(): void {
    this.categories = CategoryModel.getCategories.map(
      (item: ICategoryData) => new CategoryModel(item, this.id),
    );
    this.getTotalBalance();
    this.getTotalExpected();
  }

  getTotalBalance(): void {
    this.totalBalance = this.categories.reduce((prevVal, category) => {
      if (category.id === 'income') {
        return prevVal + category.totalSpent;
      }
      return prevVal;
    }, 0);
  }

  getTotalExpected(): void {
    this.totalExpected = this.categories.reduce((prevVal, category) => {
      if (category.id === 'income') {
        return prevVal + category.totalExpected;
      }
      return prevVal - category.totalExpected;
    }, 0);

    this.getCurrentBalance();
  }

  getCurrentBalance(): void {
    this.currentBalance = this.categories.reduce((prevVal, category) => {
      if (category.id === 'income') {
        return prevVal;
      }
      return prevVal - category.totalSpent;
    }, this.totalBalance);
  }
}
