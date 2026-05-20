# AW Client Portal Frontend

Modern financial client portal frontend for quarterly planning workflows, SACS/TCC reporting, and generated report review.

Built with:
- Vanilla TypeScript
- HTML
- CSS
- ES Modules

No frontend framework or bundler is used.

---

# Features

## Dashboard
- Responsive dashboard layout
- Modern financial planning UI
- Sidebar navigation
- Summary cards and activity views

## Client Management
- Create client profiles
- Edit existing clients
- Single and married household support
- Client 1 / Client 2 structures
- Static financial planning assumptions
- Retirement/non-retirement account structures
- Trust and liability configuration

## Quarterly Logs
- Quarterly financial review workflow
- SACS cashflow preview
- TCC net-worth calculations
- Real-time calculations
- Progress/completion tracking
- Dynamic married vs single household behavior

## Reports
- Generated reports archive
- Backend report metadata integration
- Report preview preparation
- PDF download preparation
- Canva integration placeholder

---

# Tech Stack

- TypeScript
- HTML5
- CSS3
- FastAPI backend integration
- Runtime config via `config.js`

---

# Project Structure

```txt
awclient-portal-frontend/
├── pages/
├── scripts/
├── styles/
├── ui/
├── dist/
├── config.js
├── config.example.js
└── index.html
```

---

# Environment Configuration

This project uses lightweight runtime configuration.

Create:

```txt
config.js
```

Example:

```js
window.__APP_CONFIG__ = {
  API_BASE_URL: "http://127.0.0.1:8000"
};
```

A template is provided:

```txt
config.example.js
```

---

# Local Development

## 1. Install dependencies

```bash
npm install
```

## 2. Build TypeScript

```bash
npm run build
```

## 3. Start frontend server

Recommended:

```bash
python -m http.server 8001
```

OR use VSCode Live Server.

Frontend runs at:

```txt
http://localhost:8001
```

---

# Backend Requirements

Backend should run separately.

Expected local backend:

```txt
http://127.0.0.1:8000
```

Swagger:

```txt
http://127.0.0.1:8000/docs
```

---

# Build

Compile TypeScript:

```bash
npm run build
```

Output is generated into:

```txt
dist/
```

---

# Deployment

## Frontend Hosting

Recommended:
- Vercel

## Backend Hosting

Recommended:
- Railway

Update production backend URL inside:

```txt
config.js
```

Example:

```js
window.__APP_CONFIG__ = {
  API_BASE_URL: "https://your-railway-backend-url"
};
```

---

# Current Workflow

## Client Flow

```txt
Clients
→ Add/Edit Client
→ Quarterly Logs
→ Generate Report
→ Reports Archive
→ Report Preview
```

---

# Notes

- Backend is the source of truth for report calculations.
- Frontend performs lightweight real-time preview calculations only.
- Quarterly report generation and PDF rendering are backend-driven.
- Canva editing integration is planned for a future release.

---

# License

Internal / Private Project
