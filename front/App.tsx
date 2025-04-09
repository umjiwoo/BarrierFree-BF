import React, {useEffect} from 'react';
import RootStack from './src/navigation/RootStack';
import {NavigationContainer} from '@react-navigation/native';
import { initializeTtsListeners, cleanupTTS } from './src/components/utils/tts'; // TTS

// import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
// import {createStackNavigator} from '@react-navigation/stack';
// import TextScreen from './src/screens/{테스트 해보고 싶은 tsx 경로}'; // TextScreen 경로

// const Stack = createStackNavigator();

export default function App() {

  useEffect(() => {
    initializeTtsListeners();  // 마운트: TTS 설정
    return () => {
      cleanupTTS();  // 언마운트: TTS 해제
    };
  }, []);

  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
