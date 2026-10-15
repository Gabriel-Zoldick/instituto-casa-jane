import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Lock, Home, BookOpen, FileText, Info, UserPlus } from 'lucide-react';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Início', path: '/', icon: Home },
    { label: 'Projetos', path: '/projetos', icon: BookOpen },
    { label: 'Matrícula', path: '/matricula', icon: UserPlus },
    { label: 'Transparência', path: '/transparencia', icon: FileText },
    { label: 'Sobre', path: '/sobre', icon: Info },
    { label: 'Como Doar', path: '/como-doar', icon: Heart, highlight: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          {/* Logo Oficial com Ícone da Casa Jane */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative">
              <img 
                src="/logo-icon.png" 
                alt="Instituto Casa Jane Logo" 
                className="h-12 w-12 object-contain rounded-2xl shadow-sm border border-gray-100 p-0.5 group-hover:scale-105 transition-transform bg-white"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-600"></span>
              </span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-charcoal-800 tracking-tight block group-hover:text-primary-600 transition-colors">
                Instituto Casa Jane
              </span>
              <span className="text-xs font-semibold text-primary-600 tracking-wide block -mt-0.5">
                Serviços Gratuitos à Comunidade
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="ml-3 flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-gradient hover:bg-brand-gradient-hover text-white font-semibold text-sm transition-all shadow-md shadow-primary-600/25 hover:shadow-lg hover:shadow-primary-600/35 hover:-translate-y-0.5"
                  >
                    <Heart size={16} fill="currentColor" /> {link.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold border border-primary-100'
                      : 'text-charcoal-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              to="/admin/login"
              className="ml-2 p-2.5 rounded-xl text-gray-400 hover:text-plum-700 hover:bg-plum-50 transition-colors"
              title="Acesso Administrativo"
            >
              <Lock size={18} />
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-charcoal-700 hover:bg-gray-100"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-charcoal-700 hover:bg-gray-50'
                }`}
              >
                <link.icon size={18} className={location.pathname === link.path ? 'text-primary-600' : 'text-gray-400'} />
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-plum-700 hover:bg-plum-50"
              >
                <Lock size={18} /> Acesso Administrativo
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-charcoal-900 text-gray-300 pt-16 pb-8 border-t border-charcoal-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Coluna 1: Sobre & Logo */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3.5 bg-white/5 p-3 rounded-2xl w-fit border border-white/10">
                <img 
                  src="/logo-icon.png" 
                  alt="Casa Jane" 
                  className="w-12 h-12 object-contain rounded-xl bg-white p-0.5" 
                />
                <div>
                  <span className="text-xl font-bold text-white tracking-tight block">
                    Instituto Casa Jane
                  </span>
                  <span className="text-xs text-primary-400 font-medium block">
                    Acolhimento, Esporte & Cultura
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Instituição sem fins lucrativos que presta serviços gratuitos à comunidade,
                promovendo oficinas socioeducativas de Jiu-Jitsu, Piano, Violão e apoio familiar integral.
              </p>
            </div>

            {/* Coluna 2: Navegação */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Navegação
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Início</Link></li>
                <li><Link to="/projetos" className="hover:text-primary-400 transition-colors">Projetos Sociais</Link></li>
                <li><Link to="/matricula" className="hover:text-primary-400 transition-colors text-primary-400 font-medium">Matrícula de Alunos</Link></li>
                <li><Link to="/transparencia" className="hover:text-primary-400 transition-colors">Transparência</Link></li>
                <li><Link to="/sobre" className="hover:text-primary-400 transition-colors">Sobre Nós</Link></li>
                <li><Link to="/como-doar" className="hover:text-primary-400 transition-colors">Como Doar</Link></li>
              </ul>
            </div>

            {/* Coluna 3: Contato */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Contato &amp; Inscrições
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">📍</span>
                  <div>
                    <span className="text-gray-200 font-medium block">Igreja ADMV (Ministério Vencerei)</span>
                    <span className="text-xs text-gray-400 block">Rua Tarumã, 53 — Alvorada, Vila Velha/ES</span>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Igreja+ADMV+Ministério+Vencerei,+Rua+Tarumã,+53+-+Alvorada,+Vila+Velha+-+ES"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary-400 hover:text-primary-300 font-semibold mt-0.5"
                    >
                      🗺️ Traçar Rota no Maps
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">💬</span>
                  <div>
                    <span className="text-gray-300 font-medium block">Carla Daieny</span>
                    <a href="https://wa.me/5527998992509" target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                      (27) 99899-2509
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">📸</span>
                  <a href="https://www.instagram.com/institutocasajane/" target="_blank" rel="noreferrer" className="text-primary-400 hover:text-primary-300 transition-colors">
                    @institutocasajane
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Transparência */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Transparência
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                Consulte nossos relatórios de prestação de contas, estatuto social e atas de reunião.
              </p>
              <Link
                to="/transparencia"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-charcoal-800 text-primary-400 text-xs font-semibold hover:bg-charcoal-700 transition-colors border border-charcoal-700"
              >
                <FileText size={14} /> Documentos Públicos
              </Link>
              <div className="mt-4 pt-4 border-t border-charcoal-800">
                <p className="text-gray-500 text-xs">CNPJ</p>
                <p className="text-gray-300 text-xs font-mono font-semibold">46.951.269/0001-54</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} Instituto Albertino Vieira Santos – Casa Jane. Todos os direitos reservados.</p>
            <p className="text-primary-400 font-medium">Serviços 100% gratuitos para a comunidade.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
