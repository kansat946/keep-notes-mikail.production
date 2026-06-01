// Storage Module - Data Persistence & Export/Import dengan Update functionality
class StorageManager {
    constructor() {
        this.storageKey = 'encryptedNotes';
        this.notes = this.loadNotes();
    }

    // Load notes from localStorage
    loadNotes() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading notes:', e);
            return [];
        }
    }

    // Save notes to localStorage
    saveNotes() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
        } catch (e) {
            console.error('Error saving notes:', e);
            if (e.name === 'QuotaExceededError') {
                alert('⚠️ Storage penuh! Hapus beberapa catatan lama.');
            }
        }
    }

    // Add a new note
    addNote(note) {
        try {
            const newNote = {
                id: Date.now(),
                title: note.title || 'Catatan Tanpa Judul',
                content: note.content,
                encryptedContent: encryptionManager.encryptNoteContent(note.content),
                createdAt: new Date().toLocaleString('id-ID'),
                updatedAt: new Date().toLocaleString('id-ID'),
                hasLayer2: note.hasLayer2 || false,
                languagesDetected: note.languagesDetected || [],
                detectionInfo: note.detectionInfo || {},
                tone: note.tone || 'neutral'
            };

            this.notes.push(newNote);
            this.saveNotes();
            return { success: true, note: newNote, message: 'Catatan berhasil ditambahkan!' };
        } catch (e) {
            console.error('Error adding note:', e);
            return { success: false, message: 'Gagal menambahkan catatan!' };
        }
    }

    // Get all notes
    getNotes() {
        return this.notes;
    }

    // Get note by ID
    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    // Update note (FIX untuk edit functionality)
    updateNote(id, updatedData) {
        try {
            const noteIndex = this.notes.findIndex(note => note.id === id);
            if (noteIndex !== -1) {
                const oldNote = this.notes[noteIndex];
                
                // Update content jika ada
                if (updatedData.content !== undefined) {
                    updatedData.encryptedContent = encryptionManager.encryptNoteContent(updatedData.content);
                    updatedData.title = updatedData.title || updatedData.content.substring(0, 50) + (updatedData.content.length > 50 ? '...' : '');
                }

                this.notes[noteIndex] = {
                    ...oldNote,
                    ...updatedData,
                    updatedAt: new Date().toLocaleString('id-ID')
                };
                
                this.saveNotes();
                return { success: true, note: this.notes[noteIndex], message: 'Catatan berhasil diupdate!' };
            }
            return { success: false, message: 'Catatan tidak ditemukan!' };
        } catch (e) {
            console.error('Error updating note:', e);
            return { success: false, message: 'Gagal mengupdate catatan!' };
        }
    }

    // Delete note
    deleteNote(id) {
        try {
            const initialLength = this.notes.length;
            this.notes = this.notes.filter(note => note.id !== id);
            
            if (this.notes.length < initialLength) {
                this.saveNotes();
                return { success: true, message: 'Catatan berhasil dihapus!' };
            }
            return { success: false, message: 'Catatan tidak ditemukan!' };
        } catch (e) {
            console.error('Error deleting note:', e);
            return { success: false, message: 'Gagal menghapus catatan!' };
        }
    }

    // Export all notes as JSON
    exportAsJSON() {
        try {
            const dataStr = JSON.stringify(this.notes, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `encrypted-notes-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return { success: true, message: `${this.notes.length} catatan berhasil diexport!` };
        } catch (e) {
            console.error('Error exporting:', e);
            return { success: false, message: 'Gagal mengexport catatan!' };
        }
    }

    // Import notes from JSON (dengan konfirmasi)
    importFromJSON(jsonData, merge = false) {
        try {
            const importedNotes = JSON.parse(jsonData);
            if (!Array.isArray(importedNotes)) {
                return { success: false, message: 'Format JSON tidak valid!' };
            }

            if (merge) {
                // Merge dengan data lama (avoid duplicate)
                const existingIds = new Set(this.notes.map(n => n.id));
                const newNotes = importedNotes.filter(n => !existingIds.has(n.id));
                this.notes = [...this.notes, ...newNotes];
                return { 
                    success: true, 
                    message: `${newNotes.length} catatan baru berhasil diimport! ${importedNotes.length - newNotes.length} duplikat diabaikan.` 
                };
            } else {
                // Replace semua data
                this.notes = importedNotes;
                return { success: true, message: `${importedNotes.length} catatan berhasil diimport!` };
            }
            
            this.saveNotes();
        } catch (error) {
            console.error('Import error:', error);
            return { success: false, message: 'Format file tidak valid atau rusak!' };
        }
    }

    // Search notes
    searchNotes(query) {
        try {
            const lowerQuery = query.toLowerCase();
            return this.notes.filter(note => 
                note.title.toLowerCase().includes(lowerQuery) ||
                note.content.toLowerCase().includes(lowerQuery)
            );
        } catch (e) {
            console.error('Search error:', e);
            return [];
        }
    }

    // Filter notes by language
    filterByLanguage(language) {
        try {
            return this.notes.filter(note => 
                note.languagesDetected.includes(language)
            );
        } catch (e) {
            console.error('Filter error:', e);
            return [];
        }
    }

    // Clear all notes (dengan konfirmasi)
    clearAllNotes() {
        try {
            this.notes = [];
            this.saveNotes();
            return { success: true, message: 'Semua catatan telah dihapus!' };
        } catch (e) {
            console.error('Error clearing notes:', e);
            return { success: false, message: 'Gagal menghapus catatan!' };
        }
    }

    // Get statistics
    getStatistics() {
        try {
            const stats = {
                totalNotes: this.notes.length,
                layer2Notes: this.notes.filter(n => n.hasLayer2).length,
                totalCharacters: this.notes.reduce((sum, n) => sum + n.content.length, 0),
                averageLength: this.notes.length > 0 ? Math.round(this.notes.reduce((sum, n) => sum + n.content.length, 0) / this.notes.length) : 0,
                longestNote: this.notes.length > 0 ? Math.max(...this.notes.map(n => n.content.length)) : 0,
                shortestNote: this.notes.length > 0 ? Math.min(...this.notes.map(n => n.content.length)) : 0,
                createdDates: this.notes.map(n => n.createdAt),
                languageBreakdown: this.getLanguageBreakdown(),
                toneBreakdown: this.getToneBreakdown()
            };
            return stats;
        } catch (e) {
            console.error('Statistics error:', e);
            return {
                totalNotes: 0,
                layer2Notes: 0,
                totalCharacters: 0,
                averageLength: 0,
                longestNote: 0,
                shortestNote: 0,
                createdDates: [],
                languageBreakdown: {},
                toneBreakdown: {}
            };
        }
    }

    // Get language breakdown
    getLanguageBreakdown() {
        try {
            const breakdown = {};
            this.notes.forEach(note => {
                note.languagesDetected.forEach(lang => {
                    breakdown[lang] = (breakdown[lang] || 0) + 1;
                });
            });
            return breakdown;
        } catch (e) {
            return {};
        }
    }

    // Get tone breakdown
    getToneBreakdown() {
        try {
            const breakdown = {};
            this.notes.forEach(note => {
                const tone = note.tone || 'unknown';
                breakdown[tone] = (breakdown[tone] || 0) + 1;
            });
            return breakdown;
        } catch (e) {
            return {};
        }
    }
}

// Global storage manager
const storageManager = new StorageManager();