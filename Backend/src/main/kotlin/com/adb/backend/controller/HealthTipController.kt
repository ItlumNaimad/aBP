package com.adb.backend.controller

import com.adb.backend.domain.dto.HealthTipDto
import com.adb.backend.service.HealthTipService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Kontroler REST obsługujący endpoint porad zdrowotnych AI.
 *
 * Udostępnia operację `GET /api/ai/health-tips/{userId}`, która uruchamia
 * pipeline RAG (Retrieval-Augmented Generation) w HealthTipService:
 * pobranie historii pomiarów → budowa kontekstowego promptu → zapytanie do Gemini → odpowiedź.
 *
 * Metoda kontrolera jest `suspend fun` — WebFlux automatycznie obsługuje ją
 * w kontekście coroutines Kotlina, nie blokując żadnego wątku Netty.
 *
 * @property healthTipService — serwis generujący porady zdrowotne (wstrzyknięty przez DI Springa)
 */
@RestController
@RequestMapping("/api/ai")
class HealthTipController(
    private val healthTipService: HealthTipService
) {

    /**
     * Generuje spersonalizowaną poradę zdrowotną na podstawie historii pomiarów pacjenta.
     *
     * @param userId — UUID pacjenta (przekazywany jako ścieżka URL)
     * @return HealthTipDto — obiekt JSON z treścią porady i znacznikiem czasu
     *
     * Przykładowe użycie:
     * ```
     * GET /api/ai/health-tips/550e8400-e29b-41d4-a716-446655440000
     * ```
     *
     * Odpowiedź (200 OK):
     * ```json
     * {
     *   "tip": "Twoje ciśnienie jest stabilne. Kontynuuj zdrowe nawyki...",
     *   "generatedAt": "2026-05-26T18:00:00"
     * }
     * ```
     */
    @GetMapping("/health-tips/{userId}")
    suspend fun getHealthTip(@PathVariable userId: UUID): HealthTipDto {
        return healthTipService.generateHealthTip(userId)
    }
}
