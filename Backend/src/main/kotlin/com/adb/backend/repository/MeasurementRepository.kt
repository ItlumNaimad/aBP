package com.adb.backend.repository

import com.adb.backend.domain.Measurement
import kotlinx.coroutines.flow.Flow
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import java.util.UUID

interface MeasurementRepository : CoroutineCrudRepository<Measurement, UUID> {
    fun findByUserId(userId: UUID): Flow<Measurement>
    fun findTop10ByUserIdOrderByCreatedAtDesc(userId: UUID): Flow<Measurement>
}
