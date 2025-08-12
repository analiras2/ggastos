import { Months } from '@constants/dates'
import { Month } from '..'

export class DateUtils {
  static getCurrentMonth(): Month {
    const currentMonthId = new Date().getMonth()
    return Months[currentMonthId]
  }

  static getCurrentYear(): number {
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

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}
