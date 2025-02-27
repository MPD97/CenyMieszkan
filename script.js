// Funkcja inicjalizująca aplikację
async function initApp() {
    try {
        // Dodaj awaryjny timeout dla loadera
        setupLoaderTimeout();
        
        // Symulacja ładowania danych
        await loadDatabaseData();
        
        // Po załadowaniu danych, ukryj ekran ładowania i pokaż interfejs
        hideLoader();
        showInterface();
        
        // Dodaj przejście dla głównego kontenera
        const contentContainer = document.getElementById('content-container');
        contentContainer.style.transition = 'opacity 0.2s ease';
        
        // Domyślnie pokaż widok listy i aktywuj odpowiedni przycisk
        showListView();
        
        // Dodaj obsługę przycisków nawigacyjnych
        setupNavigation();
        
        // Konfiguracja linków w stopce
        setupFooterLinks();
    } catch (error) {
        // Obsługa błędów przy ładowaniu
        console.error('Błąd podczas inicjalizacji aplikacji:', error);
        showError('Wystąpił błąd podczas ładowania danych: ' + error.message);
    }
}

// Ładowanie danych z bazy SQLite
async function loadDatabaseData() {
    console.log('Rozpoczęto ładowanie danych...');
    
    try {
        // Inicjalizacja SQL.js
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        // Pobranie pliku bazy danych
        const response = await fetch('mieszkanka_mega.db');
        const arrayBuffer = await response.arrayBuffer();
        const uInt8Array = new Uint8Array(arrayBuffer);
        
        // Utworzenie bazy danych w pamięci
        window.db = new SQL.Database(uInt8Array);
        
        console.log('Baza danych załadowana pomyślnie');
        return true;
    } catch (error) {
        console.error('Błąd ładowania bazy danych:', error);
        throw error;
    }
}

// Ukryj ekran ładowania - wzmocniona wersja
function hideLoader() {
    console.log('Ukrywanie loadera...');
    const loader = document.getElementById('loader-container');
    
    // Dodajemy bardziej bezpośrednie ukrywanie wraz z klasą
    loader.classList.add('hidden');
    loader.style.display = 'none';
    
    console.log('Loader powinien być ukryty');
}

// Dodajmy funkcję awaryjną, która ukryje loader po określonym czasie
function setupLoaderTimeout() {
    // Ukryj loader po maksymalnie 8 sekundach, nawet jeśli ładowanie się nie zakończy
    setTimeout(() => {
        console.log('Uruchomiono awaryjne ukrycie loadera');
        hideLoader();
        showInterface();
    }, 8000);
}

// Pokaż interfejs aplikacji
function showInterface() {
    document.getElementById('main-header').classList.remove('hidden');
    document.getElementById('content-container').classList.remove('hidden');
    document.getElementById('main-footer').classList.remove('hidden');
}

// Pokaż komunikat o błędzie
function showError(message) {
    const loaderContainer = document.getElementById('loader-container');
    const loader = document.querySelector('.loader');
    
    // Zmień zawartość loadera na komunikat o błędzie
    loader.innerHTML = `
        <div class="error-icon">❌</div>
        <p>Błąd</p>
        <p class="loading-info">${message}</p>
        <button id="retry-btn">Spróbuj ponownie</button>
    `;
    
    // Dodaj obsługę przycisku ponownej próby
    document.getElementById('retry-btn').addEventListener('click', () => {
        window.location.reload();
    });
}

// Pokaż widok listy
function showListView() {
    // Zmień aktywny przycisk
    setActiveButton('list-view-btn');
    
    const contentContainer = document.getElementById('content-container');
    
    // Dodaj efekt przejścia
    contentContainer.style.opacity = '0';
    
    setTimeout(() => {
        // Bezpośrednie tworzenie struktury HTML dla listy
        contentContainer.innerHTML = `
            <div id="list-container">
                <!-- Kontrolki filtrowania i wyświetlania -->
                <div class="controls-container">
                    <div class="filtering-controls">
                        <h3>Filtry</h3>
                        <div id="filters-container"></div>
                        <button id="add-filter-btn" class="control-btn">Dodaj filtr</button>
                        <button id="clear-filters-btn" class="control-btn">Wyczyść filtry</button>
                    </div>
                    
                    <div class="display-controls">
                        <label for="records-per-page">Wyświetl:</label>
                        <select id="records-per-page">
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        
                        <span id="showing-info">Wyświetlanie 0-0 z 0</span>
                    </div>
                </div>
                
                <!-- Tabela z danymi -->
                <div class="table-container">
                    <table id="properties-table">
                        <thead>
                            <tr id="headers-row">
                                <!-- Nagłówki będą generowane dynamicznie -->
                            </tr>
                        </thead>
                        <tbody id="table-body">
                            <!-- Dane będą generowane dynamicznie -->
                        </tbody>
                    </table>
                </div>
                
                <!-- Paginacja -->
                <div class="pagination-container">
                    <button id="prev-page-btn" class="pagination-btn" disabled>Poprzednia</button>
                    <div id="pagination-numbers"></div>
                    <button id="next-page-btn" class="pagination-btn" disabled>Następna</button>
                </div>
            </div>
        `;
        
        // Pokaż z animacją
        contentContainer.style.opacity = '1';
        
        // Zainicjuj tabelę po załadowaniu HTML
        initializeListView();
    }, 200);
}

// Inicjalizacja widoku listy
function initializeListView() {
    // Mapowanie angielskich nazw kolumn na polskie i określenie widoczności
    const columnTranslations = {
        'id': 'ID',
        'developer': 'Deweloper',
        'investment': 'Inwestycja',
        'number': 'Numer',
        'area': 'Powierzchnia (m²)',
        'price': 'Cena (zł)',
        'country': 'Kraj',
        'voivodeship': 'Województwo',
        'county': 'Powiat',
        'city': 'Miasto',
        'district': 'Dzielnica',
        'lat': 'Szerokość', // Ukryta
        'lng': 'Długość',   // Ukryta
        'floor': 'Piętro',
        'floors': 'Liczba pięter',
        'balcony': 'Balkon',
        'loggia': 'Loggia',
        'terrace': 'Taras',
        'garden': 'Ogród'
    };

    // Określenie kolumn do ukrycia
    const hiddenColumns = ['lat', 'lng'];

    // Typy danych poszczególnych kolumn (dla filtrowania)
    const columnTypes = {
        'id': 'number',
        'developer': 'string',
        'investment': 'string',
        'number': 'string',
        'area': 'number',
        'price': 'number',
        'country': 'string',
        'voivodeship': 'string',
        'county': 'string',
        'city': 'string',
        'district': 'string',
        'floor': 'number',
        'floors': 'number',
        'balcony': 'boolean',
        'loggia': 'boolean',
        'terrace': 'boolean',
        'garden': 'boolean'
    };
    
    // Zmienne stanu
    let currentPage = 1;
    let recordsPerPage = 10;
    let filteredData = [];
    let allData = [];
    let sortColumn = 'id';
    let sortDirection = 'asc';
    let filters = [];

    // Elementy DOM
    const tableHeadersRow = document.getElementById('headers-row');
    const tableBody = document.getElementById('table-body');
    const recordsPerPageSelect = document.getElementById('records-per-page');
    const showingInfo = document.getElementById('showing-info');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const paginationNumbers = document.getElementById('pagination-numbers');
    const addFilterBtn = document.getElementById('add-filter-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const filtersContainer = document.getElementById('filters-container');

    // Inicjalizacja tabeli
    async function initTable() {
        try {
            // Pobierz dane z bazy
            await loadDataFromDatabase();
            
            // Inicjalizacja nagłówków tabeli
            initTableHeaders();
            
            // Obsługa zmiany liczby rekordów na stronę
            recordsPerPageSelect.addEventListener('change', function() {
                recordsPerPage = parseInt(this.value);
                currentPage = 1;
                renderTable();
            });
            
            // Obsługa przycisków filtrowania
            addFilterBtn.addEventListener('click', addNewFilter);
            clearFiltersBtn.addEventListener('click', clearAllFilters);
            
            // Renderuj tabelę po inicjalizacji
            renderTable();
        } catch (error) {
            console.error('Błąd inicjalizacji tabeli:', error);
            tableBody.innerHTML = `<tr><td colspan="19" class="error-message">Błąd ładowania danych: ${error.message}</td></tr>`;
        }
    }
    
    // Pobierz dane z bazy danych
    async function loadDataFromDatabase() {
        try {
            // Sprawdź czy baza danych jest dostępna
            if (!window.db) {
                throw new Error('Baza danych nie jest dostępna');
            }
            
            // Wykonaj zapytanie do bazy
            const results = window.db.exec('SELECT * FROM mieszkania LIMIT 1000');
            
            if (results.length === 0 || !results[0].values) {
                throw new Error('Brak danych w tabeli mieszkania');
            }
            
            // Przekształć wyniki zapytania na tablicę obiektów
            const columns = results[0].columns;
            allData = results[0].values.map(row => {
                const rowData = {};
                columns.forEach((column, index) => {
                    // Konwersja typów danych
                    let value = row[index];
                    if (columnTypes[column] === 'number' && value !== null) {
                        value = Number(value);
                    } else if (columnTypes[column] === 'boolean' && value !== null) {
                        value = Boolean(value === 1 || value === true || value === 'true');
                    }
                    rowData[column] = value;
                });
                return rowData;
            });
            
            filteredData = [...allData];
            console.log(`Załadowano ${allData.length} rekordów z bazy`);
        } catch (error) {
            console.error('Błąd ładowania danych z bazy:', error);
            
            // W przypadku błędu, wczytaj przykładowe dane
            console.warn('Ładowanie przykładowych danych testowych...');
            // Tu kod z przykładowymi danymi (można zostawić tymczasowo na wypadek problemów z bazą)
            allData = generateSampleData();
            filteredData = [...allData];
        }
    }
    
    // Generowanie przykładowych danych (dla trybu awaryjnego)
    function generateSampleData() {
        // Kod generujący przykładowe dane (możesz skopiować z poprzedniej wersji)
        const sampleData = [/* ... wcześniejsze przykładowe dane ... */];
        return sampleData;
    }

    // Inicjalizacja nagłówków tabeli
    function initTableHeaders() {
        // Wyczyść istniejące nagłówki
        tableHeadersRow.innerHTML = '';
        
        // Dodaj nagłówki dla każdej kolumny
        if (allData.length > 0) {
            Object.keys(allData[0]).forEach(key => {
                // Pomijaj ukryte kolumny
                if (hiddenColumns.includes(key)) return;
                
                const th = document.createElement('th');
                th.textContent = columnTranslations[key] || key;
                th.dataset.column = key;
                
                // Dodaj obsługę sortowania
                th.addEventListener('click', () => {
                    if (sortColumn === key) {
                        // Zmiana kierunku sortowania jeśli kliknięto tę samą kolumnę
                        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        // Nowa kolumna sortowania
                        sortColumn = key;
                        sortDirection = 'asc';
                    }
                    
                    // Aktualizacja klas sortowania
                    updateSortIndicators(th);
                    
                    // Renderuj tabelę z nowym sortowaniem
                    renderTable();
                });
                
                tableHeadersRow.appendChild(th);
            });
        }
    }

    // ... (pozostałe funkcje jak wcześniej, z modyfikacją renderTable(), aby pomijała ukryte kolumny) ...
    
    // Renderowanie tabeli
    function renderTable() {
        // Sortowanie danych
        const sortedData = [...filteredData].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];
            
            // Obsługa różnych typów danych
            if (typeof aValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return sortDirection === 'asc' ? comparison : -comparison;
            } else {
                const comparison = (aValue < bValue) ? -1 : (aValue > bValue) ? 1 : 0;
                return sortDirection === 'asc' ? comparison : -comparison;
            }
        });
        
        // Paginacja
        const startIndex = (currentPage - 1) * recordsPerPage;
        const paginatedData = sortedData.slice(startIndex, startIndex + recordsPerPage);
        
        // Wyczyść tabelę
        tableBody.innerHTML = '';
        
        // Renderuj dane
        paginatedData.forEach(item => {
            const row = document.createElement('tr');
            
            // Dodaj komórki dla każdej kolumny
            Object.keys(item).forEach(key => {
                // Pomijaj ukryte kolumny
                if (hiddenColumns.includes(key)) return;
                
                const cell = document.createElement('td');
                
                // Formatowanie wartości na podstawie typu
                if (columnTypes[key] === 'boolean') {
                    cell.textContent = item[key] ? 'Tak' : 'Nie';
                } else {
                    cell.textContent = item[key];
                }
                
                row.appendChild(cell);
            });
            
            tableBody.appendChild(row);
        });
        
        // Aktualizuj informacje o wyświetlanych rekordach
        const firstShown = filteredData.length > 0 ? startIndex + 1 : 0;
        const lastShown = Math.min(startIndex + recordsPerPage, filteredData.length);
        showingInfo.textContent = `Wyświetlanie ${firstShown}-${lastShown} z ${filteredData.length}`;
        
        // Aktualizuj przyciski paginacji
        updatePagination();
    }

    // Aktualizacja paginacji
    function updatePagination() {
        const totalPages = Math.ceil(filteredData.length / recordsPerPage);
        
        // Aktualizuj przyciski Poprzednia/Następna
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
        
        // Obsługa przycisków
        prevPageBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        };
        
        nextPageBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        };
        
        // Wyczyść numerki stron
        paginationNumbers.innerHTML = '';
        
        // Generuj numerki stron
        // Wyświetlamy max 5 numerów stron, z aktualną stroną pośrodku
        const maxVisiblePages = 5;
        const halfVisible = Math.floor(maxVisiblePages / 2);
        
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Dostosuj przedział, aby pokazać dokładnie maxVisiblePages
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Dodaj "..." na początku jeśli zaczynamy od strony > 1
        if (startPage > 1) {
            addPageNumber(1, false);
            if (startPage > 2) {
                addEllipsis();
            }
        }
        
        // Dodaj numerki stron
        for (let i = startPage; i <= endPage; i++) {
            addPageNumber(i, i === currentPage);
        }
        
        // Dodaj "..." na końcu jeśli kończymy przed ostatnią stroną
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                addEllipsis();
            }
            addPageNumber(totalPages, false);
        }
    }

    // Dodawanie numeru strony
    function addPageNumber(page, isActive) {
        const pageElement = document.createElement('div');
        pageElement.textContent = page;
        pageElement.className = `page-number${isActive ? ' active' : ''}`;
        pageElement.onclick = () => {
            if (page !== currentPage) {
                currentPage = page;
                renderTable();
            }
        };
        paginationNumbers.appendChild(pageElement);
    }

    // Dodawanie wielokropka
    function addEllipsis() {
        const ellipsis = document.createElement('div');
        ellipsis.textContent = '...';
        ellipsis.className = 'page-ellipsis';
        paginationNumbers.appendChild(ellipsis);
    }

    // Inicjalizacja tabeli po załadowaniu
    initTable();
}

// Pokaż widok mapy
function showMapView() {
    // Zmień aktywny przycisk
    setActiveButton('map-view-btn');
    
    const contentContainer = document.getElementById('content-container');
    
    // Dodaj efekt przejścia
    contentContainer.style.opacity = '0';
    
    setTimeout(() => {
        contentContainer.innerHTML = '<div id="map-view">Ładowanie widoku mapy...</div>';
        
        // Tutaj będzie kod do załadowania faktycznego widoku mapy
        // Na razie tylko placeholder
        
        // Pokaż z animacją
        contentContainer.style.opacity = '1';
    }, 200);
}

// Konfiguracja przycisków nawigacyjnych
function setupNavigation() {
    document.getElementById('list-view-btn').addEventListener('click', showListView);
    document.getElementById('map-view-btn').addEventListener('click', showMapView);
}

// Funkcja do ustawiania aktywnego przycisku
function setActiveButton(buttonId) {
    // Usuń klasę active ze wszystkich przycisków
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Dodaj klasę active do wybranego przycisku
    document.getElementById(buttonId).classList.add('active');
}

// Konfiguracja linków w stopce
function setupFooterLinks() {
    // Przykładowa konfiguracja odnośnika do portfolio
    document.getElementById('portfolio-link').href = "https://example.com/portfolio";
    
    // Obsługa kliknięcia "O projekcie"
    document.getElementById('about-link').addEventListener('click', function(e) {
        e.preventDefault();
        showAboutModal();
    });
    
    // Obsługa kliknięcia "Kontakt"
    document.getElementById('contact-link').addEventListener('click', function(e) {
        e.preventDefault();
        showContactModal();
    });
}

// Pokaż modal z informacjami o projekcie
function showAboutModal() {
    // Tworzymy modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>O projekcie Baza Mieszkań</h2>
            <p>Aplikacja do przeglądania i analizy danych mieszkaniowych z bazy SQLite.</p>
            <p>Projekt umożliwia wygodne filtrowanie i sortowanie danych oraz wizualizację lokalizacji na mapie.</p>
        </div>
    `;
    
    // Dodajemy modal do body
    document.body.appendChild(modal);
    
    // Obsługa zamykania modala
    modal.querySelector('.close').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Zamykanie przy kliknięciu poza modalem
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Pokaż modal kontaktowy
function showContactModal() {
    // Tworzymy modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Kontakt</h2>
            <p>Email: kontakt@przykład.pl</p>
            <p>GitHub: github.com/przykład</p>
        </div>
    `;
    
    // Dodajemy modal do body
    document.body.appendChild(modal);
    
    // Obsługa zamykania modala
    modal.querySelector('.close').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Zamykanie przy kliknięciu poza modalem
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Uruchom aplikację po załadowaniu strony
document.addEventListener('DOMContentLoaded', initApp);
