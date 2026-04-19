package com.adb.backend.service

import com.adb.backend.config.GeminiConfig
import com.adb.backend.domain.dto.GeminiRequest
import com.adb.backend.domain.dto.GeminiResponse
import com.adb.backend.domain.dto.MeasurementParsedDto
import tools.jackson.databind.ObjectMapper
import kotlinx.coroutines.reactor.awaitSingle
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono

@Service
class GeminiService(
    private val geminiWebClient: WebClient,
    private val config: GeminiConfig,
    private val mapper: ObjectMapper
) {

    /**
     * Wysyła tekst użytkownika do modelu Gemini, prosząc o strukturalny JSON.
     */
    suspend fun parseVoiceTextToMeasurement(voiceText: String): MeasurementParsedDto {
        if (config.apiKey == "mock" || config.apiKey.isBlank()) {
            // W przypadku testów lub braku klucza API, zwraca Mock
            return MeasurementParsedDto(120, 80, 70)
        }

        val promptText = """
            Jesteś asystentem medycznym. Użytkownik przesyła rozpoznany tekst opuszczający jego ciśnienie krwi i tętno:
            "$voiceText"
            ---
            Zwróć TYLKO czysty obiekt JSON bez znaczników markdown, o strukturze:
            {"systolic": 120, "diastolic": 80, "pulse": 60}
            Jeśli nie możesz rozpoznać wartości, przyjmij bezpieczną wartość 0 dla niepoznanej zmiennej.
        """.trimIndent()

        val requestBody = GeminiRequest(
            contents = listOf(
                GeminiRequest.Content(
                    parts = listOf(GeminiRequest.Part(promptText))
                )
            )
        )

        val response = geminiWebClient.post()
            .uri("/gemini-1.5-flash-latest:generateContent?key=${config.apiKey}")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono<GeminiResponse>()
            .awaitSingle()

        val rawText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
            ?: throw IllegalStateException("Empty or invalid response from Gemini API.")

        // Czyszczenie znaczników markdown jeśli się pojawią (np. ```json ... ```)
        val cleanJson = rawText.replace("```json", "").replace("```", "").trim()

        return mapper.readValue(cleanJson, MeasurementParsedDto::class.java)
    }
}
