import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Users, BookOpen, Sparkles, UserPlus } from 'lucide-react';
import api from '../../services/api';

interface Project {
  id: number;
  name: string;
  description?: string;
  category?: string;
  status: string;
  schedule?: string;
  location?: string;
  max_capacity?: number;
  enrollment_count?: number;
}

const getProjectEmoji = (name: string, category?: string) => {
  const n = name.toLowerCase();
  if (n.includes('violino')) return '🎻';
  if (n.includes('violão')) return '🎸';
  if (n.includes('teclado') || n.includes('piano')) return '🎹';
  if (n.includes('flauta')) return '🪈';
  if (n.includes('jiu-jitsu')) return '🥋';
  if (n.includes('xadrez')) return '♟️';
  if (n.includes('teoria') || category?.toLowerCase() === 'música') return '🎼';
  return '✨';
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    api.get('/projects/public')
      .then(({ data }) => setProjects(data))
      .catch(() => {
        api.get('/projects')
          .then(({ data }) => setProjects(data))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(
    new Set(projects.map(p => p.category).filter(Boolean))
  ) as string[];

  const filtered = projects.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gray-50/70 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Cabeçalho */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-3 border border-primary-100">
            <Sparkles size={14} /> Oficinas Gratuitas
          </div>
          <h1 className="text-4xl font-extrabold text-charcoal-800 mb-3 tracking-tight">Nossos Projetos e Oficinas</h1>
          <p className="text-gray-600 text-base leading-relaxed">
            Oferecemos atividades gratuitas de desenvolvimento esportivo, cultural e educacional
            para crianças, jovens e famílias no Instituto Casa Jane.
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[240px] relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou atividade (ex: Jiu-Jitsu, Piano, Violão)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                !selectedCategory
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                  : 'bg-gray-100 text-charcoal-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                    : 'bg-gray-100 text-charcoal-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listagem */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
            <BookOpen size={48} className="mx-auto mb-3 opacity-30 text-primary-600" />
            <p className="text-lg font-bold text-charcoal-800">Nenhum projeto encontrado</p>
            <p className="text-sm mt-1">Tente ajustar a busca ou filtro de categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(proj => (
              <div
                key={proj.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-100 transition-all p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold border border-primary-100">
                      {proj.category || 'Atividade Geral'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-charcoal-600 font-semibold bg-gray-50 px-2.5 py-1 rounded-full">
                      <Users size={14} className="text-primary-600" />
                      {proj.enrollment_count ?? 0} {proj.max_capacity ? `/ ${proj.max_capacity}` : ''} inscritos
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-charcoal-800 mb-2 group-hover:text-primary-600 transition-colors flex items-center gap-2">
                    <span className="text-2xl">{getProjectEmoji(proj.name, proj.category)}</span>
                    <span>{proj.name}</span>
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {proj.description || 'Atividade socioeducativa oferecida gratuitamente pelo Instituto Casa Jane.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500 font-medium">
                  {proj.schedule && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary-600 flex-shrink-0" />
                      <span>{proj.schedule}</span>
                    </div>
                  )}
                  {proj.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-plum-700 flex-shrink-0" />
                      <span>{proj.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inscrições CTA */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Vagas Limitadas</p>
          <h3 className="text-2xl font-bold text-charcoal-800 mb-3">Quer participar de alguma oficina?</h3>
          <p className="text-gray-600 text-sm mb-6 max-w-xl mx-auto leading-relaxed">
            Cadastre o aluno diretamente pelo formulário online para garantir seu lugar na lista de espera.
            Todos os projetos e oficinas são <strong>100% gratuitos</strong> para a comunidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/matricula"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-full font-bold hover:shadow-lg transition-all shadow-md active:scale-95"
            >
              <UserPlus size={18} />
              Fazer Matrícula Online
            </Link>
            <a
              href="https://www.instagram.com/institutocasajane/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-full font-bold hover:bg-primary-100 transition-colors shadow-sm"
            >
              📸 @institutocasajane
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
