import pkg from 'whatsapp-web.js';
const { LocalAuth } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CustomAuth extends LocalAuth {
    constructor() {
        super();
        this.sessionFile = path.join(__dirname, 'session.json');
    }

    async getSession() {
        if (fs.existsSync(this.sessionFile)) {
            const sessionData = fs.readFileSync(this.sessionFile);
            return JSON.parse(sessionData);
        }
        return null;
    }

    async saveSession(session) {
        fs.writeFileSync(this.sessionFile, JSON.stringify(session));
    }

    async deleteSession() {
        if (fs.existsSync(this.sessionFile)) {
            fs.unlinkSync(this.sessionFile);
        }
    }
}

export default CustomAuth;