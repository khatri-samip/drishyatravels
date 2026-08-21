# AGENTS.md — Project Map & Conventions for DRISHYATRAVELS

## Top-Level Folder/File Map

| Path | Purpose |
|------|---------|
| `/admin` | Admin panel (frontend only, **NO authentication**) |
| `/backend` | PHP backend API + Django backend |
| `/backend/api` | PHP REST API endpoints (packages CRUD, trip-planner, 7 relation endpoints) |
| `/backend/config` | Database config (PDO MySQL) |
| `/backend/database` | MySQL schema + seed data |
| `/backend/middleware` | CORS handling |
| `/backend/models` | `Package.php` (full CRUD + relations) |
| `/backend/trip_planner` | Django app (minimal: `plan_trip` view only) |
| `/backend/utils` | Response helpers, validation |
| `/public` | Static frontend (HTML/JS/CSS) |
| `/public/css` | Stylesheets |
| `/public/js` | JavaScript modules (`main.js`, `packages.js`, `package-details.js`, `utils.js`) |
| `/public/data` | Static package data (`packages.js` — duplicates SQL seed) |
| `/docs` | Documentation folder |

---

## Naming & Coding Conventions (ACTUALLY USED)

| Language | Convention |
|----------|------------|
| **PHP** | `snake_case` for functions/variables, `PascalCase` for classes |
| **JavaScript** | `camelCase` for variables/functions, `PascalCase` for constructors |
| **Database** | `snake_case` for tables/columns |
| **CSS** | `kebab-case` for classes |
| **API** | RESTful with JSON, `snake_case` in responses |
| **HTML** | Semantic markup, `data-*` attributes for JS hooks |

---

## Critical Notes

> **Admin panel has no authentication yet — do not assume it's protected.**

---

## Before Making Changes

**Read these first:**
- `/docs/ARCHITECTURE.md`
- `/docs/GOTCHAS.md`