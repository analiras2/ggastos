import React, { createContext, useCallback, useContext, useState } from 'react'
import { SnackBar } from '@components/common'
import { SnackbarType } from '@components/common/SnackBar/types'

interface SnackbarState {
  visible: boolean
  message: string
  type: SnackbarType
}

interface ShowSnackbarParams {
  message: string
  type: SnackbarType
}

interface SnackbarContextData {
  showSnackbar: ({ message, type }: ShowSnackbarParams) => void
}

const SnackbarContext = createContext<SnackbarContextData>({} as SnackbarContextData)

const INITIAL_STATE: SnackbarState = {
  visible: false,
  message: '',
  type: 'info',
}

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SnackbarState>(INITIAL_STATE)

  const showSnackbar = useCallback(({ message, type }: ShowSnackbarParams) => {
    setState({
      visible: true,
      message,
      type,
    })
  }, [])

  const hideSnackbar = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      visible: false,
    }))
  }, [])

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <SnackBar
        visible={state.visible}
        message={state.message}
        type={state.type}
        onDismiss={hideSnackbar}
      />
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}
