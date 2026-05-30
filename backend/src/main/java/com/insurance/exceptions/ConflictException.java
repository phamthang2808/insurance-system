package com.insurance.exceptions;
/**
 * Exception khi cĂ³ conflict dá»¯ liá»‡u (vĂ­ dá»¥: email Ä‘Ă£ tá»“n táº¡i, username Ä‘Ă£ dĂ¹ng)
 * Status code: 409 Conflict
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}

