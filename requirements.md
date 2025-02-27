# Wytyczne implementacyjne - Aplikacja do przeglądania danych mieszkaniowych

## Cel projektu
Stworzenie strony internetowej umożliwiającej przeglądanie i filtrowanie danych z bazy mieszkań na dwa sposoby:
* Widok tabelaryczny z zaawansowanymi filtrami i paginacją
* Widok mapy z punktami odpowiadającymi lokalizacjom mieszkań

## Technologie
* HTML
* CSS
* JavaScript (vanilla)
* SQLite (baza danych)

## Struktura plików
- `index.html`      // główna strona z loaderem
- `list.html`       // widok listy mieszkań
- `list.js`         // logika obsługi tabeli i filtrów
- `script.js`       // główna logika aplikacji
- `style.css`       // style aplikacji
- `mieszkanka.db`   // baza danych SQLite

## Wymagania funkcjonalne

### 1. Ekran ładowania
* Implementuj mechanizm blokujący interfejs do czasu pełnego załadowania danych
* Wyświetl komunikat "proszę czekać" podczas ładowania
* Wyświetl animacje obracającej się ikony mieszkania

### 2. Nagłówek
* Zawiera nazwę strony
* Dwa przyciski nawigacyjne: "lista" i "mapa"
* Przyciski przełączają między widokami bez przeładowania strony

### 3. Stopka
* Informacje o projekcie
* Odnośnik do portfolio twórcy

### 4. Widok listy mieszkań
* Tabela z danymi mieszkań
* Nagłówki kolumn przetłumaczone na język polski
* Funkcjonalności tabeli:
  * Filtrowanie każdej kolumny osobno
  * Obsługa wielu filtrów jednocześnie
  * Sortowanie po kliknięciu w nagłówek kolumny
  * Kontrola liczby wyświetlanych rekordów (10/25/50/100)
  * Paginacja

### 5. Widok mapy
* Interaktywna mapa z markerami mieszkań
* Wyświetlaj tylko rekordy z współrzędnymi geograficznymi (lat, lng)
* Każdy marker po kliknięciu pokazuje tooltip z informacjami o mieszkaniu

## Struktura bazy danych
Baza mieszkanka_mega.db zawiera tabelę z kolumnami:
* `id`
* `developer`
* `investment`
* `number`
* `area`
* `price`
* `country`
* `voivodeship`
* `county`
* `city`
* `district`
* `lat`
* `lng`
* `floor`
* `floors`
* `balcony`
* `loggia`
* `terrace`
* `garden`

## Uwagi implementacyjne
* Obsługa błędów przy ładowaniu danych
* Responsywny design
* Efektywne zapytania do bazy danych
* Płynne przełączanie między widokami
* Zapewnij walidację danych wejściowych w filtrach

## Priorytety
* Funkcjonalność ładowania i dostępu do danych
* Poprawne działanie filtrów i sortowania
* Implementacja mapy z markerami
* UI/UX i responsywność
