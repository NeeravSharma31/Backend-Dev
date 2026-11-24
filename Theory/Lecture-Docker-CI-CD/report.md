---
title: "Unit 4: From Docker to Production — Containerizing FastAPI, GitHub Actions CI/CD, Monitoring & Scaling"
layout: default
---
{% raw %}
# Lab Report: From Docker to Production — Containerizing a FastAPI App, Pushing to Docker Hub, and Monitoring & Scaling

**Course:** Backend Development (Unit 4)  
**Student:** Neerav Kumar Sharma  
**SAP ID:** 590018263  
**Institution:** UPES Dehradun  

---

## 1. Number
**Theory Unit 4 / Lecture 44–45 Hands-On**

---

## 2. Title
**Containerization of FastAPI Application, Automated Continuous Integration and Deployment (CI/CD) with GitHub Actions and Docker Hub, Structured Observability Middleware, Horizontal Scaling, and Nginx Load Balancing**

---

## 3. Object (Objective)
1. To implement an asynchronous RESTful backend service using **FastAPI** with custom request lifecycle timing middleware.
2. To containerize the application reproducibly using an optimized **Docker** container based on `python:3.12-slim`.
3. To configure secure automated CI/CD workflows using **GitHub Actions** and **Docker Hub** access tokens (`DOCKERTOKEN` and `DOCKERUSERNAME` secrets).
4. To establish structured observability (request logging, `duration_ms` tracking, and `/health` liveness checks).
5. To execute horizontal scaling by orchestrating multiple stateless container instances behind an **Nginx** reverse proxy and load balancer.
6. To analyze latency metrics ($p_{95}$, average, median) and synthesize solutions for scaling bottlenecks across application, session, database, and logging layers.

---

## 4. Theory & Architectural Concepts

### 4.1 Continuous Delivery Pipeline
```text
Developer -> Git Push -> GitHub Actions CI -> Test -> Build Docker Image -> Push to Docker Hub -> Pull & Deploy
```
- **Continuous Delivery**: Every commit pushed to the primary branch undergoes automated linting, testing, and container packaging, leaving the repository in an immediately deployable state.
- **Continuous Deployment**: Extends Continuous Delivery by automatically releasing verified artifacts to production environments without manual intervention.

### 4.2 Monitoring vs. Scaling: The Observability Cycle
- **Monitoring** addresses *system state*: What is happening inside our running backend?
  - **Logs**: Discrete events with contextual metadata (`method=GET path=/students status=200 duration_ms=1.14`).
  - **Metrics**: Aggregated quantitative signals over time ($p_{95}$ latency, request rates, error rates).
  - **Health Checks**: Binary service liveness confirmation (`GET /health` returning `200 OK`).
  - **Alerts**: Notifications triggered when error or latency thresholds are breached.
- **Scaling** addresses *traffic capacity*: How does the system adapt to increasing workload?
  - **Vertical Scaling**: Augmenting host compute resources (CPU/RAM). Simple, but limited by physical hardware thresholds and cost curves.
  - **Horizontal Scaling**: Multiplying stateless application container replicas behind a load balancer.

> **Core Rule**: *Monitoring provides the evidence that drives scaling decisions. Never scale blindly — measure first.*

### 4.3 Scaling Dependencies & Bottlenecks

| Component | Incurred Bottleneck | Recommended Architectural Approach |
|:---|:---|:---|
| **App Server** | CPU saturation, event loop blockage | Horizontal replication of container instances |
| **Database** | Connection exhaustion, slow queries | Connection pooling, indexing, read replicas |
| **Cache** | Memory limits, network throughput | Clustered caching (e.g. Redis Cluster) |
| **File Storage** | Ephemeral container filesystem loss | Cloud Object Storage (S3, GCS) or shared network volumes |
| **Sessions** | Instance memory isolation (state loss) | Stateless JWT tokens or shared central Redis cache |
| **Logging** | Unbounded local disk consumption | Centralized logging collectors (Elasticsearch, Loki) |

---

## 5. Implementation Process

### 5.1 Project Architecture
```text
Theory/Lecture-Docker-CI-CD/
├── .env.example                          # Local secrets template
├── .gitignore                            # Secret & cache exclusions
├── .github/workflows/ActionsYaml.yaml     # CI/CD pipeline
├── Dockerfile                            # Multi-layer Docker build
├── main.py                               # FastAPI application + logging middleware
├── nginx.conf                            # Nginx load balancer reverse proxy
├── requirements.txt                      # Dependencies
├── simulate_traffic.py                   # Latency & throughput simulator
├── test_api.py                           # Zero-dependency ASGI test suite
└── README.md                             # Technical overview
```

### 5.2 Application Code (`main.py`)
The FastAPI application incorporates high-precision performance timing (`time.perf_counter()`) inside an asynchronous HTTP middleware:

```python
import logging
import time
from fastapi import FastAPI, Request

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("student-api")

app = FastAPI(title="Student API - FastAPI")

students = [
    {"id": 1, "name": "Aarav", "course": "Backend Development"},
    {"id": 2, "name": "Diya", "course": "Backend Development"},
    {"id": 3, "name": "Neerav Kumar Sharma", "course": "Backend Development"},
]

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    try:
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "method=%s path=%s status=%s duration_ms=%.2f",
            request.method, request.url.path, response.status_code, duration_ms,
        )
        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
        return response
    except Exception as exc:
        duration_ms = (time.perf_counter() - start) * 1000
        logger.exception("method=%s path=%s status=500 duration_ms=%.2f error=%s",
                         request.method, request.url.path, duration_ms, str(exc))
        raise

@app.get("/")
def root():
    return {
        "application": "Student API",
        "framework": "FastAPI",
        "status": "running",
        "sapid": "590018263",
        "author": "Neerav Kumar Sharma",
        "location": "Dehradun",
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/students")
def list_students():
    return students
```

### 5.3 Docker Containerization (`Dockerfile`)
```dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 5.4 CI/CD Pipeline (`.github/workflows/ActionsYaml.yaml`)
```yaml
name: Docker image build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to DockerHub
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          echo "${{ secrets.DOCKERTOKEN }}" | docker login -u "${{ secrets.DOCKERUSERNAME }}" --password-stdin

      - name: Build Docker Image
        run: |
          docker build -t ${{ secrets.DOCKERUSERNAME }}/fastapi-app:v0.1 -t ${{ secrets.DOCKERUSERNAME }}/fastapi-app:latest .

      - name: Push Docker Image
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          docker push ${{ secrets.DOCKERUSERNAME }}/fastapi-app:v0.1
          docker push ${{ secrets.DOCKERUSERNAME }}/fastapi-app:latest
```

### 5.5 Nginx Reverse Proxy & Load Balancer (`nginx.conf`)
```nginx
events {
    worker_connections 1024;
}

http {
    upstream student_api {
        server host.docker.internal:8001;
        server host.docker.internal:8002;
    }

    server {
        listen 8080;

        location / {
            proxy_pass http://student_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

---

## 6. Observation & Automated Testing Results

### 6.1 Unit Test Execution
```text
$ python test_api.py
2026-11-24 22:58:31,409 [INFO] method=GET path=/ status=200 duration_ms=2.83
.2026-11-24 22:58:31,411 [INFO] method=GET path=/health status=200 duration_ms=0.96
.2026-11-24 22:58:31,413 [INFO] method=GET path=/students status=200 duration_ms=1.14
.2026-11-24 22:58:31,415 [INFO] method=GET path=/health status=200 duration_ms=0.80
.
----------------------------------------------------------------------
Ran 4 tests in 0.027s

OK
```

### 6.2 Simulated Traffic & Observability Verification
```text
$ python simulate_traffic.py
--- Simulating 25 Requests to Student API ---
2026-11-24 22:59:18,767 [INFO] method=GET path=/students status=200 duration_ms=2.16
2026-11-24 22:59:18,769 [INFO] method=GET path=/health status=200 duration_ms=1.00
...

--- Observability Metrics Summary ---
Total Requests: 25
Average Latency: 1.96 ms
Median Latency:  1.17 ms
p95 Latency:     1.46 ms
Health Status:   100% 200 OK
```

| Verification Check | Target Component | Observed Result | Status |
|:---|:---|:---|:---:|
| **Root Endpoint** | `GET /` | Returns JSON with SAP ID `590018263` and author metadata | `200 OK` |
| **Health Check** | `GET /health` | Liveness check returns `{"status": "healthy"}` | `200 OK` |
| **Student Listing** | `GET /students` | Returns serialized array of student dictionaries | `200 OK` |
| **Timing Header** | Response Headers | Header `X-Process-Time-Ms` populated with float milliseconds | Verified |
| **Structured Logging**| Server Console | Emits ISO timestamp, level, method, path, status, and duration | Verified |
| **Horizontal Scaling**| 2 Containers | Ports 8001 and 8002 handle requests independently | Verified |
| **Load Balancing** | Nginx Proxy | Port 8080 splits traffic between upstream backend containers | Verified |

---

## 7. Troubleshooting Guide & Failure Modes

1. **GitHub Actions Authentication Failure (`denied: requested access to the resource is denied`)**:
   - *Cause*: Incorrect Docker Hub username or missing Personal Access Token (PAT).
   - *Solution*: Created Personal Access Token under Docker Hub *Account Settings -> Security -> Access Tokens* with Read & Write permissions and saved as GitHub Repository Secret `DOCKERTOKEN`.
2. **Accidental Token Leakage**:
   - *Caution*: Never pass passwords directly in CLI flags (`docker login -p <token>`) as this exposes tokens in shell history files.
   - *Fix*: Always pipe tokens through standard input via `--password-stdin`.
3. **502 Bad Gateway under Nginx**:
   - *Cause*: Hostname resolution failure for upstream targets.
   - *Solution*: On Docker Desktop, use `host.docker.internal:<port>`. In Linux environments, configure user-defined Docker networks and address containers by service names.
4. **Session Desynchronization during Horizontal Scaling**:
   - *Cause*: Storing state in Python module scope (`sessions = {}`).
   - *Solution*: Designed service statelessly; authentication offloaded to signed JWT tokens or external Redis session store.
{% endraw %}
