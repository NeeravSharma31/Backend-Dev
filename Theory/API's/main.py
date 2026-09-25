from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

app = FastAPI()

templates = Jinja2Templates(directory="templates")

@app.get("/")
async def home():
    return {"message": "Server is running! Go to /details to see the student info."}

@app.get("/details", response_class=HTMLResponse)
async def get_student_details(request: Request):
    student_data = {
        "name": "Neerav Kumar Sharma",
        "sap": "590018263",
        "batch": "2024-2028"
    }
    
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"request": request, "student": student_data}
    )