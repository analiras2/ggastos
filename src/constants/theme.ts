import {MD3LightTheme as DefaultTheme} from 'react-native-paper';
import {Colors} from '.';

const Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    secondary: Colors.text,
  },
};

export default Theme;
