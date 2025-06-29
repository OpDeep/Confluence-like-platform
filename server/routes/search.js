import express from 'express';
import db from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Global search
router.get('/', authenticateToken, (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const documents = db.prepare(`
      SELECT DISTINCT d.id, d.title, d.content, d.created_at, d.updated_at,
             u.name as author_name, u.email as author_email
      FROM documents d
      LEFT JOIN users u ON d.author_id = u.id
      LEFT JOIN document_permissions dp ON d.id = dp.document_id
      WHERE (d.title LIKE ? OR d.content LIKE ?) 
        AND (d.is_public = 1 OR d.author_id = ? OR dp.user_id = ?)
      ORDER BY d.updated_at DESC
      LIMIT 20
    `).all(`%${q}%`, `%${q}%`, req.user.id, req.user.id);

    // Highlight search terms in results
    const results = documents.map(doc => ({
      ...doc,
      content: highlightSearchTerm(doc.content, q),
      title: highlightSearchTerm(doc.title, q)
    }));

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function highlightSearchTerm(text, term) {
  if (!text) return '';
  
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export default router;