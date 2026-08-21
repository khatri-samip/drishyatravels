/**
 * Shared frontend utilities.
 * Loaded before page-specific scripts in every HTML page.
 */

// TODO: [Medium/Code Quality] Duplicate escapeHTML implementation - also in admin/js/utils.js and public/js/main.js
// Consider making this the single source of truth and removing from other locations
function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
