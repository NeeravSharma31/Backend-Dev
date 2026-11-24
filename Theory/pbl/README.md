# PBL Assignment: Containerization, Test Automation & Docker Hub CI/CD Pipeline

**Course:** Backend Development  
**Student:** Neerav Kumar Sharma  
**SAP ID:** 590018263  
**Institution:** UPES Dehradun  
**Repository Link:** [https://github.com/NeeravSharma31/Backend-Dev/tree/main/Theory/pbl](https://github.com/NeeravSharma31/Backend-Dev/tree/main/Theory/pbl)

---

## 1. Project Overview

This Project-Based Learning (PBL) practical demonstrates the end-to-end modernization of a backend service from raw source code to an enterprise containerized deployment pipeline:
1. **Application Source**: Production-ready Student Management Portal REST API built using **FastAPI** and **Pydantic** validation models, providing complete CRUD operations, query filters, analytics aggregation, and high-precision response timing middleware (`X-Response-Time-Ms`).
2. **Containerization**: Optimized multi-layer Docker image based on `python:3.12-slim` with a dedicated non-root security user (`appuser`) and container healthcheck probe.
3. **Multi-Service Orchestration**: Production `docker-compose.yml` declaring ports, health status monitors, environment configurations, and restart policies.
4. **Automated Test Suite (`automationTesting.py`)**: Automated verification engine exercising all 10 endpoint paths (Root, Health probe, List, Create, Read by ID, Update, Delete, 404 error handling, Stats, Timing headers) with instant pass/fail diagnostics.
5. **Two-Stage CI/CD GitHub Actions Pipeline**:
   - **Stage 1 (Test)**: Executes `automationTesting.py` in an Ubuntu runner. If any route fails or regresses, the build is aborted immediately.
   - **Stage 2 (Build & Push)**: Triggered only on passing tests on `main`. Authenticates with Docker Hub via repository secrets (`DOCKERTOKEN`, `DOCKERUSERNAME`) and pushes versioned container images.

---

## 2. Directory Structure

```text
Theory/pbl/
├── .env.example                          # Local secrets template (DOCKERTOKEN, DOCKERUSERNAME)
├── .gitignore                            # Excludes .env, __pycache__, and venv
├── .github/
│   └── workflows/
│       └── pbl-ci-cd.yml                 # Two-stage Test -> Build & Push GitHub Actions pipeline
├── Dockerfile                            # Secure Python 3.12-slim container with non-root appuser
├── docker-compose.yml                    # Multi-container orchestration & healthcheck definition
├── main.py                               # Student Portal API with full CRUD & timing middleware
├── requirements.txt                      # Dependencies (FastAPI, Uvicorn, Pydantic, Requests)
├── automationTesting.py                  # End-to-end automated test runner for all API routes
├── report.md                             # Comprehensive Jekyll-compatible lab documentation
└── README.md                             # Technical manual & deployment instructions
```

---

## 3. Quick Start & Execution

### 3.1 Run Automated Tests Locally
```powershell
python automationTesting.py
```
*Expected Output:*
```text
======================================================================
  PBL AUTOMATION TESTING: STUDENT MANAGEMENT PORTAL API
  Author: Neerav Kumar Sharma | SAP ID: 590018263 | UPES Dehradun
======================================================================

  [PASS] 01. GET / - Root endpoint & metadata verification
  [PASS] 02. GET /health - Liveness probe healthy
  [PASS] 03. GET /api/v1/students - Retrieved 3 student records
  [PASS] 04. POST /api/v1/students - Successfully created student (ID: 4)
  [PASS] 05. GET /api/v1/students/4 - Retrieved newly created record
  [PASS] 06. PUT /api/v1/students/4 - Record updated successfully
  [PASS] 07. DELETE /api/v1/students/4 - Record deleted successfully
  [PASS] 08. GET /api/v1/students/4 - Verified 404 Not Found handling
  [PASS] 09. GET /api/v1/stats - Analytics aggregated: 3 active students
  [PASS] 10. Middleware - Header X-Response-Time-Ms emitted

----------------------------------------------------------------------
  Test Execution Summary: 10/10 Passed in 36.77 ms
----------------------------------------------------------------------
  >>> ALL AUTOMATION TESTS PASSED (Status Code: 0) <<<
```

### 3.2 Run with Docker Compose
```bash
# Build and spin up the service in background
docker compose up -d --build

# Inspect running container and health status
docker compose ps

# View real-time logs
docker compose logs -f

# Test the service
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/students

# Shut down
docker compose down
```

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Status Code |
|:---:|:---|:---|:---:|
| `GET` | `/` | Root endpoint displaying student author and system metadata | `200 OK` |
| `GET` | `/health` | Liveness and readiness health probe | `200 OK` |
| `GET` | `/api/v1/students` | Retrieve all student records (supports `?branch=` query filter) | `200 OK` |
| `POST` | `/api/v1/students` | Register a new student with JSON body validation | `201 Created` |
| `GET` | `/api/v1/students/{id}` | Retrieve specific student details by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/v1/students/{id}` | Update student fields (name, branch, email) | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/v1/students/{id}` | Remove a student record | `200 OK` / `404 Not Found` |
| `GET` | `/api/v1/stats` | Aggregated analytics and branch distribution | `200 OK` |
