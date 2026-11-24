import logging
import time
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("student-api")

app = FastAPI(
    title="Student API - FastAPI",
    description="Containerized FastAPI Service with Observability and Horizontal Scaling",
    version="0.1.0",
)

# In-memory student registry
students = [
    {"id": 1, "name": "Aarav", "course": "Backend Development"},
    {"id": 2, "name": "Diya", "course": "Backend Development"},
    {"id": 3, "name": "Neerav Kumar Sharma", "course": "Backend Development"},
]

# Middleware for request timing and structured logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    try:
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "method=%s path=%s status=%s duration_ms=%.2f",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
        return response
    except Exception as exc:
        duration_ms = (time.perf_counter() - start) * 1000
        logger.exception(
            "method=%s path=%s status=500 duration_ms=%.2f error=%s",
            request.method,
            request.url.path,
            duration_ms,
            str(exc),
        )
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
