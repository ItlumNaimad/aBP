package com.adb.backend.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class GeminiConfig {

    @Value("\${gemini.api-key}")
    lateinit var apiKey: String

    @Bean
    fun geminiWebClient(builder: WebClient.Builder): WebClient {
        return builder
            .baseUrl("https://generativelanguage.googleapis.com/v1beta/models")
            .defaultHeader("Content-Type", "application/json")
            .build()
    }
}
