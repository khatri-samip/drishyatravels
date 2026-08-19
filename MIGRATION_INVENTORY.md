# Django-to-PHP Migration Inventory

## Executive Summary

This document catalogs all existing Django backend functionality that needs to be migrated to PHP. The Django backend is minimal - it only implements a **trip planner endpoint** that returns a pre-defined route based on travel style. The actual package data is served statically from `public/data/packages.js` in the frontend.

**Key Finding**: The Django backend does NOT currently serve package CRUD operations. The `feat/database-and-refactor` branch contains a complete PostgreSQL schema for packages, but the Django models (`backend/trip_planner/models.py`) are empty and no Django REST API endpoints for packages exist.

---

## 1. Django Backend Audit

### 1.1 Project Structure
```
backend/
├── config/
│   ├── settings.py       # Django settings
│   ├── urls.py           # Root URL config
│   ├── wsgi.py
│   └── asgi.py
├── trip_planner/
│   ├── views.py          # API views (trip planner only)
│   ├── urls.py           # App URLs
│   ├── models.py         # EMPTY - no models defined
│   ├── admin.py
│   ├── apps.py
│   └── tests.py
└── manage.py
```

### 1.2 Django Apps
- **trip_planner**: Contains trip planner functionality only
- **config**: Project configuration

### 1.3 Installed Apps (from settings.py)
- `django.contrib.admin`
- `django.contrib.auth`
- `django.contrib.contenttypes`
- `django.contrib.sessions`
- `django.contrib.messages`
- `django.contrib.staticfiles`
- `rest_framework` (Django REST Framework)
- `corsheaders` (CORS support)
- `trip_planner`

### 1.4 Database Configuration
- **Engine**: SQLite (`django.db.backends.sqlite3`)
- **File**: `BASE_DIR / 'db.sqlite3'`
- **Note**: The schema in `docs/database/001_initial_schema.sql` is for PostgreSQL/Supabase, not the current Django SQLite

### 1.5 CORS Configuration
```python
CORS_ALLOW_ALL_ORIGINS = True
```

### 1.6 Middleware
- `corsheaders.middleware.CorsMiddleware`
- `django.middleware.security.SecurityMiddleware`
- `django.contrib.sessions.middleware.SessionMiddleware`
- `django.middleware.common.CommonMiddleware`
- `django.middleware.csrf.CsrfViewMiddleware`
- `django.contrib.auth.middleware.AuthenticationMiddleware`
- `django.contrib.messages.middleware.MessageMiddleware`
- `django.middleware.clickjacking.XFrameOptionsMiddleware`

---

## 2. Django API Endpoints

### 2.1 Trip Planner Endpoint

| Property | Value |
|----------|-------|
| **Django Route** | `/api/trip-planner/` |
| **HTTP Method** | `POST` |
| **Purpose** | Return a pre-defined travel route based on style, days, month, and people |
| **Authentication** | None |
| **View Function** | `trip_planner.views.plan_trip` |

#### Request Body
```json
{
  "style": "Adventure|Culture|Wildlife|Relaxed",
  "days": "number (string or int)",
  "month": "string",
  "people": "number (string or int)"
}
```

#### Response Format (Success - 200 OK)
```json
{
  "route": "Kathmandu → Pokhara → Annapurna region",
  "style": "Adventure",
  "days": "7",
  "month": "October",
  "people": 2
}
```

#### Response Format (Error - 400 Bad Request)
```json
{
  "error": "All fields are required."
}
// or
{
  "error": "Invalid trip style."
}
// or
{
  "error": "Travellers must be a number."
}
// or
{
  "error": "There must be at least one traveller."
}
```

#### Business Logic (from views.py)
```python
ROUTES = {
    "Adventure": "Kathmandu → Pokhara → Annapurna region",
    "Culture": "Kathmandu → Bhaktapur → Patan → Bandipur",
    "Wildlife": "Kathmandu → Chitwan → Pokhara",
    "Relaxed": "Kathmandu → Pokhara → Bandipur",
}
```
- Validates all 4 fields are present
- Validates `style` is one of the 4 predefined keys
- Validates `people` is a positive integer
- Returns the matching route from the static `ROUTES` dictionary

### 2.2 Root Endpoint

| Property | Value |
|----------|-------|
| **Django Route** | `/` |
| **HTTP Method** | `GET` |
| **Purpose** | API welcome/health check |
| **View Function** | `config.urls.home` |

#### Response Format (200 OK)
```json
{
  "message": "Welcome to Drishya Travels API",
  "status": "running",
  "endpoints": {
    "trip_planner": "/api/trip-planner/",
    "admin": "/admin/"
  }
}
```

### 2.3 Admin Endpoint

| Property | Value |
|----------|-------|
| **Django Route** | `/admin/` |
| **HTTP Method** | `GET`, `POST` |
| **Purpose** | Django Admin interface |
| **Authentication** | Django Admin authentication |

---

## 3. Database Schema (Target - from feat/database-and-refactor)

The following tables are defined in `docs/database/001_initial_schema.sql` for PostgreSQL/Supabase. These represent the **intended** data model for package management.

### 3.1 Core Tables

#### packages (Main Table)
| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| title | TEXT | NOT NULL |
| category | TEXT | NOT NULL |
| destination | TEXT | NOT NULL |
| duration | TEXT | NOT NULL |
| price | NUMERIC(12, 2) | NOT NULL, CHECK (price >= 0) |
| currency | CHAR(3) | NOT NULL DEFAULT 'USD' |
| price_details | TEXT | |
| difficulty | TEXT | NOT NULL, CHECK (difficulty IN ('Easy', 'Moderate', 'Challenging')) |
| best_season | TEXT | |
| maximum_altitude | TEXT | |
| starting_point | TEXT | |
| ending_point | TEXT | |
| package_type | TEXT | |
| short_description | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| hero_image_url | TEXT | |
| status | TEXT | NOT NULL DEFAULT 'draft', CHECK (status IN ('draft', 'published', 'archived')) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

#### itinerary_days
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | GENERATED ALWAYS AS IDENTITY PRIMARY KEY |
| package_id | TEXT | NOT NULL REFERENCES packages(id) ON DELETE CASCADE |
| day_number | INTEGER | NOT NULL CHECK (day_number > 0) |
| title | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| **Unique** | | (package_id, day_number) |

#### package_highlights
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | GENERATED ALWAYS AS IDENTITY PRIMARY KEY |
| package_id | TEXT | NOT NULL REFERENCES packages(id) ON DELETE CASCADE |
| highlight | TEXT | NOT NULL |
| display_order | INTEGER | NOT NULL DEFAULT 0 CHECK (display_order >= 0) |

#### package_inclusions
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | GENERATED ALWAYS AS IDENTITY PRIMARY KEY |
| package_id | TEXT | NOT NULL REFERENCES packages(id) ON DELETE CASCADE |
| inclusion | TEXT | NOT NULL |
| display_order | INTEGER | NOT NULL DEFAULT 0 CHECK (display_order >= 0) |

#### package_exclusions
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | GENERATED ALWAYS AS IDENTITY PRIMARY KEY |
| package_id | TEXT | NOT NULL REFERENCES packages(id) ON DELETE CASCADE |
| exclusion | TEXT | NOT NULL |
| display_order | INTEGER | NOT NULL DEFAULT 0 CHECK (display_order >= 0) |

#### package_gallery
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | GENERATED ALWAYS AS IDENTITY PRIMARY KEY |
| package_id | TEXT | NOT NULL REFERENCES packages(id) ON DELETE CASCADE |
| image_url | TEXT | NOT NULL |
| display_order | INTEGER | NOT NULL DEFAULT 0 CHECK (display_order >= 0) |

#### package_faqs
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | GENERATED ALWAYS AS IDENTITY PRIMARY KEY |
| package_id | TEXT | NOT NULL REFERENCES packages(id) ON DELETE CASCADE |
| question | TEXT | NOT NULL |
| answer | TEXT | NOT NULL |
| display_order | INTEGER | NOT NULL DEFAULT 0 CHECK (display_order >= 0) |

### 3.2 Indexes
- `idx_packages_status` ON packages(status)
- `idx_packages_category` ON packages(category)
- `idx_packages_difficulty` ON packages(difficulty)
- `idx_itinerary_days_package_id` ON itinerary_days(package_id)
- `idx_package_highlights_package_id` ON package_highlights(package_id)
- `idx_package_inclusions_package_id` ON package_inclusions(package_id)
- `idx_package_exclusions_package_id` ON package_exclusions(package_id)
- `idx_package_gallery_package_id` ON package_gallery(package_id)
- `idx_package_faqs_package_id` ON package_faqs(package_id)

### 3.3 Seed Data (4 Packages)
1. **everest-base-camp** - Everest Base Camp Trek ($1,725 USD, Challenging)
2. **mardi-trek** - Mardi Trek (NPR 57,400, Moderate)
3. **rani-mahal** - The Taj of Nepal: Rani Mahal (NPR 11,500, Easy)
4. **manang** - Explore the District after Himalayas: Manang (NPR 16,500, Moderate)

---

## 4. Frontend API Expectations

### 4.1 Current Frontend Behavior
The frontend currently **does NOT call any backend API for packages**. It reads from `public/data/packages.js` directly.

### 4.2 Trip Planner (Active API Call)
**File**: `public/js/main.js` lines 39-55

```javascript
const response = await fetch("http://127.0.0.1:8000/api/trip-planner/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ style, days, month, people })
});
```

**Expected Response**:
```json
{
  "route": "Kathmandu → Pokhara → Annapurna region",
  "style": "Adventure",
  "days": "7",
  "month": "October",
  "people": 2
}
```

### 4.3 Admin Panel (Future API Calls - Currently Stubbed)
**File**: `admin/js/script.js`

The admin panel has functions for:
- `loadPackages()` - should fetch from API (currently reads static data)
- `savePackage(event)` - should POST/PUT to API (currently shows "Backend Required" message)
- `deletePackage(id)` - should DELETE from API (currently shows alert)
- `editPackage(id)` - should GET from API (currently shows alert)

**Expected API Endpoints for Admin** (not yet implemented):
| Operation | Method | Endpoint | Request Body |
|-----------|--------|----------|--------------|
| List packages | GET | `/api/packages` | - |
| Get package | GET | `/api/packages/{id}` | - |
| Create package | POST | `/api/packages` | Full package object |
| Update package | PUT/PATCH | `/api/packages/{id}` | Partial/full package object |
| Delete package | DELETE | `/api/packages/{id}` | - |

---

## 5. Migration Mapping: Django → PHP

### 5.1 Endpoints to Migrate

| # | Django Route | Method | Purpose | PHP Equivalent | Status |
|---|-------------|--------|---------|----------------|--------|
| 1 | `/` | GET | API welcome/health | `/api/` or `/` | ✅ Required |
| 2 | `/api/trip-planner/` | POST | Trip planner | `/api/trip-planner/` | ✅ Required |
| 3 | `/admin/` | GET/POST | Django Admin | **N/A** - Not migrating Django Admin | ❌ Skip |

### 5.2 NEW Endpoints Needed (Package CRUD - from database schema)
These endpoints don't exist in Django yet but are required for the package database:

| # | Purpose | Method | PHP Route | Request | Response |
|---|---------|--------|-----------|---------|----------|
| 4 | List all packages | GET | `/api/packages` | Query: status, category, limit, offset | `{ data: [...], total: N }` |
| 5 | Get package by ID | GET | `/api/packages/{id}` | - | Full package with relations |
| 6 | Create package | POST | `/api/packages` | Full package data | Created package (201) |
| 7 | Update package | PUT/PATCH | `/api/packages/{id}` | Partial/full package data | Updated package |
| 8 | Delete package | DELETE | `/api/packages/{id}` | - | 204 No Content |
| 9 | Get itinerary | GET | `/api/packages/{id}/itinerary` | - | Array of days |
| 10 | Get highlights | GET | `/api/packages/{id}/highlights` | - | Array of highlights |
| 11 | Get inclusions | GET | `/api/packages/{id}/inclusions` | - | Array of inclusions |
| 12 | Get exclusions | GET | `/api/packages/{id}/exclusions` | - | Array of exclusions |
| 13 | Get gallery | GET | `/api/packages/{id}/gallery` | - | Array of images |
| 14 | Get FAQs | GET | `/api/packages/{id}/faqs` | - | Array of FAQs |

---

## 6. Database Migration: PostgreSQL → MySQL/MariaDB

### 6.1 Type Mapping

| PostgreSQL | MySQL/MariaDB | Notes |
|------------|---------------|-------|
| TEXT | TEXT or LONGTEXT | MySQL TEXT = 65KB, LONGTEXT = 4GB |
| NUMERIC(12,2) | DECIMAL(12,2) | Exact match |
| CHAR(3) | CHAR(3) | Exact match |
| TIMESTAMPTZ | TIMESTAMP | MySQL TIMESTAMP is timezone-aware (converts to UTC) |
| BIGINT GENERATED ALWAYS AS IDENTITY | BIGINT AUTO_INCREMENT | MySQL equivalent |
| CHECK constraints | CHECK constraints | Supported in MySQL 8.0.16+ |
| ON DELETE CASCADE | ON DELETE CASCADE | Exact match |

### 6.2 Special Considerations

1. **UUID/TEXT Primary Key**: The `packages.id` uses TEXT (slug). MySQL handles this fine.
2. **TIMESTAMPTZ**: MySQL's TIMESTAMP converts to UTC on storage. For application-level timezone handling, consider using DATETIME + application-managed timezone.
3. **GENERATED ALWAYS AS IDENTITY**: MySQL 8.0+ supports `AUTO_INCREMENT` which is functionally equivalent.
4. **CHECK Constraints**: Require MySQL 8.0.16+ (XAMPP typically includes 8.0+ or 10.x MariaDB).
5. **ON CONFLICT**: MySQL uses `ON DUPLICATE KEY UPDATE` instead of PostgreSQL's `ON CONFLICT`.

---

## 7. PHP Backend Structure (Proposed)

Based on the actual Django functionality + required package CRUD:

```
backend/
├── config/
│   └── database.php          # PDO connection, environment config
├── api/
│   ├── index.php             # API entry point / router
│   ├── trip-planner/
│   │   └── index.php         # POST /api/trip-planner/
│   └── packages/
│       ├── index.php         # GET /api/packages, POST /api/packages
│       ├── [id].php          # GET/PUT/DELETE /api/packages/{id}
│       └── relations/
│           ├── itinerary.php
│           ├── highlights.php
│           ├── inclusions.php
│           ├── exclusions.php
│           ├── gallery.php
│           └── faqs.php
├── models/
│   ├── Package.php
│   ├── ItineraryDay.php
│   ├── Highlight.php
│   ├── Inclusion.php
│   ├── Exclusion.php
│   ├── GalleryImage.php
│   └── FAQ.php
├── database/
│   └── schema.sql            # MySQL schema (converted from PostgreSQL)
├── middleware/
│   └── cors.php              # CORS headers
├── utils/
│   ├── response.php          # JSON response helpers
│   ├── validation.php        # Input validation
│   └── database.php          # Query helpers
└── README.md
```

---

## 8. Implementation Phases

### Phase 1: Audit Complete ✅
- [x] Django backend inspected
- [x] Endpoints documented
- [x] Database schema documented
- [x] Frontend API expectations documented
- [x] Migration inventory created

### Phase 2: Database Migration (Next)
- [ ] Convert PostgreSQL schema to MySQL/MariaDB
- [ ] Create `backend/database/schema.sql`
- [ ] Create seed data SQL for MySQL
- [ ] Document XAMPP database setup

### Phase 3: PHP Backend Structure
- [ ] Create directory structure
- [ ] Implement database connection (PDO)
- [ ] Implement CORS middleware
- [ ] Implement response utilities

### Phase 4: Core Endpoints
- [ ] Implement `/api/trip-planner/` (migrate from Django)
- [ ] Implement `/api/` health check

### Phase 5: Package CRUD Endpoints
- [ ] Implement Package model + queries
- [ ] Implement GET /api/packages (list with filters)
- [ ] Implement GET /api/packages/{id} (with relations)
- [ ] Implement POST /api/packages (create)
- [ ] Implement PUT/PATCH /api/packages/{id} (update)
- [ ] Implement DELETE /api/packages/{id}
- [ ] Implement relation endpoints (itinerary, highlights, etc.)

### Phase 6: Testing & XAMPP Setup
- [ ] Configure Apache VirtualHost
- [ ] Create database in MySQL
- [ ] Import schema + seed data
- [ ] Test all endpoints
- [ ] Document setup instructions

---

## 9. Summary

### Features Successfully Audited
1. ✅ Django project structure
2. ✅ Django settings (database, CORS, middleware, apps)
3. ✅ Trip planner endpoint (POST /api/trip-planner/)
4. ✅ Root API endpoint (GET /)
5. ✅ Target database schema (from feat/database-and-refactor)
6. ✅ Seed data for 4 packages
7. ✅ Frontend trip planner integration
8. ✅ Admin panel expected API requirements

### Features NOT in Current Django (Need Implementation)
1. ❌ Package CRUD endpoints (GET/POST/PUT/DELETE /api/packages)
2. ❌ Package relation endpoints (itinerary, highlights, inclusions, exclusions, gallery, FAQs)
3. ❌ Django models for packages
4. ❌ Django serializers for packages
5. ❌ Django admin registration for packages

### Migration Scope Decision
**The migration should include:**
- The existing trip planner endpoint (PHP equivalent)
- The complete package CRUD API (new implementation based on the documented database schema)
- MySQL database schema converted from PostgreSQL

**The migration should NOT include:**
- Django Admin interface (not needed for PHP backend)
- Django authentication system (not used by current frontend)
- Any Django-specific features not exposed via API

---

## 10. Files Referenced

| File | Purpose |
|------|---------|
| `backend/config/settings.py` | Django settings |
| `backend/config/urls.py` | Root URL routing |
| `backend/trip_planner/urls.py` | App URL routing |
| `backend/trip_planner/views.py` | Trip planner view |
| `backend/trip_planner/models.py` | Empty models file |
| `docs/database/001_initial_schema.sql` | Target PostgreSQL schema |
| `docs/database/README.md` | Database documentation |
| `docs/ARCHITECTURE.md` | Frontend architecture |
| `docs/DEVELOPMENT.md` | Development guidelines |
| `public/js/main.js` | Frontend trip planner call |
| `admin/js/script.js` | Admin panel expected API calls |
| `public/data/packages.js` | Static package data (source of truth) |

---

*Generated on: 2026-08-19*
*Branch: migration/django-to-php*
*Source: Django backend (main branch) + Database schema (feat/database-and-refactor branch)*