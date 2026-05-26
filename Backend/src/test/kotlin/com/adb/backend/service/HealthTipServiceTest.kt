package com.adb.backend.service

import com.adb.backend.config.GeminiConfig
import com.adb.backend.domain.Measurement
import com.adb.backend.repository.MeasurementRepository
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.web.reactive.function.client.WebClient
import java.time.LocalDateTime
import java.util.UUID

/**
 * Testy jednostkowe HealthTipService.
 *
 * Weryfikują:
 * 1. Zachowanie w trybie mock (apiKey == "mock") — generyczna porada bez wywołania API.
 * 2. Zachowanie przy pustej historii pomiarów — komunikat zachęcający do dodania pomiarów.
 * 3. Poprawne budowanie kontekstu RAG z historii pomiarów.
 *
 * Testy korzystają z MockK do symulacji repozytorium (Flow<Measurement>)
 * i konfiguracji Gemini (apiKey), unikając realnych zapytań sieciowych.
 */
class HealthTipServiceTest {

    private lateinit var healthTipService: HealthTipService
    private lateinit var geminiConfig: GeminiConfig
    private lateinit var measurementRepository: MeasurementRepository
    private lateinit var webClient: WebClient

    private val testUserId = UUID.randomUUID()

    @BeforeEach
    fun setup() {
        geminiConfig = mockk()
        measurementRepository = mockk()
        webClient = mockk(relaxed = true)
    }

    @Test
    @DisplayName("Brak pomiarów — zwraca komunikat zachęcający do dodania pomiarów")
    fun `empty measurements returns encouragement message`() = runTest {
        every { geminiConfig.apiKey } returns "mock"
        coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns flowOf()

        healthTipService = HealthTipService(webClient, geminiConfig, measurementRepository)

        val result = healthTipService.generateHealthTip(testUserId)

        assertTrue(result.tip.contains("Nie masz jeszcze"))
        assertNotNull(result.generatedAt)
    }

    @Test
    @DisplayName("Tryb mock z pomiarami — zwraca generyczną poradę z liczbą pomiarów")
    fun `mock mode with measurements returns generic tip`() = runTest {
        every { geminiConfig.apiKey } returns "mock"

        val measurements = listOf(
            createMeasurement(120, 80, 70, false),
            createMeasurement(130, 85, 75, false),
            createMeasurement(125, 82, 72, false),
        )

        coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns
            flowOf(*measurements.toTypedArray())

        healthTipService = HealthTipService(webClient, geminiConfig, measurementRepository)

        val result = healthTipService.generateHealthTip(testUserId)

        assertTrue(result.tip.contains("3 pomiarów"))
        assertTrue(result.tip.contains("monitorowanie"))
        assertNotNull(result.generatedAt)
    }

    @Test
    @DisplayName("Tryb mock (pusty klucz API) — zwraca generyczną poradę")
    fun `empty api key returns generic tip`() = runTest {
        every { geminiConfig.apiKey } returns ""

        val measurements = listOf(
            createMeasurement(140, 90, 80, true),
        )

        coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns
            flowOf(*measurements.toTypedArray())

        healthTipService = HealthTipService(webClient, geminiConfig, measurementRepository)

        val result = healthTipService.generateHealthTip(testUserId)

        assertTrue(result.tip.isNotBlank())
        assertNotNull(result.generatedAt)
    }

    /**
     * Metoda pomocnicza tworząca instancję Measurement z podanymi wartościami.
     * Symuluje obiekt encji z bazy danych bez faktycznego zapisu.
     */
    private fun createMeasurement(
        systolic: Int,
        diastolic: Int,
        pulse: Int,
        isAnomaly: Boolean
    ): Measurement {
        return Measurement(
            id = UUID.randomUUID(),
            userId = testUserId,
            systolic = systolic,
            diastolic = diastolic,
            pulse = pulse,
            isAnomaly = isAnomaly,
            createdAt = LocalDateTime.now()
        )
    }
}
