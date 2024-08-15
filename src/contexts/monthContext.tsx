import React, {createContext, useContext, useEffect, useState} from 'react';
import {MonthModel} from '~models/month';

interface MonthContextType {
  monthModel: MonthModel;
  currentMonth: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  currentYear: number;
  setCurrentYear: React.Dispatch<React.SetStateAction<number>>;
  updateCategories: () => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export const useMonthContext = () => {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useMonthContext must be used within a MonthProvider');
  }
  return context;
};

export const MonthProvider = ({children}: {children: React.ReactNode}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const dateId = `${currentMonth + 1}_${currentYear}`;

  const [monthModel, setMonthModel] = useState<MonthModel>(
    new MonthModel(dateId),
  );

  useEffect(() => {
    const fetchData = async () => {
      const model = new MonthModel(dateId);
      await model.getCategories();
      setMonthModel(model);
    };
    fetchData();
  }, [dateId]);

  const updateCategories = async () => {
    const updatedModel = new MonthModel(dateId);
    await updatedModel.getCategories();
    setMonthModel(updatedModel);
  };

  return (
    <MonthContext.Provider
      value={{
        monthModel,
        currentMonth,
        setCurrentMonth,
        currentYear,
        setCurrentYear,
        updateCategories,
      }}>
      {children}
    </MonthContext.Provider>
  );
};
