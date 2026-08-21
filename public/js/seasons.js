/**
 * Seasons Frontend Module
 * Handles loading and displaying seasons (best time to visit) from the API
 */

const API_BASE = '/DRISHYATRAVELS/backend/api';

/**
 * Fetch all published seasons
 * @returns {Promise<Array>} Array of seasons
 */
async function fetchSeasons() {
  try {
    const response = await fetch(`${API_BASE}/seasons?status=published`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch seasons');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('Could not load seasons:', error);
    return [];
  }
}

/**
 * Fetch a single season by slug
 * @param {string} slug - The season slug
 * @returns {Promise<Object|null>} The season data or null if not found
 */
async function fetchSeason(slug) {
  try {
    const response = await fetch(`${API_BASE}/seasons/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch season');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.warn(`Could not load season "${slug}":`, error);
    return null;
  }
}

/**
 * Render all seasons into a grid container
 * @param {string} gridSelector - CSS selector for the grid container
 */
async function renderSeasons(gridSelector = '.season-grid') {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  // Show loading state
  grid.innerHTML = '<div class="loading-state">Loading seasonal information...</div>';

  const seasons = await fetchSeasons();

  if (seasons.length === 0) {
    grid.innerHTML = '<div class="empty-state">No seasonal information available at the moment.</div>';
    return;
  }

  grid.innerHTML = seasons
    .map(
      (season) => `
      <article class="season-card">
        <div class="season">${escapeHTML(season.name)} · ${escapeHTML(season.months)}</div>
        <h2>${escapeHTML(season.highlights ? season.highlights.split(',')[0].trim() : season.name)}</h2>
        <p>${escapeHTML(season.description)}</p>
      </article>
    `
    )
    .join('');
}

/**
 * Initialize seasons on page load
 * @param {string} gridSelector - CSS selector for the grid container
 */
function initSeasons(gridSelector = '.season-grid') {
  document.addEventListener('DOMContentLoaded', () => {
    renderSeasons(gridSelector);
  });
}

// Export for use in other modules
window.Seasons = {
  fetchSeasons,
  fetchSeason,
  renderSeasons,
  initSeasons,
};