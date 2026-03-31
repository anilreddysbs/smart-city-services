import pool from '../database.js';

export const createBooking = async (req, res) => {
  const {
    service_id,
    requested_category,
    description,
    start_time,
    end_time,
    priority = 'Normal',
    customer_location = '',
    customer_latitude = null,
    customer_longitude = null,
    worker_id = null
  } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const start = new Date(start_time);
    const end = new Date(end_time);
    
    // Create a 24-hour buffer absorbing UTC timezone variations across clients natively
    const bufferDate = new Date();
    bufferDate.setHours(bufferDate.getHours() - 24);
    
    if (start < bufferDate) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Booking cannot be placed historically in the past.' });
    }
    if (end <= start) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'End time boundary must dynamically exceed start time interval.' });
    }

    const categories = ['Electrician', 'Plumber', 'Painter', 'Construction Worker', 'Maintenance Worker'];
    if (!requested_category || !categories.includes(requested_category)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Requested category is invalid.' });
    }

    let executing_customer_id;
    const fallbackCheck = await client.query('SELECT id FROM Customers WHERE user_id = $1', [req.user.id]);
    if (fallbackCheck.rows.length > 0) {
        executing_customer_id = fallbackCheck.rows[0].id;
    } else {
        // Handled dynamic parallel race execution using ON CONFLICT logic boundaries natively
        const newCustomerNode = await client.query(`
            INSERT INTO Customers (user_id, location) 
            VALUES ($1, $2) 
            ON CONFLICT (user_id) DO UPDATE SET location = EXCLUDED.location 
            RETURNING id
        `, [req.user.id, 'Dual-Role Operations']);
        executing_customer_id = newCustomerNode.rows[0].id;
    }

    let computedServiceId = service_id;
    let hourlyRate = 0;
    
    const serviceRes = await client.query('SELECT id, hourly_rate FROM services WHERE id = $1 OR service_name = $2 LIMIT 1', [computedServiceId, requested_category]);
    if (serviceRes.rows.length > 0) {
      computedServiceId = serviceRes.rows[0].id;
      hourlyRate = parseFloat(serviceRes.rows[0].hourly_rate || 0);
    } else {
      computedServiceId = 1;
    }

    const priorityNormalized = priority === 'Emergency' ? 'Emergency' : 'Normal';
    const emergencyFee = priorityNormalized === 'Emergency' ? 500 : 0;
    const dueBy = priorityNormalized === 'Emergency'
      ? new Date(new Date(start).setHours(23, 59, 59, 999))
      : end;

    const durationHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    const totalPrice = (hourlyRate * durationHours) + emergencyFee;

    const result = await client.query(
      `INSERT INTO Bookings (
        customer_id, worker_id, service_id, requested_category, description,
        start_time, end_time, due_by, priority, priority_fee, total_price, status, booking_date,
        customer_location, customer_latitude, customer_longitude
      )
      VALUES ($1, $13, $2, $3, $4, $5, $6, $7, $8, $9, $14, 'Pending', NOW(), $10, $11, $12)
      RETURNING *`,
      [
        executing_customer_id,
        computedServiceId,
        requested_category,
        description,
        start,
        end,
        dueBy,
        priorityNormalized,
        emergencyFee,
        customer_location,
        customer_latitude,
        customer_longitude,
        worker_id,
        totalPrice
      ]
    );

    let workersToAlert = [];
    if (worker_id) {
       workersToAlert = [{ id: worker_id }];
    } else {
       const workersRes = await client.query(
         `SELECT id FROM workers
          WHERE category = $1
            AND verification_status = 'Verified'
            AND is_deleted = false`,
         [requested_category]
       );
       workersToAlert = workersRes.rows;
    }

    for (const worker of workersToAlert) {
      await client.query(
        `INSERT INTO worker_alerts (worker_id, booking_id, alert_message, status, is_active)
         VALUES ($1, $2, $3, 'Unread', TRUE)`,
        [
          worker.id,
          result.rows[0].id,
          `${priorityNormalized} ${requested_category} request ${worker_id ? 'specifically for you' : 'near ' + (customer_location || 'your area')}`
        ]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Booking request broadcasted successfully',
      alerted_workers: workersToAlert.length
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};

export const getCustomerBookings = async (req, res) => {
  try {
    const customers = await pool.query('SELECT id FROM Customers WHERE user_id = $1', [req.user.id]);
    if (customers.rows.length === 0) return res.json([]);
    const customerId = customers.rows[0].id;

    const bookings = await pool.query(`
      SELECT
             b.*,
             COALESCE(w.category, b.requested_category) as category,
             COALESCE(u.name, 'Awaiting assignment') as worker_name,
             (r.id IS NOT NULL) as rating_submitted 
      FROM Bookings b 
      LEFT JOIN Workers w ON b.worker_id = w.id 
      LEFT JOIN Users u ON w.user_id = u.id 
      LEFT JOIN Ratings r ON b.id = r.booking_id
      WHERE b.customer_id = $1
      ORDER BY b.booking_date DESC
    `, [customerId]);
    res.json(bookings.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkerBookings = async (req, res) => {
  try {
    const workers = await pool.query('SELECT id, category FROM Workers WHERE user_id = $1', [req.user.id]);
    if (workers.rows.length === 0) return res.status(404).json({ message: 'Worker not found' });
    const worker = workers.rows[0];

    const bookings = await pool.query(`
      SELECT b.*, u.name as customer_name, u.phone as customer_phone
      FROM Bookings b 
      JOIN Customers c ON b.customer_id = c.id 
      JOIN Users u ON c.user_id = u.id 
      WHERE b.worker_id = $1
    `, [worker.id]);

    const openRequests = await pool.query(`
      SELECT b.*, u.name as customer_name, u.phone as customer_phone
      FROM Bookings b
      JOIN Customers c ON b.customer_id = c.id
      JOIN Users u ON c.user_id = u.id
      WHERE b.worker_id IS NULL
        AND b.status = 'Pending'
        AND b.requested_category = $1
      ORDER BY
        CASE WHEN b.priority = 'Emergency' THEN 0 ELSE 1 END,
        b.booking_date DESC
    `, [worker.category]);

    res.json([...openRequests.rows, ...bookings.rows]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  try {
    const bookingQuery = await client.query(`
      SELECT b.*,
             c.user_id as customer_uid,
             w.user_id as assigned_worker_uid
      FROM Bookings b
      JOIN Customers c ON b.customer_id = c.id
      LEFT JOIN Workers w ON b.worker_id = w.id
      WHERE b.id = $1
    `, [id]);
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Binding matrix absent.' });
    }
    const booking = bookingQuery.rows[0];

    await client.query('BEGIN');

    if (status === 'Accepted') {
      if (req.user.role !== 'Worker') {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Only workers can accept jobs.' });
      }

      const workerRes = await client.query('SELECT id, category FROM workers WHERE user_id = $1', [req.user.id]);
      if (workerRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Worker profile missing.' });
      }
      const worker = workerRes.rows[0];

      if (booking.worker_id && booking.worker_id !== worker.id) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'Another worker is already assigned to this request.' });
      }
      if (booking.status !== 'Pending') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Only pending requests can be accepted.' });
      }

      if (booking.requested_category && booking.requested_category !== worker.category) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Category mismatch for this request.' });
      }

      const conflictCheck = await client.query(`
        SELECT 1 FROM bookings
        WHERE worker_id = $1
          AND id != $4
          AND status IN ('Pending', 'Accepted')
          AND is_deleted = false
          AND (start_time < $3 AND end_time > $2)
      `, [worker.id, booking.start_time, booking.end_time, id]);
      if (conflictCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'You already have an overlapping assignment.' });
      }

      await client.query('UPDATE bookings SET worker_id = $1, status = $2 WHERE id = $3', [worker.id, 'Accepted', id]);
      await client.query('UPDATE worker_alerts SET is_active = FALSE, status = $1 WHERE booking_id = $2', ['Read', id]);
      await client.query('COMMIT');
      return res.json({ message: 'You are assigned to this booking now.' });
    }

    if (booking.assigned_worker_uid !== req.user.id && booking.customer_uid !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'You are not authorized for this booking.' });
    }

    if (!['Completed', 'Cancelled'].includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Unsupported status transition.' });
    }

    const updateQuery = status === 'Completed'
      ? 'UPDATE Bookings SET status = $1, end_time = NOW() WHERE id = $2'
      : 'UPDATE Bookings SET status = $1 WHERE id = $2';
    await client.query(updateQuery, [status, id]);

    if (status === 'Completed') {
      const bookingRes = await client.query(`
        SELECT b.worker_id, w.category as service_type
        FROM Bookings b
        JOIN Workers w ON b.worker_id = w.id
        WHERE b.id = $1
      `, [id]);
      const booking = bookingRes.rows[0];

      if (booking) {
        // Record job history
        await client.query(`
          INSERT INTO job_history (worker_id, booking_id, service_type)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [booking.worker_id, id, booking.service_type]);

        // Mock Payment Processing
        const paymentRes = await client.query(`
          INSERT INTO payments (booking_id, customer_id, worker_id, amount, status)
          VALUES ($1, $2, $3, $4, 'Completed')
          RETURNING transaction_id
        `, [id, bookingQuery.rows[0].customer_id, booking.worker_id, bookingQuery.rows[0].total_price]);

        const transId = paymentRes.rows[0].transaction_id;

        // Add trust score and stats update
        const totalAcceptedRes = await client.query(`SELECT COUNT(*) as count FROM Bookings WHERE worker_id = $1 AND status != 'Pending'`, [booking.worker_id]);
        const totalCompletedRes = await client.query(`SELECT COUNT(*) as count FROM Bookings WHERE worker_id = $1 AND status = 'Completed'`, [booking.worker_id]);
        
        const totalAccepted = parseInt(totalAcceptedRes.rows[0].count) || 1;
        const totalCompleted = parseInt(totalCompletedRes.rows[0].count) || 0;
        const completionRate = (totalCompleted / totalAccepted) * 100;

        const trustChange = (completionRate >= 90) ? 5 : (completionRate > 50 ? 1 : -5);
        
        await client.query(`
          UPDATE Workers 
          SET total_jobs = $1, completion_rate = $2, trust_score = LEAST(trust_score + $3, 100)
          WHERE id = $4
        `, [totalCompleted, completionRate, trustChange, booking.worker_id]);
      }
    } else if (status === 'Cancelled') {
      await client.query('UPDATE worker_alerts SET is_active = FALSE, status = $1 WHERE booking_id = $2', ['Read', id]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Booking status updated successfully via atomic transaction' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
