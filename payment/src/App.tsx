import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const App = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [wsId, setWsId] = useState('');
  const [username, setUsername] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'approved'>('idle');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUsername(params.get('username') || '');
    setFcmToken(params.get('fcmToken') || '');

    const newWsId = Math.random().toString(36).substring(2);
    setWsId(newWsId);

    const socket = new WebSocket('ws://your-websocket-server.com');
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'register', wsId: newWsId }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'approved') {
        setStatus('approved');
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('waiting');

    await fetch('https://your-backend.com/api/request-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        fcmToken,
        wsId,
        accountNumber,
        amount: parseFloat(amount),
      }),
    });
  };

  return (
    <div className="container">
      <h1 className="title">결제 요청</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="box">
          <p className="name">{username} 님께</p>
          <p className="amount">{amount ? `${amount}원` : ''}</p>
          <p className="confirm">결제 요청하시겠습니까?</p>
        </div>

        <input className="input" placeholder="계좌번호" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required />
        <input className="input" placeholder="금액" value={amount} onChange={e => setAmount(e.target.value)} required type="number" />

      <div className="footer">
        <button className="confirm-btn" type="submit" disabled={status === 'waiting'}>
          {status === 'waiting' ? '결제 요청 중' : '결제 요청'}
        </button>
        {/* <button type="button" className="cancel-btn" onClick={() => window.history.back()}>
          초기화
        </button> */}
      </div>
      </form>

      {status === 'approved' && <h3 className="approved">✅ 결제 승인됨</h3>}
    </div>
  );
};

export default App;
