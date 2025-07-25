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

    return Array.from(
      { length: endYear - startYear + 1 },
      (_, index) => startYear + index
    )
  }
}
