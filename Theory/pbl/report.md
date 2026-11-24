---
title: "PBL: Containerization, Test Automation & Docker Hub CI/CD Pipeline"
layout: default
---
{% raw %}
# Lab Report: Project-Based Learning (PBL) — Containerization, Automated Test Suite, and Multi-Stage CI/CD Deployment

**Course:** Backend Development  
**Student:** Neerav Kumar Sharma  
**SAP ID:** 590018263  
**Institution:** UPES Dehradun  
**PBL Repository Reference:** [Theory/pbl](https://github.com/NeeravSharma31/Backend-Dev/tree/main/Theory/pbl)

---

## 1. Number
**Project-Based Learning (PBL) Assignment**

---

## 2. Title
**Modernization of Student Management REST API: Docker Containerization, Multi-Container Orchestration with Docker Compose, Automated Route Testing (`automationTesting.py`), and Automated CI/CD Pipeline via GitHub Actions and Docker Hub**

---

## 3. Object (Objective)
1. To select a real-world backend microservice (**Student Management Portal API**) implemented with **FastAPI** and **Pydantic** data models.
2. To containerize the application reproducibly using a secure, multi-layer **Dockerfile** configured with a non-root system user (`appuser`) and container healthcheck probes.
3. To orchestrate the application lifecycle using **Docker Compose** (`docker-compose.yml`), specifying port bindings, restart policies, and healthcheck assertions.
4. To engineer an automated testing framework (**`automationTesting.py`**) that verifies all 10 API routes (CRUD operations, path conversions, query parameters, 404 error fallbacks, and performance headers) with automated exit code signaling.
5. To construct an automated two-stage **GitHub Actions CI/CD pipeline** (`pbl-ci-cd.yml`):
   - **Stage 1 (Test)**: Runs automated test suite. Build halts if any test fails.
   - **Stage 2 (Build & Push)**: Builds and pushes versioned images to **Docker Hub** upon test success on the `main` branch.
6. To document the architecture and link the PBL assignment in the main repository portfolio.

---

## 4. Architecture & Workflow

```text
+-----------------------------------------------------------------------------------+
|                                DEVELOPER WORKFLOW                                 |
|                                                                                   |
|   1. Write Code (main.py)  ----->  2. Run Tests (automationTesting.py)             |
|                                                     |                             |
|                                                     | Passes 10/10                |
|                                                     v                             |
|                                    3. git commit & push to GitHub                 |
+-----------------------------------------------------+-----------------------------+
                                                      |
                                                      v
+-----------------------------------------------------------------------------------+
|                         GITHUB ACTIONS CI/CD PIPELINE                             |
|                                                                                   |
|   +---------------------------------+     +-----------------------------------+   |
|   |   STAGE 1: Automated Testing    |     |    STAGE 2: Build & Push          |   |
|   |   - Setup Python 3.12           | --> |    - Needs Stage 1 Success        |   |
|   |   - Install requirements.txt    |     |    - Docker Hub Login (Token)     |   |
|   |   - Run automationTesting.py    |     |    - Build Multi-tag Image        |   |
|   |   - Verify Exit Code 0          |     |    - Push to Docker Hub Registry  |   |
|   +---------------------------------+     +-----------------------------------+   |
+-----------------------------------------------------+-----------------------------+
                                                      |
                                                      v
+-----------------------------------------------------------------------------------+
|                                PRODUCTION DEPLOYMENT                              |
|                                                                                   |
|   docker-compose.yml  ----->  Pull Image: neeravsharma31/pbl-student-portal:latest|
|                               Launch Container (Port 8000:8000)                   |
|                               Health Probe: curl http://localhost:8000/health     |
+-----------------------------------------------------------------------------------+
```

---

## 5. Technical Implementation

### 5.1 Application Architecture (`main.py`)
The application implements complete RESTful lifecycle management with request timing:

```python
from fastapi import FastAPI, HTTPException, Request, status
from pydantic import BaseModel, Field

app = FastAPI(title="Student Management Portal API", version="1.0.0")

class StudentBase(BaseModel):
    name: str = Field(..., min_length=2)
    sap_id: str = Field(..., min_length=6)
    branch: str
    email: str

@app.middleware("http")
async def performance_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
    return response

@app.get("/")
def read_root():
    return {"project": "PBL - Student Management Portal API", "author": "Neerav Kumar Sharma", "sap_id": "590018263"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "student-portal-api"}

@app.get("/api/v1/students")
def get_students(branch: str = None):
    # Returns student list or filtered by branch
    ...

@app.post("/api/v1/students", status_code=201)
def create_student(student: StudentCreate):
    # Validates uniqueness of SAP ID and appends record
    ...
```

### 5.2 Containerization (`Dockerfile`)
```dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 5.3 Multi-Container Orchestration (`docker-compose.yml`)
```yaml
version: "3.8"

services:
  student-portal-api:
    build:
      context: .
      dockerfile: Dockerfile
    image: neeravsharma31/pbl-student-portal:latest
    container_name: pbl_student_portal
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=production
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

### 5.4 Test Automation Engine (`automationTesting.py`)
An independent verification script executing 10 functional checks:
- Verifies root and health endpoints.
- Validates student creation (POST 201 Created).
- Verifies retrieval by ID (GET 200 OK).
- Verifies record mutation (PUT 200 OK).
- Verifies record deletion (DELETE 200 OK).
- Confirms 404 Not Found response when requesting a deleted ID.
- Asserts presence of `X-Response-Time-Ms` timing header.
- Returns status code 0 on complete pass, or 1 on failure.

### 5.5 GitHub Actions Workflow (`.github/workflows/pbl-ci-cd.yml`)
```yaml
name: PBL Automated Test & Docker Hub CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Run Automated API Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: python automationTesting.py

  build-and-push:
    name: Build & Push Docker Image
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - run: echo "${{ secrets.DOCKERTOKEN }}" | docker login -u "${{ secrets.DOCKERUSERNAME }}" --password-stdin
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKERUSERNAME }}/pbl-student-portal:latest
```

---

## 6. Observation & Automated Testing Results

### 6.1 Test Execution Output
```text
$ python automationTesting.py
======================================================================
  PBL AUTOMATION TESTING: STUDENT MANAGEMENT PORTAL API
  Author: Neerav Kumar Sharma | SAP ID: 590018263 | UPES Dehradun
======================================================================

  [PASS] 01. GET / - Root endpoint & metadata verification
  [PASS] 02. GET /health - Liveness probe healthy (latency: 0.92 ms)
  [PASS] 03. GET /api/v1/students - Retrieved 3 student records
  [PASS] 04. POST /api/v1/students - Successfully created student (ID: 4)
  [PASS] 05. GET /api/v1/students/4 - Retrieved newly created record
  [PASS] 06. PUT /api/v1/students/4 - Record updated successfully
  [PASS] 07. DELETE /api/v1/students/4 - Record deleted successfully
  [PASS] 08. GET /api/v1/students/4 - Verified 404 Not Found handling
  [PASS] 09. GET /api/v1/stats - Analytics aggregated: 3 active students
  [PASS] 10. Middleware - Header X-Response-Time-Ms emitted (0.48 ms)

----------------------------------------------------------------------
  Test Execution Summary: 10/10 Passed in 36.77 ms
----------------------------------------------------------------------
  >>> ALL AUTOMATION TESTS PASSED (Status Code: 0) <<<
```

### 6.2 Test Matrix Summary

| Test Case | Method | Path | Expected Output | Actual Output | Status |
|:---|:---:|:---|:---|:---|:---:|
| **Root Metadata** | `GET` | `/` | Status `online`, author Neerav Kumar Sharma, SAP ID 590018263 | Matches expected schema | `PASS` |
| **Health Probe** | `GET` | `/health` | `{"status": "healthy"}` with `X-Response-Time-Ms` header | `200 OK` (0.92 ms) | `PASS` |
| **Read Collection**| `GET` | `/api/v1/students` | Array of 3 initial student records | `200 OK` (3 items) | `PASS` |
| **Record Creation**| `POST`| `/api/v1/students` | Inserts record, returns allocated ID 4 with 201 Created | `201 Created` | `PASS` |
| **Read by ID** | `GET` | `/api/v1/students/4` | Fetches student with SAP ID `590099999` | `200 OK` | `PASS` |
| **Record Update** | `PUT` | `/api/v1/students/4` | Modifies email and branch | `200 OK` (Updated) | `PASS` |
| **Record Delete** | `DELETE`| `/api/v1/students/4`| Deletes record with success confirmation message | `200 OK` | `PASS` |
| **404 Fallback** | `GET` | `/api/v1/students/4` | Deleted record returns 404 Not Found | `404 Not Found` | `PASS` |
| **Analytics Aggregation** | `GET` | `/api/v1/stats` | Aggregated count and branch distribution | `200 OK` (Count: 3) | `PASS` |
| **Response Timing**| `GET` | `/` | Header `X-Response-Time-Ms` contains valid numeric string | `0.48 ms` | `PASS` |

---

## 7. Conclusion & Learning Outcomes
1. **Separation of Concerns**: Decoupled test automation (`automationTesting.py`) from Docker packaging, guaranteeing that unstable builds never reach the container registry.
2. **Container Security**: Replaced root execution with a restricted UID `1000` (`appuser`) and container healthchecks to satisfy production cloud security policies.
3. **Declarative Infrastructure**: Used `docker-compose.yml` to define reproducible runtime configurations across developer laptops and production servers.
4. **CI/CD Automation**: Successfully automated the end-to-end flow: commit $\rightarrow$ route testing $\rightarrow$ Docker build $\rightarrow$ Docker Hub deployment.
{% endraw %}
