import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './API.env' });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // For handling JSON requests

// API Key and base endpoint
const apiKey = process.env.API_KEY; 
const apiEndpoint = "https://api.themoviedb.org/3";

// Route for root URL ("/")
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Movie and TV Show API!',
        routes: [
            '/trending',
            '/categories',
            '/movies?genreId={id}&type=movie|tv',
            '/search?query={searchTerm}'
        ]
    });
});

// Route for trending movies and TV shows
app.get('/trending', async (req, res) => {
    const type = req.query.type || 'all';

    try {
        const endpoint = type === 'movie' 
            ? `/trending/movie/day?api_key=${apiKey}`
            : type === 'tv'
            ? `/trending/tv/day?api_key=${apiKey}`
            : `/trending/all/day?api_key=${apiKey}`;

        const response = await fetch(`${apiEndpoint}${endpoint}`);
        const data = await response.json();
        if (data.results) {
            res.status(200).json(data.results);
        } else {
            res.status(404).json({ message: 'No trending content found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch trending content', error: err });
    }
});

// Route for categories (updated for both movies and TV shows)
app.get('/categories', async (req, res) => {
    try {
        const [movieGenresResponse, tvGenresResponse] = await Promise.all([
            fetch(`${apiEndpoint}/genre/movie/list?api_key=${apiKey}`),
            fetch(`${apiEndpoint}/genre/tv/list?api_key=${apiKey}`)
        ]);

        const movieGenresData = await movieGenresResponse.json();
        const tvGenresData = await tvGenresResponse.json();

        if (movieGenresData.genres && tvGenresData.genres) {
            const allGenres = [
                ...movieGenresData.genres.map(genre => ({
                    id: genre.id,
                    name: genre.name,
                    type: 'movie'
                })),
                ...tvGenresData.genres.map(genre => ({
                    id: genre.id,
                    name: genre.name,
                    type: 'tv'
                }))
            ];

            res.status(200).json({
                genres: allGenres,
                message: 'List of genres with their corresponding genre IDs for both movies and TV shows'
            });
        } else {
            res.status(404).json({ message: 'No categories found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch categories', error: err });
    }
});

// Route for fetching movies and TV shows by genre ID
app.get('/movies', async (req, res) => {
    const genreId = req.query.genreId;
    const type = req.query.type || 'movie';
    if (!genreId) {
        return res.status(400).json({ message: 'Genre ID is required' });
    }

    try {
        const endpoint = type === 'tv'
            ? `/discover/tv?api_key=${apiKey}&with_genres=${genreId}`
            : `/discover/movie?api_key=${apiKey}&with_genres=${genreId}`;

        const response = await fetch(`${apiEndpoint}${endpoint}`);
        const data = await response.json();
        if (data.results) {
            res.status(200).json(data.results);
        } else {
            res.status(404).json({ message: `No ${type}s found for this genre` });
        }
    } catch (err) {
        res.status(500).json({ message: `Failed to fetch ${type}s for this genre`, error: err });
    }
});

// Route for searching movies or TV shows by query term
app.get('/search', async (req, res) => {
    const query = req.query.query;
    const type = req.query.type || 'movie';
    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        const endpoint = type === 'tv'
            ? `/search/tv?api_key=${apiKey}&query=${query}`
            : `/search/movie?api_key=${apiKey}&query=${query}`;

        const response = await fetch(`${apiEndpoint}${endpoint}`);
        const data = await response.json();
        if (data.results) {
            res.status(200).json(data.results);
        } else {
            res.status(404).json({ message: `No ${type}s found for this search` });
        }
    } catch (err) {
        res.status(500).json({ message: `Failed to search ${type}s`, error: err });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
