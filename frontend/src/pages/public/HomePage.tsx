import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, FileText, ChevronRight, Users, Sparkles, MapPin, Navigation, ExternalLink, Compass, Clock, Building } from 'lucide-react';
import api, { getFileUrl } from '../../services/api';

interface Project  { id: number; name: string; description?: string; category?: string; schedule?: string; }
interface Document { id: number; title: string; category?: string; created_at: string; file_url: string; }
interface DonationConfig { pix_key?: string; message?: string; show_donation_section: boolean; }

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

export default function HomePage() {
  const [projects, setProjects]             = useState<Project[]>([]);
  const [documents, setDocuments]           = useState<Document[]>([]);
  const [donationConfig, setDonationConfig] = useState<DonationConfig | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    api.get('/projects/public')
      .then(({ data }) => setProjects(data.slice(0, 6)))
      .catch(() => {
        api.get('/projects')
          .then(({ data }) => setProjects(data.slice(0, 6)))
          .catch(() => {});
      })
      .finally(() => setLoadingProjects(false));

    api.get('/documents/public')
      .then(({ data }) => setDocuments(data.slice(0, 3)))
      .catch(() => {});

    api.get('/donations/config')
      .then(({ data }) => setDonationConfig(data))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-brand-gradient text-white py-20 md:py-28 shadow-inner">
        {/* Elementos decorativos de fundo */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-plum-900/40 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          {/* Logo Oficial em Destaque */}
          <div className="inline-block relative mb-6 group">
            <div className="absolute inset-0 rounded-3xl bg-white/20 blur-md group-hover:blur-lg transition-all" />
            <img 
              src="/logo-icon.png" 
              alt="Casa Jane" 
              className="relative w-24 h-24 md:w-28 md:h-28 mx-auto object-contain rounded-3xl shadow-2xl bg-white p-2.5 border-4 border-white/40 group-hover:scale-105 transition-transform"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-rose-100 mb-5 border border-white/20">
            <Sparkles size={14} /> Comunidade de Alvorada — Vila Velha/ES
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            Instituto Casa Jane
          </h1>

          <p className="text-lg md:text-xl text-rose-100/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Oficinas gratuitas de <strong>Violão, Violino, Teclado, Flauta Doce</strong>, <strong>Xadrez</strong> e <strong>Jiu-Jitsu</strong> para crianças e adolescentes em situação de vulnerabilidade em Vila Velha/ES.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/matricula"
              className="bg-white text-primary-700 px-8 py-3.5 rounded-full font-bold text-base hover:bg-rose-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>📝</span> Fazer Matrícula Online
            </Link>
            <Link
              to="/projetos"
              className="bg-white/15 backdrop-blur-sm border border-white/30 text-white px-7 py-3.5 rounded-full font-bold text-base hover:bg-white/25 transition-all shadow-sm hover:shadow-md"
            >
              Conheça as Oficinas
            </Link>
            <Link
              to="/como-doar"
              className="border-2 border-white/90 text-white px-7 py-3.5 rounded-full font-bold text-base hover:bg-white/10 transition-all shadow-sm hover:shadow-md"
            >
              Fazer uma Doação
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROJETOS EM DESTAQUE ── */}
      <section className="py-16 bg-gray-50/70">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-1">
                Atividades Gratuitas
              </span>
              <h2 className="text-3xl font-bold text-charcoal-800">Oficinas em Destaque</h2>
            </div>
            <Link
              to="/projetos"
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-sm group"
            >
              Ver todas as oficinas 
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <Users size={40} className="mx-auto mb-2 opacity-30 text-primary-600" />
              <p className="font-medium text-gray-600">Nenhum projeto cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-100 transition-all p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-primary-100">
                      <span className="text-2xl">{getProjectEmoji(p.name, p.category)}</span>
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-plum-50 text-plum-700 mb-2">
                      {p.category || 'Oficina'}
                    </span>
                    <h3 className="font-bold text-xl text-charcoal-800 mb-2 group-hover:text-primary-600 transition-colors">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>

                  {p.schedule && (
                    <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 font-medium">
                      🕐 {p.schedule}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── BANNER DE INSCRIÇÕES E CONTATO ── */}
        <div className="mt-14 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 mb-2">
              Vagas Limitadas • 100% Gratuito
            </span>
            <h3 className="text-2xl font-bold text-charcoal-800 mb-2">
              Quer matricular uma criança ou adolescente?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Atendemos cerca de 40 alunos na Comunidade de Alvorada e região. Cadastre o aluno online pelo nosso formulário e a equipe entrará em contato para confirmar a matrícula.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/matricula"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <span className="text-lg">📝</span> Fazer Matrícula Online
            </Link>
            <a
              href="https://www.instagram.com/institutocasajane/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-2xl font-bold text-sm transition-colors"
            >
              <span>📸</span> Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ── LOCALIZAÇÃO & ESPAÇO ADMV ── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-3">
              <MapPin size={14} /> Onde Acontece o Projeto
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-charcoal-800 tracking-tight mb-3">
              Nossa Localização
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Atualmente, nossas oficinas gratuitas de música, xadrez e jiu-jitsu são realizadas no espaço acolhedor da <strong>Igreja ADMV (Ministério Vencerei)</strong>, no coração do bairro Alvorada em Vila Velha/ES.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Informações e Botão de Navegação Mobile/Desktop */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-gray-50 via-white to-rose-50/30 p-8 rounded-3xl border border-gray-200/80 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 shadow-sm">
                    <Building size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Espaço das Aulas</span>
                    <h3 className="text-xl font-bold text-charcoal-800 leading-snug">
                      Igreja ADMV – Ministério Vencerei
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Parceria comunitária com o Instituto Casa Jane</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-primary-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-charcoal-800">Endereço:</p>
                      <p className="text-gray-600 leading-relaxed">
                        Rua Tarumã, 53 — Bairro Alvorada<br />
                        Vila Velha - ES • CEP 29117-550
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Compass size={18} className="text-plum-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-charcoal-800">Ponto de Referência:</p>
                      <p className="text-gray-600 leading-relaxed">
                        Comunidade de Alvorada e bairros adjacentes (fácil acesso por transporte público e vias principais).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-charcoal-800">Oficinas no Local:</p>
                      <p className="text-gray-600 leading-relaxed">
                        Violão, Violino, Teclado, Flauta Doce, Teoria Musical, Jiu-Jitsu e Xadrez.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação para Celular e Navegador */}
              <div className="pt-6 mt-6 border-t border-gray-200/80 space-y-3">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Igreja+ADMV+Ministério+Vencerei,+Rua+Tarumã,+53+-+Alvorada,+Vila+Velha+-+ES"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 group"
                >
                  <Navigation size={18} className="group-hover:rotate-45 transition-transform" />
                  <span>Traçar Rota no Celular (Ir até o Local)</span>
                </a>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Igreja+ADMV+Ministério+Vencerei,+Rua+Tarumã,+53+-+Alvorada,+Vila+Velha+-+ES"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-charcoal-800 border border-gray-300 rounded-xl font-semibold text-xs transition-colors"
                >
                  <ExternalLink size={15} />
                  <span>Abrir no Google Maps</span>
                </a>
              </div>
            </div>

            {/* Mapa Interativo Google Maps */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-gray-200 shadow-sm relative min-h-[380px] bg-gray-100 flex flex-col">
              <div className="bg-white px-4 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin size={14} className="text-primary-600" />
                  Rua Tarumã, 53, Alvorada — Vila Velha/ES
                </span>
                <span className="text-gray-400 font-mono text-[11px]">Google Maps</span>
              </div>
              <iframe
                title="Localização da Igreja ADMV - Ministério Vencerei"
                src="https://maps.google.com/maps?q=Rua+Tarum%C3%A3,+53+-+Alvorada,+Vila+Velha+-+ES&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                className="w-full h-full min-h-[340px] flex-grow border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── DOAÇÃO CTA ── */}
      {donationConfig?.show_donation_section !== false && (
        <section className="py-16 bg-gradient-to-r from-plum-900 via-primary-800 to-primary-600 text-white relative overflow-hidden">
          <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm border border-white/20">
              <Heart size={32} className="text-white" fill="white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Apoie o Instituto Casa Jane
            </h2>

            <p className="text-rose-100 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              {donationConfig?.message ||
                'Sua doação ajuda a manter nossas oficinas gratuitas e transforma vidas na comunidade.'}
            </p>

            {donationConfig?.pix_key && (
              <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3.5 mb-8 border border-white/25 max-w-full">
                <span className="font-bold text-xs uppercase tracking-wider text-rose-200">Chave PIX:</span>
                <code className="bg-black/20 rounded-lg px-3 py-1 text-sm md:text-base font-mono font-bold break-all">
                  {donationConfig.pix_key}
                </code>
              </div>
            )}

            <div>
              <Link
                to="/como-doar"
                className="inline-block bg-white text-primary-700 px-8 py-3.5 rounded-full font-bold hover:bg-rose-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Ver Todas as Formas de Doação
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── DOCUMENTOS / TRANSPARÊNCIA ── */}
      {documents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-plum-700 block mb-1">
                  Prestação de Contas
                </span>
                <h2 className="text-3xl font-bold text-charcoal-800">Transparência Institucional</h2>
              </div>
              <Link
                to="/transparencia"
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-sm group"
              >
                Ver todos os documentos 
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {documents.map(doc => (
                <a
                  key={doc.id}
                  href={getFileUrl(doc.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-primary-200 hover:bg-white transition-all group"
                >
                  <div className="p-3 bg-primary-50 text-primary-600 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-charcoal-700 border border-gray-200 mb-1 inline-block">
                      {doc.category || 'Documento'}
                    </span>
                    <p className="text-sm font-bold text-charcoal-800 truncate group-hover:text-primary-600 transition-colors">
                      {doc.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
