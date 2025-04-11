import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const App = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [wsId, setWsId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setuserId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "waiting" | "approved">("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    console.log(params);
    setExpiresAt(params.get("expiresAt") || "");
    setUsername(params.get("userName") || "");
    setuserId(params.get("userId") || "");

    const newWsId = Math.random().toString(36).substring(2);
    setWsId(newWsId);

    const socket = new WebSocket(
      `ws://j12a208.p.ssafy.io:8080/api/ws/request-payment`
    );
    // const socket = new WebSocket(`ws://j12a208.p.ssafy.io:8080/api/ws/request-payment?transactionWebSocketId=${newWsId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      // socket.send(JSON.stringify({ type: 'register', wsId: newWsId }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (
        message.result?.code === 200 &&
        message.result?.message === "success"
      ) {
        setStatus("approved");
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  // 결제 요청
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("waiting");

    await fetch(
      "http://j12a208.p.ssafy.io:8080/api/transactions/request-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          transactionWebSocketId: wsId, // wsId를 그대로 사용
          sellerAccountNo: accountNumber,
          sellerAccountBankCode: "911", // 또는 선택 옵션으로 처리 가능
          transactionAmount: parseFloat(amount),
        }),
      }
    );
  };

  return (
    <div className="container">
      {status === "approved" ? (
        <div className="approved-screen">
          <h1 className="approved-message">✅ 결제 승인</h1>
        </div>
      ) : (
        <>
          <h1 className="title">결제 요청</h1>
          <form className="form" onSubmit={handleSubmit}>
            <div className="box">
              <p className="name">{username} 님께</p>
              <p className="amount">{amount ? `${amount}원` : ""}</p>
              <p className="confirm">결제 요청하시겠습니까?</p>
            </div>

            <input
              className="input"
              placeholder="계좌번호"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="금액"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              type="number"
            />

            <div className="footer">
              <button
                className="confirm-btn"
                type="submit"
                disabled={status === "waiting"}
              >
                {status === "waiting" ? "결제 요청 중" : "결제 요청"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default App;
