# Codemate Backend

A Node.js + Express + TypeScript REST API with MongoDB.

---

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express
- **Language** — TypeScript
- **Database** — MongoDB via Mongoose
- **Auth** — JWT (access + refresh tokens)
- **Validation** — Joi
- **Password Hashing** — bcryptjs
- **Logging** — Winston (or your logger of choice)

---

## Project Structure

```
src/
├── constants/
│   └── HttpStatusCodes.ts
├── controllers/
│   └── auth.controller.ts
├── middlewares/
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── models/
│   └── user.model.ts
├── services/
│   ├── auth.service.ts
│   └── user.service.ts
├── types/
│   ├── express.d.ts
│   └── user.types.ts
├── utils/
│   ├── AppError.ts
│   ├── password.utils.ts
│   └── token.utils.ts
├── validations/
│   └── auth.validator.ts
└── app.ts
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally or a connection URI

### Install

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/codemate
NODE_ENV=development

JWT_SECRET=your_strong_jwt_secret
JWT_REFRESH_SECRET=your_strong_refresh_secret
```

### Run

```bash
# development
npm run dev

# production
npm run build
npm start
```

---

## Auth Flow

```
POST /auth/register   → creates user, returns { user, accessToken } + refreshToken cookie
POST /auth/login      → validates credentials, returns { user, accessToken } + refreshToken cookie
POST /auth/refresh    → reads refreshToken cookie, rotates and returns new tokens
```

- **Access token** — short-lived (15m), sent in response body
- **Refresh token** — long-lived (7d), stored in `httpOnly` cookie

Protected routes require:
```
Authorization: Bearer <accessToken>
```

---

## Architecture

Each layer has a single responsibility:

| Layer | Responsibility |
|---|---|
| `validator` | Schema validation via Joi |
| `controller` | Extract from req, call service, send response |
| `auth.service` | Orchestrates auth flows (register, login, refresh) |
| `user.service` | User DB operations only |
| `token.utils` | JWT generate / verify / rotate |
| `password.utils` | bcrypt hash / compare |
| `middleware` | Auth guard, error handling |

---

## Error Handling

All errors are caught by the global error middleware. Throw an `AppError` anywhere in the app:

```ts
throw new AppError("Not found.", 404);
```

Unhandled errors default to `500 Internal Server Error`. Stack traces are never exposed in responses.
