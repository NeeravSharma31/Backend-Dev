# SmartNotes — Web Storage Notes Application

A full-featured, responsive client-side Notes Application built with modern HTML5, CSS3, and JavaScript, strictly adhering to the **[Web Storage Tutorial (localStorage, sessionStorage & JSON)](https://upessocs.github.io/Lectures/Backend%20Development/Theory/Unit%201/L07%20LocalStorage%20SessionStorage%20and%20JSON/)**.

---

## 🚀 Features

### Core Requirements (Must Have)
- [x] **Add Note**: Create notes with Title, Content, Category, and Priority.
- [x] **Display Notes**: Automatically loads and renders all notes from `localStorage` on page load.
- [x] **Delete Note**: Remove individual notes with confirmation dialogs.
- [x] **Edit Note**: In-place form editing preserving unique IDs and updating timestamps.
- [x] **Persistence**: Full persistence across page refreshes and browser restarts via `localStorage`.
- [x] **Structured Schema**: Each note holds `{ id, title, content, category, priority, completed, createdAt, updatedAt }`.

### Stretch Goals & Tutorial Enhancements (Nice to Have)
- [x] **Dual Storage**: Demonstrates `sessionStorage` by auto-saving unsubmitted form drafts in real time (cleared when tab closes).
- [x] **Completion Toggle**: Mark notes as complete or active with visual strike-through styling.
- [x] **Live Search & Filters**: Search in real-time by title or content; filter by category and status; sort by newest, oldest, or alphabetical.
- [x] **Import / Export**: Backup entire notes collection as a `.json` file and restore/merge from JSON backups.
- [x] **Dark / Light Mode**: Theme switcher with user preference persisted in `localStorage`.
- [x] **Live Storage Inspector**: Built-in modal viewer to inspect live keys, values, and byte sizes in both `localStorage` and `sessionStorage`.
- [x] **Cross-Tab Synchronization**: Automatically synchronizes note additions/deletions across multiple open tabs using the `storage` event.

---

## 🏃 How to Run on Windows

### Quick Open (Direct in Browser)
Double-click `index.html` or open via Windows PowerShell:
```powershell
Start-Process "D:\Backend\Backend-Dev\Theory\Assignment_1\index.html"
```

### Local Development Server (Optional)
```powershell
cd D:\Backend\Backend-Dev\Theory\Assignment_1
npx serve -l 3000
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📂 File Structure

```text
Assignment_1/
├── index.html       # Semantic HTML layout, editor panel, and storage inspector
├── style.css        # Responsive dark/light mode design system
├── app.js           # Full CRUD, Web Storage, and JSON serialization logic
├── README.md        # Feature summary and execution guide
└── Report.md        # Academic Lab Report (Number, Title, Object, Theory, Installation, Code, Observation, Challenges)
```