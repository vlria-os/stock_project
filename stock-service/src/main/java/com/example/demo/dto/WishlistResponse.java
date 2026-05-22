package com.example.demo.dto;

import com.example.demo.entity.Stock;
import com.example.demo.entity.Wishlist;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class WishlistResponse {
    private Long id;
    private String stockCode;
    private String stockName;
    private String market;
    private BigDecimal currentPrice;
    private BigDecimal prevPrice;
    private LocalDateTime addedAt;

    //엔티티 -> dto
    public static WishlistResponse of(Wishlist wishlist, Stock stock){
        return WishlistResponse.builder()
                .id(wishlist.getId())
                .stockCode(wishlist.getStockCode())
                .stockName(stock !=null? stock.getName() : null)
                .market(stock != null ? stock.getMarket() : null)
                .currentPrice(stock != null? stock.getCurrentPrice() : null)
                .prevPrice(stock != null? stock.getPrevPrice() : null)
                .addedAt(wishlist.getCreatedAt())
                .build();
    }
}
