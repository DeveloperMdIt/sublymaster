// Run migration for templates table
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running templates migration...');
        
        // Create templates table
        await client.query(`
            CREATE TABLE IF NOT EXISTS templates (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                width INTEGER NOT NULL,
                height INTEGER NOT NULL,
                is_standard BOOLEAN DEFAULT false,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Templates table created');
        
        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_templates_standard ON templates(is_standard)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_templates_size ON templates(width, height)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(created_by)`);
        console.log('✓ Indexes created');
        
        // Insert initial standard templates
        await client.query(`
            INSERT INTO templates (name, width, height, is_standard) 
            SELECT * FROM (VALUES
                ('Tasse (Standard)', 800, 380, true),
                ('Flasche', 720, 480, true),
                ('T-Shirt', 1000, 1200, true)
            ) AS v(name, width, height, is_standard)
            WHERE NOT EXISTS (
                SELECT 1 FROM templates WHERE is_standard = true
            )
        `);
        console.log('✓ Initial templates inserted');
        
        // Add columns to projects table
        await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_width INTEGER`);
        await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_height INTEGER`);
        console.log('✓ Projects table updated');
        
        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
