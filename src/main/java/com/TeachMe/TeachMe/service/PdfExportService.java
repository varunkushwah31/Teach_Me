package com.TeachMe.TeachMe.service;

public interface PdfExportService {
    byte[] generateSummaryPdf(Long documentId);
}
