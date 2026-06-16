import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';

const OrderBook = ({ stockCode }) => {
  const [orderBook, setOrderBook] = useState(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: `${import.meta.env.VITE_GATEWAY_URL.replace('http://', 'ws://')}/ws`,
      onConnect: () => {
        client.subscribe("/topic/orderbook", (message) => {
          setOrderBook(JSON.parse(message.body));
        });
        fetch(`${import.meta.env.VITE_GATEWAY_URL}/api/trade/orderbook/subscribe/${stockCode}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
      },
    });

    client.activate();

    return () => {
      fetch(`${import.meta.env.VITE_GATEWAY_URL}/api/trade/orderbook/unsubscribe/${stockCode}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      client.deactivate();
    };
  }, [stockCode]);

  const maxVol = orderBook
    ? Math.max(
        ...orderBook.askPrices.map(a => Number(a.volume)),
        ...orderBook.bidPrices.map(b => Number(b.volume)),
      )
    : 1;

  return (
    <div style={s.wrap}>
      <div style={s.title}>호가창</div>

      {orderBook ? (
        <div style={s.table}>
          {/* 매도 헤더 */}
          <div style={{ ...s.colHeader, ...s.colHeaderAsk }}>
            <span>잔량</span>
            <span>매도호가</span>
          </div>

          {/* 매도 호가 - 높은 가격부터 */}
          {[...orderBook.askPrices].reverse().map((ask, i) => {
            const pct = (Number(ask.volume) / maxVol) * 100;
            return (
              <div key={i} style={s.askRow}>
                <div style={{ ...s.bar, width: `${pct}%`, right: 0, background: 'rgba(239,68,68,0.13)' }} />
                <span style={s.vol}>{Number(ask.volume).toLocaleString()}</span>
                <span style={s.askPrice}>{Number(ask.price).toLocaleString()}</span>
              </div>
            );
          })}

          {/* 매수 헤더 */}
          <div style={{ ...s.colHeader, ...s.colHeaderBid }}>
            <span>매수호가</span>
            <span>잔량</span>
          </div>

          {/* 매수 호가 */}
          {orderBook.bidPrices.map((bid, i) => {
            const pct = (Number(bid.volume) / maxVol) * 100;
            return (
              <div key={i} style={s.bidRow}>
                <div style={{ ...s.bar, width: `${pct}%`, left: 0, background: 'rgba(59,130,246,0.13)' }} />
                <span style={s.bidPrice}>{Number(bid.price).toLocaleString()}</span>
                <span style={s.vol}>{Number(bid.volume).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={s.loading}>호가 데이터 로딩 중...</div>
      )}
    </div>
  );
};

const s = {
  wrap: {
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid var(--border)',
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid var(--border)',
    fontSize: 13,
  },
  colHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 12px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text)',
  },
  colHeaderAsk: { background: 'rgba(239,68,68,0.08)' },
  colHeaderBid: {
    background: 'rgba(59,130,246,0.08)',
    borderTop: '1px solid var(--border)',
  },
  askRow: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 12px',
    overflow: 'hidden',
  },
  bidRow: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 12px',
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    top: 0,
    height: '100%',
    pointerEvents: 'none',
  },
  askPrice: { color: '#ef4444', fontWeight: 600, position: 'relative', zIndex: 1 },
  bidPrice: { color: '#3b82f6', fontWeight: 600, position: 'relative', zIndex: 1 },
  vol: { color: 'var(--text)', fontSize: 12, position: 'relative', zIndex: 1 },
  loading: { padding: '20px 0', textAlign: 'center', color: 'var(--text)', fontSize: 14 },
};

export default OrderBook;
