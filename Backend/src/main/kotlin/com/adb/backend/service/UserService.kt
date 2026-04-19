package com.adb.backend.service

import com.adb.backend.domain.User
import com.adb.backend.repository.UserRepository
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository
) {

    /**
     * Wyszukuje użytkownika po nazwie. Jeśli nie istnieje - tworzy nowe konto.
     * Uproszczona logika logowania dla aplikacji medycznej.
     */
    suspend fun loginOrCreate(username: String): User {
        val existingUser = userRepository.findByUsername(username)
        
        return if (existingUser != null) {
            existingUser
        } else {
            val newUser = User(username = username)
            userRepository.save(newUser)
        }
    }
}
