# Hosting on NestNepal

Deployment guide for Drishya Travels on NestNepal shared/managed hosting.

---

## NestNepal Hosting Capabilities

NestNepal is a Nepal-based web hosting provider (nestnepal.com) offering:
- **Shared Hosting**: Apache + PHP (typically 8.x), MySQL/MariaDB databases
- **VPS/Cloud**: Full root access, can run Nginx, Python/Django, Gunicorn, Docker
- **Subdirectory Deployment**: One account can host multiple projects in subdirectories (`/project-a/`, `/project-b/`)
- **SSL**: Free Let's Encrypt certificates
- **cPanel/Plesk**: Standard control panels for file management, database creation, cron jobs

**Verified deployment pattern** (from `backend/api/packages/[id].php:25-28`):
```php
$basePaths = [
    '/DRISHYATRAVELS/backend/api/packages/',      // Local XAMPP
    '/api/packages/',                              // Root deployment
    '/drishya-travels-backend/api/packages/',     // NestNepal subdirectory
];
```

The PHP backend already anticipates NestNepal subdirectory deployment with `/drishya-travels-backend/`.

---

## Pre-Deployment Checklist

- [ ] **Database:** Create MySQL database in NestNepal control panel
- [ ] **Schema:** Import MySQL-specific schema (not PostgreSQL!)
- [ ] **Environment:** Create production `.env` with live DB credentials
- [ ] **CORS:** Set `CORS_ALLOW_ORIGIN` to your production domain
- [ ] **Frontend paths:** Update all hardcoded `/DRISHYATRAVELS/backend/api/` URLs
- [ ] **Django (optional):** Decide whether to deploy trip planner or port to PHP
- [ ] **SSL:** Enable Let's Encrypt for all domains/subdomains
- [ ] **File permissions:** `755` directories, `644` files, `.env` protected

---

## Step-by-Step Deployment

### 1. Upload Files

Via cPanel File Manager or FTP/SFTP:

```
/public_html/
├── drishya-travels-backend/          # Your subdirectory on NestNepal
│   ├── public/                       # Document root (rename to public_html or point here)
│   │   ├── index.html
│   │   ├── packages.html
│   │   ├── package.html
│   │   ├── css/
│   │   ├── js/
│   │   └── data/
│   ├── admin/
│   ├── backend/
│   │   ├── api/
│   │   ├── config/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── utils/
│   │   └── .env                      # Production env
│   └── .htaccess                     # Apache config
```

### 2. Configure Database

In NestNepal control panel:
1. Create MySQL database (e.g., `user_drishya`)
2. Create database user with full privileges
3. Import schema:

```bash
# Via phpMyAdmin (recommended for shared hosting)
# 1. Open phpMyAdmin from control panel
# 2. Select your database
# 3. Import → Choose backend/database/schema_mysql.sql
# 4. Click "Go"

# Via CLI (VPS only)
mysql -u db_user -p db_name < backend/database/schema_mysql.sql
```

**⚠️ Important:** Use the **MySQL-specific** schema, not `docs/database/001_initial_schema.sql` (PostgreSQL).

### 3. Production `.env`

Create `backend/config/.env` (or `/drishya-travels-backend/backend/config/.env`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASS=your_secure_password
CORS_ALLOW_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
APP_DEBUG=false
```

**Security:** Ensure `.htaccess` blocks direct access to `.env` (already configured in `backend/.htaccess`).

### 4. Update Hardcoded API Paths

Before deploying, update all 9 frontend fetch calls (see CODE_QUALITY.md #3):

| File | Change from | Change to |
|------|-------------|-----------|
| `public/js/main.js:63` | `/DRISHYATRAVELS/backend/api/trip-planner/` | `/drishya-travels-backend/api/trip-planner/` |
| `public/js/main.js:145` | `/DRISHYATRAVELS/backend/api/packages/?featured=1` | `/drishya-travels-backend/api/packages/?featured=1` |
| `public/js/main.js:206` | `/DRISHYATRAVELS/backend/api/packages/` | `/drishya-travels-backend/api/packages/` |
| `public/js/packages.js:41` | `/DRISHYATRAVELS/backend/api/packages/` | `/drishya-travels-backend/api/packages/` |
| `public/js/package-details.js:31` | `/DRISHYATRAVELS/backend/api/packages/{id}` | `/drishya-travels-backend/api/packages/{id}` |
| `admin/js/script.js:76` | `/DRISHYATRAVELS/backend/api/packages/` | `/drishya-travels-backend/api/packages/` |
| `admin/js/script.js:209` | `/DRISHYATRAVELS/backend/api/packages/` | `/drishya-travels-backend/api/packages/` |
| `admin/js/script.js:267` | `/DRISHYATRAVELS/backend/api/packages/{id}` | `/drishya-travels-backend/api/packages/{id}` |
| `admin/js/script.js:291` | `/DRISHYATRAVELS/backend/api/packages/{id}` | `/drishya-travels-backend/api/packages/{id}` |

**Better approach:** Use runtime `API_BASE` detection (see CODE_QUALITY.md #3 Quick Win).

### 5. Apache Configuration

Create `.htaccess` in document root (`public/` or `drishya-travels-backend/public/`):

```apache
# Enable rewrite engine
RewriteEngine On

# Handle API routing (if not already in backend/api/.htaccess)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ /drishya-travels-backend/backend/api/$1 [L]

# Security headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"

# Protect .env
<Files .env>
    Order Allow,Deny
    Deny from all
</Files>

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2)$">
    Header set Cache-Control "max-age=31536000, public"
</Files>
```

### 6. SSL/HTTPS Setup

In NestNepal control panel:
1. Navigate to SSL/TLS → Let's Encrypt
2. Select your domain → Issue certificate
3. Force HTTPS redirect in `.htaccess`:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 7. Django Trip Planner (Optional)

If deploying the Django trip planner on NestNepal VPS:

```bash
# On VPS
cd /var/www/drishya-travels-backend/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt gunicorn

# Configure systemd service or supervisor
# /etc/systemd/system/drishya-trip-planner.service
[Unit]
Description=Drishya Trip Planner
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/drishya-travels-backend/backend
ExecStart=/var/www/drishya-travels-backend/backend/venv/bin/gunicorn trip_planner.wsgi:application --bind 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target

# Nginx reverse proxy
location /api/trip-planner/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Simpler alternative:** Port the trip planner to PHP (it's just a dictionary lookup) and skip Django entirely.

---

## Database Schema Migration: PostgreSQL → MySQL

The canonical schema in `docs/database/001_initial_schema.sql` is PostgreSQL. For NestNepal MySQL, translate:

| PostgreSQL | MySQL/MariaDB |
|------------|---------------|
| `TEXT PRIMARY KEY` | `VARCHAR(100) PRIMARY KEY` |
| `TEXT` | `TEXT` (or `LONGTEXT` for large content) |
| `BIGINT GENERATED ALWAYS AS IDENTITY` | `BIGINT AUTO_INCREMENT` |
| `NUMERIC(12,2)` | `DECIMAL(12,2)` |
| `TIMESTAMPTZ` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` |
| `JSONB` | `JSON` (MySQL 5.7+) or `TEXT` |
| `ON CONFLICT (id) DO UPDATE` | `ON DUPLICATE KEY UPDATE` |
| `CHECK (price >= 0)` | `CHECK (price >= 0)` (MySQL 8.0.16+) |
| `CREATE INDEX ... USING btree` | `CREATE INDEX ...` (btree is default) |

**Full MySQL schema** should be created at `backend/database/schema_mysql.sql` (not yet present — TODO).

---

## Common Issues & Troubleshooting

### "500 Internal Server Error" on API calls
- Check PHP error log in NestNepal control panel
- Verify `.env` exists and is readable by web server
- Confirm `mod_rewrite` is enabled

### "404 Not Found" on `/api/packages/`
- Verify `.htaccess` is uploaded to `backend/api/`
- Check `AllowOverride All` is set in Apache config
- Confirm `DocumentRoot` points to correct directory

### "CORS policy blocked" in browser console
- Set `CORS_ALLOW_ORIGIN` to exact frontend domain (no trailing slash)
- Verify request includes `Content-Type: application/json` header

### "Database connection failed"
- Confirm DB credentials in `.env` match NestNepal database user
- Verify database user has privileges on the database
- Check `DB_HOST` is correct (often `localhost` or `127.0.0.1`)

### Static assets (CSS/JS) not loading
- Check file permissions (644 for files, 755 for directories)
- Verify paths in HTML are relative, not absolute
- Clear browser cache

---

## Post-Deployment Verification

```bash
# Test API health
curl https://yourdomain.com/drishya-travels-backend/api/

# Test packages list
curl https://yourdomain.com/drishya-travels-backend/api/packages

# Test trip planner (if Django deployed)
curl -X POST https://yourdomain.com/api/trip-planner/ \
  -H "Content-Type: application/json" \
  -d '{"style":"Adventure","days":"7","month":"October","people":2}'

# Verify frontend loads
curl -I https://yourdomain.com/drishya-travels-backend/public/
```

---

## Security Checklist (Before Going Live)

- [ ] `APP_DEBUG=false` in `.env`
- [ ] `CORS_ALLOW_ORIGIN` restricted to production domain
- [ ] `.env` not accessible via web (403 Forbidden)
- [ ] SSL/HTTPS enforced (301 redirect)
- [ ] Admin panel protected by authentication (currently missing — see TODO)
- [ ] Database user has minimal required privileges
- [ ] File upload directory outside web root (if implemented)
- [ ] Regular database backups configured in NestNepal control panel

---

*Deployment guide updated for NestNepal shared/VPS hosting. Verify against your specific NestNepal plan capabilities.*