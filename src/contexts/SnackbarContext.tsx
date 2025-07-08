import React, { createContext, useContext, useState, useCallback } from 'react';
import { SnackBar } from '@components/common';

type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface SnackbarContextData {
  showSnackbar: (message: string, type: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextData>({} as SnackbarContextData);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('info');

  const showSnackbar = useCallback((message: string, type: SnackbarType) => {
    setMessage(message);
    setType(type);
    setVisible(true);
  }, []);

  const hideSnackbar = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <SnackBar
        visible={visible}
        message={message}
        type={type}
        onDismiss={hideSnackbar}
      />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
