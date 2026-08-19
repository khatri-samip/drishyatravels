# Drishya Travels Database Documentation

## Database Architecture

This PostgreSQL database (hosted on Supabase) stores all travel package data for Drishya Travels. The schema is designed for a **normalized relational structure** with a central `packages` table and supporting child tables for each type of package metadata.

### Table Relationships

```
packages (1) ─────< (N) itinerary_days
packages (1) ─────< (N) package_highlights
packages (1) ─────< (N) package_inclusions
packages (1) ─────< (N) package_exclusions
packages (1) ─────< (N) package_gallery
packages (1) ─────< (N) package_faqs
```

All child tables reference `packages(id)` with `ON DELETE CASCADE`, so deleting a package automatically removes all associated data.

### Tables Overview

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `packages` | Core package metadata | `id` (PK, TEXT), `title`, `destination`, `duration`, `price`, `currency`, `difficulty`, `status`, `hero_image_url`, `description` |
| `itinerary_days` | Day-by-day itinerary | `id` (PK, BIGSERIAL), `package_id` (FK), `day_number`, `title`, `description` |
| `package_highlights` | Marketing highlights | `id` (PK, BIGSERIAL), `package_id` (FK), `highlight`, `display_order` |
| `package_inclusions` | What's included in price | `id` (PK, BIGSERIAL), `package_id` (FK), `inclusion`, `display_order` |
| `package_exclusions` | What's NOT included | `id` (PK, BIGSERIAL), `package_id` (FK), `exclusion`, `display_order` |
| `package_gallery` | Image URLs for carousel | `id` (PK, BIGSERIAL), `package_id` (FK), `image_url`, `display_order` |
| `package_faqs` | Frequently asked questions | `id` (PK, BIGSERIAL), `package_id` (FK), `question`, `answer`, `display_order` |

---

## Migration Purpose

This migration (`001_initial_schema.sql`) performs two functions:

1. **Creates the complete table schema** with proper constraints, indexes, and foreign keys
2. **Seeds the initial 4 packages** from the existing frontend data (`public/data/packages.js`)

### Seeded Packages

| Package ID | Title | Price | Currency | Difficulty | Status |
|------------|-------|-------|----------|------------|--------|
| `everest-base-camp` | Everest Base Camp Trek | 1725.00 | USD | Challenging | published |
| `mardi-trek` | Mardi Trek | 57400.00 | NPR | Moderate | published |
| `rani-mahal` | The Taj of Nepal: Rani Mahal | 11500.00 | NPR | Easy | published |
| `manang` | Explore the District after Himalayas: Manang | 16500.00 | NPR | Moderate | published |

---

## How to Run the Migration in Supabase

### Option 1: Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `docs/database/001_initial_schema.sql`
5. Paste into the editor
6. Click **Run** (or press `Ctrl+Enter`)

### Option 2: Supabase CLI

```bash
# If using Supabase CLI locally
supabase db push

# Or apply a specific migration file
supabase migration up --include-all
```

### Option 3: psql Direct Connection

```bash
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" -f docs/database/001_initial_schema.sql
```

---

## Idempotency

The migration is **idempotent** — running it multiple times is safe:

- Tables use `CREATE TABLE IF NOT EXISTS`
- Indexes use `CREATE INDEX IF NOT EXISTS`
- Package inserts use `ON CONFLICT (id) DO UPDATE SET ...`
- Child table inserts use `ON CONFLICT DO NOTHING` (or `ON CONFLICT (package_id, day_number) DO UPDATE` for itinerary)

Re-running will update existing packages to match the seed data without creating duplicates.

---

## Data Integrity & Constraints

### Check Constraints
- `packages.price >= 0`
- `packages.status IN ('draft', 'published', 'archived')`
- `itinerary_days.day_number > 0`

### Unique Constraints
- `packages.id` (Primary Key)
- `itinerary_days (package_id, day_number)` — one itinerary entry per day per package

### Foreign Keys
All child tables reference `packages(id)` with `ON DELETE CASCADE`

### Indexes
- `idx_packages_status` — for filtering by status
- `idx_packages_category` — for category filtering (future use)
- `idx_packages_difficulty` — for difficulty filtering
- `idx_*_package_id` on each child table — for JOIN performance

---

## Price Storage Format

**Important**: Prices are stored as **numeric values** (not display strings):

| Source Format | Stored As |
|---------------|-----------|
| `"USD 1,725"` | `price = 1725.00`, `currency = 'USD'` |
| `"NPR 57,400"` | `price = 57400.00`, `currency = 'NPR'` |

The original `priceDetails` string is preserved in the `price_details` column for display purposes.

---

## Future: Django Backend Integration

This database is designed to be accessed by a **Django backend** (to be implemented later). Django will connect to this PostgreSQL database using standard Django ORM models mapped to these tables.

### Django Model Mapping (Planned)

```python
# Example Django models (not yet implemented)
class Package(models.Model):
    id = models.CharField(max_length=100, primary_key=True)  # slug
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, null=True, blank=True)
    destination = models.CharField(max_length=255)
    duration = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    price_details = models.TextField(null=True, blank=True)
    difficulty = models.CharField(max_length=50)
    # ... other fields
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived')
    ], default='draft')
    
    class Meta:
        db_table = 'packages'
```

---

## Frontend MUST NOT Connect Directly to Supabase

### ❌ Forbidden
- Direct Supabase client (`createClient`) in browser/frontend code
- Direct PostgreSQL connections from frontend
- Exposing Supabase anon/service keys in frontend code

### ✅ Required Architecture
```
Frontend (React/Vue/Next.js) 
    │
    ▼ HTTPS API calls
Django REST API / GraphQL Endpoint
    │
    ▼ Django ORM / Raw SQL
Supabase PostgreSQL (this database)
```

### Why?
1. **Security**: Database credentials and RLS policies belong server-side
2. **Business Logic**: Pricing rules, availability, booking logic in Django
3. **Caching**: Django can cache expensive queries
4. **Rate Limiting**: API gateway protects database from abuse
5. **Schema Evolution**: Backend can version APIs independently of database

---

## Verification Queries

After running the migration, verify data integrity:

```sql
-- Verify 4 packages exist with correct status
SELECT id, title, price, currency, status 
FROM packages 
WHERE id IN ('everest-base-camp', 'mardi-trek', 'rani-mahal', 'manang');

-- Count child records per package
SELECT 
    p.id,
    p.title,
    COUNT(DISTINCT i.id) as itinerary_days,
    COUNT(DISTINCT h.id) as highlights,
    COUNT(DISTINCT inc.id) as inclusions,
    COUNT(DISTINCT exc.id) as exclusions,
    COUNT(DISTINCT g.id) as gallery_images,
    COUNT(DISTINCT f.id) as faqs
FROM packages p
LEFT JOIN itinerary_days i ON i.package_id = p.id
LEFT JOIN package_highlights h ON h.package_id = p.id
LEFT JOIN package_inclusions inc ON inc.package_id = p.id
LEFT JOIN package_exclusions exc ON exc.package_id = p.id
LEFT JOIN package_gallery g ON g.package_id = p.id
LEFT JOIN package_faqs f ON f.package_id = p.id
WHERE p.id IN ('everest-base-camp', 'mardi-trek', 'rani-mahal', 'manang')
GROUP BY p.id, p.title;

-- Verify no orphaned child records
SELECT 'itinerary_days' as table_name, COUNT(*) FROM itinerary_days 
WHERE package_id NOT IN (SELECT id FROM packages)
UNION ALL
SELECT 'package_highlights', COUNT(*) FROM package_highlights 
WHERE package_id NOT IN (SELECT id FROM packages)
UNION ALL
SELECT 'package_inclusions', COUNT(*) FROM package_inclusions 
WHERE package_id NOT IN (SELECT id FROM packages)
UNION ALL
SELECT 'package_exclusions', COUNT(*) FROM package_exclusions 
WHERE package_id NOT IN (SELECT id FROM packages)
UNION ALL
SELECT 'package_gallery', COUNT(*) FROM package_gallery 
WHERE package_id NOT IN (SELECT id FROM packages)
UNION ALL
SELECT 'package_faqs', COUNT(*) FROM package_faqs 
WHERE package_id NOT IN (SELECT id FROM packages);
```

All counts should match the source data in `public/data/packages.js`.

---

## File Locations

- **Migration SQL**: `docs/database/001_initial_schema.sql`
- **This Documentation**: `docs/database/README.md`

---

## Next Steps

1. Run the migration in Supabase
2. Verify using the queries above
3. Implement Django backend with models mapped to these tables
4. Build Django REST API endpoints for package CRUD operations
5. Update frontend to consume Django API instead of static JS file