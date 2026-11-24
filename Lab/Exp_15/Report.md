---
title: "Experiment 15: Django To-Do Application"
layout: default
---
{% raw %}
# Lab Report: Experiment 15 — Django To-Do Application

**Course:** Backend Development  
**Student:** Neerav Kumar Sharma  
**SAP ID:** 590018263  
**Institution:** UPES Dehradun  

---

---

## 1. Number
**Laboratory Experiment 15**

---

## 2. Title
**Design and Development of a Web-Based To-Do Application using Django Web Framework, SQLite Database, MVT Pattern, and Static File Management**

---

## 3. Object (Objective)
1. To install, configure, and initialize a web project utilizing the **Django** Python web framework and **SQLite** relational database.
2. To understand Django's project directory structure, the role of generated configuration files (`settings.py`, `urls.py`, `wsgi.py`, `asgi.py`), and the utility of `manage.py` administrative subcommands.
3. To implement the **Model-View-Template (MVT)** architectural design pattern.
4. To define a database model using Django's Object-Relational Mapper (ORM) and apply migrations to create database tables.
5. To implement complete CRUD operations (Create, Read, Update, Delete) with route parameter handling and CSRF security.
6. To solve the Lab Assignment Task by integrating:
   - A dedicated `static` directory for serving stylesheets (`style.css`).
   - Modular, reusable template architecture using `&#123;% extends %&#125;` (template inheritance) and `&#123;% include %&#125;` (sub-template composition).

---

## 4. Theory

### 4.1 Django Architecture: The MVT Pattern
Django is a high-level, "batteries-included" Python web framework designed around the **Model-View-Template (MVT)** architectural pattern:
- **Model (`models.py`)**: The data access layer. Uses an Object-Relational Mapper (ORM) to define database schemas as native Python classes without writing raw SQL.
- **View (`views.py`)**: The business logic and request-processing layer. Receives HTTP requests, interacts with models to fetch/mutate data, and passes context to templates or returns HTTP redirects.
- **Template (`templates/`)**: The presentation layer. Uses the Django Template Language (DTL) to interpolate dynamic variables, loops, conditionals, and blocks into HTML sent to the browser.
- **URL Dispatcher (`urls.py`)**: Maps incoming URI paths via pattern matching and regular expressions/path converters (e.g. `<int:task_id>`) to corresponding view functions.

### 4.2 Django ORM and Migrations
Django abstracts database interactions through its ORM:
- **`makemigrations <app>`**: Inspects changes in `models.py` and produces version-controlled migration scripts in `migrations/` detailing schema alterations.
- **`migrate`**: Executes SQL DDL commands against the configured database engine (SQLite, PostgreSQL, MySQL) to apply pending migrations.
- **QuerySets**: Lazy database queries written in Python (e.g., `Task.objects.all().order_by('-created_at')`, `Task.objects.create(...)`, `task.delete()`).

### 4.3 Template Modularization and Static Files
- **Template Inheritance (`&#123;% extends %&#125;`)**: Establishes a master skeleton (`base.html`) containing shared HTML boilerplate, `<head>` elements, and layout containers, with defined `&#123;% block content %&#125;` placeholders overridden by child templates.
- **Template Inclusion (`&#123;% include %&#125;`)**: Injects standalone sub-components (such as `navbar.html`) into layouts, adhering to the Don't Repeat Yourself (DRY) principle.
- **Static Files Serving (`&#123;% load static %&#125;`)**: Static assets (CSS, JavaScript, images) are served through `django.contrib.staticfiles`. In development, Django automatically serves files from app-level `static/` folders and directories registered in `STATICFILES_DIRS`.

---

## 5. Installation & Setup Process (Windows)

### Prerequisites
- Python 3.10+ installed on Windows.
- Windows PowerShell or Command Prompt.

### Step-by-Step Commands
1. Navigate to the experiment directory:
   ```powershell
   cd D:\Sem_5\Backend\Backend-Dev\Lab\Exp_15\django_todo_app
   ```

2. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

3. Install Django (if not already installed):
   ```powershell
   pip install django
   ```

4. Create project and app:
   ```powershell
   django-admin startproject todo_project .
   python manage.py startapp todo
   ```

5. Run database migrations:
   ```powershell
   python manage.py makemigrations todo
   python manage.py migrate
   ```

6. Create an admin superuser:
   ```powershell
   python manage.py createsuperuser
   # Created username: admin, password: admin123
   ```

7. Run system validation checks & automated test suite:
   ```powershell
   python manage.py check
   python manage.py test
   ```

8. Start the development web server:
   ```powershell
   python manage.py runserver
   ```
   Open browser at: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## 6. Project Structure

```text
django_todo_app/
├── manage.py                   # Django CLI administrative entry point
├── db.sqlite3                  # Relational SQLite database file
├── todo_project/               # Main configuration package
│   ├── __init__.py             # Python package marker
│   ├── asgi.py                 # ASGI configuration for async deployment
│   ├── settings.py             # Global settings (INSTALLED_APPS, DATABASES, STATIC)
│   ├── urls.py                 # Top-level routing delegating to todo.urls
│   └── wsgi.py                 # WSGI configuration for production deployment
├── todo/                       # Application module
│   ├── admin.py                # Admin site model registration
│   ├── apps.py                 # App configuration class
│   ├── models.py               # Data schema definition (Task model)
│   ├── tests.py                # Automated unit tests for models & views
│   ├── urls.py                 # App-level URL routes
│   ├── views.py                # View handlers (CRUD operations)
│   ├── migrations/             # Database migration files
│   │   └── 0001_initial.py
│   ├── static/todo/            # App static assets
│   │   └── style.css           # Custom CSS styling
│   └── templates/todo/         # Modular Django templates
│       ├── base.html           # Master layout with &#123;% block content %&#125;
│       ├── navbar.html         # Navigation bar loaded via &#123;% include %&#125;
│       ├── task_list.html      # Task listing page extending base.html
│       └── add_task.html       # Task creation form extending base.html
└── static/todo/                # Project-level static directory
    └── style.css
```

---

## 7. Code Implementation

### 7.1 Database Model (`todo/models.py`)
```python
from django.db import models

class Task(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
```

### 7.2 Admin Panel Registration (`todo/admin.py`)
```python
from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'completed', 'created_at')
    list_filter = ('completed', 'created_at')
    search_fields = ('title',)
```

### 7.3 Controller Views (`todo/views.py`)
```python
from django.shortcuts import render, redirect, get_object_or_404
from .models import Task

def task_list(request):
    tasks = Task.objects.all().order_by('-created_at')
    return render(request, 'todo/task_list.html', {'tasks': tasks})

def add_task(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        if title:
            Task.objects.create(title=title.strip())
        return redirect('task_list')
    return render(request, 'todo/add_task.html')

def toggle_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.completed = not task.completed
    task.save()
    return redirect('task_list')

def delete_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.delete()
    return redirect('task_list')
```

### 7.4 Routing Configuration (`todo/urls.py` & `todo_project/urls.py`)
```python
# todo/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.task_list, name='task_list'),
    path('add/', views.add_task, name='add_task'),
    path('toggle/<int:task_id>/', views.toggle_task, name='toggle_task'),
    path('delete/<int:task_id>/', views.delete_task, name='delete_task'),
]

# todo_project/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('todo.urls')),
]
```

---

## 8. Lab Assignment Task Extensions

### 8.1 Static Files (`static/todo/style.css`)
Custom CSS styling was added to demonstrate Django's static file pipeline. It provides modern cards, badges for completed status, interactive action buttons, responsive typography, and form controls. Configured in `settings.py`:
```python
STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
```

### 8.2 Modular Templates (`extend` and `include`)
- **Master Layout (`base.html`)**: Defines HTML structure, links the static stylesheet via `&#123;% static 'todo/style.css' %&#125;`, and includes the navigation bar via:
  ```html
  &#123;% load static %&#125;
  ...
  <link rel="stylesheet" href="&#123;% static 'todo/style.css' %&#125;">
  &#123;% include 'todo/navbar.html' %&#125;
  <main class="container">
      &#123;% block content %&#125;&#123;% endblock %&#125;
  </main>
  ```
- **Modular Component (`navbar.html`)**: Included across all pages to render consistent navigation and admin shortcuts.
- **Child Views (`task_list.html` & `add_task.html`)**: Inherit the master layout via `&#123;% extends 'todo/base.html' %&#125;` and provide specific page content inside `&#123;% block content %&#125;`.

---

## 9. Observation & Testing

| Feature / Operation | HTTP Method | Target URL | Observed Outcome | Status |
|:---|:---:|:---|:---|:---:|
| **Read (List Tasks)** | `GET` | `http://127.0.0.1:8000/` | Displays list of tasks with completion strike-through, action buttons, and task counter. | `200 OK` |
| **Create (Form Display)** | `GET` | `http://127.0.0.1:8000/add/` | Renders styled task submission form with autofocus input and CSRF token. | `200 OK` |
| **Create (Submission)** | `POST` | `http://127.0.0.1:8000/add/` | Inserts new task into SQLite and redirects to task list. Task appears at top of list. | `302 Found` |
| **Update (Toggle)** | `GET` | `http://127.0.0.1:8000/toggle/<id>/` | Inverts `completed` boolean flag (`False` $\leftrightarrow$ `True`), saves to database, and redirects. | `302 Found` |
| **Delete** | `GET` | `http://127.0.0.1:8000/delete/<id>/` | Deletes record from SQLite and refreshes list without the removed item. | `302 Found` |
| **Django Admin** | `GET` | `http://127.0.0.1:8000/admin/` | Allows administrative login, filtering tasks by completion/date, and inline editing. | `200 OK` |
| **Unit Tests** | CLI | `python manage.py test` | 6 tests ran in 0.038s — all models, views, and template inclusions passed (`OK`). | Passed |

---

## 10. Challenges & Solutions

1. **CSRF Protection on POST Forms**:
   - *Challenge*: Submitting the add task form without CSRF verification triggered a `403 Forbidden: CSRF verification failed` error.
   - *Solution*: Embedded `&#123;% csrf_token %&#125;` inside `<form method="post">` in `add_task.html`, which generates a hidden cryptographic token validated by Django's `CsrfViewMiddleware`.

2. **Template Directory Precedence**:
   - *Challenge*: Placing templates in a generic `templates/` folder without namespacing can lead to collisions when multiple apps define templates with identical names.
   - *Solution*: Followed Django's standard app-namespacing convention: `todo/templates/todo/<template_name>.html`.

3. **Static File Resolution**:
   - *Challenge*: Static files failed to load when templates were accessed outside the default root.
   - *Solution*: Configured both app-level `todo/static/todo/` directory and project-level `STATICFILES_DIRS = [BASE_DIR / 'static']` in `settings.py`, and loaded files with `&#123;% load static %&#125;`.
{% endraw %}
