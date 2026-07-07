package com.TeachMe.TeachMe.exception;

public class RateLimitExceededException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public RateLimitExceededException(String message) {
        super(message);
    }
}
