---
title: "Lecture 27: Django Middleware and URL Routing"
layout: default
---

# Lecture 27: Django Middleware and URL Routing

**Course:** Backend Development, Unit 3 (Frameworks and Performance Optimization)  
**Topic:** Django Custom Middleware, Request-Response Lifecycle & App-Level URL Routing  
**Student:** Neerav Kumar Sharma · B.Tech CSE · SAP ID 590018263 · UPES Dehradun  

**Source:** [`student_api/`](https://github.com/NeeravSharma31/Backend-Dev/tree/main/Theory/Lecture-27/student_api) · [`students/middleware.py`](https://github.com/NeeravSharma31/Backend-Dev/blob/main/Theory/Lecture-27/student_api/students/middleware.py) · [`students/urls.py`](https://github.com/NeeravSharma31/Backend-Dev/blob/main/Theory/Lecture-27/student_api/students/urls.py)

---

## 1. Aim

To understand and implement custom Django middleware that intercepts incoming HTTP requests and outgoing HTTP responses across the full application lifecycle, measures request execution time, sets custom response headers, and structures modular URL configurations using parameter converters (`<int:student_id>`).

---

## 2. Theoretical Architecture

### 2.1 The Django Request-Response Lifecycle & Middleware Stack

Middleware in Django operates as an "onion-skin" series of nested callables wrapping the core view handler:

```text
Client (Browser / API Consumer)
        │
        ▼ (Inward Request: Top-to-Bottom)
┌───────────────────────────────────────────────┐
│ Middleware 1: Security & Session Management   │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│ Middleware 2: SimpleLoggingMiddleware (Custom)│
│  - Captures start_time = time.perf_counter()  │
│  - Logs method & path: GET /api/students/1/   │
│  - Sets request.course_name = "Django"        │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│ URLconf (urls.py) Router & Parameter Matching │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│ View Handler: student_detail(request, id)     │
└──────────────────────┬────────────────────────┘
                       ▼ (Outward Response: Bottom-to-Top)
┌───────────────────────────────────────────────┐
│ Middleware 2: SimpleLoggingMiddleware         │
│  - Calculates duration = (now - start) * 1000 │
│  - Injects headers: X-Course, X-Response-Time │
│  - Logs status code and execution duration    │
└──────────────────────┬────────────────────────┘
                       ▼
┌───────────────────────────────────────────────┐
│ Middleware 1: SecurityMiddleware / Headers    │
└──────────────────────┬────────────────────────┘
        │
        ▼
HTTP Response (JSON 200 OK / 404 Not Found)
```

### 2.2 Middleware Contract
Every Django middleware class implements `__init__(self, get_response)` and `__call__(self, request)`:
- `get_response`: Function pointer passed by Django referencing the next component in the chain or the final view handler.
- Code placed **before** `self.get_response(request)` executes during the inward request phase.
- Code placed **after** `self.get_response(request)` executes during the outward response phase before transmitting to the client.

---

## 3. Implementation Details

### 3.1 Custom Logging Middleware (`students/middleware.py`)
```python
import time
import logging

class SimpleLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Inward phase: before the view
        start_time = time.perf_counter()
        request.course_name = "Django"
        print(f"[Middleware] Incoming Request: {request.method} {request.path}")

        # Forward to next layer
        response = self.get_response(request)

        # Outward phase: after the view returns
        duration_ms = (time.perf_counter() - start_time) * 1000
        print(f"[Middleware] Outgoing Response: {response.status_code} (took {duration_ms:.2f} ms)")

        # Inject diagnostic headers
        response["X-Course"] = "Django-Lecture-27"
        response["X-Response-Time-ms"] = f"{duration_ms:.2f}"
        return response
```

### 3.2 App-Level Modular Routing (`students/urls.py` & `views.py`)
```python
# students/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.student_list, name='student-list'),
    path('<int:student_id>/', views.student_detail, name='student-detail'),
]
```

---

## 4. Automated Testing & Verification

All 4 test scenarios ran and passed in 0.013s using Django's test runner:
```powershell
python manage.py test
```
**Output:**
```text
Creating test database for alias 'default'...
....
----------------------------------------------------------------------
Ran 4 tests in 0.013s

OK
Destroying test database for alias 'default'...
[Middleware] Incoming Request: GET /api/health/
[Middleware] Outgoing Response: 200 (took 3.72 ms)
[Middleware] Incoming Request: GET /api/students/1/
[Middleware] Outgoing Response: 200 (took 0.20 ms)
[Middleware] Incoming Request: GET /api/students/999/
[Middleware] Outgoing Response: 404 (took 0.14 ms)
[Middleware] Incoming Request: GET /api/students/
[Middleware] Outgoing Response: 200 (took 0.16 ms)
```

---

## 5. Key Takeaways

1. **Order Matters:** Middleware runs top-to-bottom on requests and bottom-to-top on responses. Placing logging early guarantees that view processing and any subsequent middleware errors are accurately captured.
2. **Path Parameter Safety:** Using `<int:student_id>` ensures non-integer parameters are blocked at the router layer with an automatic 404, preventing invalid arguments from polluting view logic.
3. **App-Level URL Modularization:** Using `include('students.urls')` keeps root URL configurations clean and allows the app to be mounted under any prefix without breaking internal route definitions.
