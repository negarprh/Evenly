# Evenly

Evenly is a real-time shared expense settlement app for groups. It helps users create groups, add shared expenses, split costs fairly, track balances, and settle debts while preserving expense history.

The project was built as a full-stack web application with a Node.js/Express backend, MongoDB Atlas database, React frontend, and Socket.IO real-time updates.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Demo Data](#demo-data)
- [API Overview](#api-overview)
- [Real-Time Events](#real-time-events)
- [Testing and Build](#testing-and-build)
- [Deployment Notes](#deployment-notes)
- [Future Improvements](#future-improvements)

## Overview

Evenly is designed for situations where several people share costs, such as roommates, trips, team events, or family expenses.

Users can:

- Create an account and log in securely
- Create groups and manage members
- Add shared expenses
- Split expenses equally or with custom amounts
- See who owes whom
- Mark expenses as settled
- View updated group balances in real time

The main goal of the project is to make shared expenses easier to track and reduce confusion around who paid, who owes, and what still needs to be settled.

## Features

### Authentication and Security

- User signup and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Authenticated user context on the frontend
- Secure backend middleware using Helmet
- CORS configuration for frontend/backend communication

### Groups

- Create groups
- View groups for the logged-in user
- View group details
- Edit group information
- Delete groups
- Manage group members
- Restrict access so only group members can view or update group data

### Expenses

- Add expenses to a group
- View all expenses in a group
- View a single expense
- Update expense details
- Delete expenses
- Preserve expense history when settlements are made
- Validate expense input before saving

### Split Logic

- Equal split between group members
- Custom split amounts
- Backend validation for split totals
- Balance calculation based on who paid and who owes
- Settlement recommendations to simplify repayment

### Balances and Settlements

- Dynamic balance computation
- Group balance summary
- Settlement suggestions
- Mark expenses as settled
- Keep settlement history instead of losing past records

### Real-Time Updates

- Live updates using Socket.IO
- Group balance updates after expense changes
- Expense update events for connected users
- Frontend automatically refreshes relevant data when updates are received

### Demo Support

- Demo-friendly group and expense examples
- MongoDB Atlas setup ready for hosted use

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Socket.IO
- Zod
- Helmet
- Morgan
- CORS

### Frontend

- React
- Vite
- React Router
- Axios
- Socket.IO Client
- Tailwind CSS
- react-hot-toast
- date-fns

## Project Structure

server/
  src/
    config/
      Database and environment configuration

    controllers/
      Request handlers for auth, groups, expenses, and balances

    middleware/
      Authentication, authorization, validation, and error handling

    models/
      Mongoose models for users, groups, and expenses

    routes/
      Express route definitions

    services/
      Business logic for balances, splits, settlements, and expenses

    validators/
      Zod schemas for request validation

    sockets/
      Socket.IO event setup and helpers


client/
  src/
    api/
      Axios API client and request helpers

    components/
      Reusable UI components

    contexts/
      Authentication and global state providers

    hooks/
      Custom React hooks

    layouts/
      Page layouts and protected route wrappers

    pages/
      Main application pages


## How It Works

### 1. User Authentication

A user creates an account or logs in. The backend verifies the credentials and returns a JWT token. The frontend stores the token and sends it with protected API requests.

### 2. Group Creation

A user creates a group and can add members. Only users who belong to the group can view the group, add expenses, or see balances.

### 3. Expense Creation

A user adds an expense by selecting:

- Group
- Amount
- Payer
- Participants
- Split type
- Description
- Date

The backend validates the data before saving it.

### 4. Split Calculation

Evenly supports:

- Equal split
- Custom split

For custom splits, the backend checks that the split amounts match the total expense amount.

### 5. Balance Calculation

The backend calculates balances based on:

- Who paid
- Who participated
- How much each person owes
- Previous expenses
- Settlement status

The app then shows who owes money and who should receive money.

### 6. Real-Time Updates

When an expense is created, updated, deleted, or settled, Socket.IO sends updates to connected clients. This allows group balances to update without requiring a manual page refresh.

## Environment Variables

MongoDB Atlas is required. The app does not require a local MongoDB installation.

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

### Environment Variable Notes

| Variable          | Description                     |
| ----------------- | ------------------------------- |
| `PORT`            | Backend server port             |
| `MONGODB_URI`     | MongoDB Atlas connection string |
| `JWT_SECRET`      | Secret used to sign JWT tokens  |
| `JWT_EXPIRES_IN`  | JWT expiration time             |
| `CLIENT_URL`      | Frontend URL allowed by CORS    |
| `NODE_ENV`        | Application environment         |
| `VITE_API_URL`    | Frontend API base URL           |
| `VITE_SOCKET_URL` | Frontend Socket.IO server URL   |

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd evenly
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Create environment files

Create:

```text
server/.env
client/.env
```

Use the environment variable examples above.

### 4. Run the backend

```bash
npm run dev:server
```

The backend should run on:

```text
http://localhost:5000
```

### 5. Run the frontend

Open a second terminal and run:

```bash
npm run dev:client
```

The frontend should run on:

```text
http://localhost:5173
```

## API Overview

### Auth

| Method | Endpoint           | Description                    |
| ------ | ------------------ | ------------------------------ |
| `POST` | `/api/auth/signup` | Create a new user              |
| `POST` | `/api/auth/login`  | Log in and receive a JWT       |
| `GET`  | `/api/auth/me`     | Get the current logged-in user |

### Groups

| Method   | Endpoint                   | Description                         |
| -------- | -------------------------- | ----------------------------------- |
| `GET`    | `/api/groups`              | Get all groups for the current user |
| `GET`    | `/api/groups/:id`          | Get one group by ID                 |
| `POST`   | `/api/groups`              | Create a group                      |
| `PATCH`  | `/api/groups/:id`          | Update group information            |
| `DELETE` | `/api/groups/:id`          | Delete a group                      |
| `PATCH`  | `/api/groups/:id/members`  | Update group members                |
| `GET`    | `/api/groups/:id/balances` | Get group balances                  |

### Expenses

| Method   | Endpoint                   | Description                  |
| -------- | -------------------------- | ---------------------------- |
| `GET`    | `/api/groups/:id/expenses` | Get all expenses for a group |
| `GET`    | `/api/expenses/:id`        | Get one expense by ID        |
| `POST`   | `/api/groups/:id/expenses` | Create an expense in a group |
| `PATCH`  | `/api/expenses/:id`        | Update an expense            |
| `DELETE` | `/api/expenses/:id`        | Delete an expense            |
| `PATCH`  | `/api/expenses/:id/settle` | Mark an expense as settled   |

## Real-Time Events

Evenly uses Socket.IO to keep group data updated across connected clients.

### Server Events

| Event                   | Description                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| `expense:updated`       | Emitted when an expense is created, updated, deleted, or settled |
| `group:balancesUpdated` | Emitted when group balances change                               |

### Example Use Case

When a user adds a new expense:

1. The backend saves the expense.
2. The backend recalculates group balances.
3. The backend emits a Socket.IO event.
4. Connected users in the group receive the update.
5. The frontend refreshes the balance and expense display.

## Testing and Build

### Backend unit tests

```bash
npm test --prefix server
```

### Frontend production build

```bash
npm run build --prefix client
```

### Frontend preview

```bash
npm run preview --prefix client
```

## Deployment Notes

The project is prepared for deployment with a hosted backend, hosted frontend, and MongoDB Atlas.

### Backend

The backend can be deployed to services such as Render.

Important backend environment variables:

```env
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_URL=
NODE_ENV=production
```

### Frontend

The frontend can be deployed to services such as Vercel or Netlify.

Important frontend environment variables:

```env
VITE_API_URL=https://your-backend-url.com/api
VITE_SOCKET_URL=https://your-backend-url.com
```

### CORS

Make sure `CLIENT_URL` in the backend matches the deployed frontend URL.

Example:

```env
CLIENT_URL=https://your-evenly-client.vercel.app
```

## Future Improvements

Possible future improvements include:

- Expense categories
- Receipt image uploads
- Email invitations for group members
- Multi-currency support
- Advanced settlement optimization
- Monthly spending summaries
- Export expenses to CSV
- Better dashboard charts
- Mobile-first UI improvements
- Notification system for new expenses and settlements

## Project Goal

The goal of Evenly is to demonstrate a complete full-stack application with:

- Secure authentication
- Protected backend APIs
- Real-time updates
- MongoDB data modeling
- Expense splitting logic
- Balance calculation
- Clean frontend user experience
- Deployment-ready configuration

```

```
