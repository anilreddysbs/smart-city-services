import pool from '../database.js';

export const getUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM Users WHERE is_deleted = false');
    const total = parseInt(countRes.rows[0].count);
    
    const users = await pool.query('SELECT id, name, email, phone, role, created_at FROM Users WHERE is_deleted = false ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ success: true, data: { users: users.rows, total, page, pages: Math.ceil(total / limit) }, error: null });
  } catch (err) {
    next(err);
  }
};

export const verifyWorker = async (req, res) => {
  const { worker_id, status } = req.body;
  try {
    await pool.query('UPDATE Workers SET verification_status = $1 WHERE id = $2', [status, worker_id]);
    res.json({ message: `Worker status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPendingWorkers = async (req, res) => {
  try {
    const workers = await pool.query(`
      SELECT w.id, u.name, u.email, w.category, w.experience, w.location, w.verification_status 
      FROM Workers w
      JOIN Users u ON w.user_id = u.id
      WHERE w.verification_status = 'Pending'
    `);
    res.json(workers.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Ratings WHERE booking_id IN (SELECT id FROM Bookings WHERE customer_id IN (SELECT id FROM Customers WHERE user_id = $1) OR worker_id IN (SELECT id FROM Workers WHERE user_id = $1))', [id]);
    await pool.query('DELETE FROM Bookings WHERE customer_id IN (SELECT id FROM Customers WHERE user_id = $1) OR worker_id IN (SELECT id FROM Workers WHERE user_id = $1)', [id]);
    await pool.query('DELETE FROM Workers WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM Customers WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM Users WHERE id = $1', [id]);
    res.json({ success: true, message: 'User permanently purged natively.' });
  } catch (err) {
    next(err);
  }
};
