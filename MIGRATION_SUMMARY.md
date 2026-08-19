# Django-to-PHP Migration Summary

## Overview

This document summarizes the complete migration of the Drishya Travels backend from Django to PHP, including the database migration from SQLite/PostgreSQL to MySQL/MariaDB for XAMPP.

**Migration Date**: 2026-08-19
**Git Branch**: `migration/django-to-php`
**Status**: Backend implementation complete, ready for testing

---

## 1. Old Django Architecture

### 1.1 Project Structure
```
backend/
├── config/
│   ├── settings.py       # Django settings (SQLite, CORS, DRF)
│   ├── urls.py           # Root URL routing
│   ├── wsgi.py / asgi.py
├── trip_planner/
│   ├── views.py          # Only trip planner endpoint
│   ├── urls.py           # App URL routing
│   ├── models.py         # EMPTY - no models defined
│   ├── admin.py
│   └── tests.py
└── manage.py
```

### 1.2 Django Features Implemented
| Feature | Status | Details |
|---------|--------|---------|
| Trip Planner API | ✅ Implemented | POST `/api/trip-planner/` |
| Package CRUD API | ❌ Not implemented | Models empty, no serializers/views |
| Django Admin | ✅ Configured | `/admin/` |
| Database | SQLite | `db.sqlite3` (empty, no migrations) |
| CORS | ✅ Enabled | `CORS_ALLOW_ALL_ORIGINS = True` |
| REST Framework | ✅ Installed | Used for trip planner view |

### 1.3 Database (Django)
- **Engine**: SQLite (`django.db.backends.sqlite3`)
- **File**: `backend/db.sqlite3`
- **Models**: None defined in `trip_planner/models.py`
- **Migrations**: Empty (`trip_planner/migrations/__init__.py` only)

---

## 2. Target Database Schema (PostgreSQL)

The `feat/database-and-refactor` branch contains a complete PostgreSQL schema for Supabase:

### 2.1 Tables (7 total)
1. **packages** - Core package data (18 columns)
2. **itinerary_days** - Day-by-day itinerary
3. **package_highlights** - Marketing highlights
4. **package_inclusions** - What's included
5. **package_exclusions** - What's excluded
5. **package_gallery** - Image URLs
6. **package_faqs** - FAQs

### 2.2 Relationships
```
packages (1) ─────< (N) itinerary_days
packages (1) ─────< (N) package_highlights
packages (1) ─────< (N) package_inclusions
packages (1) ─────< (N) package_exclusions
packages (1) ─────< (N) package_gallery
packages (1) ─────< (N) package_faqs
```

All FKs use `ON DELETE CASCADE`.

### 2.3 Seed Data
4 packages matching `public/data/packages.js`:
- everest-base-camp
- mardi-trek
- rani-mahal
- manang

---

## 3. New PHP Architecture

### 3.1 Project Structure
```
backend/
├── api/                    # API endpoints (entry points)
│   ├── index.php           # GET /api/ - Health check
│   ├── .htaccess           # Apache rewrite rules
│   ├── trip-planner/
│   │   └── index.php       # POST /api/trip-planner/
│   └── packages/
│       ├── index.php       # GET/POST /api/packages
│       ├── [id].php        # GET/PUT/PATCH/DELETE /api/packages/{id}
│       ├── itinerary.php   # GET /api/packages/{id}/itinerary
│       ├── highlights.php  # GET /api/packages/{id}/highlights
│       ├── inclusions.php  # GET /api/packages/{id}/inclusions
│       ├── exclusions.php  # GET /api/packages/{id}/exclusions
│       ├── gallery.php     # GET /api/packages/{id}/gallery
│       └── faqs.php        # GET /api/packages/{id}/faqs
├── config/
│   └── database.php        # PDO connection + helpers
├── database/
│   └── schema.sql          # MySQL schema + seed data
├── middleware/
│   └── cors.php            # CORS handling
├── models/
│   └── Package.php         # Package model (CRUD + relations)
├── utils/
│   ├── response.php        # JSON response helpers
│   └── validation.php      # Input validation
├── .env                    # Environment config
└── README.md               # Setup documentation
```

### 3.2 Technology Choices
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | **Plain PHP** | No framework overhead; Django was minimal |
| Database | **PDO + MySQL** | XAMPP native, prepared statements |
| Routing | **Apache mod_rewrite** | No router library needed |
| Config | **.env + PHP** | Simple, no dependency |
| Validation | **Custom functions** | Lightweight, no library |
| JSON | **json_encode/decode** | Native PHP |

---

## 4. Database Migration: PostgreSQL → MySQL

### 4.1 Type Mapping

| PostgreSQL | MySQL/MariaDB | Notes |
|------------|---------------|-------|
| `TEXT` | `TEXT` / `LONGTEXT` | MySQL TEXT = 64KB |
| `NUMERIC(12,2)` | `DECIMAL(12,2)` | Exact match |
| `CHAR(3)` | `CHAR(3)` | Exact match |
| `TIMESTAMPTZ` | `TIMESTAMP` | Auto UTC conversion |
| `BIGINT GENERATED AS IDENTITY` | `BIGINT AUTO_INCREMENT` | Functionally equivalent |
| `CHECK constraints` | `CHECK constraints` | MySQL 8.0.16+ |
| `ON CONFLICT` | `ON DUPLICATE KEY UPDATE` | Syntax difference |

### 4.2 Key Changes Made

1. **Primary Key**: `TEXT` → `VARCHAR(100)` (slug-based IDs)
2. **Timestamps**: `TIMESTAMPTZ DEFAULT NOW()` → `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
3. **Auto-increment**: `GENERATED ALWAYS AS IDENTITY` → `AUTO_INCREMENT`
4. **Idempotent inserts**: `ON CONFLICT DO UPDATE` → `ON DUPLICATE KEY UPDATE`
5. **Constraints**: Added explicit `CONSTRAINT` names for all CHECK/UNIQUE/FK
6. **Charset**: `utf8mb4` with `utf8mb4_unicode_ci` collation

### 4.3 Schema File
Location: `backend/database/schema.sql`

Contains:
- Complete CREATE TABLE statements (7 tables)
- All indexes
- Seed data for 4 packages with all relations
- Verification queries (commented)

---

## 5. Endpoint Mapping

### 5.1 Migrated Endpoints (Django → PHP)

| # | Django Route | Method | PHP Route | Status |
|---|-------------|--------|-----------|--------|
| 1 | `/` | GET | `/api/` | ✅ Implemented |
| 2 | `/api/trip-planner/` | POST | `/api/trip-planner/` | ✅ Implemented |
| 3 | `/admin/` | GET/POST | **Not migrated** | ❌ Intentionally skipped |

### 5.2 New Endpoints (Package CRUD - Based on DB Schema)

| # | Purpose | Method | PHP Route | Status |
|---|---------|--------|-----------|--------|
| 4 | List packages | GET | `/api/packages` | ✅ Implemented |
| 5 | Get package | GET | `/api/packages/{id}` | ✅ Implemented |
| 6 | Create package | POST | `/api/packages` | ✅ Implemented |
| 7 | Update package | PUT | `/api/packages/{id}` | ✅ Implemented |
| 8 | Partial update | PATCH | `/api/packages/{id}` | ✅ Implemented |
| 9 | Delete package | DELETE | `/api/packages/{id}` | ✅ Implemented |
| 10 | Get itinerary | GET | `/api/packages/{id}/itinerary` | ✅ Implemented |
| 11 | Get highlights | GET | `/api/packages/{id}/highlights` | ✅ Implemented |
| 12 | Get inclusions | GET | `/api/packages/{id}/inclusions` | ✅ Implemented |
| 13 | Get exclusions | GET | `/api/packages/{id}/exclusions` | ✅ Implemented |
| 14 | Get gallery | GET | `/api/packages/{id}/gallery` | ✅ Implemented |
| 15 | Get FAQs | GET | `/api/packages/{id}/faqs` | ✅ Implemented |

---

## 6. Frontend Integration Status

### 6.1 Current Frontend API Calls

| Frontend File | Current Call | Target PHP Endpoint |
|--------------|--------------|---------------------|
| `public/js/main.js:40` | `http://127.0.0.1:8000/api/trip-planner/` | `/api/trip-planner/` |
| `admin/js/script.js:56` | `http://localhost:5000/api/packages` (commented) | `/api/packages` |

### 6.2 Required Frontend Changes (Not Done Yet)

The frontend currently uses static data from `public/data/packages.js`. To connect to PHP backend:

1. **Trip Planner** (`public/js/main.js`): Update fetch URL
2. **Package Listing** (`public/js/packages.js`): Replace `getAllPackages()` with API call
3. **Package Detail** (`public/js/package-details.js`): Replace `getPackageById()` with API call
4. **Admin Panel** (`admin/js/script.js`): Implement actual API calls for CRUD

**Note**: Per requirements, frontend integration is NOT part of this migration phase.

---

## 7. Migration Decisions

### 7.1 What Was Migrated
- ✅ Trip planner endpoint (exact behavior match)
- ✅ Root API endpoint (exact response match)
- ✅ Complete package database schema (from PostgreSQL design)
- ✅ Full package CRUD API (new implementation)
- ✅ All package relations API (itinerary, highlights, inclusions, exclusions, gallery, FAQs)

### 7.2 What Was NOT Migrated
- ❌ Django Admin interface (not needed for PHP backend)
- ❌ Django authentication system (not used by frontend)
- ❌ Django sessions/messages (not used)
- ❌ SQLite database (replaced with MySQL)

### 7.3 What Was NEWLY Implemented
- Complete Package model with all relations
- Full CRUD API for packages
- Relation endpoints for all child tables
- Input validation for all endpoints
- Standardized JSON response format
- CORS middleware
- Environment-based configuration
- Apache rewrite routing

### 7.4 Design Decisions

| Decision | Rationale |
|----------|-----------|
| Plain PHP (no framework) | Django backend was minimal; framework adds unnecessary complexity |
| Apache mod_rewrite for routing | No router library needed; simple and performant |
| PDO with prepared statements | Prevents SQL injection; XAMPP default |
| Single Package model class | All package logic centralized; relations as methods |
| `.env` for config | Standard practice; works with XAMPP defaults |
| `ON DUPLICATE KEY UPDATE` | MySQL equivalent of PostgreSQL's `ON CONFLICT` |
| `TIMESTAMP` with auto-update | MySQL native; simpler than application-managed |
| CHECK constraints with names | MySQL 8.0+ supports named constraints |

---

## 8. Files Created/Modified

### 8.1 New Files Created

| File | Purpose |
|------|---------|
| `MIGRATION_INVENTORY.md` | Complete audit of Django backend and migration mapping |
| `backend/database/schema.sql` | MySQL schema + seed data (converted from PostgreSQL) |
| `backend/config/database.php` | PDO connection + query helpers |
| `backend/.env` | Environment configuration |
| `backend/middleware/cors.php` | CORS headers |
| `backend/utils/response.php` | JSON response helpers |
| `backend/utils/validation.php` | Input validation helpers |
| `backend/models/Package.php` | Package model with CRUD + relations |
| `backend/api/index.php` | API root / health check |
| `backend/api/.htaccess` | Apache rewrite rules |
| `backend/api/trip-planner/index.php` | Trip planner endpoint |
| `backend/api/packages/index.php` | Package list/create |
| `backend/api/packages/[id].php` | Package CRUD by ID |
| `backend/api/packages/itinerary.php` | Itinerary relation |
| `backend/api/packages/highlights.php` | Highlights relation |
| `backend/api/packages/inclusions.php` | Inclusions relation |
| `backend/api/packages/exclusions.php` | Exclusions relation |
| `backend/api/packages/gallery.php` | Gallery relation |
| `backend/api/packages/faqs.php` | FAQs relation |
| `backend/README.md` | Complete setup & usage documentation |
| `MIGRATION_SUMMARY.md` | This file |

### 8.2 Existing Files Unchanged
- All Django backend files (`backend/config/`, `backend/trip_planner/`)
- All frontend files (`public/`, `admin/`)
- All documentation (`docs/`)

---

## 9. Testing Checklist

### 9.1 Database Setup
- [ ] XAMPP MySQL running
- [ ] Database `drishya_travels` created
- [ ] Schema imported from `backend/database/schema.sql`
- [ ] 4 packages seeded with all relations

### 9.2 API Endpoints
- [ ] `GET /api/` - Returns API info
- [ ] `POST /api/trip-planner/` - Returns route for valid style
- [ ] `POST /api/trip-planner/` - Returns 400 for missing fields
- [ ] `POST /api/trip-planner/` - Returns 400 for invalid style
- [ ] `POST /api/trip-planner/` - Returns 400 for invalid people
- [ ] `GET /api/packages` - Returns all 4 packages
- [ ] `GET /api/packages?status=published` - Filters correctly
- [ ] `GET /api/packages?limit=2` - Pagination works
- [ ] `GET /api/packages/everest-base-camp` - Returns full package with relations
- [ ] `GET /api/packages/nonexistent` - Returns 404
- [ ] `POST /api/packages` - Creates new package with relations
- [ ] `PUT /api/packages/{id}` - Updates package
- [ ] `PATCH /api/packages/{id}` - Partial updates package
- [ ] `DELETE /api/packages/{id}` - Deletes package (cascades)
- [ ] `GET /api/packages/{id}/itinerary` - Returns itinerary
- [ ] `GET /api/packages/{id}/highlights` - Returns highlights
- [ ] `GET /api/packages/{id}/inclusions` - Returns inclusions
- [ ] `GET /api/packages/{id}/exclusions` - Returns exclusions
- [ ] `GET /api/packages/{id}/gallery` - Returns gallery
- [ ] `GET /api/packages/{id}/faqs` - Returns FAQs

### 9.3 Security
- [ ] Prepared statements used everywhere (no SQL injection)
- [ ] Input validation on all endpoints
- [ ] CORS headers present
- [ ] `.env` not accessible via web
- [ ] Error details only in debug mode

---

## 10. Known Limitations / Future Work

### 10.1 Current Limitations
1. **No authentication** - Admin panel endpoints are open
2. **No rate limiting** - Could be added via middleware
3. **No API versioning in URL** - Could add `/api/v1/` prefix
4. **File uploads not handled** - Hero images are URLs only
5. **No automated tests** - Manual testing only

### 10.2 Recommended Next Steps
1. **Frontend Integration** - Update frontend to use PHP API
2. **Authentication** - Add JWT or session auth for admin endpoints
3. **Rate Limiting** - Add middleware for API protection
4. **Automated Tests** - PHPUnit or similar
5. **API Versioning** - Add `/v1/` prefix to all routes
6. **Image Upload** - Add endpoint for uploading hero/gallery images
7. **Logging** - Structured logging for production

---

## 11. Verification Commands

```bash
# 1. Verify database
mysql -u root -p drishya_travels -e "SELECT id, title, status FROM packages;"

# 2. Test API health
curl http://localhost/drishya-api/

# 3. Test trip planner (migrated from Django)
curl -X POST http://localhost/drishya-api/trip-planner/ \
  -H "Content-Type: application/json" \
  -d '{"style":"Adventure","days":"7","month":"October","people":2}'

# 4. Test packages list
curl http://localhost/drishya-api/packages

# 5. Test single package
curl http://localhost/drishya-api/packages/everest-base-camp

# 6. Test relations
curl http://localhost/drishya-api/packages/everest-base-camp/itinerary
curl http://localhost/drishya-api/packages/everest-base-camp/highlights
```

---

## 12. Rollback Plan

If issues arise, the Django backend remains intact on the `main` branch:

```bash
# To return to Django backend:
git checkout main
# Start Django: cd backend && python manage.py runserver
```

The Django backend at `main` branch commit `d089197` is fully functional and unchanged.

---

*Migration completed on 2026-08-19*
*Branch: migration/django-to-php*
*All implementation files in `backend/` directory*