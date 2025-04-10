import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { closeWebSocket } from '../../utils/websocket';
// import { sendMoney } from '../utils/api'; // 실제 송금 API

const PaymentConfirm = () => {
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
  );
};

export default PaymentConfirm;
