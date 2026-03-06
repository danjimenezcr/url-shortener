# URL Shortener - Frontend (Angular)

This is the Angular frontend for the URL Shortener application, built as part of the Web Design course project.

## Project Structure

```
frontend/src/app/
├── core/                           # Core services (singleton)
│   └── services/
│       └── url.service.ts          # API communication service
├── features/                       # Feature modules
│   ├── shorten/                    # URL shortening page
│   ├── dashboard/                  # URL management dashboard
│   └── statistics/                 # URL statistics page
├── models/                         # TypeScript interfaces
│   ├── url.model.ts
│   └── visit.model.ts
├── shared/                         # Shared utilities
│   └── pipes/
│       └── domain.pipe.ts
└── app configuration files
```

## Installation & Setup

```bash
cd frontend
npm install
npm start               # Runs on http://localhost:4200
```

## Features

1. **Shorten Page** (`/`) - Create shortened URLs
2. **Dashboard** (`/dashboard`) - View all URLs with stats
3. **Statistics** (`/statistics/:id`) - Detailed analytics per URL

## Configuration

Update API endpoint in `src/app/core/services/url.service.ts`:
```typescript
private apiUrl = 'http://localhost:3000/api';
```

## Build for Production

```bash
ng build --configuration production
```

## Team

Danny, Valeria, Mishelle, Amanda
