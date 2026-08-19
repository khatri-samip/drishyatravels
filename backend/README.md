# Drishya Travels - PHP Backend

A lightweight PHP backend for Drishya Travels, migrated from Django. Uses plain PHP with PDO for MySQL/MariaDB database access via XAMPP.

## Architecture Overview

```
Frontend (static HTML/JS) → PHP API (this backend) → MySQL/MariaDB (XAMPP)
```

## Directory Structure

```
backend/
├── api/                    # API endpoints
│   ├── index.php           # API root / health check
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
│   └── database.php        # PDO connection & helpers
├── database/
│   └── schema.sql          # MySQL schema + seed data
├── middleware/
│   └── cors.php            # CORS headers
├── models/
│   └── Package.php         # Package model with CRUD & relations
├── utils/
│   ├── response.php        # JSON response helpers
│   └── validation.php      # Input validation helpers
├── .env                    # Environment configuration
└── README.md               # This file
```

## Requirements

- **XAMPP** (includes Apache + MySQL/MariaDB + PHP)
- PHP 8.0+ (XAMPP 8.x+ recommended)
- MySQL 8.0+ or MariaDB 10.2+
- `mod_rewrite` enabled in Apache

## Quick Start

### 1. Start XAMPP Services
Open XAMPP Control Panel and start:
- **Apache**
- **MySQL**

### 2. Create Database
```bash
# Option A: Via phpMyAdmin
# 1. Open http://localhost/phpmyadmin
# 2. Click "New" → Database name: `drishya_travels` → Create
# 3. Import backend/database/schema.sql

# Option B: Via MySQL CLI
mysql -u root -p < backend/database/schema.sql
```

### 3. Configure Environment
```bash
# Copy and edit .env if needed (defaults work for standard XAMPP)
cp backend/.env backend/.env.local
# Edit backend/.env.local with your settings
```

**Default .env (works with standard XAMPP):**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=drishya_travels
DB_USER=root
DB_PASS=
APP_DEBUG=true
CORS_ALLOW_ORIGIN=*
```

### 4. Configure Apache VirtualHost (Recommended)

**Option A: Quick alias (for testing)**
Add to `httpd-vhosts.conf` or Apache config:
```apache
Alias /drishya-api "C:/Users/Suyog Pandey/Desktop/DRISHYATRAVELS/backend/api"
<Directory "C:/Users/Suyog Pandey/Desktop/DRISHYATRAVELS/backend/api">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```
Then access: `http://localhost/drishya-api/`

**Option B: VirtualHost (production-like)**
```apache
<VirtualHost *:80>
    ServerName drishya-api.local
    DocumentRoot "C:/Users/Suyog Pandey/Desktop/DRISHYATRAVELS/backend/api"
    <Directory "C:/Users/Suyog Pandey/Desktop/DRISHYATRAVELS/backend/api">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    ErrorLog "logs/drishya-api-error.log"
    CustomLog "logs/drishya-api-access.log" common
</VirtualHost>
```
Add to Windows hosts file (`C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1 drishya-api.local
```
Then access: `http://drishya-api.local/`

### 5. Verify Installation
```bash
# Test API health
curl http://localhost/drishya-api/

# Test trip planner
curl -X POST http://localhost/drishya-api/trip-planner/ \
  -H "Content-Type: application/json" \
  -d '{"style":"Adventure","days":"7","month":"October","people":2}'

# Test packages list
curl http://localhost/drishya-api/packages
```

## API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | API info and endpoint listing |

### Trip Planner (Migrated from Django)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trip-planner/` | Get travel route by style |

**Request:**
```json
{
  "style": "Adventure|Culture|Wildlife|Relaxed",
  "days": "7",
  "month": "October",
  "people": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "route": "Kathmandu → Pokhara → Annapurna region",
    "style": "Adventure",
    "days": "7",
    "month": "October",
    "people": 2
  }
}
```

### Packages CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages` | List packages (with filters) |
| POST | `/api/packages` | Create new package |
| GET | `/api/packages/{id}` | Get package with all relations |
| PUT | `/api/packages/{id}` | Full update package |
| PATCH | `/api/packages/{id}` | Partial update package |
| DELETE | `/api/packages/{id}` | Delete package |

#### List Packages Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter: `draft`, `published`, `archived` |
| `category` | string | - | Filter by category |
| `difficulty` | string | - | Filter: `Easy`, `Moderate`, `Challenging` |
| `limit` | int | 50 | Max results (1-100) |
| `offset` | int | 0 | Pagination offset |

**Example:**
```
GET /api/packages?status=published&limit=10
```

#### Package Relations (Read-only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages/{id}/itinerary` | Get itinerary days |
| GET | `/api/packages/{id}/highlights` | Get highlights |
| GET | `/api/packages/{id}/inclusions` | Get inclusions |
| GET | `/api/packages/{id}/exclusions` | Get exclusions |
| GET | `/api/packages/{id}/gallery` | Get gallery images |
| GET | `/api/packages/{id}/faqs` | Get FAQs |

## Database Schema

### Tables
- `packages` - Core package data
- `itinerary_days` - Day-by-day itinerary
- `package_highlights` - Marketing highlights
- `package_inclusions` - What's included
- `package_exclusions` - What's excluded
- `package_gallery` - Image URLs
- `package_faqs` - FAQs

### Key Features
- **Foreign Keys**: All child tables reference `packages.id` with `ON DELETE CASCADE`
- **Indexes**: On all foreign keys and filterable columns
- **Constraints**: CHECK constraints for enums, positive values
- **Idempotent Seed**: `ON DUPLICATE KEY UPDATE` for safe re-runs

### Seed Data (4 Packages)
1. `everest-base-camp` - Everest Base Camp Trek (USD 1,725)
2. `mardi-trek` - Mardi Trek (NPR 57,400)
3. `rani-mahal` - The Taj of Nepal: Rani Mahal (NPR 11,500)
4. `manang` - Explore the District after Himalayas: Manang (NPR 16,500)

## Frontend Integration

### Current Frontend Expects
- Trip planner: `POST http://127.0.0.1:8000/api/trip-planner/`
- Package data: Currently reads from `public/data/packages.js` (static)

### To Connect Frontend to PHP Backend

Update `public/js/main.js`:
```javascript
// Change from:
const response = await fetch("http://127.0.0.1:8000/api/trip-planner/", ...);

// To your PHP API URL:
const response = await fetch("http://localhost/drishya-api/trip-planner/", ...);
```

For packages, the frontend would need to be updated to fetch from:
- `GET /api/packages` - for listing
- `GET /api/packages/{id}` - for detail page

## Development

### Running Tests
```bash
# Start XAMPP services first

# Test database connection
php -r "require 'config/database.php'; \$pdo = getDatabaseConnection(); echo 'Connected!';"

# Test API endpoints manually with curl or Postman
```

### Adding New Packages
```bash
curl -X POST http://localhost/drishya-api/packages \
  -H "Content-Type: application/json" \
  -d '{
    "id": "new-package",
    "title": "New Package",
    "category": "Trekking",
    "destination": "Nepal",
    "duration": "5 days",
    "price": 1000.00,
    "currency": "USD",
    "difficulty": "Moderate",
    "short_description": "Short description",
    "description": "Full description",
    "hero_image_url": "https://example.com/image.jpg",
    "status": "published",
    "itinerary": [{"day_number": 1, "title": "Day 1", "description": "..."}],
    "highlights": ["Highlight 1", "Highlight 2"],
    "inclusions": ["Inclusion 1"],
    "exclusions": ["Exclusion 1"],
    "gallery": ["https://example.com/img1.jpg"],
    "faqs": [["Question?", "Answer."]]
  }'
```

## Migration Notes

### From Django
| Django Feature | PHP Equivalent |
|----------------|----------------|
| `config.urls.home` | `api/index.php` |
| `trip_planner.views.plan_trip` | `api/trip-planner/index.php` |
| Django ORM | PDO + Package model |
| Django REST Framework | Plain PHP JSON responses |
| `corsheaders` | `middleware/cors.php` |
| SQLite | MySQL/MariaDB |
| `models.py` (empty) | `models/Package.php` (full implementation) |

### PostgreSQL → MySQL Changes
- `TEXT` → `TEXT`/`LONGTEXT`
- `NUMERIC(12,2)` → `DECIMAL(12,2)`
- `TIMESTAMPTZ` → `TIMESTAMP` (auto UTC conversion)
- `BIGINT GENERATED AS IDENTITY` → `BIGINT AUTO_INCREMENT`
- `ON CONFLICT` → `ON DUPLICATE KEY UPDATE`
- `CHECK` constraints: MySQL 8.0.16+ required

## Security Notes

1. **Never expose `.env`** - Already blocked in `.htaccess`
2. **Use prepared statements** - All queries use PDO prepared statements
3. **Validate input** - All endpoints use `validation.php`
4. **CORS** - Configure `CORS_ALLOW_ORIGIN` for production
5. **Error details** - Only shown when `APP_DEBUG=true`

## Troubleshooting

### "Database connection failed"
- Verify MySQL is running in XAMPP
- Check `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` in `.env`
- Ensure database `drishya_travels` exists

### "404 Not Found" on API routes
- Ensure `mod_rewrite` is enabled in Apache
- Check `.htaccess` is in `backend/api/`
- Verify `AllowOverride All` in VirtualHost/Directory config

### CORS Errors
- Set `CORS_ALLOW_ORIGIN` to your frontend origin (e.g., `http://localhost:5500`)
- Or use `*` for development only

### "Package not found" on existing IDs
- Verify seed data was imported: `SELECT * FROM packages;`
- Check case sensitivity: IDs are case-sensitive in MySQL

## License

Part of Drishya Travels project.