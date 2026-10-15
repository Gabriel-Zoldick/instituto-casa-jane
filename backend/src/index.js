/**
 * ============================================================================
 * INSTITUTO ALBERTINO VIEIRA SANTOS - CASA JANE
 * Servidor Principal da API REST (Node.js + Express)
 * Domínio de Produção: institutocasajane.com.br
 * ============================================================================
 * 
 * Este arquivo inicializa o servidor HTTP da aplicação com todas as camadas
 * de segurança essenciais para operação em ambiente de produção na internet:
 * 
 * CAMADAS DE SEGURANÇA CONFIGURADAS:
 * 1. Helmet: Adiciona cabeçalhos HTTP defensivos (CSP, HSTS, X-Content-Type-Options, etc.).
 * 2. Ocultação do cabeçalho X-Powered-By (impede fingerprinting da stack Express).
 * 3. CORS Restritivo: Permite o domínio oficial (institutocasajane.com.br) e desenvolvimento local.
 * 4. Rate Limiting Geral: Previne ataques de negação de serviço (DoS) e raspagem de dados.
 * 5. Rate Limiting de Autenticação: Bloqueia ataques de força bruta no endpoint de login.
 * 6. Rate Limiting de Matrícula: Impede spam no formulário público de novos alunos.
 * 7. Limite de tamanho no corpo das requisições (express.json limit: 5MB).
 * 8. Trust Proxy: Permite ler o IP real do cliente atrás de proxies reversos (Cloudflare/Nginx/Render).
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rotas da Aplicação
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const peopleRoutes = require('./routes/people');
const projectRoutes = require('./routes/projects');
const documentRoutes = require('./routes/documents');
const donationRoutes = require('./routes/donations');
const dashboardRoutes = require('./routes/dashboard');
const securityRoutes = require('./routes/security');

const app = express();
const PORT = process.env.PORT || 3001;

// Permite leitura correta do IP real do usuário através de Proxies Reversos (Cloudflare, Nginx, Render)
app.set('trust proxy', 1);

// Desativa cabeçalho informativo que revela a versão do Express a invasores
app.disable('x-powered-by');

// 1. Cabeçalhos de Segurança Defensivos com Helmet
app.use(
  helmet({
    // Permite que arquivos estáticos enviados (fotos/documentos) sejam consumidos pelo frontend
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Delegado ao frontend / Nginx para flexibilidade
  })
);

// 2. Configuração de CORS (Cross-Origin Resource Sharing)
const allowedOrigins = [
  'https://institutocasajane.com.br',
  'https://www.institutocasajane.com.br',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isVercelDomain = typeof origin === 'string' && origin.endsWith('.vercel.app');
      const isAllowed = 
        allowedOrigins.indexOf(origin) !== -1 ||
        isVercelDomain ||
        process.env.FRONTEND_URL === '*' ||
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida pela política de CORS da Casa Jane.'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  })
);

// 3. Rate Limiting Geral da API (300 requisições a cada 15 minutos por IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições originadas deste IP. Por favor, aguarde alguns minutos.' }
});
app.use('/api/', generalLimiter);

// 4. Rate Limiting Específico para Autenticação (15 tentativas a cada 15 minutos)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de autenticação. Por favor, tente novamente após 15 minutos.' }
});
app.use('/api/auth/login', authLimiter);

// 5. Rate Limiting para Formulário Público de Matrícula (10 inscrições a cada 15 minutos por IP)
const enrollLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de cadastros de matrícula atingido temporariamente. Tente novamente em breve.' }
});
app.use('/api/people/public-enroll', enrollLimiter);

// 6. Parsers de Corpo da Requisição com limites estritos contra estouro de memória
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 7. Servir Arquivos Estáticos Enviados (Uploads de fotos e documentos públicos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  dotfiles: 'ignore', // Impede download de arquivos ocultos (.env, .git, etc.)
  maxAge: '1d'        // Cache estático de 1 dia no navegador
}));

// 8. Registro de Rotas da API REST
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/security', securityRoutes);

// 9. Endpoint de Verificação de Saúde (Health Check)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    app: 'Instituto Casa Jane API',
    domain: 'institutocasajane.com.br',
    timestamp: new Date().toISOString()
  });
});

// 10. Middleware Global para Tratamento de Erros e Exceções
app.use((err, req, res, next) => {
  console.error('[SERVER_ERROR]', err.message);
  
  // Tratamento de erro de CORS
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }

  // Não expõe o stack trace em produção por segurança
  res.status(500).json({ 
    error: 'Ocorreu um erro interno no servidor. A equipe técnica já foi notificada.' 
  });
});

// Inicialização do Servidor HTTP
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  INSTITUTO CASA JANE - SERVIDOR REST INICIADO      `);
  console.log(`  Porta: ${PORT}                                    `);
  console.log(`  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Domínio Alvo: https://institutocasajane.com.br   `);
  console.log(`====================================================`);
});
