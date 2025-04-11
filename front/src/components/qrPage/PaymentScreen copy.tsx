import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';

const QRCodeWithTimer = () => {
  const [timeLeft, setTimeLeft] = useState(30); // 30초 유효 시간
  const [qrData, setQrData] = useState(generateData());

  function generateData() {
    const timestamp = Date.now();
    const token = Math.random().toString(36).slice(2, 10); // 예시용 랜덤값
    return JSON.stringify({timestamp, token});
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          const newData = generateData();
          setQrData(newData);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{alignItems: 'center', marginTop: 50}}>
      <QRCode value={qrData} size={200} />
      <Text style={{marginTop: 20, fontSize: 18}}>남은 시간: {timeLeft}초</Text>
    </View>
  );
};

export default QRCodeWithTimer;
