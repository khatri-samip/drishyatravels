# Himalaya — Nepal Travel Website

The package data in `data/packages.js` is based on the package information supplied for this project.

## Current packages
- `package.html?id=everest-base-camp`
- `package.html?id=mardi-trek`
- `package.html?id=rani-mahal`
- `package.html?id=manang`

All four use the same `package.html` details template.

## Architecture
`data/packages.js` is the data layer. Later it can be replaced by a Node.js/Express API such as `GET /api/packages/:id` without creating separate HTML files for each package.

## Important source fidelity
Package wording, itinerary structure, prices, inclusions and exclusions were kept based on the supplied material. No external verification or correction of the supplied travel information was performed.
