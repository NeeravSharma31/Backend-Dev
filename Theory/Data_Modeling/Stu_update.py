from main import *

# Create database connection
engine = create_engine("sqlite:///students.db")
Base = declarative_base()
Session = sessionmaker(bind=engine)
session = Session()

# Create tables
Base.metadata.create_all(engine)

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