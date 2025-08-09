import { Typography } from '@components/ui'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Colors } from '@theme/types'
import { StyleSheet } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'

interface BaseItem {
  id: string | number
  [key: string]: any
}

interface DropdownFormProps<T> {
  data: T[]
  placeholder: string
  valueField?: string
  label: string
  value: string
  onChange: (item: T) => void
}

export const DropdownForm = <T extends BaseItem>({
  data,
  placeholder,
  valueField = 'id',
  label,
  value,
  onChange,
}: DropdownFormProps<T>) => {
  const { colors } = useAppTheme()
  const styles = createStyles(colors, value !== '')

  return (
    <>
      <Typography variant="label" color={colors.label} style={styles.label}>
        {label}
      </Typography>
      <Dropdown
        style={styles.dropdown}
        data={data}
        labelField="title"
        valueField={valueField}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        itemContainerStyle={styles.dropdownItem}
        itemTextStyle={styles.dropdownItemText}
      />
    </>
  )
}

const createStyles = (colors: Colors, isSelected: boolean) =>
  StyleSheet.create({
    label: {
      opacity: isSelected ? 1 : 0,
    },
    dropdown: {
      borderBottomWidth: 0.2,
      borderBottomColor: colors.underline,
    },
    dropdownItem: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownItemText: {
      marginVertical: -8,
    },
  })
