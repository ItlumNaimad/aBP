package com.adb.backend.domain.dto

/**
 * Obiekt transferowy DTO reprezentujący strukturę nadchodzącego logowania.
 */
data class LoginRequest(
    val username: String
)

/**
 * Obiekt transferowy DTO do przesyłania przechwyconej przez mikrofon mowy jako tekst.
 */
data class VoiceTextRequest(
    val text: String
)
