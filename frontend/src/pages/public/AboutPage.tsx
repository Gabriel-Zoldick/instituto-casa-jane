import { Heart, Users, Target, Award, Sparkles, MapPin, Navigation, ExternalLink, Building, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="bg-gray-50/70 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-bold mb-4 border border-primary-100">
            <Sparkles size={14} /> Transformação Social &amp; Comunitária
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal-800 mb-4 tracking-tight">
            Sobre o Instituto Casa Jane
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Uma instituição sem fins lucrativos localizada em Vila Velha/ES, que promove a inclusão social e o
            desenvolvimento de crianças, adolescentes e famílias em situação de vulnerabilidade na Comunidade
            de Alvorada e bairros adjacentes.
          </p>
        </div>

        {/* Dados Institucionais */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 mb-12">
          <h2 className="text-xl font-bold text-charcoal-800 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-plum-100 text-plum-700 flex items-center justify-center text-sm">📋</span>
            Informações Institucionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-0.5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Razão Social</span>
              <span className="font-semibold text-charcoal-800">Instituto Albertino Vieira Santos – Casa Jane</span>
            </div>
            <div className="flex flex-col gap-0.5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">CNPJ</span>
              <span className="font-semibold text-charcoal-800">
                46.951.269/0001-54{' '}
                <span className="text-xs font-normal text-green-600">(Ativo desde 08/06/2022)</span>
              </span>
            </div>
            <div className="flex flex-col gap-0.5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Localização</span>
              <span className="font-semibold text-charcoal-800">
                Comunidade de Alvorada e bairros adjacentes, Vila Velha/ES
              </span>
            </div>
            <div className="flex flex-col gap-0.5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Público Atendido</span>
              <span className="font-semibold text-charcoal-800">
                Cerca de 40 crianças e adolescentes, com apoio de professores e voluntários
              </span>
            </div>
            <div className="flex flex-col gap-0.5 p-4 rounded-2xl bg-gray-50 border border-gray-100 md:col-span-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Redes Sociais</span>
              <a
                href="https://www.instagram.com/institutocasajane/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors inline-flex items-center gap-1"
              >
                📸 @institutocasajane no Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-100">
              <Target size={26} />
            </div>
            <h3 className="text-xl font-bold text-charcoal-800 mb-2">Nossa Missão</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Democratizar o acesso à cultura, arte, esporte e cidadania, gerando oportunidades reais de
              transformação e autonomia para as famílias assistidas.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-plum-50 text-plum-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-plum-100">
              <Heart size={26} />
            </div>
            <h3 className="text-xl font-bold text-charcoal-800 mb-2">Nossos Valores</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Transparência, acolhimento, respeito à dignidade humana, trabalho colaborativo comunitário
              e compromisso com o futuro das crianças.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-charcoal-100 text-charcoal-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-charcoal-200">
              <Award size={26} />
            </div>
            <h3 className="text-xl font-bold text-charcoal-800 mb-2">Nossa Visão</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Ser referência em impacto social e integração comunitária, capacitando gerações através da
              educação e da convivência saudável.
            </p>
          </div>
        </div>

        {/* Áreas de Atuação */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-charcoal-800 text-center mb-10 tracking-tight">
            O que fazemos na prática
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-xl flex-shrink-0">
                🎸
              </div>
              <div>
                <h4 className="font-bold text-charcoal-800 text-lg mb-1">Música — Violão, Violino &amp; Mais</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Aulas de violão, violino, teclado, flauta doce e teoria musical para crianças e jovens,
                  desenvolvendo criatividade, disciplina e expressão artística.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-plum-100 text-plum-700 flex items-center justify-center text-xl flex-shrink-0">
                🥋
              </div>
              <div>
                <h4 className="font-bold text-charcoal-800 text-lg mb-1">Esporte — Jiu-Jitsu</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Oficinas de jiu-jitsu para crianças e adolescentes, ensinando disciplina, autocontrole,
                  respeito mútuo e condicionamento físico.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl flex-shrink-0">
                ♟️
              </div>
              <div>
                <h4 className="font-bold text-charcoal-800 text-lg mb-1">Xadrez &amp; Raciocínio Lógico</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Aulas de xadrez com ênfase pedagógica, incluindo campeonatos internos voltados ao
                  desenvolvimento do raciocínio lógico e foco.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-charcoal-100 text-charcoal-800 flex items-center justify-center text-xl flex-shrink-0">
                👨‍👩‍👧‍👦
              </div>
              <div>
                <h4 className="font-bold text-charcoal-800 text-lg mb-1">Acolhimento Familiar</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Apoio contínuo às famílias e responsáveis, garantindo uma rede de suporte e integração
                  entre pais e filhos da comunidade.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inscrições */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12">
          <h2 className="text-xl font-bold text-charcoal-800 mb-2 flex items-center gap-2">
            <span className="text-2xl">📝</span> Como se inscrever
          </h2>
          <p className="text-gray-600 text-sm mb-5 leading-relaxed">
            As vagas para as oficinas são <strong>limitadas e 100% gratuitas</strong>. Você pode cadastrar o aluno diretamente pelo nosso formulário online no site:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/matricula"
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-50 to-rose-50 border border-primary-200 rounded-2xl hover:bg-primary-100 transition-colors group flex-1"
            >
              <span className="text-3xl">📋</span>
              <div>
                <p className="font-bold text-primary-800 text-sm group-hover:text-primary-900">Formulário de Matrícula Online</p>
                <p className="text-primary-700 font-semibold text-base">Cadastrar Novo Aluno</p>
                <p className="text-xs text-gray-500">Inscrição rápida com notificação automática à secretaria</p>
              </div>
            </Link>
            <a
              href="https://www.instagram.com/institutocasajane/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-6 py-4 bg-primary-50 border border-primary-100 rounded-2xl hover:bg-primary-100 transition-colors group flex-1"
            >
              <span className="text-3xl">📸</span>
              <div>
                <p className="font-bold text-charcoal-800 text-sm group-hover:text-primary-700">Siga no Instagram</p>
                <p className="text-primary-600 font-semibold text-base">@institutocasajane</p>
                <p className="text-xs text-gray-500">Novidades e fotos das oficinas</p>
              </div>
            </a>
          </div>
        </div>

        {/* Localização & Espaço ADMV */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
                <Building size={14} /> Espaço Cedido para as Aulas
              </span>
              <h2 className="text-2xl font-bold text-charcoal-800">
                Onde as Atividades Acontecem
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Conheça a estrutura da <strong>Igreja ADMV (Ministério Vencerei)</strong>, que cede generosamente o espaço para as oficinas da Casa Jane.
              </p>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Igreja+ADMV+Ministério+Vencerei,+Rua+Tarumã,+53+-+Alvorada,+Vila+Velha+-+ES"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
            >
              <Navigation size={18} />
              <span>Traçar Rota no Celular</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="space-y-4 bg-gray-50/80 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
              <div className="space-y-3.5 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-charcoal-800">Endereço:</p>
                    <p className="text-gray-600">
                      Rua Tarumã, 53 — Bairro Alvorada<br />
                      Vila Velha - ES • CEP: 29117-550
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Compass size={18} className="text-plum-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-charcoal-800">Espaço Físico:</p>
                    <p className="text-gray-600 leading-relaxed">
                      Salas climatizadas para os instrumentos musicais (violão, teclado, violino, flauta) e área equipada com tatame para as oficinas de jiu-jitsu e mesas de xadrez.
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Igreja+ADMV+Ministério+Vencerei,+Rua+Tarumã,+53+-+Alvorada,+Vila+Velha+-+ES"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-charcoal-800 border border-gray-200 rounded-xl font-semibold text-xs transition-colors"
              >
                <ExternalLink size={14} /> Abrir no Aplicativo Maps
              </a>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm min-h-[260px] bg-gray-100">
              <iframe
                title="Mapa de Localização - Igreja ADMV Alvorada"
                src="https://maps.google.com/maps?q=Rua+Tarum%C3%A3,+53+-+Alvorada,+Vila+Velha+-+ES&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                className="w-full h-full min-h-[260px] border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Chamada Final */}
        <div className="bg-brand-gradient text-white rounded-3xl p-8 md:p-12 text-center shadow-xl">
          <Users size={40} className="mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Faça parte desta história</h2>
          <p className="text-rose-100 max-w-xl mx-auto mb-6 text-sm md:text-base leading-relaxed">
            Seja como voluntário, parceiro institucional ou doador, a sua ajuda é fundamental para mantermos
            as portas abertas e acolher cada vez mais pessoas na Comunidade de Alvorada.
          </p>
          <Link
            to="/como-doar"
            className="inline-block bg-white text-primary-700 font-bold px-8 py-3.5 rounded-full hover:bg-rose-50 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Quero Ajudar
          </Link>
        </div>
      </div>
    </div>
  );
}
