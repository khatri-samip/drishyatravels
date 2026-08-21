/**
 * Travel Tips Frontend Module
 * Handles loading and displaying travel tips from the API
 */

const API_BASE = '/DRISHYATRAVELS/backend/api';

/**
 * Fetch all published travel tips
 * @returns {Promise<Array>} Array of travel tips
 */
async function fetchTravelTips() {
  try {
    const response = await fetch(`${API_BASE}/travel-tips?status=published`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch travel tips');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('Could not load travel tips:', error);
    return [];
  }
}

/**
 * Fetch a single travel tip by slug
 * @param {string} slug - The travel tip slug
 * @returns {Promise<Object|null>} The travel tip data or null if not found
 */
async function fetchTravelTip(slug) {
  try {
    const response = await fetch(`${API_BASE}/travel-tips/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch travel tip');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.warn(`Could not load travel tip "${slug}":`, error);
    return null;
  }
}

/**
 * Render all travel tips into a grid container
 * @param {string} gridSelector - CSS selector for the grid container
 */
async function renderTravelTips(gridSelector = '.travel-grid') {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  // Show loading state
  grid.innerHTML = '<div class="loading-state">Loading travel tips...</div>';

  const tips = await fetchTravelTips();

  if (tips.length === 0) {
    grid.innerHTML = '<div class="empty-state">No travel tips available at the moment.</div>';
    return;
  }

  grid.innerHTML = tips
    .map(
      (tip) => `
      <article class="travel-card">
        <h2>${escapeHTML(tip.title)}</h2>
        ${tip.summary ? `<p>${escapeHTML(tip.summary)}</p>` : ''}
        <div class="tip-content">${tip.content}</div>
      </article>
    `
    )
    .join('');
}

/**
 * Initialize travel tips on page load
 * @param {string} gridSelector - CSS selector for the grid container
 */
function initTravelTips(gridSelector = '.travel-grid') {
  document.addEventListener('DOMContentLoaded', () => {
    renderTravelTips(gridSelector);
  });
}

// Export for use in other modules
window.TravelTips = {
  fetchTravelTips,
  fetchTravelTip,
  renderTravelTips,
  initTravelTips,
};