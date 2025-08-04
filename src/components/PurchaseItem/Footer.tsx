import { LabeledItem } from '@components/LabeledItem'
import { ValueFormat } from '@components/ui/Typography/types'
import { Strings } from '@constants/strings'
import { IPurchase, PaymentMethod } from '@models/purchase/type'
import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Typography } from '../ui'

interface HeaderProps {
  data: IPurchase
}

export const Footer: React.FC<HeaderProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      <LabeledItem
        label={Strings.payment}
        value={data.paymentMethod}
        variant="body"
        align="left"
      />
      {data.paymentMethod === PaymentMethod.CREDIT && (
        <LabeledItem
          label={Strings.installment}
          value={`${data.currentInstallment}/${data.installments}`}
          variant="body"
          flex={2}
        />
      )}
      <Typography
        format={ValueFormat.CURRENCY}
        style={styles.value}
        align="right"
      >
        {data.installmentValue}
      </Typography>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  value: {
    flex: 1,
    alignSelf: 'center',
  },
})
