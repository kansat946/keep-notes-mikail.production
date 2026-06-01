# 🔐 Encrypted Notes - Keep Notes Mikail Production

> **Aplikasi Catatan Terenkripsi Berlapis dengan Deteksi Bahasa Otomatis**

Aplikasi web modern untuk menyimpan catatan dengan enkripsi password berlapis dan sistem deteksi bahasa ganda otomatis. Sempurna untuk catatan pribadi yang aman dan terorganisir!

---

## 🌟 **Fitur Utama**

### 🔒 **Enkripsi Berlapis**
- **Layer 1:** Password utama untuk semua catatan
- **Layer 2:** Password tambahan otomatis jika deteksi bahasa ganda
- Enkripsi menggunakan SHA-256 + Base64
- Aman menyimpan data sensitif

### 🌐 **Deteksi Bahasa Ganda**
- ✅ Deteksi otomatis bahasa formal vs informal Indonesia
- ✅ Deteksi bahasa Indonesia vs Inggris
- ✅ Deteksi pronoun (gw, lu, aku, saya, anda, dll)
- 🔔 Alert real-time ketika ditemukan bahasa ganda
- 🔐 Trigger Layer 2 password otomatis

### 💾 **Penyimpanan & Export/Import**
- Simpan catatan ke localStorage (persistent)
- Export semua catatan ke file JSON
- Import catatan dari file JSON
- Backup data mudah dilakukan

### 📝 **Manajemen Catatan**
- Buat catatan baru dengan judul otomatis
- Lihat daftar semua catatan
- Edit catatan yang sudah ada
- Hapus catatan dengan konfirmasi
- Lihat metadata (tanggal dibuat, Layer 2 status)

### 🎨 **UI/UX Modern**
- Design responsive (mobile-friendly)
- Gradient purple yang cantik
- Animasi smooth (slide, fade)
- Dark mode-ready interface
- Bahasa Indonesia penuh

### 📊 **Statistik & Monitoring**
- Jumlah total catatan
- Catatan dengan Layer 2
- Total karakter tersimpan
- Riwayat tanggal pembuatan

---

## 🚀 **Quick Start**

### **Persyaratan**
- Browser modern (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage support

### **Instalasi**

1. **Clone repository:**
```bash
git clone https://github.com/kansat946/keep-notes-mikail.production.git
cd keep-notes-mikail.production
```

2. **Buka file di browser:**
```bash
# Opsi 1: Buka langsung file
open index.html

# Opsi 2: Gunakan live server
npx http-server
# Buka http://localhost:8080
```

3. **Atau akses online:**
- [GitHub Pages Link](https://kansat946.github.io/keep-notes-mikail.production/)

---

## 📖 **Cara Penggunaan**

### **1️⃣ Membuat Catatan Baru**

```
Menu Utama → Buat Notes Baru
↓
Setup Password Layer 1 (minimal 6 karakter)
↓
Tulis catatan Anda
↓
Klik "Simpan Catatan"
```

**Contoh:**
```
✍️ Tulis: "gw mau belajar programming yang asik"

🔍 Deteksi: Bahasa ganda terdeteksi!
   - Bahasa: Informal Indonesian + English
   - Trigger: Setup password Layer 2

🔐 Setup: Layer 2 password (for extra security)

✅ Selesai: Catatan tersimpan dengan 2 layer protection!
```

### **2️⃣ Membuka Catatan**

```
Menu Utama → Buka Notes
↓
Masukkan Password Layer 1
↓
(Jika ada Layer 2) Masukkan Password Layer 2
↓
Lihat daftar catatan Anda
```

### **3️⃣ Edit Catatan**

```
Klik tombol ✏️ Edit pada catatan
↓
Catatan akan dimuat di textarea
↓
Ubah isi
↓
Klik "Simpan Catatan"
```

### **4️⃣ Backup & Restore**

```
Menu Utama → Export Data
↓
Download sebagai JSON → Saved to computer

# Untuk restore:
Upload JSON → Import selesai!
```

---

## 🏗️ **Tech Stack**

| Teknologi | Penggunaan |
|-----------|-----------|
| **HTML5** | Struktur & semantic markup |
| **CSS3** | Styling, animations, responsive design |
| **JavaScript (Vanilla)** | Logic & interactivity (no dependencies!) |
| **LocalStorage API** | Data persistence |
| **Web Crypto API** | SHA-256 hashing |
| **FileReader API** | Import/export JSON |

**Komposisi kode:**
- JavaScript: 65.6% 
- HTML: 18.8%
- CSS: 15.6%

---

## 📁 **Struktur File**

```
keep-notes-mikail.production/
├── index.html              # Entry point, struktur HTML
├── style.css              # Styling & animations
├── script.js              # Main application logic
├── encryption.js          # Password hashing & encryption
├── detection.js           # Bahasa & pronoun detection
├── storage.js             # LocalStorage management
└── README.md              # Dokumentasi (file ini)
```

### **Penjelasan Module:**

**`encryption.js`** - Enkripsi & Password
```javascript
EncryptionManager
├── hashPassword()          // SHA-256 hashing
├── setLayer1Password()     // Setup password utama
├── verifyLayer1Password()  // Verifikasi password
├── setLayer2Password()     // Setup password tambahan
├── encryptNoteContent()    // Base64 encryption
└── decryptNoteContent()    // Base64 decryption
```

**`detection.js`** - Deteksi Bahasa & Pronoun
```javascript
DetectionManager
├── detectMultipleLanguages()  // Deteksi bahasa ganda
├── detectPronouns()           // Deteksi pronoun
└── getSummary()               // Summary hasil deteksi
```

**`storage.js`** - Penyimpanan Data
```javascript
StorageManager
├── addNote()              // Tambah catatan
├── getNotes()             // Ambil semua catatan
├── updateNote()           // Update catatan
├── deleteNote()           // Hapus catatan
├── exportAsJSON()         // Export ke file
├── importFromJSON()       // Import dari file
└── getStatistics()        // Statistik catatan
```

**`script.js`** - Logic Aplikasi
```javascript
// UI Management
showLayer()       // Show/hide layer
showMenu()        // Tampilkan main menu

// Authentication
setupLayer1()     // Setup password layer 1
setupLayer2()     // Setup password layer 2
verifyLayer1()    // Verifikasi layer 1
verifyLayer2()    // Verifikasi layer 2

// Notes Management
addNote()         // Tambah catatan
renderNotesList() // Render daftar catatan
editNote()        // Edit catatan
deleteNote()      // Hapus catatan

// Export/Import
exportToFile()    // Download JSON
importFromFile()  // Upload JSON
```

---

## 🔐 **Security Notes**

### **Apa yang Dilindungi:**
✅ Password disimpan sebagai hash SHA-256  
✅ Catatan dienkripsi dengan Base64  
✅ Tidak ada password dikirim ke server  
✅ Semua data di browser (client-side)  

### **Limitasi (For Demo):**
⚠️ Hanya demo - untuk production gunakan:
- Bcrypt atau Argon2 untuk password hashing
- AES-256 untuk enkripsi catatan
- Server-side encryption
- TLS/SSL untuk transmisi
- Regular security audit

---

## 📸 **Screenshots**

### Menu Utama
```
┌─────────────────────────────────┐
│ 🔐 Encrypted Notes              │
│ Aplikasi catatan dengan enkripsi│
│ berlapis & deteksi otomatis     │
├─────────────────────────────────┤
│ Menu Utama                      │
│                                 │
│ [📝 Buat Notes Baru]           │
│ [🔓 Buka Notes]                │
│ [💾 Export Data]               │
└─────────────────────────────────┘
```

### Setup Password
```
┌─────────────────────────────────┐
│ Layer 1: Setup Password Utama   │
├─────────────────────────────────┤
│ Password Layer 1:               │
│ [••••••••••] (min 6 karakter)  │
│                                 │
│ [Setup Layer 1]                │
│ ✅ Layer 1 password berhasil!  │
└─────────────────────────────────┘
```

### Deteksi Bahasa Ganda
```
┌─────────────────────────────────┐
│ ⚠️ Deteksi Bahasa Ganda!        │
│                                 │
│ Catatan Anda menggunakan bahasa │
│ yang berbeda. Sistem akan       │
│ meminta password Layer 2 untuk  │
│ keamanan ekstra.                │
└─────────────────────────────────┘
```

---

## ✨ **Fitur Advanced**

### **Pronoun Detection:**
Aplikasi bisa mendeteksi pronoun seperti:
- Informal: `gw`, `lu`, `aku`, `kamu`
- Formal: `saya`, `anda`, `beliau`
- Particles: `yang`, `dengan`, `dong`, `lah`

### **Multi-Language Detection:**
- Indonesia Formal + Indonesia Informal
- Indonesia + English
- Bisa diperluas ke bahasa lain

### **Automatic Layer 2 Trigger:**
Ketika bahasa ganda terdeteksi, sistem secara otomatis meminta setup password Layer 2 untuk keamanan ekstra.

---

## 🐛 **Known Limitations**

1. ⚠️ Password persistence belum full (akan diperbaiki)
2. ⚠️ Edit note functionality masih basic
3. ⚠️ Tidak ada server-side encryption
4. ⚠️ Deteksi bahasa bisa false positive
5. ⚠️ Belum ada dark mode

---

## 🛠️ **Roadmap Pengembangan**

- [ ] ✅ Fix password persistence (store ke localStorage)
- [ ] ✅ Improve edit note functionality
- [ ] ✅ Add dark mode support
- [ ] ✅ Add search & filter notes
- [ ] ✅ Add categories/tags
- [ ] ✅ Add note preview
- [ ] ✅ Add server-side backend (Node.js)
- [ ] ✅ Add database (MongoDB)
- [ ] ✅ Add cloud sync
- [ ] ✅ Add mobile app
- [ ] ✅ Add AI-powered search
- [ ] ✅ Add team collaboration

---

## 💡 **Tips & Tricks**

### **Best Practices:**
1. **Gunakan password yang kuat** (> 8 karakter, mix alphanumeric + special)
2. **Backup catatan secara berkala** (download JSON)
3. **Jangan share password** (terutama Layer 2)
4. **Clear browser cache** kalau berubah device
5. **Test import** di device lain sebelum hapus original

### **Keyboard Shortcuts:**
- `Enter` di password field = Submit
- `Tab` = Navigate antar field
- `Escape` = Cancel (planned)

---

## 🤝 **Kontribusi**

Kami welcome kontribusi! Silakan:

1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 **License**

Project ini di-license di bawah **MIT License** - lihat [LICENSE](LICENSE) file untuk detail.

---

## 📧 **Kontak & Support**

- **Author:** kansat946
- **GitHub:** [@kansat946](https://github.com/kansat946)
- **Issues:** [GitHub Issues](https://github.com/kansat946/keep-notes-mikail.production/issues)
- **Email:** satoru.canva@gmail.com

---

## 🙏 **Terima Kasih**

Terima kasih sudah menggunakan **Encrypted Notes**! 

Jika Anda menemukan bugs atau punya saran, jangan ragu untuk:
- 🐛 Report bugs di Issues
- 💬 Diskusi di Discussions
- ⭐ Star repository ini
- 🔗 Share dengan teman

**Happy Note Taking! 📝✨**

---

## 📚 **Referensi**

- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [MDN LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [Regex Pattern Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

---

**Last Updated:** 31 May 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready (dengan note tentang limitations)

**Made with ❤️ by kansat946**