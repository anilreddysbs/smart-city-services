import pool from '../database.js';

export const getServiceDemand = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_demand_stats ORDER BY predicted_demand DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const workers = await pool.query('SELECT COUNT(*) FROM workers');
    const bookings = await pool.query('SELECT COUNT(*) FROM bookings');
    const activeWorkers = await pool.query("SELECT COUNT(*) FROM workers WHERE verification_status = 'Verified'");
    
    const categoryQuery = await pool.query(`
      SELECT category, COUNT(id) as count FROM workers GROUP BY category
    `);

    res.json({
      totalWorkers: parseInt(workers.rows[0].count),
      activeWorkers: parseInt(activeWorkers.rows[0].count),
      totalBookings: parseInt(bookings.rows[0].count),
      distribution: categoryQuery.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
