# Containerizing a FastAPI App, Pushing to Docker Hub, and Monitoring & Scaling

**Course:** Backend Development (Unit 4)  
**Student:** Neerav Kumar Sharma  
**SAP ID:** 590018263  
**Institution:** UPES Dehradun  

---

## Architecture Overview

```
                                  +-----------------------------+
                                  |   Developer (Local Env)     |
                                  |   - main.py (FastAPI App)   |
                                  |   - Dockerfile              |
                                  +--------------+--------------+
                                                 |
                                                 | git push origin main
                                                 v
                                  +-----------------------------+
                                  |   GitHub Actions CI/CD      |
                                  |   - actions/checkout@v4     |
                                  |   - Docker Hub Login        |
                                  |   - docker build & push     |
                                  +--------------+--------------+
                                                 |
                                                 | push image:v0.1
                                                 v
                                  +-----------------------------+
                                  |      Docker Hub Registry    |
                                  | neeravsharma31/fastapi-app  |
                                  +--------------+--------------+
                                                 |
                                                 | docker pull
                                                 v
                     +-----------------------------------------------------+
                     |           Nginx Load Balancer (Port 8080)           |
                     |           Round-Robin Reverse Proxy                 |
                     +-----------------+-----------------+-----------------+
                                       |                 |
                                       v                 v
                       +-------------------+ +-------------------+
                       | FastAPI Replica 1 | | FastAPI Replica 2 |
                       | Host Port: 8001   | | Host Port: 8002   |
                       | Container: 8000   | | Container: 8000   |
                       +-------------------+ +-------------------+
```

---

## Directory Structure

```text
Theory/Lecture-Docker-CI-CD/
├── .env.example                          # Local secrets template (DOCKERTOKEN, DOCKERUSERNAME)
├── .gitignore                            # Excludes .env, __pycache__, and venv
├── .github/
│   └── workflows/
│       └── ActionsYaml.yaml              # CI/CD pipeline building & pushing to Docker Hub
├── Dockerfile                            # Optimized multi-layer Python 3.12-slim container
├── main.py                               # FastAPI Student API with structured timing middleware
├── nginx.conf                            # Reverse proxy and load balancer upstream configuration
├── requirements.txt                      # Application and server dependencies
├── simulate_traffic.py                   # Traffic simulator calculating p95 latency and throughput
├── test_api.py                           # Zero-dependency ASGI unit test suite
└── report.md                             # Comprehensive technical report covering Parts 1–9
```

---

## Running Locally

### 1. Direct Python Execution
```powershell
python main.py
# Server starts on http://localhost:8000
```

### 2. Run Automated Verification Tests
```powershell
python test_api.py
python simulate_traffic.py
```

### 3. Docker Container Execution
```bash
# Build local image
docker build -t neeravsharma31/fastapi-app:v0.1 .

# Run single container
docker run --rm -p 8000:8000 neeravsharma31/fastapi-app:v0.1

# Verify health check
curl http://localhost:8000/health
```

### 4. Horizontal Scaling with Nginx
```bash
# Start instance 1
docker run -d --name fastapi-1 -p 8001:8000 neeravsharma31/fastapi-app:v0.1

# Start instance 2
docker run -d --name fastapi-2 -p 8002:8000 neeravsharma31/fastapi-app:v0.1

# Start Nginx load balancer
docker run -d --name student-lb -p 8080:8080 -v "$(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine

# Test load-balanced endpoint
curl http://localhost:8080/health
```
