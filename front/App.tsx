import React, {useEffect} from 'react';
import RootStack from './src/navigation/RootStack';
import {NavigationContainer} from '@react-navigation/native';
import {initializeTtsListeners, cleanupTTS} from './src/components/utils/tts'; // TTS
import {RootStackParamList} from './src/navigation/types';
import {initializeFCM} from './src/firebase/messaging';

import {
  foregroundMessageListener,
  backgroundMessageOpenedListener,
} from './src/firebase/messaging';
import {createNavigationContainerRef} from '@react-navigation/native';
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  useEffect(() => {
    initializeFCM();
    initializeTtsListeners(); // 마운트: TTS 설정

    if (navigationRef.isReady()) {
      foregroundMessageListener(navigationRef);
      backgroundMessageOpenedListener(navigationRef);
    }

    return () => {
      cleanupTTS(); // 언마운트: TTS 해제
    };
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        foregroundMessageListener(navigationRef);
        backgroundMessageOpenedListener(navigationRef);
      }}>
      <RootStack />
    </NavigationContainer>
  );
}
