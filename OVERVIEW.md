# Court Reporting System

**Overview**

The _Court Reporting System_ is a full‑stack application that provides a web interface for managing court case data. It consists of a **backend** built with **Node.js**, **Express**, and **Drizzle ORM**, and a **frontend** built with **React**, **Vite**, and **Sass**.

---

## Prerequisites

- **Node.js** (v20 or later) and **npm** – used for both backend and frontend.
- **Database** – the backend supports MySQL (`mysql2`) and PostgreSQL (`pg`). Install and run the database of your choice.
- **Git** – to clone the repository (if you haven't already).

---

## Project Structure

```
court-reporting-system/
├─ backend/   # Express API, Drizzle ORM, DB seed & migrations
└─ frontend/  # React UI built with Vite & Sass
```

---

## Backend – Setup & Run

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   - Copy the example file and fill in your database credentials:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` to set `DATABASE_URL` (e.g., `mysql://user:pass@localhost:3306/dbname` or `postgres://...`).
4. **Run database migrations**
   ```bash
   npm run db:push   # creates tables based on Drizzle schema
   # or, if you prefer explicit migrations:
   npm run db:migrate
   ```
5. **Seed initial data**
   ```bash
   npm run db:seed
   ```
6. **Start the development server**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000` (default). Adjust the port in `.env` if needed.

---

## Frontend – Setup & Run

1. **Navigate to the frontend directory**
   ```bash
   cd ../frontend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables** (if needed)
   - Copy the example file:
     ```bash
     cp .env.example .env
     ```
   - Update any API base URLs to point to the backend (`VITE_API_URL`).
4. **Start the development server**
   ```bash
   npm run dev
   ```
   Vite will launch the UI at `http://localhost:5173` by default.
5. **Build for production**
   ```bash
   npm run build
   ```
   The compiled assets are placed in `dist/`.

---

## Running the Full Stack Locally

Open two terminal windows (or use a process manager like `concurrently`):

```bash
# Terminal 1 – Backend
cd backend && npm run dev

# Terminal 2 – Frontend
cd frontend && npm run dev
```

With both servers running, navigate to the frontend URL (e.g., `http://localhost:5173`) to interact with the application.

---
## Testing Flow

1. **Login as Admin** – use credentials from `seed.ts` (e.g., email `budi@court.go.id`, password `admin123`).
2. **Create a new job** via the admin UI or use a seeded job and assign a reporter. After assignment, job status becomes **ASSIGNED**.
3. **Login as the assigned Reporter** and submit the transcription. Status changes to **TRANSCRIBED**.
4. **Switch back to Admin**, locate jobs with status **TRANSCRIBED**, and assign an editor. The job status becomes **REVIEWED**.
5. **Login as the assigned Editor**, review and submit the transcript. After submission, the job status becomes **COMPLETED**.

> The seed file (`backend/src/db/seed.ts`) lists the emails and passwords for all preset users.

---
## Useful Scripts Summary

| Script                     | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `npm run dev` (backend)    | Starts the Express server with live TypeScript compilation. |
| `npm run db:push`          | Syncs the Drizzle schema to the database (creates tables).  |
| `npm run db:migrate`       | Runs migration files (if you use migration scripts).        |
| `npm run db:seed`          | Populates the database with seed data.                      |
| `npm run dev` (frontend)   | Starts the Vite dev server (React UI).                      |
| `npm run build` (frontend) | Produces a production‑ready bundle in `dist/`.              |

---
