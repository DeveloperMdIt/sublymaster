-- Settings table for global application settings
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deployment history table
CREATE TABLE IF NOT EXISTS deployment_history (
    id SERIAL PRIMARY KEY,
    triggered_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'running',
    commit_hash VARCHAR(40),
    branch VARCHAR(50) DEFAULT 'main',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    logs TEXT,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_deployment_status ON deployment_history(status);
CREATE INDEX IF NOT EXISTS idx_deployment_started ON deployment_history(started_at DESC);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
    ('site_name', 'SublyMaster'),
    ('maintenance_mode', 'false'),
    ('allow_registrations', 'true')
ON CONFLICT (key) DO NOTHING;
