import pool from './database.js';

async function migrate() {
    try {
        await pool.query('BEGIN');
        
        await pool.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'unique_customer_user_id'
            ) THEN
              ALTER TABLE Customers ADD CONSTRAINT unique_customer_user_id UNIQUE (user_id);
            END IF;
          END $$;
        `);
        
        await pool.query('COMMIT');
        console.log('Version 7 Migrations (Strict Authorization and Dual-Role Race Limits) applied successfully.');
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Migration V7 failed:', err);
    } finally {
        await pool.end();
    }
}
migrate();
