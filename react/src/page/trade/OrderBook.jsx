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
    <div style={{
        width: '280px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '13px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden'
    }}>
        {orderBook ? (
            <>
                {/* 매도 호가 - 높은 가격부터 */}
                {[...orderBook.askPrices].reverse().map((ask, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '5px 16px',
                        backgroundColor: i % 2 === 0 ? '#fff5f5' : '#fff8f8',
                        position: 'relative'
                    }}>
                        <span style={{ color: '#999', fontSize: '12px' }}>
                            {Number(ask.volume).toLocaleString()}
                        </span>
                        <span style={{ color: '#e5333a', fontWeight: '600' }}>
                            {Number(ask.price).toLocaleString()}
                        </span>
                    </div>
                ))}

                {/* 구분선 */}
                <div style={{ height: '1px', backgroundColor: '#eee' }} />

                {/* 매수 호가 */}
                {orderBook.bidPrices.map((bid, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '5px 16px',
                        backgroundColor: i % 2 === 0 ? '#f5f8ff' : '#f8faff',
                    }}>
                        <span style={{ color: '#1763e8', fontWeight: '600' }}>
                            {Number(bid.price).toLocaleString()}
                        </span>
                        <span style={{ color: '#999', fontSize: '12px' }}>
                            {Number(bid.volume).toLocaleString()}
                        </span>
                    </div>
                ))}
            </>
        ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                호가 데이터 로딩 중...
            </div>
        )}
    </div>
  )
}

export default OrderBook