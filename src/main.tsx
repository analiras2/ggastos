import { AppRegistry } from 'react-native';

import { App } from '@/app/app';

const APP_NAME = 'GGastos';
const ROOT_ELEMENT_ID = 'root';

AppRegistry.registerComponent(APP_NAME, () => App);
AppRegistry.runApplication(APP_NAME, {
  rootTag: document.getElementById(ROOT_ELEMENT_ID),
});
