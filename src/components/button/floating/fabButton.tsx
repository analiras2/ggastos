import React from 'react';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as St from './styles';
import {Colors} from '~constants/index';

type Props = {
  onPress: () => void;
};

const FabButton = ({onPress}: Props) => {
  return (
    <St.AnimationContainer>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Icon name="add" size={30} color={Colors.icon} />
      </TouchableOpacity>
    </St.AnimationContainer>
  );
};

export default FabButton;
