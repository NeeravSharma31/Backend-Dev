# 💻 Backend Development — Theory Modules

Structured collection of backend development topics covering Express.js, state management, FastAPI REST APIs, Jinja2 Server-Side Rendering, Flask microservices, and SQLAlchemy Object-Relational Mapping.

---

## 📑 Module Index & Reports

| Unit | Topic | Framework / Tech | Directory | Report / Documentation |
|:---:|:---|:---|:---|:---|
| **01** | **Express Core & SSR** | Node.js, Express, EJS | [`express_demo/`](./express_demo/) | [Express Report](./express_demo/Report.md) |
| **02** | **Session Management** | Node.js, Express-Session | [`Sessions/`](./Sessions/) | [Sessions README](./Sessions/README.md) |
| **03** | **FastAPI REST API** | Python, FastAPI, Pydantic | [`FastAPI/01_rest_api/`](./FastAPI/01_rest_api/) | [REST API README](./FastAPI/01_rest_api/README.md) |
| **04** | **FastAPI Jinja2 SSR** | Python, FastAPI, Jinja2 | [`FastAPI/02_ssr_jinja/`](./FastAPI/02_ssr_jinja/) | [SSR README](./FastAPI/02_ssr_jinja/README.md) |
| **05** | **Flask Microservice** | Python, Flask | [`flask/`](./flask/) | [Flask README](./flask/README.md) |
| **06** | **Data Modeling & ORM** | Python, SQLAlchemy, SQLite | [`Data_Modeling/`](./Data_Modeling/) | [ORM README](./Data_Modeling/README.md) |

👉 **Full Lab Report**: [Read the Comprehensive Theory Lab Report](./Report.md)

---

## 🪟 Windows Quick Start

### 1. Node.js Setup
```powershell
cd express_demo
npm install
npm run step1 # runs 01_basic_server.js
npm run step5 # runs 05_ssr_ejs.js
```

### 2. Python Setup (Virtual Environment)
```powershell
# Create & activate Windows virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install all Python backend dependencies
pip install -r requirements.txt
```