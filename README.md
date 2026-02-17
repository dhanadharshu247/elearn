# EdWeb - Role-Based Learning Platform

A comprehensive education platform featuring separate dashboards for Learners and Instructors.

## Tech Stack
- **Backend**: Python (FastAPI, SQLAlchemy, SQLite)
- **Frontend**: React (Vite, TailwindCSS)

## Quick Start (Easiest Way)

To start both the **Backend (FastAPI)** and **Frontend (React)** simultaneously:

### Option A: Windows Script (Recommended)
Double-click `run_project.bat` in the root folder, or run:
```bash
run_project.bat
```

### Option B: NPM Command
If you have Node.js installed, run this in the root folder:
```bash
npm run dev
```

---

## Technical Details & Manual Setup

**Backend (FastAPI)**
1. Navigate to the backend folder: `cd backend`
2. Activate Virtual Environment: `.venv\Scripts\activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Seed the database (if needed): `python seed.py`
5. Run server: `python main.py`

**Frontend (React)**
1. Navigate to frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## Demo Accounts
- **Instructor**: `instructor@edweb.com` / `password123`
- **Learner**: `miru@gmail.com` / `password123`

## Features
- **Role-Based Access**: Separate protected routes for instructors and learners.
- **Learner Reports**: Instructors can monitor student progress and achievements.
- **Integrated Quizzes**: Module-based knowledge checks for learners.
- **Course Management**: Instructor tools to publish and manage content.