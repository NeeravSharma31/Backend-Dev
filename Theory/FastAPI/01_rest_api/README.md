# Student Management REST API — FastAPI & Pydantic

A fully typed RESTful CRUD API demonstrating data serialization, path/query parameter handling, status codes, and model validation using Pydantic.

---

## 💻 Run on Windows

```powershell
# Using the Theory-level virtual environment (or local venv)
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn pydantic

# Run the API server
uvicorn main:app --reload --port 5000
```

- **API Base URL**: [http://127.0.0.1:5000](http://127.0.0.1:5000)
- **Interactive Swagger Documentation**: [http://127.0.0.1:5000/docs](http://127.0.0.1:5000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:5000/redoc](http://127.0.0.1:5000/redoc)

---

## 📌 REST Endpoints

| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| GET | `/students` | Get all students (supports `?branch=CSE` filter) | `200 OK` |
| GET | `/students/{id}` | Get student by ID | `200 OK` or `404 Not Found` |
| POST | `/students` | Create new student | `201 Created` |
| PUT | `/students/{id}` | Update existing student | `200 OK` or `404 Not Found` |
| DELETE | `/students/{id}` | Delete student | `204 No Content` |