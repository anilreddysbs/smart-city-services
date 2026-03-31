import pool from './database.js';

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE workers 
            ADD COLUMN IF NOT EXISTS trust_score NUMERIC(5,2) DEFAULT 0.0,
            ADD COLUMN IF NOT EXISTS total_jobs INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS completion_rate NUMERIC(5,2) DEFAULT 100.0,
            ADD COLUMN IF NOT EXISTS disputes INTEGER DEFAULT 0;
            
            CREATE TABLE IF NOT EXISTS job_history (
                id SERIAL PRIMARY KEY,
                worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
                booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
                service_type TEXT,
                rating INTEGER,
                completed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS worker_certifications (
                id SERIAL PRIMARY KEY,
                worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
                certification_name TEXT NOT NULL,
                verification_status TEXT DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Rejected'))
            );
        `);
        console.log('Version 2 Database Migrations applied successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
