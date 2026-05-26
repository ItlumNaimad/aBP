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
