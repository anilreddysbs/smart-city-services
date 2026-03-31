import pool from './database.js';

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS service_demand_stats (
                id SERIAL PRIMARY KEY,
                service_category TEXT,
                location TEXT,
                week_number INTEGER,
                request_count INTEGER DEFAULT 0,
                predicted_demand INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS worker_alerts (
                id SERIAL PRIMARY KEY,
                worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
                alert_message TEXT,
                status TEXT DEFAULT 'Unread',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS worker_performance (
                id SERIAL PRIMARY KEY,
                worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
                total_jobs INTEGER DEFAULT 0,
                average_rating NUMERIC(5,2) DEFAULT 0.0,
                monthly_jobs INTEGER DEFAULT 0,
                trust_score NUMERIC(5,2) DEFAULT 0.0
            );

            CREATE TABLE IF NOT EXISTS community_subscriptions (
                id SERIAL PRIMARY KEY,
                community_name TEXT,
                service_category TEXT,
                subscription_type TEXT,
                start_date TIMESTAMP,
                end_date TIMESTAMP,
                customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS subscription_bookings (
                id SERIAL PRIMARY KEY,
                subscription_id INTEGER REFERENCES community_subscriptions(id) ON DELETE CASCADE,
                worker_id INTEGER REFERENCES workers(id) ON DELETE SET NULL,
                scheduled_date TIMESTAMP,
                status TEXT DEFAULT 'Scheduled'
            );
        `);
        console.log('Version 4 Database Migrations applied successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
