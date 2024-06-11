import React, {createContext, useState, useContext} from 'react';

interface DateContextType {
  currentMonth: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  currentYear: number;
  setCurrentYear: React.Dispatch<React.SetStateAction<number>>;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const useDateContext = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDateContext must be used within a DateProvider');
  }
  return context;
};

export const DateProvider = ({children}: {children: React.ReactNode}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  return (
    <DateContext.Provider
      value={{currentMonth, setCurrentMonth, currentYear, setCurrentYear}}>
      {children}
    </DateContext.Provider>
  );
};
