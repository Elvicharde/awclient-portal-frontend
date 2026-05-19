# GitHub Copilot Instructions — AW Client Portal Frontend

This repository contains the frontend dashboard for the AW Client Portal system.

The frontend uses:

- HTML
- CSS
- Vanilla JavaScript

No frontend frameworks are allowed.

---

# Frontend Rules

Use:

- semantic HTML
- modular CSS
- modular JavaScript
- CSS Grid layouts
- responsive design

Do NOT use:

- React
- Vue
- Angular
- jQuery
- Tailwind build systems
- frontend bundlers

---

# Layout Rules

The application uses:

- responsive CSS Grid
- collapsible sidebar
- top navigation
- modular content sections

Sidebar behavior:

- collapsible on tablet/mobile
- fixed on desktop

---

# JavaScript Rules

## API Logic

ALL API requests belong ONLY in:

assets/js/api.js

Do NOT duplicate fetch logic.

---

## Page Logic

Each page has isolated JS modules.

Examples:

- clients.js
- monthly-logs.js
- reports.js

Responsibilities:

- DOM rendering
- event listeners
- API integration
- UI updates

---

# CSS Rules

Separate CSS by responsibility.

Examples:

- global.css
- layout.css
- sidebar.css
- forms.css
- tables.css

Rules:

- avoid inline styles
- use reusable utility classes
- prefer CSS Grid/Flexbox
- maintain visual consistency

---

# Component Rules

Reusable UI sections belong in:
components/

Examples:

- sidebar
- navbar
- modals

Avoid duplicated HTML structures.

---

# API Integration Rules

The frontend communicates ONLY with:
awclient-portal-api

Use Fetch API only.

Base API configuration belongs ONLY in:
assets/js/api.js

---

# Responsive Design Rules

The UI MUST:

- support desktop
- support tablet
- support smaller screens
- maintain readable layouts

---

# Code Style Rules

- Use snake_case naming
- Prefer small reusable functions
- Keep files modular
- Avoid giant JS files
- Keep logic readable
- Prefer simplicity over abstraction

---

# UI Style Direction

The dashboard should feel:

- professional
- modern
- financial
- enterprise-grade
- clean and minimal

Use:

- soft shadows
- subtle borders
- generous spacing
- restrained color palette
- strong typography hierarchy

---

# Project Goal

The frontend must support:

- client management
- monthly financial logs
- report workflows
- polished dashboard experience

The UI should optimize for:

- speed
- clarity
- usability
- responsiveness
- demo stability
