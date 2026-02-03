#!/usr/bin/env node

/**
 * Admin User Creator für Sublymaster
 * Erstellt einen Admin-User mit gehashtem Passwort in der PostgreSQL-Datenbank
 */

const bcrypt = require('bcrypt');
const { Client } = require('pg');

// Konfiguration
const ADMIN_EMAIL = 'michael.deja@md-it-solutions.de';
const ADMIN_PASSWORD = 'Euramobil1610!';

// PostgreSQL Connection (aus .env oder direkt)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://sunlinermicha:Euramobil1610!@localhost:5433/sublymaster';

async function createAdminUser() {
    console.log('🔐 Erstelle Admin-User...\n');

    try {
        // 1. Passwort hashen
        console.log('1️⃣  Hashe Passwort...');
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        console.log('✅ Passwort gehashed\n');

        // 2. Zur Datenbank verbinden
        console.log('2️⃣  Verbinde zur Datenbank...');
        const client = new Client({
            connectionString: DATABASE_URL
        });
        await client.connect();
        console.log('✅ Verbunden\n');

        // 3. Admin-User erstellen oder aktualisieren
        console.log('3️⃣  Erstelle/Aktualisiere Admin-User...');
        const query = `
            INSERT INTO users (email, password, role, credits, created_at)
            VALUES ($1, $2, 'admin', 0, NOW())
            ON CONFLICT (email) DO UPDATE SET
                password = EXCLUDED.password,
                role = 'admin'
            RETURNING id, email, role;
        `;
        
        const result = await client.query(query, [ADMIN_EMAIL, hashedPassword]);
        console.log('✅ Admin-User erstellt/aktualisiert:\n');
        console.log('   ID:', result.rows[0].id);
        console.log('   Email:', result.rows[0].email);
        console.log('   Role:', result.rows[0].role);
        console.log('');

        // 4. Verbindung schließen
        await client.end();
        console.log('✅ Fertig!\n');
        console.log('Sie können sich jetzt einloggen mit:');
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Passwort: Euramobil1610!');

    } catch (error) {
        console.error('❌ Fehler:', error.message);
        process.exit(1);
    }
}

// Skript ausführen
createAdminUser();
