---
title: "Lecture 28: Integrating Third-Party APIs and Services"
layout: default
---

# Lecture 28: Integrating Third-Party APIs and Services

**Course:** Backend Development, Unit 3 (Frameworks and Performance Optimization)  
**Topic:** Service Layer Design, External HTTP Requests with `requests`, Defensive Error Handling & Mock Testing  
**Student:** Neerav Kumar Sharma · B.Tech CSE · SAP ID 590018263 · UPES Dehradun  

**Source:** [`student_api/`](https://github.com/NeeravSharma31/Backend-Dev/tree/main/Theory/Lecture-28/student_api) · [`students/utils.py`](https://github.com/NeeravSharma31/Backend-Dev/blob/main/Theory/Lecture-28/student_api/students/utils.py) · [`students/tests.py`](https://github.com/NeeravSharma31/Backend-Dev/blob/main/Theory/Lecture-28/student_api/students/tests.py)

---

## 1. Aim

To implement a clean architectural pattern for consuming external third-party REST APIs within Django, isolating HTTP client logic inside a dedicated Service Utility module (`utils.py`), enforcing timeouts and defensive error handling (503 Service Unavailable), and writing deterministic unit tests using Python's `unittest.mock`.

---

## 2. Architecture & Service Layer Pattern

Directly embedding `requests.get()` inside Django view functions creates tight coupling, makes code difficult to maintain, and complicates automated testing. A **Service Utility Layer** isolates the boundary between the internal application and external services:

```text
Client Browser / API Consumer
        │
        ▼ GET /api/students/external/1/
┌────────────────────────────────────────────────────────┐
│ Django View: external_data_view()                      │
│  - Receives request & validates parameter              │
│  - Delegates work to get_external_data(post_id)        │
│  - Checks for error dictionary keys                    │
│  - Returns HTTP 200 JSON or HTTP 503 Service Error     │
└───────────────────────┬────────────────────────────────┘
                        ▼
┌────────────────────────────────────────────────────────┐
│ Service Utility Layer: students/utils.py               │
│  - requests.get(url, timeout=2)                        │
│  - Handles requests.Timeout                            │
│  - Handles requests.RequestException (DNS, connection) │
│  - Handles ValueError (invalid JSON)                   │
└───────────────────────┬────────────────────────────────┘
                        ▼ Outbound HTTP
┌────────────────────────────────────────────────────────┐
│ External Third-Party Service Boundary (REST API)       │
└────────────────────────────────────────────────────────┘
```

---

## 3. Code Implementation

### 3.1 Service Utility Layer (`students/utils.py`)
```python
import requests

EXTERNAL_API_URL = "https://jsonplaceholder.typicode.com/posts/{post_id}"

def get_external_data(post_id, timeout=2):
    url = EXTERNAL_API_URL.format(post_id=post_id)
    try:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
        return {"data": response.json(), "error": None}
    except requests.Timeout:
        return {"data": None, "error": "External service timed out"}
    except requests.RequestException:
        return {"data": None, "error": "External service is unavailable"}
    except ValueError:
        return {"data": None, "error": "External service returned invalid JSON"}
```

### 3.2 Defensive Controller View (`students/views.py`)
```python
from django.http import JsonResponse
from .utils import get_external_data

def external_data_view(request, post_id):
    result = get_external_data(post_id)
    if result["error"]:
        return JsonResponse(
            {"error": result["error"]},
            status=503
        )
    return JsonResponse(result["data"])
```

### 3.3 Mock-Based Automated Testing (`students/tests.py`)
Using `@patch("students.utils.requests.get")` ensures tests run instantly and deterministically without requiring a live internet connection:
```python
from unittest.mock import Mock, patch
from django.test import SimpleTestCase
import requests
from .utils import get_external_data

class ExternalDataTests(SimpleTestCase):
    @patch("students.utils.requests.get")
    def test_external_data_success(self, mock_get):
        mock_response = Mock()
        mock_response.json.return_value = {"id": 1, "title": "Example Post"}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        result = get_external_data(1)
        self.assertIsNone(result["error"])
        self.assertEqual(result["data"]["id"], 1)

    @patch("students.utils.requests.get")
    def test_timeout_returns_safe_error(self, mock_get):
        mock_get.side_effect = requests.Timeout
        result = get_external_data(1)
        self.assertEqual(result["error"], "External service timed out")
```

---

## 4. Test Verification Results

All 5 unit tests executed and passed in 0.009s:
```powershell
python manage.py test
```
**Output:**
```text
.....
----------------------------------------------------------------------
Ran 5 tests in 0.009s

OK
Found 5 test(s).
System check identified no issues (0 silenced).
```

---

## 5. Key Takeaways

1. **Always Set Timeouts:** Without an explicit `timeout=2`, a slow or stalled external server can tie up Django worker threads indefinitely, causing cascading outages.
2. **Never Let Network Exceptions Leak:** Network errors (`ConnectionError`, `Timeout`, `HTTPError`) must be caught at the service layer and translated into clean HTTP 503 or fallback responses.
3. **Mock in Unit Tests:** Testing against live external APIs introduces flaky tests, network latency, and potential rate limits. Using `unittest.mock.patch` ensures fast, repeatable CI/CD test runs.
