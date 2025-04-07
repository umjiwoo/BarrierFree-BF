import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import Main from '../screens/mainPage/Main';
import SendMain from '../screens/sendPage/SendMain';
import HomeScreen from '../screens/HomeScreen';
import SendSuccess from '../screens/sendPage/SendSuccess';
import ReceivingAccountScreen from '../screens/InformationPage/ReceivingAccount';
import RemittanceConfirm from '../screens/InformationPage/RemittanceConfirm';
import SendInputPage from '../screens/sendInputpage';
import ThreeBtn from '../screens/threebtn';
import RemittanceInformation from '../screens/InformationPage/RemittanceInformation';
import CheckHistory from '../screens/checkPage/CheckHistory';
import CheckHistoryDetail from '../screens/checkPage/CheckHistoryDetail';
import DefaultButton from '../components/utils/DefaultPage';
import SendRecentAccount from '../screens/sendPage/SendRecentAccount';
import CreateAccountScreen from '../screens/createAccountPage/CreateAccountScreen';
import CreateAccountGoodsDetail from '../screens/createAccountPage/CreateAccountGoodsDetail';
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
        name="CreateAccountScreen"
        component={CreateAccountScreen}
        options={{
          title: 'CreateAccountScreen',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateAccountGoodsDetail"
        component={CreateAccountGoodsDetail}
        options={{
          title: 'CreateAccountGoodsDetail',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DefaultButton"
        component={DefaultButton}
        options={{
          title: 'DefaultButton',
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
        name="CheckHistory"
        component={CheckHistory}
        options={{
          title: '내역 조회',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CheckHistoryDetail"
        component={CheckHistoryDetail}
        options={{
          title: '내역 상세',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SendMain"
        component={SendMain}
        options={{
          title: '송금 페이지',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SendRecentAccount"
        component={SendRecentAccount}
        options={{
          title: '최근 보낸 계좌',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ReceivingAccountScreen"
        component={ReceivingAccountScreen}
        options={{
          title: '받는 사람 정보를 확인하세요.',
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
      <Stack.Screen
        name="RemittanceConfirm"
        component={RemittanceConfirm}
        options={{
          title: '이체 재확인.',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RemittanceInformation"
        component={RemittanceInformation}
        options={{
          title: '이체 정보를 확인하세요.',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SendInputPage"
        component={SendInputPage}
        options={{
          title: '금액을 입력하세요.',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ThreeBtn"
        component={ThreeBtn}
        options={{
          title: '금액을 입력하세요.',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default RootStack;
