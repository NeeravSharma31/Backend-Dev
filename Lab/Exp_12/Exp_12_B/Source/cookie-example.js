const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());

app.get('/set-cookie', (req, res) => {
  res.cookie('username', 'JohnDoe', { maxAge: 900000 });
  res.send('Cookie has been set. <a href="/get-cookie">View Cookie</a>');
});

app.get('/get-cookie', (req, res) => {
  const user = req.cookies['username'];
  res.send(`Cookie Retrieved: ${user} <br><a href="/delete-cookie">Delete Cookie</a>`);
});

app.get('/delete-cookie', (req, res) => {
  res.clearCookie('username');
  res.send('Cookie deleted. <a href="/get-cookie">Check Cookie</a>');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});