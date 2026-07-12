import React, { useCallback, useEffect } from 'react'
import { BackHandler, FlatList, ListRenderItem, Modal, StyleSheet, View } from 'react-native'
import { RoundedView } from '@components/RoundedView'
import { theme } from '@theme/index'
import { Typography } from '../Typography'

export interface SelectorItem {
  id: string | number
  title: string | number

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface SelectorProps<T extends SelectorItem> {
  visible: boolean
  title: string
  items: T[]
  renderItem: ListRenderItem<T>
  onDismiss: () => void
}

export function Selector<T extends SelectorItem>({
  visible,
  title,
  items,
  renderItem,
  onDismiss,
}: SelectorProps<T>) {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onDismiss()
        return true
      }
      return false
    })

    return () => backHandler.remove()
  }, [visible, onDismiss])

  const keyExtractor = useCallback((item: T) => item.id.toString(), [])

  const renderDivider = useCallback(() => <View style={styles.divider} />, [])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <RoundedView>
            <Typography variant="header">{title}</Typography>
          </RoundedView>
          <View style={styles.body}>
            <FlatList
              data={items}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ItemSeparatorComponent={renderDivider}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  container: { flex: 1, backgroundColor: theme.colors.modalBackground },
  content: { alignItems: 'center', marginTop: 140 },
  body: {
    width: 350,
    maxHeight: 500,
    backgroundColor: theme.colors.background,
    borderRadius: 6,
    paddingVertical: 20,
    marginTop: 8,
    ...theme.shadowStyle,
  },
})
