# Architecture

Drishya Travels is a completely static, vanilla web application designed for a real travel agency. It is built strictly without modern JavaScript frameworks (no React, Next.js, or Vue) to ensure simplicity, zero-build-step deployment, and ease of maintenance.

## Data Flow

```text
HTML
  ↓
Semantic page structure (e.g., index.html, packages.html)

CSS
  ↓
Layout, styling, and responsive behavior (css/global.css, css/home.css, etc.)

JavaScript
  ↓
Interaction and Data Parsing (js/main.js, js/packages.js, data/packages.js)
```

## The Data Layer
The application simulates a backend API by reading from a globally available static object (`PACKAGES`) defined in `data/packages.js`.
- The homepage and package listing pages map over this object to dynamically render package cards.
- The package detail page (`package.html`) uses the `id` URL parameter to extract the corresponding package from this data file and populates the DOM accordingly.

## Limitations & Missing Backend
Initially, scripts attempted to communicate with a local API endpoint (`http://localhost:5000/api/packages`). Because this backend does not exist in the repository, the scripts have been refactored to consume the static `data/packages.js` file directly. 
- The Admin Panel (`admin/index.html`) displays the static data but intentionally lacks the ability to permanently save or delete data, as faking persistent CRUD operations on the client side without a server is an anti-pattern.

## Security Considerations
All dynamically injected content is sanitized via an internal `escapeHTML` utility function to prevent XSS attacks.
