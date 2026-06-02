package com.example.demo.service;

import com.example.demo.dto.WishlistResponse;
import com.example.demo.entity.Stock;
import com.example.demo.entity.Wishlist;
import com.example.demo.repository.StockRepository;
import com.example.demo.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final StockRepository stockRepository;

    //조회
    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(wishlist -> {
                    Stock stock = stockRepository.findByCode(wishlist.getStockCode())
                            .orElse(null);
                    return WishlistResponse.of(wishlist, stock);
                })
                .collect(Collectors.toList());
    }

    //추가
    @Transactional
    public WishlistResponse addWishlist(Long userId, String stockCode){
        if(wishlistRepository.existsByUserIdAndStockCode(userId, stockCode)){
            throw new IllegalStateException("이미 위시리스트에 추가된 종목입니다");
        }
        Stock stock = stockRepository.findByCode(stockCode)
                .orElseThrow(()-> new IllegalArgumentException("존재하지 않는 종목코드입니다: " + stockCode));
        Wishlist wishlist = Wishlist.builder()
                .userId(userId)
                .stockCode(stockCode)
                .build();
        Wishlist saved = wishlistRepository.save(wishlist);
        return WishlistResponse.of(saved, stock);
    }

    //제거
    @Transactional
    public void removeWishlist(Long userId, String stockCode){
        if(!wishlistRepository.existsByUserIdAndStockCode(userId, stockCode)){
            throw new IllegalArgumentException("위시리스트에 없는 종목입니다");
        }
        wishlistRepository.deleteByUserIdAndStockCode(userId, stockCode);
    }

    //여부확인
    @Transactional(readOnly = true)
    public boolean isWishlisted(Long userId, String stockCode){
        return wishlistRepository.existsByUserIdAndStockCode(userId, stockCode);
    }

    @Transactional
    public void deleteByUserId(Long userId){
        wishlistRepository.deleteByUserId(userId);
    }
}
