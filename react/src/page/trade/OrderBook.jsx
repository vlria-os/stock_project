import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react'

const OrderBook = ({ stockCode }) => {
  const [orderBook, setOrderBook] = useState(null);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    //websocket 연결
    const client = new Client({
        brokerURL: `${import.meta.env.VITE_GATEWAY_URL.replace('http://', 'ws://')}/ws`,
        onConnect: () => {
            client.subscribe("/topic/orderbook", (message) => {
                setOrderBook(JSON.parse(message.body));
            });
        
            fetch(`${import.meta.env.VITE_GATEWAY_URL}/api/trade/orderbook/subscribe/${stockCode}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
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
        fetch(`${import.meta.env.VITE_GATEWAY_URL}/api/trade/orderbook/unsubscribe/${stockCode}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
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