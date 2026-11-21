# Lab Report: Web Storage Notes Application (localStorage, sessionStorage & JSON)

---

## 1. Number
**Theory Assignment 01 (Lecture 07)**

---

## 2. Title
**Design and Implementation of a Client-Side Notes Application Utilizing Web Storage API (localStorage, sessionStorage) and JSON Serialization**

---

## 3. Object (Objective)
1. To understand the principles of client-side web storage mechanisms in modern web browsers.
2. To differentiate between `localStorage` (persistent storage across browser sessions and tabs) and `sessionStorage` (temporary storage scoped to an individual tab).
3. To resolve the key-value string-only storage constraint using `JSON.stringify()` for serialization and `JSON.parse()` for deserialization.
4. To implement full CRUD operations (Create, Read, Update, Delete) on structured note records (`id`, `title`, `content`, `category`, `priority`, `completed`, `createdAt`, `updatedAt`).
5. To implement real-time draft autosaving using `sessionStorage`, cross-tab synchronization using the `window.onstorage` event, and data backup/restore via JSON file import and export.

---

## 4. Theory

### 4.1 What is Web Storage?
Web Storage is a standard W3C HTML5 API that enables web applications to store key-value data directly inside the client's browser. It overcomes the storage limits and overhead of HTTP cookies:
- **Cookies**: 4 KB limit, automatically transmitted over the network in every HTTP header, increasing latency.
- **Web Storage**: 5–10 MB limit per origin, purely client-side, never sent across network requests unless deliberately fetched.

### 4.2 localStorage vs. sessionStorage
| Feature | `localStorage` | `sessionStorage` |
|:---|:---|:---|
| **Lifespan** | Persists indefinitely until deleted programmatically or cleared by user. | Cleared immediately when the browser tab is closed. |
| **Scope** | Shared across all tabs, windows, and iframes of the same origin. | Isolated to the specific browser tab where it was generated. |
| **Capacity** | ~5–10 MB | ~5–10 MB |
| **Our Implementation** | Stores permanent notes list (`smartnotes_data`) & theme (`smartnotes_theme`). | Auto-saves unsaved form drafts (`smartnotes_form_draft`). |

### 4.3 The "JSON Problem" & Serialization Solution
Web Storage natively supports only **DOMString** key-value pairs:
- If a developer executes `localStorage.setItem("user", { name: "Alice" })`, JavaScript invokes `.toString()`, storing the literal string `"[object Object]"`. The actual data is lost.
- **Serialization**: `JSON.stringify(notes)` converts complex JavaScript objects and arrays into structured JSON strings before calling `setItem()`.
- **Deserialization**: `JSON.parse(rawString)` restores the string back into native JavaScript objects and arrays upon calling `getItem()`.

---

## 5. Installation & Execution (Windows)

### Prerequisites
- Any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox).
- Optional: Local HTTP server (Node.js `serve` / Python `http.server`).

### Execution Options

#### Option A: Direct Browser Execution (No Server Required)
Double-click `index.html` or run via Windows PowerShell:
```powershell
Start-Process "D:\Backend\Backend-Dev\Theory\Assignment_1\index.html"
```

#### Option B: Lightweight Local Development Server
From PowerShell:
```powershell
cd D:\Backend\Backend-Dev\Theory\Assignment_1
npx serve -l 3000
# or: python -m http.server 3000
```
Open browser at: [http://localhost:3000](http://localhost:3000)

---

## 6. Project Structure

```text
Assignment_1/
├── index.html       # Responsive Semantic HTML5 UI layout & Storage Inspector Modal
├── style.css        # Modern Dark/Light theme design system & CSS variables
├── app.js           # Core Web Storage controllers, CRUD logic, draft autosave, import/export
├── README.md        # User manual, tutorial checklist verification, and feature overview
└── Report.md        # Formal academic lab report adhering to the prescribed university structure
```

---

## 7. Code Implementation Details

### 7.1 Data Model
Each note is represented as a structured object:
```javascript
const note = {
  id: Date.now(),                          // Unique numeric timestamp identifier
  title: "MongoDB Connection Architecture",
  content: "MongoDB uses connection pooling...",
  category: "Backend",                     // Tag: General, Backend, Theory, Lab, Personal
  priority: "High",                        // Priority: Low, Medium, High
  completed: false,                        // Status flag
  createdAt: "2026-10-03T17:30:00.000Z",   // ISO timestamp
  updatedAt: null                          // ISO timestamp upon modification
};
```

### 7.2 Helper Functions (`getNotes` & `saveNotes`)
```javascript
function getNotesFromStorage() {
  const raw = localStorage.getItem("smartnotes_data");
  return raw ? JSON.parse(raw) : [];
}

function saveNotesToStorage(updatedNotes) {
  localStorage.setItem("smartnotes_data", JSON.stringify(updatedNotes));
  updateStorageStats();
}
```

### 7.3 Dual-Storage Draft Autosave Mechanism
```javascript
// Autosaving draft into sessionStorage on input
function saveDraftToSession() {
  const draft = {
    title: noteTitleInput.value,
    category: noteCategorySelect.value,
    priority: notePrioritySelect.value,
    content: noteContentInput.value
  };
  if (draft.title.trim() || draft.content.trim()) {
    sessionStorage.setItem("smartnotes_form_draft", JSON.stringify(draft));
  } else {
    sessionStorage.removeItem("smartnotes_form_draft");
  }
}
```

### 7.4 Cross-Tab Synchronization
```javascript
window.addEventListener('storage', (e) => {
  if (e.key === "smartnotes_data") {
    notes = getNotesFromStorage();
    renderNotes();
  }
});
```

---

## 8. Observation

| Test Scenario | Action Performed | Observed Outcome |
|:---|:---|:---|
| **Create Note** | Filled title and content, clicked "Save Note" | Note card rendered with timestamp badge; stored in `localStorage` under key `smartnotes_data`. |
| **Page Refresh** | Pressed F5 | All notes remained intact, verifying persistent `localStorage`. |
| **Edit Note** | Clicked ✏️ on a card, updated content, submitted | Note updated in-place; `updatedAt` timestamp appended. |
| **Delete Note** | Clicked 🗑️ on a card | Confirmation prompt triggered; note removed from array and updated in `localStorage`. |
| **Draft Preservation** | Typed half a note in the form without saving, refreshed tab | `sessionStorage` restored the title and content automatically into the form fields. |
| **Tab Isolation** | Closed the browser tab and reopened in a new tab | Notes from `localStorage` persisted; `sessionStorage` draft cleared cleanly, demonstrating tab lifecycle. |
| **Cross-Tab Sync** | Added note in Tab 1 while Tab 2 was open | Tab 2 updated its UI dynamically via `window.onstorage` without requiring a manual refresh. |
| **Export / Import** | Clicked "Export JSON", edited the file, clicked "Import JSON" | Notes downloaded as JSON file; imported records merged without ID conflicts. |
| **Live Inspector** | Clicked "Storage Inspector" button | Modal displayed real-time JSON dumps of both `localStorage` and `sessionStorage`. |

---

## 9. Challenges & Solutions

1. **Object Storage Limitation (`[object Object]`)**:
   - *Challenge*: Attempting to store raw objects in Web Storage causes silent conversion to string `"[object Object]"`.
   - *Solution*: Implemented rigorous `JSON.stringify()` encoding on save and `JSON.parse()` on retrieval, enclosed within `try/catch` error-handling blocks.

2. **Cross-Site Scripting (XSS) Prevention**:
   - *Challenge*: Rendering user-generated notes with `.innerHTML` allows script injection (`<script>alert(1)</script>`).
   - *Solution*: Developed a dedicated `escapeHtml()` sanitizer utility converting `<`, `>`, `&`, `"`, `'` into safe HTML entities before DOM insertion.

3. **Quota Exceeded Handling**:
   - *Challenge*: Mobile browsers or storage-constrained devices throw a `QuotaExceededError` when 5 MB is breached.
   - *Solution*: Added a dynamic byte size calculator displaying current consumption and caught quota errors gracefully with user-friendly toast alerts.