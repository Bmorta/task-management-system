# Task Management System

A full-stack task management application built with React, Node.js, Express, and MongoDB. The application allows users to create, complete, filter, and delete tasks through a responsive web interface.

## 🚀 Live Demo

**Live Application:**  
https://task-management-system-67yq.onrender.com/

---

## 📌 Overview

The Task Management System is a full-stack web application designed to demonstrate the integration of a React frontend with a RESTful backend API and MongoDB database.

Users can manage their tasks through a simple and responsive interface while task data is stored persistently in MongoDB.

This project demonstrates practical full-stack development concepts including:

- React components
- React state management
- Event handling
- REST API integration
- Node.js and Express
- MongoDB and Mongoose
- CRUD operations
- Environment variables
- Frontend and backend deployment
- API communication between separate services

---

## ✨ Features

### Task Management

- Add new tasks
- Mark tasks as completed
- Mark completed tasks as active
- Delete tasks
- View all tasks
- Filter tasks by status
- Display remaining task count

### Frontend

- Responsive user interface
- React component-based architecture
- Controlled form inputs
- Dynamic task rendering
- Loading and error states
- API integration using `fetch()`

### Backend

- RESTful API
- Create, read, update, and delete task operations
- Express.js routing
- MongoDB database integration
- Mongoose data modeling
- CORS configuration
- Environment variable configuration

---

## 🛠️ Technologies Used

### Frontend

- React
- JavaScript
- HTML5
- CSS3
- Vite

### Backend

- Node.js
- Express.js
- REST API
- Mongoose

### Database

- MongoDB
- MongoDB Atlas

### Deployment

- Render
- GitHub

---

## 📂 Project Structure

```text
task-management-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskFilter.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── taskController.js
│   │
│   ├── models/
│   │   └── Task.js
│   │
│   ├── routes/
│   │   └── taskRoutes.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
