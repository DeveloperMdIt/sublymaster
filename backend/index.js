const express = require('express');
const Database = require('./database');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-me';

// Database Connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/sublymaster';
const db = new Database(DATABASE_URL);

// Test connection and initialize
(async () => {
    try {
        await db.query('SELECT NOW()');
        console.log('✅ Connected to PostgreSQL database.');
        console.log('📊 Database URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password
    } catch (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1);
    }
})();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper for Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Admin Middleware
const authenticateAdmin = (req, res, next) => {
    authenticateToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Access denied: Admins only' });
        }
    });
};

// ============================================
// ROUTES
// ============================================

// Root
app.get('/', (req, res) => {
    res.send('Sublymaster Backend is running (PostgreSQL Mode)!');
});

// ============================================
// AUTH ENDPOINTS
// ============================================

// Register
app.post('/api/register', async (req, res) => {
    const { email, password, plan } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Determine plan_id and credits
    let plan_id = 1;
    let initial_credits = 0;
    if (plan === 'pro') {
        plan_id = 2;
    } else if (plan === 'credits') {
        plan_id = 3;
        initial_credits = 10;
    }

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Check if user exists
        const existingUser = await db.getOne('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Customer Number
        const seq = await db.getOne("SELECT nextval('customer_number_seq') as num");
        const kdNr = `KD-${String(seq.num).padStart(6, '0')}`;

        // Insert user
        const result = await db.query(
            'INSERT INTO users (email, password, role, plan_id, credits, customer_number, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [email, hashedPassword, 'user', plan_id, initial_credits, kdNr, true] // Default verified true for now until email system is active
        );

        const userId = result.rows[0].id;
        
        // Create initial profile
        await db.run('INSERT INTO user_profiles (user_id) VALUES ($1)', [userId]);

        // Create JWT token
        const token = jwt.sign(
            {
                id: userId,
                email: email,
                role: 'user',
                plan_id: plan_id,
                credits: initial_credits
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log activity
        await db.run(
            'INSERT INTO user_activity (user_id, action, ip_address) VALUES ($1, $2, $3)',
            [userId, 'REGISTER', ip]
        );

        res.status(201).json({
            message: 'User registered successfully',
            token: token,
            user: {
                id: userId,
                email: email,
                plan_id: plan_id,
                role: 'user',
                credits: initial_credits,
                printer_model: null,
                default_offset: 0
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.getOne('SELECT * FROM users WHERE email = $1', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Handle both possible column names from legacy/migration state
        const pwdHash = user.password_hash || user.password;
        if (!pwdHash) {
            console.error('Login Error: No password hash found for user', user.id);
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const validPassword = await bcrypt.compare(password, pwdHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Fetch profile data (safely)
        let first_name = null;
        try {
            const profile = await db.getOne('SELECT first_name, last_name FROM user_profiles WHERE user_id = $1', [user.id]);
            if (profile) first_name = profile.first_name;
        } catch (e) {
            console.warn('Could not fetch user profile (migration pending?):', e.message);
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, first_name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        await db.run(
            'INSERT INTO user_activity (user_id, action, ip_address) VALUES ($1, $2, $3)',
            [user.id, 'LOGIN', req.headers['x-forwarded-for'] || req.socket.remoteAddress]
        );

        res.json({
            message: 'Login erfolgreich',
            token,
            user: {
                id: user.id,
                email: user.email,
                plan_id: user.plan_id,
                role: user.role,
                account_status: user.account_status,
                credits: user.credits || 0,
                printer_model: user.printer_model,
                default_offset: user.default_offset || 0,
                customer_number: user.customer_number,
                first_name: first_name
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// USER ENDPOINTS
// ============================================

// Get User Profile (Extended)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        // Fetch User and Profile Data
        const user = await db.getOne(`
            SELECT u.id, u.email, u.role, u.plan_id, u.credits, u.printer_model, u.default_offset, u.account_status,
                   u.customer_number, u.public_id, u.is_verified,
                   p.salutation, p.first_name, p.last_name, p.company_name, p.vat_id, p.phone, p.mobile
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = $1
        `, [req.user.id]);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch Addresses
        const addresses = await db.getAll('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id ASC', [req.user.id]);
        
        user.addresses = addresses;
        res.json(user);
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update User Profile
// Update User Profile & Master Data
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    const { 
        printer_model, default_offset, // User settings
        salutation, first_name, last_name, company_name, vat_id, phone, mobile, legal_form, // CRM data
        street, house_number, zip, city, country // Address data
    } = req.body;

    try {
        // 1. Update User Settings
        if (printer_model !== undefined || default_offset !== undefined) {
            await db.run(
                'UPDATE users SET printer_model = COALESCE($1, printer_model), default_offset = COALESCE($2, default_offset) WHERE id = $3',
                [printer_model, default_offset, req.user.id]
            );
        }

        // 2. Update/Upsert CRM Profile
        const profile = await db.getOne('SELECT id FROM user_profiles WHERE user_id = $1', [req.user.id]);
        
        if (profile) {
            await db.run(`
                UPDATE user_profiles SET
                    salutation = COALESCE($1, salutation),
                    first_name = COALESCE($2, first_name),
                    last_name = COALESCE($3, last_name),
                    company_name = COALESCE($4, company_name),
                    vat_id = COALESCE($5, vat_id),
                    phone = COALESCE($6, phone),
                    mobile = COALESCE($7, mobile),
                    legal_form = COALESCE($8, legal_form),
                    updated_at = NOW()
                WHERE user_id = $9
            `, [salutation, first_name, last_name, company_name, vat_id, phone, mobile, legal_form, req.user.id]);
        } else {
            await db.run(`
                INSERT INTO user_profiles (user_id, salutation, first_name, last_name, company_name, vat_id, phone, mobile, legal_form)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [req.user.id, salutation, first_name, last_name, company_name, vat_id, phone, mobile, legal_form]);
        }

        // 3. Update/Upsert Billing Address (if provided)
        if (street || zip || city || country) {
            // Check for existing billing address
            const billingAddr = await db.getOne('SELECT id FROM addresses WHERE user_id = $1 AND type = $2', [req.user.id, 'billing']);
            
            if (billingAddr) {
                await db.run(`
                    UPDATE addresses SET
                        street = COALESCE($1, street),
                        house_number = COALESCE($2, house_number),
                        zip = COALESCE($3, zip),
                        city = COALESCE($4, city),
                        country = COALESCE($5, country),
                        updated_at = NOW()
                    WHERE id = $6
                `, [street, house_number, zip, city, country, billingAddr.id]);
            } else {
                await db.run(`
                    INSERT INTO addresses (user_id, type, street, house_number, zip, city, country, is_default)
                    VALUES ($1, 'billing', $2, $3, $4, $5, $6, true)
                `, [req.user.id, street, house_number, zip, city, country]);
            }
        }

        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Manage Addresses
app.post('/api/user/addresses', authenticateToken, async (req, res) => {
    const { id, type, street, house_number, address_addition, zip_code, city, country, is_default } = req.body;
    
    try {
        if (id) {
            // Update
            await db.run(`
                UPDATE addresses SET
                    type = $1, street = $2, house_number = $3, address_addition = $4,
                    zip_code = $5, city = $6, country = $7, is_default = $8, updated_at = NOW()
                WHERE id = $9 AND user_id = $10
            `, [type, street, house_number, address_addition, zip_code, city, country, is_default || false, id, req.user.id]);
        } else {
            // Create
            await db.run(`
                INSERT INTO addresses (user_id, type, street, house_number, address_addition, zip_code, city, country, is_default)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [req.user.id, type, street, house_number, address_addition, zip_code, city, country, is_default || false]);
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Address error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/user/addresses/:id', authenticateToken, async (req, res) => {
    try {
        await db.run('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete address error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User Settings (Calibration)
app.get('/api/settings', authenticateToken, async (req, res) => {
    try {
        const settings = await db.getOne(
            'SELECT offset_top, offset_left FROM users WHERE id = $1',
            [req.user.id]
        );
        res.json(settings || { offset_top: 0, offset_left: 0 });
    } catch (err) {
        console.error('Settings error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update User Settings
app.put('/api/settings', authenticateToken, async (req, res) => {
    const { offset_top, offset_left } = req.body;

    try {
        await db.run(
            'UPDATE users SET offset_top = $1, offset_left = $2 WHERE id = $3',
            [offset_top || 0, offset_left || 0, req.user.id]
        );
        res.json({ message: 'Settings saved' });
    } catch (err) {
        console.error('Update settings error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// PROJECTS ENDPOINTS
// ============================================

// Get all projects
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const projects = await db.getAll(
            'SELECT id, name, thumbnail, template, offset_top, offset_left, created_at, updated_at FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
            [req.user.id]
        );
        res.json(projects);
    } catch (err) {
        console.error('Get projects error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single project
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const project = await db.getOne(
            'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (err) {
        console.error('Get project error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create or update project
app.post('/api/projects', authenticateToken, async (req, res) => {
    const { name, data, thumbnail, template, offset_top, offset_left } = req.body;

    if (!name || !data) {
        return res.status(400).json({ error: 'Missing name or project data' });
    }

    const offsetTop = offset_top !== undefined ? offset_top : 0;
    const offsetLeft = offset_left !== undefined ? offset_left : 0;

    try {
        // Check if project exists
        const existing = await db.getOne(
            'SELECT id FROM projects WHERE user_id = $1 AND name = $2',
            [req.user.id, name]
        );

        if (existing) {
            // Update existing
            await db.run(
                'UPDATE projects SET data = $1, thumbnail = $2, template = $3, offset_top = $4, offset_left = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
                [JSON.stringify(data), thumbnail || '', template || 'mug', offsetTop, offsetLeft, existing.id]
            );
            res.json({ id: existing.id, name, message: 'Project updated' });
        } else {
            // Create new
            const result = await db.query(
                'INSERT INTO projects (user_id, name, data, thumbnail, template, offset_top, offset_left) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [req.user.id, name, JSON.stringify(data), thumbnail || '', template || 'mug', offsetTop, offsetLeft]
            );
            res.status(201).json({ id: result.rows[0].id, name });
        }
    } catch (err) {
        console.error('Save project error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.run(
            'DELETE FROM projects WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project deleted' });
    } catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get all users (with profile data)
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await db.getAll(`
            SELECT u.id, u.email, u.role, u.plan_id, u.credits, u.account_status, u.created_at,
                   p.first_name, p.last_name,
                   s.name as plan_name
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN plans s ON u.plan_id = s.id
            ORDER BY u.created_at DESC
        `);
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user
app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    const { role, plan_id, account_status } = req.body;
    const { id } = req.params;

    try {
        await db.run(
            'UPDATE users SET role = COALESCE($1, role), plan_id = COALESCE($2, plan_id), account_status = COALESCE($3, account_status) WHERE id = $4',
            [role, plan_id, account_status, id]
        );
        res.json({ message: 'User updated' });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.run('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get admin stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const totalUsers = await db.getOne('SELECT COUNT(*) as total FROM users');
        const proUsers = await db.getOne("SELECT COUNT(*) as pro FROM users WHERE plan_id > 1 AND role = 'user'");
        const recentActivity = await db.getAll(
            'SELECT id, user_id, action, ip_address, timestamp FROM user_activity ORDER BY timestamp DESC LIMIT 10'
        );

        res.json({
            totalUsers: totalUsers?.total || 0,
            proUsers: proUsers?.pro || 0,
            recentActivity: recentActivity || []
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get admin settings
app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = await db.getAll('SELECT * FROM settings');
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json(settingsObj);
    } catch (err) {
        console.error('Get settings error:', err);
        // Return empty settings if table doesn't exist yet
        res.json({});
    }
});

// Update admin settings (POST for compatibility)
app.post('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = req.body; // { stripePublicKey: '...', stripeSecretKey: '...', stripeSandboxPublicKey: '...', etc. }
        
        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
            await db.run(
                'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
                [key, value]
            );
        }
        
        res.json({ success: true, message: 'Settings updated' });
    } catch (err) {
        console.error('Update settings error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update admin settings (PUT - legacy support)
app.put('/api/admin/settings', authenticateAdmin, async (req, res) => {
    const { key, value } = req.body;
    try {
        await db.run(
            'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
            [key, value]
        );
        res.json({ message: 'Settings updated' });
    } catch (err) {
        console.error('Update settings error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Test Stripe Connection
app.post('/api/admin/test-stripe', authenticateAdmin, async (req, res) => {
    const { stripeSecretKey } = req.body;
    
    if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
        return res.status(400).json({ success: false, error: 'Ungültiger Secret Key (muss mit sk_ beginnen)' });
    }

    try {
        const stripe = require('stripe')(stripeSecretKey);
        // Try to fetch balance as a test
        await stripe.balance.retrieve();
        res.json({ success: true, message: 'Verbindung erfolgreich!' });
    } catch (err) {
        console.error('Stripe test error:', err.message);
        res.json({ success: false, error: err.message });
    }
});

// Get subscription plans
app.get('/api/admin/plans', authenticateAdmin, async (req, res) => {
    try {
        const plans = await db.getAll('SELECT * FROM plans ORDER BY id');
        res.json(plans || [
            { id: 1, name: 'Free', price: 0, credits: 10 },
            { id: 2, name: 'Pro', price: 9.99, credits: 100 },
            { id: 3, name: 'Business', price: 29.99, credits: 500 }
        ]);
    } catch (err) {
        console.error('Get plans error:', err);
        // Return default plans if table doesn't exist
        res.json([
            { id: 1, name: 'Free', price: 0, credits: 10 },
            { id: 2, name: 'Pro', price: 9.99, credits: 100 },
            { id: 3, name: 'Business', price: 29.99, credits: 500 }
        ]);
    }
});

// Update plan
app.put('/api/admin/plans/:id', authenticateAdmin, async (req, res) => {
    const { name, price, credits } = req.body;
    const { id } = req.params;
    
    try {
        await db.run(
            'UPDATE plans SET name = COALESCE($1, name), price = COALESCE($2, price), credits = COALESCE($3, credits) WHERE id = $4',
            [name, price, credits, id]
        );
        res.json({ message: 'Plan updated' });
    } catch (err) {
        console.error('Update plan error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// ADMIN - TEMPLATE MANAGEMENT
// ============================================

// Get all templates + custom template analytics
app.get('/api/admin/templates', authenticateAdmin, async (req, res) => {
    try {
        // Standard-Templates
        const standardTemplates = await db.getAll(
            'SELECT * FROM templates WHERE is_standard = true ORDER BY name'
        );
        
        // Custom-Template-Analyse (gruppiert nach Größe)
        const customAnalysis = await db.getAll(`
            SELECT 
                width, 
                height,
                COUNT(DISTINCT created_by) as user_count,
                COUNT(*) as template_count,
                array_agg(DISTINCT name) as names
            FROM templates 
            WHERE is_standard = false
            GROUP BY width, height
            ORDER BY user_count DESC, template_count DESC
            LIMIT 20
        `);
        
        res.json({ standardTemplates, customAnalysis });
    } catch (err) {
        console.error('Get admin templates error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new standard template
app.post('/api/admin/templates', authenticateAdmin, async (req, res) => {
    const { name, width, height } = req.body;
    try {
        await db.run(
            'INSERT INTO templates (name, width, height, is_standard, created_by) VALUES ($1, $2, $3, true, $4)',
            [name, width, height, req.user.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Create template error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update template
app.put('/api/admin/templates/:id', authenticateAdmin, async (req, res) => {
    const { name, width, height } = req.body;
    try {
        await db.run(
            'UPDATE templates SET name = $1, width = $2, height = $3, updated_at = NOW() WHERE id = $4',
            [name, width, height, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Update template error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete template
app.delete('/api/admin/templates/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.run('DELETE FROM templates WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete template error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// FIX: Repair templates table schema (created_by UUID issue)
app.get('/api/admin/fix-templates-schema', authenticateAdmin, async (req, res) => {
    try {
        // Drop constraint if exists
        try { await db.run('ALTER TABLE templates DROP CONSTRAINT IF EXISTS templates_created_by_fkey'); } catch (e) {}
        
        // Re-create created_by as UUID (dropping data is acceptable as per user input "nothing saved yet")
        await db.run('ALTER TABLE templates DROP COLUMN IF EXISTS created_by');
        await db.run('ALTER TABLE templates ADD COLUMN created_by UUID REFERENCES users(id)');
        
        // Create indexes again
        await db.run('CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(created_by)');

        // Migration: Add legal_form to user_profiles if missing
        try {
            await db.run('ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS legal_form VARCHAR(50)');
        } catch (e) { console.log('legal_form column might already exist'); }

        // CLEANUP: Delete standard templates from database (they are now hardcoded in frontend)
        // This ensures "My Profiles" is empty as requested.
        await db.run('DELETE FROM templates WHERE is_standard = true OR created_by IS NULL');

        res.json({ success: true, message: 'Templates schema fixed and standard templates removed from DB' });
    } catch (err) {
        console.error('Fix templates schema error:', err);
        res.status(500).json({ error: err.message });
    }
});

// TEMPORARY: Run CRM migration
app.get('/api/admin/migrate-crm', authenticateAdmin, async (req, res) => {
    try {
        // 1. Enable pgcrypto (might fail if not superuser, but usually allowed in hosted dbs)
        try { await db.run('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'); } catch (e) { console.log('Extension warning:', e.message); }

        // 2. Extend Users Table
        await db.run('ALTER TABLE users ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT gen_random_uuid()');
        await db.run('ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_number VARCHAR(20) UNIQUE');
        await db.run('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false');
        await db.run('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(100)');

        // 3. Create Sequence
        await db.run('CREATE SEQUENCE IF NOT EXISTS customer_number_seq START 1000');

        // 4. User Profiles Table
        await db.run(`
            CREATE TABLE IF NOT EXISTS user_profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                salutation VARCHAR(20),
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                company_name VARCHAR(150),
                vat_id VARCHAR(50),
                phone VARCHAR(50),
                mobile VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Addresses Table
        await db.run(`
            CREATE TABLE IF NOT EXISTS addresses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(20) NOT NULL,
                street VARCHAR(150),
                house_number VARCHAR(20),
                address_addition VARCHAR(100),
                zip_code VARCHAR(20),
                city VARCHAR(100),
                country VARCHAR(100) DEFAULT 'Deutschland',
                is_default BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 6. Indices (Ignore errors if exist)
        try { await db.run('CREATE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id)'); } catch(e){}
        try { await db.run('CREATE INDEX IF NOT EXISTS idx_users_customer_number ON users(customer_number)'); } catch(e){}

        // 7. Migrate Existing Users
        const users = await db.getAll('SELECT id FROM users WHERE customer_number IS NULL');
        for (const user of users) {
            // Generate KD Number
            const seq = await db.getOne("SELECT nextval('customer_number_seq') as num");
            const kdNr = `KD-${String(seq.num).padStart(6, '0')}`;
            
            // Create Profile
            await db.run('INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [user.id]);
            
            // Update User
            await db.run('UPDATE users SET customer_number = $1 WHERE id = $2', [kdNr, user.id]);
        }

        res.json({ success: true, message: 'CRM Migration completed' });
    } catch (err) {
        console.error('Migration error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Promote custom template to standard
app.post('/api/admin/templates/promote', authenticateAdmin, async (req, res) => {
    const { width, height, name } = req.body;
    try {
        await db.run(
            'INSERT INTO templates (name, width, height, is_standard, created_by) VALUES ($1, $2, $3, true, $4)',
            [name, width, height, req.user.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Promote template error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// TEMPLATES ENDPOINT
// ============================================



app.get('/api/templates', authenticateToken, async (req, res) => {
    try {
        // Standard-Templates (für alle sichtbar)
        const standardTemplates = await db.getAll(
            'SELECT id, name, width, height FROM templates WHERE is_standard = true ORDER BY name'
        );
        
        // User-eigene Custom-Templates
        const customTemplates = await db.getAll(
            'SELECT id, name, width, height FROM templates WHERE created_by = $1 AND is_standard = false ORDER BY name',
            [req.user.id]
        );
        
        res.json([...standardTemplates, ...customTemplates]);
    } catch (err) {
        console.error('Get templates error:', err);
        // Fallback zu Standard-Templates wenn Tabelle nicht existiert
        res.json([
            { id: 'mug', name: 'Tasse (Standard)', width: 800, height: 380 },
            { id: 'bottle', name: 'Flasche', width: 720, height: 480 },
            { id: 'shirt', name: 'T-Shirt', width: 1000, height: 1200 }
        ]);
    }
});

// ============================================
// PRINT HISTORY ENDPOINT
// ============================================

// Create custom template (user)
app.post('/api/templates', authenticateToken, async (req, res) => {
    const { name, width, height } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO templates (name, width, height, is_standard, created_by) VALUES ($1, $2, $3, false, $4) RETURNING id',
            [name, width, height, req.user.id]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error('Create custom template error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete custom template (user)
app.delete('/api/templates/:id', authenticateToken, async (req, res) => {
    try {
        await db.run(
            'DELETE FROM templates WHERE id = $1 AND created_by = $2 AND is_standard = false',
            [req.params.id, req.user.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Delete custom template error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================

app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const history = await db.getAll(
            'SELECT id, file_name, format, timestamp FROM print_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 50',
            [req.user.id]
        );
        res.json(history);
    } catch (err) {
        console.error('Get history error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// DEPLOYMENT MANAGEMENT ENDPOINTS
// ============================================

// Trigger deployment
app.post('/api/admin/deploy', authenticateAdmin, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Record deployment start
        const result = await db.query(
            'INSERT INTO deployment_history (triggered_by, status, branch) VALUES ($1, $2, $3) RETURNING id',
            [userId, 'running', 'main']
        );
        
        // Trigger GitHub Actions workflow
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
            return res.json({ 
                success: true, 
                message: 'Deployment triggered locally (GitHub token not configured)',
                deploymentId: result.rows[0].id
            });
        }
        
        const response = await fetch(
            'https://api.github.com/repos/DeveloperMdIt/sublymaster/actions/workflows/deploy.yml/dispatches',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ref: 'main' })
            }
        );
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        
        res.json({ 
            success: true, 
            message: 'Deployment triggered!',
            deploymentId: result.rows[0].id
        });
    } catch (err) {
        console.error('Deploy error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get deployment history
app.get('/api/admin/deployments', authenticateAdmin, async (req, res) => {
    try {
        const deployments = await db.getAll(`
            SELECT 
                d.id, 
                d.status, 
                d.branch,
                d.commit_hash,
                d.started_at, 
                d.completed_at,
                d.error_message,
                u.email as triggered_by_email
            FROM deployment_history d
            LEFT JOIN users u ON d.triggered_by = u.id
            ORDER BY d.started_at DESC
            LIMIT 50
        `);
        res.json(deployments || []);
    } catch (err) {
        console.error('Get deployments error:', err);
        res.json([]);
    }
});

// ============================================
// Start Server
// ============================================

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connection...');
    await db.close();
    process.exit(0);
});
