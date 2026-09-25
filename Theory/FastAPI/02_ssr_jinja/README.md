# Student Details — FastAPI Server-Side Rendering (SSR)

A complete FastAPI application using Jinja2 templates that serves student details (name, SAP ID, batch) as server-rendered HTML. The data lives on the server; the browser receives finished HTML pages.

---

## 💻 Run on Windows

### 1. PowerShell Setup
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# (Optional: If execution policy prevents script running)
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

### 2. Command Prompt (cmd.exe) Setup
```cmd
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open browser at: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 📌 Routes

| Method | Path             | What it does                              |
|--------|------------------|-------------------------------------------|
| GET    | `/`              | Student table (same as `/students`)       |
| GET    | `/students`      | Student table view                        |
| GET    | `/students/add`  | Blank student registration form           |
| POST   | `/students/add`  | Validates, saves, redirects to the table  |

---

## 📂 Structure

```text
02_ssr_jinja/
├── main.py                     # FastAPI application & route controllers
├── requirements.txt            # Python dependencies
├── templates/
│   ├── base.html               # Shared layout & navigation
│   ├── students.html           # Student listing table
│   └── add_student.html        # Form with validation
└── static/
    └── style.css               # Styling
```

---

## ⚙️ How the Rendering Works

1. `Jinja2Templates(directory="templates")` points FastAPI to the template folder.
2. A route handler returns `TemplateResponse(request=request, name=..., context={...})`; Jinja2 renders placeholders into static HTML and sends `Content-Type: text/html`.
3. The `request` object is mandatory so Jinja2 can resolve relative static paths via `url_for('static', path='style.css')`.
4. The table loop uses Jinja2's `{% for %} … {% else %} … {% endfor %}`, which cleanly handles the empty list condition.

---

## 🛡️ Server-Side Validation

`main.py` explicitly re-validates each field (`required`, digits check, length == 9, uniqueness). Client-side HTML validation is easily bypassed with curl or developer tools, so strict server-side validation is enforced before appending records.