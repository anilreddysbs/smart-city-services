import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database.js';

export const register = async (req, res) => {
  const { name, email, phone, password, role, category, experience, location, latitude, longitude } = req.body;

  try {
    const existingUsers = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (existingUsers.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        'INSERT INTO Users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [name, email, phone, hashedPassword, role]
      );
      const userId = userResult.rows[0].id;

      if (role === 'Worker') {
        await client.query(
          'INSERT INTO Workers (user_id, category, experience, location, verification_status, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [userId, category, experience, location, 'Verified', latitude, longitude]
        );
      } else if (role === 'Customer') {
        await client.query('INSERT INTO Customers (user_id, location, latitude, longitude) VALUES ($1, $2, $3, $4)', [userId, location || '', latitude, longitude]);
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (users.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = users.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    let workerId = null;
    let customerId = null;
    if (user.role === 'Worker') {
      const workers = await pool.query('SELECT id FROM Workers WHERE user_id = $1', [user.id]);
      if (workers.rows.length > 0) workerId = workers.rows[0].id;
    } else if (user.role === 'Customer') {
      const customers = await pool.query('SELECT id FROM Customers WHERE user_id = $1', [user.id]);
      if (customers.rows.length > 0) customerId = customers.rows[0].id;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, workerId, customerId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, workerId, customerId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userRes = await pool.query('SELECT name, phone, email, role FROM Users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    let profile = userRes.rows[0];

    if (profile.role === 'Worker') {
      const workerRes = await pool.query(
        'SELECT location, experience, trust_score, total_jobs, completion_rate, latitude, longitude FROM Workers WHERE user_id = $1',
        [req.user.id]
      );
      if (workerRes.rows.length > 0) profile = { ...profile, ...workerRes.rows[0] };
    } else if (profile.role === 'Customer') {
      const custRes = await pool.query('SELECT location, latitude, longitude FROM Customers WHERE user_id = $1', [req.user.id]);
      if (custRes.rows.length > 0) profile = { ...profile, ...custRes.rows[0] };
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const { name, phone, location, experience, latitude, longitude } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE Users SET name = $1, phone = $2 WHERE id = $3', [name, phone, req.user.id]);
    
    if (req.user.role === 'Worker') {
      await client.query('UPDATE Workers SET location = $1, experience = $2, latitude = $3, longitude = $4 WHERE user_id = $5', [location, experience, latitude, longitude, req.user.id]);
    } else if (req.user.role === 'Customer') {
      await client.query('UPDATE Customers SET location = $1, latitude = $2, longitude = $3 WHERE user_id = $4', [location, latitude, longitude, req.user.id]);
    }
    await client.query('COMMIT');
    res.json({ message: 'Profile updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
