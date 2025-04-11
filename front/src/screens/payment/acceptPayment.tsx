import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import {connectWebSocket} from '../../utils/websocket';
import {useAccountStore} from '../../stores/accountStore';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import DefaultPage from '../../components/utils/DefaultPage';
import ArrowLeft from '../../assets/icons/ArrowLeft.svg';
import Home from '../../assets/icons/Home.svg';
import CancelIcon from '../../assets/icons/Cancel.svg';
import CheckIcon from '../../assets/icons/Check.svg';
import VolumeIcon from '../../assets/icons/Volume.svg';
import {useTapNavigationHandler} from '../../components/utils/useTapNavigationHandler ';
import {useHandlePress} from '../../components/utils/handlePress';

const AcceptPaymentScreen = ({route}: {route: any}) => {
  const messageData = route?.params;
  const {accounts} = useAccountStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const {handlePressBack, handlePressHome} = useHandlePress();
  const handleDefaultPress = useTapNavigationHandler();

  // TODO : 웹소켓 연결 후 계좌 선택 및 비밀번호 입력 페이지로 이동?
  // or 계좌 선택 및 비밀번호 입력 후 웹소켓 연결 & 결제 승인 api 호출? 정하기
  // TODO : 암튼 계좌 선택 및 비밀번호 입력 페이지 필요
  const handleAcceptPaymentButtonPress = async () => {
    connectWebSocket(
      'accept-payment',
      messageData,
      accounts.id,
      ({}) => {
        // 결제 처리 중 페이지로 이동
      },
      navigation,
    );
    navigation.navigate('PaySuccess');
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
        MainText={
          <View style={styles.welcomeBox}>
            <View style={styles.voiceButton}>
              <VolumeIcon width={30} height={30} />
              <Text style={styles.voiceButtonText}>결제 확인</Text>
            </View>
            {messageData && (
              <View>
                <Text style={styles.welcome}>
                  {messageData.transactionName}
                </Text>
                <Text style={styles.welcome}>
                  {messageData.transactionAmount}원
                </Text>
                <Text style={styles.subWelcome}>
                  SSAFY 은행{'\n'} 1190101022222222
                </Text>
              </View>
            )}
          </View>
        }
        // MainText="메인 텍스트 들어갈 자리"
        onUpperLeftTextPress={() =>
          handleDefaultPress('이전', undefined, handlePressBack)
        }
        onUpperRightTextPress={() =>
          handleDefaultPress('홈', undefined, handlePressHome)
        }
        onLowerLeftTextPress={() =>
          handleDefaultPress('취소', undefined, handlePressBack)
        }
        onLowerRightTextPress={() =>
          handleDefaultPress('확인', undefined, handleAcceptPaymentButtonPress)
        }
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
    textAlignVertical: 'center',
  },

  infoBox: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 18,
    marginVertical: 2,
    color: 'white',
  },
});

export default AcceptPaymentScreen;
