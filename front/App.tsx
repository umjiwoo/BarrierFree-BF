import React from 'react';
// import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
// import {createStackNavigator} from '@react-navigation/stack';
import RootStack from './src/navigation/RootStack';
// import TextScreen from './src/screens/{테스트 해보고 싶은 tsx 경로}'; // TextScreen 경로

// const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
