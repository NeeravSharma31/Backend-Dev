import logging
import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request, status
from pydantic import BaseModel, Field

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("pbl-student-portal")

app = FastAPI(
    title="Student Management Portal API",
    description="PBL Assignment: Production-Grade Containerized REST API with Automated Testing and CI/CD",
    version="1.0.0",
)

# Pydantic Schemas
class StudentBase(BaseModel):
    name: str = Field(..., min_length=2, example="Neerav Kumar Sharma")
    sap_id: str = Field(..., min_length=6, example="590018263")
    branch: str = Field(..., example="Computer Science & Engineering")
    email: str = Field(..., example="neeravkumar310806@gmail.com")

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    branch: Optional[str] = None
    email: Optional[str] = None

class StudentResponse(StudentBase):
    id: int

# In-Memory Database Store
db: List[dict] = [
    {
        "id": 1,
        "name": "Neerav Kumar Sharma",
        "sap_id": "590018263",
        "branch": "Computer Science & Engineering",
        "email": "neeravkumar310806@gmail.com",
    },
    {
        "id": 2,
        "name": "Aarav Sharma",
        "sap_id": "590011111",
        "branch": "Cyber Security",
        "email": "aarav@example.com",
    },
    {
        "id": 3,
        "name": "Diya Patel",
        "sap_id": "590022222",
        "branch": "Artificial Intelligence",
        "email": "diya@example.com",
    },
]
id_counter = 4

# Performance Timing & Logging Middleware
@app.middleware("http")
async def performance_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    try:
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.info(
            "method=%s path=%s status=%s duration_ms=%.2f",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
        return response
    except Exception as exc:
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.exception(
            "method=%s path=%s status=500 duration_ms=%.2f error=%s",
            request.method,
            request.url.path,
            duration_ms,
            str(exc),
        )
        raise

# Root Endpoint
@app.get("/", tags=["General"])
def read_root():
    return {
        "project": "PBL - Student Management Portal API",
        "framework": "FastAPI",
        "status": "online",
        "version": "1.0.0",
        "author": "Neerav Kumar Sharma",
        "sap_id": "590018263",
        "institution": "UPES Dehradun",
    }

# Health Check Probe
@app.get("/health", tags=["Monitoring"])
def health_check():
    return {
        "status": "healthy",
        "service": "student-portal-api",
        "timestamp": time.time(),
    }

# Read All Students (with optional branch filter)
@app.get("/api/v1/students", response_model=List[StudentResponse], tags=["Students"])
def get_students(branch: Optional[str] = None):
    if branch:
        filtered = [s for s in db if s["branch"].lower() == branch.lower()]
        return filtered
    return db

# Read Single Student by ID
@app.get("/api/v1/students/{student_id}", response_model=StudentResponse, tags=["Students"])
def get_student_by_id(student_id: int):
    for s in db:
        if s["id"] == student_id:
            return s
    raise HTTPException(status_code=404, detail=f"Student with ID {student_id} not found")

# Create New Student
@app.post("/api/v1/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED, tags=["Students"])
def create_student(student: StudentCreate):
    global id_counter
    # Check for duplicate SAP ID
    for s in db:
        if s["sap_id"] == student.sap_id:
            raise HTTPException(status_code=400, detail=f"Student with SAP ID {student.sap_id} already exists")

    new_record = {
        "id": id_counter,
        "name": student.name,
        "sap_id": student.sap_id,
        "branch": student.branch,
        "email": student.email,
    }
    id_counter += 1
    db.append(new_record)
    return new_record

# Update Student
@app.put("/api/v1/students/{student_id}", response_model=StudentResponse, tags=["Students"])
def update_student(student_id: int, updates: StudentUpdate):
    for s in db:
        if s["id"] == student_id:
            if updates.name is not None:
                s["name"] = updates.name
            if updates.branch is not None:
                s["branch"] = updates.branch
            if updates.email is not None:
                s["email"] = updates.email
            return s
    raise HTTPException(status_code=404, detail=f"Student with ID {student_id} not found")

# Delete Student
@app.delete("/api/v1/students/{student_id}", status_code=status.HTTP_200_OK, tags=["Students"])
def delete_student(student_id: int):
    for index, s in enumerate(db):
        if s["id"] == student_id:
            removed = db.pop(index)
            return {"message": "Student successfully deleted", "student": removed}
    raise HTTPException(status_code=404, detail=f"Student with ID {student_id} not found")

# Analytics / Aggregation Endpoint
@app.get("/api/v1/stats", tags=["Analytics"])
def get_statistics():
    branches = {}
    for s in db:
        b = s["branch"]
        branches[b] = branches.get(b, 0) + 1
    return {
        "total_students": len(db),
        "branch_distribution": branches,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
