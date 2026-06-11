import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'
import { trades } from '../../api/tradeAPI';
import dayjs from 'dayjs';

const TradeList = () => {
  const [stockCode, setStockCode]=useState("");
  const [orderId, setOrderId]=useState("");
  const [page, setPage]=useState(0);
  const [sort, setSort]=useState('id,desc');
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['trades', page, sort, stockCode, orderId],
    queryFn: () => trades(page, sort, orderId, stockCode)
  });

  return (
    <div>
      <div className='trades-area'>
        <div className='tradess-main'>
          {isLoading ? (
            <div className='trades-loading'>체결 내역 불러오는 중...</div>
          ) : isError ? (
            <div className='trades-error'>체결 내역 불러오기 실패!</div>
          ) : (
            <div className='trades-box'>
              <div className='trades-navi'>
                <div className='trades-all-btn'>
                  <button type='button' onClick={() => {
                    setTradeId('');
                    setStockCode('');
                  }}>전체 보기</button>
                </div>
                <div className='trades-sort-box'>
                  <select value={sort} onChange={(e) => {
                    setSort(e.target.value);
                  }}>
                    <option value='id,desc'>최신순</option>
                    <option value='id,asc'>등록순</option>
                  </select>
                </div>
              </div>
              <div className='trades-table-box'>
                <table className='trades-table'>
                  <thead>
                    <tr>
                      <th>번호</th><th>주문 ID</th><th>체결 종목</th><th>주문 조건</th>
                      <th>매매 구분</th><th>주문 가격</th><th>체결 수량</th><th>체결 금액</th>
                      <th>체결 일시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      data?.content?.length === 0 ? (
                        <tr>
                          <td colSpan={9}>
                            체결 내역이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        data?.content?.map((trade, index) => {
                          const isLimit=trade.orderType === "LIMIT";

                          console.log("userId: " + trade.userId);

                          return (
                            <tr>
                              <td>{index + 1}</td>
                              <td>
                                <button type='button' onClick={() => setOrderId(trade.orderId)}>
                                  {trade.orderId}
                                </button>
                              </td>
                              <td>
                                <button type='button' onClick={() => setStockCode(trade.stockCode)}>
                                  {trade.stockName}
                                </button>
                              </td>
                              <td>{trade.orderCondition}</td><td>{trade.side === "BUY" ? "매수":"매도"}</td>
                              <td>{trade.price}</td>
                              <td>{trade.quantity}주</td><td>{trade.totalAmount}</td>
                              <td>{dayjs(trade.createdAt).format("YYYY-MM-DD HH:mm:ss")}</td>
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

export default TradeList