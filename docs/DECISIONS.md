# Engineering Decisions

This document records the actual engineering decisions made for Drishya Travels. Previous versions incorrectly claimed the backend was "deferred" and a "future Node.js backend" was planned. The backend **exists and is implemented in PHP/MySQL**.

---

## 1. Migrated from Django/SQLite to PHP/MySQL

**Context:** The original backend was a minimal Django project (`backend/config/`, `backend/trip_planner/`) with:
- Only the trip planner endpoint implemented
- Empty models (`trip_planner/models.py` had no models)
- SQLite database (`db.sqlite3`) with no migrations
- Django Admin configured but unused by frontend

**Decision:** Complete migration to a PHP backend running on XAMPP (Apache + MySQL/MariaDB + PHP).

**Reasoning:**
- **Team familiarity**: The team works with PHP/XAMPP in their local environment
- **XAMPP-native**: No separate server processes needed; Apache + MySQL run together
- **Minimal Django surface area**: Only 1 endpoint existed, so rewrite cost was low
- **Zero framework overhead**: Plain PHP with PDO avoids framework abstraction for a simple CRUD API
- **Deployment simplicity**: XAMPP is a single install for the full stack

**What was migrated:**
- Trip planner endpoint (`POST /api/trip-planner/`) — exact behavior match
- Root API health check (`GET /api/`) — exact response match

**What was newly implemented (not in Django):**
- Complete package database schema (7 tables with FKs, indexes, constraints)
- Full package CRUD API (`/api/packages` + relation endpoints)
- Input validation, CORS middleware, environment config, standardized JSON responses

---

## 2. Chose PHP/MySQL over Node.js/Express

**Context:** The old DECISIONS.md claimed a "future Node.js backend" was planned.

**Decision:** PHP with MySQL/MariaDB via XAMPP.

**Reasoning:**
| Factor | PHP (Chosen) | Node.js/Express |
|--------|--------------|-----------------|
| Local environment | XAMPP (already installed) | Separate Node + DB install |
| Team skillset | Strong PHP | Limited Node.js |
| Deployment | Apache + PHP (standard) | PM2/Node process management |
| Database | MySQL/MariaDB (XAMPP default) | Would need separate DB setup |
| Learning curve | None | New runtime, async patterns |

The "Node.js backend" was never started and is not planned.

---

## 3. Strict Vanilla Frontend Constraint (Maintained)

**Context:** The project must remain robust, performant, and understandable without complex build steps.

**Decision:** No React, Vite, Tailwind CSS, or any frontend framework/build tooling.

**Reasoning:**
- Current vanilla architecture is clean: static HTML + ES6 modules + CSS
- Adding a framework introduces: build step, node_modules, transpilation, bundle complexity
- The site is content-driven (packages, trip planner) — no complex client-side state requiring a framework
- Vanilla JS with `addEventListener` and `fetch` is sufficient and maintainable

**Evidence:** `public/js/main.js`, `public/js/utils.js`, `admin/js/script.js` all use vanilla ES6 patterns.

---

## 4. Removed Inline Event Listeners

**Context:** `index.html` previously had inline handlers: `onclick="toggleMenu()"` and `onclick="planTrip()"`.

**Decision:** All event listeners attached via `addEventListener` in JavaScript files.

**Reasoning:**
- Separation of concerns: HTML for structure, JS for behavior
- Prevents global scope pollution (no `window.toggleMenu` needed)
- Enables CSP-compatible deployment (no `unsafe-inline` required)
- Single source of truth for event logic in `js/main.js`

**Implementation:** `public/js/main.js` wraps all logic in `DOMContentLoaded` and uses `element.addEventListener('click', handler)`.

---

## 5. Migrated Trip Planner from Django to PHP

**Context:** The trip planner was the only functional Django endpoint (`POST /api/trip-planner/`).

**Decision:** Reimplemented in PHP at `backend/api/trip-planner/index.php` with identical request/response contract.

**Reasoning:**
- Django was removed entirely; no mixed stack
- PHP implementation is ~50 lines vs Django's view + serializer + URL config
- Identical JSON API: frontend requires zero changes beyond URL update
- Stateless logic (no DB needed for trip planner) maps trivially to PHP

**API Contract (unchanged):**
```json
// Request
{ "style": "Adventure|Culture|Wildlife|Relaxed", "days": "7", "month": "October", "people": 2 }

// Response
{ "success": true, "data": { "route": "...", "style": "...", "days": "...", "month": "...", "people": 2 } }
```

---

## 6. MySQL Schema with `is_featured` Column (Not PostgreSQL)

**Context:** The `feat/database-and-refactor` branch designed a PostgreSQL schema for Supabase. The old DECISIONS.md referenced PostgreSQL.

**Decision:** MySQL/MariaDB schema with `utf8mb4` collation, including an `is_featured` boolean column on `packages`.

**Reasoning:**
- XAMPP ships MySQL/MariaDB — no external DB service needed
- Schema converted from PostgreSQL design with MySQL-specific adaptations:
  - `TEXT` → `TEXT`/`LONGTEXT`
  - `NUMERIC(12,2)` → `DECIMAL(12,2)`
  - `TIMESTAMPTZ` → `TIMESTAMP` with `ON UPDATE CURRENT_TIMESTAMP`
  - `BIGINT GENERATED AS IDENTITY` → `BIGINT AUTO_INCREMENT`
  - `ON CONFLICT` → `ON DUPLICATE KEY UPDATE`
  - Named `CHECK` constraints (MySQL 8.0.16+)
- `is_featured` column enables featured package queries without status filtering
- Seed data for 4 packages with all relations (itinerary, highlights, inclusions, exclusions, gallery, FAQs)

**Key schema features:**
- 7 tables: `packages`, `itinerary_days`, `package_highlights`, `package_inclusions`, `package_exclusions`, `package_gallery`, `package_faqs`
- All FKs: `ON DELETE CASCADE`
- Indexes on all filterable columns (`status`, `category`, `difficulty`, `currency`, `is_featured`)
- Constraints: price ≥ 0, difficulty enum, status enum, currency enum, day_number > 0

---

## 7. API Routing via Apache mod_rewrite

**Context:** No PHP router library (e.g., FastRoute, AltoRouter) was added.

**Decision:** Apache `mod_rewrite` in `backend/api/.htaccess` handles all routing.

**Reasoning:**
- Zero dependencies
- `RewriteRule ^(.*)$ index.php [QSA,L]` fronts all requests to `index.php`
- PHP parses `$_SERVER['REQUEST_URI']` and `$_SERVER['REQUEST_METHOD']` for dispatch
- Simple, performant, standard Apache pattern

---

## 8. Environment Configuration via `.env`

**Context:** No configuration library (e.g., vlucas/phpdotenv) was added.

**Decision:** Custom `.env` parser in `backend/config/database.php` loads `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `APP_DEBUG`, `CORS_ALLOW_ORIGIN`.

**Reasoning:**
- ~30 lines of PHP, no dependency
- Works with XAMPP defaults out of the box
- `.env` blocked via `.htaccess` for security
- `APP_DEBUG=true` gates error detail exposure

---

## Summary of Actual Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML/CSS/ES6 (no build step) |
| Backend | Plain PHP 8.0+ (no framework) |
| Database | MySQL/MariaDB via XAMPP |
| Server | Apache (XAMPP) with mod_rewrite |
| API | RESTful JSON over HTTP |
| Config | `.env` + PHP parser |

---

## Corrected History

| Date | Decision |
|------|----------|
| 2026-08-19 | Django → PHP/MySQL migration completed (branch `migration/django-to-php`) |
| 2026-08-21 | This document rewritten to reflect actual decisions |

**Previous versions of this file contained incorrect claims:**
- ❌ "Deferring the Backend implementation" — Backend exists
- ❌ "Future Node.js backend" — Not planned, PHP chosen
- ❌ PostgreSQL schema — MySQL implemented
- ❌ Django models existed — Django `models.py` was empty