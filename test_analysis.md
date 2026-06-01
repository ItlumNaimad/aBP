# Analiza i Metodyka Testów: Aplikacja Ciśnienia Krwi (aBP)

Dokument ten opisuje przyjętą metodologię testowania dla projektu aBP (aplikacji mobilnej React Native oraz reaktywnego backendu Kotlin Spring WebFlux), wybór poszczególnych scenariuszy testowych, zestawienie wyników oraz analizę wpływu paradygmatu reaktywnego (non-blocking) na proces testowania.

## 1. Metodologia Testów

### 1.1 Backend (Kotlin, Spring Boot, WebFlux)
Do testowania warstwy backendowej przyjęto strategię **izolowanych testów jednostkowych i integracyjnych (slicing testów)**:

*   **MockK zamiast SpringBootTest:** W większości serwisów biznesowych (np. `MeasurementService`, `GeminiService`, `HealthTipService`) zrezygnowano ze stawiania pełnego kontekstu Springa na rzecz lekkich testów jednostkowych z wykorzystaniem biblioteki `MockK`. Znacząco skraca to czas wykonania zestawu testów i pozwala na deterministyczne testowanie logiki (np. wykrywania anomalii) poprzez wstrzykiwanie makiet (mocków).
*   **WebFluxTest dla Kontrolerów:** Warstwa REST API była testowana za pomocą adnotacji `@WebFluxTest`. Pozwala to na przetestowanie tras, walidacji, serializacji JSON-a (poprzez `WebTestClient`) bez konieczności uruchamiania pełnego serwera Netty. 
*   **Testy Coroutines (runTest):** Wszystkie metody reaktywne (zawieszone `suspend fun`) testowane są w dedykowanym środowisku `runTest` udostępnianym przez bibliotekę `kotlinx-coroutines-test`. Moduł ten pozwala na wirtualizację czasu i omijanie rzeczywistych opóźnień asynchronicznych (np. w przypadku testowania wywołań WebClienta).

### 1.2 Frontend (React Native, Expo)
W warstwie klienckiej przyjęto strategię **testów komponentów i drzewa DOM (RNTL)**:

*   **React Native Testing Library (RNTL):** Użyto `render` oraz `fireEvent` do testowania interakcji użytkownika (np. formularz logowania, zachowanie przycisków na Dashboardzie) z perspektywy drzewa komponentów bez uruchamiania emulatora.
*   **Mockowanie Zależności Natywnych:** Część bibliotek działających z wykorzystaniem wątku UI i silnika natywnego musiała zostać zmockowana. Przykładem jest `@react-native-async-storage/async-storage` oraz `expo-router`.
*   **Zustand Test Store:** Testowanie sklepu z wykorzystaniem izolowanego środowiska, symulującego poprawne kolejkowanie w AsyncStorage (offline-first).

---

## 2. Wybór Scenariuszy Testowych i Przypadki Brzegowe

Przygotowano następujące kluczowe scenariusze testowe odpowiadające krytycznym punktom systemu medycznego:

### 2.1 Pomiary i Wykrywanie Anomalii (`MeasurementServiceTest`)
*   **Wartości progowe WHO:** Testowano "sztywne" granice anomalii m.in. skurczowe >= 180, rozkurczowe >= 110, puls > 120. (Przypadki skrajnego nadciśnienia).
*   **Odchylenia względem klastra (historii):** Test weryfikujący czy pomiar `140/90` zostanie uznany za anomalię u osoby, której poprzednie 10 pomiarów wynosiło konsekwentnie `110/70` (nagły skok przekraczający założone ~25% odchylenia).
*   **Brak historii:** Weryfikacja działania algorytmu dla całkowicie pierwszego pomiaru danego pacjenta.

### 2.2 Integracja AI (`GeminiServiceTest` & `HealthTipServiceTest`)
*   **Tryb Mock (Fall-back):** Ponieważ dostępność zewnętrznego API może być zakłócona (lub nie ma podanego klucza na serwerze studenckim), zaprojektowano test weryfikujący, czy system poprawnie cofa się do pre-definiowanych wartości mocków w przypadku `GEMINI_API_KEY=mock`. Zapobiega to crashom w warunkach deweloperskich.
*   **Oczyszczanie danych AI:** System generatywny LLM (Gemini) może dodawać niechciane znaczniki formatowania (np. Markdown code fences ` ```json `). Wybrano dedykowany scenariusz, który sprawdza czy serwis poprawnie oczyszcza te zanieczyszczenia z przesyłanego tekstu przed deserializacją.
*   **Puste dane medyczne dla RAG:** Test zachowania asystenta zdrowotnego (RAG) w przypadku pacjenta z zerową historią pomiarów (brak możliwości zbudowania promptu).

### 2.3 Store i Offline-First (Frontend)
*   **Kolejka Offline:** Test sprawdzający czy poprawnie dodają się elementy do wewnętrznego stanu w momencie braku komunikacji, włączając sprawdzanie modyfikacji listy bez wycieków pamięci.

---

## 3. Wyniki Weryfikacji (Stan na: Faza 8)

| Komponent / Pakiet | Narzędzie | Liczba Testów | Status Weryfikacji | Pokrycie krytyczne |
| :--- | :---: | :---: | :---: | :---: |
| **Backend: Controller Layer** (`WebFluxTest`) | JUnit 5 + SpringMockK | 4 testy | **PASSED** (100%) | REST JSON Serialize, Ścieżki |
| **Backend: Service Layer** (Logika Biznesowa) | JUnit 5 + MockK + runTest | 18 testów | **PASSED** (100%) | Algorytmy Anomalii, Tryb MOCK, RAG |
| **Frontend: Screens & Components** (UI) | Jest + RNTL | 6 testów | **PASSED** (100%) | Drzewo DOM, Stan, Zmiana Tekstów |
| **Frontend: State Management** (Zustand) | Jest | 3 testy | **PASSED** (100%) | Manipulacja Theme, User, Pomiary |

Wszystkie testy wykonują się spójnie. Uruchomienie lokalne za pomocą `./gradlew test` (ok. ~11s dla Backend) i `npx jest` (ok. ~10s dla Frontendu).

---

## 4. Wpływ Architektury Reaktywnej na Testowanie

Wykorzystanie asynchroniczności (non-blocking model) znacząco wpłynęło na proces pisania i działania testów:

1.  **Zalety (Wydajność w izolacji):** Testowanie Coroutines za pomocą modułu `kotlinx-coroutines-test` jest natychmiastowe. Metody takie jak `delay()` wewnątrz `runTest` są pomijane, dzięki czemu testy symulujące oczekiwanie sieciowe kończą się w ułamku sekund. Zmockowanie reaktywnych repozytoriów (`CoroutineCrudRepository`) jest proste dzięki dostarczanej przez język metodzie `flowOf(entity)`.
2.  **Wyzwania (Weryfikacja wywołań w MockK):** Często pojawiającym się problemem w metodykach TDD z użyciem Kotlin Coroutines jest testowanie funkcji zawieszonych za pomocą mocków. Użycie standardowego `every { ... }` na metodzie ze słowem kluczowym `suspend` zakończy się błędem frameworku. Konieczne było użycie dedykowanego bloku `coEvery { ... }` (dla definiowania zachowania) oraz `coVerify { ... }` (dla asercji wywołań).
3.  **Brak zablokowanych wątków IO:** Dzięki delegowaniu blokujących procesów generowania PDF za pomocą `withContext(Dispatchers.IO)`, sam proces testowania Spring Controllerów wykazał całkowity brak locków po stronie serwera Netty. Jest to gigantyczna przewaga nad aplikacjami Servletowymi (Tomcat), gdzie pojedyncze powolne generowanie raportu mogłoby zatrzymać testy integracyjne poprzez wyczerpanie puli wątków obsługujących połączenia HTTP. 
4.  **Pomost reactor-coroutines:** W miejscach, gdzie API frameworka Spring WebFlux było dostępne wyłącznie jako RxJava/Project Reactor (np. `WebClient`), konieczne było rzutowanie strumieni za pomocą `awaitSingle()`. Wymagało to szczególnej uwagi przy pisaniu testów, by odpowiednio obsłużyć "pustego" `Mono` przed zakończeniem wykonania asercji testu. Z perspektywy testu — wynik wraca po prostu jako klasyczny zwrot z metody.


---

## 5. Inwentarz Testów (Przeniesiony z README)

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

#### Inwentarz testów Backendu (5 plików / ~20 przypadków testowych)

| Plik testowy | Co testuje | Liczba testów |
|---|---|---|
| `MeasurementServiceTest.kt` | Logika detekcji anomalii medycznych (twarde progi WHO: SYS≥180, DIA≥110, Puls>120/<40; kryteria względne pacjenta: odchylenie >25% od średniej historii) | 8 |
| `GeminiServiceTest.kt` | Tryb mock Gemini AI (klucz API pusty/="mock"), parsowanie JSON odpowiedzi, obsługa znaczników markdown | 4 |
| `UserControllerWebFluxTest.kt` | Endpoint `POST /api/users/login` — logowanie nowego i istniejącego użytkownika | 2 |
| `MeasurementControllerWebFluxTest.kt` | Endpointy `GET/POST /api/measurements/{userId}` — pobieranie listy, zapis nowego pomiaru, flaga anomalii | 4 |
| `ReportControllerWebFluxTest.kt` | Endpoint `GET /api/reports/{userId}/download` — generacja PDF, nagłówki HTTP, content-type | 2 |

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

#### Inwentarz testów Frontendu (3 pliki / 9 przypadków testowych)

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


---

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



