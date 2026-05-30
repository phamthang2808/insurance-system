package com.insurance.exceptions;

/**
 * Exception khi khĂ´ng cĂ³ quyá»n thá»±c hiá»‡n hĂ nh Ä‘á»™ng
 * Extends RuntimeException Ä‘á»ƒ KHĂ”NG Cáº¦N khai bĂ¡o throws
 */
public class PermissionDenyException extends RuntimeException {
    public PermissionDenyException(String message) {
        super(message);
    }
}