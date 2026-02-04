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

        // Insert user
        const result = await db.query(
            'INSERT INTO users (email, password, role, plan_id, credits) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [email, hashedPassword, 'user', plan_id, initial_credits]
        );

        const userId = result.rows[0].id;

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
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!email || !password) {
        return res.status(400).json({ error: 'Bitte Email und Passwort angeben' });
    }

    try {
        // Get user
        const user = await db.getOne('SELECT * FROM users WHERE email = $1', [email]);
        
        if (!user) {
            return res.status(400).json({ error: 'Benutzer nicht gefunden' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Ungültiges Passwort' });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                plan_id: user.plan_id,
                account_status: user.account_status
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log activity
        await db.run(
            'INSERT INTO user_activity (user_id, action, ip_address) VALUES ($1, $2, $3)',
            [user.id, 'LOGIN', ip]
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
                default_offset: user.default_offset || 0
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

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.getOne(
            'SELECT id, email, role, plan_id, credits, printer_model, default_offset, account_status FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update User Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    const { printer_model, default_offset } = req.body;

    try {
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (printer_model !== undefined) {
            updates.push(`printer_model = $${paramCount++}`);
            params.push(printer_model);
        }
        if (default_offset !== undefined) {
            updates.push(`default_offset = $${paramCount++}`);
            params.push(default_offset);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(req.user.id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`;

        await db.run(query, params);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
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

// Get all users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await db.getAll(
            'SELECT id, email, role, plan_id, credits, account_status, created_at FROM users ORDER BY created_at DESC'
        );
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

// Update admin settings
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

// TEMPORARY: Run templates migration
app.get('/api/admin/migrate-templates', authenticateAdmin, async (req, res) => {
    try {
        // Create templates table
        await db.run(`
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
        
        // Create indexes
        await db.run(`CREATE INDEX IF NOT EXISTS idx_templates_standard ON templates(is_standard)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_templates_size ON templates(width, height)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(created_by)`);
        
        // Insert initial templates
        await db.run(`
            INSERT INTO templates (name, width, height, is_standard) 
            SELECT * FROM (VALUES
                ('Tasse (Standard)', 800, 380, true),
                ('Flasche', 720, 480, true),
                ('T-Shirt', 1000, 1200, true)
            ) AS v(name, width, height, is_standard)
            WHERE NOT EXISTS (
                SELECT 1 FROM templates WHERE is_standard = true LIMIT 1
            )
        `);
        
        // Add columns to projects
        await db.run(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_width INTEGER`);
        await db.run(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_height INTEGER`);
        
        res.json({ success: true, message: 'Migration completed' });
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
