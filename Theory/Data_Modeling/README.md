# Relational Data Modeling with SQLAlchemy ORM

Demonstrates relational schema design, one-to-many relationships, many-to-many relationships via junction tables, and full CRUD operations using SQLAlchemy with an SQLite database.

---

## 💻 Run on Windows

```powershell
# Using virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install sqlalchemy

# Execute script
python main.py
```

---

## 📊 Database Schema

```text
+----------------+       +-------------------+       +-----------------+
|   Department   | 1---* |      Student      | 1---* |   Enrollment    |
+----------------+       +-------------------+       +-----------------+
| id (PK)        |       | id (PK)           |       | student_id (PK) |
| name           |       | name              |       | course_id  (PK) |
+----------------+       | email             |       | semester        |
                         | branch            |       | grade           |
                         | enrollment_date   |       +-----------------+
                         | department_id(FK) |               *
                         +-------------------+               | 1
                                                     +-----------------+
                                                     |     Course      |
                                                     +-----------------+
                                                     | id (PK)         |
                                                     | title           |
                                                     | credits         |
                                                     | department_id   |
                                                     +-----------------+
```