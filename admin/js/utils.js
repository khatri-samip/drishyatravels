/**
 * Shared frontend utilities.
 * Loaded before page-specific scripts in every HTML page.
 */

// TODO: [Medium/Code Quality] Duplicate escapeHTML implementation - also in public/js/utils.js and public/js/main.js
// Consider moving to a single shared location (e.g., public/js/utils.js) and loading from both admin and public
function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
