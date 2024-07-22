import {Dimensions, Platform} from 'react-native';
import Colors from './colors';

const {width, height} = Dimensions.get('window');

const shadowStyle = {
  elevation: '4',
  shadowColor: Colors.shadow,
  shadowOpacity: '0.3',
  shadowRadius: 2.5,
  shadowOffset: '0px 2px',
};

export default {
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
  W_HEIGHT: height,
  W_WIDTH: width,
  SCREEN_PADDING: 20,
  TAB_BAR_LABEL: 12,
  shadowStyle,
};
