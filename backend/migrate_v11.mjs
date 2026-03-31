import pool from './database.js';

async function migrate() {
  try {
    await pool.query('BEGIN');

    // 1. Add hourly_rate to services table
    await pool.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2) DEFAULT 0;`);

    // 2. Update service rates
    const rates = [
      { name: 'Electrician', rate: 200 },
      { name: 'Plumber', rate: 150 },
      { name: 'Painter', rate: 150 },
      { name: 'Construction Worker', rate: 100 },
      { name: 'Maintenance Worker', rate: 100 }
    ];

    for (const { name, rate } of rates) {
      await pool.query(`UPDATE services SET hourly_rate = $1 WHERE service_name = $2`, [rate, name]);
    }

    // 3. Add total_price to bookings
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2) DEFAULT 0;`);

    // 4. Create Payments table for mock payment system
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
        amount NUMERIC(10,2) NOT NULL,
        payment_method TEXT DEFAULT 'Mock Transfer',
        status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Failed')),
        transaction_id TEXT UNIQUE DEFAULT 'TRX-' || floor(random() * 1000000)::text,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('COMMIT');
    console.log('Version 11 Migrations (Pricing & Payment Mock) applied successfully.');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Migration V11 failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
