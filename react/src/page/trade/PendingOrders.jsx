import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { cancelOrder, pendingOrders } from '../../api/tradeAPI';
import dayjs from 'dayjs';

const STATUS_MAP = {
  PENDING:          { label: '대기',    color: '#f59e0b' },
  PARTIALLY_FILLED: { label: '부분체결', color: '#f59e0b' },
};

const PendingOrders = ({ onNavigate }) => {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("id,desc");

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pendingOrders', page, sort],
    queryFn: () => pendingOrders(page, sort),
  });

  const queryClient = useQueryClient();

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: (res) => {
      alert(`${res}번 주문을 취소했습니다.`);
      queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
    },
    onError: (error) => {
      alert(error.response?.data || "주문 취소 실패!");
    },
  });

  const handleCancel = (id) => {
    if (!id) { alert("취소할 주문이 선택되지 않았습니다."); return; }
    cancelOrderMutation.mutate(id);
  };

  return (
    <div style={s.wrap}>
      {/* 헤더 */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <span style={s.title}>미체결 주문</span>
          {data?.content?.length > 0 && (
            <span style={s.badge}>{data.totalElements ?? data.content.length}건</span>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(0); }}
          style={s.select}
        >
          <option value="id,desc">최신순</option>
          <option value="id,asc">등록순</option>
        </select>
      </div>

      {/* 본문 */}
      {isLoading ? (
        <div style={s.feedback}>불러오는 중...</div>
      ) : isError ? (
        <div style={s.feedback}>미체결 주문을 불러오지 못했습니다.</div>
      ) : data?.content?.length === 0 ? (
        <div style={s.empty}>미체결 주문이 없습니다.</div>
      ) : (
        <>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['#', '종목', '조건', '구분', '가격', '수량', '상태', '주문 일시', '만료일', ''].map((col, i) => (
                    <th key={i} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.content.map((order, index) => {
                  const isPending = order.status === "PENDING";
                  const isBuy = order.side === "BUY";
                  const isLimit = order.orderType === "LIMIT";
                  const status = STATUS_MAP[order.status] ?? { label: order.status, color: 'var(--text)' };
                  const isCancelling = cancelOrderMutation.isPending && cancelOrderMutation.variables === order.id;

                  return (
                    <tr key={order.id} style={s.tr}>
                      <td style={s.td}>{page * (data.size ?? 10) + index + 1}</td>
                      <td style={{ ...s.td, fontWeight: 600, color: 'var(--text-h)' }}>{order.stockName}</td>
                      <td style={s.td}>{order.orderCondition}</td>
                      <td style={s.td}>
                        <span style={{ ...s.sideBadge, color: isBuy ? '#3b82f6' : '#ef4444' }}>
                          {isBuy ? '매수' : '매도'}
                        </span>
                      </td>
                      <td style={{ ...s.td, fontFamily: 'var(--mono)' }}>
                        {isLimit ? Number(order.price).toLocaleString() : '시장가'}
                      </td>
                      <td style={s.td}>{Number(order.quantity).toLocaleString()}주</td>
                      <td style={s.td}>
                        <span style={{ ...s.statusBadge, color: status.color, borderColor: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ ...s.td, fontSize: 11, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        {dayjs(order.createdAt).format('YY.MM.DD HH:mm')}
                      </td>
                      <td style={{ ...s.td, fontSize: 11, color: 'var(--text)' }}>
                        {order.expiredAt ? dayjs(order.expiredAt).format('YY.MM.DD') : '—'}
                      </td>
                      <td style={s.td}>
                        <button
                          type="button"
                          disabled={!isPending || isCancelling}
                          onClick={() => handleCancel(order.id)}
                          style={{
                            ...s.cancelBtn,
                            ...(isPending && !isCancelling ? s.cancelBtnActive : s.cancelBtnDisabled),
                          }}
                        >
                          {isCancelling ? '취소 중' : '취소'}
                        </button>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '1px solid var(--border)',
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: 700, color: 'var(--text-h)' },
  badge: {
    background: 'rgba(245,158,11,0.12)',
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10,
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
  td: { padding: '11px 14px', color: 'var(--text-h)', verticalAlign: 'middle' },
  sideBadge: { fontWeight: 700, fontSize: 12 },
  statusBadge: {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: 10,
    border: '1px solid',
    fontSize: 11,
    fontWeight: 600,
  },
  cancelBtn: {
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cancelBtnActive: {
    border: '1px solid #ef4444',
    color: '#ef4444',
    background: 'none',
  },
  cancelBtnDisabled: {
    border: '1px solid var(--border)',
    color: 'var(--text)',
    background: 'none',
    opacity: 0.35,
    cursor: 'not-allowed',
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

export default PendingOrders;
