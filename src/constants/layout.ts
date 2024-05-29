import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

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
};
