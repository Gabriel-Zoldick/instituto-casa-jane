-- Adicionar colunas de segurança na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lock_reason VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance de busca nos logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);

-- Tabela de configurações de segurança
CREATE TABLE IF NOT EXISTS security_settings (
  id SERIAL PRIMARY KEY,
  max_failed_attempts INTEGER DEFAULT 5,
  inactivity_days_limit INTEGER DEFAULT 60,
  session_timeout_hours INTEGER DEFAULT 24,
  require_strong_passwords BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir configuração padrão de segurança se não existir
INSERT INTO security_settings (id, max_failed_attempts, inactivity_days_limit, session_timeout_hours, require_strong_passwords)
VALUES (1, 5, 60, 24, true)
ON CONFLICT (id) DO NOTHING;
