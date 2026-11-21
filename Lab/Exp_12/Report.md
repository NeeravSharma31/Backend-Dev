# Laboratory Experiment 12: Express.js, EJS Templating, and State Management

Comprehensive laboratory report covering both parts of Experiment 12:
- **Part 12 A**: Node.js, Express.js REST APIs, EJS Templating, and Nodemon
- **Part 12 B**: Client-Side Cookies and Server-Side Session Management

---

# ========================================================
# SECTION 1: EXPERIMENT 12 A (EXPRESS & EJS TEMPLATING)
# ========================================================

## 1. Number
**Laboratory Experiment 12 A**

## 2. Title
**Building RESTful Services and Dynamic Server-Side Rendered Applications with Node.js, Express.js, Nodemon, and EJS**

## 3. Object (Objective)
- To construct an asynchronous web server using Node.js and Express.js.
- To handle multiple HTTP response types (plain text, JSON, HTML, status codes).
- To process URL route parameters, query strings, and POST form data.
- To implement dynamic Server-Side Rendering (SSR) using the EJS templating engine.
- To configure Nodemon for auto-restart development workflow.
- To complete all assigned lab tasks:
  1. Student details in text, HTML, and JSON formats.
  2. Full Calculator API supporting `add`, `subtract`, `multiply`, `divide`, `modulus`, and `power`.
  3. Student Management REST API with GET and POST operations.
  4. Course Timetable EJS view template.
  5. Student Registration form and dynamic confirmation page.

## 4. Theory
- **Node.js**: Asynchronous, event-driven JavaScript runtime using Chrome's V8 engine and libuv event loop.
- **Express.js**: Minimalist web framework providing routing, middleware integration, and response abstractions.
- **EJS (Embedded JavaScript)**: Template engine compiling `.ejs` templates into static HTML on the server before client transmission, protecting sensitive business logic and optimizing SEO.
- **Nodemon**: File watcher utility that detects code modifications and automatically reboots the server.

## 5. Installation Process (Windows)
```powershell
cd D:\Backend\Backend-Dev\Lab\Exp_12\Exp_12_A
npm install
node script.js    # Basic Node script
npm run dev       # Start server with Nodemon (port 3000)
```

## 6. Code Overview
- [`Exp_12_A/app.js`](Exp_12_A/app.js): Full Express server with all routes and lab tasks.
- [`Exp_12_A/script.js`](Exp_12_A/script.js): Baseline JavaScript runtime demonstration.
- [`Exp_12_A/nodemon.json`](Exp_12_A/nodemon.json): Watch configuration for `.js`, `.json`, and `.ejs` files.
- [`Exp_12_A/views/`](Exp_12_A/views/): Contains `home.ejs`, `users.ejs`, `profile.ejs`, `timetable.ejs`, `register-student.ejs`, and `registration-result.ejs`.

## 7. Observation
- `GET /my-details/json`: Returns student identity object in JSON format with status `200 OK`.
- `GET /calculate?num1=12&num2=4&operation=divide`: Computes `result: 3` with status `200 OK`.
- `GET /calculate?num1=5&num2=3&operation=power`: Computes `result: 125` using `Math.pow()`.
- `GET /timetable`: Dynamically generates the course schedule table using EJS loop iteration.
- `POST /register-student`: Successfully registers student and displays confirmation page.

## 8. Challenges
- **Query string type conversion**: Addressed numeric calculation bugs by converting `req.query` string inputs to floating point numbers via `parseFloat()`.
- **View path resolution**: Used `path.join(__dirname, 'views')` to prevent path lookup failures when launched from parent directories.

---

# ========================================================
# SECTION 2: EXPERIMENT 12 B (SESSIONS & COOKIES)
# ========================================================

## 1. Number
**Laboratory Experiment 12 B**

## 2. Title
**State Management in Node.js: Implementing Client-Side Cookies and Server-Side Sessions with Express-Session and Cookie-Parser**

## 3. Object (Objective)
- To introduce state persistence into the stateless HTTP protocol.
- To configure signed, HTTPOnly client cookies using `cookie-parser`.
- To manage user state and visit tracking using `express-session`.
- To solve Exercise 1: Build an authentication system with registration, login, logout, and protected dashboard middleware.
- To solve Exercise 2: Build a session-isolated To-Do List application with dark/light mode theme cookies.

## 4. Theory
- **HTTP Statelessness**: HTTP does not persist identity between requests.
- **Cookies**: Key-value data stored in client browsers. Controlled via `httpOnly`, `secure`, and `maxAge` attributes. Ideal for UI preferences.
- **Sessions**: Sensitive user state stored on the server memory/database. The browser only stores a signed session ID (`connect.sid`) inside a cookie.
- **Authentication Middleware**: Intercepts requests to protected resources, checking `if (req.session.user)` before invoking `next()`.

## 5. Installation Process (Windows)
```powershell
cd D:\Backend\Backend-Dev\Lab\Exp_12\Exp_12_B
npm install
npm run unified     # Runs unified session-cookie server on port 3000
npm run exercise1   # Runs Exercise 1 Login System on port 3001
npm run exercise2   # Runs Exercise 2 To-Do App on port 3002
```

## 6. Code Overview
- [`Exp_12_B/server.js`](Exp_12_B/server.js): Unified session login/logout and cookie demo.
- [`Exp_12_B/Source/session-example.js`](Exp_12_B/Source/session-example.js): Visit counter session demo.
- [`Exp_12_B/Source/cookie-example.js`](Exp_12_B/Source/cookie-example.js): Cookie create, read, and delete endpoints.
- [`Exp_12_B/exercise1-login.js`](Exp_12_B/exercise1-login.js): Complete user login system with route guard middleware.
- [`Exp_12_B/exercise2-todo.js`](Exp_12_B/exercise2-todo.js): Session-isolated To-Do application with theme switcher.
- [`Exp_12_B/views/todo.ejs`](Exp_12_B/views/todo.ejs): Dynamic EJS template for to-do items and theme modes.

## 7. Observation
- `server.js`: Logging in sets `connect.sid` and `theme=dark` cookies; logging out destroys session and clears cookies.
- `exercise1-login.js`: Unauthorized direct navigation to `/dashboard` is blocked and redirected to `/login`. Upon registration and login, `/dashboard` is accessible.
- `exercise2-todo.js`: Tasks added in one browser session are completely isolated and invisible to another browser, proving session boundary integrity.

## 8. Challenges
- **Session Cookie Invalidation**: Addressed obsolete client cookie retention by pairing `req.session.destroy()` with `res.clearCookie('connect.sid')`.
- **Session Boundary Security**: Marked sensitive session cookies as `httpOnly: true` to prevent Cross-Site Scripting (XSS) credential theft.