import { Typography } from '@components/ui'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { TouchableOpacity, View } from 'react-native'
import React from 'react'
import { FieldView } from '../FieldView'
import { styles } from './styles'
import { CategoryItemProps } from './types'

export const CategoryItem: React.FC<CategoryItemProps> = ({
  data,
  onPress,
}) => {
  const theme = useAppTheme()
  const st = styles(theme)

  return (
    <TouchableOpacity
      style={st.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Typography variant="title" bold color={data.color} style={st.title}>
        {data.name}
      </Typography>
      <View style={st.data}>
        <FieldView
          title="Gasto Previsto"
          value={data.totalExpected}
          color={theme.colors.label}
        />
        <FieldView
          title="Gasto Atual"
          value={data.totalSpent}
          color={theme.colors.label}
        />
      </View>
    </TouchableOpacity>
  )
}
