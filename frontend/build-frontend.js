const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'frontend', 'src');

const files = {
  'services/api.ts': `import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
`,
  'contexts/AuthContext.tsx': `import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
`,
  'hooks/usePermissions.ts': `import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();
  
  const canView = (field: string) => {
    if (!user) return false;
    if (user.role === 'superadmin' || user.role === 'admin') return true;
    return false; // Expand with actual field level rules
  };

  const canAccess = (resource: string) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    // Example basic checks
    if (resource === 'users' && user.role !== 'superadmin') return false;
    if (resource === 'donations' && !['admin', 'superadmin'].includes(user.role)) return false;
    return true;
  };

  return { canView, canAccess };
};
`,
  'components/RoleRoute.tsx': `import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

export const RoleRoute = ({ children, resource }: { children: JSX.Element, resource: string }) => {
  const { canAccess } = usePermissions();
  if (!canAccess(resource)) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};
`,
  'components/PrivateRoute.tsx': `import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};
`,
  'App.tsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';
import { RoleRoute } from './components/RoleRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ProjectsPage from './pages/public/ProjectsPage';
import TransparencyPage from './pages/public/TransparencyPage';
import DonatePage from './pages/public/DonatePage';
import AboutPage from './pages/public/AboutPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import PeopleListPage from './pages/admin/people/PeopleListPage';
import ProjectsListPage from './pages/admin/projects/ProjectsListPage';
import DocumentsPage from './pages/admin/DocumentsPage';
import DonationsConfigPage from './pages/admin/DonationsConfigPage';
import UsersPage from './pages/admin/UsersPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/transparencia" element={<TransparencyPage />} />
        <Route path="/como-doar" element={<DonatePage />} />
        <Route path="/sobre" element={<AboutPage />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="pessoas" element={<PeopleListPage />} />
        <Route path="projetos" element={<ProjectsListPage />} />
        <Route path="documentos" element={<DocumentsPage />} />
        <Route path="doacoes" element={
          <RoleRoute resource="donations">
            <DonationsConfigPage />
          </RoleRoute>
        } />
        <Route path="usuarios" element={
          <RoleRoute resource="users">
            <UsersPage />
          </RoleRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
`,
  'layouts/PublicLayout.tsx': `import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Instituto Casa Jane</Link>
          <nav className="space-x-4">
            <Link to="/sobre" className="hover:text-primary-200">Sobre</Link>
            <Link to="/projetos" className="hover:text-primary-200">Projetos</Link>
            <Link to="/transparencia" className="hover:text-primary-200">Transparência</Link>
            <Link to="/como-doar" className="hover:text-primary-200">Como Doar</Link>
            <Link to="/admin/login" className="bg-white text-primary-600 px-4 py-2 rounded font-medium hover:bg-primary-50">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>Instituto Casa Jane &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
`,
  'layouts/AdminLayout.tsx': `import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { LayoutDashboard, Users, FolderKanban, FileText, Heart, UserCog, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const { canAccess } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-primary-800 text-white flex flex-col">
        <div className="p-4 bg-primary-900 font-bold text-lg text-center">
          Admin Casa Jane
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-2 p-2 hover:bg-primary-700 rounded"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/admin/pessoas" className="flex items-center gap-2 p-2 hover:bg-primary-700 rounded"><Users size={20} /> Pessoas</Link>
          <Link to="/admin/projetos" className="flex items-center gap-2 p-2 hover:bg-primary-700 rounded"><FolderKanban size={20} /> Projetos</Link>
          <Link to="/admin/documentos" className="flex items-center gap-2 p-2 hover:bg-primary-700 rounded"><FileText size={20} /> Documentos</Link>
          {canAccess('donations') && (
            <Link to="/admin/doacoes" className="flex items-center gap-2 p-2 hover:bg-primary-700 rounded"><Heart size={20} /> Doações</Link>
          )}
          {canAccess('users') && (
            <Link to="/admin/usuarios" className="flex items-center gap-2 p-2 hover:bg-primary-700 rounded"><UserCog size={20} /> Usuários</Link>
          )}
        </nav>
        <div className="p-4 border-t border-primary-700">
          <div className="mb-4 text-sm">Olá, {user?.name}</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-red-100 w-full">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
`,
  'pages/public/HomePage.tsx': `import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <section className="bg-primary-600 text-white py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Instituto Casa Jane</h1>
          <p className="text-xl mb-8">Transformando vidas e construindo futuros com a comunidade.</p>
          <Link to="/como-doar" className="bg-white text-primary-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
            Faça uma Doação
          </Link>
        </div>
      </section>
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8 text-primary-800">Projetos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mocks de projetos */}
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h3 className="font-bold text-lg mb-2">Projeto Social {i}</h3>
              <p className="text-gray-600 mb-4">Breve descrição do projeto que atende a comunidade, trazendo oportunidades de desenvolvimento.</p>
              <Link to="/projetos" className="text-primary-600 font-medium hover:underline">Ver detalhes</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
`,
  'pages/public/ProjectsPage.tsx': `import React from 'react';

const ProjectsPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary-800 mb-8">Nossos Projetos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-4">Categoria</span>
            <h3 className="font-bold text-xl mb-2">Projeto Ativo {i}</h3>
            <p className="text-gray-600 mb-4">Descrição completa sobre as atividades desenvolvidas neste projeto.</p>
            <div className="text-sm text-gray-500">
              <p><strong>Horário:</strong> Segunda a Sexta, 14h - 18h</p>
              <p><strong>Participantes:</strong> 25 vagas</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
`,
  'pages/public/TransparencyPage.tsx': `import React from 'react';
import { Download } from 'lucide-react';

const TransparencyPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary-800 mb-8">Transparência</h1>
      <p className="text-gray-600 mb-8">Acesso público a relatórios financeiros, atas e estatuto do Instituto.</p>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {[1,2,3,4].map(i => (
            <li key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h4 className="font-medium text-gray-900">Relatório Financeiro 202{i}</h4>
                <p className="text-sm text-gray-500">Adicionado em: 10/10/2026</p>
              </div>
              <button className="flex items-center gap-2 text-primary-600 hover:text-primary-800">
                <Download size={20} /> Baixar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TransparencyPage;
`,
  'pages/public/DonatePage.tsx': `import React from 'react';

const DonatePage = () => {
  return (
    <div className="container mx-auto px-4 py-12 text-center max-w-2xl">
      <h1 className="text-3xl font-bold text-primary-800 mb-4">Faça uma Doação</h1>
      <p className="text-gray-600 mb-8">Sua contribuição ajuda a manter nossos projetos sociais e transformar a vida de muitas pessoas.</p>
      
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Chave PIX</h2>
        <div className="bg-gray-100 p-4 rounded text-2xl font-mono mb-4 break-all">
          00.000.000/0001-00
        </div>
        <p className="text-sm text-gray-500 mb-8">CNPJ - Instituto Casa Jane</p>
        
        <div className="w-48 h-48 bg-gray-200 mx-auto flex items-center justify-center rounded-lg mb-4">
          <span className="text-gray-500">[QR CODE PIX]</span>
        </div>
        
        <p className="text-lg font-medium text-primary-700 mt-8">Muito obrigado pelo seu apoio!</p>
      </div>
    </div>
  );
};

export default DonatePage;
`,
  'pages/public/AboutPage.tsx': `import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-primary-800 mb-6">Sobre o Instituto</h1>
      <div className="prose lg:prose-xl text-gray-700">
        <p>O Instituto Casa Jane é uma organização sem fins lucrativos dedicada a promover a assistência social, educação e cultura.</p>
        <p>Fundada com o propósito de acolher e desenvolver, atuamos diretamente na comunidade, oferecendo projetos voltados para crianças, jovens e adultos.</p>
        <h3>Nossa Missão</h3>
        <p>Proporcionar oportunidades de desenvolvimento integral e cidadania plena.</p>
      </div>
    </div>
  );
};

export default AboutPage;
`,
  'pages/admin/LoginPage.tsx': `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login for frontend only
    if (email === 'admin@institutocasajane.org.br' && password === 'password') {
      login('dummy-jwt-token', { id: 1, name: 'Admin', email, role: 'superadmin', active: true });
      navigate('/admin');
      toast.success('Login realizado com sucesso!');
    } else {
      toast.error('Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary-800">Instituto Casa Jane</h2>
          <p className="text-gray-500 mt-2">Área Administrativa</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Entrar
          </button>
        </form>
        <div className="mt-6 text-xs text-gray-400 text-center">
          Dica: admin@institutocasajane.org.br / password (altere no primeiro acesso)
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
`,
  'pages/admin/DashboardPage.tsx': `import React from 'react';
import { Users, User, FolderKanban } from 'lucide-react';

const DashboardPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Pessoas</p>
            <p className="text-2xl font-bold text-gray-800">1,250</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Crianças</p>
            <p className="text-2xl font-bold text-gray-800">840</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Adultos</p>
            <p className="text-2xl font-bold text-gray-800">410</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <FolderKanban size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Projetos Ativos</p>
            <p className="text-2xl font-bold text-gray-800">12</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Matrículas Recentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">João Silva</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Apoio Escolar</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10/10/2026</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Maria Oliveira</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oficina de Informática</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">09/10/2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
`,
  'pages/admin/people/PeopleListPage.tsx': `import React from 'react';

const PeopleListPage = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Pessoas</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Nova Pessoa</button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-4 mb-4">
          <input type="text" placeholder="Buscar por nome..." className="border p-2 rounded flex-1" />
          <select className="border p-2 rounded"><option>Todos os Tipos</option><option>Adulto</option><option>Criança</option></select>
          <select className="border p-2 rounded"><option>Todos os Status</option><option>Ativo</option><option>Inativo</option></select>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4">Exemplo da Silva</td>
              <td className="px-6 py-4">Adulto</td>
              <td className="px-6 py-4"><span className="px-2 bg-green-100 text-green-800 rounded-full text-xs">Ativo</span></td>
              <td className="px-6 py-4 text-primary-600 hover:text-primary-800 cursor-pointer">Ver</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PeopleListPage;
`,
  'pages/admin/projects/ProjectsListPage.tsx': `import React from 'react';

const ProjectsListPage = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Projetos</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Novo Projeto</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg mb-2">Projeto Social {i}</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Ativo</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">Descrição curta do projeto.</p>
            <div className="text-sm">
              <p><strong>Participantes:</strong> 15/20</p>
            </div>
            <button className="mt-4 text-primary-600 hover:underline text-sm font-medium">Gerenciar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsListPage;
`,
  'pages/admin/DocumentsPage.tsx': `import React from 'react';

const DocumentsPage = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Documentos Públicos e Internos</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Novo Documento</button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500 italic">Lista de documentos do sistema.</p>
      </div>
    </div>
  );
};

export default DocumentsPage;
`,
  'pages/admin/DonationsConfigPage.tsx': `import React from 'react';

const DonationsConfigPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuração de Doações</h1>
      <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Chave PIX</label>
            <input type="text" className="mt-1 block w-full border p-2 rounded" defaultValue="00.000.000/0001-00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mensagem de Agradecimento</label>
            <textarea className="mt-1 block w-full border p-2 rounded" rows={4} defaultValue="Muito obrigado pelo seu apoio!"></textarea>
          </div>
          <button type="button" className="bg-primary-600 text-white px-4 py-2 rounded">Salvar Configurações</button>
        </form>
      </div>
    </div>
  );
};

export default DonationsConfigPage;
`,
  'pages/admin/UsersPage.tsx': `import React from 'react';

const UsersPage = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuários e Permissões</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Novo Usuário</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Papel</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4">Admin</td>
              <td className="px-6 py-4">admin@institutocasajane.org.br</td>
              <td className="px-6 py-4"><span className="px-2 bg-purple-100 text-purple-800 rounded-full text-xs">Superadmin</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
`
};

Object.entries(files).forEach(([file, content]) => {
  const fullPath = path.join(baseDir, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
});

console.log('Done writing component files.');
