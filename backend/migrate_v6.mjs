import pool from './database.js';

async function migrate() {
    try {
        await pool.query('BEGIN');
        
        await pool.query(`ALTER TABLE Bookings DROP COLUMN IF EXISTS scheduled_start;`);
        await pool.query(`ALTER TABLE Bookings DROP COLUMN IF EXISTS scheduled_end;`);
        await pool.query(`ALTER TABLE Bookings ADD COLUMN IF NOT EXISTS start_time TIMESTAMP;`);
        await pool.query(`ALTER TABLE Bookings ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;`);
        
        // Add dynamic constraint locking logic safely resolving inside transactions
        await pool.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'check_booking_times'
            ) THEN
              ALTER TABLE Bookings ADD CONSTRAINT check_booking_times CHECK (end_time > start_time);
            END IF;
          END $$;
        `);
        
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_bookings_time ON Bookings(worker_id, start_time, end_time);`);
        await pool.query('COMMIT');
        
        console.log('Version 6 Migrations (Worker Availability Extractor) applied successfully.');
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Migration V6 failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
