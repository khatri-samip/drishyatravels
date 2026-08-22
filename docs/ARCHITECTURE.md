# Architecture

Drishya Travels is a vanilla web application with a **PHP/MySQL backend** served via XAMPP (Apache + MariaDB). The frontend is static HTML/CSS/JS (no frameworks, no build step) that communicates with the PHP API endpoints. The backend was migrated from a Django/SQLite implementation to PHP/MySQL.

## Project Structure

```
DRISHYATRAVELS/
├── admin/                 # Admin panel interface
│   ├── css/
│   │   ├── style.css      # Admin panel styles
│   │   └── login.css      # Login page styles
│   ├── js/
│   │   ├── script.js      # Admin panel logic (package CRUD via API)
│   │   └── utils.js       # Shared utilities (escapeHTML)
│   ├── index.html         # Admin dashboard (requires auth - see gotchas)
│   └── login.html         # Static login placeholder (not wired to backend)
├── backend/               # PHP API (served via Apache)
│   ├── api/               # API endpoints
│   │   ├── index.php      # Health check / API info
│   │   ├── .htaccess      # Apache rewrite rules for clean URLs
│   │   ├── trip-planner/
│   │   │   └── index.php  # POST /api/trip-planner/ (migrated from Django)
│   │   └── packages/
│   │       ├── index.php      # GET/POST /api/packages
│   │       ├── [id].php       # GET/PUT/PATCH/DELETE /api/packages/{id}
│   │       ├── itinerary.php  # GET /api/packages/{id}/itinerary
│   │       ├── highlights.php # GET /api/packages/{id}/highlights
│   │       ├── inclusions.php # GET /api/packages/{id}/inclusions
│   │       ├── exclusions.php # GET /api/packages/{id}/exclusions
│   │       ├── gallery.php    # GET /api/packages/{id}/gallery
│   │       └── faqs.php       # GET /api/packages/{id}/faqs
│   ├── config/
│   │   └── database.php   # PDO connection & helpers
│   ├── database/
│   │   └── schema.sql     # MySQL/MariaDB schema + seed data (canonical)
│   ├── middleware/
│   │   └── cors.php       # CORS headers
│   ├── models/
│   │   └── Package.php    # Package model with full CRUD & relations
│   ├── utils/
│   │   ├── response.php   # JSON response helpers (jsonResponse, jsonError, etc.)
│   │   └── validation.php # Input validation helpers
│   ├── .env               # Environment configuration
│   ├── .htaccess          # Protects .env, blocks direct access
│   ├── manage.py          # Legacy Django file (not used)
│   ├── requirements.txt   # Legacy Django file (not used)
│   └── db.sqlite3         # Legacy Django file (not used)
├── docs/                  # Project documentation
├── public/                # Public website (served as root)
│   ├── assets/            # Static assets (images, fonts)
│   ├── css/
│   │   ├── global.css     # CSS variables, reset, utilities
│   │   ├── home.css       # Homepage styles
│   │   ├── packages.css   # Package listing page styles
│   │   └── package-details.css  # Package detail page styles
│   ├── data/
│   │   └── packages.js    # Legacy static fallback data (deprecated, kept for offline demo)
│   ├── js/
│   │   ├── utils.js       # Shared utilities (escapeHTML)
│   │   ├── main.js        # Homepage logic (fetches from PHP API)
│   │   ├── packages.js    # Package listing page logic (fetches from PHP API)
│   │   └── package-details.js  # Package detail page logic (fetches from PHP API)
│   ├── index.html         # Homepage
│   ├── packages.html      # Package listing page
│   └── package.html       # Package detail template
└── .gitignore
```

## Data Flow

```text
User Browser (public/*.html)
       ↓
public/js/*.js (fetch calls)
       ↓
Apache (mod_rewrite) → backend/api/*.php
       ↓
PHP Package Model (models/Package.php)
       ↓
PDO → MySQL/MariaDB (backend/database/schema.sql)
```

### Frontend → API Communication

| Page | JS File | API Calls |
|------|---------|-----------|
| Homepage | `main.js` | `GET /api/trip-planner/`, `GET /api/packages?featured=1`, `GET /api/packages` |
| Packages List | `packages.js` | `GET /api/packages` (with filters) |
| Package Detail | `package-details.js` | `GET /api/packages/{id}` |
| Admin Dashboard | `script.js` | `GET/POST/PUT/PATCH/DELETE /api/packages`, relation endpoints |

## The Data Layer

The application uses a **MySQL/MariaDB database** accessed via PHP PDO. The canonical schema is at `backend/database/schema.sql` and includes:

- `packages` — Core package data with `is_featured` boolean flag
- `itinerary_days` — Day-by-day itinerary (FK to packages)
- `package_highlights` — Marketing highlights
- `package_inclusions` — What's included
- `package_exclusions` — What's excluded
- `package_gallery` — Image URLs with captions
- `package_faqs` — FAQs

All child tables reference `packages.id` with `ON DELETE CASCADE`. Seed data for 4 packages (Everest Base Camp, Mardi Trek, Rani Mahal, Manang) is included in the schema file using `INSERT ... ON DUPLICATE KEY UPDATE` for idempotency.

The legacy static file `public/data/packages.js` still exists as an offline fallback but is **deprecated** — the frontend now fetches from the PHP API.

## Backend API (PHP)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Health check, API info |
| POST | `/api/trip-planner/` | Get travel route by style (Adventure/Culture/Wildlife/Relaxed) |
| GET | `/api/packages` | List packages (filters: status, category, difficulty, featured, limit, offset) |
| POST | `/api/packages` | Create new package with all relations |
| GET | `/api/packages/{id}` | Get package with all relations |
| PUT | `/api/packages/{id}` | Full update (replace) |
| PATCH | `/api/packages/{id}` | Partial update |
| DELETE | `/api/packages/{id}` | Delete package (cascades to relations) |
| GET | `/api/packages/{id}/itinerary` | Get itinerary days |
| GET | `/api/packages/{id}/highlights` | Get highlights |
| GET | `/api/packages/{id}/inclusions` | Get inclusions |
| GET | `/api/packages/{id}/exclusions` | Get exclusions |
| GET | `/api/packages/{id}/gallery` | Get gallery images |
| GET | `/api/packages/{id}/faqs` | Get FAQs |

### Response Format

All endpoints return a consistent envelope:

```json
// Success
{ "success": true, "data": {...} }

// List with pagination
{ "success": true, "data": [...], "meta": { "total": 4, "limit": 50, "offset": 0 } }

// Error
{ "success": false, "error": "Human-readable message", "errors": { "field": "specific error" } }
```

Validation errors return 422 with field-specific errors. Not found returns 404. Server errors return 500 (details only if `APP_DEBUG=true`).

## Security Considerations

- **XSS Prevention**: All dynamic DOM insertion uses shared `escapeHTML` utility (`public/js/utils.js`, `admin/js/utils.js`)
- **SQL Injection**: All database queries use PDO prepared statements
- **Input Validation**: All endpoints validate input via `backend/utils/validation.php`
- **CORS**: Configurable via `CORS_ALLOW_ORIGIN` in `.env` (wildcard `*` for dev only)
- **Environment Protection**: `.env` blocked via `.htaccess`
- **Error Details**: Only exposed when `APP_DEBUG=true`

### Known Gap: Admin Authentication

The admin panel currently has **no backend authentication**. The `admin/login.html` exists as a static placeholder with client-side password check only (see GOTCHAS.md). This is a documented security gap tracked in TODO.md.

## Event Handling

All event handlers are attached via `addEventListener` in JavaScript files (no inline `onclick` handlers in HTML). The admin panel uses event delegation for dynamic table rows.

## Deployment Architecture

- **Development**: XAMPP (Apache + MariaDB + PHP 8.x) on Windows
- **Production Target**: NestNepal shared hosting (Apache + PHP + MySQL/MariaDB) or VPS
- **Subdirectory Deployment**: PHP backend handles multiple base paths (`/DRISHYATRAVELS/backend/api/`, `/api/`, `/drishya-travels-backend/api/`)
- **Database**: MySQL/MariaDB schema at `backend/database/schema.sql` (not the PostgreSQL file in `docs/database/`)

## Migration History

Originally built with Django/SQLite (`backend/config/`, `backend/manage.py`, `backend/db.sqlite3`). Migrated to PHP/MySQL:
- Django `trip_planner` app → `backend/api/trip-planner/index.php`
- Django ORM → PDO + `Package` model
- Django REST Framework → Plain PHP JSON responses
- `corsheaders` → `middleware/cors.php`
- SQLite → MySQL/MariaDB
- PostgreSQL schema (`docs/database/001_initial_schema.sql`) → MySQL schema (`backend/database/schema.sql`)

Legacy Django files remain in `backend/` but are **not used** by the running application.