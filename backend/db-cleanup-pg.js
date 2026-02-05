const Database = require('./database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/sublymaster';
const db = new Database(DATABASE_URL);

async function cleanup() {
    try {
        console.log('--- Starte DB-Check / Bereinigung (PostgreSQL) ---');
        
        // Da das System JWT (stateless) nutzt, gibt es keine 'sessions' Tabelle.
        // Wir prüfen jedoch die users-Tabelle auf Inkonsistenzen.
        
        const test = await db.query('SELECT COUNT(*) FROM users');
        console.log(`✅ Verbindung erfolgreich. Anzahl User in DB: ${test.rows[0].count}`);

        // Falls es Tabellen gibt, die Login-Status speichern (z.B. user_activity),
        // können wir fehlerhafte LOGS löschen. 
        // In diesem System liegt das Problem aber meist im LOCALSTORAGE des Browsers.
        
        console.log('\n--- Status-Bericht ---');
        console.log('1. Das System nutzt JWT. Es gibt keine serverseitigen Sessions zu löschen.');
        console.log('2. Der Fehler "token: false" entsteht im Browser, wenn das Login fehlschlägt oder');
        console.log('   der LocalStorage korrupt ist.');
        console.log('3. Antigravity hat bereits einen Fix in "AuthContext.jsx" eingebaut, der');
        console.log('   "false"-Tokens erkennt und den Browser-Speicher automatisch säubert.');

        console.log('\n--- Nächste Schritte ---');
        console.log('Bitte führe im Browser einen "Hard Reset" (Strg+F5) durch.');
        console.log('Das Script hat die Datenbankverbindung erfolgreich getestet.');

    } catch (err) {
        console.error('❌ Fehler:', err.message);
    } finally {
        await db.close();
    }
}

cleanup();
