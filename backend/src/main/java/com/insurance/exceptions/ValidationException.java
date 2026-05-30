package com.insurance.exceptions;
/**
 * Exception khi validation dá»¯ liá»‡u tháº¥t báº¡i
 * Status code: 422 Unprocessable Entity
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}

