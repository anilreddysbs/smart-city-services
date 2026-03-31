import pool from '../database.js';

export const getWorkers = async (req, res, next) => {
  const { category, lat, lng } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT w.id, u.name, w.category, w.experience, w.location, w.verification_status,
             w.trust_score, w.total_jobs, w.completion_rate, w.latitude, w.longitude, w.user_id
      FROM Workers w 
      JOIN Users u ON w.user_id = u.id 
      WHERE w.verification_status IN ('Verified', 'Pending') AND w.is_deleted = false
    `;
    let countQuery = `
      SELECT COUNT(*) 
      FROM Workers w 
      JOIN Users u ON w.user_id = u.id 
      WHERE w.verification_status IN ('Verified', 'Pending') AND w.is_deleted = false
    `;
    const params = [];

    if (category) {
      query += ' AND w.category = $1';
      countQuery += ' AND w.category = $1';
      params.push(category);
    }
    
    query += ` ORDER BY 
      CASE WHEN w.verification_status = 'Verified' THEN 1 ELSE 2 END ASC,
      w.trust_score DESC,
      w.total_jobs DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const countRes = await pool.query(countQuery, params);
    const workersResult = await pool.query(query, [...params, limit, offset]);
    const workers = workersResult.rows;
    const total = parseInt(countRes.rows[0].count);

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    for (let worker of workers) {
      const ratingsResult = await pool.query(`
        SELECT AVG(r.rating) as avgRating 
        FROM Ratings r 
        JOIN Bookings b ON r.booking_id = b.id 
        WHERE b.worker_id = $1
      `, [worker.id]);
      const ratings = ratingsResult.rows;
      worker.averageRating = ratings[0]?.avgrating ? parseFloat(ratings[0].avgrating).toFixed(1) : 0;
      
      const avgRatingNum = parseFloat(worker.averageRating) || 0;
      const trustScoreNum = parseFloat(worker.trust_score) || 0;
      const expNum = parseInt(worker.experience) || 0;
      
      // Calculate distance if coordinates are available
      let distance = null;
      let distanceBonus = 0;
      if (userLat && userLng && worker.latitude && worker.longitude) {
        const R = 6371; // Radius of earth in km
        const dLat = (worker.latitude - userLat) * Math.PI / 180;
        const dLon = (worker.longitude - userLng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(userLat * Math.PI / 180) * Math.cos(worker.latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        distance = R * c;
        
        // Nearby bonus: increase matchscore for workers within 10km
        if (distance < 5) distanceBonus = 50;
        else if (distance < 15) distanceBonus = 25;
      }
      
      worker.distance = distance;
      worker.matchScore = ((avgRatingNum * 10) + (trustScoreNum * 0.4) + (expNum * 1.5) + distanceBonus).toFixed(2);
    }
    
    // Sort intelligently: Nearest first if distance exists, then by MatchScore
    workers.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return parseFloat(b.matchScore) - parseFloat(a.matchScore);
    });

    res.json({ success: true, data: { workers, total, page, pages: Math.ceil(total / limit) }, error: null });
  } catch (err) {
    next(err);
  }
};

export const getWorkerById = async (req, res, next) => {
  try {
    const workersResult = await pool.query(`
      SELECT w.id, u.name, w.category, w.experience, w.location, w.verification_status, u.phone, u.email 
      FROM Workers w 
      JOIN Users u ON w.user_id = u.id 
      WHERE w.id = $1 AND w.is_deleted = false
    `, [req.params.id]);

    if (workersResult.rows.length === 0) return res.status(404).json({ success: false, data: null, error: 'Worker not found' });
    const worker = workersResult.rows[0];

    const ratingsResult = await pool.query(`
      SELECT r.rating, r.review, u.name as customer_name 
      FROM Ratings r 
      JOIN Bookings b ON r.booking_id = b.id 
      JOIN Customers c ON b.customer_id = c.id
      JOIN Users u ON c.user_id = u.id
      WHERE b.worker_id = $1
    `, [worker.id]);

    const ratings = ratingsResult.rows;
    worker.reviews = ratings;
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / (ratings.length || 1);
    worker.averageRating = avg ? avg.toFixed(1) : 0;

    res.json({ success: true, data: worker, error: null });
  } catch (err) {
    next(err);
  }
};

export const getWorkerHistory = async (req, res, next) => {
  try {
    const historyRes = await pool.query(`
      SELECT j.*, u.name as customer_name 
      FROM job_history j
      JOIN Bookings b ON j.booking_id = b.id
      JOIN Customers c ON b.customer_id = c.id
      JOIN Users u ON c.user_id = u.id
      WHERE j.worker_id = $1 AND j.is_deleted = false
      ORDER BY j.completed_date DESC
    `, [req.params.id]);
    res.json({ success: true, data: historyRes.rows, error: null });
  } catch (err) {
    next(err);
  }
};

export const getWorkerCertifications = async (req, res, next) => {
  try {
    const certsRes = await pool.query(`
      SELECT * FROM worker_certifications 
      WHERE worker_id = $1
    `, [req.params.id]);
    res.json({ success: true, data: certsRes.rows, error: null });
  } catch (err) {
    next(err);
  }
};

export const addCertification = async (req, res, next) => {
  const { worker_id, certification_name } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO worker_certifications (worker_id, certification_name) 
      VALUES ($1, $2) RETURNING id
    `, [worker_id, certification_name]);
    res.status(201).json({ success: true, data: { id: result.rows[0].id }, message: 'Certification requested' });
  } catch (err) {
    next(err);
  }
};
