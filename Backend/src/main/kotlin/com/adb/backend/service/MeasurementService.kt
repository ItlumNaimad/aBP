package com.adb.backend.service

import com.adb.backend.domain.Measurement
import com.adb.backend.domain.dto.MeasurementParsedDto
import com.adb.backend.repository.MeasurementRepository
import kotlinx.coroutines.flow.toList
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.UUID

/**
 * Serwis odpowiedzialny za logikę biznesową operacji na pomiarach ciśnienia i tętna.
 *
 * Implementuje w pełni reaktywny model (non-blocking) używając Kotlin Coroutines.
 * Wstrzykiwane zależności:
 * - `measurementRepository`: interfejs CoroutineCrudRepository do bezblokowego dostępu do bazy.
 */
@Service
class MeasurementService(
    private val measurementRepository: MeasurementRepository
) {

    /**
     * Zapisuje nowy pomiar do bazy po wcześniejszej ewaluacji przez detektor anomalii medycznych.
     *
     * Mechanizm reaktywności:
     * Metoda jest oznaczona jako `suspend fun`, co oznacza, że wykonuje się w ramach
     * coroutine i nie blokuje wątku serwera HTTP (Netty). 
     * Operacja `toList()` użyta na `Flow<Measurement>` zawiesza wykonanie do momentu 
     * zebrania całego strumienia danych z bazy, uwalniając w tym czasie wątek.
     * Podobnie `measurementRepository.save()` wykonuje asynchroniczny zapis non-blocking.
     *
     * @param userId UUID użytkownika dodającego pomiar
     * @param parsedDto DTO z wartościami liczbowymi pomiaru (skurczowe, rozkurczowe, puls)
     * @return Zapisany obiekt Encji Measurement (zawierający wygenerowane ID i flagę isAnomaly)
     */
    suspend fun saveMeasurement(userId: UUID, parsedDto: MeasurementParsedDto): Measurement {
        val lastMeasurements = measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId).toList()
        
        val isAnomaly = detectAnomaly(parsedDto, lastMeasurements)
        
        val newMeasurement = Measurement(
            userId = userId,
            systolic = parsedDto.systolic,
            diastolic = parsedDto.diastolic,
            pulse = parsedDto.pulse,
            isAnomaly = isAnomaly,
            createdAt = LocalDateTime.now()
        )
        
        return measurementRepository.save(newMeasurement)
    }

    /**
     * Algorytm wykrywający anomalię:
     * 1. Krytyczne, sztywne progi (niezależne od historii) - np. Skurczowe > 180, Rozkurczowe > 120, Tętno > 120 lub < 40.
     * 2. Wykrywanie odstępstw na bazie histrorii klastrowej u pacjenta (Skoki o > 20% względem średniej z ostatnich udokumentowanych).
     */
    private fun detectAnomaly(current: MeasurementParsedDto, history: List<Measurement>): Boolean {
        // Twarde kryteria alarmowe (zgodne z WHO)
        if (current.systolic >= 180 || current.diastolic >= 110) return true
        if (current.systolic < 90 || current.diastolic < 60) return true
        if (current.pulse > 120 || current.pulse < 40) return true

        if (history.isEmpty()) return false
        
        // Kryteria względne pacjenta (historia np. z poprzednich 10 pomiarów)
        val avgSystolic = history.map { it.systolic }.average()
        val avgDiastolic = history.map { it.diastolic }.average()
        val avgPulse = history.map { it.pulse }.average()

        if (current.systolic > avgSystolic * 1.25 || current.systolic < avgSystolic * 0.75) return true
        if (current.diastolic > avgDiastolic * 1.25 || current.diastolic < avgDiastolic * 0.75) return true
        if (current.pulse > avgPulse * 1.30 || current.pulse < avgPulse * 0.70) return true
        
        return false
    }

    /**
     * Usuwa pomiar, jeśli należy on do podanego użytkownika.
     *
     * @param userId UUID użytkownika
     * @param measurementId UUID pomiaru do usunięcia
     * @return true jeśli usunięto, false jeśli pomiar nie istnieje lub nie należy do użytkownika
     */
    suspend fun deleteMeasurement(userId: UUID, measurementId: UUID): Boolean {
        val measurement = measurementRepository.findById(measurementId)
        if (measurement != null && measurement.userId == userId) {
            measurementRepository.deleteById(measurementId)
            return true
        }
        return false
    }
}
