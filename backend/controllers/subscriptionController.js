import pool from '../database.js';

export const createSubscription = async (req, res) => {
  const { community_name, service_category, subscription_type, start_date, end_date } = req.body;
  try {
    const custRes = await pool.query('SELECT id FROM customers WHERE user_id = $1', [req.user.id]);
    const customerId = custRes.rows[0]?.id;

    const result = await pool.query(`
      INSERT INTO community_subscriptions (community_name, service_category, subscription_type, start_date, end_date, customer_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, [community_name, service_category, subscription_type, start_date || new Date(), end_date, customerId]);
    res.status(201).json({ id: result.rows[0].id, message: 'Community service subscription locked.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const custRes = await pool.query('SELECT id FROM customers WHERE user_id = $1', [req.user.id]);
    const customerId = custRes.rows[0]?.id;

    const result = await pool.query('SELECT * FROM community_subscriptions WHERE customer_id = $1 ORDER BY id DESC', [customerId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
