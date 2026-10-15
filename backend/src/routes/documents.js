const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const { logAudit } = require('../utils/audit');

// Public documents (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM documents WHERE is_public = true ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar documentos públicos' });
  }
});

// Auth required for below
router.use(authMiddleware);

// List all documents
router.get('/', requireRole(['superadmin', 'admin']), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT d.*, u.name as uploader_name 
      FROM documents d 
      LEFT JOIN users u ON d.uploaded_by = u.id 
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar documentos' });
  }
});

// Upload document
router.post('/', requireRole(['superadmin', 'admin']), upload.single('file'), async (req, res) => {
  try {
    const { title, category, is_public } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não fornecido' });
    }

    if (!title) {
      // delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    const file_url = `/uploads/${req.file.filename}`;
    const file_name = req.file.originalname;

    const query = `
      INSERT INTO documents (title, category, file_url, file_name, is_public, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [title, category, file_url, file_name, is_public === 'true', req.userId];

    const { rows } = await db.query(query, params);
    const newDoc = rows[0];

    await logAudit({
      req,
      userId: req.userId,
      action: 'DOCUMENT_UPLOADED',
      details: `Documento adicionado: "${newDoc.title}" (${newDoc.category}) - ${file_name}`
    });

    res.status(201).json(newDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer upload do documento' });
  }
});

// Update document metadata
router.put('/:id', requireRole(['superadmin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, is_public } = req.body;

    const query = `
      UPDATE documents 
      SET title = $1, category = $2, is_public = $3
      WHERE id = $4
      RETURNING *
    `;
    const params = [title, category, is_public, id];

    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    await logAudit({
      req,
      userId: req.userId,
      action: 'DOCUMENT_UPDATED',
      details: `Documento ID ${id} atualizado: "${title}" (${category})`
    });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar documento' });
  }
});

// Delete document
router.delete('/:id', requireRole(['superadmin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file info first to delete physical file
    const { rows: docRows } = await db.query('SELECT title, file_url FROM documents WHERE id = $1', [id]);
    
    if (docRows.length === 0) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const { rowCount } = await db.query('DELETE FROM documents WHERE id = $1', [id]);
    
    // Delete file from disk
    const fileUrl = docRows[0].file_url;
    if (fileUrl) {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(__dirname, '../../uploads', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await logAudit({
      req,
      userId: req.userId,
      action: 'DOCUMENT_DELETED',
      details: `Documento excluído ID ${id}: "${docRows[0].title}"`
    });

    res.json({ message: 'Documento excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir documento' });
  }
});

module.exports = router;
