package com.example.demo.order.repository;

import com.example.demo.order.entity.Orders;
import com.example.demo.order.enums.OrderCondition;
import com.example.demo.order.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OrdersRepository extends JpaRepository<Orders, Long> {
    Optional<Orders> findById(Long id);
    List<Orders> findByOrderConditionAndExpiredAtAndStatusIn(OrderCondition orderCondition,
                                                           LocalDate expiredAt, List<Status> statuses);

    List<Orders> findByUserIdAndStatusIn(Long userId, List<Status> statuses);
    List<Orders> findByStatusInAndOrderCondition(List<Status> statuses, OrderCondition orderCondition);
}
