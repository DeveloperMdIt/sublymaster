-- ============================================
-- Sublymaster PostgreSQL Database Setup
-- Für Netcup Production Server
-- ============================================

-- Datenbank: sublymaster (bereits erstellt)
-- User: sunlinermicha (bereits erstellt)

-- ============================================
-- 1. TABELLEN ERSTELLEN
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    plan_id INTEGER DEFAULT 1,
    role VARCHAR(50) DEFAULT 'user',
    account_status VARCHAR(50) DEFAULT 'active',
    offset_top REAL DEFAULT 0,
    offset_left REAL DEFAULT 0,
    credits INTEGER DEFAULT 0,
    printer_model VARCHAR(255),
    default_offset REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    thumbnail TEXT,
    template TEXT,
    data TEXT,
    offset_top REAL DEFAULT 0,
    offset_left REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings Table (Key/Value pairs)
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT
);

-- User Activity/History (IP Logging)
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Templates (User saved)
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Print Templates (Tasse, Krug, etc.)
CREATE TABLE IF NOT EXISTS print_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    width_mm REAL NOT NULL,
    height_mm REAL NOT NULL,
    orientation VARCHAR(50) DEFAULT 'portrait'
);

-- Subscription Plans
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price REAL NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'subscription' or 'credits'
    credits INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
);

-- Print Logs (History)
CREATE TABLE IF NOT EXISTS print_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    format VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Printer Models (Community Data)
CREATE TABLE IF NOT EXISTS printer_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(255),
    average_offset REAL DEFAULT 0,
    use_count INTEGER DEFAULT 0,
    is_verified INTEGER DEFAULT 0
);

-- Print Feedback (Detailed logs)
CREATE TABLE IF NOT EXISTS print_feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    printer_model VARCHAR(255),
    used_offset REAL,
    status VARCHAR(50), -- 'success', 'failed'
    correction_value REAL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. INITIAL DATA (SEED)
-- ============================================

-- Print Templates
INSERT INTO print_templates (name, width_mm, height_mm, orientation) VALUES
    ('Standard Tasse', 200, 95, 'portrait'),
    ('Bierkrug', 230, 150, 'portrait'),
    ('Mousepad', 230, 190, 'landscape')
ON CONFLICT DO NOTHING;

-- Subscription Plans
INSERT INTO plans (name, price, type, credits) VALUES
    ('Free', 0, 'subscription', 0),
    ('Pro Monthly', 9.99, 'subscription', 0),
    ('10er Karte', 15.00, 'credits', 10)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. ADMIN USER ERSTELLEN
-- ============================================

-- WICHTIG: Das Passwort muss gehashed werden!
-- Führen Sie ZUERST auf dem Server aus:
-- cd /var/www/sublymaster/backend
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Euramobil1610!', 10, (err, hash) => { console.log(hash); });"

-- Dann ersetzen Sie 'HASH_HIER_EINFUEGEN' mit dem generierten Hash:

INSERT INTO users (email, password, role, credits, created_at) VALUES
    ('michael.deja@md-it-solutions.de', 'HASH_HIER_EINFUEGEN', 'admin', 0, NOW())
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = 'admin';

-- ============================================
-- 4. INDICES FÜR PERFORMANCE (Optional)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_print_logs_user_id ON print_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_print_feedback_user_id ON print_feedback(user_id);

-- ============================================
-- FERTIG!
-- ============================================

-- Prüfen Sie die Tabellen:
-- \dt

-- Prüfen Sie die Daten:
-- SELECT * FROM users;
-- SELECT * FROM plans;
-- SELECT * FROM print_templates;
