# Lab Report: Express.js Architecture, Routing, REST API & Server-Side Rendering

---

## 1. Number
**Theory Lab Unit 01 (Lectures 1, 2, 3, 4 & 5)**

---

## 2. Title
**Building Scalable Web Applications with Express.js: Basic Server Setup, Route Parameter Handling, JSON REST APIs, and EJS Server-Side Rendering**

---

## 3. Object (Objective)
1. To understand the core architecture of Node.js and the Express.js web application framework.
2. To implement sequential routing, path parameters, and query strings.
3. To design and expose RESTful endpoints serving structured JSON payloads.
4. To implement Server-Side Rendering (SSR) using raw HTML string generation and dynamic EJS (Embedded JavaScript) templating engines.
5. To configure and deploy the applications on a Windows development environment.

---

## 4. Theory

### 4.1 Node.js & Express.js Architecture
Node.js is an open-source, cross-platform runtime environment built on Google Chrome's V8 engine that executes JavaScript code outside a web browser. It operates on an **event-driven, single-threaded, non-blocking I/O model**, making it lightweight and efficient for handling high-concurrency web servers.

Express.js is a minimal and flexible Node.js web application framework providing a robust set of features for web and mobile applications:
- **Middleware Pipeline**: Functions that have access to the request object (`req`), response object (`res`), and the next middleware function (`next()`).
- **Routing Engine**: Maps HTTP request methods (GET, POST, PUT, DELETE) and URL paths to specific handler functions.
- **Content Negotiation**: Facilitates sending raw text, JSON payloads (`res.json()`), or server-rendered HTML documents (`res.render()`).

### 4.2 Progressive Architectural Evolution
1. **Basic Server**: Instantiating an Express application, binding to an IP address and TCP port (e.g., `localhost:3000`), and serving a static root endpoint.
2. **Modular Routing & Parameters**: Handling parameterized URLs (e.g., `/students/:id`) where `req.params.id` captures dynamic segments from the path.
3. **RESTful JSON Delivery**: Formatting entity collections into standardized JSON data, enabling decoupled frontends (React, Vue, mobile apps) or programmatic API clients.
4. **Manual Server-Side Rendering**: Generating HTML markup directly within route handlers using JavaScript template literals. While functional, this tightly couples presentation with business logic.
5. **Template Engine SSR (EJS)**: Employing EJS (`Embedded JavaScript templates`) to separate presentation logic (`.ejs` files in `views/`) from server controller logic. The server injects data models into templates at runtime to produce complete HTML pages sent to the browser.

---

## 5. Installation Process (Windows Setup)

### Prerequisites
- Node.js (v18.x or higher) installed on Windows. Verify using:
  ```powershell
  node --version
  npm --version
  ```

### Step-by-Step Installation
1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd D:\Backend\Backend-Dev\Theory\express_demo
   ```

2. Initialize dependencies using `package.json`:
   ```powershell
   npm install
   ```

3. Running the Progressive Steps:
   - **Step 1 (Basic Server)**:
     ```powershell
     npm run step1
     # or: node 01_basic_server.js
     ```
   - **Step 2 (Routing & Path Parameters)**:
     ```powershell
     npm run step2
     # or: node 02_routing.js
     ```
   - **Step 3 (REST API with JSON)**:
     ```powershell
     npm run step3
     # or: node 03_rest_api.js
     ```
   - **Step 4 (Manual HTML SSR)**:
     ```powershell
     npm run step4
     # or: node 04_ssr_html.js
     ```
   - **Step 5 (EJS Template Engine SSR)**:
     ```powershell
     npm run step5
     # or: node 05_ssr_ejs.js
     ```

---

## 6. Code

### 6.1 Step 1: Basic Server (`01_basic_server.js`)
```javascript
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Backend Server Running");
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
```

### 6.2 Step 2: Routing & Path Parameters (`02_routing.js`)
```javascript
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to the Student Management API");
});

app.get("/students", (req, res) => {
    res.send("List of all students");
});

app.get("/students/1", (req, res) => {
    res.send("Student: Aarav, Roll No: 1");
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
```

### 6.3 Step 3: REST API with JSON Serialization (`03_rest_api.js`)
```javascript
const express = require("express");
const app = express();

const students = [
    { id: 1, name: "Aarav", branch: "CSE" },
    { id: 2, name: "Diya", branch: "ECE" },
    { id: 3, name: "Rohan", branch: "IT" }
];

app.get("/", (req, res) => {
    res.send("Student Management API");
});

app.get("/students", (req, res) => {
    res.json(students);
});

app.get("/students/:id", (req, res) => {
    const student = students.find(s => s.id === parseInt(req.params.id));
    if (student) {
        res.json(student);
    } else {
        res.status(404).json({ error: "Student not found" });
    }
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
```

### 6.4 Step 4: Manual HTML Server-Side Rendering (`04_ssr_html.js`)
```javascript
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("<h1>Student Management API</h1><p>Welcome to the backend server.</p>");
});

app.get("/students", (req, res) => {
    const students = [
        { id: 1, name: "Aarav", branch: "CSE" },
        { id: 2, name: "Diya", branch: "ECE" },
        { id: 3, name: "Rohan", branch: "IT" }
    ];

    let html = "<h2>All Students</h2><ul>";
    students.forEach(s => {
        html += `<li><strong>${s.name}</strong> — ${s.branch}</li>`;
    });
    html += "</ul>";

    res.send(html);
});

app.get("/students/:id", (req, res) => {
    const students = [
        { id: 1, name: "Aarav", branch: "CSE" },
        { id: 2, name: "Diya", branch: "ECE" },
        { id: 3, name: "Rohan", branch: "IT" }
    ];

    const student = students.find(s => s.id === parseInt(req.params.id));
    if (student) {
        res.send(`<h2>${student.name}</h2><p>Branch: ${student.branch}</p>`);
    } else {
        res.status(404).send("<h2>Student not found</h2>");
    }
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
```

### 6.5 Step 5: EJS Template Engine SSR (`05_ssr_ejs.js`)
```javascript
const express = require("express");
const app = express();

app.set("view engine", "ejs");

const students = [
    { id: 1, name: "Aarav", branch: "CSE" },
    { id: 2, name: "Diya", branch: "ECE" },
    { id: 3, name: "Rohan", branch: "IT" }
];

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/students", (req, res) => {
    res.render("students", { students: students });
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
```

#### Associated View: `views/students.ejs`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Students</title>
</head>
<body>
    <h1>All Students</h1>
    <ul>
        <% students.forEach(student => { %>
            <li><strong><%= student.name %></strong> — <%= student.branch %></li>
        <% }); %>
    </ul>
    <a href="/">Back to Home</a>
</body>
</html>
```

---

## 7. Observation

| Step | Executed Command | Endpoint Tested | Observed HTTP Status & Output |
|:---:|:---|:---|:---|
| **Step 1** | `node 01_basic_server.js` | `GET http://localhost:3000/` | `200 OK` — Text: `"Backend Server Running"` |
| **Step 2** | `node 02_routing.js` | `GET http://localhost:3000/students/1` | `200 OK` — Text: `"Student: Aarav, Roll No: 1"` |
| **Step 3** | `node 03_rest_api.js` | `GET http://localhost:3000/students` | `200 OK` — JSON array of 3 student objects |
| **Step 3** | `node 03_rest_api.js` | `GET http://localhost:3000/students/99` | `404 Not Found` — JSON: `{"error": "Student not found"}` |
| **Step 4** | `node 04_ssr_html.js` | `GET http://localhost:3000/students` | `200 OK` — Raw HTML list rendered by the browser |
| **Step 5** | `node 05_ssr_ejs.js` | `GET http://localhost:3000/students` | `200 OK` — Complete dynamic HTML page compiled via EJS engine |

---

## 8. Challenges & Solutions

1. **Port Conflicts (`EADDRINUSE: 3000`)**:
   - *Challenge*: Starting a new server while an earlier step process was still listening on port 3000 triggered `Error: listen EADDRINUSE: address already in use :::3000`.
   - *Solution*: Stopped running instances in PowerShell using `Get-Process node | Stop-Process -Force` or terminating background sessions before switching steps.

2. **Template Directory Resolution on Windows**:
   - *Challenge*: When moving `server.js` and `views/` into subfolders, Express looks for `./views` relative to `process.cwd()`. Running the script from outside the folder resulted in `Failed to lookup view "students" in views directory`.
   - *Solution*: Configured explicit directory paths or executed commands directly within `express_demo`, or configured `app.set('views', path.join(__dirname, 'views'))`.

3. **String Parsing for Route Parameters**:
   - *Challenge*: `req.params.id` is parsed as a string (`"1"`), so strict equality `s.id === req.params.id` failed against integer IDs (`1`).
   - *Solution*: Applied `parseInt(req.params.id)` to safely convert the parameter before comparison.