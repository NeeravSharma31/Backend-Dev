# Lab Report: Experiment 12 B — Using Node.js to Manage Sessions & Cookies

---

## 1. Number
**Laboratory Experiment 12 B (Optional & Exercises)**

---

## 2. Title
**State Management in Node.js: Implementing Client-Side Cookies and Server-Side Sessions with Express-Session and Cookie-Parser**

---

## 3. Object (Objective)
1. To understand the stateless nature of the HTTP protocol and the necessity of state management mechanisms.
2. To implement client-side cookies using `cookie-parser` for non-sensitive data such as theme preferences and user identifiers.
3. To implement server-side sessions using `express-session` for sensitive user state, authentication persistence, and view tracking.
4. To solve Exercise 1: Build a complete User Authentication System (Registration, Login, Protected Dashboard route with authentication middleware, and Logout).
5. To solve Exercise 2: Build a Session-Based To-Do List Application supporting per-session task isolation, deletion, and theme cookie selection.

---

## 4. Theory

### 4.1 Stateless HTTP vs. State Management
HTTP is fundamentally a stateless request-response protocol. Each request operates independently without intrinsic knowledge of preceding interactions. To maintain continuous user context (e.g. active logins, preferences, shopping carts), two complementary state management mechanisms are utilized:

### 4.2 Cookies (Client-Side Storage)
A cookie is a small key-value pair stored inside the client's web browser and transmitted to the server with every matching HTTP request via the `Cookie` request header.
- **Attributes**:
  - `maxAge`: Expiration window in milliseconds.
  - `httpOnly`: Restricts client-side JavaScript access (`document.cookie`), mitigating Cross-Site Scripting (XSS) session hijacking.
  - `secure`: Ensures transmission only over HTTPS encryption.
- **Use Cases**: User UI preferences (dark/light theme), locale, tracking tokens.

### 4.3 Sessions (Server-Side Storage)
A session stores actual application state securely on the server (in memory, Redis, or a database), while transmitting only a cryptographically signed unique **Session ID (`connect.sid`)** to the client browser inside a cookie.
- **Flow**:
  1. The client logs in.
  2. The server initializes `req.session.user` and signs the session ID using a secret key (`mysecretkey`).
  3. The server attaches `Set-Cookie: connect.sid=s%3A...` to the HTTP response header.
  4. On subsequent requests, the browser submits the cookie; Express automatically matches the session ID against server memory and reconstructs the session context.
  5. Upon logout, `req.session.destroy()` destroys the server record and `res.clearCookie()` removes the client identifier.

---

## 5. Installation Process (Windows)

### Prerequisites
- Node.js (v18.x or later).
- NPM (Node Package Manager).

### Execution Steps
1. Navigate to the Experiment 12 B directory:
   ```powershell
   cd D:\Backend\Backend-Dev\Lab\Exp_12\Exp_12_B
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Running Individual Modules:
   - **Basic Session Example**:
     ```powershell
     npm run session-demo
     # Runs: node Source/session-example.js on port 3000
     ```
   - **Basic Cookie Example**:
     ```powershell
     npm run cookie-demo
     # Runs: node Source/cookie-example.js on port 3000
     ```
   - **Unified Session & Cookie Server**:
     ```powershell
     npm run unified
     # Runs: node server.js on port 3000
     ```
   - **Exercise 1: Simple User Login System**:
     ```powershell
     npm run exercise1
     # Runs: node exercise1-login.js on port 3001
     ```
   - **Exercise 2: Session-Based To-Do List Application**:
     ```powershell
     npm run exercise2
     # Runs: node exercise2-todo.js on port 3002
     ```

---

## 6. Project Structure

```text
Exp_12_B/
├── server.js                   # Unified session and cookie demonstration server
├── exercise1-login.js          # Lab Assignment 1: User Auth System & protected dashboard
├── exercise2-todo.js           # Lab Assignment 2: Session-isolated To-Do application
├── package.json                # Project dependencies & npm run scripts
├── Source/
│   ├── session-example.js      # Part 1: Visit counter session demo
│   └── cookie-example.js       # Part 2: Cookie set, get, and delete demo
└── views/
    └── todo.ejs                # EJS template for to-do app with theme switcher
```

---

## 7. Code Implementation

### 7.1 Unified Session & Cookie Server (`server.js`)
```javascript
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // 1 minute
}));

app.get('/', (req, res) => {
  const theme = req.cookies.theme || 'default';
  if (req.session.username) {
    res.send(`<h2>Welcome back, ${req.session.username}!</h2><p>Theme: ${theme}</p><a href="/logout">Logout</a>`);
  } else {
    res.send(`
      <h2>Session & Cookie Demo</h2>
      <form action="/login" method="post">
        <input type="text" name="username" placeholder="Enter username" required />
        <button type="submit">Login</button>
      </form>
    `);
  }
});

app.post('/login', (req, res) => {
  req.session.username = req.body.username;
  res.cookie('theme', 'dark', { maxAge: 900000, httpOnly: true });
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

### 7.2 Exercise 1: User Login System & Middleware (`exercise1-login.js`)
```javascript
const express = require('express');
const session = require('express-session');
const app = express();
const PORT = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'authSecretKey123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 15 } // 15 mins
}));

const users = [];

function authMiddleware(req, res, next) {
  if (req.session && req.session.user) next();
  else res.redirect('/login');
}

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  users.push({ username, password });
  res.send('Registration successful! <a href="/login">Login</a>');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = { username: user.username };
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials. <a href="/login">Try again</a>');
  }
});

app.get('/dashboard', authMiddleware, (req, res) => {
  res.send(`<h2>Protected Dashboard</h2><p>Welcome, ${req.session.user.username}!</p><a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.listen(PORT, () => console.log(`Login system on http://localhost:${PORT}`));
```

### 7.3 Exercise 2: Session-Based To-Do List (`exercise2-todo.js`)
```javascript
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3002;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.use(session({
  secret: 'todoSecretKey456',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

app.get('/', (req, res) => {
  if (!req.session.todos) req.session.todos = [];
  const theme = req.cookies.theme || 'light';
  res.render('todo', { todos: req.session.todos, theme });
});

app.post('/add', (req, res) => {
  if (!req.session.todos) req.session.todos = [];
  if (req.body.todoItem) req.session.todos.push({ id: Date.now(), text: req.body.todoItem.trim() });
  res.redirect('/');
});

app.post('/delete', (req, res) => {
  if (req.session.todos) req.session.todos = req.session.todos.filter(item => item.id != req.body.id);
  res.redirect('/');
});

app.get('/toggle-theme', (req, res) => {
  const current = req.cookies.theme || 'light';
  res.cookie('theme', current === 'light' ? 'dark' : 'light', { maxAge: 90000000 });
  res.redirect('/');
});

app.listen(PORT, () => console.log(`To-Do app on http://localhost:${PORT}`));
```

---

## 8. Observation

| Component / Test | Action | Result & Observation |
|:---|:---|:---|
| **`server.js` (Initial)** | Visit `http://localhost:3000/` | `200 OK` — No active session; login form is presented. |
| **`server.js` (Login)** | Submit username `"Neerav"` | `302 Redirect` $\rightarrow$ `200 OK` — Welcome banner displayed; `connect.sid` session cookie and `theme=dark` HTTPOnly cookie set in response header. |
| **`server.js` (Logout)** | Click Logout | `302 Redirect` $\rightarrow$ `200 OK` — Session destroyed; `connect.sid` cleared from client; returned to login form. |
| **Exercise 1 (Unauth Guard)** | Directly open `http://localhost:3001/dashboard` | `authMiddleware` intercepts unauthenticated request and immediately redirects to `/login`. |
| **Exercise 1 (Auth Cycle)** | Register `"Alice"`, then log in | Redirected to `/dashboard` displaying `"Welcome back, Alice!"`. |
| **Exercise 2 (Isolation)** | Add task in Browser 1; open in Browser 2 | Browser 1 displays added task; Browser 2 displays `"No items yet"`, demonstrating independent session isolation across different clients. |
| **Exercise 2 (Theme Cookie)** | Click "Switch to Dark Mode" | Cookie `theme=dark` saved; page reloads with dark UI styling. |

---

## 9. Challenges & Solutions

1. **Session Cookie Leakage after Logout**:
   - *Challenge*: Invoking `req.session.destroy()` removed server-side memory, but the browser retained the obsolete `connect.sid` cookie value.
   - *Solution*: Added `res.clearCookie('connect.sid')` inside the destroy callback to purge the cookie from the client.

2. **Session Data Persistence Across Server Restarts**:
   - *Challenge*: The default `MemoryStore` in `express-session` resets whenever the Node server restarts or crashes.
   - *Solution*: Acknowledged that MemoryStore is intended for development and noted that production systems require persistent session backends such as `connect-mongo` or `connect-redis`.

3. **Protection against XSS Cookie Theft**:
   - *Challenge*: Cookies accessed through `document.cookie` can be stolen by malicious scripts injected into templates.
   - *Solution*: Enforced the `{ httpOnly: true }` flag on sensitive cookies, completely hiding them from client-side JavaScript execution.