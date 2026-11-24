from django.http import JsonResponse

# Sample student dataset for demonstration
STUDENTS = [
    {"id": 1, "name": "Neerav Kumar Sharma", "roll_no": "590018263", "branch": "B.Tech CSE", "semester": 5},
    {"id": 2, "name": "Aarav Sharma", "roll_no": "590018101", "branch": "B.Tech CSE", "semester": 5},
    {"id": 3, "name": "Rohan Verma", "roll_no": "590018150", "branch": "B.Tech IT", "semester": 5},
]

def health_check(request):
    """Health check endpoint demonstrating fixed URL route and middleware logging."""
    return JsonResponse({
        "status": "ok",
        "service": "Student Management API",
        "framework": getattr(request, "course_name", "Django")
    })

def student_list(request):
    """App-level route returning collection of student records."""
    return JsonResponse({
        "students": STUDENTS,
        "total": len(STUDENTS),
        "message": "Student list endpoint"
    })

def student_detail(request, student_id):
    """App-level route demonstrating parameterized <int:student_id> URL converter."""
    student = next((s for s in STUDENTS if s["id"] == student_id), None)
    if student:
        return JsonResponse({
            "student": student,
            "message": "Student detail endpoint"
        })
    return JsonResponse({
        "student_id": student_id,
        "error": "Student not found",
        "message": f"No student found with ID {student_id}"
    }, status=404)
