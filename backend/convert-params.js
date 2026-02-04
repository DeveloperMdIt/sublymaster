#!/usr/bin/env node

/**
 * Manual SQLite to PostgreSQL converter
 * Fixes the main issues with callback-based code
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'index.js');
const outputFile = path.join(__dirname, 'index.js.new');

console.log('🔄 Converting SQLite to PostgreSQL...\n');

let content = fs.readFileSync(inputFile, 'utf8');

// 1. Replace imports
content = content.replace(
    "const sqlite3 = require('sqlite3').verbose();",
    "const Database = require('./database');"
);

// 2. Replace database initialization
const dbInitOld = /const dbPath = path\.join\(__dirname, '[^']*'\);[\s\S]*?}\);/;
const dbInitNew = `const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/sublymaster';
const db = new Database(DATABASE_URL);

// Test connection
(async () => {
    try {
        await db.query('SELECT NOW()');
        console.log('✅ Connected to PostgreSQL database.');
    } catch (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1);
    }
})();`;

content = content.replace(dbInitOld, dbInitNew);

// 3. Remove initDb function completely - tables already exist
const initDbRegex = /function initDb\(\) \{[\s\S]*?^}\s*$/m;
content = content.replace(initDbRegex, '// Database tables created via SQL script\n');

// 4. Replace query parameters ? with $1, $2, etc.
content = replaceQueryParams(content);

// 5. Update message
content = content.replace(
    "'Sublymaster Backend is running (SQLite Mode)!'",
    "'Sublymaster Backend is running (PostgreSQL Mode)!'"
);

// Write output
fs.writeFileSync(outputFile, content);
console.log('✅ Created:', outputFile);
console.log('\n📝 Next steps:');
console.log('1. Review index.js.new');
console.log('2. Manually fix async/await patterns');
console.log('3. Test locally');
console.log('4. Replace index.js');

function replaceQueryParams(text) {
    // Replace ? with $1, $2, etc. in SQL queries
    const lines = text.split('\n');
    const result = [];
    
    for (let line of lines) {
        // Skip if not a query line
        if (!line.includes('db.') || !line.includes('?')) {
            result.push(line);
            continue;
        }
        
        // Count ? in this line
        let count = 0;
        const newLine = line.replace(/\?/g, () => {
            count++;
            return `$${count}`;
        });
        
        result.push(newLine);
    }
    
    return result.join('\n');
}

console.log('\n✅ Done!');
