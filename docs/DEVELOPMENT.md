# Development Guidelines

When contributing to Drishya Travels, follow these strict guidelines to maintain codebase health.

## Technology Stack

### Frontend
- **HTML**: Semantic HTML5.
- **CSS**: Vanilla CSS. Rely on `:root` variables in `public/css/global.css` for colors, spacing, and typography. Do not introduce Tailwind or preprocessors.
- **JavaScript**: Vanilla ES6+. Do not introduce React or other frameworks.

### Backend (PHP/MySQL)
- **PHP**: 8.0+ with PDO for database access
- **Database**: MySQL 8.0+ or MariaDB 10.2+ (via XAMPP)
- **Server**: Apache (via XAMPP), not Node.js

## JavaScript Patterns (Frontend)

- **Encapsulation**: Wrap logic within `DOMContentLoaded` event listeners or IIFEs to prevent global namespace pollution.
- **Event Listeners**: Prefer attaching event listeners in JavaScript (`addEventListener`) rather than using inline `onclick` attributes in HTML.
- **Security**: Always use the provided `escapeHTML` function (in `public/js/utils.js`) when inserting data directly into the DOM (via `innerHTML`) to prevent XSS.
- **API Calls**: Use `fetch` with proper error handling. API base path should be configurable (see TODO in `public/js/main.js` about hardcoded paths).

## CSS Patterns (Frontend)

- **Design Tokens**: All colors, spacing, and typography defined as CSS custom properties in `:root` within `public/css/global.css`.
- **No Preprocessors**: Plain CSS only — no Sass, Less, or Tailwind.
- **Component Styles**: Page-specific styles in dedicated files (`home.css`, `packages.css`, `package-details.css`) that import or extend global tokens.
- **Utility Classes**: Minimal, semantic utilities only (e.g., `.container`, `.btn`, `.section`).

## Backend Development Guidelines (PHP/MySQL)

### Requirements
- **XAMPP** (includes Apache + MySQL/MariaDB + PHP 8.x)
- PHP 8.0+
- MySQL 8.0+ or MariaDB 10.2+
- `mod_rewrite` enabled in Apache

### Project Structure
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
└── README.md               # Backend documentation
```

### Database
- **Schema**: `backend/database/schema.sql` (MySQL dialect)
- **Tables**: `packages`, `itinerary_days`, `package_highlights`, `package_inclusions`, `package_exclusions`, `package_gallery`, `package_faqs`
- **Relationships**: Foreign keys on all child tables referencing `packages.id` with `ON DELETE CASCADE`
- **Indexes**: On all foreign keys and filterable columns
- **Constraints**: CHECK constraints for enums, positive values (requires MySQL 8.0.16+)
- **Seed Data**: Idempotent via `ON DUPLICATE KEY UPDATE` — safe to re-run

### Configuration
- **Environment**: `backend/.env` (never committed — copy to `.env.local` and edit)
  ```env
  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=drishya_travels
  DB_USER=root
  DB_PASS=
  APP_DEBUG=true
  CORS_ALLOW_ORIGIN=*
  ```
- **Database Connection**: `backend/config/database.php` — returns a PDO instance via `getDatabaseConnection()`

### API Development
- **Routing**: Apache `mod_rewrite` via `.htaccess` in `backend/api/`
- **Responses**: JSON via `utils/response.php` helpers (`jsonResponse()`, `errorResponse()`)
- **Validation**: All input validated via `utils/validation.php`
- **CORS**: Handled by `middleware/cors.php` — configure `CORS_ALLOW_ORIGIN` for production
- **Error Details**: Only shown when `APP_DEBUG=true`

### Model (Package.php)
- **Location**: `backend/models/Package.php`
- **Methods**: `findAll()`, `findById()`, `create()`, `update()`, `delete()`, plus relation getters (`getItinerary()`, `getHighlights()`, etc.)
- **Pattern**: PDO prepared statements for all queries — no raw SQL concatenation

### Running the Backend
1. Start XAMPP Control Panel → Start **Apache** and **MySQL**
2. Create database `drishya_travels` and import `backend/database/schema.sql`
3. Configure `backend/.env` (or `.env.local`)
4. Configure Apache VirtualHost or Alias pointing to `backend/api/`
5. Test: `curl http://localhost/drishya-api/`

### Adding API Endpoints
1. Create new PHP file in `backend/api/` (or subdirectory)
2. Include `config/database.php`, `middleware/cors.php`, `utils/response.php`, `utils/validation.php`
3. Use `getDatabaseConnection()` for DB access
4. Return JSON via `jsonResponse()` / `errorResponse()`
5. Add rewrite rule to `.htaccess` if needed

### Security
- Never expose `.env` (blocked in `.htaccess`)
- Always use PDO prepared statements
- Validate all input via `validation.php`
- Configure `CORS_ALLOW_ORIGIN` for production (not `*`)
- Keep `APP_DEBUG=false` in production

## Frontend-Backend Integration

### Current State
- Trip planner: `POST /api/trip-planner/` (connected)
- Packages: Frontend reads from `public/data/packages.js` (static) — **needs migration to API**

### To Connect Packages to Backend
Update `public/js/main.js`, `public/js/packages.js`, `public/js/package-details.js`:
```javascript
// Change from static data:
import { packages } from '../data/packages.js';

// To API fetch:
const response = await fetch('/api/packages?status=published');
const { data: packages } = await response.json();
```

### API Base URL
Configure via a constant or environment variable to avoid hardcoded paths (current TODO in `main.js`).

## Development Workflow

### Frontend
- Open `public/index.html` via Live Server (VS Code) or serve via Apache
- No build step required

### Backend
```bash
# Start XAMPP services (Apache + MySQL)

# Test database connection
php -r "require 'backend/config/database.php'; \$pdo = getDatabaseConnection(); echo 'Connected!';"

# Test API endpoints with curl or Postman
curl http://localhost/drishya-api/
curl http://localhost/drishya-api/packages
```

### Database Changes
1. Edit `backend/database/schema.sql`
2. Re-import: `mysql -u root -p drishya_travels < backend/database/schema.sql`
3. Update `backend/models/Package.php` if schema changes affect model

## Code Quality

### Frontend
- ES6+ modules where beneficial
- Consistent 4-space indentation
- Semantic HTML5 elements
- Accessibility: ARIA labels, proper heading hierarchy, focus states

### Backend
- PHP 8.0+ syntax (match expressions, union types, attributes)
- PSR-12 coding style (4 spaces, braces on same line for control structures)
- Strict typing where practical (`declare(strict_types=1)`)
- Comments for complex logic; PHPDoc for public methods

## Troubleshooting

| Issue | Check |
|-------|-------|
| Database connection failed | MySQL running? `.env` correct? Database exists? |
| 404 on API routes | `mod_rewrite` enabled? `.htaccess` present? `AllowOverride All`? |
| CORS errors | `CORS_ALLOW_ORIGIN` matches frontend origin? |
| Package not found | Seed data imported? ID case-sensitive? |

## License

Part of Drishya Travels project.