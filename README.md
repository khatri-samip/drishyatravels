# Drishya Travels

Drishya Travels is a static travel agency website showcasing Nepal's breathtaking mountains, cultural heritage, and wildlife journeys. It offers a curated collection of trekking, cultural, and adventure packages, built entirely with vanilla web technologies to ensure lightweight performance and ease of maintenance.

## How to Run

Since Drishya Travels is a static HTML/CSS/JS project, it requires no complex build tools or backend to run locally.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KHATRI-SAMIP/DRISHYATRAVELS.git
   cd DRISHYATRAVELS
   ```

2. **Serve the project:**
   You can use any local web server to run the project. For example, using Python's built-in `http.server` or `npx serve`:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using npx
   npx serve .
   ```

3. **View the website:**
   Open your browser and navigate to `http://localhost:8000` (or the port provided by your server).

## Features
- Interactive homepage with trip planner mock functionality
- Dynamic package loading based on static JSON-like data
- Individual package detail pages with rich itineraries, highlights, and galleries
- Responsive design tailored for mobile and desktop viewing
- Basic Admin Panel interface (Note: strictly frontend layout without persistence)

## Project Structure
```text
DRISHYATRAVELS/
├── admin/                 # Admin panel interface
│   ├── css/
│   │   └── style.css      # Admin panel styles
│   ├── js/
│   │   ├── script.js      # Admin panel logic
│   │   └── utils.js       # Shared utilities (symlink or copy of public/js/utils.js)
│   └── index.html         # Admin dashboard
├── docs/                  # Project documentation
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── DEVELOPMENT.md
│   └── PROJECT_STATUS.md
├── public/                # Public website (served as root)
│   ├── assets/            # Static assets (images, fonts)
│   ├── css/
│   │   ├── global.css     # CSS variables, reset, utilities
│   │   ├── home.css       # Homepage styles
│   │   ├── packages.css   # Package listing page styles
│   │   └── package-details.css  # Package detail page styles
│   ├── data/
│   │   └── packages.js    # Static package data (PACKAGES object + helpers)
│   ├── js/
│   │   ├── utils.js       # Shared utilities (escapeHTML)
│   │   ├── main.js        # Homepage logic (trip planner, experience cards)
│   │   ├── packages.js    # Package listing page logic
│   │   └── package-details.js  # Package detail page logic
│   ├── index.html         # Homepage
│   ├── packages.html      # Package listing page
│   └── package.html       # Package detail template
```

## Architecture
The frontend architecture relies exclusively on **Vanilla HTML, CSS, and JavaScript**. 
- **DOM Manipulation:** Native JavaScript DOM APIs, encapsulated to prevent global scope leakage.
- **Data Layer:** Currently operates on a static data layer (`data/packages.js`).
- **Styling:** CSS variables (`:root`) govern the theme and maintain consistency.

## Configuration
No `.env` or external configuration is required for the static frontend. 

## Development
To contribute or modify the site, refer to the `docs/DEVELOPMENT.md` file. All modifications should use vanilla technologies without introducing frameworks or heavy libraries.

## Deployment
The site can be deployed instantly to any static hosting provider (e.g., Vercel, Netlify, GitHub Pages, or AWS S3):
1. Point the provider to the root directory.
2. No build step or command is required.

## Known Limitations
- **Missing Backend / Database:** The Admin Panel and specific data fetching logic previously referenced a non-existent API (`http://localhost:5000`). This has been refactored to read from the static `data/packages.js` file, but package creation/editing/deletion is non-functional without a real backend.
- **Form Submissions:** Forms (like the contact/booking buttons and the Trip Planner) currently execute client-side demonstrations or open mail clients, as there is no backend to process submissions.

## Future Work
- Implement a lightweight Node.js/Express backend to enable CRUD operations in the Admin panel.
- Connect a database (e.g., SQLite or MongoDB) to persist package data.
- Implement server-side form handling and email notifications for bookings.
