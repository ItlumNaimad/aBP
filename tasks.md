# Lista Zadań (Aplikacja Ciśnienia Krwi - Certyfikacja Reaktywna)

## Faza 1: Inicjalizacja i Baza Danych
- `[x]` Inicjalizacja projektu Spring Boot (WebFlux, Kotlin)
- `[x]` Konfiguracja schematu PostgreSQL
- `[x]` Podpięcie połączenia R2DBC z PostgreSQL w Springu 
- `[x]` Stworzenie modeli Encji i interfejsów CoroutineCrudRepository (Pomiar, Użytkownik)

## Faza 2: Logika Biznesowa (Backend)
- `[x]` Prosty Serwis Użytkownika / Autoryzacji (UUID konta / podstawowy login)
- `[x]` Integracja Gemini API (Usługa mapująca mowę tekstową na model `{systolic, diastolic, pulse}`)
- `[x]` Usługa Pomiarowa z wykrywaniem i walidacją Anomalii Medycznych (+ zliczanie średniej w klastrach bazodanowych u użytkownika)
- `[x]` Generator raportów PDF oparty o `Dispatchers.IO` i ładny medyczny projekt tabelaryczny (OpenPDF / iText)

## Faza 3: Reaktywne Kontrolery (API)
- `[x]` Endpoint rejestrowania oraz wyciągania wyników z bazy (CRUD: GET, POST)
- `[x]` Endpoint parsowania tekstu w locie bez zapisu do bazy (`/api/parse`)
- `[x]` Otwarcie strumieni do zrzutu i pobrania pliku `.pdf`

## Faza 4: Struktura Mobilna (Frontend React Native)
- `[x]` Inicjalizacja aplikacji React Native (Expo dla szybszego wsparcia i testowania)
- `[x]` Konfiguracja stanu aplikacji (Zustand/Context API) oraz `React Navigation`
- `[x]` System bazowy stylów (dostępność: wysokie kontrasty, duże czytelne przyciski)

## Faza 5: Widoki i Moduł Głosowy (Frontend)
- `[x]` Dashboard (Główny wielki przycisk Speech-to-Text oraz dzienne podsumowanie)
- `[x]` Interfejs rozpoznawania mowy (natywna biblioteka) z nasłuchem do strzała `api/parse` — hook `useVoiceInput` gotowy, fallback na ręczny tekst (pełne STT wymaga Development Build)
- `[x]` Ekran Ręcznej Edycji / Zatwierdzania wraz ze wsparciem okienek "Alert Ostrzeżenie" po otrzymaniu jsona serwerowego
- `[x]` Ekran Historii (komponenty wykresów danych medycznych z osią czasu — `victory-native`)
- `[x]` Moduł ustawień parametrów czasowych do ściągania i zapisywania pliku PDF w pamięci natywnej (`expo-file-system` + `expo-sharing`)

## Faza 6: Testy Jednostkowe i Integracyjne (Akademickie)
- `[x]` Testy Kotlin dla Coroutines + weryfikacje za pomocą `MockK`
- `[x]` Testy Kotlin `WebFluxTest` sprawdzające reaktywną integrację
- `[x]` Testy React Native Testing Library do weryfikacji drzewa domowego i modułu podsłuchu NLP

## Faza 7: Zebranie Pracy (Poddanie do Walkthrough)
- `[x]` Weryfikacja działania środowiska E2E (Wysłanie wypowiedzi, poprawienie wykresu, zapis do pdf).
- `[x]` Wygenerowanie dokumentu podsumowującego Walkthrough.

## Faza 8: Rozszerzenia Natywne i Produkcyjne (Planowane)
- `[ ]` Opracowanie szczegółowej instrukcji i środowiska do przejścia na `Expo Development Build` (npx expo prebuild). Konfiguracja zmiennych systemowych (ANDROID_HOME), instalacja NDK i obsługa natywnych zależności kompilatora.
- `[ ]` Integracja biblioteki `@react-native-voice/voice` po poprawnym przygotowaniu środowiska (obsługa natywnych uprawnień do mikrofonu Android/iOS).
- `[ ]` Implementacja trybu offline-first na froncie (lokalne kolejkowanie pomiarów w AsyncStorage i synchronizacja z backendem w tle, wspierając lokalne podejście do bazy).
- `[ ]` Rozbudowa integracji AI (RAG) — przesyłanie historii pacjenta do modelu Gemini w celu generowania krótkich porad pro-zdrowotnych w oparciu o trendy.
- `[ ]` Opracowanie procedury produkcyjnego deploymentu: konfiguracja Docker Swarm / Compose dla backendu oraz kompilacja produkcyjnego `.apk` przez środowisko EAS Build.
- `[ ]` Szczegółowa analiza i raportowanie testów: Utworzenie dokumentu analitycznego opisującego metodykę testów (Frontend/Backend), powód wyboru poszczególnych scenariuszy, zestawienie wyników oraz wpływ reaktywności kodu na zaliczanie przypadków brzegowych.

## Faza 9: Bieżące Poprawki i Optymalizacje (UI/UX)
- `[x]` Rozwiązanie problemu nachodzenia przycisków systemowych Androida na dolne menu nawigacyjne (dopasowanie SafeArea / paddingów)
- `[x]` Dodanie przycisku z mikrofonem w formularzu asystenta AI ("Dodaj wynik"), uruchamiającego rozpoznawanie mowy (Speech-to-Text)
- `[x]` Rozwiązanie problemu zasłaniania formularza dodawania nowego pomiaru przez klawiaturę systemową (wdrożenie KeyboardAvoidingView)
- `[x]` Wyeliminowanie ostrzeżenia Reanimated: `Reading from value during component render` (przeniesienie odczytu wartości współdzielonej poza cykl renderowania Reacta)
- `[x]` Wprowadzenie jasnego logowania i ostrzeżeń na backendzie w przypadku braku klucza `GEMINI_API_KEY` (zabezpieczenie przed cichym przechodzeniem w tryb mock bez logów/komunikatów)


