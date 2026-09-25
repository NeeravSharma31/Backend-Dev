# Flask Microservice Server

A clean Flask microservice demonstrating HTTP route handling, JSON serialization, and dynamic HTML generation.

---

## 💻 Run on Windows

```powershell
# Using virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install flask

# Run application
python app.py
```

Open in browser:
- [http://127.0.0.1:5000/](http://127.0.0.1:5000/) - Plain text status
- [http://127.0.0.1:5000/data](http://127.0.0.1:5000/data) - JSON Response
- [http://127.0.0.1:5000/html](http://127.0.0.1:5000/html) - Server-rendered HTML