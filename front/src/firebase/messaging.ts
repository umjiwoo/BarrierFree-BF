import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';

import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
const navigationRef = createNavigationContainerRef<RootStackParamList>();

const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
};

export async function getFCMToken() {
  const token = await messaging().getToken();
  return token;
}

export async function initializeFCM() {
  await requestUserPermission();
}

export const foregroundMessageListener = (navigation: any) => {
  messaging().onMessage(remoteMessage => {
    try {
      const data = remoteMessage.notification?.body;
      const messageData = JSON.parse(data || '{}');
      if (navigationRef.isReady()) {
        navigationRef.navigate('AcceptPaymentScreen', messageData);
      }
    } catch (error) {}
  });
};

export const backgroundMessageOpenedListener = (navigation: any) => {
  messaging().onNotificationOpenedApp(remoteMessage => {
    try {
      const data = remoteMessage.notification?.body;
      const messageData = JSON.parse(data || '{}');
      navigation.navigate('AcceptPaymentScreen', messageData);
    } catch (error) {}
  });
};
