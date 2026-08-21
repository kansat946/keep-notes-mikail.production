// Authentication Module
const AuthManager = {
  currentUser: null,
  isAuthenticated: false,

  // Register user
  async register(email, password) {
    try {
      // Hash password untuk security (client-side)
      const hashedPassword = await this.hashPassword(password);
      
      const user = await AppwriteAccount.create(
        'unique()',
        email,
        hashedPassword,
        email // name
      );
      
      this.currentUser = user;
      this.isAuthenticated = true;
      
      // Auto login setelah register
      await this.login(email, password);
      
      return { success: true, user, message: '✅ Akun berhasil dibuat!' };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, message: `❌ Gagal register: ${err.message}` };
    }
  },

  // Login user
  async login(email, password) {
    try {
      // Appwrite uses email+password session
      const session = await AppwriteAccount.createEmailPasswordSession(email, password);
      
      const user = await AppwriteAccount.get();
      this.currentUser = user;
      this.isAuthenticated = true;
      
      // Save preference (tidak perlu simpan password!)
      localStorage.setItem('keepnotes_user', JSON.stringify(user));
      localStorage.setItem('keepnotes_email', email);
      
      return { success: true, user, message: '✅ Login berhasil!' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: `❌ Password salah atau akun tidak ada` };
    }
  },

  // Logout
  async logout() {
    try {
      await AppwriteAccount.deleteSession('current');
      this.currentUser = null;
      this.isAuthenticated = false;
      
      // Clear local storage
      localStorage.removeItem('keepnotes_user');
      localStorage.removeItem('keepnotes_email');
      
      return { success: true, message: '✅ Logout berhasil' };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, message: `❌ Gagal logout` };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const user = await AppwriteAccount.get();
      this.currentUser = user;
      this.isAuthenticated = true;
      return user;
    } catch (err) {
      this.isAuthenticated = false;
      return null;
    }
  },

  // Hash password (PBKDF2)
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Check if session exists
  async checkSession() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (err) {
      return false;
    }
  }
};

// Export
window.AuthManager = AuthManager;
