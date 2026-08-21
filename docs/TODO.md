# DRISHYATRAVELS - TODO

## Issues to Address

### Critical / Security

| # | Priority | Category | File:Line | Description | Suggested Fix |
|---|----------|----------|-----------|-------------|---------------|
| 1 | Critical | Security | `admin/index.html:10` | No authentication - admin panel accessible without login | Implement authentication (session/JWT) before production |
| 2 | Critical | Security | `backend/config/settings.py:24` | Hardcoded weak secret key | Move SECRET_KEY to environment variable |
| 3 | Critical | Security | `backend/config/settings.py:28` | DEBUG=True in production is dangerous | Set DEBUG via environment variable, default to False |
| 4 | Critical | Security | `backend/config/settings.py:31` | ALLOWED_HOSTS empty - must be configured for production | Set ALLOWED_HOSTS via environment variable |
| 5 | High | Security/DevOps | `backend/middleware/cors.php:9` | Fragile CORS config - wildcard origin with credentials is invalid per spec | Separate dev/prod configs, require explicit origin list in production |

### High / Architecture

| # | Priority | Category | File:Line | Description | Suggested Fix |
|---|----------|----------|-----------|-------------|---------------|
| 6 | High | Architecture | `admin/js/script.js:76` | Hardcoded API path `/DRISHYATRAVELS/backend/api/packages/` | Use configurable API_BASE constant from shared config module |
| 7 | High | Architecture | `admin/js/script.js:211` | Hardcoded API path in savePackage() | Use configurable API_BASE constant from shared config module |
| 8 | High | Architecture | `admin/js/script.js:276` | Hardcoded API path in deletePackage() | Use configurable API_BASE constant from shared config module |
| 9 | High | Architecture | `admin/js/script.js:303` | Hardcoded API path in editPackage() | Use configurable API_BASE constant from shared config module |
| 10 | High | Architecture | `public/js/main.js:64` | Hardcoded API path `/DRISHYATRAVELS/backend/api/trip-planner/` | Use configurable API_BASE constant from shared config module |
| 11 | High | Architecture | `public/js/main.js:148` | Hardcoded API path `/DRISHYATRAVELS/backend/api/packages/?featured=1` | Use configurable API_BASE constant from shared config module |
| 12 | High | Architecture | `public/js/main.js:212` | Hardcoded API path `/DRISHYATRAVELS/backend/api/packages/` | Use configurable API_BASE constant from shared config module |
| 13 | High | Architecture | `public/js/packages.js:43` | Hardcoded API path `/DRISHYATRAVELS/backend/api/packages/` | Use configurable API_BASE constant from shared config module |
| 14 | High | Architecture | `public/js/package-details.js:33` | Hardcoded API path `/DRISHYATRAVELS/backend/api/packages/{id}` | Use configurable API_BASE constant from shared config module |
| 15 | High | Architecture | `docs/database/001_initial_schema.sql:18` | PostgreSQL vs MySQL schema mismatch - uses PG-specific syntax | Convert to MySQL dialect or switch PHP backend to PostgreSQL |
| 16 | High | Architecture | `public/data/packages.js:1` | Data duplication - static JS duplicates SQL seed data | Remove static file once backend API is fully functional, use API with fallback |

### Medium / Code Quality

| # | Priority | Category | File:Line | Description | Suggested Fix |
|---|----------|----------|-----------|-------------|---------------|
| 17 | Medium | Code Quality | `admin/js/utils.js:6` | Duplicate escapeHTML implementation (also in public/js/utils.js, public/js/main.js) | Single source of truth in shared utils, load from both admin and public |
| 18 | Medium | Code Quality | `public/js/utils.js:6` | Duplicate escapeHTML implementation (also in admin/js/utils.js, public/js/main.js) | Single source of truth in shared utils, load from both admin and public |
| 19 | Medium | Code Quality | `public/js/main.js:568` | Duplicate escapeHTML implementation (also in admin/js/utils.js, public/js/utils.js) | Single source of truth in shared utils, load from both admin and public |
| 20 | Medium | Code Quality | `admin/js/script.js:94` | Missing error handling - only shows generic message | Add specific error types, retry button, toast notifications, loading states |
| 21 | Medium | Code Quality | `admin/js/script.js:255` | Missing error handling in savePackage() | Parse validation errors (422), show field-specific errors, retry logic, toast |
| 22 | Medium | Code Quality | `admin/js/script.js:290` | Missing error handling in deletePackage() | Show specific error type, toast notification, retry logic |
| 23 | Medium | Code Quality | `admin/js/script.js:363` | Missing error handling in editPackage() | Show specific error type, toast notification, retry logic |
| 24 | Medium | Code Quality | `admin/index.html:11` | Inline preloader script should be moved to utils module | Move to js/utils.js or separate module |
| 25 | Medium | Code Quality | `backend/trip_planner/models.py:1` | Django trip_planner app referenced but doesn't exist | Either create the app or remove reference from urls.py |
| 26 | Medium | Code Quality | `backend/config/urls.py:39` | References trip_planner.urls but app doesn't exist | Create trip_planner app or remove the include |

### Low / Documentation & Cleanup

| # | Priority | Category | File:Line | Description | Suggested Fix |
|---|----------|----------|-----------|-------------|---------------|
| 27 | Low | Maintenance | `public/js/main_new.js` | Scratch/dead file - new version of main.js, likely WIP | Review and either merge or remove |

---

## Recommended Fix Order

### Phase 1: Critical Security (Do First)
1. **Admin Authentication** (#1) - Implement auth system
2. **Django Secret Key** (#2) - Move to env var
3. **Django DEBUG** (#3) - Set via env var
4. **Django ALLOWED_HOSTS** (#4) - Configure for production
5. **CORS Config** (#5) - Fix wildcard + credentials issue

### Phase 2: Architecture (High Impact)
6. **API Base Configuration** (#6-14) - Create shared config module with API_BASE
7. **Database Schema** (#15) - Convert SQL to MySQL dialect
8. **Data Duplication** (#16) - Remove static JS data once API works

### Phase 3: Code Quality
9. **Deduplicate escapeHTML** (#17-19) - Single shared utility
10. **Error Handling** (#20-23) - Add proper error UX in admin
11. **Move preloader** (#24) - Refactor to utils module
12. **Django trip_planner** (#25-26) - Create or remove

### Phase 4: Cleanup
13. **Dead Files** (#27) - Review/remove main_new.js

---

## Notes

- **Admin Authentication**: Currently deferred per project planning, but marked Critical for production readiness
- **Database**: The project uses a mixed architecture - static frontend + PHP API + unused Django app. The PostgreSQL schema in `docs/database/` was designed for Supabase but the PHP backend uses MySQL/MariaDB (XAMPP).
- **Testing**: Zero tests exist anywhere - no PHPUnit, no Vitest/Jest, no Django tests
- **Environment**: Uses `.env` for PHP config but not consistently across all files