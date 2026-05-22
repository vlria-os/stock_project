package com.example.demo.controller;

import com.example.demo.dto.WishlistResponse;
import com.example.demo.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/stocks/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getWishlist(@RequestHeader("X-User-Id") Long userId){
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }

    @PostMapping("/{stockCode}")
    public ResponseEntity<WishlistResponse> addWishlist(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String stockCode){
        return ResponseEntity.ok(wishlistService.addWishlist(userId, stockCode));
    }

    @DeleteMapping("/{stockCode}")
    public ResponseEntity<Void> removeWishlist(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String stockCode){
        wishlistService.removeWishlist(userId, stockCode);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{stockCode}/check")
    public ResponseEntity<Map<String, Boolean>> isWishlisted(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String stockCode) {
        return ResponseEntity.ok(Map.of("wishlisted", wishlistService.isWishlisted(userId,stockCode)));
    }

}
