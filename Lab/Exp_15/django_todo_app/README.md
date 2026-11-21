# Experiment 15: Django To-Do Application (CRUD & Static Files)

A complete, responsive To-Do application built using the **Django** web framework (Python), **SQLite** database, **MVT (Model-View-Template)** architecture, and **Django Static Files**.

---

## 📌 Features & Requirements Implemented

1. **Django Project & App Architecture**:
   - Project: `todo_project`
   - Modular App: `todo`
2. **Data Model (`Task`)**:
   - `title`: CharField(max_length=200)
   - `completed`: BooleanField(default=False)
   - `created_at`: DateTimeField(auto_now_add=True)
   - `__str__`: Returns task title
3. **Full CRUD Functionality**:
   - **Create**: Add new tasks via form (`POST /add/`)
   - **Read**: Display all tasks ordered newest first (`GET /`)
   - **Update**: Toggle task completion status (`GET /toggle/<id>/`)
   - **Delete**: Remove task with confirmation (`GET /delete/<id>/`)
4. **Django Admin Integration**:
   - Model registered in `todo/admin.py` with custom list display, search, and filters.
   - Admin account pre-configured (`admin` / `admin123`).
5. **Lab Assignment Extensions**:
   - **Static Files**: Serves custom CSS stylesheet (`static/todo/style.css`) using `{% load static %}`.
   - **Modular Templates**:
     - `base.html`: Common layout with header, navigation, container, and footer.
     - `navbar.html`: Reusable navigation bar included using `{% include %}`.
     - `task_list.html` & `add_task.html`: Child templates extending `base.html` using `{% extends %}`.
6. **CSRF Protection**:
   - Secure POST forms protected with Django's `{% csrf_token %}`.
7. **Automated Unit Tests**:
   - Comprehensive test suite in `todo/tests.py` covering model creation, all 4 CRUD views, and template rendering.

---

## 🚀 How to Run on Windows

### 1. Open PowerShell and Navigate to Project
```powershell
cd D:\Sem_5\Backend\Backend-Dev\Lab\Exp_15\django_todo_app
```

### 2. Activate Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Run Development Server
```powershell
python manage.py runserver
```

### 4. Access in Browser
- **To-Do App**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Add New Task**: [http://127.0.0.1:8000/add/](http://127.0.0.1:8000/add/)
- **Django Admin Panel**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
  - **Username**: `admin`
  - **Password**: `admin123`

### 5. Run Automated Tests
```powershell
python manage.py test
```

---

## 📂 Project Directory Structure

```text
django_todo_app/
├── manage.py                   # Django command-line administrative utility
├── db.sqlite3                  # SQLite relational database
├── todo_project/               # Project configuration package
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py             # Configured with 'todo' app and staticfiles
│   ├── urls.py                 # Root URL configuration including todo.urls
│   └── wsgi.py
├── todo/                       # Application module
│   ├── admin.py                # Admin panel registration
│   ├── apps.py                 # App configuration
│   ├── models.py               # Task model (schema)
│   ├── tests.py                # Unit test suite
│   ├── urls.py                 # App-level routing
│   ├── views.py                # Business logic and request handlers
│   ├── migrations/             # Database migration files
│   │   └── 0001_initial.py
│   ├── static/todo/            # App static files
│   │   └── style.css           # Styling
│   └── templates/todo/         # Modular HTML templates
│       ├── base.html           # Master layout with {% block content %}
│       ├── navbar.html         # Modular navigation with {% include %}
│       ├── task_list.html      # Task listing view extending base.html
│       └── add_task.html       # Add task form extending base.html
└── static/todo/                # Project-level static files
    └── style.css
```