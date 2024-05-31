import {Dimensions} from 'react-native';
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
  W_HEIGHT: height,
  W_WIDTH: width,
  padding: {
    SCREEN: 20,
    SMALL: 8,
    MEDIUM: 16,
  },
  margin: {
    SMALL: 8,
    MEDIUM: 16,
  },
  font: {
    LABEL: 12,
    DEFAULT: 14,
    TITLE: 16,
    HEADER: 24,
  },
  shadowStyle,
};
