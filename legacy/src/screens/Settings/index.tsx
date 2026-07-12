import React from 'react'
import { Text } from 'react-native'
import SimpleHeader from '@components/headers/SimpleHeader'
import { BaseScreen } from '@components/layout'
import { Strings } from '@constants/strings'

const SettingsScreen = () => {
  return (
    <BaseScreen headerComponent={<SimpleHeader title={Strings.settings} />}>
      <Text>Settings Screen</Text>
    </BaseScreen>
  )
}

export default SettingsScreen
