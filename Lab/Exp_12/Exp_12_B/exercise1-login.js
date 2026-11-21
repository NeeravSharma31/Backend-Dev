const express = require('express');
const session = require('express-session');
const app = express();
const PORT = 3001;

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'authSecretKey123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 15 } // 15 mins
}));

// In-memory user database
const users = [];

// Authentication middleware to protect routes
function authMiddleware(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Home -> redirect to dashboard or login
app.get('/', (req, res) => {
  if (req.session.user) res.redirect('/dashboard');
  else res.redirect('/login');
});

// Register page
app.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Register</title><style>body{font-family:Arial;max-width:400px;margin:50px auto;}</style></head>
    <body>
      <h2>Create an Account</h2>
      <form action="/register" method="POST">
        <p><input type="text" name="username" placeholder="Username" required style="width:100%;padding:8px;"/></p>
        <p><input type="password" name="password" placeholder="Password" required style="width:100%;padding:8px;"/></p>
        <button type="submit" style="padding:10px 15px;background:#28a745;color:white;border:none;">Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login here</a></p>
    </body>
    </html>
  `);
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.send('<h3>User already exists! <a href="/register">Try another name</a></h3>');
  }
  users.push({ username, password });
  res.send('<h3>Registration successful! <a href="/login">Click here to Login</a></h3>');
});

// Login page
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Login</title><style>body{font-family:Arial;max-width:400px;margin:50px auto;}</style></head>
    <body>
      <h2>Login to Your Account</h2>
      <form action="/login" method="POST">
        <p><input type="text" name="username" placeholder="Username" required style="width:100%;padding:8px;"/></p>
        <p><input type="password" name="password" placeholder="Password" required style="width:100%;padding:8px;"/></p>
        <button type="submit" style="padding:10px 15px;background:#007bff;color:white;border:none;">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register here</a></p>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = { username: user.username };
    res.redirect('/dashboard');
  } else {
    res.send('<h3>Invalid username or password! <a href="/login">Try again</a></h3>');
  }
});

// Protected Dashboard route
app.get('/dashboard', authMiddleware, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Dashboard</title><style>body{font-family:Arial;max-width:600px;margin:50px auto;padding:20px;border:1px solid #ddd;border-radius:8px;}</style></head>
    <body>
      <h2>User Dashboard (Protected Area)</h2>
      <p>Welcome back, <strong>${req.session.user.username}</strong>!</p>
      <p>Your session is active and stored securely on the server.</p>
      <hr>
      <form action="/logout" method="POST">
        <button type="submit" style="padding:10px 20px;background:#dc3545;color:white;border:none;cursor:pointer;">Logout</button>
      </form>
    </body>
    </html>
  `);
});

// Logout handler
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Exercise 1 Login System running at http://localhost:${PORT}`);
});