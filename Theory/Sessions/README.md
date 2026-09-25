# Session Management with Express-Session

Demonstrates stateful user sessions in a stateless HTTP environment using signed session ID cookies and server-side in-memory session stores.

---

## 💻 Run on Windows

```powershell
# Navigate to Sessions folder
npm install
node app.js
```

Server runs on: [http://localhost:3000](http://localhost:3000)

---

## 📌 Endpoints & Flow

1. **`GET /login`**: Initializes `req.session.username = 'JohnDoe'` and attaches a signed `connect.sid` cookie to the HTTP response header.
2. **`GET /profile`**: Inspects `req.session.username`. If valid, returns `"Welcome JohnDoe"`. If cookie expired or missing, returns `"Please log in first."`.
3. **`GET /logout`**: Invokes `req.session.destroy()` to delete the session on the server and invalidates the session ID.