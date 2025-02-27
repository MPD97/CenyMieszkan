// Mapowanie angielskich nazw kolumn na polskie
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
    'lat': 'Szerokość',
    'lng': 'Długość',
    'floor': 'Piętro',
    'floors': 'Liczba pięter',
    'balcony': 'Balkon',
    'loggia': 'Loggia',
    'terrace': 'Taras',
    'garden': 'Ogród'
};

// Typy danych poszczególnych kolumn (do poprawnego filtrowania)
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
    'lat': 'number',
    'lng': 'number',
    'floor': 'number',
    'floors': 'number',
    'balcony': 'boolean',
    'loggia': 'boolean',
    'terrace': 'boolean',
    'garden': 'boolean'
};

// Przykładowe dane (później będą pobierane z bazy)
let allData = [
    {
        id: 1,
        developer: 'Developer A',
        investment: 'Osiedle Nowoczesne',
        number: 'A-101',
        area: 75.5,
        price: 850000,
        country: 'Polska',
        voivodeship: 'Mazowieckie',
        county: 'Warszawa',
        city: 'Warszawa',
        district: 'Mokotów',
        lat: 52.193418,
        lng: 21.051365,
        floor: 3,
        floors: 10,
        balcony: true,
        loggia: false,
        terrace: false,
        garden: false
    },
    {
        id: 2,
        developer: 'Developer B',
        investment: 'Miasto Park',
        number: 'B-205',
        area: 60.8,
        price: 720000,
        country: 'Polska',
        voivodeship: 'Małopolskie',
        county: 'Kraków',
        city: 'Kraków',
        district: 'Podgórze',
        lat: 50.032806,
        lng: 19.948099,
        floor: 2,
        floors: 8,
        balcony: true,
        loggia: true,
        terrace: false,
        garden: false
    },
    {
        id: 3,
        developer: 'Developer C',
        investment: 'Green Hills',
        number: 'C-310',
        area: 110.2,
        price: 1200000,
        country: 'Polska',
        voivodeship: 'Wielkopolskie',
        county: 'Poznań',
        city: 'Poznań',
        district: 'Jeżyce',
        lat: 52.412223,
        lng: 16.911041,
        floor: 1,
        floors: 4,
        balcony: false,
        loggia: false,
        terrace: true,
        garden: true
    },
    // Dodaj więcej przykładowych danych tutaj...
];

// Generujemy więcej danych testowych
for (let i = 4; i <= 30; i++) {
    const floorNum = Math.floor(Math.random() * 10) + 1;
    allData.push({
        id: i,
        developer: `Developer ${String.fromCharCode(65 + (i % 10))}`,
        investment: `Inwestycja ${i}`,
        number: `${String.fromCharCode(65 + (i % 10))}-${100 + i}`,
        area: Math.round((40 + Math.random() * 100) * 10) / 10,
        price: Math.floor(500000 + Math.random() * 1500000),
        country: 'Polska',
        voivodeship: ['Mazowieckie', 'Małopolskie', 'Wielkopolskie', 'Pomorskie', 'Śląskie'][i % 5],
        county: ['Warszawa', 'Kraków', 'Poznań', 'Gdańsk', 'Katowice'][i % 5],
        city: ['Warszawa', 'Kraków', 'Poznań', 'Gdańsk', 'Katowice'][i % 5],
        district: ['Mokotów', 'Śródmieście', 'Wilda', 'Oliwa', 'Ligota'][i % 5],
        lat: 50 + Math.random() * 4,
        lng: 16 + Math.random() * 6,
        floor: floorNum,
        floors: floorNum + Math.floor(Math.random() * 5),
        balcony: Math.random() > 0.5,
        loggia: Math.random() > 0.7,
        terrace: Math.random() > 0.8,
        garden: Math.random() > 0.9
    });
}

// Zmienne stanu
let currentPage = 1;
let recordsPerPage = 10;
let filteredData = [...allData];
let sortColumn = 'id';
let sortDirection = 'asc';
let activeFilters = [];

// Elementy DOM
const tableBody = document.getElementById('table-body');
const headersRow = document.getElementById('headers-row');
const filtersContainer = document.getElementById('filters-container');
const addFilterBtn = document.getElementById('add-filter-btn');
const clearFiltersBtn = document.getElementById('clear-filters-btn');
const recordsPerPageSelect = document.getElementById('records-per-page');
const showingInfo = document.getElementById('showing-info');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const paginationNumbers = document.getElementById('pagination-numbers');

// Inicjalizacja tabeli
function initTable() {
    // Generowanie nagłówków
    generateTableHeaders();
    
    // Obsługa przycisku dodawania filtra
    addFilterBtn.addEventListener('click', addFilter);
    
    // Obsługa przycisku czyszczenia filtrów
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Obsługa zmiany liczby rekordów na stronie
    recordsPerPageSelect.addEventListener('change', function() {
        recordsPerPage = parseInt(this.value);
        currentPage = 1;
        renderTable();
    });
    
    // Dodaj domyślny filtr
    addFilter();
    
    // Renderowanie tabeli
    renderTable();
}

// Generowanie nagłówków tabeli
function generateTableHeaders() {
    // Pobierz wszystkie dostępne kolumny z pierwszego rekordu
    const columns = Object.keys(allData[0]);
    
    // Generuj nagłówki
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = columnTranslations[column] || column;
        th.dataset.column = column;
        th.addEventListener('click', () => sortTable(column));
        headersRow.appendChild(th);
    });
}

// Sortowanie tabeli
function sortTable(column) {
    // Jeśli klikamy ten sam nagłówek, zmieniamy kierunek sortowania
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // Jeśli klikamy inny nagłówek, sortujemy rosnąco
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // Aktualizacja wyglądu nagłówków
    updateSortHeaders();
    
    // Ponowne renderowanie tabeli
    renderTable();
}

// Aktualizacja wyglądu nagłówków po sortowaniu
function updateSortHeaders() {
    // Usuń klasy sortowania ze wszystkich nagłówków
    document.querySelectorAll('#headers-row th').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    // Dodaj odpowiednią klasę do aktualnie sortowanej kolumny
    const activeHeader = document.querySelector(`#headers-row th[data-column="${sortColumn}"]`);
    if (activeHeader) {
        activeHeader.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
}

// Dodawanie nowego filtra
function addFilter() {
    const filterRow = document.createElement('div');
    filterRow.className = 'filter-row';
    
    // Selektor kolumny
    const columnSelect = document.createElement('select');
    columnSelect.className = 'column-select';
    
    // Dodaj opcje kolumn
    const columns = Object.keys(allData[0]);
    columns.forEach(column => {
        const option = document.createElement('option');
        option.value = column;
        option.textContent = columnTranslations[column] || column;
        columnSelect.appendChild(option);
    });
    
    // Selektor operacji
    const operationSelect = document.createElement('select');
    operationSelect.className = 'operation-select';
    
    // Pole wartości
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'value-input';
    valueInput.placeholder = 'Wartość';
    
    // Przycisk usuwania
    const removeBtn = document.createElement('button');
    removeBtn.className = 'control-btn remove-filter-btn';
    removeBtn.textContent = 'Usuń';
    removeBtn.addEventListener('click', () => {
        filtersContainer.removeChild(filterRow);
        applyFilters();
    });
    
    // Dodaj elementy do wiersza
    filterRow.appendChild(columnSelect);
    filterRow.appendChild(operationSelect);
    filterRow.appendChild(valueInput);
    filterRow.appendChild(removeBtn);
    
    // Dodaj wiersz do kontenera filtrów
    filtersContainer.appendChild(filterRow);
    
    // Aktualizuj operacje na podstawie wybranej kolumny
    updateOperations(columnSelect, operationSelect);
    
    // Obsługa zmiany kolumny
    columnSelect.addEventListener('change', () => {
        updateOperations(columnSelect, operationSelect);
        applyFilters();
    });
    
    // Obsługa zmiany operacji lub wartości
    operationSelect.addEventListener('change', applyFilters);
    valueInput.addEventListener('input', applyFilters);
}

// Aktualizacja operacji filtru na podstawie typu kolumny
function updateOperations(columnSelect, operationSelect) {
    const column = columnSelect.value;
    const type = columnTypes[column] || 'string';
    
    // Wyczyść operacje
    operationSelect.innerHTML = '';
    
    // Dodaj operacje odpowiednie dla typu danych
    if (type === 'string') {
        addOperation(operationSelect, 'contains', 'Zawiera');
        addOperation(operationSelect, 'starts', 'Zaczyna się od');
        addOperation(operationSelect, 'ends', 'Kończy się na');
        addOperation(operationSelect, 'equals', 'Równa się');
    } else if (type === 'number') {
        addOperation(operationSelect, 'equals', 'Równa się');
        addOperation(operationSelect, 'greater', 'Większe niż');
        addOperation(operationSelect, 'less', 'Mniejsze niż');
        addOperation(operationSelect, 'between', 'Pomiędzy');
    } else if (type === 'boolean') {
        addOperation(operationSelect, 'true', 'Tak');
        addOperation(operationSelect, 'false', 'Nie');
    }
}

// Dodanie opcji operacji
function addOperation(select, value, text) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
}

// Czyszczenie wszystkich filtrów
function clearFilters() {
    filtersContainer.innerHTML = '';
    activeFilters = [];
    filteredData = [...allData];
    currentPage = 1;
    renderTable();
}

// Zastosowanie wszystkich filtrów
function applyFilters() {
    // Pobierz filtry z interfejsu
    activeFilters = [];
    document.querySelectorAll('.filter-row').forEach(row => {
        const column = row.querySelector('.column-select').value;
        const operation = row.querySelector('.operation-select').value;
        const value = row.querySelector('.value-input').value;
        
        if (value || columnTypes[column] === 'boolean') {
            activeFilters.push({ column, operation, value });
        }
    });
    
    // Przefiltruj dane
    filteredData = allData.filter(item => {
        // Jeśli nie ma filtrów, zwróć wszystkie dane
        if (activeFilters.length === 0) return true;
        
        // Sprawdź czy element spełnia wszystkie filtry
        return activeFilters.every(filter => {
            const { column, operation, value } = filter;
            const itemValue = item[column];
            const type = columnTypes[column] || 'string';
            
            // Operacje dla typów string
            if (type === 'string') {
                const itemStr = String(itemValue).toLowerCase();
                const filterStr = String(value).toLowerCase();
                
                switch (operation) {
                    case 'contains': return itemStr.includes(filterStr);
                    case 'starts': return itemStr.startsWith(filterStr);
                    case 'ends': return itemStr.endsWith(filterStr);
                    case 'equals': return itemStr === filterStr;
                    default: return true;
                }
            }
            // Operacje dla typów number
            else if (type === 'number') {
                const itemNum = Number(itemValue);
                
                switch (operation) {
                    case 'equals': return itemNum === Number(value);
                    case 'greater': return itemNum > Number(value);
                    case 'less': return itemNum < Number(value);
                    case 'between': {
                        const [min, max] = value.split(',').map(v => Number(v.trim()));
                        return !isNaN(min) && !isNaN(max) ? itemNum >= min && itemNum <= max : true;
                    }
                    default: return true;
                }
            }
            // Operacje dla typów boolean
            else if (type === 'boolean') {
                switch (operation) {
                    case 'true': return itemValue === true;
                    case 'false': return itemValue === false;
                    default: return true;
                }
            }
            
            return true;
        });
    });
    
    // Resetuj paginację i renderuj ponownie tabelę
    currentPage = 1;
    renderTable();
}

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

// Inicjalizacja po załadowaniu dokumentu
document.addEventListener('DOMContentLoaded', initTable);
