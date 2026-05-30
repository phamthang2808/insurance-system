package com.insurance.exceptions;
/**
 * Exception khi xĂ¡c thá»±c tháº¥t báº¡i (authentication failed)
 * Status code: 401 Unauthorized
 * Sá»­ dá»¥ng khi: Email/máº­t kháº©u sai, token khĂ´ng há»£p lá»‡, hoáº·c xĂ¡c thá»±c tháº¥t báº¡i
 */
public class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }
    
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}

