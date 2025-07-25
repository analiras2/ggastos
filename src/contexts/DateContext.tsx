import { DateSelection, Month } from '@common/index'
import { DateUtils } from '@common/utils/dateUtils'
import React, { createContext, useCallback, useContext, useState } from 'react'

interface DateContextData {
  dateSelection: DateSelection
  updateMonth: (month: Month) => void
  updateYear: (year: number) => void
}

const DateContext = createContext<DateContextData | undefined>(undefined)

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dateSelection, setDateSelection] = useState<DateSelection>({
    selectedMonth: DateUtils.getCurrentMonth(),
    selectedYear: DateUtils.getCurrentYear(),
  })

  const updateMonth = useCallback((month: Month) => {
    setDateSelection((prev) => ({
      ...prev,
      selectedMonth: month,
    }))
  }, [])

  const updateYear = useCallback((year: number) => {
    setDateSelection((prev) => ({
      ...prev,
      selectedYear: year,
    }))
  }, [])

  return (
    <DateContext.Provider value={{ dateSelection, updateMonth, updateYear }}>
      {children}
    </DateContext.Provider>
  )
}

export const useDateContext = () => {
  const context = useContext(DateContext)
  if (!context) {
    throw new Error('useDateContext must be used within a DateProvider')
  }
  return context
}
