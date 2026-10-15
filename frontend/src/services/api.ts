/**
 * ============================================================================
 * INSTITUTO ALBERTINO VIEIRA SANTOS - CASA JANE
 * Cliente HTTP Centralizado (Axios)
 * Domínio de Produção: institutocasajane.com.br
 * ============================================================================
 * 
 * Centraliza todas as chamadas de API da aplicação web com interceptores de:
 * 1. Injeção automática do Token JWT (Bearer) a partir do localStorage.
 * 2. Tratamento inteligente de erro 401 (Sessão expirada/inválida), redirecionando
 *    o usuário ao login administrativo sem recargas em falso.
 * 3. Resolução dinâmica de URLs de arquivos estáticos (fotos de alunos e documentos)
 *    suportando tanto o ambiente de desenvolvimento quanto o domínio de produção.
 */

import axios from 'axios';

// Define a URL base da API a partir de variável de ambiente do Vite ou fallback local
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000 // Timeout de 30 segundos para requisições
});

// Interceptor de Requisição: Injeta o token JWT no cabeçalho Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta: Trata expiração de sessão e redirecionamento de segurança
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      
      // Apenas redireciona se estiver navegando na área administrativa e não na própria tela de login
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Converte um caminho relativo de arquivo armazenado (/uploads/...) em uma URL completa
 * acessível pelo navegador no ambiente local ou no domínio oficial de produção.
 * 
 * @param url - Caminho relativo retornado pela API (ex: '/uploads/foto-123.jpg')
 * @returns URL absoluta pronta para exibição ou download
 */
export const getFileUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const rawApiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const serverBase = rawApiBase.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  
  return `${serverBase}${cleanPath}`;
};

export default api;
