# Lab Report: Experiment 12 A — Node.js, Express.js, and EJS Templating

---

## 1. Number
**Laboratory Experiment 12 A**

---

## 2. Title
**Building RESTful Services and Dynamic Server-Side Rendered Applications with Node.js, Express.js, Nodemon, and EJS**

---

## 3. Object (Objective)
1. To understand and implement server-side JavaScript using Node.js and the Express.js framework.
2. To build RESTful API endpoints and handle diverse HTTP response formats (plain text, JSON, status codes, HTML).
3. To process dynamic request inputs via URL route parameters (`req.params`), query strings (`req.query`), and POST request bodies (`req.body`).
4. To integrate EJS (Embedded JavaScript) templating engine for Server-Side Rendering (SSR).
5. To configure Nodemon for automated hot-reloading during backend development.
6. To solve all assigned lab tasks (Calculator API, Student Management API, Course Timetable EJS, and Student Registration Form).

---

## 4. Theory

### 4.1 Node.js Runtime Architecture
Node.js is an open-source, cross-platform runtime environment built on Google Chrome's V8 JavaScript engine. It executes JavaScript outside the browser on a single thread utilizing an **event-driven, non-blocking asynchronous I/O model**. The event loop delegates intensive operations (disk, network) to libuv worker threads, enabling high concurrency with low memory overhead.

### 4.2 Express.js Web Framework
Express.js provides a minimal layer of web application features without obscuring Node.js capabilities:
- **Routing Engine**: Directs HTTP requests based on verb (GET, POST, PUT, DELETE) and URL path patterns.
- **Middleware Chain**: Sequential functions intercepting incoming requests to perform authentication, body parsing (`express.json()`, `express.urlencoded()`), and logging.
- **Response Methods**:
  - `res.send()`: Dispatches text, HTML, or buffers.
  - `res.json()`: Formats JavaScript objects into JSON with `Content-Type: application/json`.
  - `res.status()`: Explicitly sets HTTP status codes (e.g. `201 Created`, `400 Bad Request`, `404 Not Found`).
  - `res.render()`: Compiles view templates and outputs finished HTML.

### 4.3 EJS Templating Engine
EJS (Embedded JavaScript) enables server-side rendering by allowing developers to embed native JavaScript expressions inside HTML files:
- `<% ... %>`: Scriptlet tags for evaluation and control loops (`forEach`, `if/else`).
- `<%= ... %>`: Escaped output tags (escapes HTML entities to prevent Cross-Site Scripting - XSS).
- `<%- ... %>`: Unescaped output tags for raw markup.

---

## 5. Installation Process (Windows)

### Prerequisites
- Node.js (v18.x or later) installed and configured in Windows PATH.
- NPM (Node Package Manager).

### Execution Steps
1. Navigate to the Experiment 12 A directory:
   ```powershell
   cd D:\Backend\Backend-Dev\Lab\Exp_12\Exp_12_A
   ```

2. Initialize and install dependencies:
   ```powershell
   npm install
   ```

3. Run the basic Node.js test script:
   ```powershell
   node script.js
   ```

4. Start the Express server:
   - **Production / Standard Mode**:
     ```powershell
     npm start
     # or: node app.js
     ```
   - **Development Mode with Nodemon**:
     ```powershell
     npm run dev
     ```

5. Access the endpoints in your browser:
   - Server Welcome: `http://localhost:3000/`
   - Lab Task 1 (Details in JSON): `http://localhost:3000/my-details/json`
   - Lab Task 2 (Calculator API): `http://localhost:3000/calculate?num1=12&num2=4&operation=divide`
   - Lab Task 3 (Student Management): `http://localhost:3000/students`
   - Lab Task 4 (EJS Timetable): `http://localhost:3000/timetable`
   - Lab Task 5 (Student Registration Form): `http://localhost:3000/register-student`

---

## 6. Project Structure

```text
Exp_12_A/
├── app.js                      # Main Express server with all endpoints & lab tasks
├── script.js                   # Basic Node.js demonstrative script
├── package.json                # Project configuration & scripts
├── nodemon.json                # Nodemon auto-restart watcher configuration
└── views/                      # Server-Side EJS Templates
    ├── home.ejs                # Home landing page with navigation
    ├── users.ejs               # Tabular users list
    ├── profile.ejs             # User profile card
    ├── timetable.ejs           # Lab Task 4: Course timetable view
    ├── register-student.ejs    # Lab Task 5: Registration form
    └── registration-result.ejs # Lab Task 5: Dynamic confirmation page
```

---

## 7. Code Implementation

### 7.1 Server Application (`app.js` - Key Excerpts)
```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Lab Task 1: Basic Server returning details in text, HTML, and JSON
const myDetails = { name: "Neerav Kumar Sharma", rollNo: "590018263", branch: "B.Tech CSE" };
app.get('/my-details/text', (req, res) => res.send(`Name: ${myDetails.name} | Roll No: ${myDetails.rollNo} | Branch: ${myDetails.branch}`));
app.get('/my-details/html', (req, res) => res.send(`<h2>${myDetails.name}</h2><p>Roll: ${myDetails.rollNo}</p><p>Branch: ${myDetails.branch}</p>`));
app.get('/my-details/json', (req, res) => res.json(myDetails));

// Lab Task 2: Calculator API (add, subtract, multiply, divide, modulus, power)
app.get('/calculate', (req, res) => {
  const { num1, num2, operation } = req.query;
  const n1 = parseFloat(num1), n2 = parseFloat(num2);
  if (isNaN(n1) || isNaN(n2)) return res.status(400).json({ error: 'Valid numbers required' });

  let result;
  switch (operation) {
    case 'add': result = n1 + n2; break;
    case 'subtract': result = n1 - n2; break;
    case 'multiply': result = n1 * n2; break;
    case 'divide': result = n2 !== 0 ? n1 / n2 : 'Error: Division by zero'; break;
    case 'modulus': result = n2 !== 0 ? n1 % n2 : 'Error: Modulo by zero'; break;
    case 'power': result = Math.pow(n1, n2); break;
    default: return res.status(400).json({ error: 'Invalid operation' });
  }
  res.json({ num1: n1, num2: n2, operation, result });
});

// Lab Task 3: Student Management API
let students = [
  { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Computer Science', semester: 5 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Information Technology', semester: 4 }
];
app.get('/students', (req, res) => res.json(students));
app.get('/students/:id', (req, res) => {
  const s = students.find(item => item.id === parseInt(req.params.id));
  s ? res.json(s) : res.status(404).json({ error: 'Student not found' });
});
app.post('/students/add', (req, res) => {
  const { name, email, course, semester } = req.body;
  const newStudent = { id: students.length + 1, name, email, course, semester: parseInt(semester) };
  students.push(newStudent);
  res.status(201).json({ message: 'Student added', student: newStudent });
});

// Lab Task 4: Course Timetable EJS
app.get('/timetable', (req, res) => {
  const timetable = [
    { day: 'Monday', time: '09:00 - 10:00 AM', subject: 'Backend Development', faculty: 'Dr. Prateek Gautam' },
    { day: 'Tuesday', time: '11:00 - 01:00 PM', subject: 'Backend Dev Lab (Express & EJS)', faculty: 'Dr. Prateek Gautam' }
  ];
  res.render('timetable', { timetable });
});

// Lab Task 5: Form Handling
app.get('/register-student', (req, res) => res.render('register-student'));
app.post('/register-student', (req, res) => {
  const { name, email, course, semester } = req.body;
  const student = { id: students.length + 1, name, email, course, semester: parseInt(semester) };
  students.push(student);
  res.render('registration-result', { student });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

---

## 8. Observation

| Test / Endpoint | Method | Input Parameters | Observed Output & Status |
|:---|:---:|:---|:---|
| `/my-details/json` | `GET` | None | `200 OK` — `{"name":"Neerav Kumar Sharma","rollNo":"590018263","branch":"B.Tech CSE"}` |
| `/calculate` | `GET` | `num1=12&num2=4&operation=divide` | `200 OK` — `{"num1":12,"num2":4,"operation":"divide","result":3}` |
| `/calculate` | `GET` | `num1=5&num2=3&operation=power` | `200 OK` — `{"num1":5,"num2":3,"operation":"power","result":125}` |
| `/students` | `GET` | None | `200 OK` — JSON array of registered students |
| `/students/1` | `GET` | `:id = 1` | `200 OK` — Returns John Doe student record |
| `/timetable` | `GET` | None | `200 OK` — HTML table rendered dynamically using EJS with subject and faculty slots |
| `/register-student` | `POST` | `name, email, course, semester` | `200 OK` — Renders registration confirmation page with assigned student ID |

---

## 9. Challenges & Solutions

1. **Query Parameter Type Coercion**:
   - *Challenge*: `req.query.num1` and `num2` are parsed as strings. Using `+` concatenated strings (`"10" + "5"` = `"105"`) instead of numeric addition.
   - *Solution*: Explicitly invoked `parseFloat()` on operand values before arithmetic calculation.

2. **Template Path Resolution in Subdirectories**:
   - *Challenge*: Starting Node from repository parent directories caused Express to look for `./views` in the execution root rather than inside `Exp_12_A/`.
   - *Solution*: Used `path.join(__dirname, 'views')` to bind the view directory strictly to the file directory.

3. **Auto-Reloading Delay with Nodemon**:
   - *Challenge*: Rapid file modifications sometimes caused Nodemon to trigger multiple restarts in milliseconds.
   - *Solution*: Created `nodemon.json` specifying `"delay": "2500"` and targeted watcher extensions (`js,json,ejs`).