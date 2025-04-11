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
import DefaultPage from '../../components/utils/DefaultPage2';
import DetailBox from '../../components/information/DetailBoxInformation';
import {useHandlePress} from '../../components/utils/handlePress';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import {useUserStore} from '../../stores/userStore';
import {useTTSOnFocus} from '../../components/utils/useTTSOnFocus';
import {useTapNavigationHandler} from '../../components/utils/useTapNavigationHandler ';
import {closeWebSocket, connectWebSocket} from '../../utils/websocket';
import {postSendMoney} from '../../api/axiosTransaction';

const ReceivingConfirmScreen: React.FC = () => {
  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();
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
        setTransactionId(id);
      },
      wsNavigation,
    );
    return () => {
      closeWebSocket();
    };
  }, [money, selectedAccount.receiverAccount, wsNavigation]);

  useTTSOnFocus(`
    ${selectedAccount.receiverName}님에게 ${money}원을 송금하시겠습니까?
    취소하시려면 왼쪽 아래를, 송금하시려면 오른쪽 아래를 눌러주세요.
    왼쪽 위에는 이전 버튼이, 오른쪽 위에는 홈 버튼이 있습니다.
  `);

  const handleSend = async () => {
    try {
      const response = await postSendMoney(
        user.id,
        selectedAccount.receiverAccountId,
        money,
        selectedAccount.receiverName,
        String(transactionId),
        accountPassword,
      );
      if (response.result.code === 200) {
        navigation.navigate('SendSuccess');
      } else {
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
        UpperLeftText={
          <View style={styles.textContainer}>
            <ArrowLeftIcon width={100} height={100} />
            <Text style={styles.text}>이전</Text>
          </View>
        }
        UpperRightText={
          <View style={styles.textContainer}>
            <HomeIcon width={100} height={100} />
            <Text style={styles.text}>메인</Text>
          </View>
        }
        LowerLeftText={
          <View style={styles.textContainer}>
            <CancelIcon width={100} height={100} />
            <Text style={styles.text}>취소</Text>
          </View>
        }
        LowerRightText={
          <View style={styles.textContainer}>
            <CheckIcon width={100} height={100} />
            <Text style={styles.text}>확인</Text>
          </View>
        }
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
        onUpperLeftTextPress={() =>
          handleDefaultPress('이전', undefined, handlePressBack)
        }
        onUpperRightTextPress={() =>
          handleDefaultPress('홈', undefined, handlePressHome)
        }
        onLowerLeftTextPress={() =>
          handleDefaultPress('이전', undefined, handlePressBack)
        }
        onLowerRightTextPress={() =>
          handleDefaultPress('송금하기', undefined, handleSend)
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  confirmText: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
  },
  mainTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default ReceivingConfirmScreen;
