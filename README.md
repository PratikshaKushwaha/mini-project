# ArtisanConnect

A production-grade, two-sided marketplace connecting **clients** with talented **artists** for custom commissions and direct artwork purchases.

## Architecture

```
┌──────────────┐     REST API      ┌───────────────┐     Mongoose    ┌──────────┐
│   React SPA  │  ───────────────► │  Express.js   │ ──────────────► │ MongoDB  │
│  (Vite/Redux)│  ◄─────────────── │   Backend     │ ◄────────────── │ Atlas    │
└──────────────┘   JSON + Cookies  └───────────────┘                 └──────────┘
                                        │
                                        ├── Cloudinary  (image uploads)
                                        ├── Nodemailer  (email notifications)
                                        └── Google OAuth (social login)
```

### Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, Redux Toolkit, TailwindCSS    |
| Backend    | Node.js, Express.js, Passport JWT             |
| Database   | MongoDB with Mongoose ODM                     |
| Auth       | JWT (access+refresh), Google OAuth 2.0        |
| Storage    | Cloudinary (images)                           |
| Email      | Nodemailer (SMTP)                             |
| Security   | Helmet, bcryptjs, express-mongo-sanitize      |
| Testing    | Jest, Supertest, mongodb-memory-server        |

---

## Roles & Permissions

| Action                  | Client | Artist | Admin |
|-------------------------|--------|--------|-------|
| Browse artists/artworks | ✅     | ✅     | ✅    |
| Place direct order      | ✅     | ❌     | ❌    |
| Place custom commission | ✅     | ❌     | ❌    |
| Set price on custom     | ❌     | ✅     | ❌    |
| Manage portfolio        | ❌     | ✅     | ❌    |
| Leave feedback          | ✅     | ❌     | ❌    |
| Delete any user         | ❌     | ❌     | ✅    |
| Update user roles       | ❌     | ❌     | ✅    |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas cluster (or local MongoDB)
- Cloudinary account
- Google Cloud Console project (OAuth 2.0 credentials)

### 1. Clone & Install

```bash
git clone <repo-url>
cd Artisan

# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Environment Variables

**`server/.env`**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/artisanconnect
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

ACCESS_TOKEN_SECRET=<random-secret>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=<random-secret>
REFRESH_TOKEN_EXPIRY=15d

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>

GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASS=<app-password>

ADMIN_EMAILS=admin@yourdomain.com
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=<google-oauth-client-id>
```

### 3. Run Development

```bash
# Terminal 1 — Server
cd server
npm run dev

# Terminal 2 — Client
cd client
npm run dev
```

Open `http://localhost:5173`

---

## API Reference

### Auth (`/api/v1/auth`)

| Method | Endpoint               | Auth  | Description                             |
|--------|------------------------|-------|-----------------------------------------|
| POST   | `/register`            | ❌    | Register with email, username, password  |
| POST   | `/login`               | ❌    | Login with email OR username + password  |
| POST   | `/google`              | ❌    | Google OAuth sign-in                     |
| POST   | `/complete-profile`    | ❌    | Set username+password after Google OAuth |
| POST   | `/refresh-token`       | 🍪    | Refresh access token via cookie          |
| POST   | `/logout`              | ✅    | Logout current session                   |
| GET    | `/me`                  | ✅    | Get current user                         |
| PUT    | `/me`                  | ✅    | Update profile (supports image upload)   |
| POST   | `/forgot-password`     | ❌    | Send OTP to email                        |
| POST   | `/verify-otp`          | ❌    | Verify OTP code                          |
| POST   | `/reset-password`      | ❌    | Reset password with OTP                  |

### Artists (`/api/v1/artists`)

| Method | Endpoint          | Auth  | Description                      |
|--------|-------------------|-------|----------------------------------|
| GET    | `/`               | ❌    | Browse artists (search, filter)  |
| GET    | `/:artistId`      | ❌    | Get artist profile + portfolio   |
| POST   | `/profile`        | 🎨    | Update artist profile            |

### Portfolio (`/api/v1/portfolio`)

| Method | Endpoint              | Auth  | Description                  |
|--------|-----------------------|-------|------------------------------|
| POST   | `/`                   | 🎨    | Add artwork (image upload)   |
| GET    | `/:artistId`          | ❌    | Get artist's portfolio       |
| PATCH  | `/:id`                | 🎨    | Update artwork               |
| DELETE | `/:id`                | 🎨    | Delete artwork               |
| POST   | `/:id/like`           | ✅    | Toggle like on artwork       |
| PATCH  | `/:id/availability`   | 🎨    | Toggle artwork availability  |

### Orders (`/api/v1/orders`)

| Method | Endpoint           | Auth  | Description                      |
|--------|--------------------|-------|----------------------------------|
| POST   | `/`                | 🎭    | Create order (direct or custom)  |
| GET    | `/`                | ✅    | List orders (role-filtered)      |
| GET    | `/:id`             | ✅    | Get order details                |
| PATCH  | `/:id/status`      | ✅    | Update order status              |
| PATCH  | `/:id/price`       | 🎨    | Artist sets price (custom only)  |

### Messages (`/api/v1/orders/:id/messages`)

| Method | Endpoint | Auth  | Description                          |
|--------|----------|-------|--------------------------------------|
| GET    | `/`      | ✅    | Get messages for order               |
| POST   | `/`      | ✅    | Send message (supports image upload) |

### Feedback (`/api/v1/feedback`)

| Method | Endpoint                     | Auth  | Description                 |
|--------|------------------------------|-------|-----------------------------|
| POST   | `/`                          | 🎭    | Leave feedback on artwork   |
| GET    | `/artwork/:portfolioItemId`  | ❌    | Get artwork feedback        |
| POST   | `/:id/like`                  | ✅    | Toggle feedback like        |

### Posts/Community (`/api/v1/posts`)
Community feed for sharing art-related content — existing routes retained.

### Admin (`/api/v1/admin`)

| Method | Endpoint         | Auth  | Description                               |
|--------|------------------|-------|-------------------------------------------|
| GET    | `/stats`         | 🔒    | System statistics                         |
| GET    | `/users`         | 🔒    | List all users                            |
| DELETE | `/users/:id`     | 🔒    | Delete user (cascades all related data)   |
| PATCH  | `/users/:id`     | 🔒    | Update user role                          |

**Legend:** ❌ = public, ✅ = any authenticated user, 🎨 = artist only, 🎭 = client only, 🔒 = admin only, 🍪 = cookie-based

---

## Order Workflow

### Direct Purchase
```
Client clicks "Buy" → Order created (status: accepted, price auto-set) → Artwork marked unavailable
→ Artist works → completed
```

### Custom Commission
```
Client submits request (status: pending)
→ Artist sets price (status: price_quoted)
→ Client confirms price (status: accepted)
→ Artist starts (status: in_progress)
→ Artist delivers (status: completed)
```

At any point before `in_progress`: client can cancel. Artist can reject during `pending`.

---

## Security

- **Passwords**: bcrypt hashed (10 rounds)
- **JWT**: Short-lived access tokens + long-lived refresh tokens in httpOnly cookies
- **Sessions**: Server-side session tracking with revocation support
- **Input sanitization**: `express-mongo-sanitize` blocks NoSQL injection
- **Headers**: `helmet` sets secure HTTP headers
- **Rate limiting**: 100 req/15min general, 20 req/15min for auth endpoints
- **File uploads**: MIME type whitelist (images only), 5MB limit
- **CORS**: Configurable origin with credentials support

---

## Testing

```bash
cd server
npm test                              # Run all tests
npm test -- --testPathPattern=auth    # Run auth tests only
npm test -- --testPathPattern=orders  # Run order tests only
```

Tests use `mongodb-memory-server` for isolated in-memory database instances.

---

## Project Structure

```
Artisan/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/
│   │   │   ├── auth/          # Login, Register, CompleteProfile, ForgotPassword
│   │   │   ├── dashboard/     # Artist, Client, Admin dashboards
│   │   │   ├── orders/        # OrderDetail
│   │   │   └── public/        # Home, About, Community, BrowseArtists, ArtistProfile
│   │   ├── services/api.js    # Axios instance + all API functions
│   │   ├── store/             # Redux slices
│   │   └── App.jsx            # Root routes
│   └── .env
│
├── server/                    # Express backend
│   ├── config/passport.js     # JWT strategy
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth, upload middleware
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routers
│   ├── tests/                 # Jest test suites
│   ├── utils/                 # Cloudinary, email, error helpers
│   ├── app.js                 # Express app setup
│   ├── index.js               # Server entry point
│   └── .env
└── README.md
```
