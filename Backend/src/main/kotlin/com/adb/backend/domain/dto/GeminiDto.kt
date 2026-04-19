package com.adb.backend.domain.dto

data class GeminiRequest(
    val contents: List<Content>
) {
    data class Content(
        val parts: List<Part>
    )

    data class Part(
        val text: String
    )
}

data class GeminiResponse(
    val candidates: List<Candidate>?
) {
    data class Candidate(
        val content: Content?
    )
    
    data class Content(
        val parts: List<Part>?
    )
    
    data class Part(
        val text: String?
    )
}

/**
 * Zwracany, finalny obiekt po wyciągnięciu sensownych danych.
 */
data class MeasurementParsedDto(
    val systolic: Int,
    val diastolic: Int,
    val pulse: Int
)
