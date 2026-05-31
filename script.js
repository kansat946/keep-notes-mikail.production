// Main Application Logic

let currentState = 'menu'; // menu, createNew, login
let isAuthenticated = false;
let requiresLayer2 = false;

// ===== UI STATE MANAGEMENT =====

function showLayer(layerId) {
    // Hide all layers
    document.querySelectorAll('.layer').forEach(layer => {
        layer.classList.add('hidden');
    });
    
    // Show target layer
    const targetLayer = document.getElementById(layerId);
    if (targetLayer) {
        targetLayer.classList.remove('hidden');
    }
}

function showMenu() {
    showLayer('mainMenu');
    currentState = 'menu';
}

function showCreateNew() {
    showLayer('layer1');
    currentState = 'createNew';
}

function showLogin() {
    showLayer('loginLayer1');
    currentState = 'login';
}

function showExport() {
    showLayer('exportSection');
}

function backToMenu() {
    showMenu();
    resetForm();
}

function resetForm() {
    document.getElementById('password1').value = '';
    document.getElementById('password2').value = '';
    document.getElementById('loginPassword1').value = '';
    document.getElementById('loginPassword2').value = '';
    document.getElementById('noteInput').value = '';
}

// ===== LAYER 1: PASSWORD SETUP =====

async function setupLayer1() {
    const password = document.getElementById('password1').value;
    const statusEl = document.getElementById('layer1Status');

    if (!password) {
        statusEl.textContent = '❌ Masukkan password!';
        statusEl.className = 'status error';
        return;
    }

    const result = await encryptionManager.setLayer1Password(password);
    
    if (result.success) {
        statusEl.textContent = result.message;
        statusEl.className = 'status success';
        
        // Show notes section after 1 second
        setTimeout(() => {
            document.getElementById('layer1').classList.add('hidden');
            document.getElementById('notesSection').classList.remove('hidden');
            document.getElementById('password1').value = '';
            renderNotesList();
        }, 1000);
    } else {
        statusEl.textContent = result.message;
        statusEl.className = 'status error';
    }
}

// ===== NOTES MANAGEMENT =====

function addNote() {
    const noteInput = document.getElementById('noteInput');
    const content = noteInput.value;
    const detectionAlert = document.getElementById('detectionAlert');
    const layer2Setup = document.getElementById('layer2Setup');

    if (!content.trim()) {
        alert('Tulis catatan terlebih dahulu!');
        return;
    }

    // Detect languages
    const detection = detectionManager.getSummary(content);
    
    if (detection.multipleLanguages) {
        // Show detection alert
        detectionAlert.classList.remove('hidden');
        
        // Show layer 2 setup
        layer2Setup.classList.remove('hidden');
        requiresLayer2 = true;
        
        // Log detection info
        console.log('Deteksi:', detection);
    } else {
        // Save note directly if no Layer 2 needed
        saveNoteToStorage(content, detection);
    }
}

function saveNoteToStorage(content, detection) {
    const noteObj = {
        title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        content: content,
        hasLayer2: requiresLayer2,
        languagesDetected: detection.languages
    };

    storageManager.addNote(noteObj);
    
    // Reset form
    document.getElementById('noteInput').value = '';
    document.getElementById('detectionAlert').classList.add('hidden');
    document.getElementById('layer2Setup').classList.add('hidden');
    requiresLayer2 = false;
    
    // Show success message
    alert('✅ Catatan berhasil disimpan!');
    
    // Refresh list
    renderNotesList();
}

async function setupLayer2() {
    const password = document.getElementById('password2').value;
    
    if (!password) {
        alert('Masukkan password Layer 2!');
        return;
    }

    const result = await encryptionManager.setLayer2Password(password);
    
    if (result.success) {
        const content = document.getElementById('noteInput').value;
        const detection = detectionManager.getSummary(content);
        
        saveNoteToStorage(content, detection);
        
        document.getElementById('password2').value = '';
    } else {
        alert(result.message);
    }
}

function renderNotesList() {
    const notesList = document.getElementById('notesList');
    const notes = storageManager.getNotes();

    if (notes.length === 0) {
        notesList.innerHTML = '<p style="text-align: center; color: #999;">Belum ada catatan. Buat yang baru! 📝</p>';
        return;
    }

    notesList.innerHTML = notes.map(note => `
        <div class="note-item">
            <h4>${escapeHtml(note.title)}</h4>
            <p>${escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
            <small>📅 ${note.createdAt}</small>
            ${note.hasLayer2 ? '<small style="color: #f56565;"> 🔐 Layer 2</small>' : ''}
            <div class="note-actions">
                <button class="btn btn-info" onclick="editNote(${note.id})">✏️ Edit</button>
                <button class="btn btn-danger" onclick="deleteNote(${note.id})">🗑️ Hapus</button>
            </div>
        </div>
    `).join('');
}

function editNote(id) {
    const note = storageManager.getNoteById(id);
    if (note) {
        document.getElementById('noteInput').value = note.content;
        document.getElementById('noteInput').focus();
        // Optional: Could implement inline editing
    }
}

function deleteNote(id) {
    if (confirm('Hapus catatan ini?')) {
        storageManager.deleteNote(id);
        renderNotesList();
    }
}

// ===== LAYER 1: LOGIN =====

async function verifyLayer1() {
    const password = document.getElementById('loginPassword1').value;
    const statusEl = document.getElementById('loginStatus1');

    if (!password) {
        statusEl.textContent = '❌ Masukkan password!';
        statusEl.className = 'status error';
        return;
    }

    const isValid = await encryptionManager.verifyLayer1Password(password);

    if (isValid) {
        statusEl.textContent = '✅ Password benar!';
        statusEl.className = 'status success';

        // Check if Layer 2 exists
        if (encryptionManager.hasLayer2()) {
            setTimeout(() => {
                document.getElementById('loginLayer1').classList.add('hidden');
                document.getElementById('loginLayer2').classList.remove('hidden');
                document.getElementById('loginPassword1').value = '';
            }, 1000);
        } else {
            // Skip to notes section
            setTimeout(() => {
                isAuthenticated = true;
                document.getElementById('loginLayer1').classList.add('hidden');
                document.getElementById('notesSection').classList.remove('hidden');
                document.getElementById('loginPassword1').value = '';
                renderNotesList();
            }, 1000);
        }
    } else {
        statusEl.textContent = '❌ Password salah!';
        statusEl.className = 'status error';
    }
}

// ===== LAYER 2: LOGIN =====

async function verifyLayer2() {
    const password = document.getElementById('loginPassword2').value;
    const statusEl = document.getElementById('loginStatus2');

    if (!password) {
        statusEl.textContent = '❌ Masukkan password!';
        statusEl.className = 'status error';
        return;
    }

    const isValid = await encryptionManager.verifyLayer2Password(password);

    if (isValid) {
        statusEl.textContent = '✅ Password benar!';
        statusEl.className = 'status success';

        setTimeout(() => {
            isAuthenticated = true;
            document.getElementById('loginLayer2').classList.add('hidden');
            document.getElementById('notesSection').classList.remove('hidden');
            document.getElementById('loginPassword2').value = '';
            renderNotesList();
        }, 1000);
    } else {
        statusEl.textContent = '❌ Password salah!';
        statusEl.className = 'status error';
    }
}

// ===== LOGOUT =====

function logout() {
    if (confirm('Yakin ingin logout?')) {
        isAuthenticated = false;
        document.getElementById('notesSection').classList.add('hidden');
        document.getElementById('layer2Setup').classList.add('hidden');
        document.getElementById('detectionAlert').classList.add('hidden');
        resetForm();
        showMenu();
    }
}

// ===== EXPORT & IMPORT =====

function exportToFile() {
    const notes = storageManager.getNotes();
    if (notes.length === 0) {
        alert('Tidak ada catatan untuk diekspor!');
        return;
    }
    storageManager.exportAsJSON();
    alert('✅ File berhasil diunduh!');
}

function importFromFile() {
    document.getElementById('importFile').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const result = storageManager.importFromJSON(e.target.result);
        alert(result.success ? '✅ ' + result.message : '❌ ' + result.message);
        
        if (result.success) {
            renderNotesList();
        }
    };
    reader.readAsText(file);
}

// ===== UTILITY FUNCTIONS =====

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    showMenu();
    console.log('🎯 Encrypted Notes App siap digunakan!');
});