/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
// import HeadlessCheck from './firebase-messaging-headless-task';


messaging().setBackgroundMessageHandler(async remoteMessage => {});

const backgroundMessageHandler = async remoteMessage => {};

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage',() => backgroundMessageHandler);
AppRegistry.registerComponent(appName, () => App);
