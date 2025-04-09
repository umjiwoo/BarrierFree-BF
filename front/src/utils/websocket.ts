// src/utils/websocket.ts
import axios, {AxiosResponse} from 'axios';
import {axiosInstance, ApiResponse} from '../api/axios';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

let socket: WebSocket | null = null;

export const connectWebSocket = (transaction: string, messageData: any, accountId: any,
                                onTransaction: (data: any) => void,
                              navigation: NativeStackNavigationProp<any>) => {
  socket = new WebSocket(`ws://10.0.2.2:8080/api/ws/${transaction}?transactionWebSocketId=${messageData.transactionWebSocketId}`);  // 웹 소켓 연결

  console.log("Connecting to:", socket.url);
  console.log("receivedData: ", messageData);

  socket.onopen = async () => {
    console.log('WebSocket 연결됨');
    if(transaction === 'accept-payment') {
      try {
        const response: AxiosResponse<ApiResponse> = await axiosInstance.post(
          '/api/transactions/accept-payment', {
            senderAccountId: accountId,
            receiverAccountId: messageData.receiverAccountId,
            transactionAmount: messageData.transactionAmount,
            transactionName: messageData.transactionName,
            transactionWebSocketId: messageData.transactionWebSocketId,
            accountPassword: "1111"
        });
    
        console.log('결제 승인 API 응답:', response.data);

        if(response.data.result.message === 'success') {
          console.log('결제 승인 성공:', response.data.body);
          
        }else{
          // TODO : response.data.result.message 음성 안내 필요
          console.log('결제 실패:', response.data.result.message);
        }
        
      } catch (error) {
        console.log('결제 승인 API 호출 실패:', error);
      }
    }
  };

  socket.onmessage = (event) => {    
    const message = JSON.parse(event.data);
    console.log('WebSocket 메시지 수신:', message);

    if(message.result.message === 'success') {
      console.log('결제 승인 성공:', message.body);
      // TODO 결제 성공 페이지로 이동
    }

    // if (message.type === 'transaction') {
    //   onTransaction(message.payload);  // { accountNumber, amount }
    // }
  };

  socket.onerror = (err) => {
    console.error('WebSocket 오류:', err);
  };

  socket.onclose = () => {
    console.log('WebSocket 종료됨');
  };
};

export const sendTransactionData = (sessionId: string, payload: { accountNumber: string, amount: number }) => {
  socket?.send(JSON.stringify({
    type: 'sendTransaction',
    sessionId,
    payload,
  }));
};

export const closeWebSocket = () => {
  socket?.close();
};
