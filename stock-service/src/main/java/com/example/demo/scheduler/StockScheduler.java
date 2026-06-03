package com.example.demo.scheduler;

import com.example.demo.entity.Stock;
import com.example.demo.repository.StockRepository;
import com.example.demo.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockScheduler {

    private final StockService stockService;
    private final StockRepository stockRepository;

    @Scheduled(cron = "0 */1 9-15 * * MON-FRI", zone = "Asia/Seoul") //주식 장 시간 내 1분마다
    public void updateAllStockPrices(){
        List<Stock> stocks=stockRepository.findAll();

        if(stocks.isEmpty()) return;

        log.info("주식 현재가 업데이트 시작 - 총 {}개 종목", stocks.size());

        for(Stock stock : stocks){
            stockService.updateStockCache(stock.getCode());
        }

        log.info("주식 현재가 업데이트 완료");
    }
}
