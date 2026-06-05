package com.insurance.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatbotService {

    private final KnowledgeBaseService knowledgeBaseService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    @SuppressWarnings("unchecked")
    public String askQuestion(String username, String question) {
        if (openAiApiKey == null || openAiApiKey.isEmpty()) {
            return "Xin lỗi, hệ thống chưa được cấu hình OpenAI API Key để trả lời tự động.";
        }

        // 1. Retrieve context
        List<String> contexts = knowledgeBaseService.getRelevantContext(question, 3);
        if (contexts == null || contexts.isEmpty()) {
            return "Xin lỗi, tôi không tìm thấy thông tin này trong tài liệu công ty, vui lòng liên hệ nhân viên hỗ trợ.";
        }
        String contextStr = String.join("\n\n---\n\n", contexts);

        // 2. Build Prompt
        String systemPrompt = "Bạn là trợ lý ảo hỗ trợ khách hàng của công ty bảo hiểm. " +
                "Bạn chỉ được phép trả lời dựa trên thông tin sau đây (được trích xuất từ tài liệu công ty). " +
                "Nếu thông tin không có trong tài liệu, hãy nói 'Xin lỗi, tôi không tìm thấy thông tin này trong tài liệu công ty, vui lòng liên hệ nhân viên hỗ trợ'.\n\n" +
                "QUY TẮC ĐỊNH DẠNG CÂU TRẢ LỜI:\n" +
                "- Mỗi ý/mục thông tin phải xuống dòng riêng biệt.\n" +
                "- Dùng dấu gạch đầu dòng (-) cho danh sách.\n" +
                "- Không viết tất cả thông tin thành một đoạn văn dài.\n\n" +
                "TÀI LIỆU CÔNG TY:\n" + contextStr;

        // 3. Load Chat History from Redis
        String redisKey = "chat:history:" + username;
        List<Map<String, String>> history = null;
        try {
            history = (List<Map<String, String>>) redisTemplate.opsForValue().get(redisKey);
        } catch (Exception e) {
            log.error("Failed to load chat history from Redis for key: {}", redisKey, e);
        }
        if (history == null) {
            history = new java.util.ArrayList<>();
        }

        // 4. Construct OpenAI Messages Payload
        List<Map<String, String>> messages = new java.util.ArrayList<>();
        
        // System prompt
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);
        messages.add(systemMessage);

        // Add history (max 8 messages to prevent token bloat)
        int startIdx = Math.max(0, history.size() - 8);
        for (int i = startIdx; i < history.size(); i++) {
            messages.add(history.get(i));
        }

        // Add current user question
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", question);
        messages.add(userMessage);

        // 5. Call OpenAI API using RestTemplate
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", messages.toArray());
        requestBody.put("temperature", 0.3);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_URL, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String answer = (String) message.get("content");

                    // 6. Save current turn to history and push to Redis
                    Map<String, String> userHistory = new HashMap<>();
                    userHistory.put("role", "user");
                    userHistory.put("content", question);
                    
                    Map<String, String> assistantHistory = new HashMap<>();
                    assistantHistory.put("role", "assistant");
                    assistantHistory.put("content", answer);

                    history.add(userHistory);
                    history.add(assistantHistory);

                    // Maintain max size of 16 messages
                    if (history.size() > 16) {
                        history = history.subList(history.size() - 16, history.size());
                    }

                    try {
                        redisTemplate.opsForValue().set(redisKey, history, 30, TimeUnit.MINUTES);
                        log.info("Successfully saved multi-turn chat turn in Redis for key: {}", redisKey);
                    } catch (Exception e) {
                        log.error("Failed to write chat history to Redis", e);
                    }

                    return answer;
                }
            }
            return "Lỗi phân tích phản hồi từ AI.";
        } catch (Exception e) {
            log.error("Error calling OpenAI API", e);
            return "Xin lỗi, dịch vụ Chatbot đang tạm thời không khả dụng.";
        }
    }
}
