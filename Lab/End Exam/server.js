const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Persistent Storage Directory (Host Volume Mapping Target)
// Defaults to ./docker-data locally, or /app/data inside Docker container
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "docker-data");
const DATA_FILE = path.join(DATA_DIR, "todos.json");

// Ensure persistent storage directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial sample data if file does not exist
const INITIAL_TODOS = [
  {
    id: 1,
    title: "Containerize Todo application with Dockerfile",
    category: "DevOps",
    priority: "High",
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Configure persistent volume mapping (-v ${PWD}/docker-data:/app/data)",
    category: "Docker",
    priority: "High",
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Verify data persistence after container removal and recreation",
    category: "Testing",
    priority: "Medium",
    completed: false,
    createdAt: new Date().toISOString()
  }
];

// Helper: Read data from persistent file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("[Storage] Error reading persistent storage, initializing fresh:", err.message);
  }
  saveData(INITIAL_TODOS);
  return INITIAL_TODOS;
}

// Helper: Save data to persistent file
function saveData(todos) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), "utf-8");
  } catch (err) {
    console.error("[Storage] Failed to write to persistent file:", err.message);
  }
}

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Request timing & structured logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// ==========================================
// Web UI Routes
// ==========================================

// Dashboard / Todo View
app.get("/", (req, res) => {
  const todos = loadData();
  const filter = req.query.filter || "all";
  
  let filtered = todos;
  if (filter === "active") filtered = todos.filter(t => !t.completed);
  if (filter === "completed") filtered = todos.filter(t => t.completed);

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  };

  res.render("index", {
    todos: filtered,
    currentFilter: filter,
    stats,
    dataFile: DATA_FILE,
    student: {
      name: "Neerav Kumar Sharma",
      sapId: "590018263",
      course: "Backend Development",
      exam: "Final Examination"
    }
  });
});

// HTML Form: Add Todo
app.post("/todos/add", (req, res) => {
  const { title, category, priority } = req.body;
  if (!title || title.trim() === "") {
    return res.redirect("/");
  }

  const todos = loadData();
  const nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;

  const newTodo = {
    id: nextId,
    title: title.trim(),
    category: category || "General",
    priority: priority || "Medium",
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.unshift(newTodo);
  saveData(todos);
  console.log(`[Persistent Store] Created todo #${nextId}: "${newTodo.title}" -> saved to ${DATA_FILE}`);
  res.redirect("/");
});

// HTML Form: Toggle Todo Completion
app.post("/todos/toggle/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todos = loadData();
  const todo = todos.find(t => t.id === id);

  if (todo) {
    todo.completed = !todo.completed;
    saveData(todos);
    console.log(`[Persistent Store] Toggled todo #${id} to ${todo.completed ? "COMPLETED" : "ACTIVE"}`);
  }
  res.redirect("/");
});

// HTML Form: Delete Todo
app.post("/todos/delete/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  let todos = loadData();
  const exists = todos.some(t => t.id === id);

  if (exists) {
    todos = todos.filter(t => t.id !== id);
    saveData(todos);
    console.log(`[Persistent Store] Deleted todo #${id} -> updated ${DATA_FILE}`);
  }
  res.redirect("/");
});

// ==========================================
// REST API Endpoints (For testing & automation)
// ==========================================

// Health Check Probe
app.get("/health", (req, res) => {
  const todos = loadData();
  res.status(200).json({
    status: "healthy",
    application: "todo-container-app",
    version: "1.0.0",
    uptime_seconds: process.uptime(),
    storage: {
      directory: DATA_DIR,
      file: DATA_FILE,
      persisted_records: todos.length
    },
    author: {
      name: "Neerav Kumar Sharma",
      sap_id: "590018263"
    }
  });
});

// List All Todos
app.get("/api/todos", (req, res) => {
  const todos = loadData();
  res.json(todos);
});

// Create Todo
app.post("/api/todos", (req, res) => {
  const { title, category, priority } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const todos = loadData();
  const nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
  const newTodo = {
    id: nextId,
    title: title.trim(),
    category: category || "General",
    priority: priority || "Medium",
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.unshift(newTodo);
  saveData(todos);
  res.status(201).json(newTodo);
});

// Update Todo
app.put("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todos = loadData();
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const { title, category, priority, completed } = req.body;
  if (title !== undefined) todo.title = title;
  if (category !== undefined) todo.category = category;
  if (priority !== undefined) todo.priority = priority;
  if (completed !== undefined) todo.completed = Boolean(completed);

  saveData(todos);
  res.json(todo);
});

// Delete Todo
app.delete("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  let todos = loadData();
  const exists = todos.some(t => t.id === id);

  if (!exists) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todos = todos.filter(t => t.id !== id);
  saveData(todos);
  res.json({ message: "Todo deleted successfully", id });
});

// Start Server
app.listen(PORT, HOST, () => {
  console.log("==================================================================");
  console.log(`  CONTAINERIZED TODO APP LISTENING ON http://${HOST}:${PORT}`);
  console.log(`  Persistent Data File: ${DATA_FILE}`);
  console.log(`  Student: Neerav Kumar Sharma (SAP ID: 590018263)`);
  console.log("==================================================================");
});
