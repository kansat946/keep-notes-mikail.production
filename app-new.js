// Main App Logic - Cloud Edition
let currentEditingNoteId = null;

// Initialize App
async function initApp() {
  console.log('🚀 Keep Notes Cloud Starting...');
  
  // Check if user already logged in
  const hasSession = await AuthManager.checkSession();
  
  if (hasSession) {
    const user = await AuthManager.getCurrentUser();
    showNotesScreen();
    updateUserInfo(user);
    await loadNotes();
    await SyncManager.init();
  } else {
    showLoginScreen();
  }
}

// UI Helpers
function switchAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('active', tab === 'login');
  document.getElementById('registerForm').classList.toggle('active', tab === 'register');
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('registerTab').classList.toggle('active', tab === 'register');
}

function showLoginScreen() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('notesScreen').classList.add('hidden');
}

function showNotesScreen() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('notesScreen').classList.remove('hidden');
}

function updateUserInfo(user) {
  const userInfoEl = document.getElementById('userInfo');
  if (userInfoEl) {
    userInfoEl.textContent = `👤 ${user.email}`;
  }
}

// Auth Handlers
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const statusEl = document.getElementById('loginStatus');
  
  if (!email || !password) {
    statusEl.textContent = '❌ Email dan password harus diisi';
    statusEl.className = 'status error';
    return;
  }
  
  statusEl.textContent = '🔄 Logging in...';
  statusEl.className = 'status info';
  
  const result = await AuthManager.login(email, password);
  
  if (result.success) {
    statusEl.textContent = result.message;
    statusEl.className = 'status success';
    
    setTimeout(() => {
      showNotesScreen();
      updateUserInfo(result.user);
      loadNotes();
      SyncManager.init();
    }, 1000);
  } else {
    statusEl.textContent = result.message;
    statusEl.className = 'status error';
  }
}

async function handleRegister() {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const password2 = document.getElementById('registerPassword2').value;
  const statusEl = document.getElementById('registerStatus');
  
  if (!email || !password || !password2) {
    statusEl.textContent = '❌ Semua field harus diisi';
    statusEl.className = 'status error';
    return;
  }
  
  if (password !== password2) {
    statusEl.textContent = '❌ Password tidak sama';
    statusEl.className = 'status error';
    return;
  }
  
  if (password.length < 8) {
    statusEl.textContent = '❌ Password minimal 8 karakter';
    statusEl.className = 'status error';
    return;
  }
  
  statusEl.textContent = '🔄 Registering...';
  statusEl.className = 'status info';
  
  const result = await AuthManager.register(email, password);
  
  if (result.success) {
    statusEl.textContent = result.message;
    statusEl.className = 'status success';
    
    setTimeout(() => {
      showNotesScreen();
      updateUserInfo(result.user);
      loadNotes();
      SyncManager.init();
    }, 1000);
  } else {
    statusEl.textContent = result.message;
    statusEl.className = 'status error';
  }
}

async function handleLogout() {
  if (!confirm('Yakin ingin logout? Catatan akan tetap tersimpan di cloud.')) return;
  
  const result = await AuthManager.logout();
  if (result.success) {
    showLoginScreen();
    handleClearForm();
  }
}

// Notes Handlers
async function handleSaveNote() {
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  
  if (!content) {
    alert('📝 Tulis catatan terlebih dahulu!');
    return;
  }
  
  // Encrypt content client-side
  const password = AuthManager.currentUser.email; // Use email as encryption key
  let encryptedContent = content;
  
  try {
    const encrypted = await encryptText(content, password);
    encryptedContent = JSON.stringify(encrypted);
  } catch (err) {
    console.error('Encryption error:', err);
  }
  
  if (currentEditingNoteId) {
    // Update
    const result = await DatabaseManager.updateNote(
      currentEditingNoteId,
      title || content.substring(0, 50),
      encryptedContent
    );
    
    if (result.success) {
      alert(result.message);
      currentEditingNoteId = null;
      handleClearForm();
      await loadNotes();
    } else {
      alert(result.message);
    }
  } else {
    // Create
    const result = await DatabaseManager.createNote(
      title || content.substring(0, 50),
      encryptedContent
    );
    
    if (result.success) {
      alert(result.message);
      handleClearForm();
      await loadNotes();
    } else {
      alert(result.message);
    }
  }
}

async function loadNotes() {
  SyncManager.updateSyncStatus('syncing');
  
  const result = await DatabaseManager.getNotes();
  const listEl = document.getElementById('notesList');
  
  if (!result.success || !result.notes || result.notes.length === 0) {
    listEl.innerHTML = '<p class="empty-state">Belum ada catatan. Buat yang baru!</p>';
    SyncManager.updateSyncStatus('synced');
    return;
  }
  
  listEl.innerHTML = '';
  
  for (const note of result.notes) {
    const noteEl = document.createElement('div');
    noteEl.className = 'note-item';
    
    // Try to decrypt content
    let displayContent = note.content;
    try {
      const encrypted = JSON.parse(note.content);
      const password = AuthManager.currentUser.email;
      displayContent = await decryptObject(encrypted, password);
    } catch (err) {
      displayContent = note.content.substring(0, 100);
    }
    
    const date = new Date(note.$createdAt).toLocaleDateString('id-ID');
    
    noteEl.innerHTML = `
      <div class="note-header">
        <h3>${note.title || 'Catatan'}</h3>
        <span class="note-date">${date}</span>
      </div>
      <p class="note-preview">${displayContent.substring(0, 150)}${displayContent.length > 150 ? '...' : ''}</p>
      <div class="note-actions">
        <button class="btn btn-small" onclick="editNote('${note.$id}')">✏️ Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteNote('${note.$id}')">🗑️ Hapus</button>
      </div>
    `;
    
    listEl.appendChild(noteEl);
  }
  
  SyncManager.updateSyncStatus('synced');
}

async function editNote(noteId) {
  const result = await DatabaseManager.getNote(noteId);
  
  if (!result.success) {
    alert(result.message);
    return;
  }
  
  const note = result.note;
  currentEditingNoteId = noteId;
  
  // Decrypt content
  try {
    const encrypted = JSON.parse(note.content);
    const password = AuthManager.currentUser.email;
    const decrypted = await decryptObject(encrypted, password);
    
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    document.getElementById('noteContent').value = note.content;
  }
  
  // Scroll to top
  document.querySelector('.create-section').scrollIntoView({ behavior: 'smooth' });
}

async function deleteNote(noteId) {
  if (!confirm('Yakin ingin menghapus catatan ini?')) return;
  
  const result = await DatabaseManager.deleteNote(noteId);
  
  if (result.success) {
    alert(result.message);
    await loadNotes();
  } else {
    alert(result.message);
  }
}

function handleClearForm() {
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteContent').value = '';
  currentEditingNoteId = null;
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
