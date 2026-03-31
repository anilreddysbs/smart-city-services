import pool from './database.js';

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE customers 
            ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';
        `);
        console.log('Version 3 Database Migrations (Location) applied successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
