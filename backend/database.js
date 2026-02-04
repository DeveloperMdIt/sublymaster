// PostgreSQL Database Helper
// Wraps pg.Pool with promise-based query methods

const { Pool } = require('pg');

class Database {
    constructor(connectionString) {
        this.pool = new Pool({
            connectionString: connectionString,
            max: 20, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle PostgreSQL client', err);
        });
    }

    async query(text, params) {
        const start = Date.now();
        try {
            const res = await this.pool.query(text, params);
            const duration = Date.now() - start;
            // console.log('Executed query', { text, duration, rows: res.rowCount });
            return res;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    async getOne(text, params) {
        const res = await this.query(text, params);
        return res.rows[0] || null;
    }

    async getAll(text, params) {
        const res = await this.query(text, params);
        return res.rows;
    }

    async run(text, params) {
        const res = await this.query(text, params);
        return res;
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = Database;
