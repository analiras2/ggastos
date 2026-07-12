import React, { createContext, ReactNode, useContext, useState } from 'react'
import { MonthModel } from '@models/month/MonthModel'
import { DateSelection, Month } from '@models/month/types'

interface DateContextType {
  dateSelection: DateSelection
  setSelectedMonth: (month: Month) => void
  setSelectedYear: (year: number) => void
  setDateSelection: (selection: DateSelection) => void
}

const DateContext = createContext<DateContextType | undefined>(undefined)

interface DateProviderProps {
  children: ReactNode
}

export const DateProvider: React.FC<DateProviderProps> = ({ children }) => {
  const [dateSelection, setDateSelection] = useState<DateSelection>({
    selectedMonth: MonthModel.getCurrentMonth(),
    selectedYear: MonthModel.getCurrentYear(),
  })

  const setSelectedMonth = (month: Month) => {
    setDateSelection(prev => ({ ...prev, selectedMonth: month }))
  }

  const setSelectedYear = (year: number) => {
    setDateSelection(prev => ({ ...prev, selectedYear: year }))
  }

  return (
    <DateContext.Provider
      value={{
        dateSelection,
        setSelectedMonth,
        setSelectedYear,
        setDateSelection,
      }}
    >
      {children}
    </DateContext.Provider>
  )
}

export const useDateContext = (): DateContextType => {
  const context = useContext(DateContext)
  if (!context) {
    throw new Error('useDateContext must be used within a DateProvider')
  }
  return context
}
