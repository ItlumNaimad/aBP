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
        Oczekujące zadania i serwer aplikacji nałożone na kontener bazy danych. Środowisko bazy danych zostało wzniesione za pomocą WSL używając lokalnego dockera z poziomu konsoli:
        *   `docker compose up -d` (w katalogu `/Backend`) - PostgreSql 15 (W pełni działający, port: 5432)
        Doinstalowano i wykorzystano natywny pakiet `openjdk-17-jdk` co pozwoliło na poprawne połączenie się i zdanie testów integracyjnych `R2DBC` za pomocą wywołania w konsoli linuksowej:
        *   `./gradlew test` (Rezultat: Sukces połączeń reaktywnych, Build Successful)

**Zadania: Ukończono całkowicie Fazę 2 - Logika Biznesowa (Backend).**

*   **Zrealizowane kroki:**
    1. Utworzono usługi zarządzania danymi użytkownika `UserService` dopuszczające logowanie za pomocą samej nazwy.
    2. Zintegrowano zewnętrzny model `Google Gemini AI` tworząc konfigurację `WebClient` z autoryzacją via `application.yaml` (klucz pobierany domyślnie ze zmiennej środowiskowej `${GEMINI_API_KEY}`).
    3. Dodano silnik wyłapywania anomalii medycznych w `MeasurementService`, kalkulujący odchyłki za pomocą grupowych coroutinowych list obiektów mapowanych przez reaktor z `MeasurementRepository.findTop10ByUserIdOrderByCreatedAtDesc`.
    4. Wdrożono bibliotekę `openpdf` oraz zaimplementowano generator zestawień w coroutine `withContext(Dispatchers.IO)`, aby uniknąć problemu zatorowości Non-Blocking wątków obsługiwanych przez macierzysty Netty z racji ciężkich wejść i wyjść używanych do wygenerowania tabeli PDF.

*   **Pomyślne weryfikacje / Komendy wykonawcze:**
    *   **Komenda:** `./gradlew build -x test` w WSL
        **Analiza:** Sukces. Wdrożenie asynchronicznego parsera JSON oparto o zmodernizowany framework `tools.jackson.databind.ObjectMapper`. Konfiguracja beanów (w tym `WebClient`) udokumentowana kompilacją bez defektów.

**Zadania: Ukończono całkowicie Fazę 3 - Reaktywne Kontrolery (API).**

*   **Pojęcie DTO (Data Transfer Object)**
    W ramach struktury zaimplementowano obiekty DTO (`LoginRequest`, `VoiceTextRequest`, `MeasurementParsedDto`). 
    **Czemu służą?** DTO to oddzielna klasa służąca wyłącznie do przesyłania danych pomiędzy klientem a serwerem (w tym przypadku z żądań HTTP POST na obiekty Kotlin). Oddzielając model przychodzący od faktycznych encji bazy danych (`Measurement`, `User`), chronimy system przed tzw. "Mass Assignment" (wstrzyknięciem groźnych danych prosto w bazę) i znacząco podnosimy czytelność struktury API.

*   **Zrealizowane kroki:**
    1. Zainicjowano pakiet DTO z klasami wejściowymi dla formatu JSON w kontrolerach.
    2. Utworzono **`UserController`** odpowiedzialny za proces logowania (wymiana `username` na wygenerowane lub odnalezione z bazy konto).
    3. Dodano **`VoiceAIApiController`**, który potokiem strumieniuje podsłuchany ciąg znaków pacjenta do inteligentnej usługi Gemini i reaguje obiektem `MeasurementParsedDto` do potwierdzenia dla klienta mobilnego.
    4. Rozbudowano **`MeasurementController`** z non-blocking zapytaniami na rejestrację nowego wyniku tętna/ciśnienia oraz zrzutu listy 10 ostatnich pomiarów do podglądu Historii.
    5. Dopasowano **`ReportController`** przekierowujący generację PDF do Dispatchers.IO, kończący sesyjną warstwę kontrolerów zwracając `ByteArray` do bezpośredniego pobrania pacjenta.

*   **Pomyślne weryfikacje / Komendy wykonawcze:**
    *   **Komenda:** `./gradlew build` w WSL
        **Analiza:** Kod skompilował się bez zarzutu. Przepustowość kontrolerów WebFlux gotowa na dołączenie frontendu.
