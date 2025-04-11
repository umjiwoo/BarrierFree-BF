import {AxiosResponse} from 'axios';
import {axiosInstance, ApiResponse} from '../../api/axios';
import React, {useEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {useUserStore} from '../../stores/userStore';

// QR 유효 시간
const QR_VALID_DURATION_MS = 10 * 60 * 1000; // 10분

// 남은 시간 포맷팅
const formatRemainingTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
};

// 결제 페이지
const PaymentScreen = () => {
  // const [sessionId, setSessionId] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date>(
    new Date(Date.now() + QR_VALID_DURATION_MS),
  );
  // const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [buyerInfo, setBuyerInfo] = useState(JSON.stringify({}));
  const [remainingTime, setRemainingTime] = useState(
    formatRemainingTime(QR_VALID_DURATION_MS),
  );
  const [qrValue, setQrValue] = useState('');

  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const regenQRTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 사용자 정보
  const {user} = useUserStore();

  // QR 생성
  const createNewQR = async () => {
    // const newId = uuid.v4() as string;
    const expiration = new Date(Date.now() + QR_VALID_DURATION_MS);
    setExpiresAt(expiration);
    setRemainingTime(formatRemainingTime(QR_VALID_DURATION_MS)); // 새로운 QR 생성시 시간 리셋

    // 백엔드에서 구매자 정보 받아오기
    try {
      const response: AxiosResponse<ApiResponse> = await axiosInstance.get(
        '/api/transactions/buyer-info',
      );
      setBuyerInfo(response.data.body);

      setQrValue(
        `http://j12a208.p.ssafy.io?expiresAt=${expiration.toISOString()}&userName=${
          user.username
        }&userId=${user.id}`,
      );

      // QR 코드 만료 디테일
      // QR 만료 시점에 QR 다시 생성
      if (regenQRTimeoutRef.current) {
        clearTimeout(regenQRTimeoutRef.current);
      }
      regenQRTimeoutRef.current = setTimeout(() => {
        // closeWebSocket();
        createNewQR();
      }, QR_VALID_DURATION_MS);
    } catch (error) {}
  };

  useEffect(() => {
    createNewQR();

    // 타이머 시작
    const startTimer = () => {
      updateTimerRef.current = setInterval(() => {
        const remainingMs = expiresAt.getTime() - Date.now();
        if (remainingMs <= 0) {
          setRemainingTime('00:00');
        } else {
          setRemainingTime(formatRemainingTime(remainingMs));
        }
      }, 1000);
    };

    startTimer();

    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
      if (regenQRTimeoutRef.current) {
        clearTimeout(regenQRTimeoutRef.current);
      }
      // closeWebSocket();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>남은 시간: {remainingTime}</Text>
      {/* {sessionId && expiresAt ? ( */}
      {qrValue ? (
        <QRCode value={qrValue} size={200} />
      ) : (
        <Text>QR 생성 중...</Text>
      )}
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  text: {
    fontSize: 25,
    marginBottom: 20,
    // color: 'white',
    fontWeight: 'bold',
  },
});
