package com.adb.backend.service

import com.adb.backend.domain.Measurement
import com.lowagie.text.Document
import com.lowagie.text.Element
import com.lowagie.text.Font
import com.lowagie.text.FontFactory
import com.lowagie.text.Paragraph
import com.lowagie.text.Phrase
import com.lowagie.text.pdf.PdfPCell
import com.lowagie.text.pdf.PdfPTable
import com.lowagie.text.pdf.PdfWriter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.springframework.stereotype.Service
import java.io.ByteArrayOutputStream
import java.time.format.DateTimeFormatter
import java.util.UUID

@Service
class PdfGeneratorService {

    /**
     * Generuje zestawienie PDF wykorzystując OpenPDF. Ponieważ operacje generowania plików 
     * i buforowanie bywa blokujące dla wątku, przenosimy pracę bezwzględnie 
     * na [Dispatchers.IO] chroniąc pętle reaktora Spring WebFlux.
     */
    suspend fun generateHealthReport(userId: UUID, measurements: List<Measurement>): ByteArray = withContext(Dispatchers.IO) {
        val outputStream = ByteArrayOutputStream()
        val document = Document()
        
        PdfWriter.getInstance(document, outputStream)
        
        document.open()
        
        // Tytuł
        val titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18f)
        val title = Paragraph("Raport Zdrowotny: Cisnienie i Tetno", titleFont)
        title.alignment = Element.ALIGN_CENTER
        title.spacingAfter = 20f
        document.add(title)

        // Opis Użytkownika
        val subFont = FontFactory.getFont(FontFactory.HELVETICA, 12f)
        val subtitle = Paragraph("Identyfikator Pacjenta: $userId\nLiczba Zapisanych Pomiarów: ${measurements.size}", subFont)
        subtitle.spacingAfter = 20f
        document.add(subtitle)

        // Tabela danych
        val table = PdfPTable(5)
        table.widthPercentage = 100f
        table.setWidths(floatArrayOf(3f, 2f, 2f, 2f, 2f))

        val headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12f)
        listOf("Data i Godzina", "Skurczowe", "Rozkurczowe", "Tetno", "Anomalia").forEach { header ->
            val cell = PdfPCell(Phrase(header, headFont))
            cell.horizontalAlignment = Element.ALIGN_CENTER
            cell.setPadding(8f)
            table.addCell(cell)
        }

        val df = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
        val cellFont = FontFactory.getFont(FontFactory.HELVETICA, 11f)

        measurements.forEach { measurement ->
            table.addCell(PdfPCell(Phrase(measurement.createdAt.format(df), cellFont)))
            table.addCell(PdfPCell(Phrase(measurement.systolic.toString(), cellFont)))
            table.addCell(PdfPCell(Phrase(measurement.diastolic.toString(), cellFont)))
            table.addCell(PdfPCell(Phrase(measurement.pulse.toString(), cellFont)))
            val anomalyCell = PdfPCell(Phrase(if (measurement.isAnomaly) "TAK (ALARM)" else "Nie", cellFont))
            table.addCell(anomalyCell)
        }

        document.add(table)
        document.close()
        
        outputStream.toByteArray()
    }
}
