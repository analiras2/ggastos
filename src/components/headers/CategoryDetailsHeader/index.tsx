import React, { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Typography } from '@components/common'
import { LabeledItem } from '@components/LabeledItem'
import { Strings } from '@constants/strings'
import { ICategoryBalance } from '@models/category'
import Icon from '@react-native-vector-icons/ionicons'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { createStyles } from './styles'

interface CategoryDetailsHeaderProps {
  title: string
  balance: ICategoryBalance
  color: string
  onBackPress: () => void
  testID?: string
}

const ICON_SIZE = 24

export const CategoryDetailsHeader = memo<CategoryDetailsHeaderProps>(
  ({ title, balance, color, onBackPress, testID = 'category-details-header' }) => {
    const { colors } = useAppTheme()
    const styles = createStyles(colors, color)

    const renderBackButton = (isHidden?: boolean) => (
      <TouchableOpacity
        onPress={onBackPress}
        style={isHidden && styles.hiddenButton}
        testID={`${testID}-back-button${isHidden ? 'hidden' : ''}`}
        disabled={isHidden}
      >
        <Icon name="arrow-back" size={ICON_SIZE} color={colors.icon} />
      </TouchableOpacity>
    )

    const renderBalanceSection = () => (
      <View style={styles.balance}>
        <LabeledItem
          testID={`${testID}-expected-balance`}
          textColor={colors.textLight}
          label={Strings.expectedBalance}
          value={balance.expected}
          variant="title"
        />
        <LabeledItem
          testID={`${testID}-current-balance`}
          textColor={colors.textLight}
          label={Strings.currentBalance}
          value={balance.current}
          variant="header"
        />
      </View>
    )

    return (
      <View style={styles.container} testID={testID}>
        <View style={styles.title}>
          {renderBackButton()}
          <Typography
            variant="header"
            bold
            color={colors.title}
            align="center"
            marginBottom={8}
            testID={`${testID}-title`}
          >
            {title}
          </Typography>
          {renderBackButton(true)}
        </View>
        {renderBalanceSection()}
      </View>
    )
  }
)

CategoryDetailsHeader.displayName = 'CategoryDetailsHeader'
