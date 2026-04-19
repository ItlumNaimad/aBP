# Plan Implementacji Aplikacji do Rejestracji Ciśnienia Krwi i Tętna (Projekt Studencki)

Dokument ten opisuje planowaną architekturę, podział na moduły oraz strukturę widoków w odpowiedzi na wymagania projektu akademickiego. Cały proces tworzenia aplikacji będzie konsekwentnie zapisywany w plikach markdown stanowiących dokumentację postępu prac.

## Architektura Systemu

System będzie składał się z aplikacji mobilnej (React Native) po stronie klienta oraz w pełni reaktywnego serwera (Spring Boot, Kotlin, WebFlux) po stronie backendu, obsługującego zapis do relacyjnej bazy danych prz użyciu sterowników nieblokujących.

### 1. Frontend (Aplikacja Mobilna - React Native)

Aplikacja kliencka zostanie zbudowana w środowisku React Native ze specyficznym ukierunkowaniem na platformę **Android** (z potencjalną, łatwą migracją na iOS). Interfejs i rozpoznawanie mowy ustawione na **język polski**.

**Założenia techniczne Frontendu:**
- **Nawigacja:** Podstawowa struktura oparta na `React Navigation`.
- **Tryb działania:** Architektura uproszczona do działania z ciągłym dostępem do Internetu (Online-only). Jeśli nie ma sieci - wyświetlony zostanie przyjazny komunikat błędu.
- **Logowanie (Autoryzacja):** Mechanizm logowania zrealizowany w jak najprostszzej formie. Jeśli wymóg projektowy na to pozwala, będzie to podstawowe przypisanie (np. lokalnie trzymany token UUID przypisany do konta) lub najprostszy formularz logistyczny (użytkownik/hasło).
- **Rozpoznawanie mowy (Speech-to-Text):** Po naciśnięciu dużego mikrofonu na ekranie dashboardu, systemowy analizator mowy wyodrębnia język polski w **surowy tekst**. Frontend załącza ten tekst w requeście i oddelegowuje skomplikowaną część wyodrębniania medycznych liczb do Backendu.

**Planowane widoki (Ekrany):**
1. **Ekran Główny (Dashboard)**: Centralny i czytelny punkt dla Seniora, posiadający ogromny przycisk analizatora mowy i skrót dzisiejszych analiz / ostrzeżeń o anomaliach.
2. **Ekran Wprowadzania/Korekty**: Widok potwierdzający – jeśli sztuczna inteligencja odczyta i sparsuje dane, wyświetlają się one użytkownikowi do zatwierdzenia. Tu też działa ręczna edycja.
3. **Ekran Historii i Wykresów**: Dynamiczne wykresy z danymi o tętni i ciśnieniu (np. poprzez `react-native-chart-kit` lub lekką warstwę wykresów).
4. **Ekran Raportów (Eksportu PDF)**: Konfiguracja okresu (start - koniec) do ściągnięcia danych.

### 2. Backend (Serwer - Spring Boot + Kotlin + PostgreSQL)

Kluczowym elementem projektu jest rzetelne zastosowanie **paradygmatu programowania reaktywnego**, na który postawiono bardzo twardy nacisk by spełnić wymagania uczelniane.

**Architektura warstwowa:**
- **Framework serwerowy:** Spring Boot z modelem **WebFlux** serwowanym na non-blocking serwerze Netty.
- **Język i Asynchroniczność:** Kotlin wsparty głęboko o *Coroutines (Suspend functions)* oraz *Kotlin Flow* (zamiast Project Reactor/Mono/Flux), co znacząco poprawi czytelność kodu w stosunku do "czystej" Javy.
- **Dostęp do danych:** Implementacja bazy danych PostgreSQL po sterowniku **R2DBC** (Spring Data R2DBC), aby uniknąć jakichkolwiek blokujących wątków połączeniowych I/O do bazy.
- **Sztuczna Inteligencja (NLP z Gemini):** Otrzymany tekst ze słuchu, serwer wysyła ustrukturyzowanym zapytaniem Prompt do **API modelu edukacyjnego Gemini**. Gemini identyfikuje np. "Miałem przed chwilą pomiar, było 130 na 90, serce biło 60 uderzeń", rozumiejąc i mapując w bezpieczny JSON `{ systolic: 130, diastolic: 90, pulse: 60 }`. 
- **Moduł raportowania PDF:** Moduł odpowiedzialny za stworzenie dokumentu PDF. Ponieważ biblioteki procesujące dokumenty (np. *iText* czy *Apache PDFBox* obsługiwane w Kotlinie) cechują się mocnym obciążeniem i generują operacje blokujące, generacja raportu będzie hermetycznie zamykana w *Dispatcher Thread Pool* (w Kotlinie `Dispatchers.IO`), oddzielając tę czynność od głównych pętli Event Loopów aplikacji reaktywnej. Posiadać będzie dedykowany modernistyczny szablon pod kątem odczytu medycznego (czytelne rubryki, odpowiedni kontrast i typografia).

### 3. Verification Plan - Dokumentacja Testów (Jakość Kodu projektu studenckiego)

Aby potwierdzić poprawność działania aplikacji, projekt wdraża odpowiednią kulturę testowania dla każdej technologii:

1. **Testy jednostkowe Backendu (Kotlin)**: Wykorzystanie JUnit 5 wraz z biblioteką *MockK* do testowania logiki biznesowej i walidacji algorytmu analitycznego z zachowaniem funkcji zasobowych Coroutine (`runTest`).
2. **Testy Integracyjne Backendu (Spring WebFluxTest)**: Weryfikacja działania kontrolerów non-blocking przy użyciu `WebTestClient`.
3. **Testy Frontendowe (React Native)**: Testy poprawności renderowania interfejsów, logiki UI i testowania reducerów przy wykorzystaniu biblioteki *Jest* oraz *React Native Testing Library*. Mockowanie akcji wywołujących rozpoznawanie mowy oraz strumieniu.

---

> [!IMPORTANT]
> Plan jest zamknięty, architektonicznie przygotowany do wdrożenia. Gwarantuje pełną zgodność z narzuconym wymogiem reaktywności na backendzie (WebFlux/R2DBC/Coroutines) jak również pokrycie kodu skrupulatnymi testami obu technologii.
