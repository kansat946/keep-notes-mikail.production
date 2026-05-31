// Storage Module - Data Persistence & Export/Import
class StorageManager {
    constructor() {
        this.storageKey = 'encryptedNotes';
        this.notes = this.loadNotes();
    }

    // Load notes from localStorage
    loadNotes() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    // Save notes to localStorage
    saveNotes() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
    }

    // Add a new note
    addNote(note) {
        const newNote = {
            id: Date.now(),
            title: note.title || 'Untitled Note',
            content: note.content,
            encryptedContent: encryptionManager.encryptNoteContent(note.content),
            createdAt: new Date().toLocaleString('id-ID'),
            updatedAt: new Date().toLocaleString('id-ID'),
            hasLayer2: note.hasLayer2 || false,
            languagesDetected: note.languagesDetected || []
        };

        this.notes.push(newNote);
        this.saveNotes();
        return newNote;
    }

    // Get all notes
    getNotes() {
        return this.notes;
    }

    // Get note by ID
    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    // Update note
    updateNote(id, updatedData) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes[noteIndex] = {
                ...this.notes[noteIndex],
                ...updatedData,
                updatedAt: new Date().toLocaleString('id-ID')
            };
            this.saveNotes();
            return this.notes[noteIndex];
        }
        return null;
    }

    // Delete note
    deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
        return true;
    }

    // Export all notes as JSON
    exportAsJSON() {
        const dataStr = JSON.stringify(this.notes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `encrypted-notes-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    }

    // Import notes from JSON
    importFromJSON(jsonData) {
        try {
            const importedNotes = JSON.parse(jsonData);
            if (Array.isArray(importedNotes)) {
                this.notes = importedNotes;
                this.saveNotes();
                return { success: true, message: `${importedNotes.length} catatan berhasil diimport!` };
            } else {
                return { success: false, message: 'Format JSON tidak valid!' };
            }
        } catch (error) {
            return { success: false, message: 'Gagal membaca file JSON!' };
        }
    }

    // Clear all notes (with confirmation)
    clearAllNotes() {
        this.notes = [];
        this.saveNotes();
        return true;
    }

    // Get statistics
    getStatistics() {
        return {
            totalNotes: this.notes.length,
            layer2Notes: this.notes.filter(n => n.hasLayer2).length,
            totalCharacters: this.notes.reduce((sum, n) => sum + n.content.length, 0),
            createdDates: this.notes.map(n => n.createdAt)
        };
    }
}

// Global storage manager
const storageManager = new StorageManager();