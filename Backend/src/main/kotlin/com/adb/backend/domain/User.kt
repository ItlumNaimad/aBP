package com.adb.backend.domain

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.util.UUID

@Table("app_users")
data class User(
    @Id
    val id: UUID? = null,
    val username: String
)
