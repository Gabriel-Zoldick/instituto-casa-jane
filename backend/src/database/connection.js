/**
 * ============================================================================
 * INSTITUTO ALBERTINO VIEIRA SANTOS - CASA JANE
 * Módulo de Conexão com o Banco de Dados PostgreSQL
 * ============================================================================
 * 
 * Gerencia o pool de conexões com o PostgreSQL usando a biblioteca 'pg'.
 * Suporta ambientes de desenvolvimento local e provedores em nuvem para produção
 * (ex: Supabase, Render, Railway, AWS RDS, Neon) com suporte automático a SSL.
 * 
 * MEDIDAS DE SEGURANÇA E PERFORMANCE:
 * 1. Uso de Pool para reaproveitamento de conexões ativas.
 * 2. Suporte a conexões criptografadas (SSL/TLS) em produção.
 * 3. Timeout de inatividade para liberar conexões ociosas.
 * 4. Exposição de método query() que suporta parâmetros preparados ($1, $2)
 *    contra injeção de SQL (SQL Injection).
 */

const { Pool } = require('pg');
require('dotenv').config();

// Determina se a conexão deve usar SSL (recomendado para banco na nuvem em produção)
const isProduction = process.env.NODE_ENV === 'production';
const requiresSsl = 
  process.env.DATABASE_SSL === 'true' ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')) ||
  (isProduction && !process.env.DATABASE_URL?.includes('localhost'));

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,                          // Máximo de conexões simultâneas no pool
  idleTimeoutMillis: 30000,         // Fecha conexões ociosas após 30 segundos
  connectionTimeoutMillis: 10000,   // Tempo limite de 10s para estabelecer conexão
};

if (requiresSsl) {
  poolConfig.ssl = {
    rejectUnauthorized: false       // Permite certificados válidos de provedores PaaS
  };
}

const pool = new Pool(poolConfig);

// Tratamento de erro em clientes ociosos do pool
pool.on('error', (err) => {
  console.error('[DATABASE_ERROR] Erro inesperado em cliente ocioso do banco:', err.message);
});

module.exports = {
  /**
   * Executa uma consulta SQL parametrizada de forma segura
   * @param {string} text - Instrução SQL com marcadores $1, $2...
   * @param {Array} [params] - Valores correspondentes aos marcadores
   */
  query: (text, params) => pool.query(text, params),
  pool,
};
