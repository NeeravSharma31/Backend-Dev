# Experiment 12: Node.js, Express.js, EJS Templating, and State Management

This directory contains complete implementations for both parts of Experiment 12:

---

## 📂 Subdirectories & Modules

### 1. [`Exp_12_A/`](./Exp_12_A/) — Node.js, Express.js, Nodemon, and EJS
- **Core Topics**: Basic server, text/JSON/HTML responses, URL route params, query parameters, POST body parsing, EJS templating, Nodemon auto-restart.
- **Lab Tasks Implemented**:
  - **Task 1**: Student details in text, HTML, and JSON (`/my-details/json`)
  - **Task 2**: Full Calculator API (`/calculate?num1=10&num2=5&operation=add|subtract|multiply|divide|modulus|power`)
  - **Task 3**: Student Management API (`GET /students`, `GET /students/:id`, `POST /students/add`)
  - **Task 4**: Dynamic Course Timetable using EJS (`/timetable`)
  - **Task 5**: Student Registration Form and Result Page using EJS (`/register-student`)
- **Report**: [`Exp_12_A/Report.md`](./Exp_12_A/Report.md)

### 2. [`Exp_12_B/`](./Exp_12_B/) — Sessions & Cookies (State Management)
- **Core Topics**: Stateless HTTP, client cookies via `cookie-parser`, server-side sessions via `express-session`, authentication guards, session isolation.
- **Lab Tasks & Exercises Implemented**:
  - **Source/session-example.js**: Visit counter session tracking.
  - **Source/cookie-example.js**: Setting, reading, and clearing cookies.
  - **server.js**: Unified login/logout session and theme cookie demo.
  - **Exercise 1 (`exercise1-login.js`)**: Simple User Login System with Registration, Authentication, Protected Dashboard middleware, and Logout.
  - **Exercise 2 (`exercise2-todo.js`)**: Session-Based To-Do List Application with per-session task isolation and dark/light theme cookie support.
- **Report**: [`Exp_12_B/Report.md`](./Exp_12_B/Report.md)

---

## 📑 Lab Reports

- 📄 **[Master Experiment 12 Report (A & B)](./Report.md)**
- 📄 **[Experiment 12 A Detailed Report](./Exp_12_A/Report.md)**
- 📄 **[Experiment 12 B Detailed Report](./Exp_12_B/Report.md)**