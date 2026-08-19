const API_KEY = '3c9e8caa418c70d648f20eec57b9a92b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesWrapper = document.querySelector(".cards");
const resultsTitle = document.querySelector(".results__search");
const modal = document.getElementById("movie-modal");
const modalBody = document.getElementById("modal-body");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let currentMovies = [];
let displayLimit = 6;
let currentQuery = ''

function formatRuntime(minutes) {
  if (!minutes) return 'N/A';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}hr/s ${remainingMinutes}min`;
  }

  return `${minutes}min`;
}

function onLimitChange(event) {
	displayLimit = Number(event.target.value)

	// If current cached movies are fewer than the selected limit, re-fetch the data
	if (currentMovies.length < displayLimit) {
		if (currentQuery) {
			renderMovies(searchMovies(currentQuery))
		} else {
			renderMovies(getTopMovies())
		}
		return
	}

	const filterSelect = document.getElementById('filter')
	const activeFilter = filterSelect ? filterSelect.value : ''
	const finalMovies = activeFilter ? sortMovies(currentMovies, activeFilter) : currentMovies

	renderMovieCards(finalMovies)
}

// 1. Fetch Top Rated Movies with Multi-Page Support
async function getTopMovies() {
	const totalPages = Math.ceil(displayLimit / 20)
	const requests = []

	for (let page = 1; page <= totalPages; page++) {
		requests.push(
			fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`)
				.then((res) => res.json())
				.then((data) => data.results || [])
		)
	}

	const pagesData = await Promise.all(requests)
	return pagesData.flat()
}

// 2. Fetch Movies by Search Query with Multi-Page Support
async function searchMovies(query) {
	const totalPages = Math.ceil(displayLimit / 20)
	const requests = []

	for (let page = 1; page <= totalPages; page++) {
		requests.push(
			fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`)
				.then((res) => res.json())
				.then((data) => data.results || [])
		)
	}

	const pagesData = await Promise.all(requests)
	return pagesData.flat()
}

// 3. Fetch Single Movie Details for Modal
async function openMovieDetails(movieId) {
  if (!modal || !modalBody) return;

  document.body.classList.add("no-scroll")

  modal.classList.add("modal--open");
  modalBody.innerHTML = `<div class="movies__loading"><i class="fa-solid fa-spinner fa-spin"></i></div>`;

  try {
    const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    const movie = await res.json();

    await wait(1000);

    const poster = movie.poster_path 
      ? `${IMAGE_BASE_URL}${movie.poster_path}` 
      : 'assets/images/test-poster.jpg';
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const runtime = formatRuntime(movie.runtime);
    const genres = movie.genres && movie.genres.length > 0 ? movie.genres.map(g => g.name).join(', ') : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    modalBody.innerHTML = `
      <div class="modal__details">
        <img src="${poster}" alt="${movie.title}" class="modal__poster">
        <div class="modal__info">
          <h2 class="modal__title">${movie.title}</h2>
          ${movie.tagline ? `<p class="modal__tagline"><em>"${movie.tagline}"</em></p>` : ''}
          <div class="modal__meta">
            <span><i class="fa-solid fa-star" style="color: gold;"></i> ${rating}/10</span>
            <span><i class="fa-solid fa-calendar"></i> ${year}</span>
            <span><i class="fa-solid fa-clock"></i> ${runtime}</span>
          </div>
          <p class="modal__genres"><strong>Genres:</strong> ${genres}</p>
          <div class="modal__overview-container">
            <h3>Overview</h3>
            <p class="modal__overview">${movie.overview || "No description available for this movie."}</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    await wait(1000);
    modalBody.innerHTML = `<p>Failed to load movie details.</p>`;
    console.error(error);
  }
}

function closeModal() {
  if (modal) {
    modal.classList.remove("modal--open");
  }

  document.body.classList.remove("no-scroll")
}

// 4. Helper function to sort movies
function sortMovies(movies, filter) {
  const sorted = [...movies];

  switch (filter) {
    case 'RATING_DESC':
      return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    case 'RATING_ASC':
      return sorted.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
    case 'YEAR_DESC':
      return sorted.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
    case 'YEAR_ASC':
      return sorted.sort((a, b) => new Date(a.release_date || 0) - new Date(b.release_date || 0));
    case 'TITLE_ASC':
      return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'TITLE_DESC':
      return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    default:
      return sorted;
  }
}

function onFilterChange(event) {
  const filter = event.target.value;
  const sortedMovies = sortMovies(currentMovies, filter);
  renderMovieCards(sortedMovies);
}

// 5. Render Movies with Loading State
async function renderMovies(movieDataPromise) {
  moviesWrapper.innerHTML = `<i class="fa-solid fa-spinner movies__loading--spinner"></i>`;
  moviesWrapper.classList.add('movies__loading');

  try {
    const movies = await movieDataPromise;
    await wait(1000);

    moviesWrapper.classList.remove('movies__loading');

    if (!movies || movies.length === 0) {
      moviesWrapper.innerHTML = `<h3 class="no-movies">No movies found.</h3>`;
      currentMovies = [];
      return;
    }

    currentMovies = movies;
    const filterSelect = document.getElementById('filter');
    const activeFilter = filterSelect ? filterSelect.value : '';

    const finalMovies = activeFilter ? sortMovies(currentMovies, activeFilter) : currentMovies;
    renderMovieCards(finalMovies);
  } catch (error) {
    await wait(1000);
    moviesWrapper.classList.remove('movies__loading');
    moviesWrapper.innerHTML = `<h3 class="no-movies">Failed to load movies. Please try again.</h3>`;
    console.error(error);
  }
}

function renderMovieCards(movies) {
  const moviesHtml = movies.slice(0, displayLimit).map((movie) => {
    const poster = movie.poster_path 
      ? `${IMAGE_BASE_URL}${movie.poster_path}` 
      : 'assets/images/test-poster.jpg';
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    return `<div class="card">
      <img src="${poster}" alt="${movie.title}" class="card__image image__click" onclick="openMovieDetails(${movie.id})">
      <h2 class="card__title">${movie.title}</h2>
      <div class="card__rating--card">
        <i class="fa-solid fa-star" style="color: gold;"></i>
        <h3 class="card__rating--text">Rating: ${rating} / 10</h3>
      </div>
      <div class="card__released--card">
        <i class="fa-solid fa-calendar"></i>
        <h3 class="card__released--text">Released: ${year}</h3>
      </div>
    </div>`;
  }).join("");

  moviesWrapper.innerHTML = moviesHtml;
}

// 6. Handle Search Input
function onSearchChange(event) {
  const query = event.target.value.trim();
  currentQuery = query

  if (!query) {
    if (resultsTitle) {
      resultsTitle.textContent = '"Top Rated"';
    }
    renderMovies(getTopMovies());
    return;
  }

  if (resultsTitle) {
    resultsTitle.textContent = `"${query}"`;
  }
  renderMovies(searchMovies(query));
}

// 7. Initial Load
document.addEventListener('DOMContentLoaded', () => {
  if (resultsTitle) {
    resultsTitle.textContent = '"Top Rated"';
  }

  // Sync displayLimit with the dropdown value preserved by the browser
  const limitSelect = document.getElementById('limit')
  if (limitSelect) {
	displayLimit = Number(limitSelect.value) || 6
  }

  // Check URL query parameters for a search term
  const urlParams = new URLSearchParams(window.location.search)
  const searchTerm = urlParams.get('search')

  if (searchTerm) {
	currentQuery = searchTerm
	const searchInput = document.querySelector('.header__search--input')
	if (searchInput) {
		searchInput.value = searchTerm
	}
	if (resultsTitle) {
		resultsTitle.textContent = `"${searchTerm}"`
	}
	renderMovies(searchMovies(searchTerm))
  } else {
	if (resultsTitle) {
		resultsTitle.textContent = '"Top Rated"'
	}
	renderMovies(getTopMovies());
  }
});