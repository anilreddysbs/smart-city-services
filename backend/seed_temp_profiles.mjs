import bcrypt from 'bcryptjs';
import pool from './database.js';

const workerCategories = [
  'Electrician',
  'Plumber',
  'Painter',
  'Construction Worker',
  'Maintenance Worker'
];

const workerLocations = [
  'Pydiparru',
  'Velpuru',
  'Peravali',
  'Duvva',
  'Tetali',
  'Relangi',
  'Iragavaram',
  'Ajjaram',
  'Siddhantam',
  'Kavalipuram'
];

const customerLocations = [
  'Attili',
  'Manchili',
  'Maruteru',
  'Penugonda',
  'Aravalli',
  'Undi',
  'Palakollu',
  'Pippara',
  'Vadapalli',
  'Achanta'
];

async function seedTempProfiles() {
  const defaultPassword = process.argv[2] || 'Temp@12345';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const client = await pool.connect();

  let insertedWorkers = 0;
  let insertedCustomers = 0;

  try {
    await client.query('BEGIN');

    for (let i = 0; i < workerLocations.length; i += 1) {
      const idx = i + 1;
      const name = `Temp Worker ${idx}`;
      const email = `temp.worker${idx}@smartcity.local`;
      const phone = `9000001${String(idx).padStart(3, '0')}`;
      const role = 'Worker';
      const category = workerCategories[i % workerCategories.length];
      const experience = 2 + i;
      const location = workerLocations[i];

      const userInsert = await client.query(
        `INSERT INTO Users (name, email, phone, password, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [name, email, phone, passwordHash, role]
      );

      if (userInsert.rows.length > 0) {
        const userId = userInsert.rows[0].id;
        await client.query(
          `INSERT INTO Workers (user_id, category, experience, location, verification_status)
           VALUES ($1, $2, $3, $4, 'Verified')
           ON CONFLICT DO NOTHING`,
          [userId, category, experience, location]
        );
        insertedWorkers += 1;
      }
    }

    for (let i = 0; i < customerLocations.length; i += 1) {
      const idx = i + 1;
      const name = `Temp Customer ${idx}`;
      const email = `temp.customer${idx}@smartcity.local`;
      const phone = `9000002${String(idx).padStart(3, '0')}`;
      const role = 'Customer';
      const location = customerLocations[i];

      const userInsert = await client.query(
        `INSERT INTO Users (name, email, phone, password, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [name, email, phone, passwordHash, role]
      );

      if (userInsert.rows.length > 0) {
        const userId = userInsert.rows[0].id;
        await client.query(
          `INSERT INTO Customers (user_id, location)
           VALUES ($1, $2)
           ON CONFLICT (user_id) DO NOTHING`,
          [userId, location]
        );
        insertedCustomers += 1;
      }
    }

    await client.query('COMMIT');
    console.log('Temporary profiles seeded successfully.');
    console.log(`Inserted workers: ${insertedWorkers}`);
    console.log(`Inserted customers: ${insertedCustomers}`);
    console.log(`Default password for all temp users: ${defaultPassword}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedTempProfiles();
