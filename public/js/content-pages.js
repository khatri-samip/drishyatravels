/**
 * Content Pages Frontend Module
 * Handles loading and displaying content pages from the API
 */

const API_BASE = '/DRISHYATRAVELS/backend/api';

/**
 * Fetch a content page by slug
 * @param {string} slug - The content page slug
 * @returns {Promise<Object|null>} The content page data or null if not found
 */
async function fetchContentPage(slug) {
  try {
    const response = await fetch(`${API_BASE}/content-pages/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch content page');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.warn(`Could not load content page "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch all published content pages
 * @returns {Promise<Array>} Array of content pages
 */
async function fetchAllContentPages() {
  try {
    const response = await fetch(`${API_BASE}/content-pages?status=published`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch content pages');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.warn('Could not load content pages:', error);
    return [];
  }
}

/**
 * Render content page HTML into a container
 * @param {Object} page - The content page data
 * @param {string} containerSelector - CSS selector for the container element
 */
function renderContentPage(page, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container || !page) return;

  container.innerHTML = page.content;

  // Update page title if meta_title exists
  if (page.meta_title) {
    document.title = `${page.meta_title} — Drishya Travels`;
  }

  // Update meta description if exists
  if (page.meta_description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = page.meta_description;
  }
}

/**
 * Initialize content page by slug
 * @param {string} slug - The content page slug
 * @param {string} containerSelector - CSS selector for the container element
 */
async function initContentPage(slug, containerSelector = '.content-page-container') {
  const page = await fetchContentPage(slug);
  if (page) {
    renderContentPage(page, containerSelector);
  } else {
    // Fallback to static content or show 404
    console.warn(`Content page "${slug}" not found in database`);
  }
}

// Export for use in other modules
window.ContentPages = {
  fetchContentPage,
  fetchAllContentPages,
  renderContentPage,
  initContentPage,
};