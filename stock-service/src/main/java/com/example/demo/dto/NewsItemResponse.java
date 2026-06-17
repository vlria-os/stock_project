package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NewsItemResponse {
    private String title;
    private String link;
    private String pubDate;
    private String description;
}
