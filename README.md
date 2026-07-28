# CampusPulse — Social Media & Content Management Dashboard

CampusPulse is a Digital Marketing & Social Media Management Dashboard designed for Academic Departments. It enables student coordinators to draft, preview, and request approval for social media announcements (Instagram, LinkedIn, Twitter), and permits faculty/admin users to approve/schedule or reject submissions. A background publisher service automatically updates and simulates publishing scheduled posts once their time arrives.

---

## Workspace Structure
```
/social
  ├── server/                 # Node.js + Express.js API & Scheduler
  │    ├── models/            # Mongoose Schema Definitions
  │    ├── middleware/        # JWT & Role Authentication
  │    ├── controllers/       # API route controllers
  │    ├── routes/            # Express endpoint routing
  │    ├── services/          # cron publish scheduler
  │    ├── seed.js            # Demo database seeder
  │    └── index.js           # Server entry point
  │
  ├── client/                 # React.js + Vite + Tailwind CSS UI
  │    ├── src/
  │    │    ├── api/          # Axios instance with interceptor
  │    │    ├── components/   # Layout, Sidebar, Topbar
  │    │    ├── context/      # Auth state context
  │    │    ├── pages/        # Login, Dashboard, Calendar, Creator, Queue, Analytics
  │    │    ├── App.jsx       # Route protection & structure
  │    │    └── index.css     # Design system & Glassmorphic variables
  │    └── tailwind.config.js # Tailwind CSS variables config
  │
  └── README.md               # Main instructions manual
```

---

## Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on the default port `27017`

---

## Setup & Running Instructions

### 1. Database & Backend Server Setup

1. Open a terminal in the `/server` directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Run the Database Seed script to populate default data:
   ```bash
   npm run seed
   ```
4. Launch the Express API and Cron Scheduler server:
   ```bash
   npm start
   ```
   *The server runs on `http://localhost:5000` and the auto-publisher runs in the background every 60 seconds.*

### 2. Frontend Client Setup

1. Open a new terminal in the `/client` directory:
   ```bash
   cd client
   ```
2. Install the frontend dependencies (forces legacy peer deps for React 19 charting packages):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Launch the Vite local dev server:
   ```bash
   npm run dev
   ```
   *The client app will launch locally (typically at `http://localhost:5173`).*

---

## Demo Credentials & Walkthrough Flow

### 1. Credentials
You can log in to the dashboard using these seeded credentials:
- **Faculty / Admin Profile**:
  - **Email**: `admin@campus.edu`
  - **Password**: `admin123`
- **Student Coordinator Profile**:
  - **Email**: `student@campus.edu`
  - **Password**: `student123`

### 2. Testing the End-to-End Workflow Flow
1. **Login as Student Coordinator**:
   - Access `http://localhost:5173` and log in as `student@campus.edu` / `student123`.
2. **Draft and Submit a Post**:
   - Navigate to the **Post Creator** page.
   - Fill out the form (e.g. choose "Event" template, select platforms, input text details).
   - Set the **Scheduled Publication Date** to **2 minutes in the future** from current system time.
   - Click **Submit for Approval**.
3. **Approve Post as Admin**:
   - Log out, and log back in as the Admin: `admin@campus.edu` / `admin123`.
   - Open the **Approval Queue** page (only visible to admins).
   - Review the post under the pending list and click **Approve Post**.
   - Note that the status transitions to `Scheduled` and it is plotted on the **Content Calendar** page on its scheduled date.
4. **Auto-Publish Trigger**:
   - Wait 1-2 minutes until the scheduled publication time passes.
   - Check the **Server console logs** to see the simulated publish cycle outputs (payload transaction logs).
   - Refresh the page: the post's status will update to `Published`.
   - Click the post on the calendar to inspect the raw simulated publication logs (transaction details for each channel).
