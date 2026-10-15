/**
 * ============================================================================
 * INSTITUTO ALBERTINO VIEIRA SANTOS - CASA JANE
 * Middleware de Upload Seguro com Multer
 * ============================================================================
 * 
 * Este middleware gerencia uploads de arquivos (fotos de perfil e documentos
 * institucionais como atas, relatórios financeiros e editais).
 * 
 * MEDIDAS DE SEGURANÇA IMPLEMENTADAS:
 * 1. Whitelist estrita de extensões e tipos MIME (apenas imagens e PDFs/Docs).
 * 2. Bloqueio total de executáveis, scripts ou arquivos HTML/SVG perigosos.
 * 3. Sanitização do nome do arquivo gerado com sufixo aleatório único (Date.now + hash).
 * 4. Limite de tamanho máximo de 10 MB para evitar ataques de DoS (exaustão de disco).
 * 5. Prevenção de Path Traversal ao salvar diretamente no diretório isolado /uploads.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Diretório de armazenamento dos uploads (configurável via UPLOAD_DIR no .env)
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Garante que a pasta de uploads exista no disco
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do armazenamento em disco com nomes seguros e únicos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Extrai extensão limpa e sanitizada em letras minúsculas
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/gi, '');
    const cleanFieldName = file.fieldname.replace(/[^a-z0-9_-]/gi, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${cleanFieldName}-${uniqueSuffix}${ext}`);
  }
});

// Lista branca (whitelist) de extensões e tipos MIME permitidos no sistema
const ALLOWED_MIME_TYPES = new Set([
  // Imagens (fotos de alunos, beneficiários e logotipo)
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // Documentos institucionais e relatórios
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.txt'
]);

/**
 * Filtro de validação de arquivos para impedir uploads maliciosos
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // 1. Validação de extensão
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(`Tipo de arquivo não permitido (${ext}). Permitidos apenas: imagens (.jpg, .png, .webp) e documentos (.pdf, .docx).`),
      false
    );
  }

  // 2. Validação do MIME Type declarado
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new Error(`Tipo MIME inválido (${file.mimetype}). Arquivo rejeitado por segurança.`),
      false
    );
  }

  // Arquivo válido e seguro
  cb(null, true);
};

// Instância do Multer com limites e validações
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite estrito de 10 Megabytes por arquivo
    files: 1                    // 1 arquivo por requisição nos endpoints atuais
  }
});

module.exports = upload;
