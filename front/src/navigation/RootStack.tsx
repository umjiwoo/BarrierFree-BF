import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import Main from '../screens/mainPage/Main';
import SendFromWhere from '../screens/sendPage/SendFromWhere';
import HomeScreen from '../screens/HomeScreen';
import SendToWho from '../screens/sendPage/SendToWho';
import SendSuccess from '../screens/sendPage/SendSuccess';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Main"
        component={Main}
        options={{
          title: '메인',
          headerShown: false,
          // 필요한 옵션 추가
        }}
      />
      <Stack.Screen
        name="SendFromWhere"
        component={SendFromWhere}
        options={{
          title: '어느 계좌에서 보낼까요?',
          headerShown: false,
          // 필요한 옵션 추가
        }}
      />
      <Stack.Screen
        name="SendToWho"
        component={SendToWho}
        options={{
          title: '누구에게 보낼까요?',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SendSuccess"
        component={SendSuccess}
        options={{
          title: '이체가 완료되었습니다.',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default RootStack;
