import { ICategory } from './type'

export class Category {
  static getCategories = (): ICategory[] => [
    {
      id: 'income',
      title: 'Renda',
      color: '#60af50',
    },
    {
      id: 'investiment',
      title: 'Investimento',
      color: '#e8c140',
    },
    {
      id: 'food',
      title: 'Alimentação',
      color: '#7c4baf',
    },
    {
      id: 'expenses',
      title: 'Desp. Pessoais',
      color: '#EF5350',
    },
    {
      id: 'transport',
      title: 'Transporte',
      color: '#329ed1',
    },
    {
      id: 'recreation',
      title: 'Lazer',
      color: '#e84c78',
    },
    {
      id: 'education',
      title: 'Educação',
      color: '#f76d47',
    },
    {
      id: 'health',
      title: 'Saúde',
      color: '#22b5c9',
    },
    {
      id: 'home',
      title: 'Moradia',
      color: '#5e5dba',
    },
    {
      id: 'bussines',
      title: 'Negócios',
      color: '#69c3acff',
    },
  ]
}
