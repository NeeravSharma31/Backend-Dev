const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const PORT = 3002;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// EJS for rendering to-do UI
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'todoSecretKey456',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Route: View To-Do list
app.get('/', (req, res) => {
  // Initialize todos in session if not present
  if (!req.session.todos) {
    req.session.todos = [];
  }

  // Theme cookie support (optional challenge: light/dark)
  const theme = req.cookies.theme || 'light';

  res.render('todo', {
    todos: req.session.todos,
    theme: theme
  });
});

// Route: Add a To-Do
app.post('/add', (req, res) => {
  const { todoItem } = req.body;
  if (!req.session.todos) {
    req.session.todos = [];
  }
  if (todoItem && todoItem.trim()) {
    req.session.todos.push({
      id: Date.now(),
      text: todoItem.trim()
    });
  }
  res.redirect('/');
});

// Route: Delete a To-Do
app.post('/delete', (req, res) => {
  const { id } = req.body;
  if (req.session.todos) {
    req.session.todos = req.session.todos.filter(item => item.id != id);
  }
  res.redirect('/');
});

// Route: Toggle Theme Cookie
app.get('/toggle-theme', (req, res) => {
  const currentTheme = req.cookies.theme || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  res.cookie('theme', newTheme, { maxAge: 90000000 });
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Exercise 2 To-Do App running at http://localhost:${PORT}`);
});