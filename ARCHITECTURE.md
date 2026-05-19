# AW Client Portal Frontend — Architecture Guide

## Overview

The frontend is a lightweight responsive dashboard application for:

- client management
- monthly financial logs
- report generation workflows

The frontend intentionally avoids frontend frameworks.

Primary goals:

- rapid implementation
- responsive layout
- maintainable vanilla JavaScript
- clean modular CSS
- reliable API integration
- professional dashboard UX

---

# Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- CSS Grid
- Fetch API

No frontend frameworks are allowed.

---

# Frontend Philosophy

This frontend is intentionally:

- lightweight
- modular
- framework-free
- API-driven
- component-oriented using reusable HTML partials

Avoid unnecessary complexity.

---

# Layout System

The application uses:

- CSS Grid for page layout
- responsive sidebar navigation
- modular reusable layout utilities

Primary layout:

- collapsible sidebar
- top navbar
- responsive content area

---

# Directory Structure

awclient-portal-frontend/
│
├── assets/
│ ├── css/
│ ├── js/
│ └── icons/
│
├── components/
│ ├── sidebar.html
│ ├── navbar.html
│ └── modals.html
│
├── pages/
│ ├── clients.html
│ ├── monthly-logs.html
│ └── reports.html
│
├── index.html
└── vercel.json

---

# JavaScript Rules

## API Logic

ALL API requests belong ONLY in:

assets/js/api.js

Never duplicate fetch logic across files.

---

## Page Logic

Each page should have isolated logic.

Examples:

- clients.js
- monthly-logs.js
- reports.js

Responsibilities:

- DOM rendering
- event listeners
- API consumption
- state updates

---

# CSS Rules

## CSS Organization

Separate CSS by responsibility.

Examples:

- global.css
- layout.css
- sidebar.css
- forms.css
- tables.css

---

## Styling Rules

- Avoid inline styles
- Use reusable utility classes
- Prefer flex/grid layouts
- Use semantic spacing
- Keep visual consistency

---

# Component Rules

Reusable UI sections belong in:
components/

Examples:

- sidebar
- navbar
- modal shells

Avoid duplicated markup.

---

# API Integration Rules

The frontend communicates ONLY with:

awclient-portal-api

via Fetch API.

Base API configuration belongs ONLY in:

assets/js/api.js

---

# Responsive Design Rules

The dashboard MUST:

- support desktop
- support tablet
- collapse sidebar on smaller screens
- maintain readable tables/forms

---

# Forbidden Patterns

Do NOT:

- use React
- use Vue
- use Angular
- use jQuery
- use inline CSS
- hardcode API URLs across files
- duplicate fetch logic
- create giant JS files

---

# Naming Rules

Use snake_case for:

- files
- CSS classes
- JS functions
- variables

Use kebab-case for:

- HTML files
- utility classes

---

# Success Criteria

The frontend succeeds if:

1. navigation feels smooth
2. forms are easy to use
3. layout feels professional
4. API integration is reliable
5. report workflows are intuitive
