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
                console.log("받은 데이터:", message.body);
                setOrderBook(JSON.parse(message.body));
            });
        
            fetch(`${import.meta.env.VITE_GATEWAY_URL}/api/trade/orderbook/subscribe/${stockCode}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        client.deactivate();
    };
  }, [stockCode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '300px', fontFamily: 'monospace' }}>
        {orderBook ? (
            <>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    {orderBook.stockCode} {orderBook.time}
                </div>

                {/* 매도 호가 - 높은 가격부터 */}
                {[...orderBook.askPrices].reverse().map((ask, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#e8f4f8', padding: '2px 8px' }}>
                        <span style={{ color: 'blue' }}>{Number(ask.volume).toLocaleString()}</span>
                        <span>{Number(ask.price).toLocaleString()}</span>
                    </div>
                ))}

                {/* 매수 호가 */}
                {orderBook.bidPrices.map((bid, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff0f0', padding: '2px 8px' }}>
                        <span>{Number(bid.price).toLocaleString()}</span>
                        <span style={{ color: 'red' }}>{Number(bid.volume).toLocaleString()}</span>
                    </div>
                ))}
            </>
        ) : (
            <p>호가 데이터 로딩 중...</p>
        )}
    </div>
  )
}

export default OrderBook