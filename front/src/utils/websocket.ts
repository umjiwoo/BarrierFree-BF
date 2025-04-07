// src/utils/websocket.ts
let socket: WebSocket | null = null;

export const connectWebSocket = (sessionId: string, onTransaction: (data: any) => void) => {
  socket = new WebSocket('ws://your-server-address:3000');  // 웹 소켓 연결

  socket.onopen = () => {
    console.log('WebSocket 연결됨');
    socket?.send(JSON.stringify({
      type: 'join',
      sessionId,
    }));
  };

  socket.onmessage = (event) => {
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
