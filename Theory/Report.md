# 📚 Comprehensive Lab Report: Backend Development Architecture & Engineering

This comprehensive report details the design, implementation, and analysis of backend systems across multiple languages, runtimes, and architectural patterns (Express.js, Session Management, FastAPI REST, FastAPI Jinja2 SSR, Flask Microservices, and SQLAlchemy ORM).

---

# ========================================================
# UNIT 01: EXPRESS.JS ARCHITECTURE, ROUTING & EJS SSR
# ========================================================

## 1. Number
**Theory Unit 01**

## 2. Title
**Core Backend Development with Express.js: Event-Driven Routing, RESTful APIs, and EJS Server-Side Rendering**

## 3. Object (Objective)
- To construct an asynchronous web server using Node.js and Express.js.
- To implement dynamic route handling with URL path parameters and query strings.
- To build a decoupled REST API serving serialized JSON responses.
- To implement dynamic Server-Side Rendering (SSR) using the EJS templating engine.

## 4. Theory
Express.js is an unopinionated web framework for Node.js built around a sequential middleware architecture. When an HTTP request reaches the server, it travels through a pipeline of handlers. 
- **Routing Engine**: URL patterns are matched against registered endpoints. Route parameters (such as `/students/:id`) are captured in `req.params`.
- **Content-Type Negotiation**: The server dictates whether to emit plain text (`text/plain`), structured data (`application/json`), or HTML documents (`text/html`).
- **SSR with EJS**: Rather than executing client-side DOM manipulation via frontend frameworks, Server-Side Rendering generates full HTML on the server before transmitting it over the wire, optimizing initial page load speed and SEO.

## 5. Installation Process (Windows)
```powershell
cd D:\Backend\Backend-Dev\Theory\express_demo
npm install
node 01_basic_server.js   # Basic Server
node 02_routing.js        # Parameterized Routing
node 03_rest_api.js       # JSON REST API
node 04_ssr_html.js       # Manual HTML SSR
node 05_ssr_ejs.js        # EJS Templating SSR
```

## 6. Code
```javascript
// express_demo/05_ssr_ejs.js
const express = require("express");
const app = express();

app.set("view engine", "ejs");

const students = [
    { id: 1, name: "Aarav", branch: "CSE" },
    { id: 2, name: "Diya", branch: "ECE" },
    { id: 3, name: "Rohan", branch: "IT" }
];

app.get("/", (req, res) => res.render("home"));
app.get("/students", (req, res) => res.render("students", { students: students }));

app.listen(3000, () => console.log("Server running on port 3000"));
```

## 7. Observation
- `GET http://localhost:3000/`: Displays home page with navigation links.
- `GET http://localhost:3000/students`: Returns fully rendered HTML containing a dynamically generated unordered list of students.
- `GET http://localhost:3000/students/1`: Successfully returns student details with status `200 OK`.

## 8. Challenges
- **Port Conflict (`EADDRINUSE`)**: Resolved by killing hanging Node processes in PowerShell (`Stop-Process -Name node -Force`).
- **Relative Path Views**: Resolved by ensuring working directory context matches the location of the `views/` folder.

---

# ========================================================
# UNIT 02: SESSION MANAGEMENT & STATE PERSISTENCE
# ========================================================

## 1. Number
**Theory Unit 02**

## 2. Title
**Stateful Authentication and Session Management using Express-Session and Cryptographic Cookies**

## 3. Object (Objective)
- To introduce state persistence into the inherently stateless HTTP protocol.
- To configure signed, tamper-proof session cookies using secret keys.
- To implement authentication state workflows (`/login`, `/profile`, `/logout`).

## 4. Theory
HTTP is completely stateless — each request is handled independently with no intrinsic knowledge of previous interactions.
- **Session Identification (`connect.sid`)**: The server allocates an in-memory session store mapped to a unique UUID. This UUID is stored in a cookie sent to the client.
- **Cryptographic Signature**: The cookie value is hashed using HMAC with a server-side secret (`mySecretKey`), preventing client-side forgery.
- **Session Lifecycle**: On `/login`, session data is attached to `req.session`. Subsequent requests include the cookie, allowing the server to look up the session object. On `/logout`, `req.session.destroy()` purges the server-side memory.

## 5. Installation Process (Windows)
```powershell
cd D:\Backend\Backend-Dev\Theory\Sessions
npm install
node app.js
```

## 6. Code
```javascript
// Sessions/app.js
const express = require('express');
const session = require('express-session');
const app = express();

app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // 1 minute expiry
}));

app.get('/login', (req, res) => {
  req.session.username = 'JohnDoe';
  res.send('Session started for ' + req.session.username);
});

app.get('/profile', (req, res) => {
  if (req.session.username) {
    res.send('Welcome ' + req.session.username);
  } else {
    res.send('Please log in first.');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Error destroying session');
    res.send('Session destroyed successfully');
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## 7. Observation
1. Navigating to `/profile` initially returns: `"Please log in first."` (`HTTP 200`).
2. Navigating to `/login` sets the `Set-Cookie: connect.sid=...` header and returns `"Session started for JohnDoe"`.
3. Revisiting `/profile` now returns: `"Welcome JohnDoe"`.
4. Navigating to `/logout` clears the session; subsequent visits to `/profile` require logging in again.

## 8. Challenges
- **Session Invalidation**: After `req.session.destroy()`, the client browser still holds the cookie header unless explicitly cleared or expired. Handled by checking `if (req.session.username)` guard clauses.

---

# ========================================================
# UNIT 03: MODERN RESTFUL APIS WITH FASTAPI & PYDANTIC
# ========================================================

## 1. Number
**Theory Unit 03**

## 2. Title
**High-Performance RESTful API Engineering with FastAPI, Pydantic Schema Validation, and OpenAPI Documentation**

## 3. Object (Objective)
- To develop a type-safe asynchronous REST API in Python using FastAPI.
- To enforce automated request body validation and response serialization using Pydantic models.
- To implement full CRUD (Create, Read, Update, Delete) operations with standard HTTP status codes.

## 4. Theory
FastAPI is a modern, high-performance web framework for building APIs with Python based on standard Python type hints.
- **Pydantic Validation**: Models inheriting from `BaseModel` enforce runtime data validation. Malformed inputs trigger automatic `422 Unprocessable Entity` responses.
- **Automatic Documentation**: FastAPI automatically produces interactive OpenAPI Swagger (`/docs`) and ReDoc (`/redoc`) documentation from the code type hints.
- **REST Semantics**: Correct mapping of HTTP verbs (`GET` for reading, `POST` with `201 Created` for creation, `PUT` for updates, `DELETE` with `204 No Content` for deletion).

## 5. Installation Process (Windows)
```powershell
cd D:\Backend\Backend-Dev\Theory
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

cd FastAPI\01_rest_api
uvicorn main:app --reload --port 5000
```

## 6. Code
```python
# FastAPI/01_rest_api/main.py
from fastapi import FastAPI, HTTPException, Query
import uvicorn
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="Student Management API", version="1.0.0")

class Student(BaseModel):
    id: int
    name: str
    branch: str

class StudentCreate(BaseModel):
    name: str
    branch: str

students: List[Student] = [
    Student(id=1, name="Anuj", branch="CSE"),
    Student(id=2, name="Diya", branch="ECE"),
    Student(id=3, name="Rohan", branch="IT"),
]
next_id = 4

@app.get("/students", response_model=List[Student])
def list_students(branch: Optional[str] = Query(None)):
    if branch:
        return [s for s in students if s.branch.upper() == branch.upper()]
    return students

@app.get("/students/{student_id}", response_model=Student)
def get_student(student_id: int):
    for student in students:
        if student.id == student_id:
            return student
    raise HTTPException(status_code=404, detail="Student not found")

@app.post("/students", response_model=Student, status_code=201)
def create_student(student: StudentCreate):
    global next_id
    new_student = Student(id=next_id, **student.model_dump())
    students.append(new_student)
    next_id += 1
    return new_student

@app.delete("/students/{student_id}", status_code=204)
def delete_student(student_id: int):
    for i, student in enumerate(students):
        if student.id == student_id:
            students.pop(i)
            return
    raise HTTPException(status_code=404, detail="Student not found")
```

## 7. Observation
- `GET /students` returns all student records in JSON format with status `200 OK`.
- `GET /students?branch=CSE` successfully filters records to only branch matches.
- `POST /students` with `{"name": "Kavya", "branch": "CSE"}` returns status `201 Created` with allocated ID `4`.
- `DELETE /students/1` returns status `204 No Content`.
- Navigating to `/docs` presents a fully functional interactive Swagger UI testing sandbox.

## 8. Challenges
- **Pydantic v2 Migration**: Using `student.model_dump()` instead of deprecated `student.dict()` to maintain compatibility with modern Pydantic v2.

---

# ========================================================
# UNIT 04: SERVER-SIDE RENDERING WITH FASTAPI & JINJA2
# ========================================================

## 1. Number
**Theory Unit 04**

## 2. Title
**Server-Side Rendering, Template Inheritance, Form Submission & Server Validation with FastAPI and Jinja2**

## 3. Object (Objective)
- To implement Server-Side Rendering (SSR) in Python using FastAPI and Jinja2 templates.
- To build modular templates utilizing base layouts (`base.html`), blocks, and loops.
- To implement form handling via `python-multipart` and the Post-Redirect-Get (PRG) pattern with `303 See Other`.
- To enforce robust server-side validation against duplicate inputs and malformed identifiers.

## 4. Theory
- **Jinja2 Templating**: Templates interpolate variables (`{{ student.name }}`), iterate over collections (`{% for %}`), and handle fallback states (`{% else %}`).
- **Static Assets**: Stylesheets and images are served via `app.mount("/static", StaticFiles(directory="static"))`. The template resolves these paths using `url_for('static', path='style.css')`.
- **Post-Redirect-Get (PRG)**: When submitting a POST form, returning a direct HTML response allows duplicate submissions if the user refreshes. Redirecting with HTTP `303 See Other` to `/students` guarantees clean idempotent browser navigation.
- **Two-Tier Validation**: Client-side HTML5 attributes (`required`, `pattern`) improve UX, but server-side validation is strictly enforced because HTTP requests can be crafted or manipulated independently.

## 5. Installation Process (Windows)
```powershell
cd D:\Backend\Backend-Dev\Theory\FastAPI\02_ssr_jinja
pip install fastapi uvicorn jinja2 python-multipart
uvicorn main:app --reload --port 8000
```
Open browser at: `http://127.0.0.1:8000`

## 6. Code
```python
# FastAPI/02_ssr_jinja/main.py (excerpt)
from fastapi import FastAPI, Form, Request, status
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(title="Student Details", version="1.0.0")
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

students = [
    {"name": "Krish Pawar", "sap_id": "590017543", "batch": "B.Tech CSE Core 5"},
    {"name": "Divyansh Panwar", "sap_id": "590018990", "batch": "B.Tech CSE Core 5"},
]

@app.get("/")
@app.get("/students")
async def students_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="students.html",
        context={"students": students}
    )

@app.post("/students/add")
async def add_student(
    request: Request,
    name: str = Form(...),
    sap_id: str = Form(...),
    batch: str = Form(...)
):
    name, sap_id, batch = name.strip(), sap_id.strip(), batch.strip()
    if not sap_id.isdigit() or len(sap_id) != 9:
        return templates.TemplateResponse(
            request=request,
            name="add_student.html",
            context={"error": "SAP ID must be exactly 9 digits.", "name": name, "sap_id": sap_id, "batch": batch}
        )
    students.append({"name": name, "sap_id": sap_id, "batch": batch})
    return RedirectResponse(url="/students", status_code=status.HTTP_303_SEE_OTHER)
```

## 7. Observation
- Visiting `/students` renders a clean table displaying existing students with custom CSS.
- Submitting an invalid SAP ID (e.g. `123`) preserves user input in the form and renders a red error alert: `"SAP ID must be exactly 9 digits."`
- Submitting valid data redirects to `/students`, showing the newly added student in the table immediately.

## 8. Challenges
- **Missing `request` Context in Jinja2**: FastAPI requires passing `request` in `context` or `request=request` so Jinja2 can generate valid URLs for stylesheets and routes.
- **Form Data Parsing**: Requires `python-multipart` installed; otherwise FastAPI raises an internal server error on form post.

---

# ========================================================
# UNIT 05: LIGHTWEIGHT MICROSERVICES WITH FLASK
# ========================================================

## 1. Number
**Theory Unit 05**

## 2. Title
**Lightweight Microservice Architecture, JSON Serialization, and Endpoint Routing with Flask**

## 3. Object (Objective)
- To construct a minimal microservice using Python Flask.
- To demonstrate WSGI routing and JSON serialization using `jsonify`.
- To compare Flask's synchronous micro-framework approach with asynchronous frameworks like FastAPI.

## 4. Theory
Flask is a lightweight WSGI web application micro-framework. It is designed to make getting started quick and easy, with the ability to scale up to complex applications.
- **Decorator Routing**: `@app.route()` registers view functions for specific URI paths.
- **JSON Serialization**: Flask's `jsonify()` serializes dictionaries into valid JSON strings and automatically attaches the `Content-Type: application/json` HTTP header.

## 5. Installation Process (Windows)
```powershell
cd D:\Backend\Backend-Dev\Theory\flask
pip install flask
python app.py
```
Server runs on: `http://127.0.0.1:5000/`

## 6. Code
```python
# flask/app.py
from flask import Flask, jsonify

app = Flask(__name__)

data = {
    "name": "John Doe",
    "age": 30,
    "city": "New York"
}

@app.route("/")
def home():
    return "Backend Server Running"

@app.route("/data")
def get_data():
    return jsonify(data)

@app.route("/html")
def get_html():
    return f"""
    <!DOCTYPE html>
    <html>
    <head><title>Flask Backend</title></head>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Backend Server Running</h1>
        <p>Visit <a href='/data'>/data</a> for JSON response.</p>
        <h3>User Profile:</h3>
        <ul>
            <li><strong>Name:</strong> {data['name']}</li>
            <li><strong>Age:</strong> {data['age']}</li>
            <li><strong>City:</strong> {data['city']}</li>
        </ul>
    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
```

## 7. Observation
- `GET /` returns plain text: `"Backend Server Running"`.
- `GET /data` returns structured JSON: `{"age": 30, "city": "New York", "name": "John Doe"}` with header `Content-Type: application/json`.
- `GET /html` renders an HTML page with clickable navigation links.

## 8. Challenges
- **Host Binding**: Configured `host="127.0.0.1"` explicitly to avoid Windows firewall security prompts when developing locally.

---

# ========================================================
# UNIT 06: RELATIONAL DATA MODELING WITH SQLALCHEMY ORM
# ========================================================

## 1. Number
**Theory Unit 06**

## 2. Title
**Relational Data Modeling, Foreign Key Constraints, Relationships, and CRUD Operations with SQLAlchemy ORM and SQLite**

## 3. Object (Objective)
- To design a relational schema (Departments, Students, Courses, Enrollments) with primary and foreign key constraints.
- To implement Object-Relational Mapping (ORM) using SQLAlchemy declarative models.
- To execute transaction-safe CRUD operations (Create, Read, Update, Delete) against an SQLite database.

## 4. Theory
Object-Relational Mapping (ORM) is a technique that enables querying and manipulating data from a database using an object-oriented paradigm.
- **Data Abstraction**: Database tables map to Python classes, table columns map to class attributes, and table rows map to class instances.
- **Relational Integrity**:
  - `One-to-Many`: One Department has many Students (`relationship(..., back_populates=...)`).
  - `Many-to-Many`: Students enroll in multiple Courses; Courses enroll multiple Students. Resolved via the `Enrollment` junction table holding composite foreign keys.
- **Session Transactions**: SQLAlchemy uses the Unit of Work pattern. Changes made to models are queued and committed atomically with `session.commit()`, or rolled back upon errors.

## 5. Installation Process (Windows)
```powershell
cd D:\Backend\Backend-Dev\Theory\Data_Modeling
pip install sqlalchemy
python main.py
```

## 6. Code
```python
# Data_Modeling/main.py (excerpt)
from datetime import date
from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

engine = create_engine("sqlite:///students.db")
Base = declarative_base()
Session = sessionmaker(bind=engine)
session = Session()

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    students = relationship("Student", back_populates="department")
    courses = relationship("Course", back_populates="department")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    branch = Column(String(50))
    enrollment_date = Column(Date)
    department_id = Column(Integer, ForeignKey("departments.id"))
    department = relationship("Department", back_populates="students")
    enrollments = relationship("Enrollment", back_populates="student")

class Course(Base):
    __tablename__ = "courses"
    id = Column(String(10), primary_key=True)
    title = Column(String(100), nullable=False)
    credits = Column(Integer, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    department = relationship("Department", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"
    student_id = Column(Integer, ForeignKey("students.id"), primary_key=True)
    course_id = Column(String(10), ForeignKey("courses.id"), primary_key=True)
    semester = Column(String(20))
    grade = Column(String(2))
    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

Base.metadata.create_all(engine)
```

## 7. Observation
- `Base.metadata.create_all(engine)` automatically creates `students.db` containing `departments`, `students`, `courses`, and `enrollments` tables.
- Inserts a new student record into SQLite, executes a filter query on `branch == "CSE"`, updates branch to `"ECE"`, and commits the transaction cleanly.

## 8. Challenges
- **SQLite Foreign Key Enforcement**: SQLite by default does not enforce foreign keys unless `PRAGMA foreign_keys = ON;` is issued on the connection. Handled cleanly at the ORM layer.
- **SQLAlchemy 2.0 Declarative Base**: Migrated from legacy `sqlalchemy.ext.declarative` import to modern `from sqlalchemy.orm import declarative_base`.