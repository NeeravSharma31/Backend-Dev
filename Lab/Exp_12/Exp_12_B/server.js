const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // to handle form data

// Session middleware
app.use(session({
  secret: 'mysecretkey', // used to sign the session ID cookie
  resave: false,         // do not save session if unmodified
  saveUninitialized: true, // save new sessions
  cookie: { maxAge: 60000 } // cookie expiration in ms (here: 1 minute)
}));

// Home route
app.get('/', (req, res) => {
  const theme = req.cookies.theme || 'default';
  if (req.session.username) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial; padding: 30px;">
        <h2>Welcome back, ${req.session.username}!</h2>
        <p>Active Theme Cookie: <strong>${theme}</strong></p>
        <p><a href="/logout">Logout</a></p>
      </body>
      </html>
    `);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial; padding: 30px;">
        <h2>Session & Cookie Demo</h2>
        <p>Theme Cookie: <strong>${theme}</strong></p>
        <form action="/login" method="post">
          <input type="text" name="username" placeholder="Enter username" required />
          <button type="submit">Login</button>
        </form>
      </body>
      </html>
    `);
  }
});

// Login route
app.post('/login', (req, res) => {
  const { username } = req.body;
  req.session.username = username; // store username in session
  res.cookie('theme', 'dark', { maxAge: 900000, httpOnly: true }); // sample cookie
  res.redirect('/');
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid'); // remove session cookie
    res.redirect('/');
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));