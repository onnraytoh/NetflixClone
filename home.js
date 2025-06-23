// Constants
const imgPath = "https://image.tmdb.org/t/p/original";
const apiPaths = {
    fetchAllCategories: 'http://localhost:3000/categories',
    fetchMoviesList: (id, type = 'movie') => `http://localhost:3000/movies?genreId=${id}&type=${type}`, 
    fetchTrending: (type) => `http://localhost:3000/trending?type=${type}`, 
};

// Initialize the app
function init() {
    handleCategoryChange('Home');
}

document.addEventListener('DOMContentLoaded', function () {
    // Get all the nav items
    const navItems = document.querySelectorAll('.nav-item');

    // Loop through each nav item and add click event listener
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Change the title based on the clicked category
            const category = item.getAttribute('data-category');
            let newTitle = '';

            switch (category) {
                case 'Home':
                    newTitle = 'Home - Netflix';
                    break;
                case 'TV Shows':
                    newTitle = 'TV Shows - Netflix';
                    break;
                case 'Movies':
                    newTitle = 'Movies - Netflix';
                    break;
                case 'Trending':
                    newTitle = 'New & Popular - Netflix';
                    break;
            }

            // Update the title of the page
            document.title = newTitle;

            // Optionally, add some styling to show the active item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
});




// Fetch and build trending movies or TV shows for the banner rotation
function fetchTrendingContent(type) {
    fetch(apiPaths.fetchTrending(type))
        .then(res => res.json())
        .then(list => {
            if (list.length > 0) {
                const randomIndex = Math.floor(Math.random() * list.length);
                buildBannerSection(list[randomIndex]);
            }
        })
        .catch(err => console.error(`Error fetching trending ${type}:`, err));
}

// Build the banner section with a movie or TV show
function buildBannerSection(content) {
    const bannerCont = document.getElementById('banner-section');
    bannerCont.innerHTML = '';
    bannerCont.style.backgroundImage = `url('${imgPath}${content.backdrop_path}')`;
    const div = document.createElement('div');
    div.className = "banner-content container";

    div.innerHTML = ` 
        <h2 class="banner__title">${content.name || content.title}</h2>
        <p class="banner__info">Trending in ${content.media_type === 'tv' ? 'TV shows' : 'movies'} | Released - ${content.release_date || content.first_air_date} </p>
        <p class="banner__overview">${content.overview && content.overview.length > 200 ? content.overview.slice(0, 200).trim() + '...': content.overview}</p>
        <div class="action-buttons-cont">
            <button class="action-button">Play</button>
            <button class="action-button">More Info</button>
        </div>
    `;

    const fadeOverlay = document.createElement('div');
    fadeOverlay.className = 'banner_fadeBottom';

    bannerCont.append(div);
    bannerCont.append(fadeOverlay);
}

// Fetch and build all sections (for both TV shows and movies)
function fetchAndBuildAllSections(category = "Home") {
    fetch(apiPaths.fetchAllCategories)
        .then(res => res.json())
        .then(res => {
            const categories = res.genres;
            const sectionContainer = document.getElementById('movies-cont');
            sectionContainer.innerHTML = '';

            if (Array.isArray(categories) && categories.length) {
                categories.forEach(categoryObj => {
                    if (category === "Home" || category === "TV Shows" || category === "Movies" || categoryObj.name === category) {
                        const type = category === "Movies" ? 'movie' : category === "TV Shows" ? 'tv' : 'movie';
                        fetchAndBuildMovieSection(apiPaths.fetchMoviesList(categoryObj.id, type), categoryObj.name, type);
                    }
                });
            }
        })
        .catch(err => console.error('Error fetching categories:', err));
}

// Fetch and build movie or TV show section based on category type (movie or tv)
function fetchAndBuildMovieSection(apiUrl, categoryName, type) {
    fetch(apiUrl)
        .then(res => res.json())
        .then(items => {
            if (Array.isArray(items) && items.length) {
                const sectionContainer = document.createElement('div');
                sectionContainer.classList.add('movie-section');
                sectionContainer.setAttribute('data-category', categoryName);

                const sectionHeading = document.createElement('h2');
                sectionHeading.classList.add('movie-section-heading');
                sectionHeading.textContent = categoryName;
                sectionContainer.appendChild(sectionHeading);

                const movieRowContainer = document.createElement('div');
                movieRowContainer.classList.add('movies-row-container');

                const movieRow = document.createElement('div');
                movieRow.classList.add('movies-row');

                const rightArrow = document.createElement('div');
                rightArrow.classList.add('right-arrow');
                rightArrow.innerHTML = '&#x276F;';
                rightArrow.addEventListener('click', () => {
                    movieRow.scrollBy({ left: 300, behavior: 'smooth' });
                });

                items.forEach(item => {
                    const movieItem = document.createElement('div');
                    movieItem.classList.add('movie-item');
                    movieItem.innerHTML = `
                        <img class="movie-item-img" src="${imgPath}${item.backdrop_path}" alt="${item.name || item.title}">
                        <p class="movie-title">${item.name || item.title}</p>
                    `;
                    movieItem.addEventListener('mouseenter', () => {
                        console.log(`Title: ${item.name || item.title}`);
                        console.log(`Overview: ${item.overview}`);
                        if (type === 'tv') {
                            console.log(`Number of Episodes: ${item.number_of_episodes || 'N/A'}`);
                        }
                    });

                    movieRow.appendChild(movieItem);
                });
                movieRowContainer.appendChild(movieRow);
                movieRowContainer.appendChild(rightArrow); 
                sectionContainer.appendChild(movieRowContainer);

                document.getElementById('movies-cont').appendChild(sectionContainer);
            }
        })
        .catch(err => console.error('Error building movie section:', err));
}




// Navigation click handling
document.addEventListener('DOMContentLoaded', () => {
    init();

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.getAttribute('data-category');
            handleCategoryChange(category);

            document.querySelector('.nav-item.active').classList.remove('active');
            item.classList.add('active');
        });
    });
});

// Handle category change (Home, TV Shows, Movies, etc.)
function handleCategoryChange(category) {
    const bannerSection = document.getElementById('banner-section');

    if (category === 'New & Popular') {
        bannerSection.style.display = 'none';
        document.getElementById('movies-cont').innerHTML = '<p class="empty-message">Content coming soon...</p>';
    } else {
        bannerSection.style.display = 'block';

        if (category === 'Home') {
            const randomType = Math.random() > 0.5 ? 'movie' : 'tv';
            fetchTrendingContent(randomType);
        } else if (category === 'Movies') {
            fetchTrendingContent('movie');
        } else if (category === 'TV Shows') {
            fetchTrendingContent('tv');
        }

        fetchAndBuildAllSections(category);
    }
}

// Automatically trigger Home category content fetch on page load
window.addEventListener('load', function () {
    init();
    window.addEventListener('scroll', function () {
        const header = document.getElementById('header');
        if (window.scrollY > 5) header.classList.add('black-bg');
        else header.classList.remove('black-bg');
    });
});

items.forEach(item => {
    const movieItem = document.createElement('div');
    movieItem.classList.add('movie-item');
    movieItem.innerHTML = `
        <img class="movie-item-img" src="${imgPath}${item.backdrop_path}" alt="${item.name || item.title}">
        <div class="movie-item-hover-content">
            <div class="movie-info">
                <p>${item.name || item.title}</p>
                <p>${item.release_date || item.first_air_date}</p>
            </div>
            <div class="hover-buttons">
                <button class="hover-button">Play</button>
                <button class="hover-button">Info</button>
            </div>
        </div>
    `;
    movieRow.appendChild(movieItem);
});

