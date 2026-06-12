package com.TeachMe.TeachMe.exception;

public class FileProcessingException extends RuntimeException {

    // Constructor 1: Accepts just a message (1 argument)
    public FileProcessingException(String message) {
        super(message);
    }

    // Constructor 2: Accepts a message AND the original root cause (2 arguments)
    public FileProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}