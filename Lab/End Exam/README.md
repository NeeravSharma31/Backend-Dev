# Containerized Todo Application with Persistent Host Volume Storage

**Examination:** Final Examination Task: Containerize an Existing Application  
**Student:** Neerav Kumar Sharma  
**SAP ID:** 590018263  
**Institution:** UPES Dehradun  
**Course:** Backend Development  

---

## 1. Application Description

This project is a full-featured, containerized **Todo & Task Management Application** designed to demonstrate Docker containerization, host port forwarding, and persistent volume mapping. 

The application provides:
- **Full CRUD operations**:
  - **Create**: Add tasks with title, category (DevOps, Docker, Testing, Backend, General), and priority (High, Medium, Low).
  - **View**: Real-time listing with filter tabs (All, Active, Completed) and task statistics.
  - **Update**: Toggle task completion status and update task properties.
  - **Delete**: Remove completed or obsolete tasks.
- **RESTful API endpoints**: Complete JSON API (`/health`, `/api/todos`, `/api/todos/:id`) for automated testing and client integration.
- **Persistent Data Store**: Operates on a structured file database (`todos.json`) stored in `/app/data/`, which is mounted to the host machine directory `./docker-data/`.
- **Indestructible Data Persistence**: Because application data is stored in the host-mounted volume directory `docker-data/`, the data remains 100% preserved even when:
  1. The container is stopped (`docker stop`).
  2. The container is permanently removed (`docker rm`).
  3. The Docker image itself is deleted (`docker rmi`).
  4. The container is rebuilt and recreated from scratch!

---

## 2. Technologies Used

- **Runtime & Framework**: Node.js (v20 LTS), Express.js (v4.x)
- **Templating Engine**: EJS (Server-Side Rendering)
- **Container Engine**: Docker, Dockerfile (Alpine Linux base), Docker Compose
- **Data Persistence**: Host-Mounted Volume (`-v "${PWD}/docker-data:/app/data"`)
- **API Architecture**: RESTful JSON API + Form-based SSR
- **Styling**: Responsive Custom CSS with cohesive exam theme palette

---

## 3. Directory Structure

```text
Lab/End Exam/
├── Dockerfile                   # Docker build instructions (node:20-alpine base)
├── .dockerignore                # Excludes node_modules and local cache from image
├── docker-compose.yml           # Declarative multi-container configuration
├── package.json                 # Project dependencies and npm scripts
├── server.js                    # Express application and persistence engine
├── test_api.js                  # Automated verification test suite
├── README.md                    # Comprehensive technical manual & instructions
├── report.md                    # Final examination report for GitHub Pages
├── public/                      # Static client assets
│   └── css/
│       └── style.css            # Custom UI stylesheet
├── views/                       # EJS templates
│   └── index.ejs                # Interactive Todo dashboard
└── docker-data/                 # Local host volume directory (persisted data)
    ├── .gitkeep
    └── todos.json               # JSON database file on host disk
```

---

## 4. Local Setup (Without Docker)

If running directly on the host machine using Node.js:

```powershell
# 1. Navigate to project directory
cd "D:\Sem_5\Backend\Backend-Dev\Lab\End Exam"

# 2. Install dependencies
npm install

# 3. Start application
npm start
# Server listens on http://0.0.0.0:3000
# Access UI in browser at: http://localhost:3000
```

---

## 5. Docker Build & Run Instructions

Ensure **Docker Desktop** is running on your machine before executing these commands.

### 5.1 Build the Docker Image
```powershell
docker build -t todo-app:v1 .
```

Verify that the image was created successfully:
```powershell
docker images
```

---

### 5.2 Run the Container with Persistent Storage

The application inside the container listens on port **3000**. We map host port **8080** to container port **3000**, and mount the host directory `docker-data/` to container path `/app/data/`.

#### Windows PowerShell:
```powershell
docker run -d `
  --name todo-app `
  -p 8080:3000 `
  -v "${PWD}/docker-data:/app/data" `
  todo-app:v1
```

#### Linux / macOS / Git Bash:
```bash
docker run -d \
  --name todo-app \
  -p 8080:3000 \
  -v "$(pwd)/docker-data:/app/data" \
  todo-app:v1
```

#### Alternative: Using Docker Compose
```powershell
docker compose up -d
```

---

### 5.3 Application URL
Open your browser and navigate to:
```text
http://localhost:8080
```
Health Check Endpoint:
```text
http://localhost:8080/health
```

---

## 6. Volume Mapping Explanation

```text
+------------------------------------+           +------------------------------------+
|            HOST MACHINE            |           |          DOCKER CONTAINER          |
|                                    |           |                                    |
|   Directory:                       |  Mounted  |   Directory:                       |
|   ${PWD}/docker-data               | --------> |   /app/data                        |
|                                    |           |                                    |
|   File:                            |           |   File:                            |
|   docker-data/todos.json           | <-------  |   /app/data/todos.json             |
|   (Persists on physical hard disk) |  Sync     |   (Written by Express backend)     |
+------------------------------------+           +------------------------------------+
```

- When the container executes `fs.writeFileSync("/app/data/todos.json", ...)`, Docker directly writes the data through the volume mount onto the host's filesystem at `${PWD}/docker-data/todos.json`.
- The container itself is **stateless and ephemeral**. Deleting the container or the image does **NOT** delete the host filesystem directory `docker-data/`.

---

## 7. Data Persistence Test Demonstration

Follow these steps to demonstrate that data survives container deletion and image deletion:

### Step 1: Add a Unique Task in the Browser
1. Open `http://localhost:8080` in your web browser.
2. Add a new task: e.g. `"Persistence Proof - Exam Task 590018263"`.
3. Check the host file: Open `docker-data/todos.json` in Notepad or VS Code. Notice that your new task is immediately written there.

### Step 2: Stop and Remove the Running Container
```powershell
# Stop the running container
docker stop todo-app

# Permanently delete the container
docker rm todo-app
```
*At this point, the container no longer exists (`docker ps -a` shows nothing).*

### Step 3: Delete the Docker Image (Optional Hardcore Test)
```powershell
# Force delete the Docker image
docker rmi todo-app:v1

# Verify the image is gone
docker images
```
*Even with the Docker image completely deleted, open `docker-data/todos.json` on your host. Your data is still there!*

### Step 4: Rebuild Image and Launch a New Container
```powershell
# Rebuild the image
docker build -t todo-app:v1 .

# Launch a brand new container with the same volume mount
docker run -d `
  --name todo-app `
  -p 8080:3000 `
  -v "${PWD}/docker-data:/app/data" `
  todo-app:v1
```

### Step 5: Verify Data is Preserved
1. Refresh `http://localhost:8080`.
2. **Result**: Your previously created task `"Persistence Proof - Exam Task 590018263"` and all previous tasks appear intact!

---

## 8. Useful Docker Commands Cheat Sheet

| Command | Purpose |
|:---|:---|
| `docker build -t todo-app:v1 .` | Build the Docker image from Dockerfile |
| `docker run -d --name todo-app -p 8080:3000 -v "${PWD}/docker-data:/app/data" todo-app:v1` | Run container in background with port & volume mapping |
| `docker ps` | List all actively running containers |
| `docker ps -a` | List all containers (including stopped ones) |
| `docker logs -f todo-app` | Tail live console logs from the running container |
| `docker stop todo-app` | Stop the container safely |
| `docker rm todo-app` | Remove/delete the container |
| `docker exec -it todo-app sh` | Open an interactive terminal inside the running container |
| `docker rmi todo-app:v1` | Delete the Docker image |
| `docker compose down` | Stop and remove compose resources |

---

## 9. Submission Evidence Checklist

Take the following 7 screenshots as required by the examination guidelines:
1. **Screenshot 1**: Successful Docker image build output (`docker build -t todo-app:v1 .`).
2. **Screenshot 2**: Running container listed under `docker ps` showing port `0.0.0.0:8080->3000/tcp`.
3. **Screenshot 3**: Application UI open and working in the browser at `http://localhost:8080`.
4. **Screenshot 4**: Host folder `docker-data/todos.json` open in an editor showing created JSON records.
5. **Screenshot 5**: Terminal executing `docker stop todo-app` followed by `docker rm todo-app`.
6. **Screenshot 6**: Terminal executing `docker run` to launch a new container with the same volume mount.
7. **Screenshot 7**: Browser refreshed at `http://localhost:8080` showing that all previously created tasks are preserved.
