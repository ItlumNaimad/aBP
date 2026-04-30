package com.adb.backend

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Disabled
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
@Disabled("Requires a live PostgreSQL database to load the context. Real tests use @WebFluxTest and mock the DB.")
class BackendApplicationTests {

	@Test
	fun contextLoads() {
	}

}
