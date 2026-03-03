# URL Shortener Application - Software Architecture & Implementation Plan

**Course:** Web Design  
**Team:** Danny Jimenez, Valeria Cascante, Mishelle, Amanda  
**Deadline:** Next Friday  
**Technology Stack:** MEAN (MongoDB, Express, Angular, Node.js)  
**Deployment:** Oracle Cloud VM (SSH access)

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│              Angular Frontend Application                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express.js API Server                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Route Layer (API Endpoints)                  │   │
│  │  POST /api/urls, GET /api/urls/:id, etc.            │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │    Controller Layer (Business Logic)                 │   │
│  │  URL Controller, Visit Controller                    │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │    Service Layer (Data Operations)                   │   │
│  │  URL Service, Visit Service, Statistics Service      │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │    Model Layer (Data Schemas)                        │   │
│  │  URL Schema, Visit Schema (Mongoose)                 │   │
│  └────────────────┬─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │ Database Queries
                   ▼
        ┌──────────────────────┐
        │   MongoDB Database   │
        │   Collections:       │
        │   - urls             │
        │   - visits           │
        └──────────────────────┘
```

### 1.2 Design Principles Applied

| Principle | Application |
|-----------|-------------|
| **Separation of Concerns** | Route → Controller → Service → Model layers |
| **Single Responsibility** | Each controller/service handles one domain |
| **DRY (Don't Repeat Yourself)** | Reusable services, middleware for common logic |
| **Modularity** | Independent backend modules, feature-based frontend components |
| **Statelessness** | REST API is stateless; no server-side sessions |
| **Error Handling** | Centralized error middleware, proper HTTP status codes |

---

## 2. BACKEND ARCHITECTURE (Express.js + Node.js)

### 2.1 Project Structure

```
backend/
├── server.js                 # Express app initialization
├── .env                      # Environment variables
├── package.json             # Dependencies
├── config/
│   └── database.js          # MongoDB connection (future refactor)
├── models/
│   ├── URL.js               # URL schema & model
│   └── Visit.js             # Visit schema & model
├── controllers/
│   ├── urlController.js     # URL CRUD operations
│   └── visitController.js   # Visit logging & stats
├── services/
│   ├── urlService.js        # URL business logic
│   ├── visitService.js      # Visit business logic
│   └── statsService.js      # Analytics & aggregation
├── routes/
│   ├── urlRoutes.js         # URL endpoints
│   └── visitRoutes.js       # Visit endpoints
└── middleware/
    ├── errorHandler.js      # Global error handling
    └── logger.js            # Request logging (optional)
```

### 2.2 Data Models (MongoDB Schema Design)

#### URL Collection
```javascript
{
  _id: ObjectId,
  originalUrl: String,      // Full original URL
  shortCode: String,        // Unique short identifier (shortid)
  createdAt: Date,          // Creation timestamp
  updatedAt: Date,          // Last modified timestamp
  clickCount: Number        // Total visits (denormalized for performance)
}
```

**Rationale:** 
- `shortCode` is indexed for fast lookups on redirects
- `clickCount` denormalized for faster dashboard queries
- Timestamps for audit trail

#### Visit Collection
```javascript
{
  _id: ObjectId,
  urlId: ObjectId,          // Reference to URL document (foreign key)
  ipAddress: String,        // Visitor IP
  timestamp: Date,          // Visit time
  userAgent: String         // Browser/device info (optional, for analytics)
}
```

**Rationale:**
- `urlId` indexed for efficient queries per URL
- Separate collection allows flexible scaling
- Timestamp for temporal analytics

### 2.3 API Endpoints (RESTful Design)

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| POST | `/api/urls` | Create shortened URL | `{ shortCode, originalUrl, createdAt }` |
| GET | `/api/urls` | List all URLs | `[{ _id, shortCode, originalUrl, clickCount }]` |
| GET | `/api/urls/:id` | Get URL details | `{ _id, shortCode, originalUrl, createdAt, clickCount }` |
| GET | `/api/urls/:id/stats` | Get visit statistics | `{ totalVisits, visits: [...], daily: {...} }` |
| GET | `/:shortCode` | Redirect to original | HTTP 301/302 redirect + log visit |
| GET | `/:shortCode/stats` | Public stats (optional) | `{ totalVisits, dailyFrequency }` |

### 2.4 Layer Responsibilities

**Route Layer (routes/urlRoutes.js)**
- Define HTTP endpoints
- Validate request parameters (basic)
- Call appropriate controller

**Controller Layer (controllers/urlController.js)**
- Handle HTTP request/response
- Orchestrate services
- Format responses
- Return appropriate HTTP status codes

**Service Layer (services/urlService.js)**
- Core business logic
- Data validation
- Call data models
- Handle application errors

**Model Layer (models/URL.js)**
- Define schema structure
- Database validation rules
- Create/execute queries

---

## 3. FRONTEND ARCHITECTURE (Angular)

### 3.1 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.module.ts          # Main module (imports, declarations)
│   │   ├── app.component.ts       # Root component
│   │   ├── app-routing.module.ts  # Main routing
│   │   │
│   │   ├── core/                  # Singleton services
│   │   │   └── services/
│   │   │       └── url.service.ts # API communication
│   │   │
│   │   ├── shared/                # Shared utilities, pipes, directives
│   │   │   └── pipes/
│   │   │       └── domain.pipe.ts # Extract domain from URL
│   │   │
│   │   ├── features/              # Feature modules
│   │   │   ├── shorten/
│   │   │   │   ├── shorten.component.ts
│   │   │   │   ├── shorten.component.html
│   │   │   │   └── shorten.component.css
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   └── dashboard.component.css
│   │   │   │
│   │   │   └── statistics/
│   │   │       ├── statistics.component.ts
│   │   │       ├── statistics.component.html
│   │   │       └── statistics.component.css
│   │   │
│   │   └── models/                # TypeScript interfaces/types
│   │       ├── url.model.ts
│   │       └── visit.model.ts
│   │
│   ├── assets/                    # Static files
│   └── styles/                    # Global styles
│       └── styles.css
│
├── angular.json                   # Angular CLI config
└── package.json
```

### 3.2 Component Architecture

**Feature-Based Organization** (best practice)
- Each feature (Shorten, Dashboard, Statistics) is self-contained
- Reduces dependencies and improves maintainability
- Easy to disable/enable features

**Core Module Pattern**
- `url.service.ts` - Singleton service for API calls
- Imported once in root module
- Shared across all components

### 3.3 Data Flow (Component → Service → Backend)

```
User Input → Component (form submission)
    ↓
Component calls Service method
    ↓
Service makes HTTP request to Backend
    ↓
Component receives Observable/Promise result
    ↓
Component updates template (async pipe or subscribe)
    ↓
User sees result in UI
```

### 3.4 Key Components

**Shorten Component**
- Form input for original URL
- Display shortened URL result
- Copy-to-clipboard button
- Validation feedback

**Dashboard Component**
- List all shortened URLs
- Show click counts
- Link to statistics
- Delete URL option (future)

**Statistics Component**
- Display per-URL analytics
- Visit timestamps
- Daily frequency chart
- Visitor IP list (optional)

---

## 4. TEAM ROLE DISTRIBUTION & WORKFLOW

### 4.1 Team Assignment

| Team | Members | Responsibility | Focus Area |
|------|---------|-----------------|-----------|
| **Backend** | Valeria, Danny | Models, Controllers, Services, API | Data layer, business logic |
| **Frontend** | Amanda, Mishelle | Components, Services, Templates, Styling | User interface, UX |

### 4.2 Development Workflow (Parallel Execution)

```
DAY 1-2: Foundation
├── Backend: Create URL & Visit schemas (models/)
├── Frontend: Set up Angular project, app structure
└── Agreement: Define exact API contract

DAY 2-3: Core Implementation
├── Backend: Implement controllers & services
├── Frontend: Build URL Service (HTTP calls)
└── Testing: Manual API testing with Postman

DAY 3-4: Components & Integration
├── Backend: Add error handling & validation
├── Frontend: Build components (Shorten, Dashboard)
└── Integration: Test frontend calls to backend

DAY 4-5: Analytics & Polish
├── Backend: Statistics endpoints, aggregation
├── Frontend: Statistics component, charts
└── Styling: Responsive design, UX polish

FINAL: Testing & Deployment
├── Integration testing on local machine
├── Deploy to Oracle Cloud VM
└── Final verification
```

### 4.3 Communication Protocol

**Daily Standup (Suggested):**
- What you completed yesterday
- What you're working on today
- Any blockers or issues

**Git Commits (Required):**
- Descriptive messages: "feat: add URL creation endpoint"
- Include Co-authored-by trailer for collaboration
- Push frequently (at least daily)

**API Contract Agreement:**
- Backend defines endpoints before Frontend uses them
- Document expected request/response formats
- Example: `/api/urls` POST returns `{ shortCode, ... }`

---

## 5. DATABASE DESIGN & RELATIONSHIPS

### 5.1 Schema Validation & Constraints

**URL Collection**
- `shortCode`: Unique index, required, min length 5
- `originalUrl`: Required, valid URL format
- `createdAt`: Auto-set on creation
- Compound index on `shortCode` for fast redirects

**Visit Collection**
- `urlId`: Required, references URL._id (index)
- `ipAddress`: Required, valid IP format
- `timestamp`: Auto-set on creation
- Compound index on `urlId + timestamp` for range queries

### 5.2 Query Optimization

**Common Queries & Indexes:**
```javascript
// Find URL by short code (redirect operation)
db.urls.find({ shortCode: "a1b2c" })
// INDEX: { shortCode: 1 }

// Get all visits for a URL (statistics)
db.visits.find({ urlId: ObjectId("...") }).sort({ timestamp: -1 })
// INDEX: { urlId: 1, timestamp: -1 }

// Daily frequency aggregation
db.visits.aggregate([
  { $match: { urlId: ObjectId("...") } },
  { $group: { _id: "$date", count: { $sum: 1 } } }
])
// INDEX: { urlId: 1 }
```

---

## 6. ERROR HANDLING & VALIDATION STRATEGY

### 6.1 Backend Validation Layers

**Route Level:** Basic parameter validation
```javascript
// Validate URL ID format
if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: "Invalid URL ID" });
}
```

**Service Level:** Business logic validation
```javascript
// Validate URL format before saving
if (!isValidUrl(originalUrl)) {
  throw new Error("Invalid URL format");
}
```

**Model Level:** Schema constraints
```javascript
// Mongoose schema validation
originalUrl: {
  type: String,
  required: true,
  validate: { validator: isValidUrl }
}
```

### 6.2 HTTP Status Codes (RESTful Standards)

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | GET /api/urls/:id |
| 201 | Created | POST /api/urls |
| 301/302 | Redirect | GET /:shortCode |
| 400 | Bad Request | Invalid URL format |
| 404 | Not Found | GET /api/urls/invalid-id |
| 500 | Server Error | Database connection failure |

---

## 7. TESTING STRATEGY

### 7.1 Manual Testing Checklist

**Backend API Testing (Postman/curl)**
- [ ] POST /api/urls - Create URL
- [ ] GET /api/urls - List all
- [ ] GET /api/urls/:id - Get details
- [ ] GET /api/urls/:id/stats - Get stats
- [ ] GET /:shortCode - Redirect & log visit
- [ ] Invalid IDs return 400/404

**Frontend Component Testing**
- [ ] Form validation (empty input, invalid URL)
- [ ] Display shortened URL correctly
- [ ] Copy-to-clipboard works
- [ ] Dashboard loads all URLs
- [ ] Statistics component displays data
- [ ] Responsive design (mobile, tablet, desktop)

### 7.2 Integration Testing

- Frontend successfully calls all API endpoints
- Redirects work and visits are logged
- Statistics update after visits
- Error messages display properly

---

## 8. DEPLOYMENT CHECKLIST

### 8.1 Pre-Deployment

- [ ] All code merged to main branch
- [ ] Environment variables set correctly on VM
- [ ] MongoDB running on VM
- [ ] Backend npm dependencies installed
- [ ] Frontend built (ng build)

### 8.2 Deployment Steps

1. SSH into Oracle Cloud VM
2. Pull latest code from GitHub
3. Backend: `cd backend && npm install && node server.js`
4. Frontend: `cd frontend && npm install && ng serve` (or build for production)
5. Test all endpoints on VM
6. Configure firewall if needed

### 8.3 Post-Deployment Verification

- [ ] Server running on correct port
- [ ] MongoDB connected
- [ ] API endpoints responding
- [ ] Frontend loads
- [ ] Shortened URL redirects work
- [ ] Visit tracking functional

---

## 9. SUCCESS CRITERIA

✅ **Functionality**
- Users can create shortened URLs
- Short URLs redirect to originals (301/302)
- Visitor IP and timestamp recorded
- Statistics dashboard displays data

✅ **Code Quality**
- Clean separation of concerns (Models, Controllers, Services)
- Proper error handling and validation
- RESTful API design
- Reusable components and services

✅ **Deployment**
- Application running on Oracle Cloud VM
- All features tested and working
- Accessible via SSH

✅ **Collaboration**
- Clear team role distribution
- Regular commits with descriptive messages
- Documentation complete

---

## 10. TECHNICAL DECISIONS & RATIONALE

| Decision | Rationale | Alternative |
|----------|-----------|-------------|
| **shortid** | Lightweight, human-readable IDs | UUID, base62 encoding |
| **Express + Node** | Lightweight, event-driven, great for APIs | Django, Spring |
| **MongoDB** | Flexible schema, good for rapid development | PostgreSQL, MySQL |
| **Angular** | Full-featured SPA framework, TypeScript | React, Vue |
| **Separation of Concerns** | Maintainability, testability, scalability | Monolithic design |
| **RESTful API** | Industry standard, stateless, cacheable | GraphQL (for this scope) |

---

## 11. FUTURE ENHANCEMENTS (Out of Scope)

- Custom URL slugs (user-provided short codes)
- User authentication & URL ownership
- IP geolocation for visitor location tracking
- QR code generation for short URLs
- Advanced analytics (browser types, referrers)
- Unit & integration tests (Jest/Mocha)
- CI/CD pipeline (GitHub Actions)

---

## 12. REFERENCES & STANDARDS

- **MEAN Stack:** https://mean.io/
- **RESTful API Design:** https://restfulapi.net/
- **SOLID Principles:** https://en.wikipedia.org/wiki/SOLID
- **Angular Best Practices:** https://angular.io/guide/styleguide
- **Express.js Documentation:** https://expressjs.com/

---

**Document Version:** 1.0  
**Last Updated:** March 3, 2026  
**Approved By:** [Team Agreement Pending]
