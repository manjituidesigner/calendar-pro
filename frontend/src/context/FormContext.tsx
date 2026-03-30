import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormContextType {
  isFormVisible: boolean;
  openForm: (date?: Date) => void;
  closeForm: () => void;
  selectedDate: Date | null;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const openForm = (date?: Date) => {
    if (date && date instanceof Date) setSelectedDate(date);
    else setSelectedDate(new Date());
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setSelectedDate(null);
  };

  return (
    <FormContext.Provider value={{ isFormVisible, openForm, closeForm, selectedDate, refreshTrigger, triggerRefresh }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error('useForm must be used within FormProvider');
  return context;
};
