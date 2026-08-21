# Code Quality Assessment

Comprehensive analysis of the Drishya Travels codebase with actionable findings. All references verified against live code.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 4 |
| Medium | 5 |
| Low | 2 |
| **Total** | **13** |

---

## Findings

### 1. [Critical] No Authentication on Admin Panel or API
**File:** `admin/index.html` (entire), `admin/js/script.js` (all API calls)
**Category:** Security
**Description:** The admin panel has zero authentication — no login, no session management, no token validation. Anyone with the URL can create, read, update, delete packages. The PHP API endpoints also have no authentication middleware.
**Suggested Fix:** Implement JWT or session-based auth. Add middleware to verify tokens on all `/api/` routes. Add login page to admin panel.

---

### 2. [Critical] PostgreSQL Schema vs MySQL Runtime Mismatch
**File:** `docs/database/001_initial_schema.sql` (PostgreSQL) vs `backend/config/database.php` (MySQL)
**Category:** Architecture
**Description:** The canonical schema in `docs/database/001_initial_schema.sql` is written for PostgreSQL (Supabase target) but the PHP backend connects to MySQL/MariaDB via XAMPP. Key incompatibilities:
- `TEXT PRIMARY KEY` → MySQL needs `VARCHAR(100) PRIMARY KEY`
- `BIGINT GENERATED ALWAYS AS IDENTITY` → MySQL needs `BIGINT AUTO_INCREMENT`
- `TIMESTAMPTZ` → MySQL needs `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `ON CONFLICT DO UPDATE` → MySQL needs `ON DUPLICATE KEY UPDATE`
- `CHECK` constraints require MySQL 8.0.16+
**Suggested Fix:** Maintain a MySQL-specific schema file alongside PostgreSQL, or use a migration tool that handles dialect translation. Document the exact translation rules in DEVELOPMENT.md.

---

### 3. [High] Hardcoded API Paths in Frontend JavaScript (9 occurrences)
**Files:**
- `public/js/main.js:63` — `/DRISHYATRAVELS/backend/api/trip-planner/`
- `public/js/main.js:145` — `/DRISHYATRAVELS/backend/api/packages/?featured=1`
- `public/js/main.js:206` — `/DRISHYATRAVELS/backend/api/packages/`
- `public/js/packages.js:41` — `/DRISHYATRAVELS/backend/api/packages/`
- `public/js/package-details.js:31` — `/DRISHYATRAVELS/backend/api/packages/{id}`
- `admin/js/script.js:76` — `/DRISHYATRAVELS/backend/api/packages/`
- `admin/js/script.js:209` — `/DRISHYATRAVELS/backend/api/packages/` (POST/PUT)
- `admin/js/script.js:267` — `/DRISHYATRAVELS/backend/api/packages/{id}` (DELETE)
- `admin/js/script.js:291` — `/DRISHYATRAVELS/backend/api/packages/{id}` (GET for edit)
**Category:** Architecture/DevOps
**Description:** All frontend fetches use the literal project subdirectory `/DRISHYATRAVELS/`. This breaks when:
- Project folder is renamed
- Deployed to domain root (`https://example.com/`)
- Deployed to a different subdirectory on NestNepal (`/drishya-travels-backend/`)
**Suggested Fix:** Create a shared config module (`public/js/config.js`) that detects the base path at runtime from a `<script data-api-base>` tag or `window.location.pathname`. Update all 9 fetch calls to use `API_BASE`.

---

### 4. [High] Triple Duplication of `escapeHTML` Function
**Files:**
- `public/js/utils.js:8-15` (canonical, uses `replaceAll`)
- `admin/js/utils.js:8-15` (identical copy, uses `replaceAll`)
- `public/js/main.js:559-568` (duplicate, uses regex `/g`)
**Category:** Code Quality
**Description:** The exact same XSS-prevention function exists in three places. If a bug is found in one (like the historical entity corruption bug in GOTCHAS.md #1), it must be fixed in all three. The `main.js` version uses older regex syntax while the utils versions use modern `replaceAll`.
**Suggested Fix:** Remove `escapeHTML` from `main.js` and `admin/js/utils.js`. Load `public/js/utils.js` as a shared dependency in all HTML pages (already done for admin, needs adding to package pages).

---

### 5. [High] Data Duplication: Static JS Mirrors SQL Seed Data
**Files:** `public/data/packages.js` (4 packages) vs `docs/database/001_initial_schema.sql` (seed data for same 4 packages)
**Category:** Architecture
**Description:** The static fallback data in `public/data/packages.js` duplicates the 4 seed packages from the SQL schema (Everest Base Camp, Mardi Trek, Rani Mahal, Manang). Any update to package data requires changes in two places.
**Suggested Fix:** Remove `public/data/packages.js` and have the frontend always fetch from the API. If offline fallback is needed, generate the JS file from the database at build/deploy time, or use Service Worker caching.

---

### 6. [High] Empty Django `models.py` — Trip Planner Doesn't Persist Data
**File:** `backend/trip_planner/models.py` (empty, 0 bytes)
**Category:** Architecture
**Description:** The Django app has no models — the trip planner endpoint (`plan_trip`) only reads from a hardcoded Python dictionary and returns a route. No trip requests are stored, no user history, no analytics.
**Suggested Fix:** If trip planning history is needed, add a `TripRequest` model with fields for style, days, month, people, route, created_at. If not needed, document that the Django app is intentionally stateless and consider simplifying to a PHP endpoint.

---

### 7. [Medium] Inconsistent Response Patterns: PHP Helpers vs Django JsonResponse
**Files:** `backend/utils/response.php` (jsonResponse, jsonError, jsonValidationError, etc.) vs `backend/trip_planner/views.py` (uses `JsonResponse` directly)
**Category:** Code Quality
**Description:** The PHP API uses a comprehensive set of response helpers (`jsonResponse`, `jsonError`, `jsonNotFound`, `jsonValidationError`, `jsonServerError`, `jsonCreated`, `jsonNoContent`, `handleException`) with consistent structure (`{success: true, data: ...}` / `{success: false, error: ..., errors: ...}`). The Django endpoint returns raw `JsonResponse` with different structure.
**Suggested Fix:** Either create similar helpers for Django, or document the intentional difference. For consistency, the Django endpoint should match the PHP response format.

---

### 8. [Medium] Missing Error Handling in Admin `script.js`
**File:** `admin/js/script.js` (lines 72-105, 206-255, 261-283, 289-334)
**Category:** Code Quality
**Description:** Admin panel API calls have minimal error handling:
- `loadPackages()`: Shows generic "Unable to connect" message
- `savePackage()`: Only shows error message from response, no network error handling
- `deletePackage()`: Uses `alert()` for errors (blocking, not user-friendly)
- `editPackage()`: No user feedback on fetch failure
- No retry logic, no loading states during save/delete
**Suggested Fix:** Add consistent error handling: show loading spinners, use toast notifications instead of `alert()`, add retry buttons for network errors, surface validation errors from API response.

---

### 9. [Medium] Inconsistent Naming Conventions Across Layers
**Category:** Code Quality
**Description:**
| Layer | Convention | Example |
|-------|------------|---------|
| PHP (DB/Model) | snake_case | `hero_image_url`, `is_featured`, `short_description` |
| PHP (API Response) | snake_case | `{ "hero_image_url": "...", "is_featured": true }` |
| JavaScript | camelCase | `pkg.heroImageUrl`, `pkg.isFeatured` (manual mapping needed) |
| Python/Django | snake_case | `plan_trip`, `style`, `days` |
| CSS | kebab-case | `.featured-card`, `.card-img-bg` |
**Impact:** Frontend must manually map snake_case API responses to camelCase JS objects (see `package-details.js:55-60`).
**Suggested Fix:** Pick one convention for API responses. If keeping snake_case (standard for REST), add a utility to convert to camelCase in JS, or document the mapping pattern.

---

### 10. [Medium] No Tests Anywhere
**Category:** Testing
**Description:** Zero test files found:
- No PHPUnit tests for PHP API
- No pytest tests for Django
- No Jest/Vitest for JavaScript
- No Cypress/Playwright for E2E
- No API contract tests
**Suggested Fix:** Add at minimum:
- PHPUnit for `Package.php` model methods
- pytest for Django `plan_trip` view
- Vitest for `escapeHTML` and utility functions
- GitHub Actions workflow for CI

---

### 11. [Medium] Fragile CORS Configuration for Production
**File:** `backend/middleware/cors.php:11-26`
**Category:** Security/DevOps
**Description:** CORS allows all origins (`*`) by default via `CORS_ALLOW_ORIGIN=*`. In production, this must be restricted to the actual frontend domain. The current logic allows comma-separated origins but doesn't validate them strictly.
**Suggested Fix:** 
- Set `CORS_ALLOW_ORIGIN=https://yourdomain.com,https://www.yourdomain.com` in production `.env`
- Add validation that origin matches exactly (no subdomain wildcards unless intended)
- Document the required production value in DEPLOYMENT.md

---

### 12. [Low] Scratch File `public/js/main_new.js` Exists
**File:** `public/js/main_new.js`
**Category:** Maintenance
**Description:** A work-in-progress replacement for `main.js` with auto-carousel functionality (pagination dots, auto-scrolling, accessibility features). Not referenced anywhere, not in production.
**Suggested Fix:** Review and either merge into `main.js` or delete. Document decision in TODO.md.

---

### 13. [Low] Admin Panel Uses `alert()` for User Feedback
**File:** `admin/js/script.js:281`
**Category:** UX
**Description:** `deletePackage()` uses `alert("Failed to delete package. Please try again.")` which blocks the UI and looks unprofessional.
**Suggested Fix:** Replace with toast notification or inline error message in the package table row.

---

## Quick Wins (Fix This Week)

1. **Remove `escapeHTML` from `main.js`** — delete lines 559-568, ensure `public/js/utils.js` loads first
2. **Remove `escapeHTML` from `admin/js/utils.js`** — delete lines 8-15, rely on `public/js/utils.js`
3. **Delete `public/js/main_new.js`** — or merge and remove
4. **Replace `alert()` in `deletePackage()`** — use existing `message` element pattern from `savePackage()`

---

## Medium-term (Next Sprint)

5. Create `public/js/config.js` with runtime `API_BASE` detection
6. Update all 9 fetch calls to use `API_BASE`
7. Add MySQL-specific schema file (`backend/database/schema_mysql.sql`)
8. Add PHPUnit + pytest + Vitest boilerplate
9. Add authentication middleware skeleton (even if not fully implemented yet)

---

## Long-term (Before Production)

10. Full authentication system (JWT + login page)
11. Remove static `public/data/packages.js` — generate from DB or use SW cache
12. Add Django `TripRequest` model if history needed
13. Production CORS config documentation
14. CI/CD pipeline with tests