import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import { order } from '../../api/tradeAPI';
import './css/order.css';

const Order = ({ stockCode, stockName }) => {
  const [orderType, setOrderType]=useState("");
  const [orderCondition, setOrderCondition]=useState("");
  const [price, setPrice]=useState("");
  const [quantity, setQuantity]=useState(0);
  const [side, setSide]=useState("");
  const [expiredAt, setExpiredAt]=useState("");

  const orderMutation=useMutation({
    mutationFn: order,
    onSuccess: () => {
        alert(`${stockName} ${quantity}주 주문 완료`);
    },
    onError: (error) => {
        alert(error.response?.data || `${stockName} ${quantity}주 주문 실패`);
    }
  });

  const handleOrder=()=>{
    orderMutation.mutate({
        stockCode, orderType, orderCondition, price, quantity, side, expiredAt
    });
  }

  const notReady=stockCode == null || stockCode == "" ||
    orderType == "" || orderCondition == null || price == null ||
    quantity <= 0 || side == "";

  const isMarket=orderType !== "" && orderType === "MARKET";

  const isNotGTC=orderCondition !== "" && orderCondition !== "GTC";

  return (
    <div>
        <div className='order-stock-box'>
            <span className='order-stock-name'>{stockName}</span>
            <span className='order-stock-code'>{stockCode}</span>
        </div>
        <div className='order-box'>
            <div className='order-type-area'>
                <button type='button' value='MARKET'
                    className={`order-type-btn ${orderType === 'MARKET' ? 'acive':''}`}
                    onClick={(e) => {
                        setOrderType(e.target.value)
                    }}>시장가</button>
                <button type='button' value='LIMIT'
                    className={`order-type-btn ${orderType === 'LIMIT' ? 'acive':''}`}
                    onClick={(e) => {
                        setOrderType(e.target.value)
                    }}>지정가</button>
            </div>
            <div className='order-condition-area'>
                <button type='button' value='GTC'
                    className={`order-condition-btn ${orderCondition === 'GTC' ? 'acive':''}`}
                    onClick={(e) => {
                        setOrderCondition(e.target.value)
                    }}
                    disabled={isMarket}>GTC</button>
                <button type='button' value='IOC'
                    className={`order-condition-btn ${orderCondition === 'IOC' ? 'acive':''}`}
                    onClick={(e) => {
                        setOrderCondition(e.target.value)
                    }}>IOC</button>
                <button type='button' value='FOK'
                    className={`order-condition-btn ${orderCondition === 'FOK' ? 'acive':''}`}
                    onClick={(e) => {
                        setOrderCondition(e.target.value)
                    }}>FOK</button>
            </div>
            <div className='order-expiredAt-area'>
                <input type='date' value={expiredAt} disabled={isNotGTC}
                    onChange={(e) => {
                        setExpiredAt(e.target.value);
                    }}/>
            </div>
            <div className='order-price-area'>
                <input type='text' className='order-price-input'
                    placeholder={orderType === 'MARKET' ? "시장가로 자동 체결됩니다":"가격을 입력하세요"}
                    value={price} 
                    onChange={(e) => {
                        setPrice(e.target.value)
                    }} disabled={isMarket}/>
            </div>
            <div className='order-quantity-area'>
                <div className='order-quantity-box'>
                    <button type='button'
                        onClick={() => {
                            setQuantity((prev) => prev - 1)
                        }}
                        disabled={quantity <= 0}>-</button>
                    <span>{quantity > 0 ? quantity : 0}주</span>
                    <button type='button'
                        onClick={() => {
                            setQuantity((prev) => prev + 1)
                        }}>+</button>
                </div>
            </div>
            <div className='order-side-area'>
                <button type='button' value='BUY'
                    className={`order-side-btn ${side === 'BUY' ? 'active':''}`}
                    onClick={(e) => {
                        setSide(e.target.value)
                    }}>매수</button>
                <button type='button' value='SELL'
                    className={`order-side-btn ${side === 'SELL' ? 'active-sell':''}`}
                    onClick={(e) => {
                        setSide(e.target.value)
                    }}>매도</button>
            </div>
            <div className='order-button-area'>
                <button type='button'
                    onClick={handleOrder}
                    disabled={notReady}>
                    {orderMutation.isPending ? '처리 중':'주문'}
                </button>
            </div>
        </div>
    </div>
  )
}

export default Order