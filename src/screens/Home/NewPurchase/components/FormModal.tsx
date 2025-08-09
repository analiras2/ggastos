import { RoundedView, Typography } from '@components/index'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Modal, View } from 'react-native'
import React from 'react'
import { createStyles } from '../styles'

interface FormModalProps {
  isVisible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer: React.ReactNode
}

export const FormModal: React.FC<FormModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  footer,
}) => {
  const theme = useAppTheme()
  const styles = createStyles(theme)

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <RoundedView style={styles.title}>
          <Typography variant="header">{title}</Typography>
        </RoundedView>
        <View style={styles.form}>
          {children}
          <View style={styles.footer}>{footer}</View>
        </View>
      </View>
    </Modal>
  )
}
