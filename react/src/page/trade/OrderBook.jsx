import { Client } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react'
import SockJS from 'sockjs-client';

const OrderBook = ({ stockCode }) => {
  const [orderBook, setOrderBook] = useState(null);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    //1. websocket 연결
    const client=new Client({
        webSocketFactory: () => new SockJS()
    })
  })

  return (
    <div>OrderBook</div>
  )
}

export default OrderBook