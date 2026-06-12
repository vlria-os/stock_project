import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'
import { holdings } from '../../api/tradeAPI';

const Holdings = () => {
  const [page, setPage]=useState(0);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['holdings', page],
    queryFn: () => holdings(page)
  });

  return (
    <div>
      {
        isLoading ? (
          <div></div>
        ) : isError ? (
          <div></div>
        ) : (
          <div>
            {
              data?.content?.length === 0 ? (
                <div>보유 주식이 없습니다.</div>
              ) : (
                <div>
                  <table>
                  {
                    data?.content?.map((stock) => {
                      return <tr>
                        <th>{stock.stockName}</th><td>{stock.holdings}주</td>
                      </tr>
                    })
                  }
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
    </div>
  )
}

export default Holdings