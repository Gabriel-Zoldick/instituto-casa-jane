const db = require('../database/connection');

/**
 * Registra um evento de auditoria no sistema
 * @param {Object} params
 * @param {Object} [params.req] - Objeto Request do Express para coletar IP e User-Agent
 * @param {number} [params.userId] - ID do usuário envolvido
 * @param {string} [params.userName] - Nome do usuário
 * @param {string} [params.userEmail] - Email do usuário
 * @param {string} [params.userRole] - Perfil do usuário (superadmin, admin, etc.)
 * @param {string} params.action - Identificador da ação (ex: 'LOGIN_SUCCESS', 'USER_BLOCKED_ATTEMPTS')
 * @param {string|Object} [params.details] - Detalhes textuais ou objeto serializado
 */
async function logAudit({
  req,
  userId = null,
  userName = null,
  userEmail = null,
  userRole = null,
  action,
  details = null
}) {
  try {
    let ipAddress = '127.0.0.1';
    let userAgent = 'Unknown';

    if (req) {
      ipAddress =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        req.ip ||
        '127.0.0.1';
      userAgent = req.headers['user-agent'] || 'Unknown';
    }

    const detailsStr = typeof details === 'object' && details !== null 
      ? JSON.stringify(details) 
      : (details || '');

    await db.query(
      `INSERT INTO audit_logs (user_id, user_name, user_email, user_role, action, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, userName, userEmail, userRole, action, detailsStr, ipAddress, userAgent]
    );
  } catch (err) {
    // Log de auditoria não deve quebrar a requisição do usuário, mas logamos no console do servidor
    console.error('[AUDIT_ERROR] Falha ao registrar log de auditoria:', err.message);
  }
}

module.exports = { logAudit };
