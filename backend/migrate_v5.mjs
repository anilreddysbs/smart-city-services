import pool from './database.js';

async function migrate() {
    try {
        await pool.query('BEGIN');
        
        // 1. UNIQUE Constraint on Ratings to fix race condition loop
        await pool.query('ALTER TABLE Ratings DROP CONSTRAINT IF EXISTS ratings_booking_id_key;');
        await pool.query('ALTER TABLE Ratings ADD CONSTRAINT ratings_booking_id_key UNIQUE (booking_id);');

        // 2. Add Soft Delete Flags
        const tables = ['Users', 'Workers', 'Customers', 'Bookings', 'Ratings', 'job_history'];
        for (const table of tables) {
            await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;`);
        }

        // 3. WorkerAvailability Infrastructure
        await pool.query(`
            CREATE TABLE IF NOT EXISTS WorkerAvailability (
                id SERIAL PRIMARY KEY,
                worker_id INTEGER REFERENCES Workers(id) ON DELETE CASCADE,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                is_booked BOOLEAN DEFAULT FALSE,
                CHECK (end_time > start_time)
            );
        `);

        // 4. Performance Indexes
        await pool.query('CREATE INDEX IF NOT EXISTS idx_workers_cat_status ON Workers(category, verification_status);');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_bookings_worker_status ON Bookings(worker_id, status);');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ratings_booking_id ON Ratings(booking_id);');

        await pool.query('COMMIT');
        console.log('Version 5 Hardening Migrations applied successfully.');
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Migration V5 failed:', err);
    } finally {
        await pool.end();
    }
}
migrate();
