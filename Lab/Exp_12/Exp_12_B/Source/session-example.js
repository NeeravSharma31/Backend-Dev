const express = require('express');
const session = require('express-session');
const app = express();

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.send(`Welcome back! You visited ${req.session.views} times. <br><a href="/destroy">Destroy Session</a>`);
  } else {
    req.session.views = 1;
    res.send('Welcome to the session demo. Refresh to count visits. <br><a href="/destroy">Destroy Session</a>');
  }
});

app.get('/destroy', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Error destroying session');
    }
    res.send('Session destroyed. <a href="/">Go back</a>');
  });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});