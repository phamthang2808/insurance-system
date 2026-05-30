package com.insurance.exceptions;

/**
 * Exception khi user chÆ°a Ä‘Äƒng nháº­p hoáº·c khĂ´ng cĂ³ quyá»n truy cáº­p
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}

