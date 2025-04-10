import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import DrawingModal from './DrawingModal'; // 손글씨 입력 컴포넌트 (예: Skia 사용)
import {
  NavigationProp,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';

import {playTTS} from '../utils/tts';
import {RootStackParamList} from '../../navigation/types';
import {useHandlePress} from '../../components/utils/handlePress';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeftIcon from '../../assets/icons/ArrowLeft.svg';
import HomeIcon from '../../assets/icons/Home.svg';
import {postCheckAccountPassword} from '../../api/axiosTransaction';
import {useAccountStore} from '../../stores/accountStore';
import {connectWebSocket} from '../../utils/websocket';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

interface Props {
  type: string;
}

const InputPassword: React.FC<Props> = ({type}) => {
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(true);

  const handlePrediction = (digit: string) => {
    if (digit === '11') {
      console.log('"X" 지우기');
      deleteLastDigit();
    } else if (digit === '10') {
      closeModal();
    } else {
      setPassword(prev => {
        if (prev.length < 4) {
          const updated = prev + digit;
          console.log('digit', digit);
          console.log('updated', updated);
          playTTS(digit);
          if (updated.length === 4) {
            console.log('입력완료');
            setShowModal(false);
          }
          return updated;
        }
        return prev;
      });
    }
  };

  const renderPasswordDots = () => {
    const length = password.length;
    return '●'.repeat(length) + '○'.repeat(4 - length); // 입력된 ●과 남은 ○로 표시
  };

  const deleteLastDigit = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  // 전체 지우기
  // const clearAll = () => {
  //   setAccountNumber('');
  // };

  const closeModal = () => {
    setShowModal(false);
  };

  const {handlePressBack, handlePressHome} = useHandlePress();
  const {accounts} = useAccountStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RemittanceConfirm'>>();
  const money = route.params?.money;
  const selectedAccount = route.params?.selectedAccount;
  const receiverAccountId = route.params?.receiverAccountId;
  const wsNavigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleSend = async () => {
    console.log('비밀번호 완료');

    console.log('password: ', Number(password));

    const response = await postCheckAccountPassword(
      accounts.id,
      Number(password),
    );

    console.log('response: ', response);
    if (response === true) {
      connectWebSocket(
        'remittance',
        {
          accountNumber: selectedAccount.receiverAccount,
          amount: money,
        },
        selectedAccount.receiverAccount,
        () => {
          navigation.navigate('RemittanceConfirm', {
            selectedAccount: selectedAccount,
            money: money,
            password: password,
            accountId: accounts.id,
            receiverAccountId: receiverAccountId,
          });
        },
        wsNavigation,
      );

      // navigation.navigate('RemittanceConfirm', {
      //   selectedAccount: selectedAccount,
      //   money: money,
      //   password: password,
      //   accountId: accounts.id,
      //   receiverAccountId: receiverAccountId,
      // }); // password 비밀번호
    } else if (response === 'wrong') {
      Alert.alert('비밀번호가 틀렸습니다.');
      playTTS('비밀번호가 틀렸습니다.');
      setPassword('');
      navigation.navigate('SendInputPage', {
        type: 'password',
        selectedAccount: selectedAccount,
        money: money,
        receiverAccountId: receiverAccountId,
      });
    } else if (response === 'locked') {
      playTTS(
        '비밀번호 5회 입력 실패로 계좌가 잠겼습니다. 메인페이지로 돌아갑니다.',
      );
      setPassword('');
      navigation.navigate('Main');
    }
  };

  return (
    <View style={styles.container}>
      <DefaultPage
        UpperLeftText={<ArrowLeftIcon width={80} height={80} />}
        UpperRightText={<HomeIcon width={80} height={80} />}
        LowerLeftText="취소"
        LowerRightText="입력 확인"
        MainText={
          <View style={styles.mainTextContainer}>
            <Text style={styles.title}>비밀번호 입력</Text>
            <Text style={styles.accountDisplay}>{renderPasswordDots()}</Text>
            <DrawingModal visible={showModal} onPredict={handlePrediction} />
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
  mainTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 30,
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  accountDisplay: {
    fontSize: 70,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 16,
    backgroundColor: 'rgba(127,53,212, 0.1)',
    textAlign: 'center',
    minWidth: 280,
  },
});

export default InputPassword;
