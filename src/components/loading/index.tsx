import React from 'react';
import {View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Colors} from '~constants/index';

const Loading = () => (
  <View style={{flex: 1, justifyContent: 'center'}}>
    <ActivityIndicator animating={true} color={Colors.primary} size="large" />
  </View>
);

export default Loading;
