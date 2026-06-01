# aBP (Aplikacja Blood Pressure)
Projekt studencki: Aplikacja mobilna serwowana na architekturze reaktywnej (WebFlux/Kotlin), wspierająca rejestrację wyników ciśnienia krwi i tętna. Pozwala na zarządzanie pomiarami oraz generowanie raportów PDF dla wybranych dni z danego miesiąca. Aplikacja oparta na środowisku PostgreSQL i asystencie głosowym. Backend skonstruowano zgodnie z wymogiem paradygmatu w pełni reaktywnego bez operacji blokujących CPU.

---

## Spis Treści
1. [Procedura Uruchamiania i Różne Konfiguracje](#procedura-uruchamiania-i-różne-konfiguracje)
2. [Komendy Użyte w Projekcie i do uruchomienia (Dokumentacja)](#komendy-użyte-w-projekcie-i-do-uruchomieniadokumentacja)
3. [Konfiguracja i Uruchamianie (F.A.Q)](#konfiguracja-i-uruchamianie-faq)
4. [Jak wprowadzać modyfikacje w strukturze Bazy Danych?](#jak-wprowadzać-modyfikacje-w-strukturze-bazy-danych)
5. [Testowanie Aplikacji — Szczegółowa Dokumentacja](#testowanie-aplikacji--szczegółowa-dokumentacja)
6. [Użyte Mechanizmy Reaktywności (Kotlin Coroutines)](#użyte-mechanizmy-reaktywności-kotlin-coroutines-vs-java-reactor)
7. [Dzienniki Postępu Prac (Raporty)](#dzienniki-postępu-prac)

---
## Procedura Uruchamiania i Różne Konfiguracje

Aplikacja składa się z dwóch niezależnych modułów (Backend i Frontend), które muszą działać jednocześnie, by komunikacja API funkcjonowała poprawnie.

### 1. Uruchamianie Bazy Danych (Docker PostgreSQL)
Aplikacja wykorzystuje silnik PostgreSQL uruchamiany w izolowanym kontenerze. Zamiast instalować bazę bezpośrednio w systemie (co "brudzi" OS), korzystamy z pliku `docker-compose.yml`.
*   **Start/Zatrzymywanie bazy:** Użyj poleceń `docker compose` (patrz [Komendy Użyte w Projekcie](#komendy-użyte-w-projekcie-i-do-uruchomieniadokumentacja)). Baza nasłuchuje na `5432` z kontem `abpuser:abppassword`.
*   **Trwałość Danych:** Zdefiniowaliśmy wolumen `postgres_data`, co oznacza, że wyłączenie czy zresetowanie kontenera *nie usunie* Twoich pomiarów ani użytkowników! Dane przetrwają restart.

### 2. Uruchamianie Backendu (Spring Boot WebFlux)
Mając uruchomioną w tle bazę danych z dockera, odpal serwer API.
(patrz: [Komendy dla Backendu](#backend-kotlin--spring-boot))
*Serwer wystartuje na porcie `8080` (nasłuchując jako `http://localhost:8080`).*

### 3. Uruchamianie Frontendu (React Native / Expo)
Frontend uruchamiany jest przez narzędzie Metro Bundler i posiada kilka trybów roboczych:
(patrz: [Komendy dla Frontendu](#frontend-react-native--expo))
Po uruchomieniu serwera paczek zobaczysz interaktywne menu w konsoli (wciśnij na klawiaturze wybraną literę):
*   **`w` (Tryb Webowy)**: Otworzy aplikację w przeglądarce (`http://localhost:8081`). Idealne do szybkiego testowania i używania myszki bez emulatorów. Pamiętaj, że w przeglądarce zamiast interaktywnych natywnych wykresów załaduje się czytelna **Tabela Danych** (zaprojektowana jako niezawodny _Wariant B_ na Web).
*   **`a` (Tryb Android)**: Odpali aplikację na włączonym emulatorze Android Studio (wymaga wpierw odpalenia programu AVD i np. Pixela). Tu zadziałają pełne sprzętowe animacje wykresów z użyciem `victory-native` i Reanimated.
*   **Skanowanie QR (Fizyczny Telefon)**: Najlepsza i najpłynniejsza opcja. Jeśli masz w smartfonie zainstalowaną aplikację **Expo Go** (ze sklepu Android/iOS) i jesteś w tej samej sieci WiFi, zeskanuj aparatem kod QR z terminala. Aplikacja uruchomi się na żywo na Twoim telefonie z natywną wydajnością! *(Uwaga: W systemie WSL sieci potrafią się rozmijać. Wtedy najłatwiej wystartować komendą `npx expo start --tunnel`, aby skorzystać z bezpiecznego tunelu publicznego bez martwienia się o LAN i zaporę).*

---



## Galeria i Podgląd Aplikacji

Poniżej znajdują się miejsce na zrzuty ekranu reprezentujące poszczególne widoki aplikacji.

| Ekran Główny (Dashboard) | Oś Czasu (Historia) | Okno Pomiaru / AI | Raport i Eksport PDF |
|:---:|:---:|:---:|:---:|
| *(tu wstaw screenshot)* | *(tu wstaw screenshot)* | *(tu wstaw screenshot)* | *(tu wstaw screenshot)* |

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



## Testowanie Aplikacji

Projekt posiada niezależne zestawy testów dla Backendu (Kotlin/JUnit 5) i Frontendu (React Native/Jest). Nie wymagają one żywej bazy danych (środowiska są zmockowane). Uruchamia się je poprzez zintegrowany terminal w środowisku WSL.

**Szybka ściągawka:**
- **Backend:** `cd Backend && ./gradlew test` (Raport HTML: `build/reports/tests/test/index.html`)
- **Frontend:** `cd Frontend && npx jest --verbose` (Pokrycie: `coverage/lcov-report/index.html`)

👉 **[Szczegółowy Inwentarz Testów, Scenariusze i Metodyka (test_analysis.md)](file:///home/naimad/projekty/aBP/test_analysis.md)**

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



## Dzienniki Postępu Prac (Raporty)

Z uwagi na rozbudowaną formę raportowania z faz powstawania projektu, wszystkie szczegółowe wpisy i dzienniki deweloperskie zostały przeniesione do zewnętrznego pliku.

👉 **[Zobacz pełny dziennik zmian (CHANGELOG.md)](file:///home/naimad/projekty/aBP/CHANGELOG.md)**

---
Zestaw paczek: Expo (~54.0.1), WebFlux (3.2.x).
