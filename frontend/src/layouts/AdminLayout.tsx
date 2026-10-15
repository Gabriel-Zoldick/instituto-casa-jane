import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { LayoutDashboard, Users, FolderKanban, FileText, Heart, UserCog, LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { canAccess } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Pessoas & Família', path: '/admin/pessoas', icon: Users },
    { label: 'Projetos', path: '/admin/projetos', icon: FolderKanban },
    { label: 'Documentos', path: '/admin/documentos', icon: FileText },
    ...(canAccess('donations') ? [{ label: 'Doações', path: '/admin/doacoes', icon: Heart }] : []),
    ...(canAccess('users') ? [{ label: 'Usuários & Permissões', path: '/admin/usuarios', icon: UserCog }] : []),
    ...(user?.role === 'superadmin' ? [{ label: 'Segurança (Security)', path: '/admin/seguranca', icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-gray-50/70">
      {/* Sidebar Oficial Casa Jane */}
      <aside className="w-64 bg-gradient-to-b from-plum-950 via-charcoal-900 to-plum-950 text-white flex flex-col shadow-2xl border-r border-plum-900/40">
        {/* Header da Sidebar com Logo Oficial */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-icon.png" 
              alt="Logo Casa Jane" 
              className="w-10 h-10 object-contain rounded-xl p-0.5 bg-white shadow-md flex-shrink-0" 
            />
            <div className="min-w-0">
              <h2 className="font-extrabold text-base tracking-tight leading-tight text-white truncate">
                Casa Jane
              </h2>
              <p className="text-[11px] text-primary-400 font-semibold tracking-wide">
                Painel Administrativo
              </p>
            </div>
          </div>
        </div>

        {/* Links de navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-gradient text-white shadow-md shadow-primary-950/40 font-semibold'
                    : 'text-rose-100/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-primary-300'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[10px] text-rose-200/70 uppercase font-bold tracking-wider">Conectado como</p>
            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary-600/30 text-rose-300 border border-primary-500/30">
              {user?.role}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-rose-200/80 hover:text-white transition-colors"
              title="Voltar ao site público"
            >
              <ArrowLeft size={14} /> Ver site
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-red-500/20 cursor-pointer"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto bg-gray-50/70">
        <Outlet />
      </main>
    </div>
  );
}
