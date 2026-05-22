package com.example.demo.service;

import com.example.demo.order.entity.Orders;
import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.Status;
import com.example.demo.order.repository.OrdersRepository;
import com.example.demo.redis.OrderBookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderScheduler {
    private final OrdersRepository ordersRepository;
    private final OrderBookRepository orderBookRepository;

    @Scheduled(cron = "0 30 8 * * MON-FRI")
    public void cancelExpiredOrders(){
        List<Orders> expiredOrders=ordersRepository.findByOrderConditionAndExpiredAtAndStatusIn(
                OrderCondition.GTC, LocalDate.now(), List.of(Status.PENDING, Status.PARTIALLY_FILLED)
        );

        for (Orders order:expiredOrders){
            orderBookRepository.removeOrder(order);

            if (order.getStatus() == Status.PARTIALLY_FILLED){
                order.setStatus(Status.PARTIALLY_CANCELLED);
            } else {
                order.setStatus(Status.CANCELLED);
            }

            ordersRepository.save(order);
        }
    }
}
