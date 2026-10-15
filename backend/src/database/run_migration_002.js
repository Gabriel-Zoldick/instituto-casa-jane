const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('./connection');

async function runMigration() {
  try {
    console.log('Executando migração 002_security_and_audit.sql...');
    const sqlPath = path.resolve(__dirname, 'migrations/002_security_and_audit.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await db.query(sql);
    console.log('Migração 002 executada com sucesso!');

    // Testar se as colunas estão acessíveis
    const { rows } = await db.query('SELECT id, name, email, failed_login_attempts, is_locked, last_login_at FROM users LIMIT 1');
    console.log('Validação de tabela users:', rows[0] || 'Nenhum usuário cadastrado');

    const settingsRes = await db.query('SELECT * FROM security_settings WHERE id = 1');
    console.log('Configuração de segurança inicial:', settingsRes.rows[0]);
  } catch (err) {
    console.error('Erro ao executar migração 002:', err);
  } finally {
    db.pool.end();
  }
}

runMigration();
