package com.example.demo.security.jwt;

public class CustomJwtException extends RuntimeException{
    public CustomJwtException(String message){
        super(message);
    }
}
