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

**Zadania: Ukończono Fazę 4 - Struktura Mobilna (Frontend React Native).**

*   **Zrealizowane kroki:**
    1. Zainicjalizowano projekt React Native z wykorzystaniem Expo Router (file-based routing).
    2. Skonfigurowano globalny stan aplikacji z wykorzystaniem Zustand (`store/useAppStore.ts`) z persystencją motywu jasny/ciemny w AsyncStorage.
    3. Utworzono system motywów medycznych w React Native Paper (Material Design 3) z paletą kolorów teal/cyan i powiększonymi czcionkami dla seniorów (`theme/index.ts`).
    4. Zbudowano klienta API opartego o Axios (`api/client.ts`) z automatycznym wykrywaniem środowiska (Android emulator vs. fizyczny telefon vs. web).
    5. Skonfigurowano dolną nawigację tabową z trzema zakładkami: Pulpit, Historia, Ustawienia.

*   **Pomyślne weryfikacje / Komendy wykonawcze:**
    *   **Komenda:** `cd Frontend && ./node_modules/.bin/tsc --noEmit`
        **Analiza:** Sukces — kompilacja TypeScript bez żadnych błędów.

**Zadania: Ukończono Fazę 5 - Widoki i Moduł Głosowy (Frontend).**

*   **Zrealizowane kroki:**
    1. Zbudowano Dashboard z wielkim przyciskiem mikrofonu, kartą ostatniego pomiaru z kolorowymi statusami medycznymi (norma/podwyższone/wysokie), dialogiem ręcznego wpisywania tekstu do AI, i edytowalnym dialogiem potwierdzenia wartości z wykrywaniem anomalii.
    2. Dodano kartę **podsumowania statystyk** na Dashboard: średnie ciśnienie SYS/DIA, średnie tętno, zliczanie anomalii z ostatnich pomiarów.
    3. Zintegrowano **wykresy liniowe** historii ciśnienia za pomocą biblioteki `victory-native` z interaktywnym tooltipmem na dotyk (3 linie: SYS, DIA, Puls z osią czasu).
    4. Wdrożono **zapis PDF na urządzenie** z wykorzystaniem nowego API `expo-file-system` v19 (klasy `File`, `Paths`) + natywny dialog udostępniania (`expo-sharing`).
    5. Przygotowano abstrakcyjny hook `useVoiceInput` pod przyszłą integrację natywnego STT (wymaga Development Build).
    6. Zainstalowano i skonfigurowano dodatkowe zależności: `victory-native`, `react-native-reanimated`, `@shopify/react-native-skia`, `react-native-gesture-handler`, `react-native-svg`, `expo-file-system`, `expo-sharing`.
    7. Dodano konfigurację Babel (`babel.config.js`) z pluginem `react-native-reanimated/plugin`.

*   **Pomyślne weryfikacje / Komendy wykonawcze:**
    *   **Komenda:** `cd Frontend && ./node_modules/.bin/tsc --noEmit`
        **Analiza:** Sukces — 0 błędów TypeScript po integracji victory-native i nowego API expo-file-system.

### Raport - 23.04.2026 (Podsumowanie)
**Faza 4 i 5 zostały zrealizowane.**

Struktura frontendowa jest kompletna z nawigacją, stanem, motywem i widokami. Jedyny brakujący element to natywne rozpoznawanie mowy (STT), które wymaga Development Build (`expo prebuild + run:android`) — przygotowano hook `useVoiceInput` gotowy do podpięcia.

---

## Użyte Mechanizmy Reaktywności (Kotlin Coroutines vs. Java Reactor)

Aplikacja oparta na architekturze reaktywnej (Spring WebFlux) została zaimplementowana z wykorzystaniem Kotlin Coroutines. Pomimo identycznego celu – uwolnienia wątków przed blokowaniem (Non-blocking I/O) – Coroutines stanowią lżejszą i bardziej czytelną alternatywę dla standardowych reaktorów takich jak biblioteka Java Reactor (WebFlux domyślnie używa Project Reactor).

Oto przyporządkowanie użytych mechanizmów Coroutines z `Backend` do ich odpowiedników w Java Reactor oraz powód ich wyboru:

1.  **Funkcje Zawieszające (`suspend fun`)** 
    *   **Odpowiednik w Java Reactor:** `Mono<T>` (Zwracające jeden obiekt lub pustkę).
    *   **Gdzie użyte:** We wszystkich usługach (np. `MeasurementService.saveMeasurement`) i akcjach wykonujących pojedyncze żądania (kontrolery takie jak `UserController`).
    *   **Dlaczego użyte:** Słowo kluczowe `suspend` umożliwia zawieszenie operacji w oczekiwaniu na odpowiedź, nie blokując samego fizycznego wątku roboczego. Zaletą względem `Mono<T>` jest możliwość programowania w stylu synchronicznym (tzw. "imperatywnym"), redukując "zagnieżdżanie callbacków" i długie łańcuchy takie jak `.flatMap { ... }.map { ... }`. Zwiększa to znacząco czytelność logiki biznesowej, pozostawiając te same zalety skali Netty w tle.

2.  **Strumienie asynchroniczne (`Flow<T>`)**
    *   **Odpowiednik w Java Reactor:** `Flux<T>` (Strumień nieskończony lub wieloelementowy).
    *   **Gdzie użyte:** Zwracanie list bezpośrednio z bazy w np. `MeasurementRepository.findTop10ByUserIdOrderByCreatedAtDesc` oraz ich przekazanie aż na sam koniec, do klienta w `MeasurementController`.
    *   **Dlaczego użyte:** `Flow` zapewnia strumieniowe "pullowanie" (odpytywanie o następną wartość). Pozwala to na nieakumulowanie całej listy 10 rekordów w pamięci RAM aplikacji; wartości wyciąga i transmituje się do klienta HTTP przez WebFlux obiekt po obiekcie. Podobnie jak z `Flux`, zapewnia wsparcie Backpressure. Użycie `Flow` natywnie współgra z ekosystemem coroutin.

3.  **Zmiana kontekstu / puli wątków (`withContext(Dispatchers.IO)`)**
    *   **Odpowiednik w Java Reactor:** `.subscribeOn(Schedulers.boundedElastic())` lub `.publishOn(...)`.
    *   **Gdzie użyte:** Konkretna implementacja w klasie `PdfGeneratorService` do wygenerowania raportu openpdf (`fun generateHealthReport`).
    *   **Dlaczego użyte:** Generowanie dokumentu ustrukturyzowanego takiego jak PDF na bazie wbudowanych bibliotek IO jest operacją naturalnie blokującą. Uruchomienie jej na domyślnej pętli Netty zablokowałoby obsługę powiadomień dla wszystkich innych klientów. `Dispatchers.IO` to pula wątków specjalnie stworzona do blokujących operacji i deleguje to zadanie, po czym zwraca wynik asynchronicznie, tak samo jak zachowałby się podsystem `Schedulers.boundedElastic` pozwalający obronić "Event Loop" wektorujący żądania.

---

## Komendy Użyte w Projekcie i do uruchomienia(Dokumentacja)

### Backend (Kotlin / Spring Boot)

```bash
# Uruchomienie bazy danych PostgreSQL w kontenerze Docker
cd Backend && docker compose up -d

# Kompilacja backendu (bez testów)
cd Backend && ./gradlew build -x test

# Kompilacja backendu z testami
cd Backend && ./gradlew build

# Uruchomienie testów
cd Backend && ./gradlew test

# Uruchomienie serwera backendowego (port 8080)
cd Backend && ./gradlew bootRun
```

### Frontend (React Native / Expo)

```bash
# Instalacja zależności
cd Frontend && npm install

# Instalacja zależności kompatybilnych z Expo SDK
cd Frontend && npx expo install <nazwa-paczki>

# Uruchomienie Metro Bundler (serwer deweloperski)
cd Frontend && npm start

# Uruchomienie z wyczyszczonym cache (po zmianach babel.config.js)
cd Frontend && npx expo start -c

# Kompilacja TypeScript (sprawdzenie typów bez emitowania kodu)
cd Frontend && ./node_modules/.bin/tsc --noEmit

# Uruchomienie testów jednostkowych (Jest)
cd Frontend && npx jest

# Development Build (wymagany dla natywnych modułów jak STT)
cd Frontend && npx expo prebuild
cd Frontend && npx expo run:android
```

### 🌐 Konfiguracja Tunelowania dla WSL i Fizycznego Telefonu (localtunnel + Expo Tunnel)

Podczas pracy w środowisku **WSL (Windows Subsystem for Linux)**, sieć wirtualna WSL jest odizolowana od sieci fizycznej (LAN), w której znajduje się Twój telefon. Aby fizyczne urządzenie mobilne (z zainstalowaną aplikacją Expo Go lub Development Buildem) mogło połączyć się z Twoim lokalnym backendem oraz pobrać paczkę JavaScript, należy zastosować podwójne tunelowanie:

---

#### KROK 1: Tunelowanie Backendu (Udostępnienie API w internecie)
Backend Spring Boot domyślnie nasłuchuje na porcie `8080`. Musimy wystawić go na publiczny, bezpieczny adres HTTPS:

1. **Uruchom Backend:**
   ```bash
   cd Backend && ./gradlew bootRun
   ```
2. **Uruchom localtunnel:**
   W osobnym oknie terminala wywołaj:
   ```bash
   cd Frontend && npx localtunnel --port 8080
   ```
   *Konsola wyświetli publiczny adres URL, np.: `https://gentle-snakes-jump.localtunnel.me`*
3. **Konfiguracja w kodzie Frontend:**
   Skopiuj wygenerowany adres HTTPS i wklej go jako `BASE_URL` w pliku [Frontend/api/client.ts](file:///home/naimad/projekty/aBP/Frontend/api/client.ts).
   *Uwaga: W pliku `client.ts` zaimplementowano automatyczne wstrzykiwanie nagłówka `'bypass-tunnel-reminder': 'true'`. Jest to kluczowe, aby localtunnel nie serwował ekranu ostrzegawczego przy pierwszym połączeniu (co blokowałoby zapytania mobilne).*

---

#### KROK 2: Tunelowanie Frontendu (Pobieranie paczki JS przez telefon)
Aby telefon pobrał aplikację z komputera przez Internet:

* **Wariant A: Uruchamianie w Expo Go**
  Jeśli testujesz w standardowym Expo Go, wystartuj serwer Metro z flagą `--tunnel`:
  ```bash
  cd Frontend && npx expo start --tunnel
  ```
  Zeskanuj wygenerowany kod QR za pomocą aplikacji **Expo Go** na swoim smartfonie.

* **Wariant B: Uruchamianie w natywnym Development Buildzie (Zalecane / Wymagane dla STT)**
  Ponieważ natywne moduły (np. `@react-native-voice/voice` do obsługi mikrofonu) wymagają kodu natywnego, standardowa aplikacja Expo Go ich nie obsłuży. Należy zbudować tzw. **Development Client**:

  1. **Podłącz fizyczny telefon** do komputera przez kabel USB i upewnij się, że masz włączone *Debugowanie USB* w opcjach programisty Androida.
  2. **Zbuduj i zainstaluj aplikację na telefonie:**
     ```bash
     cd Frontend
     npx expo prebuild
     npx expo run:android --variant debug
     ```
     *Komenda skompiluje kod Kotlin/Java i zainstaluje na Twoim urządzeniu dedykowaną aplikację o nazwie **aBP** (będzie miała ikonę deweloperską).*
  3. **Wystartuj serwer deweloperski z tunelem i flagą klienta:**
     ```bash
     npx expo start --dev-client --tunnel
     ```
  4. **Uruchom zainstalowaną aplikację deweloperską na telefonie** i:
     - Zeskanuj kod QR aparatem z poziomu terminala, LUB
     - Wpisz ręcznie wygenerowany adres tunelu Expo Metro w polu tekstowym aplikacji deweloperskiej.
  5. Metro Bundler prześle paczkę JavaScript przez zabezpieczony tunel wprost do Twojego zainstalowanego pliku APK na telefonie, umożliwiając pełne debugowanie i hot-reloading!

---


## Testowanie Aplikacji — Szczegółowa Dokumentacja

Projekt posiada dwa niezależne zestawy testów — po jednym dla Backendu (Kotlin/JUnit 5) i Frontendu (React Native/Jest). Każdy z nich można uruchomić **niezależnie od drugiego** bez konieczności posiadania działającego serwera czy bazy danych (testy są w pełni zmockowane).

### Architektura Testów — Przegląd

| Warstwa | Framework | Typ testów | Wymaga bazy/serwera? |
|---|---|---|---|
| **Backend** — Serwisy | JUnit 5 + MockK + Coroutines Test | Jednostkowe (unit) | ❌ Nie |
| **Backend** — Kontrolery | JUnit 5 + WebFluxTest + SpringMockK | Integracyjne (WebFlux slice) | ❌ Nie (mockowany kontekst) |
| **Frontend** — Store (Zustand) | Jest + Testing Library | Jednostkowe (unit) | ❌ Nie |
| **Frontend** — Komponenty | Jest + Testing Library RN | Jednostkowe z renderowaniem | ❌ Nie |
| **Frontend** — Ekrany | Jest + Testing Library RN | Jednostkowe z interakcją | ❌ Nie |

---

### 🔧 Testy Backendu (Kotlin / Spring Boot WebFlux)

#### Wymagania wstępne
- **Java 17+** zainstalowana w systemie (zalecane: `openjdk-17-jdk` na Ubuntu/WSL)
- **Gradle Wrapper** (`./gradlew`) — dostarczany z projektem, nie wymaga osobnej instalacji
- **Baza danych NIE jest wymagana** — testy używają mocków (`MockK` / `SpringMockK`) zamiast prawdziwej bazy PostgreSQL

#### Komenda uruchomienia

```bash
# Uruchomienie WSZYSTKICH testów (z katalogu głównego projektu lub Backend)
cd Backend && ./gradlew test
```

> **Uwaga:** Test `BackendApplicationTests.contextLoads()` jest oznaczony jako `@Disabled`, ponieważ wymaga żywej bazy PostgreSQL. Pozostałe testy używają `@WebFluxTest` i mocków — działają bez zewnętrznych zależności.

#### Dodatkowe przydatne komendy Gradle

```bash
# Uruchomienie testów z pełnym logowaniem (widzisz każdy test PASSED/FAILED)
cd Backend && ./gradlew test --info

# Uruchomienie testów z czyszczeniem cache (wymuszenie ponownego uruchomienia)
cd Backend && ./gradlew clean test

# Uruchomienie konkretnej klasy testowej
cd Backend && ./gradlew test --tests "com.adb.backend.service.MeasurementServiceTest"

# Uruchomienie konkretnego testu (metody)
cd Backend && ./gradlew test --tests "com.adb.backend.service.MeasurementServiceTest.high systolic triggers anomaly"
```

#### Inwentarz testów Backendu (6 plików / ~25 przypadków testowych)

| Plik testowy | Co testuje | Liczba testów |
|---|---|---|
| `MeasurementServiceTest.kt` | Logika detekcji anomalii medycznych (twarde progi WHO: SYS≥180, DIA≥110, Puls>120/<40; kryteria względne pacjenta: odchylenie >25% od średniej historii) | 8 |
| `GeminiServiceTest.kt` | Tryb mock Gemini AI (klucz API pusty/="mock"), parsowanie JSON odpowiedzi, obsługa znaczników markdown | 4 |
| `UserControllerWebFluxTest.kt` | Endpoint `POST /api/users/login` — logowanie nowego i istniejącego użytkownika | 2 |
| `MeasurementControllerWebFluxTest.kt` | Endpointy `GET/POST /api/measurements/{userId}` — pobieranie listy, zapis nowego pomiaru, flaga anomalii | 4 |
| `ReportControllerWebFluxTest.kt` | Endpoint `GET /api/reports/{userId}/download` — generacja PDF, nagłówki HTTP, content-type | 2 |
| `BackendApplicationTests.kt` | Ładowanie kontekstu Spring (**@Disabled** — wymaga żywej bazy) | 1 (wyłączony) |

#### Raport wyników Backendu (HTML)

Po uruchomieniu `./gradlew test`, Gradle automatycznie generuje szczegółowy raport HTML:

```
Backend/build/reports/tests/test/index.html
```

Otwórz ten plik w przeglądarce, aby zobaczyć:
- ✅ Listę wszystkich testów z wynikami PASSED/FAILED
- ⏱️ Czas wykonania każdego testu
- 📋 Stacktrace dla testów, które nie przeszły
- 📊 Podsumowanie statystyczne (% zdanych)

---

### 📱 Testy Frontendu (React Native / Jest)

#### Wymagania wstępne
- **Node.js 18+** zainstalowany w systemie
- **Zainstalowane zależności:** `cd Frontend && npm install` (jeśli nie zostały zainstalowane wcześniej)
- **Emulator/telefon NIE jest wymagany** — testy renderują komponenty w środowisku Node.js (JSDOM)

#### Komenda uruchomienia

```bash
# Uruchomienie WSZYSTKICH testów
cd Frontend && npx jest

# Alternatywnie — z flag verbose (widoczne nazwy każdego testu)
cd Frontend && npx jest --verbose
```

#### Dodatkowe przydatne komendy Jest

```bash
# Uruchomienie testów z pokryciem kodu (code coverage)
cd Frontend && npx jest --coverage

# Uruchomienie testów w trybie watch (automatyczne ponowne uruchomienie po zmianach)
cd Frontend && npx jest --watch

# Uruchomienie konkretnego pliku testowego
cd Frontend && npx jest __tests__/store/useAppStore.test.ts

# Uruchomienie testów pasujących do wzorca nazwy
cd Frontend && npx jest --testNamePattern="loguje użytkownika"
```

#### Inwentarz testów Frontendu (3 pliki / ~8 przypadków testowych)

| Plik testowy | Co testuje | Liczba testów |
|---|---|---|
| `__tests__/store/useAppStore.test.ts` | Store Zustand: stan początkowy (niezalogowany), akcja `setLogin`, akcja `logout`, przełączanie motywu `toggleTheme` | 4 |
| `__tests__/components/BloodPressureChart.test.tsx` | Komponent wykresu: informacja o braku danych (0 i 1 pomiar), renderowanie legendy i tytułu (≥2 pomiary) | 3 |
| `__tests__/app/LoginScreen.test.tsx` | Ekran logowania: renderowanie pól i przycisku, walidacja pustego pola (komunikat błędu) | 2 |

#### Konfiguracja testowa Frontendu

| Plik | Rola |
|---|---|
| `jest.config.js` | Preset `jest-expo`, plik setupu, wzorce `transformIgnorePatterns` dla paczek React Native |
| `jestSetup.js` | Mockowanie `react-native-reanimated` i `react-native-gesture-handler` (niezbędne bo testy nie mają natywnego runtime) |
| `__mocks__/@react-native-async-storage/async-storage.js` | Mock AsyncStorage (persystencja danych lokalna działa w testach bez urządzenia) |

#### Raport pokrycia kodu (Coverage)

Po uruchomieniu `npx jest --coverage`, Jest wygeneruje raport w katalogu:

```
Frontend/coverage/lcov-report/index.html
```

Raport zawiera:
- 📊 Procentowe pokrycie: Statements, Branches, Functions, Lines
- 🔍 Podświetlenie niepokrytych linii w kodzie źródłowym
- 📁 Pokrycie per-plik i per-katalog

---

### 🖥️ Gdzie uruchamiać testy? (Terminal / IDE)

#### Rekomendacja: Terminal WSL (najszybsza i najprostsza metoda)

**Oba zestawy testów można uruchomić bezproblemowo z dowolnego terminala w WSL Ubuntu**, w tym z terminala wbudowanego w Google Antigravity. Nie jest wymagane żadne IDE.

```bash
# BACKEND — wystarczy jedna komenda:
cd /home/naimad/projekty/aBP/Backend && ./gradlew test

# FRONTEND — wystarczy jedna komenda:
cd /home/naimad/projekty/aBP/Frontend && npx jest --verbose
```

#### Porównanie środowisk uruchomieniowych

| Środowisko | Backend (Gradle) | Frontend (Jest) | Zalety | Wady |
|---|---|---|---|---|
| **Terminal WSL (Antigravity / bash)** | ✅ Pełne wsparcie | ✅ Pełne wsparcie | Najszybszy start, zero konfiguracji, działa od razu | Brak GUI debuggera |
| **IntelliJ IDEA** | ✅ Najlepsze wsparcie | ⚠️ Możliwe, ale nienaturalne | Klikanie ▶ przy testach, debugger, refactoring Kotlin | Ciężkie IDE, wymaga licencji Ultimate dla pełnego Spring |
| **WebStorm** | ⚠️ Nie obsługuje Kotlin/Gradle | ✅ Najlepsze wsparcie | Klikanie ▶ przy testach Jest, debugger JS/TS | Nie obsłuży Backendu, wymaga licencji |
| **VS Code** | ✅ Przez terminal/plugin | ✅ Przez terminal/plugin | Lekki, darmowy, wielojęzykowy | Wymaga konfiguracji pluginów |

#### Kiedy użyć IDE zamiast terminala?

- **IntelliJ IDEA** — zalecane gdy chcesz **debugować** test Backendu krok po kroku (breakpointy w Kotlin), lub szybko uruchamiać pojedyncze testy kliknięciem ikony ▶ przy nazwie metody.
- **WebStorm** — zalecane gdy chcesz **debugować** test Frontendu z breakpointami w TypeScript/JSX.
- **Terminal (Antigravity / bash)** — zalecane do **szybkiego uruchomienia wszystkich testów** i weryfikacji, że nic się nie zepsuło (CI-style). To jest najczęstszy scenariusz.

> **Podsumowanie:** Na potrzeby studenckiego projektu **terminal WSL w Antigravity całkowicie wystarczy** do uruchomienia i weryfikacji testów. IDE (IntelliJ/WebStorm) są przydatne tylko gdy potrzebujesz zaawansowanego debugowania z breakpointami.

---

### 📋 Szybka ściągawka — Uruchomienie wszystkich testów

```bash
# ======== BACKEND ========
cd /home/naimad/projekty/aBP/Backend
./gradlew test
# Wynik: BUILD SUCCESSFUL = wszystkie testy przeszły
# Raport HTML: Backend/build/reports/tests/test/index.html

# ======== FRONTEND ========
cd /home/naimad/projekty/aBP/Frontend
npx jest --verbose
# Wynik: Tests: X passed, X total
# Pokrycie: npx jest --coverage → Frontend/coverage/lcov-report/index.html
```

### Zainstalowane Zależności Frontendowe

| Paczka | Wersja | Cel |
|---|---|---|
| `expo` | ^54.0.1 | Platforma deweloperska React Native |
| `expo-router` | ~6.0.0 | File-based routing |
| `react-native-paper` | ^5.15.1 | Material Design 3 UI |
| `zustand` | ^5.0.12 | Globalny zarządzacz stanu |
| `axios` | ^1.15.1 | Klient HTTP |
| `victory-native` | ^41.20.2 | Interaktywne wykresy |
| `@shopify/react-native-skia` | 2.2.12 | Silnik renderujący Skia (wymagany przez victory-native) |
| `react-native-reanimated` | ~4.1.1 | Animacje (wymagany przez victory-native) |
| `react-native-gesture-handler` | ~2.28.0 | Obsługa gestów (wymagany przez victory-native) |
| `react-native-svg` | 15.12.1 | Grafika wektorowa SVG |
| `expo-file-system` | ~19.0.21 | Zapis plików na urządzeniu |
| `expo-sharing` | ~14.0.8 | Natywny dialog udostępniania plików |
| `@react-native-async-storage/async-storage` | ^3.0.2 | Persystentny storage (motyw) |

---

## Konfiguracja i Uruchamianie (F.A.Q)

### Gdzie definiowane są stałe i klucze API (np. do Gemini)?
Głównym punktem konfiguracji backendu Spring Boot jest plik YAML:
`Backend/src/main/resources/application.yaml`

To w nim znajduje się baza konfiguracji m.in. dostępu do bazy danych PostgreSQL. Klucz API do serwisu Gemini jest w nim zmapowany jako referencja do zmiennej środowiskowej systemu operacyjnego: `${GEMINI_API_KEY}`. 
Zamiast "twardo wpisywać" klucz w kodzie, co jest złą praktyką (niebezpieczeństwo wycieku na GitHub), aplikacja ładuje go dynamicznie. Aby go dostarczyć masz 2 główne drogi:
1. **Przez komendę w terminalu**: Podaj go jako zmienną lokalną podczas uruchamiania backendu:
   ```bash
   GEMINI_API_KEY="twoj-klucz-api" ./gradlew bootRun
   ```
2. **Eksport w OS (Zmienne środowiskowe)**: Ustaw w terminalu `export GEMINI_API_KEY="twoj-klucz-api"` przed uruchomieniem IDE lub dockera. Możesz także skonfigurować go w pliku `.env` jeśli używasz pluginu `spring-dotenv` lub narzędzi ładujących zmienne przed wywołaniem Javy.

### Gdzie są dane do logowania i jacy są użytkownicy?
Aplikacja została zaprojektowana w trybie studenckim/bezbarierowym, gdzie nie wymaga się skomplikowanej rejestracji z hasłem, weryfikacją e-mail ani tokenami JWT.
Mechanizm logowania (zaimplementowany w `Backend/src/main/kotlin/com/adb/backend/service/UserService.kt`) opiera się na prostym modelu **"Login or Create"**:
* Podczas wpisywania dowolnej nazwy na ekranie mobilnym (np. wpiszesz `JanKowalski`), backend sprawdza czy w tabeli `app_users` w PostgreSQL taki użytkownik już istnieje.
* Jeśli **tak**: Zwraca jego unikalny klucz UUID i autoryzuje front, pobierając z bazy jego historyczne pomiary medyczne.
* Jeśli **nie**: Aplikacja automatycznie, w locie utworzy w bazie nowy profil dla `JanKowalski` i wejdzie do czystego Dashboardu.

Dzięki temu *nie ma pliku z predefiniowanymi logami/użytkownikami*. Po prostu wpisz dowolną nazwę w aplikacji, aby rozpocząć!

---

## Procedura Uruchamiania i Różne Konfiguracje

Aplikacja składa się z dwóch niezależnych modułów (Backend i Frontend), które muszą działać jednocześnie, by komunikacja API funkcjonowała poprawnie.

### 1. Uruchamianie Bazy Danych (Docker PostgreSQL)
Aplikacja wykorzystuje silnik PostgreSQL uruchamiany w izolowanym kontenerze. Zamiast instalować bazę bezpośrednio w systemie (co "brudzi" OS), korzystamy z pliku `docker-compose.yml`.
*   **Start bazy:** W terminalu wejdź do folderu `Backend` i wpisz:
    ```bash
    docker compose up -d
    ```
    Flaga `-d` uruchamia kontener w tle (detached). Baza wystawi się na porcie `5432` z loginem `abpuser` i hasłem `abppassword`.
*   **Zatrzymywanie bazy:**
    ```bash
    docker compose down
    ```
*   **Trwałość Danych:** Zdefiniowaliśmy wolumen `postgres_data`, co oznacza, że wyłączenie czy zresetowanie kontenera *nie usunie* Twoich pomiarów ani użytkowników! Dane przetrwają restart.

### 2. Uruchamianie Backendu (Spring Boot WebFlux)
Mając uruchomioną w tle bazę danych z dockera, odpal serwer API.
```bash
cd Backend
# Z eksportem klucza (zalecane)
GEMINI_API_KEY="twój-klucz" ./gradlew bootRun
```
*Serwer wystartuje na porcie `8080` (nasłuchując jako `http://localhost:8080`).*

### 3. Uruchamianie Frontendu (React Native / Expo)
Frontend uruchamiany jest przez narzędzie Metro Bundler i posiada kilka trybów roboczych:
```bash
cd Frontend
npm start
```
Po uruchomieniu serwera paczek zobaczysz interaktywne menu w konsoli (wciśnij na klawiaturze wybraną literę):
*   **`w` (Tryb Webowy)**: Otworzy aplikację w przeglądarce (`http://localhost:8081`). Idealne do szybkiego testowania i używania myszki bez emulatorów. Pamiętaj, że w przeglądarce zamiast interaktywnych natywnych wykresów załaduje się czytelna **Tabela Danych** (zaprojektowana jako niezawodny _Wariant B_ na Web).
*   **`a` (Tryb Android)**: Odpali aplikację na włączonym emulatorze Android Studio (wymaga wpierw odpalenia programu AVD i np. Pixela). Tu zadziałają pełne sprzętowe animacje wykresów z użyciem `victory-native` i Reanimated.
*   **Skanowanie QR (Fizyczny Telefon)**: Najlepsza i najpłynniejsza opcja. Jeśli masz w smartfonie zainstalowaną aplikację **Expo Go** (ze sklepu Android/iOS) i jesteś w tej samej sieci WiFi, zeskanuj aparatem kod QR z terminala. Aplikacja uruchomi się na żywo na Twoim telefonie z natywną wydajnością! *(Uwaga: W systemie WSL sieci potrafią się rozmijać. Wtedy najłatwiej wystartować komendą `npx expo start --tunnel`, aby skorzystać z bezpiecznego tunelu publicznego bez martwienia się o LAN i zaporę).*

---

## Jak wprowadzać modyfikacje w strukturze Bazy Danych?

Spring Boot w tym projekcie (w modelu reaktywnym R2DBC) nie opiera się na pełnym silniku mapowania "Hibernate", który samoistnie i magicznie generuje ustrukturyzowane kolumny. Cechuje się to znacznie wyższą szybkością, ale wymusza od nas ręczną konfigurację klasycznymi skryptami SQL.

Główny schemat znajduje się pod ścieżką:
`Backend/src/main/resources/schema.sql`

Plik ten uruchamia się samoistnie **przy każdym włączeniu aplikacji backendowej** (`bootRun`). Używa komend typu `CREATE TABLE IF NOT EXISTS`, przez co jeśli tabele już powstały – Spring pozostawia je nietknięte.

Jeśli zmienisz strukturę w klasach Kotlin (np. dodasz zmienną `email` w `AppUser`) i **chcesz przenieść zmiany do bazy**, masz dwie ścieżki:

1. **Dopisanie Modyfikacji (Produkcyjnie)**
   Otwórz plik `schema.sql` i dopisz na samym dole instrukcję wymuszającą na bazie aktualizację tabeli, np.:
   `ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email VARCHAR(100);`
2. **Całkowity Reset Bazy (Tylko w procesie testowym!)**
   Jeśli chcesz wyzerować wszystko (skasować istniejących pacjentów i pomiary), po prostu wymuś zniszczenie zabezpieczonego kontenera z danymi. Następne wywołanie utworzy tabelę całkiem "na nowo" prosto ze `schema.sql`.
   ```bash
   cd Backend
   docker compose down -v  # Magiczna flaga "-v" całkowicie kasuje zabezpieczony wolumen postgres_data!
   docker compose up -d    # Tworzy znów czystą bazę
   ./gradlew bootRun       # Tworzy nowiutkie struktury z pliku SQL
   ```

---

## Dziennik prac i postępy (19.05.2026)

- **Unifikacja interfejsu (Frontend)**: Zrezygnowano z wielkiego przycisku mikrofonu na głównym ekranie na rzecz przejrzystego przycisku "+ Dodaj wynik". Wdrożono spójne okno dialogowe pozwalające na ręczne dodawanie wyników oraz wywoływanie asystenta AI z poziomu jednego zunifikowanego formularza.
- **Dodano wizualne statusy asystenta AI**: Mikrofon zastąpiono responsywnym przyciskiem "Wyślij do AI", który podczas wczytywania (`isAiParsing`) blokuje się i wyświetla spinner oraz napis "Wysyłanie do AI...".
- **Aktualizacja nazwy modelu Gemini**: Zmieniono docelowy endpoint na `gemini-flash-latest`, zgodnie z najnowszą, sprawdzoną w PHP specyfikacją i dokumentacją Google Studio API, eliminując błąd 404 (Not Found).
- **Rozwiązanie problemu CORS przy zmianie portu Expo**: Dodano do `CorsConfig.kt` zaufane źródło dla portu `8082` (oraz `127.0.0.1:8082`), co uchroniło komunikację przed odrzuceniem w przypadku, gdy środowisko Node/Expo zajęło kolejny port z powodu zawieszonych procesów.
- **Rozwiązanie problemów ze środowiskiem (Zmienne systemowe Gradle)**: Zweryfikowano działanie zmiennych środowiskowych u daemona Gradle – od teraz rekomendowanym i bezpiecznym sposobem uruchamiania aplikacji ze swoim prywatnym kluczem API jest przekazanie go bezpośrednio jako argument: `--args='--gemini.api-key="KLUCZ"'`, co gwarantuje prawidłowe połączenie z backendem Google.
- **Zakończenie i certyfikacja**: Odznaczono jako wykonane wszystkie zadania w `tasks.md` w fazie 7. Środowisko E2E pomyślnie przeszło weryfikację.

---

## Dziennik prac i postępy (23.05.2026 - Rozwiązanie problemów z budowaniem Android i unifikacja bibliotek)

W ramach prac nad przygotowaniem produkcyjnej/deweloperskiej wersji instalacyjnej aplikacji mobilnej na system Android (Development Build za pomocą usługi **EAS Build** oraz lokalnej kompilacji), zdiagnozowano i pomyślnie rozwiązano szereg krytycznych konfliktów w konfiguracji systemu Gradle oraz manifestu Androida. Poniższy raport szczegółowo dokumentuje podjęte kroki oraz zastosowaną inżynierię oprogramowania.

### 1. Diagnoza problemów z Manifest Merger (AndroidX vs. Deprecated support-compat)
Podczas generowania buildu deweloperskiego przy użyciu komendy `npx eas-cli build --profile development --platform android` napotkano krytyczny błąd w fazie scalania manifestów (`:app:processDebugMainManifest`):
```
Attribute application@appComponentFactory value=(androidx.core.app.CoreComponentFactory)... is also present at [com.android.support:support-compat:28.0.0]...
```
**Analiza techniczna konfliktu:**
Nowoczesne środowisko **Expo SDK 54** oraz sam React Native bazują w pełni na standardzie **AndroidX** (nowoczesnym zestawie bibliotek wsparcia od Google). Jednakże wykorzystywana biblioteka do natywnego rozpoznawania mowy **`@react-native-voice/voice@3.2.4`** (najnowsza dostępna wersja tej biblioteki, nieposiadająca nowszych wydań) wciąż odwołuje się wewnętrznie do przestarzałego pakietu `com.android.support:appcompat-v7:28.0.0`.
Podczas scalania manifestów (`Manifest Merger`), kompilator Gradle próbuje złączyć deklaracje tagu `<application>` z różnych modułów. Zarówno nowoczesny silnik AndroidX, jak i stara biblioteka `support-compat` próbują zadeklarować własną fabrykę komponentów (`android:appComponentFactory`), co wywołuje konflikt nazw uniemożliwiający pomyślne ukończenie kompilacji.

### 2. Przebieg prac i analiza wypróbowanych podejść (Debugging)
Próba rozwiązania konfliktu metodami standardowymi wykazała ich niewystarczalność:
*   **Podejście A (Jetifier):** Skonfigurowano bibliotekę `expo-build-properties` w pliku `app.json` z parametrami `useAndroidX: true` oraz `enableJetifier: true`. Narzędzie Jetifier z powodzeniem przepisuje bytecode plików `.class` i `.jar` w locie, jednak **nie ingeruje w pliki `AndroidManifest.xml` zaszyte wewnątrz paczek npm**. Z tego powodu konflikt manifestów pozostał nienaprawiony.
*   **Podejście B (Expo Config Plugin `withAndroidManifest`):** Podjęto próbę manipulacji manifestem z poziomu oficjalnego mechanizmu Expo XML (`withAndroidManifest`), wprowadzając atrybut `tools:replace="android:appComponentFactory"`. Okazało się jednak, że wewnętrzny serializer XML używany przez Expo (`xml2js`) cicho wycina z manifestu atrybuty posiadające przestrzenie nazw (takie jak `android:appComponentFactory`), pozostawiając samo żądanie zamiany (`tools:replace`), co skutkowało błędem kompilacji: *„tools:replace specified but no new value specified”*.

### 3. Zastosowane stabilne rozwiązanie (Custom Expo Config Plugin)
Aby trwale i w pełni zgodnie z filozofią *Continuous Native Generation* (CNG - brak konieczności trzymania katalogu `android/` w repozytorium) naprawić problem kompilacji, zaimplementowano zaawansowany plugin konfiguracyjny Expo:

1.  **Stworzenie dedykowanego pluginu `withAndroidXFix.js`**
    W katalogu `Frontend/plugins/` utworzono niestandardowy plugin konfiguracyjny [withAndroidXFix.js](file:///home/naimad/projekty/aBP/Frontend/plugins/withAndroidXFix.js). Wykorzystuje on niskopoziomowy hook **`withDangerousMod`** do bezpośredniego operowania na surowym pliku `AndroidManifest.xml` tuż przed kompilacją Gradle (z pominięciem błędnego serializatora `xml2js`). Za pomocą wyrażeń regularnych:
    *   Wstrzykiwany jest namespace narzędzi (`xmlns:tools="http://schemas.android.com/tools"`) do głównego tagu `<manifest>`.
    *   Do sekcji `<application>` wstrzykiwane są atrybuty wymuszające poprawne mapowanie na bibliotekę AndroidX: `android:appComponentFactory="androidx.core.app.CoreComponentFactory"` oraz `tools:replace="android:appComponentFactory"`.
    
2.  **Globalne wykluczenie przestarzałych zależności (`configurations.all`)**
    Aby uchronić się przed kolejnymi konfliktami wersji z przestarzałych bibliotek tranzytywnych, plugin `withAndroidXFix.js` używa hooka **`withAppBuildGradle`** do wstrzyknięcia do pliku `app/build.gradle` globalnej reguły wykluczającej całą grupę wsparcia `com.android.support`:
    ```groovy
    configurations.all {
        exclude group: 'com.android.support'
    }
    ```

3.  **Rozwiązanie problemów z dublowaniem zasobów metadanych (Duplicate Resources in META-INF)**
    Po odcięciu zależności `android.support` kompilator napotkał problem ze zduplikowanymi plikami sygnatur i wersji bibliotek (np. `mergeDebugJavaResource FAILED - 2 files found META-INF/androidx.customview_customview.version`). W ramach wtyczki Gradle dopisano reguły pakowania (`packaging {}`) w konfiguracji Androida:
    ```groovy
    packaging {
        resources {
            pickFirsts += ['META-INF/*.version']
            pickFirsts += ['META-INF/*.properties']
            excludes += ['META-INF/DEPENDENCIES']
            excludes += ['META-INF/LICENSE']
            excludes += ['META-INF/LICENSE.txt']
            excludes += ['META-INF/NOTICE']
            excludes += ['META-INF/NOTICE.txt']
        }
    }
    ```
    Reguła `pickFirsts` instruuje Gradle, aby przy pakowaniu pliku APK w przypadku napotkania identycznych plików metadanych w różnych modułach po prostu wybrał pierwszy z nich i nie przerywał procesu budowania.

4.  **Aktualizacja zależności pod kątem zgodności z Expo SDK 54**
    Równolegle przeprowadzono audyt zainstalowanych paczek NPM deweloperskich i testowych pod kątem ich zgodności z Expo SDK 54. Z użyciem komendy `npx expo install --fix` ujednolicono wersje:
    *   `jest` podniesiono do wersji `~29.7.0`, a `jest-expo` do `~54.0.17` (dzięki czemu testy jednostkowe działają stabilnie w nowym środowisku).
    *   `react-native-worklets` zmigrowano do kompatybilnej wersji `0.5.1`.
    *   Biblioteki `zustand` (`^5.0.13`), `victory-native` (`^41.20.3`) oraz `react-native-paper` (`^5.15.2`) zostały zaktualizowane do wersji eliminujących drobne ostrzeżenia kompatybilności.

### 4. Podsumowanie i rezultaty wdrożenia
*   **Pełna zgodność z metodologią CNG:** Wszystkie zmiany natywne dla systemu Android są wprowadzane automatycznie w fazie prebuild za pomocą dedykowanych pluginów zarejestrowanych w `app.json`. Środowisko deweloperskie pozostaje czyste i nie wymaga ręcznego patchowania kodu w katalogu `/android`.
*   **Sukces kompilacji:** Zaimplementowane Config Pluginy trwale rozwiązały problem Manifest Merger oraz Resource Duplication, umożliwiając bezproblemową kompilację deweloperskich oraz produkcyjnych plików APK przy użyciu usługi EAS Build. Aplikacja jest przygotowana do bezpośredniego testowania natywnej funkcjonalności rozpoznawania mowy (STT) na urządzeniach z systemem Android.

---

## Dziennik prac i postępy (24.05.2026 - Faza 9: Poprawki UI/UX i Backend Logging)

Ukończono w całości Fazę 9 — wszystkie 5 zadań poprawkowych UI/UX + logowanie backendu.

### 1. KeyboardAvoidingView w dialogu dodawania pomiaru
**Plik:** `Frontend/app/(tabs)/dashboard.tsx`
Dialog „Nowy pomiar" owinięto w `KeyboardAvoidingView` (z `behavior="padding"` na iOS) oraz `ScrollView` z `keyboardShouldPersistTaps="handled"`. Formularz jest teraz przewijalny gdy klawiatura systemowa jest widoczna — pola nie są zasłaniane.

### 2. Przycisk mikrofonu (STT) w formularzu asystenta AI
**Plik:** `Frontend/app/(tabs)/dashboard.tsx`
Dodano przycisk `IconButton` z ikoną mikrofonu obok pola tekstowego AI. Przycisk:
- Korzysta z hooka `useVoiceInput` (natywne STT via `@react-native-voice/voice`)
- Wyświetla pulsującą animację (`Animated.loop`) podczas nasłuchiwania
- Automatycznie synchronizuje rozpoznany tekst (`transcript`) z polem AI za pomocą `useEffect`
- Wyświetla komunikat „🎙️ Słucham… mów teraz" podczas aktywnego nasłuchu
- Obsługuje graceful fallback z komunikatem o wymaganiu Development Build

### 3. SafeArea / padding dla dolnego menu nawigacyjnego (Android)
**Plik:** `Frontend/app/(tabs)/_layout.tsx`
Dodano `useSafeAreaInsets()` z `react-native-safe-area-context`. Dynamicznie dodawany jest `insets.bottom` do `height` i `paddingBottom` paska zakładek. Rozwiązuje problem nachodzenia przycisków systemowych Androida (nawigacja gestowa/klawisze) na dolne menu nawigacyjne.

### 4. Eliminacja ostrzeżenia Reanimated
**Plik:** `Frontend/components/BloodPressureChart.tsx`
Wyodrębniono tooltip wykresu do osobnego komponentu `ChartTooltip`. Odczyt wartości `SharedValue` z victory-native przeniesiono z cyklu renderowania do `useEffect`, mostując je bezpiecznie do stanu React. Eliminuje to ostrzeżenie `"Reading from value during component render"`.

### 5. Jasne logowanie braku GEMINI_API_KEY na backendzie
**Pliki:** `Backend/.../config/GeminiConfig.kt`, `Backend/.../service/GeminiService.kt`
- W `GeminiConfig` dodano `@PostConstruct` z SLF4J loggingiem:
  - `WARN` gdy klucz = "mock" lub pusty → „GEMINI_API_KEY is NOT set. Running in MOCK mode…"
  - `INFO` gdy klucz ustawiony → „Gemini API configured successfully (key: ****XXXX)"
- W `GeminiService` każde wywołanie mock loguje `WARN` z informacją o użytym wejściu

### 6. Naprawa testów LoginScreen
**Plik:** `Frontend/__tests__/app/LoginScreen.test.tsx`
Zaktualizowano asercje testowe do aktualnych tekstów UI (`'Monitor Ciśnienia'` zamiast `'Witaj w aBP'`, `'Wpisz swoją nazwę użytkownika'` zamiast `'Nazwa użytkownika nie może być pusta'`).

*   **Pomyślne weryfikacje / Komendy wykonawcze:**
    *   **Frontend:** `cd Frontend && npx jest` → **Tests: 9 passed, 9 total** (3 suites)
    *   **Backend:** `cd Backend && ./gradlew test` → **BUILD SUCCESSFUL**

---

## Dziennik prac i postępy (26.05.2026 - Faza 8: Rozszerzenia Natywne i Produkcyjne)

Zrealizowano zaplanowane rozszerzenia z Fazy 8 (poza pełną fizyczną integracją zależną od urządzenia z Androidem):

### 1. Tryb Offline-First i synchronizacja na froncie
Aplikacja została przystosowana do działania w miejscach bez zasięgu sieci (np. w przychodni).
- Nowy hook `useNetworkStatus` aktywnie odpytuje backend o dostępność.
- Jeśli backend jest niedostępny, UI wyświetla czerwony banner `OfflineBanner`.
- Pomiary są dodawane do kolejki offline w `AsyncStorage` (stan `pendingOfflineMeasurements` w Zustandzie).
- W ustawieniach dodano przycisk wymuszający ręczną synchronizację oczekujących pomiarów.

### 2. Generatywna sztuczna inteligencja jako Asystent Medyczny (RAG)
Zaimplementowano mechanizm Retrieval-Augmented Generation (RAG) korzystający z Gemini AI:
- `HealthTipService` pobiera historię pacjenta (do 10 pomiarów z bazy danych przez R2DBC).
- Historia wstrzykiwana jest do promptu i wysyłana asynchronicznie (`suspend`) do modelu LLM.
- Model analizuje trendy i zwraca krótką (2-3 zdania) poradę prozdrowotną w języku polskim.
- Porada widoczna jest jako dedykowana sekcja na głównym `Dashboardzie` wraz z opcją ręcznego odświeżenia.
- Zachowano pełną non-blocking architekturę Netty dzięki przejściu z `Mono` do Coroutines (`awaitSingle()`).

### 3. Dokumentacja (KDoc)
Zgodnie z wymaganiami akademickimi do wszystkich nowych usług, kontrolerów oraz DTO dodano obszerne komentarze dokumentacyjne. Wyjaśniają one działanie mechanizmów reaktywnych (brak blokowania I/O, asynchroniczne strumienie Flow). Podobne adnotacje znalazły się w głównym sklepie aplikacji (`useAppStore.ts`) oraz kliencie API.

### 4. Analiza metodyki testów i rozbudowa
Stworzono kompleksowy raport `test_analysis.md` opisujący powody wyboru określonych frameworków testowych (`MockK`, `RNTL`, `@WebFluxTest`). Dodano nowe zestawy testów jednostkowych (np. `HealthTipServiceTest`) z wirtualizacją czasu i weryfikacją mocków dla przepływów Kotlin Coroutines (`coEvery`).

*   **Pomyślne weryfikacje / Komendy wykonawcze:**
    *   **Frontend:** `cd Frontend && npx jest` → **Tests: 9 passed, 9 total**
    *   **Backend:** `cd Backend && ./gradlew test` → **BUILD SUCCESSFUL** (22 tests passed)

