/**
 * SmartNotes — Web Storage Application
 * Demonstrates:
 * 1. localStorage for persistent notes, settings, and theme
 * 2. sessionStorage for temporary draft auto-saving (per-tab)
 * 3. JSON.stringify() and JSON.parse() serialization
 * 4. Full CRUD operations, filtering, search, export/import
 */

// Storage Keys Constants
const STORAGE_KEYS = {
  NOTES: 'smartnotes_data',
  THEME: 'smartnotes_theme',
  DRAFT: 'smartnotes_form_draft'
};

// Application State
let notes = [];
let editingNoteId = null;

// DOM Elements
const noteForm = document.getElementById('noteForm');
const editNoteIdInput = document.getElementById('editNoteId');
const noteTitleInput = document.getElementById('noteTitle');
const noteCategorySelect = document.getElementById('noteCategory');
const notePrioritySelect = document.getElementById('notePriority');
const noteContentInput = document.getElementById('noteContent');
const formTitle = document.getElementById('formTitle');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const clearDraftBtn = document.getElementById('clearDraftBtn');
const draftIndicator = document.getElementById('draftIndicator');

const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');
const sortBy = document.getElementById('sortBy');

const totalNotesCount = document.getElementById('totalNotesCount');
const completedNotesCount = document.getElementById('completedNotesCount');
const storageUsedBytes = document.getElementById('storageUsedBytes');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');

const exportJsonBtn = document.getElementById('exportJsonBtn');
const importJsonInput = document.getElementById('importJsonInput');
const clearAllBtn = document.getElementById('clearAllBtn');

const toggleStorageViewerBtn = document.getElementById('toggleStorageViewerBtn');
const storageModal = document.getElementById('storageModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const lsContentDisplay = document.getElementById('lsContentDisplay');
const ssContentDisplay = document.getElementById('ssContentDisplay');
const lsKeyCount = document.getElementById('lsKeyCount');
const ssKeyCount = document.getElementById('ssKeyCount');
const refreshLsBtn = document.getElementById('refreshLsBtn');
const refreshSsBtn = document.getElementById('refreshSsBtn');

const toastContainer = document.getElementById('toastContainer');

/* ==========================================================================
   1. Web Storage Core Helpers (localStorage & sessionStorage)
   ========================================================================== */

/**
 * Read and deserialize notes array from localStorage using JSON.parse()
 */
function getNotesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing notes from localStorage:', error);
    showToast('Failed to parse notes from storage.', 'error');
    return [];
  }
}

/**
 * Serialize and persist notes array to localStorage using JSON.stringify()
 */
function saveNotesToStorage(updatedNotes) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
    updateStorageStats();
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
    showToast('Storage quota exceeded or error occurred.', 'error');
  }
}

/**
 * Save in-progress draft to sessionStorage (scoped to this specific browser tab)
 */
function saveDraftToSession() {
  if (editingNoteId) return; // Don't autosave draft when editing existing note

  const draft = {
    title: noteTitleInput.value,
    category: noteCategorySelect.value,
    priority: notePrioritySelect.value,
    content: noteContentInput.value,
    savedAt: new Date().toISOString()
  };

  const hasContent = draft.title.trim() || draft.content.trim();
  if (hasContent) {
    sessionStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
    draftIndicator.classList.add('visible');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.DRAFT);
    draftIndicator.classList.remove('visible');
  }
}

/**
 * Restore draft from sessionStorage upon page load or tab refresh
 */
function restoreDraftFromSession() {
  try {
    const rawDraft = sessionStorage.getItem(STORAGE_KEYS.DRAFT);
    if (rawDraft) {
      const draft = JSON.parse(rawDraft);
      noteTitleInput.value = draft.title || '';
      noteCategorySelect.value = draft.category || 'General';
      notePrioritySelect.value = draft.priority || 'Medium';
      noteContentInput.value = draft.content || '';
      draftIndicator.classList.add('visible');
      showToast('Restored unsaved draft from sessionStorage', 'info');
    }
  } catch (err) {
    console.error('Error reading draft from sessionStorage:', err);
  }
}

/**
 * Clear the draft from sessionStorage
 */
function clearSessionDraft() {
  sessionStorage.removeItem(STORAGE_KEYS.DRAFT);
  draftIndicator.classList.remove('visible');
  if (!editingNoteId) {
    noteTitleInput.value = '';
    noteContentInput.value = '';
    noteCategorySelect.value = 'General';
    notePrioritySelect.value = 'Medium';
  }
  showToast('Draft cleared from sessionStorage', 'info');
}

/* ==========================================================================
   2. Theme Management (localStorage persistence)
   ========================================================================== */

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.body.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEYS.THEME, next);
  themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
  showToast(`Switched to ${next} mode (saved in localStorage)`, 'info');
}

/* ==========================================================================
   3. Note CRUD Operations
   ========================================================================== */

/**
 * Create a new note or update an existing note
 */
function handleNoteSubmit(e) {
  e.preventDefault();

  const title = noteTitleInput.value.trim();
  const content = noteContentInput.value.trim();
  const category = noteCategorySelect.value;
  const priority = notePrioritySelect.value;

  if (!title || !content) {
    showToast('Both Title and Content are required.', 'warning');
    return;
  }

  const now = new Date().toISOString();

  if (editingNoteId) {
    // UPDATE Operation
    const noteIndex = notes.findIndex(n => n.id === editingNoteId);
    if (noteIndex !== -1) {
      notes[noteIndex] = {
        ...notes[noteIndex],
        title,
        content,
        category,
        priority,
        updatedAt: now
      };
      saveNotesToStorage(notes);
      showToast('Note updated successfully!', 'success');
    }
    cancelEditMode();
  } else {
    // CREATE Operation
    const newNote = {
      id: Date.now(), // Unique ID based on timestamp
      title,
      content,
      category,
      priority,
      completed: false,
      createdAt: now,
      updatedAt: null
    };

    notes.unshift(newNote); // Prepend to beginning
    saveNotesToStorage(notes);
    clearSessionDraft();
    showToast('Note created and saved to localStorage!', 'success');
  }

  renderNotes();
}

/**
 * DELETE a note by ID
 */
function deleteNote(id) {
  const noteToDelete = notes.find(n => n.id === id);
  if (!noteToDelete) return;

  if (confirm(`Are you sure you want to delete note "${noteToDelete.title}"?`)) {
    notes = notes.filter(n => n.id !== id);
    saveNotesToStorage(notes);
    renderNotes();
    showToast('Note deleted from localStorage', 'info');

    // If deleting the note currently in edit mode, reset form
    if (editingNoteId === id) {
      cancelEditMode();
    }
  }
}

/**
 * Enter EDIT mode for a specific note
 */
function editNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  editingNoteId = id;
  editNoteIdInput.value = note.id;
  noteTitleInput.value = note.title;
  noteCategorySelect.value = note.category || 'General';
  notePrioritySelect.value = note.priority || 'Medium';
  noteContentInput.value = note.content;

  formTitle.textContent = '✏️ Edit Note';
  saveNoteBtn.textContent = 'Update Note';
  cancelEditBtn.classList.remove('hidden');

  noteTitleInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Cancel EDIT mode and restore normal create state
 */
function cancelEditMode() {
  editingNoteId = null;
  editNoteIdInput.value = '';
  noteTitleInput.value = '';
  noteContentInput.value = '';
  noteCategorySelect.value = 'General';
  notePrioritySelect.value = 'Medium';

  formTitle.textContent = '✏️ Create New Note';
  saveNoteBtn.textContent = 'Save Note';
  cancelEditBtn.classList.add('hidden');
}

/**
 * Toggle COMPLETED state of a note
 */
function toggleNoteComplete(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  note.completed = !note.completed;
  note.updatedAt = new Date().toISOString();
  saveNotesToStorage(notes);
  renderNotes();
  showToast(note.completed ? 'Marked note as completed' : 'Marked note as active', 'info');
}

/* ==========================================================================
   4. Rendering & DOM Updates
   ========================================================================== */

function renderNotes() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;
  const selectedStatus = statusFilter.value;
  const currentSort = sortBy.value;

  // Filter notes
  let filtered = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(query) ||
                          note.content.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'ALL' || note.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' ||
                          (selectedStatus === 'COMPLETED' && note.completed) ||
                          (selectedStatus === 'ACTIVE' && !note.completed);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort notes
  filtered.sort((a, b) => {
    if (currentSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (currentSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (currentSort === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  // Render HTML
  if (filtered.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-placeholder">
        <span>📭</span>
        <h3>No matching notes found</h3>
        <p>${notes.length === 0 ? 'Create your first note using the form on the left!' : 'Try clearing your search or adjusting filters.'}</p>
      </div>
    `;
  } else {
    notesContainer.innerHTML = filtered.map(note => {
      const createdStr = formatDate(note.createdAt);
      const updatedStr = note.updatedAt ? ` • Edited ${formatDate(note.updatedAt)}` : '';
      const priorityClass = `priority-${note.priority || 'Medium'}`;

      return `
        <div class="note-card ${note.completed ? 'completed' : ''}" data-id="${note.id}">
          <div class="priority-stripe ${priorityClass}"></div>
          
          <div class="note-header">
            <h3 class="note-title">${escapeHtml(note.title)}</h3>
            <span class="tag">${escapeHtml(note.category || 'General')}</span>
          </div>

          <div class="note-body">${escapeHtml(note.content)}</div>

          <div class="note-footer">
            <span class="note-date" title="Created: ${note.createdAt}">${createdStr}${updatedStr}</span>
            <div class="card-actions">
              <button class="action-btn" onclick="toggleNoteComplete(${note.id})" title="${note.completed ? 'Mark Active' : 'Mark Completed'}">
                ${note.completed ? '↩️' : '✅'}
              </button>
              <button class="action-btn" onclick="editNote(${note.id})" title="Edit Note">
                ✏️
              </button>
              <button class="action-btn del-btn" onclick="deleteNote(${note.id})" title="Delete Note">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateStorageStats();
}

/**
 * Format ISO date string into readable text
 */
function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Escape HTML to prevent XSS injection
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Update stats counters and calculate storage size
 */
function updateStorageStats() {
  const total = notes.length;
  const completed = notes.filter(n => n.completed).length;

  totalNotesCount.textContent = total;
  completedNotesCount.textContent = completed;

  // Calculate approximate byte size of localStorage
  let totalBytes = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalBytes += (localStorage[key].length + key.length) * 2; // UTF-16 characters
    }
  }

  if (totalBytes < 1024) {
    storageUsedBytes.textContent = `${totalBytes} B`;
  } else {
    storageUsedBytes.textContent = `${(totalBytes / 1024).toFixed(1)} KB`;
  }
}

/* ==========================================================================
   5. Import / Export / Backup (JSON Serialization)
   ========================================================================== */

function exportNotesAsJson() {
  if (notes.length === 0) {
    showToast('No notes available to export.', 'warning');
    return;
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `smartnotes_backup_${new Date().toISOString().slice(0, 10)}.json`;

  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(`Exported ${notes.length} notes as JSON`, 'success');
}

function handleImportJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const importedData = JSON.parse(event.target.result);
      if (!Array.isArray(importedData)) {
        throw new Error('Imported JSON is not an array of notes');
      }

      // Merge avoiding duplicate IDs
      let addedCount = 0;
      importedData.forEach(item => {
        if (item.id && item.title && !notes.some(n => n.id === item.id)) {
          notes.push(item);
          addedCount++;
        }
      });

      saveNotesToStorage(notes);
      renderNotes();
      showToast(`Successfully imported ${addedCount} notes!`, 'success');
    } catch (err) {
      console.error('Import error:', err);
      showToast('Invalid JSON file format.', 'error');
    }
    e.target.value = ''; // Reset file input
  };
  reader.readAsText(file);
}

function clearAllNotes() {
  if (notes.length === 0) {
    showToast('Notes list is already empty.', 'info');
    return;
  }

  if (confirm('Warning: This will permanently delete ALL notes from localStorage. Proceed?')) {
    notes = [];
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    renderNotes();
    showToast('All notes cleared from localStorage', 'info');
  }
}

/* ==========================================================================
   6. Live Storage Inspector Modal
   ========================================================================== */

function openStorageInspector() {
  updateInspectorViews();
  storageModal.classList.remove('hidden');
}

function closeStorageInspector() {
  storageModal.classList.add('hidden');
}

function updateInspectorViews() {
  // Inspect localStorage
  const lsData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      lsData[key] = JSON.parse(localStorage.getItem(key));
    } catch {
      lsData[key] = localStorage.getItem(key);
    }
  }
  lsContentDisplay.textContent = JSON.stringify(lsData, null, 2);
  lsKeyCount.textContent = `${localStorage.length} keys`;

  // Inspect sessionStorage
  const ssData = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    try {
      ssData[key] = JSON.parse(sessionStorage.getItem(key));
    } catch {
      ssData[key] = sessionStorage.getItem(key);
    }
  }
  ssContentDisplay.textContent = Object.keys(ssData).length ? JSON.stringify(ssData, null, 2) : '// No sessionStorage entries in this tab';
  ssKeyCount.textContent = `${sessionStorage.length} keys`;
}

/* ==========================================================================
   7. Toast Notification Utility
   ========================================================================== */

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌'
  };

  toast.innerHTML = `
    <span style="font-size:1.2rem;">${iconMap[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${type.toUpperCase()}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/* ==========================================================================
   8. Seed Demo Notes (if storage is completely empty)
   ========================================================================== */

function seedDemoNotesIfEmpty() {
  if (notes.length === 0) {
    const sampleNotes = [
      {
        id: Date.now() - 3600000 * 24,
        title: "Welcome to SmartNotes!",
        content: "SmartNotes demonstrates client-side Web Storage with localStorage, sessionStorage, and JSON serialization.\n\nTry editing this note or creating your own on the left!",
        category: "General",
        priority: "Medium",
        completed: false,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: null
      },
      {
        id: Date.now() - 3600000 * 2,
        title: "localStorage vs sessionStorage",
        content: "localStorage persists permanently across all tabs.\n\nsessionStorage auto-saves your unsubmitted note drafts and clears automatically when you close this browser tab.",
        category: "Theory",
        priority: "High",
        completed: true,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: null
      },
      {
        id: Date.now() - 3600000 * 1,
        title: "Backend Expansion Architecture",
        content: "Frontend-only storage is vulnerable to cache clearing. In future lectures, we expand this client to an Express.js & MongoDB backend!",
        category: "Backend",
        priority: "Low",
        completed: false,
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedAt: null
      }
    ];

    notes = sampleNotes;
    saveNotesToStorage(notes);
  }
}

/* ==========================================================================
   9. Event Listeners & Initialization
   ========================================================================== */

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  notes = getNotesFromStorage();
  seedDemoNotesIfEmpty();
  restoreDraftFromSession();
  renderNotes();

  // Form submit
  noteForm.addEventListener('submit', handleNoteSubmit);
  cancelEditBtn.addEventListener('click', cancelEditMode);
  clearDraftBtn.addEventListener('click', clearSessionDraft);

  // Autosave draft to sessionStorage on typing
  noteTitleInput.addEventListener('input', saveDraftToSession);
  noteCategorySelect.addEventListener('change', saveDraftToSession);
  notePrioritySelect.addEventListener('change', saveDraftToSession);
  noteContentInput.addEventListener('input', saveDraftToSession);

  // Search and filter listeners
  searchInput.addEventListener('input', () => {
    clearSearchBtn.classList.toggle('hidden', !searchInput.value);
    renderNotes();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    renderNotes();
  });

  categoryFilter.addEventListener('change', renderNotes);
  statusFilter.addEventListener('change', renderNotes);
  sortBy.addEventListener('change', renderNotes);

  // Theme toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Backup & Import
  exportJsonBtn.addEventListener('click', exportNotesAsJson);
  importJsonInput.addEventListener('change', handleImportJson);
  clearAllBtn.addEventListener('click', clearAllNotes);

  // Storage Inspector Modal
  toggleStorageViewerBtn.addEventListener('click', openStorageInspector);
  closeModalBtn.addEventListener('click', closeStorageInspector);
  storageModal.addEventListener('click', (e) => {
    if (e.target === storageModal) closeStorageInspector();
  });
  refreshLsBtn.addEventListener('click', updateInspectorViews);
  refreshSsBtn.addEventListener('click', updateInspectorViews);

  // Cross-tab Synchronization listener
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.NOTES) {
      notes = getNotesFromStorage();
      renderNotes();
      showToast('Notes synchronized from another tab!', 'info');
    } else if (e.key === STORAGE_KEYS.THEME) {
      initTheme();
    }
  });
});