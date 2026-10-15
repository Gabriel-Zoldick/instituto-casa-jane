const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get donation config (public)
router.get('/config', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM donation_config ORDER BY id DESC LIMIT 1');
    
    if (rows.length === 0) {
      return res.json({ show_donation_section: false });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar configurações de doação' });
  }
});

// Update donation config
router.put('/config', authMiddleware, requireRole(['superadmin']), async (req, res) => {
  try {
    const { pix_key, pix_key_type, bank_name, agency, account, account_holder, message, show_donation_section } = req.body;

    // Check if config exists
    const { rows: existing } = await db.query('SELECT id FROM donation_config LIMIT 1');
    
    let query;
    let params = [pix_key, pix_key_type, bank_name, agency, account, account_holder, message, show_donation_section];
    
    if (existing.length === 0) {
      query = `
        INSERT INTO donation_config (pix_key, pix_key_type, bank_name, agency, account, account_holder, message, show_donation_section)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
    } else {
      query = `
        UPDATE donation_config 
        SET pix_key = $1, pix_key_type = $2, bank_name = $3, agency = $4, account = $5, account_holder = $6, message = $7, show_donation_section = $8
        WHERE id = $9
        RETURNING *
      `;
      params.push(existing[0].id);
    }

    const { rows } = await db.query(query, params);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar configurações de doação' });
  }
});

module.exports = router;
