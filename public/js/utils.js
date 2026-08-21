/**
 * Shared frontend utilities.
 * Loaded before page-specific scripts in every HTML page.
 */

// TODO: [Medium/Code Quality] Duplicate escapeHTML implementation - also in admin/js/utils.js and public/js/main.js
// Consider making this the single source of truth and removing from other locations
function escapeHTML(value) {
  // why: duplicate of admin/js/utils.js — keep in sync; .card vs .featured-card in CSS are not interchangeable (different structure/styling)
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
