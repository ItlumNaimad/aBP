package com.adb.backend.config

import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class GeminiConfig {

    private val logger = LoggerFactory.getLogger(GeminiConfig::class.java)

    @Value("\${gemini.api-key}")
    lateinit var apiKey: String

    @PostConstruct
    fun logApiKeyStatus() {
        if (apiKey == "mock" || apiKey.isBlank()) {
            logger.warn("⚠️  GEMINI_API_KEY is NOT set. Running in MOCK mode — AI voice parsing will return hardcoded values (120/80/70).")
            logger.warn("   Set the GEMINI_API_KEY environment variable to enable real Gemini AI integration.")
        } else {
            val maskedKey = apiKey.take(4) + "****" + apiKey.takeLast(4)
            logger.info("✅ Gemini API configured successfully (key: {})", maskedKey)
        }
    }

    @Bean
    fun geminiWebClient(): WebClient {
        return WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta/models")
            .defaultHeader("Content-Type", "application/json")
            .build()
    }
}

