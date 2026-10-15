const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

// Todas as rotas de segurança são exclusivas para SUPER ADMIN
router.use(authMiddleware, requireRole(['superadmin']));

// 1. Estatísticas de Segurança e Ameaças
router.get('/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE active = true AND is_locked = false) as active_users,
        (SELECT COUNT(*) FROM users WHERE is_locked = true) as locked_users,
        (SELECT COUNT(*) FROM users WHERE is_locked = true AND lock_reason = 'FAILED_ATTEMPTS') as locked_by_attempts,
        (SELECT COUNT(*) FROM users WHERE is_locked = true AND lock_reason = 'INACTIVITY') as locked_by_inactivity,
        (SELECT COUNT(*) FROM audit_logs WHERE action = 'LOGIN_FAILED' AND created_at >= NOW() - INTERVAL '24 hours') as failed_logins_24h,
        (SELECT COUNT(*) FROM audit_logs WHERE action = 'LOGIN_SUCCESS' AND created_at >= NOW() - INTERVAL '24 hours') as successful_logins_24h,
        (SELECT COUNT(*) FROM audit_logs WHERE action IN ('USER_BLOCKED_ATTEMPTS', 'USER_BLOCKED_INACTIVE') AND created_at >= NOW() - INTERVAL '24 hours') as locks_triggered_24h
    `;

    const { rows } = await db.query(statsQuery);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar estatísticas de segurança' });
  }
});

// 2. Listagem de Logs de Auditoria com Filtros e Paginação
router.get('/logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { action, search, startDate, endDate } = req.query;

    let whereClauses = [];
    let params = [];
    let paramIndex = 1;

    if (action && action !== 'ALL') {
      whereClauses.push(`action = $${paramIndex}`);
      params.push(action);
      paramIndex++;
    }

    if (search) {
      whereClauses.push(`(
        user_name ILIKE $${paramIndex} OR 
        user_email ILIKE $${paramIndex} OR 
        ip_address ILIKE $${paramIndex} OR 
        details ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (startDate) {
      whereClauses.push(`created_at >= $${paramIndex}`);
      params.push(new Date(startDate));
      paramIndex++;
    }

    if (endDate) {
      whereClauses.push(`created_at <= $${paramIndex}`);
      params.push(new Date(endDate + 'T23:59:59.999Z'));
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Contagem total
    const countQuery = `SELECT COUNT(*) FROM audit_logs ${whereSql}`;
    const countRes = await db.query(countQuery, params);
    const total = parseInt(countRes.rows[0].count);

    // Consulta paginada
    const logsQuery = `
      SELECT id, user_id, user_name, user_email, user_role, action, details, ip_address, user_agent, created_at
      FROM audit_logs
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const { rows } = await db.query(logsQuery, params);

    res.json({
      logs: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar logs de auditoria' });
  }
});

// 3. Buscar Políticas de Segurança
router.get('/settings', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM security_settings WHERE id = 1');
    if (rows.length === 0) {
      return res.json({
        max_failed_attempts: 5,
        inactivity_days_limit: 60,
        session_timeout_hours: 24,
        require_strong_passwords: true
      });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter configurações de segurança' });
  }
});

// 4. Salvar Políticas de Segurança
router.put('/settings', async (req, res) => {
  try {
    const {
      max_failed_attempts,
      inactivity_days_limit,
      session_timeout_hours,
      require_strong_passwords
    } = req.body;

    const maxAttempts = parseInt(max_failed_attempts) || 5;
    const inactivityDays = parseInt(inactivity_days_limit) || 60;
    const sessionHours = parseInt(session_timeout_hours) || 24;
    const strongPasswords = Boolean(require_strong_passwords);

    const { rows } = await db.query(
      `UPDATE security_settings 
       SET max_failed_attempts = $1,
           inactivity_days_limit = $2,
           session_timeout_hours = $3,
           require_strong_passwords = $4,
           updated_at = NOW()
       WHERE id = 1
       RETURNING *`,
      [maxAttempts, inactivityDays, sessionHours, strongPasswords]
    );

    await logAudit({
      req,
      userId: req.userId,
      action: 'SECURITY_SETTINGS_UPDATED',
      details: `Políticas atualizadas: Máx. tentativas: ${maxAttempts}, Inatividade: ${inactivityDays} dias, Sessão: ${sessionHours}h, Senhas fortes: ${strongPasswords}`
    });

    res.json({ message: 'Políticas de segurança atualizadas!', settings: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar configurações de segurança' });
  }
});

// 5. Executar Varredura Manual de Inatividade (Bloqueio em massa de inativos > 60 dias)
router.post('/check-inactivity', async (req, res) => {
  try {
    const settingsRes = await db.query('SELECT inactivity_days_limit FROM security_settings WHERE id = 1');
    const limitDays = settingsRes.rows[0]?.inactivity_days_limit || 60;

    // Busca usuários não bloqueados que estão inativos há mais de limitDays dias
    const inactiveUsersQuery = `
      SELECT id, name, email, last_login_at, created_at
      FROM users
      WHERE is_locked = false 
        AND (
          (last_login_at IS NOT NULL AND last_login_at < NOW() - ($1 || ' days')::INTERVAL)
          OR
          (last_login_at IS NULL AND created_at < NOW() - ($1 || ' days')::INTERVAL)
        )
    `;

    const { rows } = await db.query(inactiveUsersQuery, [limitDays]);

    if (rows.length > 0) {
      const userIds = rows.map(u => u.id);
      await db.query(
        `UPDATE users 
         SET is_locked = true, 
             lock_reason = 'INACTIVITY', 
             locked_at = NOW() 
         WHERE id = ANY($1::int[])`,
        [userIds]
      );

      for (const u of rows) {
        await logAudit({
          req,
          userId: req.userId,
          action: 'USER_BLOCKED_INACTIVE',
          details: `Bloqueado em varredura: ${u.name} (${u.email}) sem acesso há mais de ${limitDays} dias`
        });
      }
    }

    res.json({
      message: `Varredura concluída! ${rows.length} usuário(s) bloqueado(s) por inatividade.`,
      blockedCount: rows.length,
      users: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao executar varredura de inatividade' });
  }
});

module.exports = router;
