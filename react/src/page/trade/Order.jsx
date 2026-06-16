import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { order } from '../../api/tradeAPI';

const Order = ({ stockCode, stockName }) => {
  const [orderType, setOrderType] = useState("");
  const [orderCondition, setOrderCondition] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [side, setSide] = useState("");
  const [expiredAt, setExpiredAt] = useState("");

  const orderMutation = useMutation({
    mutationFn: order,
    onSuccess: () => {
      alert(`${stockName} ${quantity}주 주문 완료`);
    },
    onError: (error) => {
      alert(error.response?.data || `${stockName} ${quantity}주 주문 실패`);
    },
  });

  const handleOrder = () => {
    orderMutation.mutate({ stockCode, orderType, orderCondition, price, quantity, side, expiredAt });
  };

  const notReady =
    !stockCode || !orderType || !orderCondition || quantity <= 0 || !side ||
    (orderType === 'LIMIT' && !price);

  const isMarket = orderType === 'MARKET';
  const isNotGTC = orderCondition !== "" && orderCondition !== "GTC";

  const isBuy = side === 'BUY';
  const isSell = side === 'SELL';

  return (
    <div style={s.wrap}>
      {/* 종목 헤더 */}
      <div style={s.stockBox}>
        <span style={s.stockName}>{stockName}</span>
        <span style={s.stockCode}>{stockCode}</span>
      </div>

      <div style={s.form}>
        {/* 주문 유형 */}
        <div style={s.section}>
          <span style={s.label}>주문 유형</span>
          <div style={s.toggleGroup}>
            {[['MARKET', '시장가'], ['LIMIT', '지정가']].map(([val, text]) => (
              <button
                key={val}
                type="button"
                style={{ ...s.toggleBtn, ...(orderType === val ? s.toggleBtnOn : {}) }}
                onClick={() => setOrderType(val)}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* 주문 조건 */}
        <div style={s.section}>
          <span style={s.label}>주문 조건</span>
          <div style={s.toggleGroup}>
            {[['GTC', 'GTC'], ['IOC', 'IOC'], ['FOK', 'FOK']].map(([val, text]) => (
              <button
                key={val}
                type="button"
                style={{
                  ...s.toggleBtn,
                  ...(orderCondition === val ? s.toggleBtnOn : {}),
                  ...(val === 'GTC' && isMarket ? s.toggleBtnDisabled : {}),
                }}
                onClick={() => setOrderCondition(val)}
                disabled={val === 'GTC' && isMarket}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* 만료일 */}
        <div style={s.section}>
          <span style={s.label}>만료일</span>
          <input
            type="date"
            value={expiredAt}
            disabled={isNotGTC}
            onChange={(e) => setExpiredAt(e.target.value)}
            style={{ ...s.input, ...(isNotGTC ? s.inputDisabled : {}) }}
          />
        </div>

        {/* 가격 */}
        <div style={s.section}>
          <span style={s.label}>가격</span>
          <input
            type="text"
            placeholder={isMarket ? "시장가로 자동 체결됩니다" : "가격을 입력하세요"}
            value={price}
            disabled={isMarket}
            onChange={(e) => setPrice(e.target.value)}
            style={{ ...s.input, ...(isMarket ? s.inputDisabled : {}) }}
          />
        </div>

        {/* 수량 */}
        <div style={s.section}>
          <span style={s.label}>수량</span>
          <div style={s.quantityBox}>
            <button
              type="button"
              style={{ ...s.qBtn, ...(quantity <= 0 ? s.qBtnDisabled : {}) }}
              onClick={() => setQuantity(p => Math.max(0, p - 1))}
              disabled={quantity <= 0}
            >−</button>
            <span style={s.qDisplay}>{quantity}주</span>
            <button
              type="button"
              style={s.qBtn}
              onClick={() => setQuantity(p => p + 1)}
            >+</button>
          </div>
        </div>

        {/* 매수 / 매도 */}
        <div style={s.sideGroup}>
          <button
            type="button"
            style={{ ...s.sideBtn, ...(isBuy ? s.sideBtnBuy : {}) }}
            onClick={() => setSide('BUY')}
          >
            매수
          </button>
          <button
            type="button"
            style={{ ...s.sideBtn, ...(isSell ? s.sideBtnSell : {}) }}
            onClick={() => setSide('SELL')}
          >
            매도
          </button>
        </div>

        {/* 주문 버튼 */}
        <button
          type="button"
          onClick={handleOrder}
          disabled={notReady || orderMutation.isPending}
          style={{
            ...s.orderBtn,
            ...(isBuy && !notReady ? s.orderBtnBuy : {}),
            ...(isSell && !notReady ? s.orderBtnSell : {}),
            ...(notReady ? s.orderBtnDisabled : {}),
          }}
        >
          {orderMutation.isPending ? '처리 중...' : side === 'BUY' ? '매수 주문' : side === 'SELL' ? '매도 주문' : '주문'}
        </button>
      </div>
    </div>
  );
};

const s = {
  wrap: {
    width: '100%',
    fontSize: 13,
  },
  stockBox: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottom: '1px solid var(--border)',
  },
  stockName: { fontSize: 16, fontWeight: 700, color: 'var(--text-h)' },
  stockCode: { fontSize: 12, color: 'var(--text)', fontFamily: 'var(--mono)' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  section: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text)' },
  toggleGroup: { display: 'flex', gap: 6 },
  toggleBtn: {
    flex: 1,
    padding: '7px 0',
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'none',
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toggleBtnOn: {
    background: 'var(--accent, #7c3aed)',
    color: '#fff',
    border: '1px solid transparent',
    fontWeight: 700,
  },
  toggleBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: 13,
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'none',
    color: 'var(--text-h)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  quantityBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  qBtn: {
    width: 40,
    padding: '9px 0',
    fontSize: 18,
    fontWeight: 300,
    background: 'none',
    border: 'none',
    color: 'var(--text-h)',
    cursor: 'pointer',
    lineHeight: 1,
  },
  qBtnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  qDisplay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-h)',
    borderLeft: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    padding: '9px 0',
  },
  sideGroup: { display: 'flex', gap: 8 },
  sideBtn: {
    flex: 1,
    padding: '11px 0',
    fontSize: 14,
    fontWeight: 700,
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'none',
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  sideBtnBuy: { background: '#3b82f6', color: '#fff', border: '1px solid transparent' },
  sideBtnSell: { background: '#ef4444', color: '#fff', border: '1px solid transparent' },
  orderBtn: {
    width: '100%',
    padding: '13px 0',
    fontSize: 15,
    fontWeight: 700,
    border: 'none',
    borderRadius: 8,
    background: 'var(--border)',
    color: 'var(--text)',
    cursor: 'not-allowed',
    transition: 'all 0.15s',
  },
  orderBtnBuy: { background: '#3b82f6', color: '#fff', cursor: 'pointer' },
  orderBtnSell: { background: '#ef4444', color: '#fff', cursor: 'pointer' },
  orderBtnDisabled: { opacity: 0.45 },
};

export default Order;
