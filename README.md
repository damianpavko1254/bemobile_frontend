# Task Manager – Frontend

Vue 3 + PrimeVue + Vite task management application with dark/light themes and full CRUD integration.

## Tech Stack

- **Vue 3** – Composition API, `<script setup>`
- **TypeScript** – Strict mode
- **Vite** – Build tool
- **PrimeVue** – UI components (Aura theme)
- **Vue Router** – Routing
- **Pinia** – State management

## Features

- Task list with DataTable (title, status, createdAt)
- Create, edit, delete tasks
- Inline status change via dropdown
- Search by title and filter by status
- HATEOAS pagination with URL state
- Dark / Light / System theme toggle
- Toast notifications for success and errors

## Prerequisites

Backend must be running at `http://localhost:8080` (Spring Boot + HATEOAS).

## Setup

```bash
npm install
```

Copy `env.example` to `.env.local` and set `VITE_API_BASE_URL` if needed (default: `http://localhost:8080`).

## Development

```bash
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

Serves the production build (default: http://localhost:4173). **Start the backend on port 8080 first** — the preview server proxies `/api` to it. If you see a WebSocket error in the console, it is usually from a browser extension (e.g. Live Reload) and can be ignored.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL (default: `http://localhost:8080`) |
| `VITE_APP_TITLE` | Application title |
