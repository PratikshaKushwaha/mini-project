# ArtisanConnect

A premium creative marketplace and commission management platform built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Portfolios:** Artists can create profiles and upload portfolio items.
- **Commissions:** Artists can define commission services (e.g., character design, 3D modeling).
- **Discovery:** Clients can discover artists through paginated, filtered search.
- **Order Management:** Structured workflow for commission orders (Requested -> Accepted -> In Progress -> Ready for Delivery -> Completed).
- **Messaging:** Built-in messaging thread for each active commission order.
- **Roles:** Role-based access control for Artists, Clients, and Admins.

## Tech Stack

**Frontend:** React (Vite), TailwindCSS, React Router, Redux Toolkit, Axios, React Hook Form
**Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT + bcrypt

## Project Structure

This project uses a monorepo structure.
- `/client`: Frontend React application.
- `/server`: Backend Express application.

## Prerequisites

- Node.js (v18+)
- MongoDB (running locally or a MongoDB Atlas URI)

## Setup Instructions

### 1. Install Dependencies

Install dependencies for both the backend and frontend separately:

```bash
# In the server folder
cd server
npm install

# In the client folder
cd ../client
npm install
```

### 2. Environment Variables

**Backend (`/server/.env`):**
Copy `/server/.env.example` to `/server/.env` and update the values.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/artisanconnect
ACCESS_TOKEN_SECRET=your_super_secret_access_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
REFRESH_TOKEN_EXPIRY=10d
```

**Frontend (`/client/.env`):**
Copy `/client/.env.example` to `/client/.env` and update the API URL if needed.

```env
VITE_API_URL=http://localhost:5000/api/v1
```




4. Running the Application

You need to run the server and client in separate terminal windows.

**Run the Backend:**
```bash
cd server
npm run dev
```
Backend runs at: `http://localhost:5000`

**Run the Frontend:**
```bash
cd client
npm run dev
```
Frontend runs at: `http://localhost:5173` (or port specified by Vite)

## Testing

To run the integration tests for the backend (which use an isolated in-memory database):
```bash
cd server
npm test
```

## Deployment

### Backend (Node/Express)
1. Set the environment variable `NODE_ENV=production`.
2. Ensure you have a live MongoDB database.
3. Deploy the `server` folder to a service like Render, Heroku, or Railway.

### Frontend (React/Vite)
1. Build the production bundle:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `client/dist` folder to Vercel, Netlify, or AWS S3.
3. Set `VITE_API_URL` to your production backend URL during the build.
