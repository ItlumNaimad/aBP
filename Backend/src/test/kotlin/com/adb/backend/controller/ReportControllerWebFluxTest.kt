package com.adb.backend.controller

import com.adb.backend.domain.Measurement
import com.adb.backend.repository.MeasurementRepository
import com.adb.backend.service.PdfGeneratorService
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
 * Testy reaktywne kontrolera ReportController.
 *
 * Weryfikuje:
 * - Generowanie PDF zwraca content-type application/pdf
 * - Header Content-Disposition zawiera nazwę pliku
 * - Ciało odpowiedzi zawiera dane binarne (nie jest puste)
 */
@WebFluxTest(ReportController::class)
class ReportControllerWebFluxTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockkBean
    private lateinit var measurementRepository: MeasurementRepository

    @MockkBean
    private lateinit var pdfGeneratorService: PdfGeneratorService

    private val testUserId = UUID.randomUUID()

    @Test
    @DisplayName("GET /api/reports/{userId}/download — zwraca PDF z prawidłowymi nagłówkami")
    fun `download report returns pdf with correct headers`() {
        val measurements = listOf(
            Measurement(UUID.randomUUID(), testUserId, 130, 85, 72, false, LocalDateTime.now()),
            Measurement(UUID.randomUUID(), testUserId, 120, 80, 68, false, LocalDateTime.now().minusHours(1))
        )

        // Minimalny poprawny PDF (nagłówek %PDF-1.4 + EOF)
        val fakePdfBytes = "%PDF-1.4 fake content %%EOF".toByteArray()

        every { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns
                flowOf(*measurements.toTypedArray())

        coEvery { pdfGeneratorService.generateHealthReport(testUserId, measurements) } returns fakePdfBytes

        webTestClient.get()
            .uri("/api/reports/$testUserId/download")
            .exchange()
            .expectStatus().isOk
            .expectHeader().contentType(MediaType.APPLICATION_PDF)
            .expectHeader().valueEquals("Content-Disposition", "attachment; filename=\"health_report_\${userId}.pdf\"")
            .expectBody()
            .consumeWith { response ->
                val body = response.responseBody
                assert(body != null && body.isNotEmpty()) { "PDF body should not be empty" }
            }
    }

    @Test
    @DisplayName("GET /api/reports/{userId}/download — brak pomiarów zwraca pusty PDF")
    fun `download report with no measurements returns valid response`() {
        every { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns flowOf()

        coEvery { pdfGeneratorService.generateHealthReport(testUserId, emptyList()) } returns
                "%PDF-1.4 empty %%EOF".toByteArray()

        webTestClient.get()
            .uri("/api/reports/$testUserId/download")
            .exchange()
            .expectStatus().isOk
            .expectHeader().contentType(MediaType.APPLICATION_PDF)
    }
}
