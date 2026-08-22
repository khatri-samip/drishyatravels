# GOTCHAS — Real Bugs That Already Happened

This document records actual bugs that occurred in this codebase, how they manifested, and how to spot/fix them. Do not guess — every entry here is backed by git history.

---

## 1. escapeHTML Function Had Corrupted Replacement Strings

**When:** Commit `fc62903` (Aug 21, 2026) introduced the bug; fixed in `7bda65b` same day.

**Files affected:** `public/js/main.js` (lines 559–568 at the time)

**What the bug looked like:**

```javascript
// BROKEN (commit fc62903)
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&")      // literal ampersand, not entity
        .replace(/</g, "<")      // literal less-than, not entity
        .replace(/>/g, ">")      // literal greater-than, not entity
        .replace(/"/g, "\"")     // literal quote, not entity
        .replace(/'/g, "&#039;");
}
```

**Why it broke everything:** The replacement strings contained literal characters (`<`, `>`, `&`, `"`) instead of HTML entity text (`<`, `>`, `&`, `"`). When the browser parsed this JavaScript, it saw unescaped angle brackets and quotes inside string literals — a **syntax error**. The entire `main.js` file failed to execute silently (no console error pointing to the exact line, just "Unexpected token" or similar).

**How to spot it again:**
- Search for `.replace(/&/g, "&")` or `.replace(/</g, "<")` — any replacement that uses the literal character instead of the entity name.
- The correct pattern always uses the entity **name** (`&`, `<`, `>`, `"`) or **numeric** (`&#38;`, `&#60;`, `&#62;`, `&#34;`) form.
- Run a syntax check: `node --check public/js/main.js` will catch this.

**Correct version (current, in `public/js/utils.js`):**
```javascript
function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """)
    .replaceAll("'", "&#039;");
}
```
Note: `utils.js` uses `replaceAll` (modern, cleaner); `main.js` duplicate uses regex `/g` — both work, but keep them in sync.

---

## 2. Double `response.json()` Call Caused Silent API Parsing Failures

**When:** Historical — not in current HEAD, but occurred during refactoring.

**Files affected:** `public/js/main.js`, `public/js/package-details.js`, `public/js/packages.js`

**What the bug looked like:**
```javascript
// BROKEN (hypothetical example from refactoring)
fetch("/api/endpoint")
  .then(response => response.json())  // first call — consumes body
  .then(data => {
    return response.json();           // second call — FAILS silently
  })
  .then(result => { ... });
```

**Why it failed:** A `Response` body can only be read **once**. Calling `.json()` a second time on the same response object throws a `TypeError: Already read` (or returns an empty stream), which gets caught by `.catch()` but often with an unhelpful message. The UI shows "Unable to load packages" with no clue why.

**How to spot it:**
- Search for multiple `.json()` calls on the same `response` variable in a single promise chain.
- Pattern: `return response.json()` followed later by another `response.json()` or `response.text()` on the same variable.

**Current code is correct** — each file calls `.json()` exactly once per fetch:
- `main.js` lines 155, 216 — separate fetches, each reads once
- `package-details.js` line 44 — single fetch, reads once
- `packages.js` line 52 — single fetch, reads once

---

## 3. Homepage Featured-Packages Logic: `?featured=1` vs `?limit=3`

**Current state (verified in `public/js/main.js` line 145):**

```javascript
fetch("/DRISHYATRAVELS/backend/api/packages/?featured=1", { ... })
```

**Backend contract (`backend/api/packages/index.php` lines 23–30, `backend/models/Package.php` lines 39–41):**
- `?featured=1` → filters to only packages where `is_featured = TRUE`
- `?limit=3` → returns first 3 packages of **all** packages (no featured filter)

**Why `?featured=1` is correct:**
- The homepage "Featured Packages" grid should show packages **marked as featured by admin**, not just the first 3 packages in the database.
- Using `?limit=3` would show whatever 3 packages were created most recently, ignoring the admin's curation.
- The frontend then slices to 3: `packages.slice(0, 3)` — this is a safety cap, not the filter.

**Comment in code (main.js:145):**
```javascript
// why: ?featured=1 returns featured packages; ?limit=3 would return first 3 of all packages — not interchangeable
```

**If you change this:** You will break the featured section — it will show random packages instead of admin-selected ones.

---

## 4. `.card` vs `.featured-card` — NOT Interchangeable

**Two completely different markup structures, styled by different CSS rules in `public/css/home.css`:**

### `.featured-card` — Featured Grid (home.css lines 246–358)

**Used by:** `loadFeaturedPackages()` in `main.js` (line 168)

**Markup structure:**
```html
<article class="featured-card">
  <a href="...">
    <div class="featured-card-image" style="background-image:url(...)"></div>
    <div class="featured-card-content">
      <div class="featured-meta">
        <span>Duration</span>
        <span class="tag">Destination</span>
      </div>
      <h3>Title</h3>
      <p>Description</p>
      <div class="featured-bottom">
        <strong>Price</strong>
        <span>Explore →</span>
      </div>
    </div>
  </a>
</article>
```

**Key CSS selectors:** `.featured-card`, `.featured-card-image`, `.featured-card-content`, `.featured-meta`, `.featured-bottom`

---

### `.card` — Carousel "Places Worth the Journey" (home.css lines 655–690)

**Used by:** `loadAllPackagesCarousel()` in `main.js` (line 230)

**Markup structure:**
```html
<article class="card">
  <a href="...">
    <div class="card-img">
      <div class="card-img-bg" style="background-image:url(...)"></div>
      <span class="tag">Destination</span>
      <span class="explore-text">Explore Now →</span>
    </div>
    <div class="card-body">
      <h3>Title</h3>
      <p>Description</p>
      <div class="card-meta">
        <span>Duration</span>
        <span>→ Explore</span>
      </div>
    </div>
  </a>
</article>
```

**Key CSS selectors:** `.card`, `.card-img`, `.card-img-bg`, `.card-body`, `.card-meta`, `.explore-text`

---

**What happened before (commit `fc62903`):** The featured container was populated with `.card` markup instead of `.featured-card`. Result: broken layout, missing styles, wrong hover effects, misaligned content.

**How to avoid:** When editing either function, verify the class name matches the CSS section:
- Featured grid → `.featured-card` + `featured-card-*` children
- Carousel → `.card` + `card-*` children

---

## 5. Hardcoded `/DRISHYATRAVELS/` Paths — Break on Rename/Deploy

**Every occurrence in JS/PHP files (searched `grep -r "/DRISHYATRAVELS/"`):**

| File | Line | Context |
|------|------|---------|
| `public/js/main.js` | 63 | Trip planner API: `fetch("/DRISHYATRAVELS/backend/api/trip-planner/")` |
| `public/js/main.js` | 145 | Featured packages: `fetch("/DRISHYATRAVELS/backend/api/packages/?featured=1")` |
| `public/js/main.js` | 206 | All packages carousel: `fetch("/DRISHYATRAVELS/backend/api/packages/")` |
| `public/js/packages.js` | 41 | Packages page: `fetch(\`/DRISHYATRAVELS/backend/api/packages/?${params}\`)` |
| `public/js/package-details.js` | 31 | Package detail: `fetch(\`/DRISHYATRAVELS/backend/api/packages/${id}\`)` |
| `admin/js/script.js` | 74 | Admin load: `fetch("/DRISHYATRAVELS/backend/api/packages/")` |
| `admin/js/script.js` | 206 | Admin save: `url = \`/DRISHYATRAVELS/backend/api/packages/${isEdit}\`` |
| `admin/js/script.js` | 265 | Admin delete: `fetch(\`/DRISHYATRAVELS/backend/api/packages/${id}\`)` |
| `admin/js/script.js` | 289 | Admin edit: `fetch(\`/DRISHYATRAVELS/backend/api/packages/${id}\`)` |
| `backend/api/packages/[id].php` | 25–28 | PHP router handles multiple base paths: `/DRISHYATRAVELS/backend/api/packages/`, `/api/packages/`, `/drishya-travels-backend/api/packages/` |

**Why this breaks:**
- If the project folder is renamed (e.g., `drishya-travels`), all frontend fetches 404.
- If deployed to domain root (`https://example.com/` instead of `https://example.com/DRISHYATRAVELS/`), all fetches 404.
- The PHP backend *tries* to handle multiple base paths (see `[id].php` lines 25–28), but the frontend JS has no such fallback.

**Recommended fix:** Use a runtime-configurable base path.
```javascript
// In a shared config file (e.g., public/js/config.js)
const API_BASE = (() => {
  // Detect from current script src or meta tag
  const script = document.querySelector('script[data-api-base]');
  if (script) return script.dataset.apiBase;
  // Fallback: derive from current page path
  const path = window.location.pathname;
  const match = path.match(/^(\/[^\/]+)/); // first path segment
  return match ? `${match[1]}/backend/api` : '/backend/api';
})();

// Then use:
fetch(`${API_BASE}/packages/?featured=1`)
```

**Files to update when fixing:** All 9 JS files listed above + any new fetch calls.

---

## Quick Reference: Files to Watch

| Bug Type | Files to Check |
|----------|----------------|
| escapeHTML corruption | `public/js/utils.js`, `public/js/main.js` (duplicate) |
| Double `.json()` | `public/js/main.js`, `public/js/package-details.js`, `public/js/packages.js` |
| Featured API param | `public/js/main.js:145` |
| Card class mismatch | `public/js/main.js:168` (featured-card) vs `230` (card) |
| Hardcoded paths | All 9 files listed in section 5 |

---

## 6. `admin/login.html` Is a Static Placeholder — Not Wired to Backend

**File:** `admin/login.html` (lines 42–53)

**What it does:** Client-side only password check (`password === "drishya123"`). If correct, redirects to `index.html`. No backend validation, no session creation, no token generation.

**Why this is a gotcha:**
- It *looks* like a login page but provides **zero security**
- Anyone can bypass it by navigating directly to `admin/index.html`
- The hardcoded password `"drishya123"` is visible in source code
- No logout functionality (just closing the tab works)
- No server-side session — the admin panel has no auth middleware

**Current state (from PROJECT_STATUS.md Known Gaps #1):** Admin authentication is intentionally deferred. The login page exists as a UI placeholder for future implementation.

**When implementing real auth:**
1. Add backend endpoint: `POST /api/auth/login` → returns JWT or sets session cookie
2. Add auth middleware to verify tokens on all `/api/` routes
3. Update `admin/login.html` to POST to `/api/auth/login` and store token
4. Update `admin/js/script.js` to include auth header in all API calls
5. Add logout button that clears token/session
6. Redirect unauthenticated users to `login.html` from `admin/index.html`

**Do not mistake this for working authentication.**

---

*Generated from git history and code inspection. Update this doc when new gotchas are discovered.*