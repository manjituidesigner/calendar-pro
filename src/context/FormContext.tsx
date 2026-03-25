import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormContextType {
  isFormVisible: boolean;
  openForm: () => void;
  closeForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <FormContext.Provider value={{ isFormVisible, openForm: () => setIsFormVisible(true), closeForm: () => setIsFormVisible(false) }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error('useForm must be used within FormProvider');
  return context;
};
