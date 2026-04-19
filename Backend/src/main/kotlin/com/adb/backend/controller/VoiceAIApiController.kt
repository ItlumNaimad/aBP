package com.adb.backend.controller

import com.adb.backend.domain.dto.MeasurementParsedDto
import com.adb.backend.domain.dto.VoiceTextRequest
import com.adb.backend.service.GeminiService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/voice")
class VoiceAIApiController(
    private val geminiService: GeminiService
) {

    @PostMapping("/parse")
    suspend fun parseVoiceText(@RequestBody request: VoiceTextRequest): MeasurementParsedDto {
        return geminiService.parseVoiceTextToMeasurement(request.text)
    }
}
