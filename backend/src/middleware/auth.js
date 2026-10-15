/**
 * ============================================================================
 * INSTITUTO ALBERTINO VIEIRA SANTOS - CASA JANE
 * Middleware de Autenticação e Autorização JWT
 * ============================================================================
 * 
 * Responsável por:
 * 1. Validar a presença e a integridade do token Bearer JWT nas requisições protegidas.
 * 2. Decodificar a identidade (userId) e o perfil (userRole) do usuário.
 * 3. Aplicar controle de acesso baseado em papéis (RBAC - Role-Based Access Control)
 *    com suporte aos perfis: 'superadmin', 'admin', 'coordinator', 'viewer'.
 * 
 * MEDIDAS DE SEGURANÇA:
 * - Rejeição imediata de tokens com formato incorreto.
 * - Distinção clara entre token expirado ('TokenExpiredError') e token adulterado.
 * - Validação rigorosa de roles exigidos antes de permitir acesso à rota.
 */

const jwt = require('jsonwebtoken');

// Obtém o segredo do JWT (com verificação de presença)
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('[SECURITY_WARNING] JWT_SECRET não configurado no .env! Utilizando fallback de desenvolvimento.');
    return 'casa-jane-default-dev-secret-change-in-production';
  }
  return secret;
};

/**
 * Middleware para validar o token JWT
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Acesso negado. Token de autenticação não fornecido.' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Formato do cabeçalho de autenticação inválido. Utilize: Bearer <token>' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado. O prefixo deve ser Bearer.' });
    }

    const secret = getJwtSecret();

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Sua sessão expirou. Por favor, faça login novamente.', expired: true });
        }
        return res.status(401).json({ error: 'Token de autenticação inválido ou adulterado.' });
      }

      // Anexa os dados do usuário autenticado na requisição Express
      req.userId = decoded.id;
      req.userRole = decoded.role;
      return next();
    });
  } catch (err) {
    console.error('[AUTH_ERROR] Falha no middleware de autenticação:', err.message);
    return res.status(500).json({ error: 'Erro interno ao validar credenciais.' });
  }
};

/**
 * Middleware para restringir acesso por papel de usuário (RBAC)
 * @param {string[]} roles - Lista de papéis autorizados (ex: ['superadmin', 'admin'])
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ 
        error: 'Acesso negado. Seu perfil de usuário não possui permissão para esta ação.' 
      });
    }

    return next();
  };
};

module.exports = {
  authMiddleware,
  requireRole
};
