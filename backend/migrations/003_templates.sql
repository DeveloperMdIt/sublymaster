-- Migration: Template Management System
-- Erstellt templates-Tabelle für Standard- und Custom-Templates

-- Templates-Tabelle
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    width INTEGER NOT NULL,  -- in pixels (mm * 4)
    height INTEGER NOT NULL, -- in pixels (mm * 4)
    is_standard BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_templates_standard ON templates(is_standard);
CREATE INDEX IF NOT EXISTS idx_templates_size ON templates(width, height);
CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(created_by);

-- Initiale Standard-Templates
INSERT INTO templates (name, width, height, is_standard) VALUES
    ('Tasse (Standard)', 800, 380, true),
    ('Flasche', 720, 480, true),
    ('T-Shirt', 1000, 1200, true)
ON CONFLICT DO NOTHING;

-- Projects-Tabelle erweitern (für Analyse)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_width INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_height INTEGER;
