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

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
};

export async function getFCMToken() {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
}

export async function initializeFCM() {
  await requestUserPermission();
}

export const foregroundMessageListener = (navigation: any) => {
  messaging().onMessage(remoteMessage => {
    console.log('[FCM] 포그라운드 메시지 수신:', remoteMessage);

    try {
      const data = remoteMessage.notification?.body;
      console.log('body raw:', data);
      const messageData = JSON.parse(data || '{}');
      console.log('Parsed data:', messageData);
      if (navigationRef.isReady()) {
        navigationRef.navigate('AcceptPaymentScreen', messageData);
      }
      // navigation.navigate('AcceptPaymentScreen', messageData);
    } catch (error) {
      console.log(error);
    }
  });
};

export const backgroundMessageOpenedListener = (navigation: any) => {
  messaging().onNotificationOpenedApp(remoteMessage => {
    try {
      console.log('[FCM] 백그라운드에서 열림:', remoteMessage);
      console.log(remoteMessage.notification);
      const data = remoteMessage.notification?.body;
      console.log('body raw:', data);
      const messageData = JSON.parse(data || '{}');
      console.log('Parsed data:', messageData);
      // if (navigationRef.isReady()) {
      //   navigationRef.navigate('AcceptPaymentScreen', messageData);
      // }
      navigation.navigate('AcceptPaymentScreen', messageData);
    } catch (error) {
      console.log(error);
    }
  });
};
