# Lista Zadań (Aplikacja Ciśnienia Krwi - Certyfikacja Reaktywna)

## Faza 1: Inicjalizacja i Baza Danych
- `[x]` Inicjalizacja projektu Spring Boot (WebFlux, Kotlin)
- `[x]` Konfiguracja schematu PostgreSQL
- `[x]` Podpięcie połączenia R2DBC z PostgreSQL w Springu 
- `[x]` Stworzenie modeli Encji i interfejsów CoroutineCrudRepository (Pomiar, Użytkownik)

## Faza 2: Logika Biznesowa (Backend)
- `[ ]` Prosty Serwis Użytkownika / Autoryzacji (UUID konta / podstawowy login)
- `[ ]` Integracja Gemini API (Usługa mapująca mowę tekstową na model `{systolic, diastolic, pulse}`)
- `[ ]` Usługa Pomiarowa z wykrywaniem i walidacją Anomalii Medycznych (+ zliczanie średniej w klastrach bazodanowych u użytkownika)
- `[ ]` Generator raportów PDF oparty o `Dispatchers.IO` i ładny medyczny projekt tabelaryczny (OpenPDF / iText)

## Faza 3: Reaktywne Kontrolery (API)
- `[ ]` Endpoint rejestrowania oraz wyciągania wyników z bazy (CRUD: GET, POST)
- `[ ]` Endpoint parsowania tekstu w locie bez zapisu do bazy (`/api/parse`)
- `[ ]` Otwarcie strumieni do zrzutu i pobrania pliku `.pdf`

## Faza 4: Struktura Mobilna (Frontend React Native)
- `[ ]` Inicjalizacja aplikacji React Native (Expo dla szybszego wsparcia i testowania)
- `[ ]` Konfiguracja stanu aplikacji (Zustand/Context API) oraz `React Navigation`
- `[ ]` System bazowy stylów (dostępność: wysokie kontrasty, duże czytelne przyciski)

## Faza 5: Widoki i Moduł Głosowy (Frontend)
- `[ ]` Dashboard (Główny wielki przycisk Speech-to-Text oraz dzienne podsumowanie)
- `[ ]` Interfejs rozpoznawania mowy (natywna biblioteka) z nasłuchem do strzała `api/parse`
- `[ ]` Ekran Ręcznej Edycji / Zatwierdzania wraz ze wsparciem okienek "Alert Ostrzeżenie" po otrzymaniu jsona serwerowego
- `[ ]` Ekran Historii (komponenty wykresów danych medycznych z osią czasu)
- `[ ]` Moduł ustawień parametrów czasowych do ściągania i zapisywania pliku PDF w pamięci natywnej

## Faza 6: Testy Jednostkowe i Integracyjne (Akademickie)
- `[ ]` Testy Kotlin dla Coroutines + weryfikacje za pomocą `MockK`
- `[ ]` Testy Kotlin `WebFluxTest` sprawdzające reaktywną integrację
- `[ ]` Testy React Native Testing Library do weryfikacji drzewa domowego i modułu podsłuchu NLP

## Faza 7: Zebranie Pracy (Poddanie do Walkthrough)
- `[ ]` Weryfikacja działania środowiska E2E (Wysłanie wypowiedzi, poprawienie wykresu, zapis do pdf).
- `[ ]` Wygenerowanie dokumentu podsumowującego Walkthrough.
