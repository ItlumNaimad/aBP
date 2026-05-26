package com.adb.backend.service

import com.adb.backend.config.GeminiConfig
import com.adb.backend.domain.Measurement
import com.adb.backend.domain.dto.GeminiRequest
import com.adb.backend.domain.dto.GeminiResponse
import com.adb.backend.domain.dto.HealthTipDto
import com.adb.backend.repository.MeasurementRepository
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.reactor.awaitSingle
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

/**
 * Serwis generowania porad zdrowotnych w oparciu o historię pomiarów pacjenta.
 *
 * Implementuje wzorzec RAG (Retrieval-Augmented Generation):
 * 1. **Retrieval** — pobiera ostatnie 10 pomiarów pacjenta z bazy danych (R2DBC, Flow).
 * 2. **Augmentation** — buduje kontekstowy prompt zawierający historię medyczną pacjenta.
 * 3. **Generation** — wysyła prompt do modelu Gemini AI, który generuje spersonalizowaną
 *    poradę zdrowotną po polsku (2-3 zdania).
 *
 * W trybie mock (brak klucza `GEMINI_API_KEY`) zwraca generyczną poradę bez łączenia się z API.
 *
 * @property geminiWebClient — reaktywny klient HTTP do komunikacji z Gemini API (bean z GeminiConfig)
 * @property config          — konfiguracja zawierająca klucz API i status trybu mock
 * @property measurementRepository — reaktywne repozytorium pomiarów (CoroutineCrudRepository)
 */
@Service
class HealthTipService(
    private val geminiWebClient: WebClient,
    private val config: GeminiConfig,
    private val measurementRepository: MeasurementRepository
) {

    private val logger = LoggerFactory.getLogger(HealthTipService::class.java)

    /**
     * Generuje spersonalizowaną poradę zdrowotną dla pacjenta.
     *
     * Mechanizm działania (suspend = nie blokuje wątku Netty):
     * 1. Pobiera `Flow<Measurement>` z repozytorium R2DBC i konwertuje na listę za pomocą `toList()`.
     *    `toList()` jest funkcją zawieszającą — czeka na zakończenie strumienia bez blokowania.
     * 2. Buduje prompt RAG z danymi historycznymi pacjenta.
     * 3. Wysyła zapytanie do Gemini przez WebClient (reaktywny, non-blocking HTTP client).
     *    Konwersja `Mono<T>` na coroutine odbywa się za pomocą `awaitSingle()` z kotlinx-coroutines-reactor.
     *
     * @param userId — UUID pacjenta, którego historia pomiarów jest analizowana
     * @return HealthTipDto — obiekt z poradą zdrowotną i znacznikiem czasu wygenerowania
     * @throws IllegalStateException — gdy odpowiedź z Gemini API jest pusta lub nieprawidłowa
     */
    suspend fun generateHealthTip(userId: UUID): HealthTipDto {
        val measurements = measurementRepository
            .findTop10ByUserIdOrderByCreatedAtDesc(userId)
            .toList()

        if (measurements.isEmpty()) {
            return HealthTipDto(
                tip = "Nie masz jeszcze wystarczającej liczby pomiarów. Dodaj kilka pomiarów ciśnienia, aby AI mogło przeanalizować Twoje trendy zdrowotne.",
                generatedAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            )
        }

        // Tryb mock — brak klucza API
        if (config.apiKey == "mock" || config.apiKey.isBlank()) {
            logger.warn("⚠️  MOCK MODE: Returning generic health tip for user {}", userId)
            return HealthTipDto(
                tip = "Regularne monitorowanie ciśnienia to klucz do zdrowia! Na podstawie Twoich ${measurements.size} pomiarów widzę, że warto kontynuować codzienne pomiary. Pamiętaj o zbilansowanej diecie i regularnej aktywności fizycznej.",
                generatedAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            )
        }

        // Budowanie kontekstu RAG z historią pomiarów
        val measurementsSummary = measurements.joinToString("\n") { m ->
            "- Data: ${m.createdAt}, SYS: ${m.systolic}, DIA: ${m.diastolic}, Puls: ${m.pulse}, Anomalia: ${if (m.isAnomaly) "TAK" else "nie"}"
        }

        val promptText = """
            Jesteś doświadczonym lekarzem kardiologiem. Pacjent przesyła Ci historię swoich ostatnich pomiarów ciśnienia krwi i tętna:
            
            $measurementsSummary
            
            ---
            Na podstawie powyższych danych:
            1. Oceń ogólny stan zdrowia sercowo-naczyniowego pacjenta.
            2. Wygeneruj KRÓTKĄ, zwięzłą poradę pro-zdrowotną (maksymalnie 2-3 zdania) w języku polskim.
            3. Jeśli widzisz niepokojące trendy (np. rosnące ciśnienie, anomalie), delikatnie o tym wspomnij.
            4. Bądź przyjazny i motywujący, ale nie pomijaj ważnych ostrzeżeń.
            
            Zwróć TYLKO tekst porady, bez formatowania markdown, bez nagłówków, bez list.
        """.trimIndent()

        val requestBody = GeminiRequest(
            contents = listOf(
                GeminiRequest.Content(
                    parts = listOf(GeminiRequest.Part(promptText))
                )
            )
        )

        val response = geminiWebClient.post()
            .uri("/gemini-flash-latest:generateContent?key=${config.apiKey}")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono<GeminiResponse>()
            .awaitSingle()

        val tipText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
            ?: throw IllegalStateException("Empty or invalid response from Gemini API.")

        return HealthTipDto(
            tip = tipText.trim(),
            generatedAt = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        )
    }
}
