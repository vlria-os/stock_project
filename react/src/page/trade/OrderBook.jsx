import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react'
import SockJS from 'sockjs-client';

const OrderBook = ({ stockCode }) => {
  const [orderBook, setOrderBook] = useState(null);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    //1. websocket 연결
    const client=new Client({
        webSocketFactory: () => new SockJS(`${import.meta.env.VITE_TRADE_SERVICE_URL}/ws`),
        onConnect: () => {
            //2. 호가 구독
            client.subscribe("/topic/orderbook", (message) => {
                setOrderBook(JSON.parse(message.body));
            });

            //3. 백엔드에 kis 구독 요청
            fetch(`/api/trade/orderbook/subscribe/${stockCode}`, {
                method: 'POST'
            });
        },
        onDisconnect: () => {
            console.log("WebSocket 연결 종료");
        },
    });

    client.activate();
    setStompClient(client);

    //페이지 이탈 시 구독 해제
    return () => {
        fetch(`/api/trade/orderbook/unsubscribe/${stockCode}`, {
            method: 'POST'
        });

        client.deactivate();
    };
  }, [stockCode]);

  return (
    <div>
        {orderBook ? (
                <pre>{JSON.stringify(orderBook, null, 2)}</pre>
        ) : (
                <p>호가 데이터 로딩 중...</p>
        )}
    </div>
  )
}

export default OrderBook