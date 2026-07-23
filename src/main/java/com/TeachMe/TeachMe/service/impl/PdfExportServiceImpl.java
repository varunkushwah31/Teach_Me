package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.service.PdfExportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class PdfExportServiceImpl implements PdfExportService {

    @Override
    public byte[] generateSummaryPdf(Long documentId) {
        log.info("Generating PDF summary document for document ID {}", documentId);

        String pdfMockContent = "%PDF-1.4\n" +
                "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n" +
                "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n" +
                "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj\n" +
                "4 0 obj << /Length 120 >> stream\n" +
                "BT /F1 16 Tf 50 750 TD (TeachMe AI Academic Summary - Document #" + documentId + ") Tj ET\n" +
                "endstream endobj\n" +
                "xref\n0 5\n0000000000 65535 f \n" +
                "trailer << /Size 5 /Root 1 0 R >>\nstartxref\n320\n%%EOF";

        return pdfMockContent.getBytes(StandardCharsets.UTF_8);
    }
}
