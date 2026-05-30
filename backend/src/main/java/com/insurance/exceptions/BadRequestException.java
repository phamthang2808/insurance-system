package com.insurance.exceptions;

/**
 * Exception khi request khĂ´ng há»£p lá»‡
 * Status code: 400 Bad Request
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}

