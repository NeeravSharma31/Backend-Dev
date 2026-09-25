from datetime import date

from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey
# from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Create database connection
engine = create_engine("sqlite:///students.db")
Base = declarative_base()
Session = sessionmaker(bind=engine)
session = Session()

# Define models
class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    
    students = relationship("Student", back_populates="department")
    courses = relationship("Course", back_populates="department")

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    branch = Column(String(50))
    enrollment_date = Column(Date)
    department_id = Column(Integer, ForeignKey("departments.id"))
    
    department = relationship("Department", back_populates="students")
    enrollments = relationship("Enrollment", back_populates="student")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(String(10), primary_key=True)
    title = Column(String(100), nullable=False)
    credits = Column(Integer, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    
    department = relationship("Department", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"
    
    student_id = Column(Integer, ForeignKey("students.id"), primary_key=True)
    course_id = Column(String(10), ForeignKey("courses.id"), primary_key=True)
    semester = Column(String(20))
    grade = Column(String(2))
    
    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

# Create tables
Base.metadata.create_all(engine)

# Create
new_student = Student(
    name="Aarav",
    email="aarav@upes.ac.in",
    branch="CSE",
    enrollment_date=date(2024, 8, 1),
    department_id=1
)
session.add(new_student)
session.commit()

# Read
students = session.query(Student).filter(Student.branch == "CSE").all()
student = session.query(Student).filter_by(id=1).first()

# Update
student.branch = "ECE"
session.commit()

# Delete
session.delete(student)
session.commit()
