# edweb

Education platform (learner + instructor).

## Run the prototype

**Backend (API)**  
Uses MongoDB. Set `MONGO_URI` and `JWT_SECRET` in `backend/.env`, then:

```bash
cd backend
npm install
npm run dev
```

API runs at **http://localhost:8000**.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**. From there you can use:

- **Login / Signup** — `/login`, `/signup`
- **Learner** — `/learner/dashboard`, `/learner/my-courses`, `/learner/profile`
- **Instructor** — `/instructor/dashboard`, `/instructor/courses`, `/instructor/learners`, `/instructor/profile`