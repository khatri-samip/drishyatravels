# Engineering Decisions

## 1. Deferring the Backend implementation
**Context:** The existing codebase (`js/main.js` and `admin/script.js`) attempted to communicate with a non-existent local backend on port 5000.
**Decision:** Instead of creating a mock backend or full Node.js API to satisfy these endpoints, the frontend scripts were refactored to read directly from the static `data/packages.js` object. 
**Reasoning:** Faking persistent CRUD operations (e.g. saving a package in the admin panel using LocalStorage) creates a false sense of functionality. It is safer to document the missing backend and fail gracefully (showing an alert in the admin panel) until a proper backend is built.

## 2. Removing Inline Event Listeners
**Context:** The `index.html` file had inline `onclick="toggleMenu()"` and `onclick="planTrip()"` attributes.
**Decision:** Removed inline attributes and attached event listeners dynamically within `js/main.js` using `addEventListener`.
**Reasoning:** Separating JavaScript behavior from HTML structure reduces the risk of global scope pollution and adheres to modern, maintainable web standards.

## 3. Strict Vanilla Constraint
**Context:** The project needs to be robust, performant, and easily understandable without complex build steps.
**Decision:** Strictly avoided introducing React, Vite, Tailwind CSS, or any heavy frontend abstractions.
**Reasoning:** Given the simplicity of the travel site, adding a framework introduces unnecessary overhead and contradicts the goal of maintaining a clean vanilla architecture.
