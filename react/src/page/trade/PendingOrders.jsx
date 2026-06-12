import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { cancelOrder, pendingOrders } from '../../api/tradeAPI';
import dayjs from 'dayjs';

const PendingOrders = ({ onNavigate }) => {
  const [page, setPage]=useState(0);
  const [sort, setSort]=useState("id,desc");

  const { data, isLoading, isError }=useQuery({
    queryKey: ['pendingOrders', page, sort],
    queryFn: () => pendingOrders(page, sort)
  });

  const queryClient=useQueryClient();

  const cancelOrderMutation=useMutation({
    mutationFn: cancelOrder,
    onSuccess: (res) => {
        alert(res + "번 주문을 취소했습니다.");
        queryClient.invalidateQueries({ queryKey: ['pendingsOrders']});
        onNavigate("pendingOrders", { onNavigate: onNavigate });
    },
    onError: (error) => {
        alert(error.response?.data || "주문 취소 실패!");
    }
  });

  const handleCancel=(id)=>{
    if(!id) {
        alert("취소할 주문이 선택되지 않았습니다.");
        return;
    }

    cancelOrderMutation.mutate(id);
  }

  return (
    <div>
        {
            isLoading ? (
                <div>미체결 주문 내역 불러오는 중...</div>
            ) : isError ? (
                <div>미체결 주문 내역 불러오기 실패!</div>
            ) : (
                <div>
                    <div>
                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value='id,desc'>최신순</option>
                            <option value='id,asc'>등록순</option>
                        </select>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>번호</th><th>주문 종목</th><th>주문 조건</th><th>매매 구분</th>
                                <th>주문 가격</th><th>주문 수량</th><th>주문 상태</th>
                                <th>주문 일시</th><th>만료일</th><th>주문 취소</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data?.content?.length === 0 ? (
                                    <tr>
                                        <td colSpan={10}>미체결 주문 내역이 없습니다.</td>
                                    </tr>
                                ) : (
                                    data?.content?.map((order, index) => {
                                        const isPending = order.status !== null && order.status === "PENDING";
                                        const hasExpiredAt = order.expiredAt !== null;

                                        return <tr>
                                            <td>{index + 1}</td><td>{order.stockName}</td>
                                            <td>{order.orderCondition}</td><td>{order.side === "BUY" ? "매수":"매도"}</td>
                                            <td>{order.orderType === "LIMIT" ? order.price : "시장가"}</td>
                                            <td>{order.quantity}주</td><td>{order.status}</td>
                                            <td>{dayjs(order.createdAt).format("YYYY-MM-DD HH:mm:ss")}</td>
                                            <td>{hasExpiredAt ? dayjs(order.expiredAt).format("YYYY-MM-DD")
                                                    :"X"}</td>
                                            <td>
                                                <button type='button' disabled={!isPending}
                                                    onClick={() => handleCancel(order.id)}>
                                                    취소
                                                </button>
                                            </td>
                                        </tr>
                                    })
                                )
                            }
                        </tbody>
                    </table>
                    <div>
                        <button type='button' disabled={data?.first}
                            onClick={() => setPage((p) => p - 1)}>
                            이전
                        </button>
                        <span>{data?.number !== null ? data?.number + 1 :''}</span>
                        <button type='button' disabled={data?.last}
                            onClick={() => setPage((p) => p + 1)}>
                            다음
                        </button>
                    </div>
                </div>
            )
        }
    </div>
  )
}

export default PendingOrders