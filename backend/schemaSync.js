import { fileURLToPath } from 'url';
import pool from './database.js';

const serviceRates = [
  ['Electrician', 200],
  ['Plumber', 150],
  ['Painter', 150],
  ['Construction Worker', 100],
  ['Maintenance Worker', 100]
];

const run = async (client, sql) => {
  await client.query(sql);
};

export const ensureSchema = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await run(client, `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('Customer', 'Worker', 'Admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category TEXT NOT NULL CHECK (category IN ('Electrician', 'Plumber', 'Painter', 'Construction Worker', 'Maintenance Worker')),
        experience INTEGER NOT NULL DEFAULT 0,
        location TEXT NOT NULL DEFAULT '',
        verification_status TEXT NOT NULL DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
        trust_score NUMERIC(5,2) DEFAULT 0.0,
        total_jobs INTEGER DEFAULT 0,
        completion_rate NUMERIC(5,2) DEFAULT 100.0,
        disputes INTEGER DEFAULT 0,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        is_deleted BOOLEAN DEFAULT FALSE
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        location TEXT DEFAULT '',
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        is_deleted BOOLEAN DEFAULT FALSE
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        service_name TEXT NOT NULL,
        hourly_rate NUMERIC(10,2) DEFAULT 0
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
        service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
        requested_category TEXT,
        description TEXT,
        booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'Pending',
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        due_by TIMESTAMP,
        priority TEXT DEFAULT 'Normal',
        priority_fee NUMERIC(10,2) DEFAULT 0,
        total_price NUMERIC(10,2) DEFAULT 0,
        customer_location TEXT DEFAULT '',
        customer_latitude DECIMAL(10,8),
        customer_longitude DECIMAL(11,8),
        is_deleted BOOLEAN DEFAULT FALSE
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review TEXT,
        is_deleted BOOLEAN DEFAULT FALSE
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS job_history (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        service_type TEXT,
        rating INTEGER,
        completed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS worker_certifications (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
        certification_name TEXT NOT NULL,
        verification_status TEXT DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Rejected'))
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS service_demand_stats (
        id SERIAL PRIMARY KEY,
        service_category TEXT,
        location TEXT,
        week_number INTEGER,
        request_count INTEGER DEFAULT 0,
        predicted_demand INTEGER DEFAULT 0
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS worker_alerts (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        alert_message TEXT,
        status TEXT DEFAULT 'Unread',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS worker_performance (
        id SERIAL PRIMARY KEY,
        worker_id INTEGER REFERENCES workers(id) ON DELETE CASCADE,
        total_jobs INTEGER DEFAULT 0,
        average_rating NUMERIC(5,2) DEFAULT 0.0,
        monthly_jobs INTEGER DEFAULT 0,
        trust_score NUMERIC(5,2) DEFAULT 0.0
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS community_subscriptions (
        id SERIAL PRIMARY KEY,
        community_name TEXT,
        service_category TEXT,
        subscription_type TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS subscription_bookings (
        id SERIAL PRIMARY KEY,
        subscription_id INTEGER REFERENCES community_subscriptions(id) ON DELETE CASCADE,
        worker_id INTEGER REFERENCES workers(id) ON DELETE SET NULL,
        scheduled_date TIMESTAMP,
        status TEXT DEFAULT 'Scheduled'
      );
    `);

    await run(client, `
      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        category TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await run(client, `
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

    await run(client, `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;`);

    await run(client, `ALTER TABLE workers ADD COLUMN IF NOT EXISTS trust_score NUMERIC(5,2) DEFAULT 0.0;`);
    await run(client, `ALTER TABLE workers ADD COLUMN IF NOT EXISTS total_jobs INTEGER DEFAULT 0;`);
    await run(client, `ALTER TABLE workers ADD COLUMN IF NOT EXISTS completion_rate NUMERIC(5,2) DEFAULT 100.0;`);
    await run(client, `ALTER TABLE workers ADD COLUMN IF NOT EXISTS disputes INTEGER DEFAULT 0;`);
    await run(client, `ALTER TABLE workers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);`);
    await run(client, `ALTER TABLE workers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);`);
    await run(client, `ALTER TABLE workers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;`);

    await run(client, `ALTER TABLE customers ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';`);
    await run(client, `ALTER TABLE customers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);`);
    await run(client, `ALTER TABLE customers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);`);
    await run(client, `ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;`);

    await run(client, `ALTER TABLE services ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2) DEFAULT 0;`);

    await run(client, `ALTER TABLE bookings ALTER COLUMN worker_id DROP NOT NULL;`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS requested_category TEXT;`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_time TIMESTAMP;`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS due_by TIMESTAMP;`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS priority_fee NUMERIC(10,2) DEFAULT 0;`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2) DEFAULT 0;`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_location TEXT DEFAULT '';`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_latitude DECIMAL(10,8);`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_longitude DECIMAL(11,8);`);
    await run(client, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;`);

    await run(client, `ALTER TABLE ratings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;`);

    await run(client, `ALTER TABLE worker_alerts ADD COLUMN IF NOT EXISTS booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE;`);
    await run(client, `ALTER TABLE worker_alerts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`);

    await run(client, `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'unique_customer_user_id'
        ) THEN
          ALTER TABLE customers ADD CONSTRAINT unique_customer_user_id UNIQUE (user_id);
        END IF;
      EXCEPTION
        WHEN unique_violation THEN NULL;
      END $$;
    `);

    await run(client, `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'ratings_booking_id_key'
        ) THEN
          ALTER TABLE ratings ADD CONSTRAINT ratings_booking_id_key UNIQUE (booking_id);
        END IF;
      EXCEPTION
        WHEN unique_violation THEN NULL;
      END $$;
    `);

    await run(client, `ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;`);
    await run(client, `
      ALTER TABLE bookings
      ADD CONSTRAINT bookings_status_check
      CHECK (status IN ('Pending', 'Accepted', 'Completed', 'Cancelled')) NOT VALID;
    `);

    await run(client, `ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_priority_check;`);
    await run(client, `
      ALTER TABLE bookings
      ADD CONSTRAINT bookings_priority_check
      CHECK (priority IN ('Normal', 'Emergency')) NOT VALID;
    `);

    await run(client, `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'check_booking_times'
        ) THEN
          ALTER TABLE bookings
          ADD CONSTRAINT check_booking_times
          CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time) NOT VALID;
        END IF;
      END $$;
    `);

    await run(client, `CREATE INDEX IF NOT EXISTS idx_workers_cat_status ON workers(category, verification_status);`);
    await run(client, `CREATE INDEX IF NOT EXISTS idx_bookings_worker_status ON bookings(worker_id, status);`);
    await run(client, `CREATE INDEX IF NOT EXISTS idx_ratings_booking_id ON ratings(booking_id);`);
    await run(client, `CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings(worker_id, start_time, end_time);`);
    await run(client, `CREATE INDEX IF NOT EXISTS idx_worker_alerts_active ON worker_alerts(worker_id, is_active, created_at DESC);`);
    await run(client, `CREATE INDEX IF NOT EXISTS idx_bookings_priority ON bookings(priority, status, booking_date DESC);`);

    for (const [name, rate] of serviceRates) {
      await client.query(
        `UPDATE services
         SET hourly_rate = $2
         WHERE service_name = $1`,
        [name, rate]
      );

      await client.query(
        `INSERT INTO services (service_name, hourly_rate)
         SELECT $1, $2
         WHERE NOT EXISTS (
           SELECT 1 FROM services WHERE service_name = $1
         )`,
        [name, rate]
      );
    }

    await client.query('COMMIT');
    console.log('Schema sync completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  ensureSchema()
    .then(async () => {
      await pool.end();
    })
    .catch(async (error) => {
      console.error('Schema sync failed:', error);
      await pool.end();
      process.exit(1);
    });
}
