# aBP (Aplikacja Blood Pressure)
Projekt studencki: Aplikacja mobilna serwowana na architekturze reaktywnej (WebFlux/Kotlin), wspierająca rejestrację wyników ciśnienia krwi i tętna. Pozwala na zarządzanie pomiarami oraz generowanie raportów PDF dla wybranych dni z danego miesiąca. Aplikacja oparta na środowisku PostgreSQL i asystencie głosowym. Backend skonstruowano zgodnie z wymogiem paradygmatu w pełni reaktywnego bez operacji blokujących CPU.

---

## Dziennik Postępu Prac (Raporty Zadaniowe)

### Raport - 19.04.2026
**Zadania: Ukończono całkowicie Fazę 1 - Inicjalizacja i Baza Danych.**

*   **Zrealizowane kroki:**
    1. Zaimplementowano szkielet projektu w oparciu o Kotlin Coroutines, Spring Boot WebFlux oraz kompilator Gradle.
    2. Stworzono konfigurację kontenera stacji roboczej dla bazy poprzez polecenia w `docker-compose.yml`.
    3. Skonfigurowano reaktor non-blocking i dostęp do bazy do PostgreSQL w formacie R2DBC w `application.yaml`.
    4. Utworzono bezstanowe skrypty przygotowujące bazę testową `schema.sql` (tworzenie tabel `app_users` i `measurements` z id wyliczanymi za pomocją `gen_random_uuid()`).
    5. Zbudowano i zmapowano modele warstwy encji (Domain) i połączono je ze wstrzykiwalnymi zasobami zapisu poprzez wdrożenie `CoroutineCrudRepository`.

*   **Pomyślne weryfikacje / Testy i Komendy wykonawcze:**
    *   **Komenda:** `.\gradlew.bat build -x test`
        **Analiza:** Sukces (`BUILD SUCCESSFUL`). Backend skompilował się bez zarzutu. Konfiguracja w kodzie nie zawiera błędów syntaksycznych ani niezgodności w adnotacjach Springa. Repozytoria i silniki reaktywne załadowano poprawnie.
    *   **Wstępne środowisko sprzętowe (Uwaga Dockera):**
        Oczekujące zadania i serwer aplikacji nałożone na kontener bazy danych (`docker-compose up -d`) zostaną poprowadzone przez natywne repozytorium na **podsystemie WSL**. Obecne stany deweloperskie wykonano omijając konieczność starych kompilacji maszyn z Windows 10 (21H2).
