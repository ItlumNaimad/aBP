# Dziennik Zmian (Changelog)

## Dzienniki Postępu Prac

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
    W katalogu `Frontend/plugins/` utworzono niestandardowy plugin konfiguracyjny `withAndroidXFix.js`. Wykorzystuje on niskopoziomowy hook **`withDangerousMod`** do bezpośredniego operowania na surowym pliku `AndroidManifest.xml` tuż przed kompilacją Gradle (z pominięciem błędnego serializatora `xml2js`). Za pomocą wyrażeń regularnych:
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

---

## Dziennik prac i postępy (31.05.2026 - Stabilizacja, usuwanie pomiarów i EAS Build)

Ostatnia faza poprawek deweloperskich skupiła się na eliminacji usterek krytycznych (bugfixing) zgłoszonych podczas testów E2E oraz wdrożeniu brakujących opcji CRUD na prośbę użytkowników.

### 1. Rozwiązanie problemów połączeniowych LocalTunnel (Tryb Offline)
- Zwiększono domyślne limity czasowe klienta HTTP `axios` (z 15s do 60s) oraz hooka sprawdzającego status sieci `useNetworkStatus` (do 45s).
- Zmiana była podyktowana opóźnieniami handshake'u TLS w darmowej usłudze Localtunnel. Zapobiega to fałszywemu wchodzeniu aplikacji mobilnej w „Tryb Offline" przy pierwszym uruchomieniu i wybudzeniu tunelu.
- Po stronie serwera WebFlux (Kotlin) w `CorsConfig.kt` zaimplementowano zaufanie globalne (`allowedOriginPatterns("*")`), odblokowując bezbłędną współpracę z proxy tunelującym.

### 2. Implementacja funkcji usuwania błędnych pomiarów (CRUD)
Dodano możliwość edycji własnej historii zdrowia przez użytkownika:
- **Backend:** Utworzono bezpieczny, reaktywny endpoint `DELETE /api/measurements/{userId}/{measurementId}`. Logika w `MeasurementService.kt` każdorazowo weryfikuje własność wpisu (UUID pacjenta) przed wywołaniem zapytania do bazy, zapobiegając nadużyciom.
- **Frontend:** Do komponentów list w zakładce `HistoryScreen` dodano czerwoną ikonę kosza. Każda próba usunięcia wymaga potwierdzenia przez natywny monit systemowy (`Alert`). Zaimplementowano odświeżanie strumienia pomiarów bez blokowania interfejsu.

### 3. Zaawansowane błędy React Native i UI
- **Pętla renderowania wykresu:** Naprawiono krytyczny błąd blokujący aplikację komunikatem `"Maximum update depth exceeded"`. Problem wynikał z odczytywania współdzielonych stanów `SharedValue` (Reanimated) z poziomu funkcji renderującej. Zastosowano wzorzec ciągłego odpytywania (setInterval) zamiast nadużywania tablic zależności w `useEffect`.
- **KeyboardAvoidingView (Android):** Poprawiono przykrywanie pól wprowadzania przez klawiaturę systemową w interfejsie dodawania nowego pomiaru poprzez wdrożenie zachowania `behavior="padding"` (lub opcjonalnie ScrollView) dla nowszych kompilacji.

### 4. Generowanie paczki binarnej (Cloud EAS Build) & Moduł STT
- W związku z poleganiem na czystym natywnym module dyktowania STT (Java: `@react-native-voice/voice`), niemożliwym stało się testowanie na Expo Go.
- Oskryptowano `useVoiceInput` dodając graceful fallback chroniący przed "Uncaught Promise Rejection" braku modułów i dodano wymuszenie zezwoleń `PermissionsAndroid.RECORD_AUDIO`.
- Przeprowadzono pierwszą produkcyjną kompilację systemu w chmurze `eas build -p android --profile development`. Stworzono fizyczny plik `.apk`, który zainstalowany na docelowym urządzeniu pozwala w pełni korzystać z dobrodziejstw mikrofonu i asystenta.

---
Zestaw paczek: Expo (~54.0.1), WebFlux (3.2.x).
