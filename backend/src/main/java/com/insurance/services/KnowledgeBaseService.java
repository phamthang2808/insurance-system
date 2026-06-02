package com.insurance.services;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class KnowledgeBaseService {

    @Value("${knowledge.base.path:knowledge_base}")
    private String knowledgeBasePath;

    private final List<String> documentChunks = new ArrayList<>();

    @PostConstruct
    public void init() {
        log.info("Initializing Knowledge Base from path: {}", knowledgeBasePath);
        File folder = new File(knowledgeBasePath);
        if (!folder.exists()) {
            folder.mkdirs();
            log.info("Created knowledge base directory. Please add PDF, TXT, or MD files to it.");
            return;
        }

        File[] listOfFiles = folder.listFiles((dir, name) -> {
            String lower = name.toLowerCase();
            return lower.endsWith(".pdf") || lower.endsWith(".txt") || lower.endsWith(".md");
        });
        if (listOfFiles != null) {
            for (File file : listOfFiles) {
                if (file.isFile()) {
                    if (file.getName().toLowerCase().endsWith(".pdf")) {
                        loadPdf(file);
                    } else {
                        loadTextOrMarkdown(file);
                    }
                }
            }
        }
        log.info("Loaded {} chunks of text from knowledge base.", documentChunks.size());
    }

    private void loadPdf(File file) {
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String text = pdfStripper.getText(document);
            chunkText(text, file.getName());
        } catch (IOException e) {
            log.error("Failed to load PDF file: {}", file.getName(), e);
        }
    }

    private void loadTextOrMarkdown(File file) {
        try {
            String text = java.nio.file.Files.readString(file.toPath(), java.nio.charset.StandardCharsets.UTF_8);
            chunkText(text, file.getName());
        } catch (IOException e) {
            log.error("Failed to load text/markdown file: {}", file.getName(), e);
        }
    }

    private void chunkText(String text, String source) {
        // Simple chunking strategy: split by paragraphs or fixed length
        // For MVP, split by double newline and add source info
        String[] paragraphs = text.split("\n\\s*\n");
        for (String paragraph : paragraphs) {
            if (paragraph.trim().length() > 50) { // Ignore very short snippets
                documentChunks.add("Source: " + source + "\n" + paragraph.trim());
            }
        }
    }

    public List<String> getRelevantContext(String query, int topK) {
        // In a real system, we would use vector embeddings and cosine similarity.
        // For this MVP, we do a very naive keyword match to find relevant chunks.
        String[] keywords = query.toLowerCase().split("\\s+");
        
        List<ScoredChunk> scoredChunks = new ArrayList<>();
        
        for (String chunk : documentChunks) {
            String chunkLower = chunk.toLowerCase();
            int score = 0;
            for (String keyword : keywords) {
                if (keyword.length() > 3 && chunkLower.contains(keyword)) {
                    score++;
                }
            }
            if (score > 0) {
                scoredChunks.add(new ScoredChunk(chunk, score));
            }
        }
        
        // Sort by score descending
        scoredChunks.sort((a, b) -> Integer.compare(b.score, a.score));
        
        List<String> results = new ArrayList<>();
        for (int i = 0; i < Math.min(topK, scoredChunks.size()); i++) {
            results.add(scoredChunks.get(i).chunk);
        }
        
        return results;
    }

    private static class ScoredChunk {
        String chunk;
        int score;

        ScoredChunk(String chunk, int score) {
            this.chunk = chunk;
            this.score = score;
        }
    }
}
