# Lab Report: Blog Content Management System (Simple CMS)

---

## 1. Number
**Laboratory Examination 01 (Exam 01 C)**

---

## 2. Title
**Design and Development of a Blog Content Management System (CMS) with Server-Side Rendering (EJS), Express.js, and MongoDB Persistence**

---

## 3. Object (Objective)
1. To design and implement a web application named **Simple CMS** allowing users to create and read blog posts.
2. To utilize server-side templating (**EJS**) to dynamically render web pages on the backend.
3. To store all blog posts permanently in a **MongoDB** database using unique ObjectIds.
4. To enforce backend validation on inputs and automatically generate post creation timestamps on the server.
5. To implement separate views for post summaries and full individual post reading.

---

## 4. Theory

### 4.1 Server-Side Rendering (SSR) Architecture
In Server-Side Rendering (SSR), web pages are assembled on the server rather than in the client's browser. When a client requests a resource:
1. The server queries the database (MongoDB) for relevant data.
2. The server injects the retrieved data into an EJS template (`.ejs`).
3. The EJS compiler resolves logic (loops, conditionals, and variables) into static HTML.
4. The server transmits complete HTML to the client browser with `Content-Type: text/html`.

SSR ensures fast initial page loads, optimal search engine indexing (SEO), and guarantees that sensitive business logic and data transformations remain secured on the backend.

### 4.2 Document-Oriented Persistence with MongoDB
MongoDB is a NoSQL, document-oriented database that stores records as flexible BSON (Binary JSON) documents. 
- **Document Model**:
  ```json
  {
    "_id": ObjectId("6abbcfe13572aa4b38074545"),
    "title": "Introduction to MongoDB",
    "author": "Priya",
    "content": "MongoDB is a document-oriented database...",
    "createdAt": ISODate("2026-09-26T12:30:00Z")
  }
  ```
- **Projection**: The listing page uses projection (`{ title: 1, author: 1, createdAt: 1 }`) to omit the full content field, minimizing network payload and memory consumption.
- **Backend Timestamp Generation**: Setting `createdAt: new Date()` in the controller ensures creation dates are tamper-proof and strictly synchronized to the server clock.

---

## 5. Installation Process (Windows)

### Prerequisites
- Node.js (v18.x or later)
- MongoDB Server running on `mongodb://127.0.0.1:27017`

### Execution Steps
1. Navigate to the project directory:
   ```powershell
   cd D:\Backend\Backend-Dev\Lab\Viva_1
   ```

2. Dependencies (`express`, `ejs`, `mongodb`) are defined in `package.json`:
   ```powershell
   npm install
   ```

3. Start the application:
   ```powershell
   npm start
   # or: node index.js
   ```

4. Access the application in the browser:
   - Home / Posts List: `http://localhost:3000/` or `http://localhost:3000/posts`
   - Create Post: `http://localhost:3000/posts/new`

---

## 6. Project Structure

```text
Viva_1/
├── index.js              # Express application, routes, and MongoDB client
├── package.json          # Dependencies (express, ejs, mongodb)
├── package-lock.json
├── README.md             # Documentation & execution instructions
└── views/                # Server-Side EJS Templates
    ├── posts.ejs         # Post listing page (clickable titles, author, date)
    ├── create.ejs        # Post creation form with validation
    └── post.ejs          # Full individual post view by MongoDB ID
```

---

## 7. Observation

| HTTP Method | Route | Description / Test | Observed Status & Outcome |
|:---:|:---|:---|:---|
| `GET` | `/` or `/posts` | Listing all posts | `200 OK` — Displays sample posts (Title, Author, Date); titles are clickable hyperlinks. |
| `GET` | `/posts/new` | Open create post form | `200 OK` — Renders input form for title, author, and content. |
| `POST` | `/posts` | Submit valid new post | `302 Found` — Redirects to `/posts`; new post is immediately visible in the list. |
| `POST` | `/posts` | Submit empty title or content | `200 OK` — Re-renders form displaying validation alert: `"Title cannot be empty."` |
| `GET` | `/posts/:id` | Open post by clicking title | `200 OK` — Renders complete post content retrieved from MongoDB using `ObjectId`. |

---

## 8. Challenges & Solutions

1. **Tamper-Proof Timestamps**:
   - *Challenge*: The exam strictly specified that users must not manually enter creation dates.
   - *Solution*: Omitted date inputs entirely from the frontend form and set `createdAt: new Date()` directly within the Express route handler before MongoDB insertion.

2. **MongoDB ObjectId Parsing**:
   - *Challenge*: Invalid ID strings passed in `/posts/:id` caused MongoDB driver runtime exceptions.
   - *Solution*: Added `ObjectId.isValid(id)` guard checks before executing `postsCollection.findOne({ _id: new ObjectId(id) })`.

3. **Post-Redirect-Get (PRG) Pattern**:
   - *Challenge*: Rendering the post list directly on `POST /posts` would cause duplicate post submissions if the user refreshed the page.
   - *Solution*: Employed `res.redirect('/posts')` following successful document insertion, enforcing clean idempotent navigation.