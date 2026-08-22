# API Reference

Complete, verified field-level documentation for all API endpoints. All field names and response shapes verified against live PHP code.

---

## PHP Backend API

Base URL: `/DRISHYATRAVELS/backend/api/` (local) or `/drishya-travels-backend/api/` (NestNepal)

### Health Check

**GET** `/api/`

```json
{
  "success": true,
  "data": {
    "name": "Drishya Travels API",
    "version": "1.0",
    "endpoints": {
      "packages": "/api/packages",
      "trip_planner": "/api/trip-planner/"
    }
  }
}
```

---

### Trip Planner (PHP)

**POST** `/api/trip-planner/`

**Request:**
```json
{
  "style": "Adventure|Culture|Wildlife|Relaxed",
  "days": "7",
  "month": "October",
  "people": 2
}
```

**Response (200):**
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

**Error (422):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "style": "style must be one of: Adventure, Culture, Wildlife, Relaxed"
  }
}
```

---

### Packages — List

**GET** `/api/packages`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | — | Filter: `draft`, `published`, `archived` |
| `category` | string | — | Filter by category |
| `difficulty` | string | — | Filter: `Easy`, `Moderate`, `Challenging` |
| `featured` | string | — | `1` to filter featured packages only |
| `limit` | integer | 50 | Max results (1-100) |
| `offset` | integer | 0 | Pagination offset |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "everest-base-camp",
      "title": "Everest Base Camp Trek",
      "category": "Trekking",
      "destination": "Everest Region, Nepal",
      "duration": "15 Days",
      "price": 1725.00,
      "currency": "USD",
      "difficulty": "Challenging",
      "best_season": "March–May, September–November",
      "maximum_altitude": "5,545m",
      "starting_point": "Kathmandu",
      "ending_point": "Kathmandu",
      "package_type": "Himalayan Trekking",
      "short_description": "Trek to the base of the world's highest mountain...",
      "description": "Full detailed description...",
      "hero_image_url": "https://example.com/everest.jpg",
      "price_details": "Per person, including Government Tax",
      "status": "published",
      "is_featured": true,
      "created_at": "2024-01-15 10:30:00",
      "updated_at": "2024-01-15 10:30:00"
    }
  ],
  "meta": {
    "total": 4,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Packages — Create

**POST** `/api/packages`

**Request (all fields optional except required):**
```json
{
  "id": "new-package",
  "title": "New Package",
  "category": "Trekking",
  "destination": "Nepal",
  "duration": "5 days",
  "price": 1000.00,
  "currency": "USD",
  "difficulty": "Moderate",
  "best_season": "March–May",
  "maximum_altitude": "4000m",
  "starting_point": "Kathmandu",
  "ending_point": "Kathmandu",
  "package_type": "Trekking",
  "short_description": "Short description",
  "description": "Full description",
  "hero_image_url": "https://example.com/image.jpg",
  "price_details": "Per person",
  "status": "published",
  "is_featured": false,
  "itinerary": [
    {"day_number": 1, "title": "Day 1", "description": "Arrival", "altitude": "1300m", "distance": "5km", "duration": "3h"}
  ],
  "highlights": ["Highlight 1", "Highlight 2"],
  "inclusions": ["Inclusion 1"],
  "exclusions": ["Exclusion 1"],
  "gallery": ["https://example.com/img1.jpg"],
  "faqs": [["Question?", "Answer."]]
}
```

**Required fields:** `id`, `title`, `category`, `destination`, `duration`, `price`, `difficulty`, `short_description`, `description`

**Response (201):**
```json
{
  "success": true,
  "data": { ...package object... }
}
```
Headers: `Location: /api/packages/new-package`

---

### Packages — Get Single (with All Relations)

**GET** `/api/packages/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "everest-base-camp",
    "title": "Everest Base Camp Trek",
    "category": "Trekking",
    "destination": "Everest Region, Nepal",
    "duration": "15 Days",
    "price": 1725.00,
    "currency": "USD",
    "difficulty": "Challenging",
    "best_season": "March–May, September–November",
    "maximum_altitude": "5,545m",
    "starting_point": "Kathmandu",
    "ending_point": "Kathmandu",
    "package_type": "Himalayan Trekking",
    "short_description": "Trek to the base...",
    "description": "Full detailed description...",
    "hero_image_url": "https://example.com/everest.jpg",
    "price_details": "Per person, including Government Tax",
    "status": "published",
    "is_featured": true,
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:00",
    "itinerary": [
      {
        "id": 1,
        "package_id": "everest-base-camp",
        "day_number": 1,
        "title": "Arrival in Kathmandu",
        "description": "Arrive at Tribhuvan International Airport...",
        "altitude": "1,400m",
        "distance": "5 km",
        "duration": "30 min",
        "created_at": "2024-01-15 10:30:00"
      }
    ],
    "highlights": [
      {"id": 1, "package_id": "everest-base-camp", "highlight": "Views of Everest, Lhotse, Nuptse", "sort_order": 1}
    ],
    "inclusions": [
      {"id": 1, "package_id": "everest-base-camp", "inclusion": "Airport transfers", "sort_order": 1}
    ],
    "exclusions": [
      {"id": 1, "package_id": "everest-base-camp", "exclusion": "International flights", "sort_order": 1}
    ],
    "gallery": [
      {"id": 1, "package_id": "everest-base-camp", "image_url": "https://example.com/1.jpg", "caption": "Everest view", "sort_order": 1}
    ],
    "faqs": [
      {"id": 1, "package_id": "everest-base-camp", "question": "How difficult?", "answer": "Challenging", "sort_order": 1}
    ]
  }
}
```

---

### Packages — Full Update

**PUT** `/api/packages/{id}`

**Request:** Same as create (all fields required for full replace)

**Response (200):** Same as GET single

---

### Packages — Partial Update

**PATCH** `/api/packages/{id}`

**Request:** Any subset of package fields

**Response (200):** Same as GET single

---

### Packages — Delete

**DELETE** `/api/packages/{id}`

**Response (204):** No content

---

### Package Relations (Read-Only)

All return `{ "success": true, "data": [...] }`

| Endpoint | Response Array Item Shape |
|----------|---------------------------|
| `GET /api/packages/{id}/itinerary` | `{id, package_id, day_number, title, description, altitude, distance, duration, created_at}` |
| `GET /api/packages/{id}/highlights` | `{id, package_id, highlight, sort_order}` |
| `GET /api/packages/{id}/inclusions` | `{id, package_id, inclusion, sort_order}` |
| `GET /api/packages/{id}/exclusions` | `{id, package_id, exclusion, sort_order}` |
| `GET /api/packages/{id}/gallery` | `{id, package_id, image_url, caption, sort_order}` |
| `GET /api/packages/{id}/faqs` | `{id, package_id, question, answer, sort_order}` |

---

## Field Name Reference

### Package Core Fields

| API Field (snake_case) | JS Mapping (camelCase) | Type | Required | Notes |
|------------------------|------------------------|------|----------|-------|
| `id` | `id` | string (PK) | Yes | Max 100 chars |
| `title` | `title` | string | Yes | Max 255 |
| `category` | `category` | string | Yes | Trekking/Adventure/Heritage/Culture/Wildlife/Tours |
| `destination` | `destination` | string | Yes | |
| `duration` | `duration` | string | Yes | e.g., "15 Days" |
| `price` | `price` | decimal | Yes | ≥ 0 |
| `currency` | `currency` | string | No | USD/NPR/EUR/GBP/INR (default: USD) |
| `difficulty` | `difficulty` | string | Yes | Easy/Moderate/Challenging |
| `best_season` | `bestSeason` | string | No | |
| `maximum_altitude` | `maxAltitude` | string | No | |
| `starting_point` | `startPoint` | string | No | |
| `ending_point` | `endPoint` | string | No | |
| `package_type` | `packageType` | string | No | |
| `short_description` | `shortDescription` | string | Yes | |
| `description` | `description` | text | Yes | Full description |
| `hero_image_url` | `heroImageUrl` | string (URL) | Yes | Valid URL |
| `price_details` | `priceDetails` | string | No | |
| `status` | `status` | string | No | draft/published/archived (default: draft) |
| `is_featured` | `isFeatured` | boolean | No | default: false |
| `created_at` | `createdAt` | timestamp | Auto | |
| `updated_at` | `updatedAt` | timestamp | Auto | |

### Itinerary Day

| Field | Type | Notes |
|-------|------|-------|
| `id` | bigint | Auto |
| `package_id` | string | FK |
| `day_number` | integer | 1, 2, 3... |
| `title` | string | |
| `description` | text | |
| `altitude` | string | e.g., "3,440m" |
| `distance` | string | e.g., "10 km" |
| `duration` | string | e.g., "6-7 hours" |
| `created_at` | timestamp | Auto |

### Highlight / Inclusion / Exclusion

| Field | Type |
|-------|------|
| `id` | bigint |
| `package_id` | string |
| `highlight` / `inclusion` / `exclusion` | string |
| `sort_order` | integer |

### Gallery

| Field | Type |
|-------|------|
| `id` | bigint |
| `package_id` | string |
| `image_url` | string (URL) |
| `caption` | string |
| `sort_order` | integer |

### FAQ

| Field | Type |
|-------|------|
| `id` | bigint |
| `package_id` | string |
| `question` | string |
| `answer` | text |
| `sort_order` | integer |

---

## Error Response Format (PHP API)

All errors follow this structure:

```json
{
  "success": false,
  "error": "Human-readable message",
  "errors": { "field": "specific error" }  // Only on validation errors (422)
}
```

| Status | Code | When |
|--------|------|------|
| 400 | Bad Request | Missing ID, ID mismatch in body |
| 404 | Not Found | Package/relation not found |
| 405 | Method Not Allowed | Wrong HTTP method |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | DB error, exception (details only if APP_DEBUG=true) |

---

## Quick Test Commands

```bash
# Health check
curl http://localhost/DRISHYATRAVELS/backend/api/

# List packages
curl "http://localhost/DRISHYATRAVELS/backend/api/packages?status=published&limit=3"

# Get single package
curl http://localhost/DRISHYATRAVELS/backend/api/packages/everest-base-camp

# Get itinerary
curl http://localhost/DRISHYATRAVELS/backend/api/packages/everest-base-camp/itinerary

# Trip planner (PHP)
curl -X POST http://localhost/DRISHYATRAVELS/backend/api/trip-planner/ \
  -H "Content-Type: application/json" \
  -d '{"style":"Adventure","days":"7","month":"October","people":2}'
```