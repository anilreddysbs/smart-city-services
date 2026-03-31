import express from 'express';
import pool from '../database.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all community posts
router.get('/', async (req, res) => {
  try {
    const posts = await pool.query(`
      SELECT cp.*, u.name as user_name 
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      ORDER BY cp.created_at DESC
    `);
    res.json(posts.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new post
router.post('/', authenticate, async (req, res) => {
  const { content, category } = req.body;
  try {
    const newPost = await pool.query(
      'INSERT INTO community_posts (user_id, content, category) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, content, category]
    );
    res.status(201).json(newPost.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
