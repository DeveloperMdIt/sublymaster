#!/usr/bin/env node

/**
 * SQLite to PostgreSQL Migration Script
 * Converts index.js from SQLite to PostgreSQL
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'index.js');
const outputFile = path.join(__dirname, 'index.postgres.js');
const backupFile = path.join(__dirname, 'index.sqlite.backup.js');

console.log('🔄 Starting SQLite to PostgreSQL migration...\n');

// Read the file
let content = fs.readFileSync(inputFile, 'utf8');

// Backup original
fs.writeFileSync(backupFile, content);
console.log('✅ Created backup:', backupFile);

// 1. Replace imports
content = content.replace(
    "const sqlite3 = require('sqlite3').verbose();",
    "const Database = require('./database');"
);

// 2. Replace database initialization
content = content.replace(
    /const dbPath = path\.join\(__dirname, 'sublimaster\.db'\);[\s\S]*?}\);/,
    `const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/sublymaster';
const db = new Database(DATABASE_URL);

// Test connection
db.query('SELECT NOW()').then(() => {
    console.log('Connected to PostgreSQL database.');
}).catch(err => {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
});`
);

// 3. Replace initDb function - make it async
content = content.replace(
    'function initDb() {',
    'async function initDb() {'
);

// 4. Remove db.serialize
content = content.replace(/db\.serialize\(\(\) => \{/, '// Database initialization (PostgreSQL)');

// 5. Replace db.run with await db.run
content = content.replace(/db\.run\(/g, 'await db.run(');

// 6. Replace db.get with await db.getOne
content = content.replace(/db\.get\(/g, 'await db.getOne(');

// 7. Replace db.all with await db.getAll
content = content.replace(/db\.all\(/g, 'await db.getAll(');

// 8. Replace SQLite syntax with PostgreSQL
// AUTOINCREMENT -> SERIAL
content = content.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');

// DATETIME -> TIMESTAMP
content = content.replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

// TEXT -> VARCHAR where appropriate
content = content.replace(/email TEXT UNIQUE/g, 'email VARCHAR(255) UNIQUE');
content = content.replace(/password TEXT NOT NULL/g, 'password VARCHAR(255) NOT NULL');
content = content.replace(/role TEXT DEFAULT/g, 'role VARCHAR(50) DEFAULT');

// 9. Replace query parameters ? with $1, $2, etc.
// This is complex, so we'll do it with a function
content = replaceQueryParameters(content);

// 10. Replace callback-style queries with async/await
content = convertCallbacksToAsync(content);

// 11. Update the root message
content = content.replace(
    "'Sublymaster Backend is running (SQLite Mode)!'",
    "'Sublymaster Backend is running (PostgreSQL Mode)!'"
);

// Write output
fs.writeFileSync(outputFile, content);
console.log('✅ Created PostgreSQL version:', outputFile);

console.log('\n📝 Manual steps required:');
console.log('1. Review index.postgres.js for any errors');
console.log('2. Test the new version locally');
console.log('3. Replace index.js with index.postgres.js');
console.log('4. Install pg: npm install pg');
console.log('5. Restart the server');

/**
 * Replace ? parameters with $1, $2, etc.
 */
function replaceQueryParameters(text) {
    // Match SQL queries with parameters
    const queryRegex = /(db\.(query|getOne|getAll|run)\s*\(\s*['"`])([\s\S]*?)(['"`]\s*,\s*\[)/g;
    
    return text.replace(queryRegex, (match, prefix, method, query, suffix) => {
        let paramCount = 0;
        const newQuery = query.replace(/\?/g, () => {
            paramCount++;
            return `$${paramCount}`;
        });
        return prefix + newQuery + suffix;
    });
}

/**
 * Convert callback-style queries to async/await
 */
function convertCallbacksToAsync(text) {
    // This is a simplified version - manual review needed
    // Replace common patterns
    
    // Pattern: db.getOne(..., (err, row) => { ... })
    text = text.replace(
        /await db\.getOne\((.*?),\s*\((err,\s*row)\)\s*=>\s*\{/g,
        'try {\n        const row = await db.getOne($1);'
    );
    
    // Pattern: db.getAll(..., (err, rows) => { ... })
    text = text.replace(
        /await db\.getAll\((.*?),\s*\((err,\s*rows)\)\s*=>\s*\{/g,
        'try {\n        const rows = await db.getAll($1);'
    );
    
    return text;
}

console.log('\n✅ Migration script completed!');
