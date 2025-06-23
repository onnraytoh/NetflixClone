document.addEventListener('DOMContentLoaded', function () {
    const searchIcon = document.querySelector('.search-icon');
    const searchBox = document.getElementById('search-input');
    const bannerSection = document.getElementById('banner-section');
    const resultsContainer = document.getElementById('search-results'); // To access search results container

    if (!searchIcon || !searchBox || !bannerSection || !resultsContainer) {
        console.error('Required elements not found in the DOM');
        return;
    }

    searchIcon.addEventListener('click', function () {
        searchBox.classList.toggle('active');
        
        if (searchBox.classList.contains('active')) {
            searchIcon.style.transform = 'scale(1.2)';
        } else {
            searchIcon.style.transform = 'scale(1)';
        }
    });

    searchBox.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const searchTerm = searchBox.value.trim();

            if (searchTerm !== '') {
                console.log('Fetching results for:', searchTerm);
                fetchSearchResults(searchTerm);
                bannerSection.classList.add('hide');
            } else {
                // If the search term is empty, remove the search results section
                resultsContainer.innerHTML = '';
                bannerSection.classList.remove('hide');
            }
        }
    });

    function fetchSearchResults(query) {
        fetch(`http://localhost:3000/search?query=${query}`)
            .then(res => res.json())
            .then(results => {
                resultsContainer.innerHTML = ''; // Clear previous results
                if (results && results.length > 0) {
                    buildSearchResultsSection(results, query);
                } else {
                    resultsContainer.innerHTML = '<p>No results found</p>';
                }
            })
            .catch(err => {
                console.error('Error fetching search results:', err);
            });
    }

    // Build the section with search results
    function buildSearchResultsSection(results, query) {
        const sectionContainer = document.createElement('div');
        sectionContainer.classList.add('movie-section');
        sectionContainer.setAttribute('data-category', query);

        const sectionHeading = document.createElement('h2');
        sectionHeading.classList.add('movie-section-heading');
        sectionHeading.textContent = `Search results for "${query}"`;
        sectionContainer.appendChild(sectionHeading);

        const totalResults = results.length;
        const rows = Math.ceil(totalResults / 6); 
        const columns = Math.ceil(totalResults / (6 * rows));

        const gridContainer = document.createElement('div');
        gridContainer.classList.add('movies-grid-container');

        let currentIndex = 0;
        for (let row = 0; row < rows; row++) {
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('movies-row');
            
            for (let col = 0; col < 6 && currentIndex < totalResults; col++) {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                movieItem.innerHTML = `
                    <img class="movie-item-img" src="https://image.tmdb.org/t/p/w500${results[currentIndex].backdrop_path}" alt="${results[currentIndex].name || results[currentIndex].title}">
                    <div class="movie-item-hover-content">
                        <div class="movie-info">
                            <p>${results[currentIndex].name || results[currentIndex].title}</p>
                            <p>${results[currentIndex].release_date || results[currentIndex].first_air_date}</p>
                        </div>
                        <div class="hover-buttons">
                            <button class="hover-button">Play</button>
                            <button class="hover-button">Info</button>
                        </div>
                    </div>
                    <div class="movie-item-title">${results[currentIndex].name || results[currentIndex].title}</div>
                `;
                rowContainer.appendChild(movieItem);
                currentIndex++;
            }

            gridContainer.appendChild(rowContainer);
        }

        sectionContainer.appendChild(gridContainer);
        resultsContainer.appendChild(sectionContainer);
    }
});
