// Sync Manager - Hybrid IndexedDB + Appwrite
const SyncManager = {
  isSyncing: false,
  lastSync: null,
  syncInterval: 30000, // Auto-sync every 30 seconds
  offlineQueue: [],

  // Initialize sync
  async init() {
    console.log('🔄 Sync Manager initialized');
    
    // Check if online
    window.addEventListener('online', () => this.syncPending());
    window.addEventListener('offline', () => this.updateSyncStatus('offline'));
    
    // Auto-sync interval
    setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncAll();
      }
    }, this.syncInterval);
  },

  // Sync all notes from Appwrite to local IndexedDB
  async syncAll() {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    this.updateSyncStatus('syncing');
    
    try {
      if (!navigator.onLine) {
        this.updateSyncStatus('offline');
        return;
      }

      const result = await DatabaseManager.getNotes();
      
      if (result.success && result.notes) {
        // Save to IndexedDB
        for (const note of result.notes) {
          await this.saveToLocal(note);
        }
        this.lastSync = new Date();
        this.updateSyncStatus('synced');
        console.log(`✅ Synced ${result.notes.length} notes`);
      }
    } catch (err) {
      console.error('Sync error:', err);
      this.updateSyncStatus('error');
    } finally {
      this.isSyncing = false;
    }
  },

  // Sync pending offline changes
  async syncPending() {
    if (!navigator.onLine || !AuthManager.isAuthenticated) return;
    
    console.log('🔄 Syncing pending changes...');
    
    for (const item of this.offlineQueue) {
      if (item.action === 'create') {
        const result = await DatabaseManager.createNote(item.title, item.content);
        if (result.success) {
          this.offlineQueue.splice(this.offlineQueue.indexOf(item), 1);
        }
      } else if (item.action === 'update') {
        const result = await DatabaseManager.updateNote(item.id, item.title, item.content);
        if (result.success) {
          this.offlineQueue.splice(this.offlineQueue.indexOf(item), 1);
        }
      }
    }
  },

  // Save to local IndexedDB
  async saveToLocal(note) {
    if (!storageManager) return;
    
    return new Promise((resolve) => {
      const transaction = storageManager.db.transaction([storageManager.storeName], 'readwrite');
      const store = transaction.objectStore(storageManager.storeName);
      store.put(note);
      transaction.oncomplete = () => resolve();
    });
  },

  // Add to offline queue
  queueChange(action, title, content, id = null) {
    this.offlineQueue.push({
      action,
      title,
      content,
      id,
      timestamp: Date.now()
    });
    console.log(`⏳ Queued: ${action}`, this.offlineQueue);
  },

  // Update sync status UI
  updateSyncStatus(status) {
    const statusEl = document.getElementById('syncStatus');
    if (!statusEl) return;
    
    const statuses = {
      'syncing': '🔄 Syncing...',
      'synced': '✅ Synced',
      'offline': '⚠️ Offline mode',
      'error': '❌ Sync failed'
    };
    
    statusEl.textContent = statuses[status] || status;
    statusEl.className = `sync-status ${status}`;
  }
};

// Export
window.SyncManager = SyncManager;
