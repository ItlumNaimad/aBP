package com.adb.backend.controller

import com.adb.backend.domain.User
import com.adb.backend.domain.dto.LoginRequest
import com.adb.backend.service.UserService
import com.ninjasquad.springmockk.MockkBean
import io.mockk.coEvery
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient
import java.util.UUID

/**
 * Testy reaktywne kontrolera UserController.
 *
 * @WebFluxTest ładuje wyłącznie warstwę web (bez bazy danych),
 * a dzięki MockkBean (SpringMockK) mockujemy UserService w coroutinach.
 */
@WebFluxTest(UserController::class)
class UserControllerWebFluxTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockkBean
    private lateinit var userService: UserService

    @Test
    @DisplayName("POST /api/users/login — logowanie nowego użytkownika zwraca 200 z danymi")
    fun `login creates or finds user and returns 200`() {
        val testUser = User(id = UUID.randomUUID(), username = "jan_kowalski")

        coEvery { userService.loginOrCreate("jan_kowalski") } returns testUser

        webTestClient.post()
            .uri("/api/users/login")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(LoginRequest("jan_kowalski"))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.username").isEqualTo("jan_kowalski")
            .jsonPath("$.id").isNotEmpty
    }

    @Test
    @DisplayName("POST /api/users/login — istniejący użytkownik zwraca te same dane")
    fun `login existing user returns same data`() {
        val existingId = UUID.randomUUID()
        val existingUser = User(id = existingId, username = "anna_nowak")

        coEvery { userService.loginOrCreate("anna_nowak") } returns existingUser

        webTestClient.post()
            .uri("/api/users/login")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(LoginRequest("anna_nowak"))
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.username").isEqualTo("anna_nowak")
            .jsonPath("$.id").isEqualTo(existingId.toString())
    }
}
