package com.adb.backend.domain.dto

/**
 * Obiekt transferowy (DTO) reprezentujący poradę zdrowotną
 * wygenerowaną przez model Gemini AI na podstawie historii pomiarów pacjenta.
 *
 * @property tip       Treść porady zdrowotnej w języku polskim (2-3 zdania)
 * @property generatedAt Znacznik czasowy wygenerowania porady w formacie ISO-8601
 */
data class HealthTipDto(
    val tip: String,
    val generatedAt: String
)
