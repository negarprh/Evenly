# Evenly

Evenly is a real-time shared expense settlement board where groups can track shared costs, split expenses fairly, and see live balance updates.

## Features

- JWT authentication with bcrypt password hashing
- Protected REST API routes for auth, groups, expenses, and balances
- Group membership access control
- Full CRUD for `Group` and `Expense`
- Equal and custom split logic with backend validation
- Dynamic balance computation and settlement recommendations
- Expense settlement workflow with history preserved
- Socket.IO updates for `expense:updated` and `group:balancesUpdated`
- Demo seed data for a final presentation
- Render-ready environment variable setup

## Tech Stack

- Backend: Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcrypt, Socket.IO, Zod, Helmet, Morgan, CORS
- Frontend: React, Vite, React Router, Axios, Socket.IO Client, Tailwind CSS, react-hot-toast, date-fns

## Project Structure

```text
server/
  src/config
  src/controllers
  src/middleware
  src/models
  src/routes
  src/services
  src/validators
  src/sockets
  src/seed
client/
  src/api
  src/components
  src/contexts
  src/hooks
  src/layouts
  src/pages
```

## Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/evenly?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

MongoDB Atlas is required. The app does not require or assume a local MongoDB installation.

## Local Setup

Install dependencies:

```bash
npm run install:all
```

Run the backend:

```bash
npm run dev:server
```

Run the frontend in a second terminal:

```bash
npm run dev:client
```

Open `http://localhost:5173`.

## API Overview

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Groups:

- `GET /api/groups`
- `GET /api/groups/:id`
- `POST /api/groups`
- `PATCH /api/groups/:id`
- `DELETE /api/groups/:id`
- `PATCH /api/groups/:id/members`
- `GET /api/groups/:id/balances`

Expenses:

- `GET /api/groups/:id/expenses`
- `GET /api/expenses/:id`
- `POST /api/groups/:id/expenses`
- `PATCH /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `PATCH /api/expenses/:id/settle`

## Testing And Build

Backend unit tests:

```bash
npm test --prefix server
```

Frontend production build:

```bash
npm run build --prefix client
```

## Render Deployment Notes

Backend Render service:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Add all `server/.env.example` variables in Render
- Set `CLIENT_URL` to the deployed frontend URL

Frontend Render static site:

- Root directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Set `VITE_API_URL` to `https://your-api.onrender.com/api`
- Set `VITE_SOCKET_URL` to `https://your-api.onrender.com`
