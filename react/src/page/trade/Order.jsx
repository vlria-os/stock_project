import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import { order } from '../../api/tradeAPI';

const Order = ({ stockCode, stockName }) => {
  const [type, setType]=useState("");
  const [condition, setCondition]=useState("");
  const [price, setPrice]=useState("");
  const [quantity, setQuantity]=useState(0);
  const [side, setSide]=useState("");

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
        stockCode, type, condition, price, quantity, side
    });
  }

  const notReady=stockCode == null || stockCode == "" ||
    type == "" || condition == null || price == null ||
    quantity <= 0 || side == "";

  const isMarket=type !== "" && type === "MARKET";

  return (
    <div>
        <div className='order-stock-box'>
            <span>{stockName}</span>
        </div>
        <div className='order-box'>
            <div className='order-type-area'>
                <button type='button' value='MARKET'
                    onClick={(e) => {
                        setType(e.target.value)
                    }}>시장가</button>
                <button type='button' value='LIMIT'
                    onClick={(e) => {
                        setType(e.target.value)
                    }}>지정가</button>
            </div>
            <div className='order-condition-area'>
                <button type='button' value='GTC'
                    onClick={(e) => {
                        setCondition(e.target.value)
                    }}
                    disabled={isMarket}>GTC</button>
                <button type='button' value='IOC'
                    onClick={(e) => {
                        setCondition(e.target.value)
                    }}>IOC</button>
                <button type='button' value='FOK'
                    onClick={(e) => {
                        setCondition(e.target.value)
                    }}>FOK</button>
            </div>
            <div className='order-price-area'>
                <input type='text' className='order-price-input'
                    placeholder='가격을 입력하세요' value={price} onChange={(e) => {
                        setPrice(e.target.value)
                    }}/>
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
                    onClick={(e) => {
                        setSide(e.target.value)
                    }}>매수</button>
                <button type='button' value='SELL'
                    onClick={(e) => {
                        setSide(e.target.value)
                    }}>매도</button>
            </div>
            <div className='order-button-area'>
                <button type='button'
                    onClick={handleOrder}
                    disabled={notReady}>주문</button>
            </div>
        </div>
    </div>
  )
}

export default Order