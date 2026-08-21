// Database Module - Notes CRUD
const DatabaseManager = {
  // Create note
  async createNote(title, content) {
    try {
      if (!AuthManager.currentUser) {
        return { success: false, message: '❌ Login diperlukan' };
      }

      const noteData = {
        userId: AuthManager.currentUser.$id,
        title: title || 'Catatan Tanpa Judul',
        content: content, // sudah terenkripsi dari client
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await AppwriteDatabases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collectionId,
        'unique()',
        noteData
      );

      return { success: true, note: response, message: '✅ Catatan tersimpan!' };
    } catch (err) {
      console.error('Create note error:', err);
      return { success: false, message: `❌ Gagal menyimpan: ${err.message}` };
    }
  },

  // Get all notes for current user
  async getNotes() {
    try {
      if (!AuthManager.currentUser) {
        return { success: false, notes: [], message: '❌ Login diperlukan' };
      }

      const response = await AppwriteDatabases.listDocuments(
        AppwriteConfig.databaseId,
        AppwriteConfig.collectionId,
        [
          Appwrite.Query.equal('userId', AuthManager.currentUser.$id),
          Appwrite.Query.limit(100),
          Appwrite.Query.orderDesc('$createdAt')
        ]
      );

      return { success: true, notes: response.documents, message: `✅ ${response.documents.length} catatan ditemukan` };
    } catch (err) {
      console.error('Get notes error:', err);
      return { success: false, notes: [], message: `❌ Gagal memuat catatan` };
    }
  },

  // Get single note
  async getNote(noteId) {
    try {
      const response = await AppwriteDatabases.getDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collectionId,
        noteId
      );

      // Check ownership
      if (response.userId !== AuthManager.currentUser.$id) {
        return { success: false, message: '❌ Anda tidak punya akses ke catatan ini' };
      }

      return { success: true, note: response };
    } catch (err) {
      console.error('Get note error:', err);
      return { success: false, message: `❌ Catatan tidak ditemukan` };
    }
  },

  // Update note
  async updateNote(noteId, title, content) {
    try {
      if (!AuthManager.currentUser) {
        return { success: false, message: '❌ Login diperlukan' };
      }

      const updateData = {
        title: title || 'Catatan Tanpa Judul',
        content: content, // sudah terenkripsi
        updatedAt: new Date().toISOString()
      };

      const response = await AppwriteDatabases.updateDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collectionId,
        noteId,
        updateData
      );

      return { success: true, note: response, message: '✅ Catatan diperbarui!' };
    } catch (err) {
      console.error('Update note error:', err);
      return { success: false, message: `❌ Gagal update: ${err.message}` };
    }
  },

  // Delete note
  async deleteNote(noteId) {
    try {
      await AppwriteDatabases.deleteDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collectionId,
        noteId
      );

      return { success: true, message: '✅ Catatan dihapus' };
    } catch (err) {
      console.error('Delete note error:', err);
      return { success: false, message: `❌ Gagal hapus: ${err.message}` };
    }
  },

  // Search notes
  async searchNotes(query) {
    try {
      if (!AuthManager.currentUser) {
        return { success: false, notes: [], message: '❌ Login diperlukan' };
      }

      const response = await AppwriteDatabases.listDocuments(
        AppwriteConfig.databaseId,
        AppwriteConfig.collectionId,
        [
          Appwrite.Query.equal('userId', AuthManager.currentUser.$id),
          Appwrite.Query.search('title', query),
          Appwrite.Query.limit(50)
        ]
      );

      return { success: true, notes: response.documents };
    } catch (err) {
      console.error('Search error:', err);
      return { success: false, notes: [] };
    }
  }
};

// Export
window.DatabaseManager = DatabaseManager;
