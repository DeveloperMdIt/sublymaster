-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Extend Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT gen_random_uuid();
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_number VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(100);

-- Create sequence for customer numbers if not strictly using IDs
CREATE SEQUENCE IF NOT EXISTS customer_number_seq START 1000;

-- 2. User Profiles Table (1:1)
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    salutation VARCHAR(20), -- Herr, Frau, Divers
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(150),
    vat_id VARCHAR(50), -- USt-IdNr.
    phone VARCHAR(50),
    mobile VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Addresses Table (1:n)
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'billing', 'shipping'
    street VARCHAR(150),
    house_number VARCHAR(20),
    address_addition VARCHAR(100),
    zip_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Deutschland',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id);
CREATE INDEX IF NOT EXISTS idx_users_customer_number ON users(customer_number);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- 4. Migration for EXISTING users
-- Generate customer numbers for users who don't have one
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM users WHERE customer_number IS NULL LOOP
        UPDATE users 
        SET customer_number = 'KD-' || to_char(nextval('customer_number_seq'), 'FM000000'),
            public_id = CASE WHEN public_id IS NULL THEN gen_random_uuid() ELSE public_id END
        WHERE id = r.id;
        
        -- Create empty profile if not exists
        INSERT INTO user_profiles (user_id) 
        VALUES (r.id) 
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END$$;
