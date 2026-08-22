# Project Status

## Current Status: PHP/MySQL Backend Complete & Functional

The repository has a **fully working PHP/MySQL backend** served via XAMPP (Apache + MariaDB). The frontend is vanilla HTML/CSS/JS that fetches from the PHP API. The project was migrated from a Django/SQLite implementation.

### Working Functionality

- **Homepage** (`public/index.html`): Fetches featured packages from `GET /api/packages?featured=1` and all packages from `GET /api/packages`. Trip planner calls `POST /api/trip-planner/`.
- **Package Details** (`public/package.html`): Extracts `id` from URL, fetches full package with all relations from `GET /api/packages/{id}`.
- **Packages Page** (`public/packages.html`): Grid lists packages with filters (status, category, difficulty) via `GET /api/packages`.
- **Admin Panel** (`admin/index.html`): Dashboard, package list, add/edit/delete forms all functional via API. **No backend authentication** (see Known Gaps).
- **Trip Planner** (`backend/api/trip-planner/index.php`): PHP port of original Django endpoint. Returns route based on style/days/month/people.
- **Database**: MySQL schema at `backend/database/schema.sql` with 4 seed packages, `is_featured` column, full relations (itinerary, highlights, inclusions, exclusions, gallery, FAQs).
- **Responsive Layout**: Mobile menu toggle works across all public pages. UI scales appropriately on mobile and tablet.

### Known Gaps (Intentionally Deferred)

- **Admin Authentication**: No backend auth — no login, no session management, no token validation. `admin/login.html` exists as static placeholder only (client-side check, not wired to backend). Tracked in TODO.md #1.
- **Hardcoded API Paths**: Frontend fetches use literal `/DRISHYATRAVELS/backend/api/` paths (9 occurrences). Breaks on rename/deploy. Tracked in CODE_QUALITY.md #3 and TODO.md #6-14.
- **Form Submissions**: Contact/booking buttons use `mailto:` links; no server-side form processing.
- **Testing**: Zero tests — no PHPUnit, no Vitest/Jest, no E2E tests.
- **Triple `escapeHTML` Duplication**: Exists in `public/js/utils.js`, `admin/js/utils.js`, `public/js/main.js`. Tracked in CODE_QUALITY.md #4.

### Technical Debt

- **CSS Variable Coverage**: Some hardcoded colors/spacing in `home.css`, `package-details.css`, `packages.css` could be centralized in `global.css`.
- **Admin utils.js**: Separate copy; could be a symlink to `public/js/utils.js` for single source of truth.
- **Legacy Django Files**: `backend/config/settings.py`, `backend/config/urls.py`, `backend/manage.py`, `backend/db.sqlite3`, `backend/requirements.txt` remain but are **not used**.
- **PostgreSQL Schema File**: `docs/database/001_initial_schema.sql` remains as historical artifact (Supabase target) but is not used by the PHP backend.
- **Static Fallback Data**: `public/data/packages.js` duplicates seed data; deprecated but kept for offline demo.

### Recently Completed (PHP Migration)

- Migrated Django/SQLite → PHP/MySQL (complete backend rewrite)
- Created `backend/models/Package.php` with full CRUD and relation handling
- Created `backend/database/schema.sql` (MySQL dialect) with 4 seed packages and `is_featured` column
- Ported Django trip planner to `backend/api/trip-planner/index.php`
- Implemented PDO database layer with prepared statements (`backend/config/database.php`)
- Built consistent JSON response helpers (`backend/utils/response.php`)
- Added input validation (`backend/utils/validation.php`)
- Added CORS middleware (`backend/middleware/cors.php`)
- Apache `.htaccess` routing for clean API URLs
- Environment configuration via `.env` (custom parser, no external deps)
- Updated frontend JS to fetch from PHP API endpoints (paths still hardcoded)
- Removed inline `onclick` handlers → `addEventListener` in JS files
- Consolidated `escapeHTML` to `public/js/utils.js` (two duplicates remain)
- Fixed experience card package IDs to match actual data keys
- Updated all script/CSS paths for `public/` + `admin/` structure