import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import uuid from 'react-native-uuid';
import { RootStackParamList } from '../../navigation/types';
import { connectWebSocket, closeWebSocket } from '../../utils/websocket';
import { useNavigation } from '@react-navigation/native';

// QR 유효 시간
const QR_VALID_DURATION_MS = 10 * 60 * 1000; // 10분

// 남은 시간 포맷팅
const formatRemainingTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// 결제 페이지
const PaymentScreen = () => {
  const [sessionId, setSessionId] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState('00:00');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const regenQRTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // QR 생성
  const createNewQR = () => {
    const newId = uuid.v4() as string;
    const expiration = new Date(Date.now() + QR_VALID_DURATION_MS);

    setSessionId(newId);
    setExpiresAt(expiration);

    connectWebSocket(newId, ({ accountNumber, amount }) => {
      navigation.navigate('PaymentConfirm', { accountNumber, amount, sessionId: newId });
    });

    // QR 만료 시점에 QR 다시 생성
    if (regenQRTimeoutRef.current) clearTimeout(regenQRTimeoutRef.current);
    regenQRTimeoutRef.current = setTimeout(() => {
      closeWebSocket();
      createNewQR();
    }, QR_VALID_DURATION_MS);
  };

  useEffect(() => {
    createNewQR();

    // 매초 남은 시간 UI 업데이트
    updateTimerRef.current = setInterval(() => {
      if (!expiresAt) return;
      const remainingMs = expiresAt.getTime() - Date.now();
      setRemainingTime(formatRemainingTime(remainingMs));
    }, 1000);

    return () => {
      if (updateTimerRef.current) clearInterval(updateTimerRef.current);
      if (regenQRTimeoutRef.current) clearTimeout(regenQRTimeoutRef.current);
      closeWebSocket();
    };
  }, []);

  return (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>남은 시간: {remainingTime}</Text>
      {sessionId && expiresAt ? (
        <QRCode
          value={JSON.stringify({ sessionId, expiresAt: expiresAt.toISOString() })}
          size={200}
        />
      ) : (
        <Text>QR 생성 중...</Text>
      )}
    </View>
  );
};

export default PaymentScreen;
