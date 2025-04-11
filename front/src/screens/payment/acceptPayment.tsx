import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {connectWebSocket, closeWebSocket} from '../../utils/websocket';
import {useAccountStore} from '../../stores/accountStore';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const AcceptPaymentScreen = ({route}: {route: any}) => {
  const messageData = route?.params;
  console.log('결제 승인 페이지 진입, 전달받은 데이터:', messageData);

  const {accounts} = useAccountStore();
  console.log('accounts:', accounts);

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

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
    <View style={styles.container}>
      {messageData && (
        <View style={styles.infoBox}>
          {/* <Text style={styles.infoText}>User ID: {messageData.userId}</Text> */}
          <Text style={styles.infoText}>
            판매자 : {messageData.transactionName}
          </Text>
          <Text style={styles.infoText}>판매자 계좌: 1190101022222222</Text>
          <Text style={styles.infoText}>
            은행 : SSAFY
            {/* 은행 코드: {messageData.sellerAccountBankCode} */}
          </Text>
          <Text style={styles.infoText}>
            금액: {messageData.transactionAmount}원
          </Text>
          {/* <Text style={styles.infoText}>
            WebSocket ID: {messageData.transactionWebSocketId}
          </Text> */}
        </View>
      )}

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleAcceptPaymentButtonPress}>
          <Text style={styles.text}>결제 승인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AcceptPaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    width: '45%',
    height: '45%',
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 18,
    marginVertical: 2,
  },
});
