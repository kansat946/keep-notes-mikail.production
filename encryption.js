// Encryption Module - Password Ganda
class EncryptionManager {
    constructor() {
        this.layer1Password = null;
        this.layer2Password = null;
    }

    // Simple encryption using SHA-256 (for demo, use bcrypt in production)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Set Layer 1 Password
    async setLayer1Password(password) {
        if (!password || password.length < 6) {
            return { success: false, message: 'Password minimal 6 karakter!' };
        }
        this.layer1Password = await this.hashPassword(password);
        return { success: true, message: 'Layer 1 password berhasil dibuat! ✅' };
    }

    // Verify Layer 1 Password
    async verifyLayer1Password(password) {
        const hashed = await this.hashPassword(password);
        return hashed === this.layer1Password;
    }

    // Set Layer 2 Password
    async setLayer2Password(password) {
        if (!password || password.length < 6) {
            return { success: false, message: 'Password minimal 6 karakter!' };
        }
        this.layer2Password = await this.hashPassword(password);
        return { success: true, message: 'Layer 2 password berhasil dibuat! ✅' };
    }

    // Verify Layer 2 Password
    async verifyLayer2Password(password) {
        if (!this.layer2Password) {
            return false;
        }
        const hashed = await this.hashPassword(password);
        return hashed === this.layer2Password;
    }

    // Check if Layer 2 is required
    hasLayer2() {
        return this.layer2Password !== null;
    }

    // Encrypt note content
    encryptNoteContent(content) {
        // Simple Base64 encoding (use proper encryption in production)
        return btoa(unescape(encodeURIComponent(content)));
    }

    // Decrypt note content
    decryptNoteContent(encrypted) {
        try {
            return decodeURIComponent(escape(atob(encrypted)));
        } catch (e) {
            return encrypted;
        }
    }

    // Reset passwords
    reset() {
        this.layer1Password = null;
        this.layer2Password = null;
    }
}

// Global encryption manager
const encryptionManager = new EncryptionManager();