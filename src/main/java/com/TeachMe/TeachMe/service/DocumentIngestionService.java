package com.TeachMe.TeachMe.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentIngestionService {

    private final VectorStore vectorStore;

    //  Notice the new 'category' parameter
    public String ingestPdf(MultipartFile file, String category) throws IOException {
        log.info("Starting ingestion for file: {} in category: {}", file.getOriginalFilename(), category);

        TikaDocumentReader reader = new TikaDocumentReader(new InputStreamResource(file.getInputStream()));
        List<Document> rawDocuments = reader.get();

        //  NEW: Inject custom metadata into every page before splitting
        List<Document> enrichedDocuments = rawDocuments.stream()
                .map(doc -> {
                    Map<String, Object> newMetadata = new HashMap<>(doc.getMetadata());
                    newMetadata.put("fileName", file.getOriginalFilename());
                    newMetadata.put("category", category);

                    return Document.builder()
                            .id(doc.getId())
                            .text(doc.getText())
                            .metadata(newMetadata)
                            .build();
                })
                .toList();

        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(100)
                .withMinChunkLengthToEmbed(5)
                .withMaxNumChunks(10000)
                .withKeepSeparator(true)
                .build();

        // Pass the enriched documents to the splitter
        List<Document> splitDocuments = splitter.apply(enrichedDocuments);
        log.info("Split document into {} vectorized chunks. Saving to PostgreSQL...", splitDocuments.size());

        this.vectorStore.accept(splitDocuments);

        log.info("Successfully saved to database.");
        return "Successfully processed and embedded " + splitDocuments.size() + " text chunks into the database.";
    }
}