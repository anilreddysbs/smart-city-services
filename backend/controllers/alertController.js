import pool from '../database.js';

export const getAlerts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.*,
        b.description,
        b.start_time,
        b.end_time,
        b.priority,
        b.customer_location,
        b.customer_latitude,
        b.customer_longitude,
        b.due_by
      FROM worker_alerts a
      JOIN workers w ON w.id = a.worker_id
      LEFT JOIN bookings b ON b.id = a.booking_id
      WHERE w.user_id = $1
        AND a.is_active = TRUE
        AND (b.id IS NULL OR (b.status = 'Pending' AND b.worker_id IS NULL))
      ORDER BY a.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const generateAlerts = async (req, res) => {
  try {
    const workers = await pool.query("SELECT id FROM workers WHERE category IN ('Electrician', 'Plumber')");
    for (let w of workers.rows) {
      await pool.query(
        "INSERT INTO worker_alerts (worker_id, alert_message, is_active) VALUES ($1, 'Surging local demand detected for your category!', TRUE)",
        [w.id]
      );
    }
    res.json({ message: 'Intelligence alerts generated and pushed directly to active workers.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
