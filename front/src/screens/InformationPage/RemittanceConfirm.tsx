import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, Alert} from 'react-native';
import {
  NavigationProp,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import DetailBox from '../../components/information/DetailBoxInformation';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {useUserStore} from '../../stores/userStore';
import {useTTSOnFocus} from '../../components/utils/useTTSOnFocus';
import {closeWebSocket, connectWebSocket} from '../../utils/websocket';
import {postSendMoney} from '../../api/axiosTransaction';

const ReceivingConfirmScreen: React.FC = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
  const {user} = useUserStore();
  // const navigation = useNavigation<NavigationProp<any>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RemittanceConfirm'>>();
  const money = route.params?.money;
  const selectedAccount = route.params?.selectedAccount;
  const accountPassword = route.params?.password;
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const wsNavigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    connectWebSocket(
      'remittance',
      {
        accountNumber: selectedAccount.receiverAccount,
        amount: money,
      },
      selectedAccount.receiverAccount,
      (id: string) => {
        console.log('Received transactionWebSocketId:', id);
        setTransactionId(id);
        console.log('transactionId:', id);
        // navigation.navigate('SendSuccess');
      },
      wsNavigation,
    );
    return () => {
      closeWebSocket();
    };
  }, [money, selectedAccount.receiverAccount, wsNavigation]);

  // setTimeout(() => {
  //   closeWebSocket();
  // }, 1000);

  useTTSOnFocus(`
    ${selectedAccount.receiverName}님에게 ${money}원을 송금하시겠습니까?
    취소하시려면 왼쪽 아래를, 송금하시려면 오른쪽 아래를 눌러주세요.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

  const handleSend = async () => {
    try {
      console.log('송금하기 버튼 클릭');
      const response = await postSendMoney(
        user.id,
        selectedAccount.receiverAccountId,
        money,
        selectedAccount.receiverName,
        String(transactionId),
        accountPassword,
      );
      console.log('송금하기 응답:', response);
      if (response.result.code === 200) {
        console.log('송금하기 성공:', response.result.message);
        navigation.navigate('SendSuccess');
      } else {
        console.log('송금하기 실패');
        Alert.alert('송금에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('송금에 실패했습니다. 다시 시도해주세요.');
      navigation.navigate('SendMain');
    }
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="취소"
        LowerRightText="송금하기"
        MainText={
          <View style={styles.mainTextContainer}>
            <DetailBox
              recipient={selectedAccount.receiverName}
              receiverAccount={selectedAccount.receiverAccount}
              remitter={user.username}
              amount={money}
            />
            <Text style={styles.confirmText}>송금하시겠습니까?</Text>
          </View>
        }
        onUpperLeftTextPress={handlePressBack}
        onUpperRightTextPress={handlePressHome}
        onLowerLeftTextPress={handlePressBack}
        onLowerRightTextPress={handleSend}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: '100%',
    // justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    // paddingHorizontal: 20,
    // paddingVertical: 20,
    // marginTop: 50,
  },
  confirmText: {
    fontSize: 40,
    fontWeight: 'bold',
    // marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    color: '#7F35D4',
  },
  mainTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default ReceivingConfirmScreen;
