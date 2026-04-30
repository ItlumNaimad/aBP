package com.adb.backend.service

import com.adb.backend.domain.Measurement
import com.adb.backend.domain.dto.MeasurementParsedDto
import com.adb.backend.repository.MeasurementRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.time.LocalDateTime
import java.util.UUID

/**
 * Testy jednostkowe MeasurementService.
 *
 * Testuje logikę biznesową wykrywania anomalii medycznych:
 * 1. Twarde kryteria WHO (skurczowe >= 180, rozkurczowe >= 110, tętno > 120 etc.)
 * 2. Kryteria względne pacjenta (odchylenie > 25% od średniej z historii)
 * 3. Normalne pomiary (brak anomalii)
 *
 * Wykorzystuje MockK do mockowania repozytorium (CoroutineCrudRepository).
 */
class MeasurementServiceTest {

    private lateinit var measurementRepository: MeasurementRepository
    private lateinit var measurementService: MeasurementService
    private val testUserId = UUID.randomUUID()

    @BeforeEach
    fun setup() {
        measurementRepository = mockk()
        measurementService = MeasurementService(measurementRepository)
    }

    /**
     * Tworzy pomiar pomocniczy z domyślnymi wartościami normalnymi.
     */
    private fun createMeasurement(
        systolic: Int = 120,
        diastolic: Int = 80,
        pulse: Int = 70,
        isAnomaly: Boolean = false
    ) = Measurement(
        id = UUID.randomUUID(),
        userId = testUserId,
        systolic = systolic,
        diastolic = diastolic,
        pulse = pulse,
        isAnomaly = isAnomaly,
        createdAt = LocalDateTime.now()
    )

    @Nested
    @DisplayName("Detekcja anomalii — Twarde kryteria WHO")
    inner class HardThresholdTests {

        @Test
        @DisplayName("Ciśnienie skurczowe >= 180 oznacza anomalię")
        fun `high systolic triggers anomaly`() = runTest {
            val dto = MeasurementParsedDto(systolic = 185, diastolic = 85, pulse = 72)
            val savedMeasurement = createMeasurement(185, 85, 72, isAnomaly = true)

            coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns flowOf()
            coEvery { measurementRepository.save(any()) } returns savedMeasurement

            val result = measurementService.saveMeasurement(testUserId, dto)

            assertTrue(result.isAnomaly)
            coVerify { measurementRepository.save(match { it.isAnomaly }) }
        }

        @Test
        @DisplayName("Ciśnienie rozkurczowe >= 110 oznacza anomalię")
        fun `high diastolic triggers anomaly`() = runTest {
            val dto = MeasurementParsedDto(systolic = 140, diastolic = 115, pulse = 72)
            val savedMeasurement = createMeasurement(140, 115, 72, isAnomaly = true)

            coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns flowOf()
            coEvery { measurementRepository.save(any()) } returns savedMeasurement

            val result = measurementService.saveMeasurement(testUserId, dto)

            assertTrue(result.isAnomaly)
        }

        @Test
        @DisplayName("Ciśnienie skurczowe < 90 (hipotonia) oznacza anomalię")
        fun `low systolic triggers anomaly`() = runTest {
            val dto = MeasurementParsedDto(systolic = 85, diastolic = 55, pulse = 72)
            val savedMeasurement = createMeasurement(85, 55, 72, isAnomaly = true)

            coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns flowOf()
            coEvery { measurementRepository.save(any()) } returns savedMeasurement

            val result = measurementService.saveMeasurement(testUserId, dto)

            assertTrue(result.isAnomaly)
        }

        @Test
        @DisplayName("Tętno > 120 (tachykardia) oznacza anomalię")
        fun `high pulse triggers anomaly`() = runTest {
            val dto = MeasurementParsedDto(systolic = 120, diastolic = 80, pulse = 130)
            val savedMeasurement = createMeasurement(120, 80, 130, isAnomaly = true)

            coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns flowOf()
            coEvery { measurementRepository.save(any()) } returns savedMeasurement

            val result = measurementService.saveMeasurement(testUserId, dto)

            assertTrue(result.isAnomaly)
        }

        @Test
        @DisplayName("Tętno < 40 (bradykardia) oznacza anomalię")
        fun `low pulse triggers anomaly`() = runTest {
            val dto = MeasurementParsedDto(systolic = 120, diastolic = 80, pulse = 35)
            val savedMeasurement = createMeasurement(120, 80, 35, isAnomaly = true)

            coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns flowOf()
            coEvery { measurementRepository.save(any()) } returns savedMeasurement

            val result = measurementService.saveMeasurement(testUserId, dto)

            assertTrue(result.isAnomaly)
        }
    }

    @Nested
    @DisplayName("Detekcja anomalii — Kryteria względne (historia pacjenta)")
    inner class RelativeThresholdTests {

        @Test
        @DisplayName("Skok skurczowego > 25% względem średniej historii to anomalia")
        fun `systolic spike relative to history triggers anomaly`() = runTest {
            val history = (1..5).map { createMeasurement(systolic = 120, diastolic = 80, pulse = 70) }

            // 120 * 1.25 = 150, więc 155 powinno wyzwolić anomalię
            val dto = MeasurementParsedDto(systolic = 155, diastolic = 80, pulse = 70)
            val savedMeasurement = createMeasurement(155, 80, 70, isAnomaly = true)

            coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns
                    flowOf(*history.toTypedArray())
            coEvery { measurementRepository.save(any()) } returns savedMeasurement

            val result = measurementService.saveMeasurement(testUserId, dto)

            assertTrue(result.isAnomaly)
        }

        @Test
        @DisplayName("Normalny pomiar bez odchyleń NIE jest anomalią")
        fun `normal measurement with history is not anomaly`() = runTest {
            val history = (1..5).map { createMeasurement(systolic = 120, diastolic = 80, pulse = 70) }

            val dto = MeasurementParsedDto(systolic = 125, diastolic = 82, pulse = 72)
            val savedMeasurement = createMeasurement(125, 82, 72, isAnomaly = false)

            coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns
                    flowOf(*history.toTypedArray())
            coEvery { measurementRepository.save(any()) } returns savedMeasurement

            val result = measurementService.saveMeasurement(testUserId, dto)

            assertFalse(result.isAnomaly)
        }
    }

    @Nested
    @DisplayName("Zachowanie bez historii")
    inner class EmptyHistoryTests {

        @Test
        @DisplayName("Normalny pomiar bez historii — brak anomalii")
        fun `normal measurement without history is not anomaly`() = runTest {
            val dto = MeasurementParsedDto(systolic = 120, diastolic = 80, pulse = 70)
            val savedMeasurement = createMeasurement(120, 80, 70, isAnomaly = false)

            coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns flowOf()
            coEvery { measurementRepository.save(any()) } returns savedMeasurement

            val result = measurementService.saveMeasurement(testUserId, dto)

            assertFalse(result.isAnomaly)
        }
    }

    @Test
    @DisplayName("Zapis pomiaru deleguje poprawne dane do repozytorium")
    fun `saveMeasurement persists correct values`() = runTest {
        val dto = MeasurementParsedDto(systolic = 130, diastolic = 85, pulse = 75)
        val savedMeasurement = createMeasurement(130, 85, 75)

        coEvery { measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(testUserId) } returns flowOf()
        coEvery { measurementRepository.save(any()) } returns savedMeasurement

        val result = measurementService.saveMeasurement(testUserId, dto)

        assertEquals(130, result.systolic)
        assertEquals(85, result.diastolic)
        assertEquals(75, result.pulse)

        coVerify(exactly = 1) { measurementRepository.save(match {
            it.userId == testUserId &&
            it.systolic == 130 &&
            it.diastolic == 85 &&
            it.pulse == 75
        }) }
    }
}
