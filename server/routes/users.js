import express from 'express';
import db from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Search users
router.get('/search', authenticateToken, (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = db.prepare(`
      SELECT id, email, name, avatar
      FROM users 
      WHERE (email LIKE ? OR name LIKE ?) AND id != ?
      LIMIT 10
    `).all(`%${q}%`, `%${q}%`, req.user.id);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user mentions
router.get('/mentions', authenticateToken, (req, res) => {
  try {
    const mentions = db.prepare(`
      SELECT m.*, d.title as document_title, u.name as mentioning_user_name
      FROM mentions m
      JOIN documents d ON m.document_id = d.id
      JOIN users u ON m.mentioning_user_id = u.id
      WHERE m.mentioned_user_id = ?
      ORDER BY m.created_at DESC
      LIMIT 50
    `).all(req.user.id);

    res.json(mentions);
  } catch (error) {
    console.error('Get mentions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark mention as read
router.put('/mentions/:id/read', authenticateToken, (req, res) => {
  try {
    const mentionId = req.params.id;
    
    db.prepare(`
      UPDATE mentions 
      SET is_read = 1 
      WHERE id = ? AND mentioned_user_id = ?
    `).run(mentionId, req.user.id);

    res.json({ message: 'Mention marked as read' });
  } catch (error) {
    console.error('Mark mention read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;