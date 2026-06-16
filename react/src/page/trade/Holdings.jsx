import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { holdings } from '../../api/tradeAPI';

const Holdings = () => {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['holdings', page],
    queryFn: () => holdings(page),
  });

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.title}>보유 주식</span>
        {data?.content?.length > 0 && (
          <span style={s.badge}>{data.totalElements ?? data.content.length}종목</span>
        )}
      </div>

      {isLoading ? (
        <div style={s.feedback}>불러오는 중...</div>
      ) : isError ? (
        <div style={s.feedback}>데이터를 불러오지 못했습니다.</div>
      ) : data?.content?.length === 0 ? (
        <div style={s.empty}>보유 중인 주식이 없습니다.</div>
      ) : (
        <>
          <div style={s.table}>
            <div style={s.colHeader}>
              <span>종목명</span>
              <span>보유 수량</span>
            </div>
            {data.content.map((stock, i) => (
              <div key={i} style={s.row}>
                <span style={s.stockName}>{stock.stockName}</span>
                <span style={s.qty}>{Number(stock.holdings).toLocaleString()}주</span>
              </div>
            ))}
          </div>

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
  wrap: {
    width: '100%',
    fontSize: 13,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '1px solid var(--border)',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-h)',
  },
  badge: {
    background: 'var(--accent-bg, rgba(170,59,255,0.1))',
    color: 'var(--accent)',
    fontSize: 12,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10,
  },
  table: {
    border: '1px solid var(--border)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  colHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '9px 16px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
    background: 'rgba(0,0,0,0.03)',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '13px 16px',
    borderBottom: '1px solid var(--border)',
  },
  stockName: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-h)',
  },
  qty: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--accent)',
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
  pageBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  pageNum: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text-h)',
    minWidth: 24,
    textAlign: 'center',
  },
  feedback: {
    padding: '40px 0',
    textAlign: 'center',
    color: 'var(--text)',
    fontSize: 14,
  },
  empty: {
    padding: '48px 0',
    textAlign: 'center',
    color: 'var(--text)',
    fontSize: 14,
  },
};

export default Holdings;
