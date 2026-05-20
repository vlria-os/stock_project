package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Value("${kis.base-url}")
    private String kisBaseUrl;

    @Bean
    public WebClient kisWebClient(){
        return WebClient.builder()
                .baseUrl(kisBaseUrl)
                .build();
    }
}
