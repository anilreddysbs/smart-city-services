import pool from './database.js';

async function migrate() {
  try {
    await pool.query('BEGIN');

    // Booking workflow upgrade: broadcast requests + emergency priority support.
    await pool.query(`ALTER TABLE bookings ALTER COLUMN worker_id DROP NOT NULL;`);
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS requested_category TEXT;`);
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';`);
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS priority_fee NUMERIC(10,2) DEFAULT 0;`);
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_location TEXT DEFAULT '';`);
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_latitude DECIMAL(10,8);`);
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_longitude DECIMAL(11,8);`);
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS due_by TIMESTAMP;`);

    await pool.query(`
      ALTER TABLE bookings
      DROP CONSTRAINT IF EXISTS bookings_priority_check;
    `);
    await pool.query(`
      ALTER TABLE bookings
      ADD CONSTRAINT bookings_priority_check
      CHECK (priority IN ('Normal', 'Emergency'));
    `);

    await pool.query(`
      ALTER TABLE bookings
      DROP CONSTRAINT IF EXISTS bookings_status_check;
    `);
    await pool.query(`
      ALTER TABLE bookings
      ADD CONSTRAINT bookings_status_check
      CHECK (status IN ('Pending', 'Accepted', 'Completed', 'Cancelled'));
    `);

    await pool.query(`ALTER TABLE worker_alerts ADD COLUMN IF NOT EXISTS booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE;`);
    await pool.query(`ALTER TABLE worker_alerts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_worker_alerts_active ON worker_alerts(worker_id, is_active, created_at DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_bookings_priority ON bookings(priority, status, booking_date DESC);`);

    await pool.query('COMMIT');
    console.log('Version 10 Migrations (Broadcast Booking + Emergency Priority) applied successfully.');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Migration V10 failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
