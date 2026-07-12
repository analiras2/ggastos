import { Month } from './types'

export class MonthModel {
  static getMonths = (): Month[] => [
    { id: 1, name: 'Janeiro', shortName: 'Jan' },
    { id: 2, name: 'Fevereiro', shortName: 'Fev' },
    { id: 3, name: 'Março', shortName: 'Mar' },
    { id: 4, name: 'Abril', shortName: 'Abr' },
    { id: 5, name: 'Maio', shortName: 'Mai' },
    { id: 6, name: 'Junho', shortName: 'Jun' },
    { id: 7, name: 'Julho', shortName: 'Jul' },
    { id: 8, name: 'Agosto', shortName: 'Ago' },
    { id: 9, name: 'Setembro', shortName: 'Set' },
    { id: 10, name: 'Outubro', shortName: 'Out' },
    { id: 11, name: 'Novembro', shortName: 'Nov' },
    { id: 12, name: 'Dezembro', shortName: 'Dez' },
  ]

  static getMonthById = (id: number): Month | undefined => {
    return this.getMonths().find(month => month.id === id)
  }

  static getCurrentMonth = (): Month => {
    const currentMonthId = new Date().getMonth() + 1
    return this.getMonthById(currentMonthId) || this.getMonths()[0]
  }

  static getCurrentYear = (): number => {
    return new Date().getFullYear()
  }

  static getYearRange(startYear: number): number[] {
    const endYear = this.getCurrentYear()
    if (!startYear || startYear > endYear) {
      return [endYear]
    }

    return Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index)
  }
}
