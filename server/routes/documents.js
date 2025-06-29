import express from 'express';
import db from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all accessible documents
router.get('/', authenticateToken, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT DISTINCT d.*, u.name as author_name, u.email as author_email
      FROM documents d
      LEFT JOIN users u ON d.author_id = u.id
      LEFT JOIN document_permissions dp ON d.id = dp.document_id
      WHERE d.is_public = 1 
         OR d.author_id = ? 
         OR dp.user_id = ?
      ORDER BY d.updated_at DESC
    `);
    
    const documents = stmt.all(req.user.id, req.user.id);
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single document
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Check if user has access to document
    const accessCheck = db.prepare(`
      SELECT d.*, u.name as author_name, u.email as author_email
      FROM documents d
      LEFT JOIN users u ON d.author_id = u.id
      LEFT JOIN document_permissions dp ON d.id = dp.document_id
      WHERE d.id = ? AND (
        d.is_public = 1 
        OR d.author_id = ? 
        OR dp.user_id = ?
      )
    `).get(documentId, req.user.id, req.user.id);

    if (!accessCheck) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    // Get document permissions
    const permissions = db.prepare(`
      SELECT u.id, u.name, u.email, dp.permission
      FROM document_permissions dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.document_id = ?
    `).all(documentId);

    res.json({
      ...accessCheck,
      permissions
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create document
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, content, isPublic = false } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO documents (title, content, author_id, is_public) 
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(title, content || '', req.user.id, isPublic ? 1 : 0);

    // Create first version
    db.prepare(`
      INSERT INTO document_versions (document_id, title, content, author_id, version_number)
      VALUES (?, ?, ?, ?, 1)
    `).run(result.lastInsertRowid, title, content || '', req.user.id);

    res.status(201).json({
      id: result.lastInsertRowid,
      title,
      content: content || '',
      author_id: req.user.id,
      is_public: isPublic ? 1 : 0
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update document
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const documentId = req.params.id;
    const { title, content, isPublic } = req.body;

    // Check if user can edit document
    const document = db.prepare(`
      SELECT d.*, dp.permission
      FROM documents d
      LEFT JOIN document_permissions dp ON d.id = dp.document_id AND dp.user_id = ?
      WHERE d.id = ? AND (
        d.author_id = ? 
        OR dp.permission = 'edit'
      )
    `).get(req.user.id, documentId, req.user.id);

    if (!document) {
      return res.status(403).json({ error: 'Access denied or document not found' });
    }

    // Get current version number
    const currentVersion = db.prepare(`
      SELECT MAX(version_number) as max_version 
      FROM document_versions 
      WHERE document_id = ?
    `).get(documentId);

    const newVersionNumber = (currentVersion.max_version || 0) + 1;

    // Update document
    const updateStmt = db.prepare(`
      UPDATE documents 
      SET title = COALESCE(?, title), 
          content = COALESCE(?, content), 
          is_public = COALESCE(?, is_public),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.run(title, content, isPublic, documentId);

    // Create new version
    db.prepare(`
      INSERT INTO document_versions (document_id, title, content, author_id, version_number)
      VALUES (?, ?, ?, ?, ?)
    `).run(documentId, title || document.title, content || document.content, req.user.id, newVersionNumber);

    // Process mentions
    if (content) {
      processMentions(documentId, content, req.user.id);
    }

    res.json({ message: 'Document updated successfully' });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const documentId = req.params.id;

    // Check if user is the author
    const document = db.prepare('SELECT * FROM documents WHERE id = ? AND author_id = ?')
      .get(documentId, req.user.id);

    if (!document) {
      return res.status(403).json({ error: 'Access denied or document not found' });
    }

    db.prepare('DELETE FROM documents WHERE id = ?').run(documentId);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Share document
router.post('/:id/share', authenticateToken, (req, res) => {
  try {
    const documentId = req.params.id;
    const { userEmail, permission } = req.body;

    // Check if user is the author
    const document = db.prepare('SELECT * FROM documents WHERE id = ? AND author_id = ?')
      .get(documentId, req.user.id);

    if (!document) {
      return res.status(403).json({ error: 'Access denied or document not found' });
    }

    // Find user to share with
    const userToShare = db.prepare('SELECT id FROM users WHERE email = ?').get(userEmail);
    if (!userToShare) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add or update permission
    const stmt = db.prepare(`
      INSERT INTO document_permissions (document_id, user_id, permission)
      VALUES (?, ?, ?)
      ON CONFLICT(document_id, user_id) 
      DO UPDATE SET permission = ?
    `);
    
    stmt.run(documentId, userToShare.id, permission, permission);

    res.json({ message: 'Document shared successfully' });
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get document versions
router.get('/:id/versions', authenticateToken, (req, res) => {
  try {
    const documentId = req.params.id;

    // Check access
    const hasAccess = db.prepare(`
      SELECT 1 FROM documents d
      LEFT JOIN document_permissions dp ON d.id = dp.document_id
      WHERE d.id = ? AND (
        d.is_public = 1 
        OR d.author_id = ? 
        OR dp.user_id = ?
      )
    `).get(documentId, req.user.id, req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const versions = db.prepare(`
      SELECT dv.*, u.name as author_name
      FROM document_versions dv
      JOIN users u ON dv.author_id = u.id
      WHERE dv.document_id = ?
      ORDER BY dv.version_number DESC
    `).all(documentId);

    res.json(versions);
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to process mentions
function processMentions(documentId, content, authorId) {
  const mentionRegex = /@(\w+)/g;
  const mentions = [...content.matchAll(mentionRegex)];

  for (const mention of mentions) {
    const username = mention[1];
    
    // Find user by email (assuming username is email prefix)
    const user = db.prepare('SELECT id FROM users WHERE email LIKE ?').get(`${username}%`);
    
    if (user && user.id !== authorId) {
      // Add mention
      db.prepare(`
        INSERT OR IGNORE INTO mentions (document_id, mentioned_user_id, mentioning_user_id)
        VALUES (?, ?, ?)
      `).run(documentId, user.id, authorId);

      // Auto-share document with mentioned user
      db.prepare(`
        INSERT OR IGNORE INTO document_permissions (document_id, user_id, permission)
        VALUES (?, ?, 'view')
      `).run(documentId, user.id);
    }
  }
}

export default router;