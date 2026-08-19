# Architecture

Drishya Travels is a completely static, vanilla web application designed for a real travel agency. It is built strictly without modern JavaScript frameworks (no React, Next.js, or Vue) to ensure simplicity, zero-build-step deployment, and ease of maintenance.

## Project Structure

```
DRISHYATRAVELS/
├── admin/                 # Admin panel interface
│   ├── css/
│   │   └── style.css      # Admin panel styles
│   ├── js/
│   │   ├── script.js      # Admin panel logic
│   │   └── utils.js       # Shared utilities (escapeHTML)
│   └── index.html         # Admin dashboard
├── docs/                  # Project documentation
├── public/                # Public website (served as root)
│   ├── assets/            # Static assets (images, fonts)
│   ├── css/
│   │   ├── global.css     # CSS variables, reset, utilities
│   │   ├── home.css       # Homepage styles
│   │   ├── packages.css   # Package listing page styles
│   │   └── package-details.css  # Package detail page styles
│   ├── data/
│   │   └── packages.js    # Static package data (PACKAGES object + helpers)
│   ├── js/
│   │   ├── utils.js       # Shared utilities (escapeHTML)
│   │   ├── main.js        # Homepage logic (trip planner, experience cards)
│   │   ├── packages.js    # Package listing page logic
│   │   └── package-details.js  # Package detail page logic
│   ├── index.html         # Homepage
│   ├── packages.html      # Package listing page
│   └── package.html       # Package detail template
```

## Data Flow

```text
public/index.html
  ↓
Semantic page structure (Homepage, Packages, Package Detail)

public/css/global.css
  ↓
CSS variables, reset, shared utilities

public/js/utils.js
  ↓
Shared escapeHTML utility (XSS prevention)

public/data/packages.js
  ↓
Static PACKAGES object + getPackageById(), getAllPackages()

public/js/main.js
  ↓
Homepage: trip planner, package card rendering, mobile menu

public/js/packages.js
  ↓
Package listing page: render all package cards

public/js/package-details.js
  ↓
Package detail page: read ?id= param, render full package
```

## The Data Layer
The application simulates a backend API by reading from a globally available static object (`PACKAGES`) defined in `public/data/packages.js`.
- The homepage and package listing pages map over this object to dynamically render package cards.
- The package detail page (`public/package.html`) uses the `id` URL parameter to extract the corresponding package from this data file and populates the DOM accordingly.

## Limitations & Missing Backend
Initially, scripts attempted to communicate with a local API endpoint (`http://localhost:5000/api/packages`). Because this backend does not exist in the repository, the scripts have been refactored to consume the static `public/data/packages.js` file directly. 
- The Admin Panel (`admin/index.html`) displays the static data but intentionally lacks the ability to permanently save or delete data, as faking persistent CRUD operations on the client side without a server is an anti-pattern.

## Security Considerations
All dynamically injected content is sanitized via a shared `escapeHTML` utility function (`public/js/utils.js`, `admin/js/utils.js`) to prevent XSS attacks.

## Event Handling
All event handlers are attached via `addEventListener` in JavaScript files (no inline `onclick` handlers in HTML). The admin panel uses event delegation for dynamic table rows.
