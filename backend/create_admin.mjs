import bcrypt from 'bcryptjs';
import pool from './database.js';

async function createAdmin() {
  const email = process.argv[2] || 'admin@smartcity.com';
  const password = process.argv[3] || 'admin123';
  const name = 'System Administrator';
  try {
    const pwd = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO Users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, 'Admin') ON CONFLICT DO NOTHING",
      [name, email, '0000', pwd]
    );
    console.log(`Admin account ${email} created or already exists.`);
  } catch(e) { console.error(e); } finally { await pool.end(); }
}
createAdmin();
