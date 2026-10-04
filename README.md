# Task Management System

A modern full-stack task management system built for **office professionals and students**. TaskMate combines React, Node.js, Express, MongoDB, secure authentication, personal task workspaces, profiles, and administrator user management.

## 🚀 Live Demo

**Live Application:** https://task-management-system-67yq.onrender.com/

## ✨ Main Features

### 🔐 Authentication
- Login and signup
- Secure password hashing with bcrypt
- JWT-based authentication
- Persistent login session
- Logout
- Active/inactive account control
- Office or Student account type

### 👤 Personal Workspace
- Personalized greeting using the logged-in user's name
- Each user sees only their own tasks
- Add, edit, complete, and delete tasks
- Task descriptions, priority, due date, created date, and completed date
- Search, sorting, status filters, overdue filter, progress tracking, and pagination

### 🪪 Profile
- View your own profile
- Update name, phone, department/program, account type
- Change password
- Regular users can only access their own profile

### 🛡️ Administrator
- Dedicated Users page
- Add users
- Edit users
- Change user role
- Activate/deactivate accounts
- Delete users
- Create additional administrators
- Administrator cannot delete their own account

### 🎨 UI / UX
- Modern office/student-focused interface
- Animated login/signup experience
- Responsive dashboard
- Dashboard cards and progress visualization
- Modal forms
- Hover and transition effects
- Mobile-friendly layout

## 🛠️ Technologies

**Frontend:** React, JavaScript, HTML5, CSS3, Vite  
**Backend:** Node.js, Express.js, REST API, JWT, bcryptjs  
**Database:** MongoDB, MongoDB Atlas, Mongoose  
**Deployment:** GitHub + Render

## 📂 Project Structure

```text
task-management-system/
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
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## 🔧 Environment Variables

Create `server/.env` locally:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_long_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator
```

For Render, add the same variables under the backend Web Service's **Environment** settings. Do not commit `server/.env`.

### Default administrator

The backend automatically creates the administrator account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when the server starts for the first time. Change the example credentials before deploying.

## ▶️ Local Development

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Open the frontend at `http://localhost:5173`.

## 🌐 Render Deployment

### Backend Web Service
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Add `MONGODB_URI`, `CLIENT_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`

### Frontend Static Site
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Set `VITE_API_URL` to your backend URL ending in `/api`

After changing frontend environment variables, redeploy the frontend because Vite embeds them during the build.

## 🔒 Security Notes

Passwords are hashed before storage. Authentication is enforced on task and profile endpoints. Users cannot access another user's tasks through the API. Administrator endpoints require an administrator role.

## 🎓 Capstone 3

This project demonstrates the React concepts from the beginner Task Manager project and extends them into a complete full-stack application with authentication, MongoDB persistence, role-based access, and deployment.
