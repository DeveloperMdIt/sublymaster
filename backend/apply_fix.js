const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from root
const rootEnv = path.join(__dirname, '..', '.env');
if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
    console.log('Loaded .env from root');
}

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/sublymaster';
console.log('Connecting to:', dbUrl.split('@')[1] || dbUrl); // Hide password

async function run() {
    const client = new Client({ connectionString: dbUrl });
    try {
        await client.connect();
        console.log('Connected!');
        
        const sqlPath = path.join(__dirname, 'migrations', '005_fix_missing_columns.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Running SQL...');
        await client.query(sql);
        console.log('✓ SUCCESS: Database updated.');
    } catch (err) {
        console.error('❌ FAILED:', err.message);
    } finally {
        await client.end();
    }
}

run();
