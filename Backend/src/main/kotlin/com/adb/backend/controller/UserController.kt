package com.adb.backend.controller

import com.adb.backend.domain.User
import com.adb.backend.domain.dto.LoginRequest
import com.adb.backend.service.UserService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService
) {

    @PostMapping("/login")
    suspend fun login(@RequestBody request: LoginRequest): User {
        return userService.loginOrCreate(request.username)
    }
}
