# 🔒 Keep Notes — Encrypted Cloud Edition

**Catatan pribadi terenkripsi yang bisa diakses dari mana saja, perangkat apa saja!**

## ✨ Fitur Utama

✅ **Enkripsi End-to-End** — Semua catatan dienkripsi client-side (PBKDF2 + AES-GCM)  
✅ **Cloud Sync** — Disimpan di Appwrite, bisa akses dari device apa pun  
✅ **Login Aman** — Akun per email + password, hanya kamu yang bisa buka catatan  
✅ **Offline Support** — Bisa edit offline, auto-sync saat online  
✅ **Memory Reset** — Logout = clear semua data lokal secara otomatis  
✅ **Search & Organize** — Cari catatan dengan cepat  

---

## 🚀 Quick Start

### 1. Setup Appwrite

```bash
# Clone atau fork repository ini
git clone https://github.com/kansat946/keep-notes-mikail.production.git
cd keep-notes-mikail.production

# Checkout ke branch appwrite-migration
git checkout appwrite-migration
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` dengan credentials Appwrite Anda:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_API_KEY=your_api_key
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
```

### 3. Run Locally (Development)

Jika pakai Vite:

```bash
npm install
npm run dev
```

Atau buka langsung `index.html` di browser (tapi env vars tidak akan loaded).

### 4. Deploy ke Production

#### Option A: GitHub Pages

```bash
git push origin appwrite-migration
```

Kemudian di GitHub:
- Settings → Pages → Deploy from branch
- Branch: `appwrite-migration`
- Folder: `/root`

#### Option B: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Pastikan environment variables sudah di-set di Vercel dashboard.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Frontend (Client-Side)            │
│   ├─ Login/Register (AuthManager)   │
│   ├─ Create/Edit Notes              │
│   └─ Encryption (PBKDF2 + AES-GCM)  │
└──────────────┬──────────────────────┘
               │
         (HTTPS Encrypted)
               │
┌──────────────▼──────────────────────┐
│   Appwrite Backend                  │
│   ├─ Authentication                 │
│   ├─ Database (PostgreSQL)          │
│   ├─ Storage (Encrypted Data)       │
│   └─ Security (Row-Level)           │
└─────────────────────────────────────┘
```

### Data Flow

1. **Create Note**: User ketik → Encrypt client-side → Kirim ke Appwrite → Save ke database
2. **Load Notes**: Fetch dari Appwrite → Decrypt client-side → Tampilkan
3. **Sync**: Auto-sync setiap 30 detik (jika online)
4. **Offline**: Queue changes → Sync saat online

---

## 📁 File Structure

```
keep-notes-mikail.production/
├── index.html                 # Main HTML (Login + Notes UI)
├── app-new.js                 # Main app logic
├── style.css                  # Styling (responsive)
├── storage.js                 # IndexedDB helper
├── js/
│   ├── crypto.js              # PBKDF2 + AES-GCM encryption
│   ├── appwrite/
│   │   ├── config.js          # Appwrite client setup
│   │   ├── auth.js            # Authentication
│   │   ├── database.js        # CRUD operations
│   │   └── sync.js            # Sync manager
│   └── app.js                 # (Legacy, bisa dihapus)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore
└── README.md                  # Dokumentasi
```

---

## 🔐 Security Notes

⚠️ **PENTING**:

1. **API Key** — Jangan commit `.env` atau jangan expose API key!
   - Gunakan `.env.local` (sudah di `.gitignore`)
   - Di production, set env vars di Vercel/GitHub Actions

2. **Password** — Minimal 8 karakter, tidak bisa dipulihkan jika lupa!
   - Gunakan password manager
   - Reset password via email (jika setup di Appwrite)

3. **Encryption** — Client-side, Appwrite tidak bisa baca data
   - Kunci enkripsi = email + password kamu
   - Kalau lupa password = data tidak bisa dipulihkan

4. **HTTPS** — Selalu gunakan HTTPS di production

---

## 🛠️ Troubleshooting

### "Gagal connect ke Appwrite"
- [ ] Pastikan credentials di `.env.local` benar
- [ ] Check Appwrite dashboard online/accessible
- [ ] Lihat console error (F12 → Console)

### "Login failed"
- [ ] Email dan password harus match
- [ ] Pastikan akun sudah didaftar di Appwrite

### "Catatan tidak muncul"
- [ ] Tunggu sync selesai (lihat status)
- [ ] Refresh page
- [ ] Check browser's IndexedDB (F12 → Application → IndexedDB)

### "Offline mode"
- [ ] Normal! Auto-sync saat online
- [ ] Jangan tutup browser saat sync

---

## 📝 API Reference

### AuthManager

```javascript
await AuthManager.register(email, password);
await AuthManager.login(email, password);
await AuthManager.logout();
await AuthManager.getCurrentUser();
await AuthManager.checkSession();
```

### DatabaseManager

```javascript
await DatabaseManager.createNote(title, content);
await DatabaseManager.getNotes();
await DatabaseManager.getNote(noteId);
await DatabaseManager.updateNote(noteId, title, content);
await DatabaseManager.deleteNote(noteId);
await DatabaseManager.searchNotes(query);
```

### SyncManager

```javascript
await SyncManager.init();
await SyncManager.syncAll();
await SyncManager.syncPending();
SyncManager.queueChange(action, title, content);
```

---

## 📄 License

MIT

---

## 🤝 Contributing

Terima PR dan issue! Silakan fork & create PR.

---

**Made with ❤️ by Copilot**
