import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { cancelOrder, orders } from '../../api/tradeAPI';
import dayjs from 'dayjs';

const OrderList = ({ onNavigate }) => {
  const [stockCode, setStockCode]=useState("");
  const [orderId, setOrderId]=useState("");
  const [page, setPage]=useState(0);
  const [sort, setSort]=useState('id,desc');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', page, sort, stockCode, orderId],
    queryFn: () => orders(stockCode, page, sort, orderId)
  });

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
                <div className='orders-all-btn'>
                  <button type='button' onClick={() => {
                    setOrderId('');
                    setStockCode('');
                  }}>전체 보기</button>
                </div>
                <div className='orders-stockCode-box'>
                  <input type='text' placeholder='종목 코드를 검색하세요.' value={stockCode}
                    onChange={(e) => setStockCode(e.target.value)}/>
                </div>
                <div className='orders-sort-box'>
                  <select value={sort} onChange={(e) => {
                    setSort(e.target.value);
                  }}>
                    <option value='id,desc'>최신순</option>
                    <option value='id,asc'>등록순</option>
                  </select>
                </div>
              </div>
              <div className='orders-table-box'>
                <table className='orders-table'>
                  <thead>
                    <tr>
                      <th>번호</th><th>주문 ID</th><th>주문 종목</th><th>주문 조건</th>
                      <th>매매 구분</th><th>주문 가격</th><th>주문 수량</th><th>체결 수량</th>
                      <th>잔여 수량</th><th>주문 상태</th><th>주문 일시</th>
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
                          const isLimit=order.orderType === "LIMIT";

                          console.log("userId: " + order.userId);

                          return (
                            <tr>
                              <td>{index + 1}</td>
                              <td>{order.orderId}</td><td>{order.stockName}</td>
                              <td>{order.orderCondition}</td><td>{order.side === "BUY" ? "매수":"매도"}</td>
                              <td>{isLimit ? order.price : "시장가"}</td>
                              <td>{order.quantity}주</td><td>{order.filledQuantity}주</td>
                              <td>{order.remainingQuantity}주</td><td>{order.status}</td>
                              <td>{dayjs(order.createdAt).format("YYYY-MM-DD HH:mm:ss")}</td>
                            </tr>
                          )
                        })
                      )
                    }
                  </tbody>
                </table>
              </div>
              <div className='orders-paging-area'>
                  <button type='button' disabled={data?.first}
                    onClick={() => setPage((p) => p - 1)}>
                    이전
                  </button>
                  <span>{data?.number != null ? data.number + 1 : ''}</span>
                  <button type='button' disabled={data?.last}
                    onClick={() => setPage((p) => p + 1)}>
                    다음
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderList