package com.insurance.exceptions;

/**
 * Exception khi tham sá»‘ khĂ´ng há»£p lá»‡
 * Extends RuntimeException Ä‘á»ƒ KHĂ”NG Cáº¦N khai bĂ¡o throws
 */
public class InvalidParamException extends RuntimeException {
    public InvalidParamException(String message) {
        super(message);
    }
}
