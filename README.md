# 📚 Library Management System

A complete **MERN Stack** Library Management System with separate **Admin** and **Student** panels.

---

## 🚀 Features

### 👨‍💼 Admin Panel
- 🔐 Admin Login
- 📊 Dashboard with real-time statistics
- 📚 View All Books (with images)
- ➕ Add New Book (with image upload)
- ❌ Remove Book
- 🎓 Add Student (auto-generates registration number & default password)
- 🗑️ Remove Student
- 📤 Issue Book to Student
- 📥 Submit/Return Book from Student

### 🎓 Student Panel
- 🔐 Student Login (default password = DOB in DDMMYYYY format)
- 📊 Personal Dashboard
- 📚 Browse All Books
- 📖 View Issued Books (with due dates & overdue warnings)
- 🔄 Request a Book
- 📜 Borrowing History
- 👤 My Profile

---

## 🛠️ Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | React 19, Vite, React Router, Axios, React-Toastify |
| Backend    | Node.js, Express 5                 |
| Database   | MongoDB (Mongoose)                 |
| File Upload| Multer (in-memory storage)         |

---

## 📂 Project Structure

```
LIBRARY_MANAGEMENT_SYSTEM/
├── server/          # Backend API (Express + MongoDB)
├── admin/           # Admin Frontend (React + Vite)
├── library/         # Student Frontend (React + Vite)
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on `localhost:27017`)

### 1. Backend Setup

```bash
cd LIBRARY_MANAGEMENT_SYSTEM/server
npm install
npm start
```

Server runs on **http://localhost:2700**

### 2. Admin Panel Setup

```bash
cd LIBRARY_MANAGEMENT_SYSTEM/admin
npm install
npm run dev
```

Admin panel runs on **http://localhost:5173**

### 3. Student Panel Setup

```bash
cd LIBRARY_MANAGEMENT_SYSTEM/library
npm install
npm run dev
```

Student panel runs on **http://localhost:5174**

---

## 🔑 Default Credentials

### Admin
| Field    | Value            |
|----------|------------------|
| Email    | `admin@gmail.com` |
| Password | `admin1234`       |

> The default admin is **auto-created** when the server starts.

### Student
- Added by the admin through the **Add Student** form.
- Default password = student's **DOB reversed** (e.g. DOB `2005-08-15` → password `15082005`)

---

## 📡 API Endpoints

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| POST   | `/api/admin/login`      | Admin login                        |
| POST   | `/api/student/login`    | Student login                      |
| GET    | `/api/allbooks`         | Get all books                      |
| GET    | `/api/bookphoto/:id`    | Get book cover image               |
| POST   | `/api/allbooks`         | Add new book (multipart)           |
| DELETE | `/api/deletebook`       | Delete a book                      |
| GET    | `/api/students`         | Get all students                   |
| POST   | `/api/addstudents`      | Add a new student                  |
| DELETE | `/api/deletestudent`    | Delete a student                   |
| POST   | `/api/issuebook`        | Issue a book to a student          |
| POST   | `/api/submitbook`       | Submit/return a book               |
| GET    | `/api/stats`            | Dashboard statistics               |

---

## 📝 Notes
- Passwords are stored as **plain text** for simplicity (per project requirements).
- Book images are stored in MongoDB as Buffer data.
- Registration numbers auto-increment starting from **1001**.
- Book due date defaults to **15 days** from issue date.

---

## 📄 License
This project is for educational purposes.

