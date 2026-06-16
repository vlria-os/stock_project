import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { orders } from '../../api/tradeAPI';
import dayjs from 'dayjs';

const STATUS_MAP = {
  FILLED:           { label: '체결',    color: '#22c55e' },
  PARTIALLY_FILLED: { label: '부분체결', color: '#f59e0b' },
  PENDING:          { label: '대기',    color: '#f59e0b' },
  CANCELLED:        { label: '취소',    color: 'var(--text)' },
  REJECTED:         { label: '거부',    color: '#ef4444' },
};

const OrderList = ({ onNavigate }) => {
  const [stockCode, setStockCode] = useState("");
  const [orderId, setOrderId] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('id,desc');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', page, sort, stockCode, orderId],
    queryFn: () => orders(stockCode, page, sort, orderId),
  });

  const hasFilter = stockCode || orderId;

  const clearAll = () => { setOrderId(''); setStockCode(''); setPage(0); };

  return (
    <div style={s.wrap}>
      {/* 헤더 */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.title}>주문 내역</span>
          {hasFilter && (
            <div style={s.chips}>
              {stockCode && (
                <span style={s.chip}>
                  종목: {stockCode}
                  <button style={s.chipX} onClick={() => { setStockCode(''); setPage(0); }}>✕</button>
                </span>
              )}
              {orderId && (
                <span style={s.chip}>
                  주문 ID: {orderId}
                  <button style={s.chipX} onClick={() => { setOrderId(''); setPage(0); }}>✕</button>
                </span>
              )}
            </div>
          )}
        </div>
        <div style={s.controls}>
          {hasFilter && (
            <button type="button" style={s.clearBtn} onClick={clearAll}>전체 보기</button>
          )}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(0); }}
            style={s.select}
          >
            <option value="id,desc">최신순</option>
            <option value="id,asc">등록순</option>
          </select>
        </div>
      </div>

      {/* 본문 */}
      {isLoading ? (
        <div style={s.feedback}>불러오는 중...</div>
      ) : isError ? (
        <div style={s.feedback}>주문 내역을 불러오지 못했습니다.</div>
      ) : data?.content?.length === 0 ? (
        <div style={s.empty}>주문 내역이 없습니다.</div>
      ) : (
        <>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['#', '주문 ID', '종목', '조건', '구분', '가격', '주문량', '체결량', '잔여량', '상태', '일시'].map(col => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.content.map((order, index) => {
                  const isLimit = order.orderType === 'LIMIT';
                  const isBuy = order.side === 'BUY';
                  const status = STATUS_MAP[order.status] ?? { label: order.status, color: 'var(--text)' };

                  return (
                    <tr key={order.orderId} style={s.tr}>
                      <td style={s.td}>{page * (data.size ?? 10) + index + 1}</td>
                      <td style={s.td}>
                        <button
                          type="button"
                          style={s.linkBtn}
                          onClick={() => { setOrderId(order.orderId); setPage(0); }}
                        >
                          {order.orderId}
                        </button>
                      </td>
                      <td style={s.td}>
                        <button
                          type="button"
                          style={s.linkBtn}
                          onClick={() => { setStockCode(order.stockCode); setPage(0); }}
                        >
                          {order.stockName}
                        </button>
                      </td>
                      <td style={s.td}>{order.orderCondition}</td>
                      <td style={s.td}>
                        <span style={{ ...s.sideBadge, color: isBuy ? '#3b82f6' : '#ef4444' }}>
                          {isBuy ? '매수' : '매도'}
                        </span>
                      </td>
                      <td style={{ ...s.td, fontFamily: 'var(--mono)' }}>
                        {isLimit ? Number(order.price).toLocaleString() : '시장가'}
                      </td>
                      <td style={s.td}>{Number(order.quantity).toLocaleString()}</td>
                      <td style={s.td}>{Number(order.filledQuantity).toLocaleString()}</td>
                      <td style={s.td}>{Number(order.remainingQuantity).toLocaleString()}</td>
                      <td style={s.td}>
                        <span style={{ ...s.statusBadge, color: status.color, borderColor: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: 'var(--text)', fontSize: 11, whiteSpace: 'nowrap' }}>
                        {dayjs(order.createdAt).format('YY.MM.DD HH:mm')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div style={s.pagination}>
            <button
              type="button"
              style={{ ...s.pageBtn, ...(data?.first ? s.pageBtnDisabled : {}) }}
              disabled={data?.first}
              onClick={() => setPage(p => p - 1)}
            >
              ← 이전
            </button>
            <span style={s.pageNum}>{(data?.number ?? page) + 1}</span>
            <button
              type="button"
              style={{ ...s.pageBtn, ...(data?.last ? s.pageBtnDisabled : {}) }}
              disabled={data?.last}
              onClick={() => setPage(p => p + 1)}
            >
              다음 →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const s = {
  wrap: { width: '100%', fontSize: 13 },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  title: { fontSize: 16, fontWeight: 700, color: 'var(--text-h)' },
  chips: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 8px',
    background: 'var(--accent-bg, rgba(170,59,255,0.1))',
    color: 'var(--accent)',
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 10,
  },
  chipX: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--accent)',
    fontSize: 11,
    padding: 0,
    lineHeight: 1,
  },
  controls: { display: 'flex', alignItems: 'center', gap: 8 },
  clearBtn: {
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'none',
    color: 'var(--text)',
    cursor: 'pointer',
  },
  select: {
    padding: '6px 10px',
    fontSize: 12,
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'none',
    color: 'var(--text)',
    cursor: 'pointer',
    outline: 'none',
  },
  tableWrap: {
    border: '1px solid var(--border)',
    borderRadius: 10,
    overflow: 'auto',
    marginBottom: 16,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  th: {
    padding: '9px 14px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text)',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    background: 'rgba(0,0,0,0.03)',
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: {
    padding: '11px 14px',
    color: 'var(--text-h)',
    verticalAlign: 'middle',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: 'var(--accent)',
    fontWeight: 600,
    fontSize: 12,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
  sideBadge: { fontWeight: 700, fontSize: 12 },
  statusBadge: {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: 10,
    border: '1px solid',
    fontSize: 11,
    fontWeight: 600,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pageBtn: {
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 600,
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'none',
    color: 'var(--text)',
    cursor: 'pointer',
  },
  pageBtnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  pageNum: { fontSize: 14, fontWeight: 700, color: 'var(--text-h)', minWidth: 24, textAlign: 'center' },
  feedback: { padding: '40px 0', textAlign: 'center', color: 'var(--text)', fontSize: 14 },
  empty: { padding: '48px 0', textAlign: 'center', color: 'var(--text)', fontSize: 14 },
};

export default OrderList;
