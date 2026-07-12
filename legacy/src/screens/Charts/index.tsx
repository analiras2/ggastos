import React from 'react'
import { Text } from 'react-native'
import SimpleHeader from '@components/headers/SimpleHeader'
import { BaseScreen } from '@components/layout'
import { Strings } from '@constants/strings'

const ChartScreen = () => {
  return (
    <BaseScreen headerComponent={<SimpleHeader title={Strings.yearConsolidated} />}>
      <Text>Chart Screen</Text>
    </BaseScreen>
  )
}

export default ChartScreen
