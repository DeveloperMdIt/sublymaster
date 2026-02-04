const express = require('express');
const Database = require('./database');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-me';

// Middleware
app.use(cors());

// JSON Parser (Exclude Webhook for Raw Body)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    next();
  } else {
    express.json({ limit: '50mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// SQLite Database Setup
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/sublymaster';
const db = new Database(DATABASE_URL);

// Test connection
db.query('SELECT NOW()').then(() => {
    console.log('Connected to PostgreSQL database.');
}).catch(err => {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
});

async function initDb() {
    // Database initialization (PostgreSQL)
        // Users Table
        await db.run(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            plan_id INTEGER DEFAULT 1,
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Projects Table
        await db.run(`CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            name TEXT,
            thumbnail TEXT,
            template TEXT,
            data TEXT,
            offset_top REAL DEFAULT 0,
            offset_left REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Add offset columns if they don't exist (migration)
        await db.run(`ALTER TABLE projects ADD COLUMN offset_top REAL DEFAULT 0`, () => {});
        await db.run(`ALTER TABLE projects ADD COLUMN offset_left REAL DEFAULT 0`, () => {});

        // Settings Table (Key/Value pairs for things like Stripe keys)
        await db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`);

        // User Activity/History (IP Logging)
        await db.run(`CREATE TABLE IF NOT EXISTS user_activity (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            action TEXT NOT NULL,
            ip_address TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Custom Templates (User saved)
        await db.run(`CREATE TABLE IF NOT EXISTS templates (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            name TEXT NOT NULL,
            width INTEGER NOT NULL,
            height INTEGER NOT NULL,
            data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // System Print Templates (Tasse, Krug, etc.)
        await db.run(`CREATE TABLE IF NOT EXISTS print_templates (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            width_mm REAL NOT NULL,
            height_mm REAL NOT NULL,
            orientation TEXT DEFAULT 'portrait'
        )`, (err) => {
            if (!err) {
                 // Seed System Templates
                 try {
        const row = await db.getOne("SELECT count(*) as count FROM print_templates");
                    if (row && row.count === 0) {
                        await db.run("INSERT INTO print_templates (name, width_mm, height_mm, orientation) VALUES ('Standard Tasse', 200, 95, 'portrait')");
                        await db.run("INSERT INTO print_templates (name, width_mm, height_mm, orientation) VALUES ('Bierkrug', 230, 150, 'portrait')");
                        await db.run("INSERT INTO print_templates (name, width_mm, height_mm, orientation) VALUES ('Mousepad', 230, 190, 'landscape')");
                        console.log('Seeded Print Templates.');
                    }
                });
            }
        });

        // Subscription Plans
        await db.run(`CREATE TABLE IF NOT EXISTS plans (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            type TEXT NOT NULL, -- 'subscription' or 'credits'
            credits INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1
        )`, (err) => {
             if (!err) {
                 // Seed Default Plans if empty
                 try {
        const row = await db.getOne("SELECT count(*) as count FROM plans");
                    if (row && row.count === 0) {
                        await db.run("INSERT INTO plans (name, price, type, credits) VALUES ('Free', 0, 'subscription', 0)");
                        await db.run("INSERT INTO plans (name, price, type, credits) VALUES ('Pro Monthly', 9.99, 'subscription', 0)");
                        await db.run("INSERT INTO plans (name, price, type, credits) VALUES ('10er Karte', 15.00, 'credits', 10)");
                        console.log('Seeded Default Plans.');
                    }
                 });
             }
        });

        // Add account_status and offset/balance columns to users
        await db.run("ALTER TABLE users ADD COLUMN account_status TEXT DEFAULT 'active'", () => {});
        await db.run("ALTER TABLE users ADD COLUMN offset_top REAL DEFAULT 0", () => {});
        await db.run("ALTER TABLE users ADD COLUMN offset_left REAL DEFAULT 0", () => {});
        await db.run("ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 0", () => {});

        // New Columns for Printer Intelligence
        await db.run("ALTER TABLE users ADD COLUMN printer_model TEXT", () => {});
        await db.run("ALTER TABLE users ADD COLUMN default_offset REAL DEFAULT 0", () => {});

        // Print Logs (History)
        await db.run(`CREATE TABLE IF NOT EXISTS print_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            file_name TEXT,
            format TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Printer Models (Community Data)
        await db.run(`CREATE TABLE IF NOT EXISTS printer_models (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            brand TEXT,
            average_offset REAL DEFAULT 0,
            use_count INTEGER DEFAULT 0,
            is_verified INTEGER DEFAULT 0
        )`);

        // Print Feedback (Detailed logs)
        await db.run(`CREATE TABLE IF NOT EXISTS print_feedback (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            printer_model TEXT,
            used_offset REAL,
            status TEXT, -- 'success', 'failed'
            correction_value REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        console.log('Database tables verified/created.');
    });
}

// Helper for Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        // console.log("Auth Error: No token provided"); // Reduce noise
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // console.log("Auth Error: Invalid token", err.message);
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    res.send('Sublimaster Backend is running (SQLite Mode)!');
});

// Register Endpoint
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
        await db.getOne('SELECT id FROM users WHERE email = $1', [email], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) return res.status(400).json({ error: 'Email already exists' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await db.run('INSERT INTO users (email, password, role, plan_id, credits) VALUES ($1, $2, $3, $4, $5)', 
                [email, hashedPassword, 'user', plan_id, initial_credits], 
                function (err) {
                if (err) return res.status(500).json({ error: err.message });

                const userId = this.lastID;
                const token = jwt.sign({ 
                    id: userId, 
                    email: email, 
                    role: 'user', 
                    plan_id: plan_id,
                    credits: initial_credits 
                }, JWT_SECRET, { expiresIn: '1h' });

                // Log Activity
                await db.run('INSERT INTO user_activity (user_id, action, ip_address) VALUES ($1, $2, $3)', [userId, 'REGISTER', ip]);

                res.status(201).json({
                    message: 'User registered successfully',
                    token: token,
                    user: { id: userId, email: email, plan_id: plan_id, role: 'user', credits: initial_credits, printer_model: null, default_offset: 0 }
                });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!email || !password) {
        return res.status(400).json({ error: 'Bitte Email und Passwort angeben' });
    }

    try {
        await db.getOne('SELECT * FROM users WHERE email = $1', [email], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(400).json({ error: 'Benutzer nicht gefunden' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ error: 'Ungültiges Passwort' });

            const token = jwt.sign({ 
                id: user.id, 
                email: user.email, 
                role: user.role, 
                plan_id: user.plan_id,
                account_status: user.account_status 
            }, JWT_SECRET, { expiresIn: '1h' });

            // Log Activity
            await db.run('INSERT INTO user_activity (user_id, action, ip_address) VALUES ($1, $2, $3)', [user.id, 'LOGIN', ip]);

            res.json({
                message: 'Login erfolgreich',
                token,
                user: { 
                    id: user.id, 
                    email: user.email, 
                    plan_id: user.plan_id, 
                    role: user.role,
                    account_status: user.account_status,
                    printer_model: user.printer_model,
                    default_offset: user.default_offset || 0
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Profile (Printer Settings & More)
app.put('/api/user/profile', authenticateToken, (req, res) => {
    const { printer_model, default_offset } = req.body;
    
    // Build dynamic update query
    let updates = [];
    let params = [];
    
    if (printer_model !== undefined) {
        updates.push("printer_model = ?");
        params.push(printer_model);
    }
    if (default_offset !== undefined) {
        updates.push("default_offset = ?");
        params.push(default_offset);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(req.user.id);
    
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    await db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated successfully', changes: this.changes });
    });
});

// Update Profile (Printer Settings & More)
app.put('/api/user/profile', authenticateToken, (req, res) => {
    const { printer_model, default_offset } = req.body;
    
    // Build dynamic update query
    let updates = [];
    let params = [];
    
    if (printer_model !== undefined) {
        updates.push("printer_model = ?");
        params.push(printer_model);
    }
    if (default_offset !== undefined) {
        updates.push("default_offset = ?");
        params.push(default_offset);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(req.user.id);
    
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    await db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated successfully', changes: this.changes });
    });
});

// Templates API
app.get('/api/templates', authenticateToken, (req, res) => {
    try {
        const rows = await db.getAll('SELECT * FROM templates WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/templates', authenticateToken, (req, res) => {
    const { name, width, height, data } = req.body;
    
    if (!name || !width || !height) {
         return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.run('INSERT INTO templates (user_id, name, width, height, data) VALUES ($1, $2, $3, $4, $5)', 
        [req.user.id, name, width, height, JSON.stringify(data || {})], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, name, width, height });
        }
    );
});

// Projects API (Full Layouts)
app.get('/api/projects', authenticateToken, (req, res) => {
    console.log("Fetching project list for user:", req.user.id);
    try {
        const rows = await db.getAll('SELECT id, name, thumbnail, template, offset_top, offset_left, created_at, updated_at FROM projects WHERE user_id = $1 ORDER BY updated_at DESC', [req.user.id]);
        if (err) {
            console.error("Project List Error:", err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`Found ${rows.length} projects`);
        res.json(rows);
    });
});

app.get('/api/projects/:id', authenticateToken, (req, res) => {
    try {
        const row = await db.getOne('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Project not found' });
        res.json(row);
    });
});

app.post('/api/projects', authenticateToken, (req, res) => {
    const { name, data, thumbnail, template, offset_top, offset_left } = req.body;
    
    if (!name || !data) {
         return res.status(400).json({ error: 'Missing name or project data' });
    }

    const offsetTop = offset_top !== undefined ? offset_top : 0;
    const offsetLeft = offset_left !== undefined ? offset_left : 0;

    // Check if project with same name exists for this user
    try {
        const row = await db.getOne('SELECT id FROM projects WHERE user_id = $1 AND name = $2', [req.user.id, name]);
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Update existing project
            await db.run('UPDATE projects SET data = $1, thumbnail = $2, template = $3, offset_top = $4, offset_left = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
                [JSON.stringify(data), thumbnail || '', template || 'mug', offsetTop, offsetLeft, row.id],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    console.log(`Updated project ${row.id} (${name}) with offsets: top=${offsetTop}, left=${offsetLeft}`);
                    res.json({ id: row.id, name, message: 'Project overwritten' });
                }
            );
        } else {
            // Create new project
            await db.run('INSERT INTO projects (user_id, name, data, thumbnail, template, offset_top, offset_left) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
                [req.user.id, name, JSON.stringify(data), thumbnail || '', template || 'mug', offsetTop, offsetLeft], 
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    console.log(`Created new project ${this.lastID} (${name}) with offsets: top=${offsetTop}, left=${offsetLeft}`);
                    res.status(201).json({ id: this.lastID, name });
                }
            );
        }
    });
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    await db.run('DELETE FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Project not found or not authorized' });
        res.json({ message: 'Project deleted' });
    });
});

// Admin Middleware
const authenticateAdmin = (req, res, next) => {
    authenticateToken(req, res, () => {
        console.log("Admin Check: user=", req.user.email, "role=", req.user.role);
        if (req.user.role === 'admin') {
            next();
        } else {
            console.log("Admin Check Failed: Access denied");
            res.status(403).json({ error: 'Access denied: Admins only' });
        }
    });
};

// Admin Endpoints

// Get All Users
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
    try {
        const rows = await db.getAll(`SELECT id, email, role, plan_id, created_at FROM users`, []);
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update User (Disable, Change Plan, Role)
app.put('/api/admin/users/:id', authenticateAdmin, (req, res) => {
    const { role, plan_id, account_status } = req.body;
    const { id } = req.params;

    console.log(`Admin update user ${id}: role=${role}, plan_id=${plan_id}, status=${account_status}`);
    await db.run('UPDATE users SET role = COALESCE($1, role), plan_id = COALESCE($2, plan_id), account_status = COALESCE($3, account_status) WHERE id = $4', 
        [role, plan_id, account_status, id], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Benutzer aktualisiert', changes: this.changes });
        }
    );
});

// Delete User
app.delete('/api/admin/users/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    console.log(`Admin delete user ${id}`);
    
    // Optional: Delete related data first
    db.serialize(() => {
        await db.run('DELETE FROM projects WHERE user_id = $1', [id]);
        await db.run('DELETE FROM user_activity WHERE user_id = $1', [id]);
        await db.run('DELETE FROM users WHERE id = $1', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Benutzer gelöscht', changes: this.changes });
        });
    });
});

// Admin Stats
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
    const stats = {};
    console.log("Fetching admin stats...");
    
    try {
        const row = await db.getOne("SELECT COUNT(*) as total FROM users");
        if (err) {
            console.error("Stats Error (Total Users):", err);
            return res.status(500).json({ error: err.message });
        }
        stats.totalUsers = row $1 row.total : 0;
        console.log("Total Users:", stats.totalUsers);

        try {
        const row = await db.getOne("SELECT COUNT(*) as pro FROM users WHERE plan_id > 1 AND role = 'user'");
            if (err) return res.status(500).json({ error: err.message });
            stats.proUsers = row $2 row.pro : 0;

            try {
        const rows = await db.getAll("SELECT id, user_id, action, ip_address, timestamp FROM user_activity ORDER BY timestamp DESC LIMIT 10");
                 if (err) return res.status(500).json({ error: err.message });
                 stats.recentActivity = rows || [];
                 res.json(stats);
            });
        });
    });
});

// Settings API
app.get('/api/admin/settings', authenticateAdmin, (req, res) => {
    try {
        const rows = await db.getAll('SELECT * FROM settings', []);
        if (err) return res.status(500).json({ error: err.message });
        const settings = {};
        rows.forEach(row => { settings[row.key] = row.value; });
        res.json(settings);
    });
});

app.post('/api/admin/settings', authenticateAdmin, (req, res) => {
    const settings = req.body;
    console.log("Saving settings payload:", settings);

    const keys = Object.keys(settings);
    if (keys.length === 0) return res.json({ message: 'No settings to save' });

    db.serialize(() => {
        await db.run('BEGIN TRANSACTION');
        let completed = 0;
        let error = null;

        keys.forEach(key => {
            await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)', [key, String(settings[key])], (err) => {
                if (err) error = err;
                completed++;
                
                if (completed === keys.length) {
                    if (error) {
                        await db.run('ROLLBACK');
                        console.error("Save Error:", error);
                        res.status(500).json({ error: error.message });
                    } else {
                        await db.run('COMMIT', (err) => {
                            if (err) {
                                console.error("Commit Error:", err);
                                res.status(500).json({ error: err.message });
                            } else {
                                console.log("Settings saved successfully");
                                res.json({ message: 'Settings saved' });
                            }
                        });
                    }
                }
            });
        });
    });
});

    // User Settings (Calibration)
    app.get('/api/settings', authenticateToken, (req, res) => {
        try {
        const row = await db.getOne('SELECT offset_top, offset_left FROM users WHERE id = $1', [req.user.id]);
            if (err) return res.status(500).json({ error: err.message });
            res.json(row || { offset_top: 0, offset_left: 0 });
        });
    });

    app.put('/api/settings', authenticateToken, (req, res) => {
        const { offset_top, offset_left } = req.body;
        await db.run('UPDATE users SET offset_top = $1, offset_left = $2 WHERE id = $3', 
            [offset_top || 0, offset_left || 0, req.user.id], 
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Settings saved' });
            }
        );
    });

    // Admin: Plan Management
    app.get('/api/admin/plans', authenticateAdmin, (req, res) => {
        try {
        const rows = await db.getAll('SELECT * FROM plans', []);
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    app.post('/api/admin/plans', authenticateAdmin, (req, res) => {
        const { name, price, type, credits } = req.body;
        await db.run('INSERT INTO plans (name, price, type, credits) VALUES ($1, $2, $3, $4)', 
            [name, price, type, credits || 0], 
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, message: 'Plan created' });
            }
        );
    });

    app.put('/api/admin/plans/:id', authenticateAdmin, (req, res) => {
        const { name, price, type, credits, is_active } = req.body;
        const { id } = req.params;
        await db.run('UPDATE plans SET name = $1, price = $2, type = $3, credits = $4, is_active = $5 WHERE id = $6', 
            [name, price, type, credits, is_active, id], 
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Plan updated' });
            }
        );
    });

    // Test Stripe Connection
    app.post('/api/admin/test-stripe', authenticateAdmin, async (req, res) => {
        const { stripeSecretKey } = req.body;
        if (!stripeSecretKey) return res.status(400).json({ error: 'Secret Key is missing' });

        try {
            const stripe = require('stripe')(stripeSecretKey);
            await stripe.customers.list({ limit: 1 });
            res.json({ success: true, message: 'Stripe connection successful' });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    });

    // Stripe Checkout
    app.post('/api/checkout', authenticateToken, async (req, res) => {
        const { planId, priceId } = req.body;
        
        // Fetch Secret Key from Settings
        await db.getOne("SELECT value FROM settings WHERE key = 'stripe_secret_key'", async (err, row) => {
            if (!row || !row.value) return res.status(500).json({ error: 'Stripe not configured' });
            
            const stripe = require('stripe')(row.value);
            const domain = 'http://localhost:5173'; // Frontend URL

            try {
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card', 'paypal'],
                    line_items: [{
                        price: priceId, // e.g. 'price_123...'
                        quantity: 1,
                    }],
                    mode: 'payment', 
                    metadata: { 
                        userId: req.user.id, 
                        planId: planId 
                    },
                    success_url: `${domain}/success$1session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${domain}/dashboard`,
                });
                res.json({ url: session.url });
            } catch (stripeErr) {
                res.status(500).json({ error: stripeErr.message });
            }
        });
    });


    // Print Logging Endpoint
    app.post('/api/print/log', authenticateToken, (req, res) => {
        const { fileName, format } = req.body;
        console.log(`Print logged: User ${req.user.id}, File: ${fileName}, Format: ${format}`);
        
        // Log to user_activity or separate table if needed
        // For now just success
        // Also deduct credits if needed (handled in frontend optimistic, backend should validate)
        
        if (req.user.plan_id === 1) { // Free plan might not have credits to deduct, but credit packs do
             // Logic for handling credits based on plan type
        } else if (req.user.credits > 0) {
             await db.run('UPDATE users SET credits = credits - 1 WHERE id = $2', [req.user.id]);
        }
        
        res.json({ success: true });
    });

    // Stripe Webhook (Raw Body required)
    app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 
        
        let stripe;
        try {
            if (!endpointSecret) {
                console.log('Webhook Error: No STRIPE_WEBHOOK_SECRET in env');
                return res.status(400).send('Webhook Error: No secret');
            }
            stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy'); 
            
            let event;
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            } catch (err) {
                console.log(`Webhook Signature Error: ${err.message}`);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            // Handle Events
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                const { userId, planId } = session.metadata;
                console.log(`Payment success for User ${userId}, Plan ${planId}`);

                if (planId) {
                     if (planId === '10_credits_pack' || planId === 'credits_10') {
                        await db.run('UPDATE users SET credits = credits + 10, account_status = "active" WHERE id = $1', [userId]);
                     } else if (planId === 'pro_monthly') {
                         await db.run('UPDATE users SET plan_id = 2, account_status = "active" WHERE id = $1', [userId]);
                     }
                }
            } else if (event.type === 'invoice.payment_failed') {
                const session = event.data.object;
                const customerId = session.customer;
                console.log(`Payment failed for customer ${customerId}`);
                // await db.run('UPDATE users SET account_status = "suspended" WHERE stripe_customer_id = $1', [customerId]);
            }

            res.json({received: true});

        } catch (err) {
            console.error("Webhook Handler Error:", err);
            res.status(500).send("Server Error");
        }
    });

    // Printer Analytics API
    app.get('/api/printer/stats', (req, res) => {
        const { model } = req.query;
        if (!model) return res.status(400).json({ error: 'Model required' });

        try {
        const row = await db.getOne('SELECT average_offset, use_count FROM printer_models WHERE name = $1', [model]);
            if (err) return res.status(500).json({ error: err.message });
            res.json(row || { average_offset: null, use_count: 0 });
        });
    });

    app.post('/api/printer/feedback', authenticateToken, (req, res) => {
        const { printerModel, usedOffset, status, correctionValue } = req.body;
        
        // 1. Log Feedback
        await db.run('INSERT INTO print_feedback (user_id, printer_model, used_offset, status, correction_value) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, printerModel, usedOffset, status, correctionValue || 0],
            (err) => {
                if (err) console.error("Feedback Log Error", err);
            }
        );

        // 2. Update Community Stats (Simple rolling average approximation)
        if (status === 'success') {
             // In a real app we would recalculate properly, here we just increment use_count
             // and weighted average update
             try {
        const row = await db.getOne('SELECT * FROM printer_models WHERE name = $1', [printerModel]);
                 if (!row) {
                     // Create new
                     await db.run('INSERT INTO printer_models (name, average_offset, use_count) VALUES ($1, $2, 1)', [printerModel, usedOffset]);
                 } else {
                     // Update
                     const newCount = row.use_count + 1;
                     const newAvg = ((row.average_offset * row.use_count) + usedOffset) / newCount;
                     await db.run('UPDATE printer_models SET average_offset = $1, use_count = $2 WHERE id = $3', [newAvg, newCount, row.id]);
                 }
             });
        }

        res.json({ success: true });
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
