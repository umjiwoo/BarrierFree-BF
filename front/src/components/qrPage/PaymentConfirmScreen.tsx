import React, {useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import DefaultPage from '../../components/utils/DefaultPage';
import {useUserStore} from '../../stores/userStore';
import {useAccountStore} from '../../stores/accountStore';
import VolumeIcon from '../../assets/icons/Volume.svg';
import { useTTSOnFocus } from '../../components/utils/useTTSOnFocus';
import { useTapNavigationHandler } from '../../components/utils/useTapNavigationHandler ';
import { useRoute } from '@react-navigation/native';
import { closeWebSocket } from '../../utils/websocket';
import ArrowLeft from '../../assets/icons/ArrowLeft.svg';
import Home from '../../assets/icons/Home.svg';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import {useHandlePress} from '../../components/utils/handlePress';

const PaymentConfirm = () => {
  useTTSOnFocus(`
    메인 화면입니다.
    결제를 원하시면 왼쪽 위,
    설정을 원하시면 오른쪽 위,
    계좌 조회를 원하시면 왼쪽 아래,
    송금을 원하시면 오른쪽 아래를 눌러주세요.
  `);

  const {user} = useUserStore();
  const {accounts} = useAccountStore();
  console.log(user);
  console.log(accounts);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();

  const [password, setPassword] = useState('');
  const { accountNumber, amount, sessionId } = useRoute().params;

  const handleSend = async () => {
    // const res = await sendMoney({ accountNumber, amount, password });
    // if (res.success) {
    //   Alert.alert('결제 완료');
    // } else {
    //   Alert.alert('결제 실패', res.message || '');
    // }
    closeWebSocket();
  };

  return (
    <SafeAreaView style={styles.container}>
      <DefaultPage
        UpperLeftText={
          <View style={styles.textContainer}>
            <ArrowLeft width={100} height={100} />
            <Text style={styles.text}>이전</Text>
          </View>
        }
        UpperRightText={
          <View style={styles.textContainer}>
            <Home width={100} height={100} />
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
        // LowerRightText="설정"
        MainText={
          <View style={styles.welcomeBox}>
            <View style={styles.voiceButton}>
              <VolumeIcon width={30} height={30} />
              <Text style={styles.voiceButtonText}>음성 안내 듣기</Text>
            </View>
            <View>
              <Text>계좌번호: {accountNumber}</Text>
              <Text>금액: {amount}원</Text>
              <TextInput
                secureTextEntry
                placeholder="비밀번호 입력"
                value={password}
                onChangeText={setPassword}
              />
              <Button title="송금하기" onPress={handleSend} />
            </View>
          </View>
        }
        // MainText="메인 텍스트 들어갈 자리"
        onUpperLeftTextPress={() => handleDefaultPress('이전', undefined, handlePressBack)}
        onUpperRightTextPress={() => handleDefaultPress('홈', undefined, handlePressHome)}
        onLowerLeftTextPress={() => handleDefaultPress('취소', undefined, handlePressBack)}
        onLowerRightTextPress={() => handleDefaultPress('취소', undefined, handleSend)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  mainTextContainer: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 20,
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

  welcomeBox: {
    alignItems: 'center',
    marginVertical: 32,
  },
  welcome: {
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subWelcome: {
    color: '#ccc',
    fontSize: 35,
    textAlign: 'center',
    marginTop: 8,
  },
  voiceButton: {
    marginBottom: 20,
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 25,
    textAlignVertical: 'center'
  },
});

export default PaymentConfirm;