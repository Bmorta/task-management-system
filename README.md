# Capstone 3 - Task Manager

Full-stack React Task Manager based on the MSTCONNECT PH Project 1 guided project, extended with the required Node.js/Express backend and MongoDB Atlas persistence.

## Features
- Add tasks
- Display tasks
- Complete / undo tasks
- Delete tasks
- All / Active / Completed filters
- Remaining task count
- MongoDB persistence
- REST API
- React frontend

## Stack
**Frontend:** React + Vite  
**Backend:** Node.js + Express  
**Database:** MongoDB Atlas  
**Deployment:** Render

## Structure
```text
capstone3-task-manager/
├── client/
│   └── src/
│       ├── components/
│       │   ├── TaskForm.jsx
│       │   ├── TaskItem.jsx
│       │   ├── TaskList.jsx
│       │   └── TaskFilter.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── server/
│   ├── config/db.js
│   ├── controllers/taskController.js
│   ├── models/Task.js
│   ├── routes/taskRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
└── README.md
```

## Local setup

### Backend
```bash
cd server
npm install
```

Copy `.env.example` to `.env` and set:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:5173
```

Start:
```bash
npm run dev
```

### Frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```

For a deployed frontend, set:
```env
VITE_API_URL=https://YOUR-BACKEND-URL/api
```

## API
```text
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

## Render
Backend environment variables:
```text
MONGODB_URI=your MongoDB Atlas connection string
CLIENT_URL=your deployed frontend URL
```

Frontend environment variable:
```text
VITE_API_URL=https://your-deployed-backend/api
```

Do not upload `.env` to GitHub.
