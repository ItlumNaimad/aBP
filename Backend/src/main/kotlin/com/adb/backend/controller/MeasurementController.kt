package com.adb.backend.controller

import com.adb.backend.domain.Measurement
import com.adb.backend.domain.dto.MeasurementParsedDto
import com.adb.backend.repository.MeasurementRepository
import com.adb.backend.service.MeasurementService
import kotlinx.coroutines.flow.Flow
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Kontroler REST udostępniający API do zarządzania pomiarami użytkownika.
 *
 * Wykorzystuje Spring WebFlux, zapewniając asynchroniczną i nieblokującą obsługę żądań.
 */
@RestController
@RequestMapping("/api/measurements")
class MeasurementController(
    private val measurementService: MeasurementService,
    private val measurementRepository: MeasurementRepository
) {

    /**
     * Zwraca ostatnie 10 pomiarów użytkownika posortowanych od najnowszego.
     *
     * Mechanizm reaktywności: Zwraca `Flow<Measurement>`, co w Spring WebFlux oznacza
     * asynchroniczne strumieniowanie danych bezpośrednio z bazy R2DBC do klienta HTTP
     * (jako tablicę JSON). Netty nie czeka zablokowane na pełne zapytanie z bazy.
     *
     * @param userId UUID użytkownika
     * @return Strumień (Flow) ostatnich 10 pomiarów
     */
    @GetMapping("/{userId}")
    fun getMeasurements(@PathVariable userId: UUID): Flow<Measurement> {
        return measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId)
    }

    /**
     * Zapisuje nowy pomiar w bazie po uprzedniej analizie na anomalie.
     *
     * Mechanizm reaktywności: `suspend fun` zawiesza wykonanie w trakcie operacji na
     * `measurementService.saveMeasurement` nie blokując wątku (non-blocking I/O).
     *
     * @param userId UUID użytkownika do którego należy pomiar
     * @param parsedDto JSON z wartościami skurczowe/rozkurczowe/puls z ciała żądania
     * @return Zapisany obiekt pomiaru (ze statusem anomalii i wygenerowanym ID)
     */
    @PostMapping("/{userId}")
    suspend fun saveMeasurement(
        @PathVariable userId: UUID,
        @RequestBody parsedDto: MeasurementParsedDto
    ): Measurement {
        return measurementService.saveMeasurement(userId, parsedDto)
    }
}
