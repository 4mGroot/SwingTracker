import { AppRegistry } from 'react-native';
import App from './App';  // เนื่องจาก App.js อยู่ในโฟลเดอร์เดียวกับ index.js
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
