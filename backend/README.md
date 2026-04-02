# Finance Dashboard — Backend API

A RESTful backend for a finance dashboard system built with **Node.js**, **Express**, **Prisma ORM**, and **SQLite**.

---

## Tech Stack

| Layer        | Technology                  |
|--------------|-----------------------------|
| Runtime      | Node.js (ESM)               |
| Framework    | Express.js                  |
| ORM          | Prisma                      |
| Database     | SQLite (via Prisma)         |
| Auth         | JWT (jsonwebtoken)          |
| Validation   | Zod                         |
| Passwords    | bcryptjs                    |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Seed script with default users + sample data
├── src/
│   ├── controllers/         # Request handlers (thin layer)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── record.controller.js
│   │   └── dashboard.controller.js
│   ├── services/            # Business logic layer
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── record.service.js
│   │   └── dashboard.service.js
│   ├── routes/              # Express route definitions
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── record.routes.js
│   │   └── dashboard.routes.js
│   ├── middleware/          # Reusable middleware
│   │   ├── authenticate.js  # JWT verification
│   │   ├── authorize.js     # Role-based access control
│   │   ├── validate.js      # Zod schema validation
│   │   ├── errorHandler.js  # Global error handler
│   │   └── notFound.js      # 404 handler
│   ├── utils/
│   │   ├── prisma.js        # Prisma client singleton
│   │   ├── jwt.js           # Token helpers
│   │   ├── response.js      # Consistent API response format
│   │   └── schemas.js       # All Zod validation schemas
│   └── index.js             # App entry point
├── .env
├── .env.example
└── package.json
```

---

## Quick Start

### 1. Install dependencies & set up the database

```bash
cd backend
npm run setup
```

This single command will:
- Install all npm packages
- Generate the Prisma client
- Run database migrations
- Seed the database with default users and sample records

### 2. Start the server

```bash
npm run dev      # Development with hot reload
npm start        # Production
```

Server runs at: `http://localhost:5000`

---

## Default Users (after seeding)

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Admin   | admin@finance.com        | password123  |
| Analyst | analyst@finance.com      | password123  |
| Viewer  | viewer@finance.com       | password123  |

---

## Roles & Permissions

| Action                        | VIEWER | ANALYST | ADMIN |
|-------------------------------|--------|---------|-------|
| View financial records        | ✅     | ✅      | ✅    |
| View dashboard summary        | ✅     | ✅      | ✅    |
| View recent activity          | ✅     | ✅      | ✅    |
| View category totals          | ❌     | ✅      | ✅    |
| View monthly/weekly trends    | ❌     | ✅      | ✅    |
| Create/update/delete records  | ❌     | ❌      | ✅    |
| Manage users                  | ❌     | ❌      | ✅    |

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint          | Access | Description         |
|--------|-------------------|--------|---------------------|
| POST   | /api/auth/register | Public | Register new user   |
| POST   | /api/auth/login    | Public | Login and get token |
| GET    | /api/auth/me       | Any    | Get own profile     |

**POST /api/auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "VIEWER"         // optional, defaults to VIEWER
}
```

**POST /api/auth/login**
```json
{
  "email": "admin@finance.com",
  "password": "password123"
}
```

---

### Users

| Method | Endpoint              | Access | Description          |
|--------|-----------------------|--------|----------------------|
| GET    | /api/users            | Admin  | List all users       |
| GET    | /api/users/:id        | Admin  | Get user by ID       |
| PUT    | /api/users/:id        | Admin  | Update user          |
| DELETE | /api/users/:id        | Admin  | Delete user          |
| PUT    | /api/users/me/password| Any    | Change own password  |

**GET /api/users** supports pagination:
```
?page=1&limit=10
```

**PUT /api/users/:id**
```json
{
  "name": "Updated Name",
  "role": "ANALYST",
  "status": "INACTIVE"
}
```

---

### Financial Records

| Method | Endpoint          | Access  | Description           |
|--------|-------------------|---------|-----------------------|
| GET    | /api/records      | Any     | List records          |
| GET    | /api/records/:id  | Any     | Get record by ID      |
| POST   | /api/records      | Admin   | Create record         |
| PUT    | /api/records/:id  | Admin   | Update record         |
| DELETE | /api/records/:id  | Admin   | Soft delete record    |

**GET /api/records** supports filters:
```
?page=1&limit=10&type=INCOME&category=Salary&startDate=2024-01-01&endDate=2024-12-31&search=freelance
```

**POST /api/records**
```json
{
  "amount": 5000.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2024-06-15",
  "notes": "Monthly salary"
}
```

---

### Dashboard

| Method | Endpoint                      | Access   | Description            |
|--------|-------------------------------|----------|------------------------|
| GET    | /api/dashboard/summary        | Any      | Totals & net balance   |
| GET    | /api/dashboard/categories     | Analyst+ | Per-category breakdown |
| GET    | /api/dashboard/trends/monthly | Analyst+ | Month-by-month trends  |
| GET    | /api/dashboard/trends/weekly  | Analyst+ | Last 7 days trends     |
| GET    | /api/dashboard/activity       | Any      | Recent records         |

**GET /api/dashboard/summary** response:
```json
{
  "success": true,
  "data": {
    "totalIncome": 15000.00,
    "totalExpenses": 8500.00,
    "netBalance": 6500.00,
    "totalRecords": 30
  }
}
```

---

## Response Format

All responses follow a consistent structure:

**Success:**
```json
{
  "success": true,
  "message": "Records fetched.",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" }
  ]
}
```

---

## Design Decisions & Assumptions

1. **Soft Delete** — Records are never permanently deleted; `isDeleted: true` hides them from all queries. This preserves data integrity and audit trails.

2. **Role Hierarchy** — Roles follow a simple numeric hierarchy: `VIEWER(1) < ANALYST(2) < ADMIN(3)`. The `authorize` middleware uses this to allow flexible role checks.

3. **JWT Auth** — Tokens are stateless JWTs. On every request, the user is re-fetched from the DB to catch real-time status/role changes (e.g., if an admin deactivates a user, their existing token is rejected).

4. **Separation of Concerns** — Controllers only handle HTTP (req/res). All business logic lives in service files. This makes services independently testable.

5. **Only Admin can create records** — The assignment specifies Admins manage records. Analysts are read-only + analytics access. Viewers are dashboard-only.

6. **SQLite for simplicity** — Zero infrastructure setup. The DB is a single file (`prisma/dev.db`). For production, swap `provider = "sqlite"` to `"postgresql"` in `schema.prisma`.