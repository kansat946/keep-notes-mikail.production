// Main Application Logic - Improved dengan accessibility & dark mode

let currentState = 'menu';
let isAuthenticated = false;
let requiresLayer2 = false;
let editingNoteId = null;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// ===== DARK MODE SUPPORT =====

function initDarkMode() {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode = localStorage.getItem('darkMode') === null ? prefersDark : localStorage.getItem('darkMode') === 'true';
    applyDarkMode();
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    applyDarkMode();
}

function applyDarkMode() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// ===== UI STATE MANAGEMENT =====

function showLayer(layerId) {
    try {
        document.querySelectorAll('.layer').forEach(layer => {
            layer.classList.add('hidden');
            layer.setAttribute('aria-hidden', 'true');
        });
        
        const targetLayer = document.getElementById(layerId);
        if (targetLayer) {
            targetLayer.classList.remove('hidden');
            targetLayer.setAttribute('aria-hidden', 'false');
            
            // Focus first input untuk accessibility
            const firstInput = targetLayer.querySelector('input, textarea, button');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    } catch (e) {
        console.error('Error showing layer:', e);
    }
}

function showMenu() {
    showLayer('mainMenu');
    currentState = 'menu';
}

function showCreateNew() {
    editingNoteId = null;
    document.getElementById('submitNoteBtn').textContent = 'Simpan Catatan';
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
    editingNoteId = null;
    showMenu();
    resetForm();
}

function resetForm() {
    try {
        document.getElementById('password1').value = '';
        document.getElementById('password2').value = '';
        document.getElementById('loginPassword1').value = '';
        document.getElementById('loginPassword2').value = '';
        document.getElementById('noteInput').value = '';
        document.getElementById('detectionAlert').classList.add('hidden');
        document.getElementById('layer2Setup').classList.add('hidden');
        document.getElementById('detectionInfo').innerHTML = '';
    } catch (e) {
        console.error('Error resetting form:', e);
    }
}

// ===== LAYER 1: PASSWORD SETUP =====

async function setupLayer1() {
    try {
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
    } catch (e) {
        console.error('Error in setupLayer1:', e);
        alert('❌ Terjadi kesalahan: ' + e.message);
    }
}

// ===== NOTES MANAGEMENT =====

function addNote() {
    try {
        const noteInput = document.getElementById('noteInput');
        const content = noteInput.value;
        const detectionAlert = document.getElementById('detectionAlert');
        const layer2Setup = document.getElementById('layer2Setup');
        const detectionInfo = document.getElementById('detectionInfo');

        if (!content.trim()) {
            alert('📝 Tulis catatan terlebih dahulu!');
            return;
        }

        // Detect languages dengan detail
        const detection = detectionManager.getSummary(content);
        
        // Show detection info
        if (detection.detectionMessage) {
            let detailHTML = `<strong>${detection.detectionMessage}</strong><br>`;
            detailHTML += `<small>Total token: ${detection.tokenCount} | Confidence: ${detection.confidence}%</small><br>`;
            
            if (Object.keys(detection.confidenceScores).length > 0) {
                detailHTML += '<small>Breakdown: ';
                for (let [lang, score] of Object.entries(detection.confidenceScores)) {
                    detailHTML += `${lang} (${score}%), `;
                }
                detailHTML = detailHTML.slice(0, -2) + '</small><br>';
            }

            if (detection.pronouns.length > 0) {
                detailHTML += '<small>Pronoun: ' + detection.pronouns.map(p => p.word + '(' + p.count + 'x)').join(', ') + '</small><br>';
            }

            if (detection.tone && detection.tone.tone !== 'unknown') {
                detailHTML += `<small>Tone: ${detection.tone.tone.toUpperCase()}</small>`;
            }

            detectionInfo.innerHTML = detailHTML;
        }
        
        if (detection.multipleLanguages) {
            detectionAlert.classList.remove('hidden');
            layer2Setup.classList.remove('hidden');
            requiresLayer2 = true;
        } else {
            saveNoteToStorage(content, detection);
        }
    } catch (e) {
        console.error('Error in addNote:', e);
        alert('❌ Terjadi kesalahan: ' + e.message);
    }
}

function saveNoteToStorage(content, detection) {
    try {
        const noteObj = {
            title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
            content: content,
            hasLayer2: requiresLayer2,
            languagesDetected: detection.languages,
            detectionInfo: detection.confidenceScores,
            tone: detection.tone ? detection.tone.tone : 'neutral'
        };

        let result;
        if (editingNoteId) {
            result = storageManager.updateNote(editingNoteId, noteObj);
            editingNoteId = null;
        } else {
            result = storageManager.addNote(noteObj);
        }

        if (result.success) {
            document.getElementById('noteInput').value = '';
            document.getElementById('detectionAlert').classList.add('hidden');
            document.getElementById('layer2Setup').classList.add('hidden');
            document.getElementById('detectionInfo').innerHTML = '';
            requiresLayer2 = false;
            
            alert('✅ ' + result.message);
            renderNotesList();
        } else {
            alert('❌ ' + result.message);
        }
    } catch (e) {
        console.error('Error saving note:', e);
        alert('❌ Gagal menyimpan: ' + e.message);
    }
}

async function setupLayer2() {
    try {
        const password = document.getElementById('password2').value;
        
        if (!password) {
            alert('🔐 Masukkan password Layer 2!');
            return;
        }

        const result = await encryptionManager.setLayer2Password(password);
        
        if (result.success) {
            const content = document.getElementById('noteInput').value;
            const detection = detectionManager.getSummary(content);
            
            saveNoteToStorage(content, detection);
            document.getElementById('password2').value = '';
        } else {
            alert('❌ ' + result.message);
        }
    } catch (e) {
        console.error('Error in setupLayer2:', e);
        alert('❌ Terjadi kesalahan: ' + e.message);
    }
}

function renderNotesList() {
    try {
        const notesList = document.getElementById('notesList');
        const notes = storageManager.getNotes();

        if (notes.length === 0) {
            notesList.innerHTML = '<p style="text-align: center; color: #999;">Belum ada catatan. Buat yang baru! 📝</p>';
            return;
        }

        notesList.innerHTML = notes.map(note => `
            <div class="note-item" role="article" aria-label="Note: ${escapeHtml(note.title)}">
                <div class="note-header">
                    <h4>${escapeHtml(note.title)}</h4>
                    ${note.hasLayer2 ? '<span class="badge badge-layer2" title="Catatan ini memiliki 2 layer password">🔐 Layer 2</span>' : ''}
                    ${note.tone && note.tone !== 'neutral' ? `<span class="badge badge-tone" title="Tone: ${note.tone}">${note.tone.toUpperCase()}</span>` : ''}
                </div>
                <p>${escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
                <small>📅 ${note.createdAt}</small>
                ${note.languagesDetected.length > 0 ? `<small style="display: block; color: #667eea;"> 🌐 ${note.languagesDetected.join(', ')}</small>` : ''}
                <div class="note-actions">
                    <button class="btn btn-info" onclick="editNote(${note.id})" aria-label="Edit note">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="deleteNote(${note.id})" aria-label="Delete note">🗑️ Hapus</button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error rendering notes:', e);
    }
}

function editNote(id) {
    try {
        const note = storageManager.getNoteById(id);
        if (note) {
            editingNoteId = id;
            document.getElementById('noteInput').value = note.content;
            document.getElementById('submitNoteBtn').textContent = 'Update Catatan';
            
            // Scroll to input
            document.getElementById('noteInput').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('noteInput').focus();
        }
    } catch (e) {
        console.error('Error editing note:', e);
        alert('❌ Gagal membuka catatan untuk edit');
    }
}

function deleteNote(id) {
    try {
        if (confirm('🗑️ Yakin ingin menghapus catatan ini? Tindakan ini tidak bisa dibatalkan.')) {
            const result = storageManager.deleteNote(id);
            if (result.success) {
                alert('✅ ' + result.message);
                renderNotesList();
            } else {
                alert('❌ ' + result.message);
            }
        }
    } catch (e) {
        console.error('Error deleting note:', e);
        alert('❌ Gagal menghapus catatan');
    }
}

// ===== LAYER 1: LOGIN =====

async function verifyLayer1() {
    try {
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

            if (encryptionManager.hasLayer2()) {
                setTimeout(() => {
                    document.getElementById('loginLayer1').classList.add('hidden');
                    document.getElementById('loginLayer2').classList.remove('hidden');
                    document.getElementById('loginPassword1').value = '';
                }, 1000);
            } else {
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
    } catch (e) {
        console.error('Error in verifyLayer1:', e);
        alert('❌ Terjadi kesalahan: ' + e.message);
    }
}

// ===== LAYER 2: LOGIN =====

async function verifyLayer2() {
    try {
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
    } catch (e) {
        console.error('Error in verifyLayer2:', e);
        alert('❌ Terjadi kesalahan: ' + e.message);
    }
}

// ===== LOGOUT =====

function logout() {
    try {
        if (confirm('👋 Yakin ingin logout?')) {
            isAuthenticated = false;
            document.getElementById('notesSection').classList.add('hidden');
            document.getElementById('layer2Setup').classList.add('hidden');
            document.getElementById('detectionAlert').classList.add('hidden');
            resetForm();
            showMenu();
        }
    } catch (e) {
        console.error('Error in logout:', e);
    }
}

// ===== EXPORT & IMPORT =====

function exportToFile() {
    try {
        const notes = storageManager.getNotes();
        if (notes.length === 0) {
            alert('⚠️ Tidak ada catatan untuk diekspor!');
            return;
        }
        const result = storageManager.exportAsJSON();
        alert('✅ ' + result.message + ' File sudah diunduh!');
    } catch (e) {
        console.error('Error exporting:', e);
        alert('❌ Gagal mengexport catatan');
    }
}

function importFromFile() {
    document.getElementById('importFile').click();
}

function handleFileImport(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const isMerge = confirm('Merge dengan catatan lama? (Cancel = Replace semua)');
                const result = storageManager.importFromJSON(e.target.result, isMerge);
                alert(result.success ? '✅ ' + result.message : '❌ ' + result.message);
                
                if (result.success) {
                    renderNotesList();
                }
            } catch (error) {
                alert('❌ Gagal memproses file!');
            }
        };
        reader.readAsText(file);
        
        // Reset input
        event.target.value = '';
    } catch (e) {
        console.error('Error importing:', e);
        alert('❌ Terjadi kesalahan saat import');
    }
}

// ===== SEARCH & FILTER =====

function searchNotes(query) {
    try {
        if (!query.trim()) {
            renderNotesList();
            return;
        }

        const results = storageManager.searchNotes(query);
        const notesList = document.getElementById('notesList');

        if (results.length === 0) {
            notesList.innerHTML = '<p style="text-align: center; color: #999;">❌ Catatan tidak ditemukan</p>';
            return;
        }

        notesList.innerHTML = results.map(note => `
            <div class="note-item">
                <h4>${escapeHtml(note.title)}</h4>
                <p>${escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</p>
                <small>📅 ${note.createdAt}</small>
                <div class="note-actions">
                    <button class="btn btn-info" onclick="editNote(${note.id})">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="deleteNote(${note.id})">🗑️ Hapus</button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Search error:', e);
    }
}

// ===== KEYBOARD NAVIGATION =====

document.addEventListener('keydown', (e) => {
    try {
        // Escape key untuk close
        if (e.key === 'Escape' && currentState !== 'menu') {
            backToMenu();
        }
        
        // Enter key di form untuk submit (jika di input terakhir)
        if (e.key === 'Enter' && e.ctrlKey) {
            const activeElement = document.activeElement;
            if (activeElement.id === 'password1') {
                setupLayer1();
            } else if (activeElement.id === 'password2') {
                setupLayer2();
            } else if (activeElement.id === 'noteInput') {
                addNote();
            }
        }
    } catch (e) {
        console.error('Keyboard event error:', e);
    }
});

// ===== UTILITY FUNCTIONS =====

function escapeHtml(text) {
    try {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    } catch (e) {
        return text;
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    try {
        initDarkMode();
        
        // Check jika sudah ada password
        if (encryptionManager.hasLayer1()) {
            // User sudah pernah setup
        }
        
        showMenu();
        console.log('🎯 Encrypted Notes App v2.0 - Siap digunakan!');
    } catch (e) {
        console.error('Initialization error:', e);
    }
});