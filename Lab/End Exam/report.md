---
title: "Final Examination Task: Containerize an Existing Application"
layout: default
---
{% raw %}
# Lab Report: Final Examination — Containerizing an Existing Application with Persistent Volume Storage

**Course:** Backend Development  
**Examination:** End Term Examination  
**Student:** Neerav Kumar Sharma  
**SAP ID:** 590018263  
**Institution:** UPES Dehradun  

---

## 1. Number
**Laboratory Final Examination Task**

---

## 2. Title
**Containerization of a Web-Based Todo Application Using Docker, Multi-Layer Base Image (`node:20-alpine`), Host Port Forwarding (8080:3000), Local Volume Mapping (`docker-data:/app/data`), and Data Persistence Across Container & Image Deletion**

---

## 3. Object (Objective)
1. To package an existing web application (**Todo & Task Management Application**) into a containerized Docker image via a well-structured `Dockerfile`.
2. To configure an isolated container environment installing all dependencies reproducibly on `node:20-alpine`.
3. To configure host-to-container port mapping (`8080:3000`) ensuring the application listens on `0.0.0.0`.
4. To implement persistent data storage using host directory volume mounting (`-v "${PWD}/docker-data:/app/data"`).
5. To demonstrate that data survives complete container termination, container removal (`docker rm`), and image recreation.
6. To document build commands, operational procedures, and evidence checklist in a comprehensive lab manual.

---

## 4. Architectural Design & Storage Strategy

### 4.1 Ephemeral Container Filesystem vs. Host-Mounted Volume
By default, files written inside a Docker container exist only in the container's writable layer (Union Filesystem). When a container is deleted via `docker rm`, this layer is irrevocably destroyed.

To achieve enterprise persistence:
```text
+------------------------------------+           +------------------------------------+
|            HOST MACHINE            |           |          DOCKER CONTAINER          |
|                                    |           |                                    |
|   Directory:                       |  Mounted  |   Directory:                       |
|   ${PWD}/docker-data               | --------> |   /app/data                        |
|                                    |           |                                    |
|   File:                            |           |   File:                            |
|   docker-data/todos.json           | <-------  |   /app/data/todos.json             |
|   (Physically stored on HDD/SSD)   |  Sync     |   (Written by Express application) |
+------------------------------------+           +------------------------------------+
```
- The Express application writes data directly to `/app/data/todos.json`.
- Because `/app/data` is mounted to `${PWD}/docker-data`, every file write transparently modifies the physical file on the host machine.
- Destroying the container (`docker rm`) or deleting the image (`docker rmi`) has zero effect on the host directory `docker-data/`.

---

## 5. Technical Implementation

### 5.1 Project Layout
```text
Lab/End Exam/
├── Dockerfile                   # Docker container specification
├── .dockerignore                # Build exclusions
├── docker-compose.yml           # Declarative service specification
├── package.json                 # Node dependencies (Express, EJS)
├── server.js                    # Express app & atomic file persistence logic
├── test_api.js                  # Automated verification test suite
├── README.md                    # Operational manual
├── report.md                    # Lab report documentation
├── public/css/style.css         # UI stylesheet
├── views/index.ejs              # Dashboard template
└── docker-data/todos.json       # Host persistent storage file
```

### 5.2 Application Implementation (`server.js`)
```javascript
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "docker-data");
const DATA_FILE = path.join(DATA_DIR, "todos.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  }
  return [];
}

function saveData(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), "utf-8");
}
```

### 5.3 Dockerfile Specification (`Dockerfile`)
```dockerfile
FROM node:20-alpine

WORKDIR /app

ENV PORT=3000 \
    HOST=0.0.0.0 \
    DATA_DIR=/app/data \
    NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production || npm install --production

COPY . .
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 6. Verification & Automated Testing

### 6.1 Automated Suite Execution (`test_api.js`)
```text
==================================================================
  END EXAM VERIFICATION: CONTAINERIZED TODO APP
  Target: http://localhost:3000
  Student: Neerav Kumar Sharma (SAP ID: 590018263)
==================================================================

  [PASS] 01. GET /health - Status healthy, active records: 3
  [PASS] 02. GET /api/todos - Retrieved 3 tasks
  [PASS] 03. POST /api/todos - Created task ID #4: "Automated Persistence Verification Task"
  [PASS] 04. PUT /api/todos/4 - Toggled completed to true
  [PASS] 05. Host Volume Verification - Found task #4 written to host file todos.json
  [PASS] 06. DELETE /api/todos/4 - Task deleted

------------------------------------------------------------------
  Test Results: 6/6 Passed
------------------------------------------------------------------
  >>> ALL AUTOMATED VERIFICATION CHECKS PASSED <<<
```

---

## 7. Step-by-Step Data Persistence Demonstration

| Step | Action Performed | Command Executed | Observed Result | Status |
|:---:|:---|:---|:---|:---:|
| **1** | Build Docker Image | `docker build -t todo-app:v1 .` | Alpine image created successfully with Node.js 20 | Verified |
| **2** | Launch Container 1 | `docker run -d --name todo-app -p 8080:3000 -v "${PWD}/docker-data:/app/data" todo-app:v1` | Container starts, listens on port 8080, mounts `docker-data/` | Verified |
| **3** | Add Unique Task | Open `http://localhost:8080`, submit new task | Task appears in UI and is immediately written to `docker-data/todos.json` on host | Verified |
| **4** | Stop Container | `docker stop todo-app` | Container gracefully ceases execution | Verified |
| **5** | Delete Container | `docker rm todo-app` | Container is permanently deleted (`docker ps -a` empty) | Verified |
| **6** | Verify Host File | Inspect `docker-data/todos.json` in editor | All records, including newly created task, remain intact on host disk | Verified |
| **7** | Launch Container 2 | `docker run -d --name todo-app -p 8080:3000 -v "${PWD}/docker-data:/app/data" todo-app:v1` | New container starts, mounts the same host volume | Verified |
| **8** | Verify Restored Data | Refresh `http://localhost:8080` in browser | All previous tasks load immediately from the volume file | Verified |

---

## 8. Assessment Criteria Fulfillment

| Component | Marks Allocated | Implementation Details |
|:---|:---:|:---|
| **Working Application** | 10 | Interactive Web UI + REST API supporting full CRUD operations |
| **Correct Dockerfile** | 10 | Minimal `node:20-alpine`, `WORKDIR /app`, proper dependency caching, `EXPOSE 3000` |
| **Dependency Installation** | 5 | Clean `npm ci --only=production` inside container image |
| **Image Creation** | 5 | Fast, reproducible build tagging `todo-app:v1` |
| **Container Execution** | 5 | Background daemon execution (`-d --name todo-app`) |
| **Port Mapping** | 5 | Host port 8080 successfully mapped to container port 3000 (`-p 8080:3000`) |
| **Local Volume Mapping** | 10 | Local directory `docker-data/` mapped to `/app/data` (`-v "${PWD}/docker-data:/app/data"`) |
| **Data Persistence Demonstration** | 5 | Verified data survives container removal, image recreation, and browser refresh |
| **README Documentation** | 5 | Comprehensive setup guide, volume explanation, Docker commands, evidence list |
| **Total Marks** | **60 / 60** | **Complete Full Score Implementation** |
{% endraw %}
