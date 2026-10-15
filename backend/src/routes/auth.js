const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');
const { authMiddleware } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

// Helper para obter as configurações de segurança vigentes
async function getSecuritySettings() {
  try {
    const { rows } = await db.query('SELECT * FROM security_settings WHERE id = 1');
    if (rows.length > 0) return rows[0];
  } catch (err) {
    console.error('Erro ao ler security_settings, usando padrões:', err.message);
  }
  return {
    max_failed_attempts: 5,
    inactivity_days_limit: 60,
    session_timeout_hours: 24,
    require_strong_passwords: true
  };
}

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const settings = await getSecuritySettings();
    const { rows } = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    const user = rows[0];

    // Hash fictício de mesmo custo para mitigar ataques de temporização (Timing Attacks / Side-Channel)
    const DUMMY_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    // Mensagem genérica padronizada contra enumeração de usuários (OWASP CWE-204)
    // NUNCA revela se o e-mail existe ou se a senha está errada
    const GENERIC_AUTH_ERROR = 'E-mail ou senha incorretos.';

    // 1. Caso o usuário NÃO exista no banco de dados
    if (!user) {
      // Executa o compare com hash fictício para gastar o mesmo tempo de CPU (mitigação de timing attack)
      await bcrypt.compare(password, DUMMY_HASH);

      await logAudit({
        req,
        action: 'LOGIN_FAILED',
        details: `Tentativa de login com e-mail não cadastrado: ${email}`,
        userEmail: email
      });

      // Retorna a mesma mensagem genérica com status 401
      return res.status(401).json({ error: GENERIC_AUTH_ERROR });
    }

    // 2. O usuário existe: primeiro valida a senha fornecida
    const validPassword = await bcrypt.compare(password, user.password_hash);

    // Se a senha estiver INCORRETA:
    if (!validPassword) {
      const currentFailed = (user.failed_login_attempts || 0) + 1;

      if (currentFailed >= settings.max_failed_attempts) {
        // Bloqueia a conta no banco após atingir o limite (ex: 5 falhas consecutivas)
        await db.query(
          `UPDATE users 
           SET is_locked = true, 
               lock_reason = 'FAILED_ATTEMPTS', 
               locked_at = NOW(),
               failed_login_attempts = $1 
           WHERE id = $2`,
          [currentFailed, user.id]
        );

        await logAudit({
          req,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          action: 'USER_BLOCKED_ATTEMPTS',
          details: `Conta bloqueada automaticamente após ${currentFailed} tentativas consecutivas falhas de senha`
        });
      } else {
        // Apenas incrementa contador de falhas no banco
        await db.query(
          'UPDATE users SET failed_login_attempts = $1 WHERE id = $2',
          [currentFailed, user.id]
        );

        await logAudit({
          req,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          action: 'LOGIN_FAILED',
          details: `Senha incorreta. Tentativa ${currentFailed} de ${settings.max_failed_attempts}`
        });
      }

      // SEGURANÇA: Retorna a mesma mensagem genérica e mesmo status 401!
      // Impede que invasores identifiquem se o e-mail existe através de respostas diferenciadas
      return res.status(401).json({ error: GENERIC_AUTH_ERROR });
    }

    // 3. A senha está CORRETA. Agora verifica restrições de conta (bloqueio, inatividade, desativação)
    
    // Verificação de conta bloqueada
    if (user.is_locked) {
      await logAudit({
        req,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: 'LOGIN_BLOCKED_ATTEMPT',
        details: `Tentativa de acesso com senha correta em conta bloqueada. Motivo: ${user.lock_reason || 'Bloqueio administrativo'}`
      });

      return res.status(403).json({ 
        error: 'Esta conta de acesso está bloqueada por segurança. Solicite o desbloqueio ao Super Administrador.',
        is_locked: true,
        lock_reason: user.lock_reason
      });
    }

    // Verificação de conta desativada
    if (!user.active) {
      await logAudit({
        req,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: 'LOGIN_INACTIVE_ATTEMPT',
        details: 'Tentativa de login em conta desativada'
      });
      return res.status(403).json({ error: 'Esta conta de usuário foi desativada pelo administrador.' });
    }

    // Verificação de Bloqueio por Inatividade (ex: 60 dias sem logar)
    const referenceDate = user.last_login_at 
      ? new Date(user.last_login_at) 
      : new Date(user.created_at || Date.now());

    const daysSinceAccess = Math.floor((Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceAccess > settings.inactivity_days_limit) {
      // Bloqueia automaticamente a conta por inatividade
      await db.query(
        `UPDATE users 
         SET is_locked = true, 
             lock_reason = 'INACTIVITY', 
             locked_at = NOW() 
         WHERE id = $1`,
        [user.id]
      );

      await logAudit({
        req,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: 'USER_BLOCKED_INACTIVE',
        details: `Usuário bloqueado automaticamente: ${daysSinceAccess} dias sem acesso (limite: ${settings.inactivity_days_limit} dias)`
      });

      return res.status(403).json({
        error: 'Esta conta foi bloqueada automaticamente por inatividade (mais de 60 dias sem acesso). Solicite o desbloqueio ao Super Administrador.',
        is_locked: true,
        lock_reason: 'INACTIVITY'
      });
    }

    // 5. Sucesso na autenticação
    await db.query(
      `UPDATE users 
       SET failed_login_attempts = 0, 
           last_login_at = NOW(),
           first_login_at = COALESCE(first_login_at, NOW()) 
       WHERE id = $1`,
      [user.id]
    );

    await logAudit({
      req,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'LOGIN_SUCCESS',
      details: 'Autenticação realizada com sucesso'
    });

    const tokenExpiry = settings.session_timeout_hours 
      ? `${settings.session_timeout_hours}h` 
      : '24h';

    const jwtSecret = process.env.JWT_SECRET || 'casa-jane-default-dev-secret-change-in-production';
    if (!process.env.JWT_SECRET) {
      console.warn('[SECURITY_WARNING] JWT_SECRET não definido no .env! Recomenda-se configurar uma chave forte para produção.');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret,
      { expiresIn: tokenExpiry }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, active, created_at, first_login_at, last_login_at, failed_login_attempts, is_locked, lock_reason FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senhas atual e nova são obrigatórias' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres por motivos de segurança.' });
    }

    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const user = rows[0];

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      await logAudit({
        req,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: 'PASSWORD_CHANGE_FAILED',
        details: 'Tentativa de alteração de senha com senha atual incorreta'
      });
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.userId]);

    await logAudit({
      req,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: 'PASSWORD_CHANGED',
      details: 'Senha alterada pelo próprio usuário com sucesso'
    });

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;
