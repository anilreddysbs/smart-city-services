import pool from '../database.js';

export const createRating = async (req, res) => {
  const { booking_id, rating, review } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bookRes = await client.query('SELECT status FROM Bookings WHERE id = $1', [booking_id]);
    if (bookRes.rows.length === 0 || bookRes.rows[0].status !== 'Completed') {
       await client.query('ROLLBACK');
       return res.status(400).json({ message: 'Can only submit ratings on specifically completed jobs' });
    }

    await client.query(
      'INSERT INTO Ratings (booking_id, rating, review) VALUES ($1, $2, $3)',
      [booking_id, rating, review]
    );

    await client.query('UPDATE job_history SET rating = $1 WHERE booking_id = $2', [rating, booking_id]);

    const bookingRes = await client.query('SELECT worker_id FROM Bookings WHERE id = $1', [booking_id]);
    if (bookingRes.rows.length > 0) {
       const workerId = bookingRes.rows[0].worker_id;
       const ratingEffect = (rating >= 4) ? 2 : (rating === 3 ? 0 : -3);
       await client.query('UPDATE Workers SET trust_score = LEAST(trust_score + $1, 100) WHERE id = $2', [ratingEffect, workerId]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Rating logic and ledger successfully updated via atomic transaction' });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.constraint === 'ratings_booking_id_key') return res.status(400).json({ message: 'Rating already exists securely.' });
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
