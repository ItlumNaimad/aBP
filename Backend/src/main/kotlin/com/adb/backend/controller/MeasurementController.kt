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

@RestController
@RequestMapping("/api/measurements")
class MeasurementController(
    private val measurementService: MeasurementService,
    private val measurementRepository: MeasurementRepository
) {

    @GetMapping("/{userId}")
    fun getMeasurements(@PathVariable userId: UUID): Flow<Measurement> {
        return measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId)
    }

    @PostMapping("/{userId}")
    suspend fun saveMeasurement(
        @PathVariable userId: UUID,
        @RequestBody parsedDto: MeasurementParsedDto
    ): Measurement {
        return measurementService.saveMeasurement(userId, parsedDto)
    }
}
