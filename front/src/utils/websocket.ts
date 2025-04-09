// src/utils/websocket.ts
let socket: WebSocket | null = null;

export const connectWebSocket = (transaction: string, transactionWebSocketId: string,
                                onTransaction: (data: any) => void) => {
  socket = new WebSocket(`ws://10.0.2.2:8080/api/ws/${transaction}?transactionWebSocketId=${transactionWebSocketId}`);  // 웹 소켓 연결

  console.log("Connecting to:", socket.url);

  socket.onopen = () => {
    console.log('WebSocket 연결됨');
    socket?.send(JSON.stringify({
      type: 'join',
      // sessionId,
    }));
  };

  socket.onmessage = (event) => {
    // TODO : 웹소켓 연결 시 전송되는 메시지 읽기
    const message = JSON.parse(event.data);
    if (message.type === 'transaction') {
      onTransaction(message.payload);  // { accountNumber, amount }
    }
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
