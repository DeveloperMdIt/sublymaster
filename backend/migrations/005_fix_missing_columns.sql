-- Migration 005: Fix missing columns in users and user_profiles
-- This script ensures all columns required by the backend routes are present.

-- 1. Extend user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS legal_form VARCHAR(50);

-- 2. Extend users table with missing settings and status columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS printer_model VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_offset INTEGER DEFAULT 0;

-- Ensure existing users have a role if missing
UPDATE users SET role = 'user' WHERE role IS NULL;
UPDATE users SET account_status = 'active' WHERE account_status IS NULL;
UPDATE users SET plan_id = 1 WHERE plan_id IS NULL;
UPDATE users SET credits = 0 WHERE credits IS NULL;
