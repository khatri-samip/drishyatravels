/**
 * Shared frontend utilities.
 * Loaded before page-specific scripts in every HTML page.
 */

// TODO: [Medium/Code Quality] Duplicate escapeHTML implementation - also in public/js/utils.js and public/js/main.js
// Consider moving to a single shared location (e.g., public/js/utils.js) and loading from both admin and public
function escapeHTML(value) {
  // why: duplicate of public/js/utils.js — keep in sync; .card vs .featured-card in CSS are not interchangeable (different structure/styling)
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
