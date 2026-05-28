import React, { useState } from 'react'

const Order = () => {
  const [type, setType]=useState("");
  const [condition, setCondition]=useState("");
  const [price, setPrice]=useState("");
  const [quantity, setQuantity]=useState("");
  const [side, setSide]=useState("");

  return (
    <div>
        <div className='order-stock-box'>
            
        </div>
        <div className='order-box'>
            <div className='order-type-area'>
                <button>시장가</button>
                <button>지정가</button>
            </div>
            <div className='order-condition-area'>
                <button>GTC</button>
                <button>IOC</button>
                <button>FOK</button>
            </div>
            <div className='order-price-area'>
                <input type='text' className='order-price-input'
                    placeholder='가격을 입력하세요'/>
            </div>
            <div className='order-quantity-area'>
                <div className='order-quantity-box'>
                    <button>-</button>
                    <span>0주</span>
                    <button>+</button>
                </div>
            </div>
            <div className='order-side-area'>
                <button>매수</button>
                <button>매도</button>
            </div>
            <div className='order-button-area'>
                <button>주문하기</button>
            </div>
        </div>
    </div>
  )
}

export default Order