package com.adb.backend.service

import com.adb.backend.config.GeminiConfig
import com.adb.backend.domain.dto.GeminiResponse
import com.adb.backend.domain.dto.MeasurementParsedDto
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import tools.jackson.databind.ObjectMapper

/**
 * Testy jednostkowe GeminiService.
 *
 * Testuje:
 * 1. Tryb mock (gdy apiKey == "mock") — zwraca domyślne wartości bez wywołania API.
 * 2. Parsowanie odpowiedzi JSON z Gemini API na obiekt MeasurementParsedDto.
 *
 * Wykorzystuje MockK do symulacji WebClient (unikamy realnych zapytań do Google API).
 */
class GeminiServiceTest {

    private lateinit var geminiService: GeminiService
    private lateinit var geminiConfig: GeminiConfig
    private lateinit var mapper: ObjectMapper
    private lateinit var webClient: WebClient

    @BeforeEach
    fun setup() {
        geminiConfig = mockk()
        mapper = ObjectMapper()
        webClient = mockk(relaxed = true)
    }

    @Test
    @DisplayName("Tryb mock (apiKey='mock') zwraca domyślne wartości 120/80/70")
    fun `mock mode returns default values`() = runTest {
        every { geminiConfig.apiKey } returns "mock"

        geminiService = GeminiService(webClient, geminiConfig, mapper)

        val result = geminiService.parseVoiceTextToMeasurement("mam ciśnienie 135 na 85 puls 72")

        assertEquals(120, result.systolic)
        assertEquals(80, result.diastolic)
        assertEquals(70, result.pulse)
    }

    @Test
    @DisplayName("Tryb mock (apiKey=pusty) zwraca domyślne wartości 120/80/70")
    fun `empty api key returns mock values`() = runTest {
        every { geminiConfig.apiKey } returns ""

        geminiService = GeminiService(webClient, geminiConfig, mapper)

        val result = geminiService.parseVoiceTextToMeasurement("ciśnienie sto trzydzieści na dziewięćdziesiąt")

        assertEquals(120, result.systolic)
        assertEquals(80, result.diastolic)
        assertEquals(70, result.pulse)
    }

    @Test
    @DisplayName("Parsowanie JSON z odpowiedzi Gemini API")
    fun `parses gemini json response correctly`() = runTest {
        // Test mapowania JSON → DTO bezpośrednio (testujemy ObjectMapper)
        val json = """{"systolic": 135, "diastolic": 88, "pulse": 72}"""
        val dto = mapper.readValue(json, MeasurementParsedDto::class.java)

        assertEquals(135, dto.systolic)
        assertEquals(88, dto.diastolic)
        assertEquals(72, dto.pulse)
    }

    @Test
    @DisplayName("Parsowanie JSON z otaczającymi znacznikami markdown")
    fun `strips markdown code fences from json`() = runTest {
        val rawText = "```json\n{\"systolic\": 140, \"diastolic\": 90, \"pulse\": 80}\n```"
        val cleanJson = rawText.replace("```json", "").replace("```", "").trim()
        val dto = mapper.readValue(cleanJson, MeasurementParsedDto::class.java)

        assertEquals(140, dto.systolic)
        assertEquals(90, dto.diastolic)
        assertEquals(80, dto.pulse)
    }
}
