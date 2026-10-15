const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

// Todas as rotas de usuários exigem superadmin
router.use(authMiddleware, requireRole(['superadmin']));

// List all users com dados completos de segurança
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        active, 
        created_at,
        first_login_at,
        last_login_at,
        failed_login_attempts,
        is_locked,
        lock_reason,
        locked_at
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'A senha deve conter no mínimo 8 caracteres por segurança.' });
    }

    const validRoles = ['superadmin', 'admin', 'coordinator', 'viewer'];
    const userRole = validRoles.includes(role) ? role : 'viewer';

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, active, created_at, first_login_at, last_login_at, failed_login_attempts, is_locked, lock_reason`,
      [name.trim(), email.trim().toLowerCase(), hash, userRole]
    );

    const newUser = rows[0];

    await logAudit({
      req,
      userId: req.userId,
      action: 'USER_CREATED',
      details: `Novo usuário criado: ${newUser.name} (${newUser.email}) com perfil ${newUser.role}`
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    if (err.constraint === 'users_email_key') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, active, password } = req.body;

    let query = 'UPDATE users SET name = $1, email = $2, role = $3, active = $4';
    let params = [name.trim(), email.trim().toLowerCase(), role, active];
    let paramIndex = 5;

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      query += `, password_hash = $${paramIndex}`;
      params.push(hash);
      paramIndex++;
    }

    query += ` WHERE id = $${paramIndex} RETURNING id, name, email, role, active, created_at, first_login_at, last_login_at, failed_login_attempts, is_locked, lock_reason`;
    params.push(id);

    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updatedUser = rows[0];

    await logAudit({
      req,
      userId: req.userId,
      action: 'USER_UPDATED',
      details: `Usuário atualizado: ${updatedUser.name} (${updatedUser.email}) - Perfil: ${updatedUser.role}, Ativo: ${updatedUser.active}${password ? ' (senha redefinida)' : ''}`
    });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Desbloquear usuário
router.post('/:id/unlock', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `UPDATE users 
       SET is_locked = false, 
           failed_login_attempts = 0, 
           lock_reason = NULL, 
           locked_at = NULL 
       WHERE id = $1 
       RETURNING id, name, email, role, active, is_locked, failed_login_attempts`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const unUser = rows[0];

    await logAudit({
      req,
      userId: req.userId,
      action: 'USER_UNLOCKED',
      details: `Usuário desbloqueado pelo Superadmin: ${unUser.name} (${unUser.email})`
    });

    res.json({ message: 'Usuário desbloqueado com sucesso!', user: unUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao desbloquear usuário' });
  }
});

// Bloquear usuário manualmente
router.post('/:id/lock', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'MANUAL' } = req.body;

    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: 'Você não pode bloquear seu próprio usuário' });
    }

    const { rows } = await db.query(
      `UPDATE users 
       SET is_locked = true, 
           lock_reason = $1, 
           locked_at = NOW() 
       WHERE id = $2 
       RETURNING id, name, email, role, active, is_locked, lock_reason`,
      [reason, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const lockedUser = rows[0];

    await logAudit({
      req,
      userId: req.userId,
      action: 'USER_MANUALLY_LOCKED',
      details: `Usuário bloqueado manualmente pelo Superadmin: ${lockedUser.name} (${lockedUser.email}). Motivo: ${reason}`
    });

    res.json({ message: 'Usuário bloqueado com sucesso!', user: lockedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao bloquear usuário' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: 'Não é possível excluir o próprio usuário' });
    }

    const userRes = await db.query('SELECT name, email FROM users WHERE id = $1', [id]);
    const targetUser = userRes.rows[0];

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Desvincula o usuário de projetos (como coordenador) e documentos para não violar Foreign Key
    await db.query('UPDATE projects SET coordinator_id = NULL WHERE coordinator_id = $1', [id]);
    await db.query('UPDATE documents SET uploaded_by = NULL WHERE uploaded_by = $1', [id]);

    const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await logAudit({
      req,
      userId: req.userId,
      action: 'USER_DELETED',
      details: `Usuário excluído: ${targetUser?.name || id} (${targetUser?.email || ''})`
    });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// Get user field permissions
router.get('/:id/permissions', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT field_name, can_view FROM permission_overrides WHERE user_id = $1', [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar permissões' });
  }
});

// Update user field permissions
router.put('/:id/permissions', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    let overridesList = [];

    if (Array.isArray(req.body.overrides)) {
      overridesList = req.body.overrides;
    } else if (req.body.permissions && typeof req.body.permissions === 'object') {
      overridesList = Object.entries(req.body.permissions).map(([field_name, can_view]) => ({
        field_name,
        can_view: Boolean(can_view)
      }));
    }

    await client.query('BEGIN');
    
    // Clear old
    await client.query('DELETE FROM permission_overrides WHERE user_id = $1', [id]);
    
    // Insert new
    for (const override of overridesList) {
      await client.query(
        'INSERT INTO permission_overrides (user_id, field_name, can_view) VALUES ($1, $2, $3)',
        [id, override.field_name, override.can_view]
      );
    }

    await client.query('COMMIT');

    await logAudit({
      req,
      userId: req.userId,
      action: 'PERMISSIONS_UPDATED',
      details: `Permissões de campos personalizadas para o usuário ID ${id}`
    });

    res.json({ message: 'Permissões atualizadas com sucesso' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar permissões' });
  } finally {
    client.release();
  }
});

// Get user project access
router.get('/:id/project-access', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT p.id as project_id, p.id, p.name 
       FROM user_project_access upa 
       JOIN projects p ON upa.project_id = p.id 
       WHERE upa.user_id = $1`, 
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar acessos de projetos' });
  }
});

// Update user project access
router.put('/:id/project-access', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const projectIds = req.body.project_ids || req.body.projectIds || [];

    await client.query('BEGIN');
    
    // Clear old
    await client.query('DELETE FROM user_project_access WHERE user_id = $1', [id]);
    
    // Insert new
    if (Array.isArray(projectIds) && projectIds.length > 0) {
      for (const projectId of projectIds) {
        await client.query(
          'INSERT INTO user_project_access (user_id, project_id) VALUES ($1, $2)',
          [id, projectId]
        );
      }
    }

    await client.query('COMMIT');

    await logAudit({
      req,
      userId: req.userId,
      action: 'PROJECT_ACCESS_UPDATED',
      details: `Acesso a projetos atualizado para o usuário ID ${id} (${projectIds.length} projetos vinculados)`
    });

    res.json({ message: 'Acessos de projetos atualizados com sucesso' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar acessos de projetos' });
  } finally {
    client.release();
  }
});

module.exports = router;
