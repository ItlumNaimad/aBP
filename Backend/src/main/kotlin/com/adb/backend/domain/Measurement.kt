package com.adb.backend.domain

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime
import java.util.UUID

@Table("measurements")
data class Measurement(
    @Id
    val id: UUID? = null,
    val userId: UUID,
    val systolic: Int,
    val diastolic: Int,
    val pulse: Int,
    val isAnomaly: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
