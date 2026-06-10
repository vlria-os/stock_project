import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { cancelOrder, orders } from '../../api/tradeAPI';
import dayjs from 'dayjs';

const OrderList = ({ onNavigate }) => {
  const [status, setStatus]=useState("");
  const [page, setPage]=useState(0);
  const [sort, setSort]=useState('id,desc');
  const [id, setId]=useState("");

  const queryClient=useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', page, sort, status],
    queryFn: () => orders(status, page, sort)
  });

  const cancelMutation=useMutation({
    queryFn: cancelOrder,
    onSuccess: (res) => {
      alert(res + "번 주문 취소");
      queryClient.invalidateQueries({queryKey: ['orders']});
      onNavigate?.("orders");
    },
    onError: (error) => {
      alert(error.response?.data || `${id}번 주문 취소 실패`);
    } 
  });

  const handleOrderCancel=(id)=>{
    if(!id || id === null){
      alert("취소할 주문이 선택되지 않았습니다.");
      return;
    }

    cancelMutation.mutate(id);
  }

  return (
    <div>
      <div className='orders-area'>
        <div className='orders-main'>
          {isLoading ? (
            <div className='orders-loading'>주문 내역 불러오는 중...</div>
          ) : isError ? (
            <div className='orders-error'>주문 내역 불러오기 실패!</div>
          ) : (
            <div className='orders-box'>
              <div className='orders-navi'>
                <div className='orders-status-box'>
                  <button>대기</button>
                  <button>체결</button>
                  <button>취소</button>
                  <button>실패</button>
                  <button>부분 체결</button>
                  <button>부분 취소</button>
                </div>
                <div className='orders-sort-box'>
                  <select value={sort}>
                    <option value='id,desc'>최신순</option>
                    <option value='id,asc'>등록순</option>
                  </select>
                </div>
              </div>
              <div className='orders-table-box'>
                <table className='orders-table'>
                  <thead>
                    <tr>
                      <th>번호</th><th>종목 코드</th><th>주문 유형</th><th>주문 조건</th>
                      <th>매매 구분</th><th>주문 가격</th><th>주문 수량</th><th>체결 수량</th>
                      <th>잔여 수량</th><th>주문 상태</th><th>주문 일시</th><th>주문 취소</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      data?.content?.length === 0 ? (
                        <tr>
                          <td colSpan={11}>
                            주문 내역이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        data?.content?.map((order, index) => {
                          const isPending=order.status === "PENDING" && order.orderCondition === "GTC";
                          const isLimit=order.price !== null && order.price !== "";

                          return (
                            <tr>
                              <td>{index + 1}</td><td>{order.stockCode}</td><td>{order.orderType}</td>
                              <td>{order.orderCondition}</td><td>{order.side}</td><td>{isLimit ? order.price : 0}</td>
                              <td>{order.quantity}</td><td>{order.filledQuantity}</td>
                              <td>{order.remainingQuantity}</td><td>{order.status}</td>
                              <td>{dayjs(order.createdAt).format("YYYY-MM-DD HH:mm:ss")}</td>
                              <td><button type='button' onClick={() => {
                                handleOrderCancel(order.id);
                              }}>취소</button></td>
                            </tr>
                          )
                        })
                      )
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderList