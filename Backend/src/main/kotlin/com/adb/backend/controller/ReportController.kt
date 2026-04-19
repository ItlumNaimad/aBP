package com.adb.backend.controller

import com.adb.backend.repository.MeasurementRepository
import com.adb.backend.service.PdfGeneratorService
import kotlinx.coroutines.flow.toList
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/reports")
class ReportController(
    private val measurementRepository: MeasurementRepository,
    private val pdfGeneratorService: PdfGeneratorService
) {

    @GetMapping("/{userId}/download")
    suspend fun downloadReport(@PathVariable userId: UUID): ResponseEntity<ByteArray> {
        val measurements = measurementRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId).toList()
        
        val pdfBytes = pdfGeneratorService.generateHealthReport(userId, measurements)

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"health_report_\${userId}.pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes)
    }
}
