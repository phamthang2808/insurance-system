package com.insurance.exceptions;


import java.util.HashMap;
import java.util.Map;

import com.insurance.utils.MessageKeys;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.insurance.components.LocalizationUtils;

import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final LocalizationUtils localizationUtils;

    /**
     * Xá»­ lĂ½ lá»—i Ä‘Äƒng nháº­p: Email hoáº·c máº­t kháº©u khĂ´ng Ä‘Ăºng
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException ex) {
        String message = localizationUtils.getLocalizedMessage(MessageKeys.WRONG_EMAIL_PASSWORD);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.UNAUTHORIZED.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Xá»­ lĂ½ AuthenticationException (custom exception)
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex) {
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : localizationUtils.getLocalizedMessage(MessageKeys.WRONG_EMAIL_PASSWORD);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.UNAUTHORIZED.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Xá»­ lĂ½ Spring Security AuthenticationException
     */
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleSpringAuthenticationException(
            org.springframework.security.core.AuthenticationException ex) {
        String message = localizationUtils.getLocalizedMessage(MessageKeys.WRONG_EMAIL_PASSWORD);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.UNAUTHORIZED.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Xá»­ lĂ½ DataNotFoundException
     */
    @ExceptionHandler(DataNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDataNotFoundException(DataNotFoundException ex) {
        // Náº¿u exception cĂ³ message tĂ¹y chá»‰nh, dĂ¹ng message Ä‘Ă³, khĂ´ng localize
        // Náº¿u khĂ´ng, dĂ¹ng default message Ä‘Ă£ Ä‘Æ°á»£c localize
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : localizationUtils.getLocalizedMessage(MessageKeys.DATA_NOT_FOUND);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.NOT_FOUND.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    /**
     * Xá»­ lĂ½ InvalidParamException
     */
    @ExceptionHandler(InvalidParamException.class)
    public ResponseEntity<ErrorResponse> handleInvalidParamException(InvalidParamException ex) {
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : localizationUtils.getLocalizedMessage(MessageKeys.INVALID_PARAM);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.BAD_REQUEST.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xá»­ lĂ½ PermissionDenyException
     */
    @ExceptionHandler(PermissionDenyException.class)
    public ResponseEntity<ErrorResponse> handlePermissionDenyException(PermissionDenyException ex) {
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : localizationUtils.getLocalizedMessage(MessageKeys.PERMISSION_DENIED);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.FORBIDDEN.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    /**
     * Xá»­ lĂ½ UnauthorizedException (chÆ°a Ä‘Äƒng nháº­p)
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex) {
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : localizationUtils.getLocalizedMessage(MessageKeys.UNAUTHORIZED);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.UNAUTHORIZED.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Xá»­ lĂ½ MethodArgumentNotValidException (@Valid on @RequestBody)
     * Tráº£ vá» chi tiáº¿t lá»—i validation cho tá»«ng field
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException ex) {

        // Láº¥y lá»—i Ä‘áº§u tiĂªn
        FieldError firstError = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .orElse(null);

        String message = firstError != null
                ? firstError.getDefaultMessage()
                : "Lá»—i xĂ¡c thá»±c dá»¯ liá»‡u";

        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.BAD_REQUEST.value())
                .data(null)
                .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xá»­ lĂ½ ConstraintViolationException (@Validated on class level)
     * Tráº£ vá» chi tiáº¿t lá»—i constraint violation
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation ->
                errors.put(violation.getPropertyPath().toString(), violation.getMessage())
        );

        ErrorResponse error = ErrorResponse.builder()
                .message("Lá»—i xĂ¡c thá»±c dá»¯ liá»‡u")
                .status(HttpStatus.BAD_REQUEST.value())
                .data(errors)
                .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xá»­ lĂ½ IllegalArgumentException (validation errors)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : localizationUtils.getLocalizedMessage(MessageKeys.INVALID_PARAM);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.BAD_REQUEST.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xá»­ lĂ½ ConflictException (409 Conflict - dá»¯ liá»‡u Ä‘Ă£ tá»“n táº¡i)
     */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflictException(ConflictException ex) {
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : localizationUtils.getLocalizedMessage(MessageKeys.CONFLICT);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.CONFLICT.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    /**
     * Xá»­ lĂ½ ValidationException (422 Unprocessable Entity - validation tháº¥t báº¡i)
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex) {
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : localizationUtils.getLocalizedMessage(MessageKeys.VALIDATION_ERROR);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    /**
     * Xá»­ lĂ½ RuntimeException (Bad Request)
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : localizationUtils.getLocalizedMessage(MessageKeys.RUNTIME_ERROR);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.BAD_REQUEST.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Xá»­ lĂ½ táº¥t cáº£ exceptions khĂ¡c (Internal Server Error)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : localizationUtils.getLocalizedMessage(MessageKeys.INTERNAL_SERVER_ERROR);
        ErrorResponse error = ErrorResponse.builder()
                .message(message)
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .data(null)
                .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}


