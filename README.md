# Drishya Travels

Drishya Travels is a travel agency website showcasing Nepal's mountains, cultural heritage, and adventure journeys. It features a dual-backend architecture with a PHP/MySQL API for package management and a Django REST API for trip planning, served via XAMPP for local development.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DRISHYATRAVELS                           │
├─────────────────────┬─────────────────────┬─────────────────────┤
│    Frontend         │    Admin Panel      │    Backend          │
│    (public/)        │    (admin/)         │                     │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ • Static HTML/CSS/JS│ • Frontend-only UI  │ • PHP/MySQL API     │
│ • Vanilla ES6+      │ • NO authentication │   (backend/api/)    │
│ • CSS variables     │ • CRUD via API      │   - Packages CRUD   │
│ • No build step     │ • Event delegation  │   - Relations       │
└──────────┬──────────┴──────────┬──────────┴──────────┬───────────┘
           │                     │                     │
           └──────────┬──────────┴──────────┬──────────┘
                      │                     │
              ┌───────▼───────┐     ┌───────▼───────┐
              │  PHP API      │     │  Django API   │
              │  (port 80/443)│     │  (port 8000)  │
              │  Apache       │     │  runserver    │
              └───────┬───────┘     └───────┬───────┘
                      │                     │
              ┌───────▼─────────────────────▼───────┐
              │         Databases                   │
              │  • MySQL/MariaDB (PHP backend)      │
              │  • SQLite (Django dev) /            │
              │    PostgreSQL (Supabase prod)       │
              └─────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Location |
|-------|------------|----------|
| **Frontend** | Vanilla HTML5, CSS3, ES6+ JavaScript | `public/` |
| **Admin UI** | Vanilla HTML/CSS/JS (no auth) | `admin/` |
| **Primary API** | PHP 8+ / MySQL (PDO) | `backend/api/` |
| **Trip Planner API** | Django 6.1 / Django REST Framework | `backend/trip_planner/` |
| **Database (PHP)** | MySQL / MariaDB (XAMPP) | `backend/config/database.php` |
| **Database (Django)** | SQLite (dev), PostgreSQL (prod) | `backend/config/settings.py` |
| **Schema Reference** | PostgreSQL (Supabase) | `docs/database/001_initial_schema.sql` |

---

## Folder Structure (Verified)

```
DRISHYATRAVELS/
├── admin/                          # Admin panel (frontend only)
│   ├── css/style.css              # Admin styles
│   ├── js/
│   │   ├── script.js              # Admin logic (CRUD via API)
│   │   └── utils.js               # escapeHTML utility
│   └── index.html                 # Admin dashboard
│
├── backend/
│   ├── api/                       # PHP/MySQL REST API
│   │   ├── index.php              # API root / health check
│   │   ├── packages/
│   │   │   ├── index.php          # GET list, POST create
│   │   │   ├── [id].php           # GET/PUT/PATCH/DELETE single
│   │   │   ├── itinerary.php      # GET /packages/{id}/itinerary
│   │   │   ├── highlights.php     # GET /packages/{id}/highlights
│   │   │   ├── inclusions.php     # GET /packages/{id}/inclusions
│   │   │   ├── exclusions.php     # GET /packages/{id}/exclusions
│   │   │   ├── gallery.php        # GET /packages/{id}/gallery
│   │   │   └── faqs.php           # GET /packages/{id}/faqs
│   │   └── .htaccess              # Apache rewrite rules
│   │
│   ├── config/
│   │   ├── database.php           # MySQL PDO connection + helpers
│   │   ├── settings.py            # Django settings (SQLite dev)
│   │   ├── urls.py                # Django URL routing
│   │   ├── wsgi.py / asgi.py      # Django entry points
│   │   └── __init__.py
│   │
│   ├── middleware/
│   │   └── cors.php               # CORS headers + preflight
│   │
│   ├── models/
│   │   └── Package.php            # Eloquent-like model (MySQL)
│   │
│   ├── trip_planner/              # Django app
│   │   ├── views.py               # plan_trip POST endpoint
│   │   ├── urls.py                # /api/trip-planner/
│   │   ├── models.py              # (empty - uses DRF only)
│   │   └── admin.py / apps.py
│   │
│   ├── utils/
│   │   ├── response.php           # jsonResponse, jsonError, etc.
│   │   └── validation.php         # validatePackage, validateTripPlanner
│   │
│   ├── config/ (Django)
│   ├── db.sqlite3                 # Django dev database
│   ├── manage.py                  # Django CLI
│   ├── requirements.txt           # Python deps
│   └── .htaccess                  # Apache config for PHP API
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── DECISIONS.md
│   ├── PROJECT_STATUS.md
│   └── database/
│       ├── 001_initial_schema.sql # PostgreSQL schema + seed data
│       └── README.md              # DB documentation
│
├── public/                         # Public website (document root)
│   ├── css/
│   │   ├── global.css             # CSS variables, reset, utilities
│   │   ├── home.css               # Homepage styles
│   │   ├── packages.css           # Package listing styles
│   │   └── package-details.css    # Package detail styles
│   │
│   ├── data/
│   │   └── packages.js            # Static fallback data (4 packages)
│   │
│   ├── js/
│   │   ├── utils.js               # escapeHTML utility
│   │   ├── main.js                # Homepage: trip planner, carousel
│   │   ├── packages.js            # Package listing: pagination, filters
│   │   └── package-details.js     # Package detail page renderer
│   │
│   ├── index.html                 # Homepage
│   ├── packages.html              # Package listing page
│   ├── package.html               # Package detail template
│   ├── faq.html
│   ├── privacy-policy.html
│   ├── terms-and-conditions.html
│   ├── travel-tips.html
│   ├── visa-information.html
│   └── best-time-to-visit.html
│
├── index.html                      # Redirect / entry point
├── README.md                       # This file
├── MIGRATION_INVENTORY.md
└── MIGRATION_SUMMARY.md
```

---

## How Components Connect

### Frontend → PHP API
- **Homepage** (`public/index.html` + `main.js`):
  - `GET /DRISHYATRAVELS/backend/api/packages/?featured=1` → Featured packages grid
  - `GET /DRISHYATRAVELS/backend/api/packages/` → "Places Worth the Journey" carousel
  - `POST /DRISHYATRAVELS/backend/api/trip-planner/` → Trip planner (Django)

- **Package Listing** (`public/packages.html` + `packages.js`):
  - `GET /DRISHYATRAVELS/backend/api/packages/?limit=6&offset=0&category=Trekking&difficulty=Moderate`
  - Pagination via `limit`/`offset` query params
  - Category & difficulty filters via query params

- **Package Detail** (`public/package.html` + `package-details.js`):
  - Reads `?id=` from URL
  - `GET /DRISHYATRAVELS/backend/api/packages/{id}` → Full package with relations

### Admin Panel → PHP API
- `admin/index.html` + `admin/js/script.js`:
  - `GET /DRISHYATRAVELS/backend/api/packages/` → List all (dashboard + table)
  - `POST /DRISHYATRAVELS/backend/api/packages/` → Create package
  - `GET /DRISHYATRAVELS/backend/api/packages/{id}` → Load for edit
  - `PUT /DRISHYATRAVELS/backend/api/packages/{id}` → Update package
  - `DELETE /DRISHYATRAVELS/backend/api/packages/{id}` → Delete package

### Django Trip Planner
- `POST /api/trip-planner/` (served by Django on port 8000)
- Request: `{style, days, month, people}`
- Response: `{route, style, days, month, people}`

---

## API Endpoints Summary

### PHP API (`/DRISHYATRAVELS/backend/api/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/` | Health check + endpoint listing |
| `GET` | `/api/packages` | List packages (filters: status, category, difficulty, featured, limit, offset) |
| `POST` | `/api/packages` | Create package (with relations) |
| `GET` | `/api/packages/{id}` | Get package with all relations |
| `PUT` | `/api/packages/{id}` | Full update package |
| `PATCH` | `/api/packages/{id}` | Partial update package |
| `DELETE` | `/api/packages/{id}` | Delete package (cascades) |
| `GET` | `/api/packages/{id}/itinerary` | Get itinerary days |
| `GET` | `/api/packages/{id}/highlights` | Get highlights |
| `GET` | `/api/packages/{id}/inclusions` | Get inclusions |
| `GET` | `/api/packages/{id}/exclusions` | Get exclusions |
| `GET` | `/api/packages/{id}/gallery` | Get gallery images |
| `GET` | `/api/packages/{id}/faqs` | Get FAQs |

### Django API (`/api/trip-planner/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/trip-planner/` | Generate route suggestion |

### Response Format (PHP API)
```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "total": 4, "limit": 50, "offset": 0 }
}

// Error
{
  "success": false,
  "error": "Validation failed",
  "errors": { "field": "message" }
}
```

---

## Quick Start (XAMPP)

### Prerequisites
- XAMPP (Apache + MySQL/MariaDB + PHP 8+)
- Python 3.11+ (for Django trip planner)
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/KHATRI-SAMIP/DRISHYATRAVELS.git
cd DRISHYATRAVELS
```

### 2. Configure Database (MySQL)
```bash
# Start XAMPP Control Panel → Start Apache & MySQL
# Create database
mysql -u root -e "CREATE DATABASE drishya_travels CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import PostgreSQL schema (adapted for MySQL)
# Note: docs/database/001_initial_schema.sql is PostgreSQL syntax
# You'll need to adapt types: TEXT→VARCHAR/TEXT, BIGSERIAL→BIGINT AUTO_INCREMENT,
# TIMESTAMPTZ→TIMESTAMP, ON CONFLICT→ON DUPLICATE KEY UPDATE
```

### 3. Configure PHP Backend
```bash
# Copy environment template (create if needed)
cp backend/config/.env.example backend/config/.env 2>/dev/null || cat > backend/config/.env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_NAME=drishya_travels
DB_USER=root
DB_PASS=
CORS_ALLOW_ORIGIN=*
APP_DEBUG=true
EOF

# Verify Apache serves from project root
# In httpd.conf: DocumentRoot "C:/xampp/htdocs/DRISHYATRAVELS"
# Or access via http://localhost/DRISHYATRAVELS/public/
```

### 4. Run Django Trip Planner (Optional)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
# Runs at http://localhost:8000/api/trip-planner/
```

### 5. Access the Site
| URL | Description |
|-----|-------------|
| `http://localhost/DRISHYATRAVELS/public/` | Public website |
| `http://localhost/DRISHYATRAVELS/admin/` | Admin panel |
| `http://localhost/DRISHYATRAVELS/backend/api/` | PHP API root |
| `http://localhost:8000/api/trip-planner/` | Django trip planner |

---

## Database Notes

### PostgreSQL Schema (Reference)
`docs/database/001_initial_schema.sql` contains the **canonical schema** designed for Supabase PostgreSQL:
- 7 tables: `packages`, `itinerary_days`, `package_highlights`, `package_inclusions`, `package_exclusions`, `package_gallery`, `package_faqs`
- Proper FKs with `ON DELETE CASCADE`
- Indexes on all FK columns + status/category/difficulty
- 4 seed packages matching `public/data/packages.js`

### PHP/MySQL Reality
- `backend/config/database.php` connects to **MySQL/MariaDB** (XAMPP default)
- `Package.php` model uses backtick-quoted identifiers and MySQL-specific syntax
- **Schema mismatch**: The PostgreSQL schema must be translated to MySQL:
  - `TEXT PRIMARY KEY` → `VARCHAR(100) PRIMARY KEY`
  - `BIGINT GENERATED ALWAYS AS IDENTITY` → `BIGINT AUTO_INCREMENT`
  - `TIMESTAMPTZ` → `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - `ON CONFLICT DO UPDATE` → `ON DUPLICATE KEY UPDATE`

### Django Database
- Development: SQLite (`backend/db.sqlite3`)
- Production: PostgreSQL (configured via `DATABASES` in `settings.py` with `psycopg`)

---

## Deployment (NestNepal Reference)

The PHP API contains deployment path patterns referencing **NestNepal** hosting:

```php
// In [id].php, itinerary.php, highlights.php, etc.
$basePaths = [
    '/DRISHYATRAVELS/backend/api/packages/',     // Local XAMPP
    '/api/packages/',                             // Root deployment
    '/drishya-travels-backend/api/packages/',    // NestNepal subdirectory
];
```

### Production Checklist
1. **Web Server**: Apache/Nginx with PHP-FPM
2. **Document Root**: Point to `public/` (not project root)
3. **Database**: MySQL/MariaDB with schema imported
4. **Environment**: Set `.env` with production credentials
5. **CORS**: Configure `CORS_ALLOW_ORIGIN` to your domain
6. **Django**: Run via Gunicorn + Nginx reverse proxy on separate port
7. **Static Files**: Served directly by web server (no Django collectstatic needed for frontend)

### NestNepal Specific
- Subdirectory deployment: `/drishya-travels-backend/`
- API base path becomes `/drishya-travels-backend/api/`
- Frontend fetch URLs in `main.js`, `packages.js`, `admin/js/script.js` use hardcoded `/DRISHYATRAVELS/backend/api/` — **update these for production**

---

## Development Notes

### Adding a Package via Admin
1. Open `http://localhost/DRISHYATRAVELS/admin/`
2. Navigate to "Add Package"
3. Fill all sections (Basic Info, Description, Image, Itinerary, Details, Highlights, Inclusions, Exclusions, Gallery, FAQs)
4. Click "Save Package →"
5. Package is POSTed to PHP API and stored in MySQL

### Static Fallback Data
`public/data/packages.js` contains 4 hardcoded packages used when API is unavailable. Keep in sync with database.

### Security
- **No authentication** on admin panel or API
- CORS allows all origins (`*`) by default
- Input validation via `validation.php`
- XSS prevention via `escapeHTML` in all frontend JS
- **Not production-ready** without auth, rate limiting, HTTPS

---

## Known Limitations

1. **No authentication** on admin panel or API endpoints
2. **Dual database configs** (PostgreSQL schema vs MySQL runtime)
3. **Hardcoded API paths** in frontend JS (`/DRISHYATRAVELS/backend/api/`)
4. **Django models empty** — trip planner doesn't persist data
5. **No tests** for PHP or Django code
6. **No CI/CD** pipeline configured

---

## License

MIT License — Built for Nepal.