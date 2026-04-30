package com.adb.backend.controller

import com.adb.backend.domain.Measurement
import com.adb.backend.domain.dto.MeasurementParsedDto
import com.adb.backend.repository.MeasurementRepository
import com.adb.backend.service.MeasurementService
import com.ninjasquad.springmockk.MockkBean
import io.mockk.coEvery
import io.mockk.every
import kotlinx.coroutines.flow.flowOf
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient
import java.time.LocalDateTime
import java.util.UUID

/**
 * Testy reaktywne kontrolera MeasurementController.
 *
 * Weryfikuje endpointy CRUD pomiarów ciśnienia krwi:
 * - GET /api/measurements/{userId} — strumień Flow<Measurement>
 * - POST /api/measurements/{userId} — zapis nowego pomiaru
 */
@WebFluxTest(MeasurementController::class)
class MeasurementControllerWebFluxTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockkBean
    private lateinit var measurementService: MeasurementService

    @MockkBean
    private lateinit var measurementRepository: MeasurementRepository

    private val testUserId = UUID.randomUUID()

    @Test
    @DisplayName("GET /api/measurements/{userId} — zwraca listę pomiarów jako JSON")
    fun `get measurements returns list`() {
        val measurements = listOf(
            Measurement(UUID.randomUUID(), testUserId, 130, 85, 72, false, LocalDateTime.now()),
            Measurement(UUID.randomUUID(), testUserId, 120, 80, 68, false, LocalDateTime.now().minusHours(1))
        )

        every { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns
                flowOf(*measurements.toTypedArray())

        webTestClient.get()
            .uri("/api/measurements/$testUserId")
            .exchange()
            .expectStatus().isOk
            .expectHeader().contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$[0].systolic").isEqualTo(130)
            .jsonPath("$[0].diastolic").isEqualTo(85)
            .jsonPath("$[1].systolic").isEqualTo(120)
            .jsonPath("$.length()").isEqualTo(2)
    }

    @Test
    @DisplayName("GET /api/measurements/{userId} — brak pomiarów zwraca pustą tablicę")
    fun `get measurements returns empty list when no data`() {
        every { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns flowOf()

        webTestClient.get()
            .uri("/api/measurements/$testUserId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(0)
    }

    @Test
    @DisplayName("POST /api/measurements/{userId} — zapisuje nowy pomiar i zwraca 200")
    fun `save measurement returns saved entity`() {
        val parsedDto = MeasurementParsedDto(systolic = 135, diastolic = 88, pulse = 75)
        val savedMeasurement = Measurement(
            id = UUID.randomUUID(),
            userId = testUserId,
            systolic = 135,
            diastolic = 88,
            pulse = 75,
            isAnomaly = false,
            createdAt = LocalDateTime.now()
        )

        coEvery { measurementService.saveMeasurement(testUserId, parsedDto) } returns savedMeasurement

        webTestClient.post()
            .uri("/api/measurements/$testUserId")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(parsedDto)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.systolic").isEqualTo(135)
            .jsonPath("$.diastolic").isEqualTo(88)
            .jsonPath("$.pulse").isEqualTo(75)
            .jsonPath("$.isAnomaly").isEqualTo(false)
    }

    @Test
    @DisplayName("POST /api/measurements/{userId} — anomalia zaznaczona w odpowiedzi")
    fun `save measurement with anomaly returns isAnomaly true`() {
        val parsedDto = MeasurementParsedDto(systolic = 190, diastolic = 115, pulse = 72)
        val savedMeasurement = Measurement(
            id = UUID.randomUUID(),
            userId = testUserId,
            systolic = 190,
            diastolic = 115,
            pulse = 72,
            isAnomaly = true,
            createdAt = LocalDateTime.now()
        )

        coEvery { measurementService.saveMeasurement(testUserId, parsedDto) } returns savedMeasurement

        webTestClient.post()
            .uri("/api/measurements/$testUserId")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(parsedDto)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.isAnomaly").isEqualTo(true)
    }
}
