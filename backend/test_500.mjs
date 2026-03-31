import pool from './database.js';

async function testUpdateBookingStatus() {
  const req = {
    params: { id: '189' },
    body: { status: 'Accepted' },
    user: { id: 1, role: 'Worker' }  // We need a valid worker user_id. Let's find one.
  };
  
  const client = await pool.connect();
  try {
    const workerQuery = await client.query("SELECT user_id, id, category FROM Workers WHERE verification_status = 'Verified' LIMIT 1");
    if (workerQuery.rows.length === 0) return console.log("No valid worker found.");
    
    const worker = workerQuery.rows[0];
    req.user.id = worker.user_id;

    // First create a pending booking for this test
    const bookingRes = await client.query(`
      INSERT INTO Bookings (customer_id, requested_category, start_time, end_time, booking_date, status)
      VALUES (
        (SELECT id FROM Customers LIMIT 1), 
        $1, 
        NOW(), 
        NOW() + interval '1 hour', 
        NOW(), 
        'Pending'
      ) RETURNING id
    `, [worker.category]);
    
    if (bookingRes.rows.length === 0) return console.log("Failed to insert dummy booking.");
    req.params.id = bookingRes.rows[0].id.toString();
    console.log("Testing with booking ID:", req.params.id, "and worker user_id:", req.user.id);

    // EXACT copy of your controller logic
    const { id } = req.params;
    const { status } = req.body;
    
    const bookingQuery = await client.query(`
      SELECT b.*,
             c.user_id as customer_uid,
             w.user_id as assigned_worker_uid
      FROM Bookings b
      JOIN Customers c ON b.customer_id = c.id
      LEFT JOIN Workers w ON b.worker_id = w.id
      WHERE b.id = $1
    `, [id]);
    
    if (bookingQuery.rows.length === 0) { console.log("Booking missing"); return; }
    const booking = bookingQuery.rows[0];

    await client.query('BEGIN');

    if (status === 'Accepted') {
      const workerRes = await client.query('SELECT id, category FROM workers WHERE user_id = $1', [req.user.id]);
      if (workerRes.rows.length === 0) throw new Error("Worker profile missing.");
      const workerProfile = workerRes.rows[0];

      if (booking.worker_id && booking.worker_id !== workerProfile.id) throw new Error("Another worker is assigned");
      if (booking.status !== 'Pending') throw new Error("Not pending");
      if (booking.requested_category && booking.requested_category !== workerProfile.category) throw new Error("Category mismatch");

      const conflictCheck = await client.query(`
        SELECT 1 FROM bookings
        WHERE worker_id = $1
          AND id != $4
          AND status IN ('Pending', 'Accepted')
          AND is_deleted = false
          AND (start_time < $3 AND end_time > $2)
      `, [workerProfile.id, booking.start_time, booking.end_time, id]);
      
      if (conflictCheck.rows.length > 0) throw new Error("Overlapping conflict");

      await client.query('UPDATE bookings SET worker_id = $1, status = $2 WHERE id = $3', [workerProfile.id, 'Accepted', id]);
      await client.query('UPDATE worker_alerts SET is_active = FALSE, status = $1 WHERE booking_id = $2', ['Read', id]);
      await client.query('COMMIT');
      
      console.log("SUCCESS! Booking accepted.");
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("EXPECTED ERROR FOUND:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

testUpdateBookingStatus();
