# Development Guidelines

When contributing to Drishya Travels, follow these strict guidelines to maintain codebase health.

## Technology Stack
- **HTML**: Semantic HTML5.
- **CSS**: Vanilla CSS. Rely on `:root` variables in `global.css` for colors, spacing, and typography. Do not introduce Tailwind or preprocessors.
- **JavaScript**: Vanilla ES6+. Do not introduce React or other frameworks.

## JavaScript Patterns
- **Encapsulation**: Wrap logic within `DOMContentLoaded` event listeners or IIFEs to prevent global namespace pollution.
- **Event Listeners**: Prefer attaching event listeners in JavaScript rather than using inline `onclick` attributes in HTML.
- **Security**: Always use the provided `escapeHTML` function when inserting data directly into the DOM (via `innerHTML`) to prevent XSS.

## Extending the Application
If implementing the missing backend in the future:
1. Create a lightweight Node.js/Express server in a `backend/` directory.
2. Update the frontend scripts (`js/main.js`, `admin/script.js`) to point to the new API endpoints instead of reading `data/packages.js` synchronously.
3. Ensure the Admin panel securely authenticates requests before allowing package modifications.
