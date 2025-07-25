export interface Month {
  id: number
  name: string
  shortName: string
}

export interface DateSelection {
  selectedMonth: Month
  selectedYear: number
}
