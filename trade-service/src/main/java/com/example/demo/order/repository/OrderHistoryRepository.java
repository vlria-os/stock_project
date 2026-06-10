package com.example.demo.order.repository;

import com.example.demo.order.dto.OrderHistoryResponse;
import com.example.demo.order.entity.OrderHistory;
import com.example.demo.order.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
    @Query("""
        select o
        from OrderHistory o
        where o.userId = :userId
            and (:status is null or o.status = :status)
    """)
    Page<OrderHistory> findMyOrders(@Param("userId") Long userId, @Param("status") Status status, Pageable pageable);
}
