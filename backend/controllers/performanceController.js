import pool from '../database.js';

export const getPerformance = async (req, res) => {
  try {
    const workerRes = await pool.query('SELECT * FROM workers WHERE user_id = $1', [req.user.id]);
    if (workerRes.rows.length === 0) return res.status(404).json({ message: 'Worker not found' });
    const worker = workerRes.rows[0];

    const historyRes = await pool.query('SELECT rating FROM job_history WHERE worker_id = $1 AND rating IS NOT NULL', [worker.id]);
    const ratings = historyRes.rows.map(r => r.rating);
    const avgRating = ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0;

    await pool.query(`
      INSERT INTO worker_performance (worker_id, total_jobs, average_rating, monthly_jobs, trust_score)
      VALUES ($1, $2, $3, $4, $5)
    `, [worker.id, worker.total_jobs, avgRating, Math.floor(worker.total_jobs / 4) + 1, worker.trust_score]);

    const perfRes = await pool.query('SELECT * FROM worker_performance WHERE worker_id = $1 ORDER BY id DESC LIMIT 1', [worker.id]);
    res.json(perfRes.rows[0] || {
      total_jobs: worker.total_jobs, average_rating: avgRating, monthly_jobs: 0, trust_score: worker.trust_score
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
