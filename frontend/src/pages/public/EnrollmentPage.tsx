import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  Calendar, 
  Phone, 
  CreditCard, 
  User, 
  BookOpen, 
  Clock, 
  MapPin, 
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Project {
  id: number;
  name: string;
  category?: string;
  schedule?: string;
}

interface EnrollmentResponse {
  success: boolean;
  message: string;
  student: {
    id: number;
    name: string;
    person_type: string;
    status: string;
  };
  projectName?: string;
  whatsappUrl: string;
  whatsappMessage: string;
}

export default function EnrollmentPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<EnrollmentResponse | null>(null);

  // Form states
  const [form, setForm] = useState({
    name: '',
    birth_date: '',
    cpf: '',
    gender: 'Prefiro não informar',
    school: '',
    school_shift: 'Vespertino',
    guardian_name: '',
    guardian_relationship: 'Mãe',
    guardian_phone: '',
    guardian_email: '',
    address: '',
    neighborhood: 'Alvorada',
    city: 'Vila Velha',
    project_id: '',
    preferred_shift: 'Qualquer',
    has_prior_knowledge: 'Não',
    notes: ''
  });

  // Calculate age dynamically
  const age = form.birth_date ? (() => {
    const b = new Date(form.birth_date);
    if (isNaN(b.getTime())) return null;
    return Math.floor((Date.now() - b.getTime()) / (365.25 * 24 * 3600 * 1000));
  })() : null;

  useEffect(() => {
    api.get('/projects/public')
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setProjects(data);
          if (data.length > 0 && !form.project_id) {
            setForm(prev => ({ ...prev, project_id: String(data[0].id) }));
          }
        }
      })
      .catch(() => {
        // Fallback or empty
      })
      .finally(() => setLoadingProjects(false));
  }, []);

  // Format CPF helper
  const handleCpfChange = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 9) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
    } else if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3)}`;
    }
    setForm(prev => ({ ...prev, cpf: formatted }));
  };

  // Format Phone helper
  const handlePhoneChange = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 6) {
      if (raw.length > 10) {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
      } else {
        formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
      }
    } else if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    }
    setForm(prev => ({ ...prev, guardian_phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Informe o nome completo do aluno.');
      return;
    }

    if (!form.guardian_phone.trim()) {
      toast.error('Informe um telefone/WhatsApp de contato.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        birth_date: form.birth_date || null,
        cpf: form.cpf || null,
        gender: form.gender,
        phone: form.guardian_phone,
        email: form.guardian_email || null,
        address: form.address || null,
        neighborhood: form.neighborhood || 'Alvorada',
        city: form.city || 'Vila Velha',
        school: form.school || null,
        school_shift: form.school_shift,
        guardian_name: form.guardian_name || null,
        guardian_relationship: form.guardian_relationship,
        guardian_phone: form.guardian_phone,
        project_id: form.project_id ? parseInt(form.project_id) : null,
        preferred_shift: form.preferred_shift,
        notes: [
          form.has_prior_knowledge ? `Possui experiência/conhecimento prévio: ${form.has_prior_knowledge}` : null,
          form.notes ? form.notes : null
        ].filter(Boolean).join(' | ')
      };

      const { data } = await api.post<EnrollmentResponse>('/people/public-enroll', payload);
      setSubmittedData(data);
      toast.success('Inscrição realizada com sucesso!');

      // Try automatic opening of WhatsApp without blocking
      if (data.whatsappUrl) {
        try {
          window.open(data.whatsappUrl, '_blank');
        } catch {
          // If popup is blocked, user will click the explicit button on the success screen
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Erro ao enviar inscrição. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedData(null);
    setForm({
      name: '',
      birth_date: '',
      cpf: '',
      gender: 'Prefiro não informar',
      school: '',
      school_shift: 'Vespertino',
      guardian_name: '',
      guardian_relationship: 'Mãe',
      guardian_phone: '',
      guardian_email: '',
      address: '',
      neighborhood: 'Alvorada',
      city: 'Vila Velha',
      project_id: projects[0] ? String(projects[0].id) : '',
      preferred_shift: 'Qualquer',
      has_prior_knowledge: 'Não',
      notes: ''
    });
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedData) {
    return (
      <div className="bg-gray-50/70 min-h-screen py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-center p-8 md:p-12">
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 mb-3">
              <Sparkles size={13} /> Cadastro Efetuado na Plataforma
            </span>

            <h1 className="text-3xl font-extrabold text-charcoal-800 mb-3 tracking-tight">
              Inscrição Concluída com Sucesso!
            </h1>

            <p className="text-gray-600 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              O aluno <strong className="text-charcoal-900">{submittedData.student.name}</strong> foi cadastrado
              com sucesso em nossa lista de espera {submittedData.projectName ? `para a oficina de ${submittedData.projectName}` : ''}.
            </p>

            {/* WhatsApp notification highlight card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-2xl p-6 md:p-8 border border-green-200/80 mb-8 text-left">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-600 text-white rounded-2xl shadow-sm shrink-0">
                  <MessageCircle size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Notificação Automática para a Secretaria
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Para garantir que seu atendimento seja rápido e prioritário, geramos uma mensagem pronta com os dados cadastrados diretamente para a secretaria do Instituto (Carla Daieny).
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={submittedData.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <MessageCircle size={18} />
                      Abrir Notificação no WhatsApp da Carla Daieny
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional info badge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Protocolo</p>
                <p className="text-sm font-bold text-gray-800">#CJ-{submittedData.student.id.toString().padStart(4, '0')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Status</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mt-0.5">
                  Lista de Espera
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Próximo Passo</p>
                <p className="text-xs text-gray-600 mt-0.5">A equipe entrará em contato para agendar o início das aulas.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cadastrar Outro Aluno
              </button>
              <Link
                to="/"
                className="px-6 py-3 bg-charcoal-800 hover:bg-charcoal-900 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Voltar à Página Inicial
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ENROLLMENT FORM VIEW
  return (
    <div className="bg-gray-50/70 min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-10">
          <Link
            to="/projetos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary-600 transition-colors mb-3"
          >
            <ArrowLeft size={14} /> Conheça todos os nossos projetos
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              <UserPlus size={14} /> Inscrições Abertas • 100% Gratuito
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-charcoal-800 tracking-tight mb-3">
            Matrícula de Novo Aluno
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Preencha as informações básicas para cadastrar a criança ou adolescente nas oficinas culturais e esportivas do 
            <strong> Instituto Albertino Vieira Santos – Casa Jane</strong>.
          </p>
        </div>

        {/* Warning / Informative Banner */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 md:p-5 mb-4 flex items-start gap-3.5">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-amber-900 leading-relaxed">
            <strong>Como funciona o processo de matrícula:</strong> Ao enviar este formulário, o aluno será cadastrado na plataforma em nossa lista de espera. Uma mensagem automática será gerada para a nossa secretária <strong>Carla Daieny</strong> para confirmação rápida das turmas e horários disponíveis.
          </div>
        </div>

        {/* Local das Aulas Banner */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 md:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl shrink-0 mt-0.5">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary-600">Local das Oficinas</p>
              <h3 className="text-sm md:text-base font-bold text-charcoal-800">
                Igreja ADMV (Ministério Vencerei) — Rua Tarumã, 53, Alvorada
              </h3>
              <p className="text-xs text-gray-500">Vila Velha/ES • Aulas presenciais em salas equipadas</p>
            </div>
          </div>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Igreja+ADMV+Ministério+Vencerei,+Rua+Tarumã,+53+-+Alvorada,+Vila+Velha+-+ES"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-charcoal-800 rounded-xl text-xs font-semibold transition-colors shrink-0"
          >
            <MapPin size={14} className="text-primary-600" />
            <span>Ver no Maps (Traçar Rota)</span>
          </a>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 space-y-8">
          
          {/* SEÇÃO 1: DADOS DO ALUNO */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-5">
              <div className="p-2 bg-primary-100 text-primary-700 rounded-xl">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-charcoal-800">1. Dados do Aluno (Criança / Jovem)</h2>
                <p className="text-xs text-gray-500">Informações de quem participará das atividades</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nome Completo do Aluno *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Pedro Henrique dos Santos"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Data de Nascimento
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
                  />
                  {age !== null && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 border border-primary-200">
                      {age} {age === 1 ? 'ano' : 'anos'} ({age < 18 ? 'Criança/Jovem' : 'Adulto'})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  CPF do Aluno
                </label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={e => handleCpfChange(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Caso não possua, pode deixar em branco.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Gênero
                </label>
                <select
                  value={form.gender}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm bg-white"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Turno em que Estuda na Escola
                </label>
                <select
                  value={form.school_shift}
                  onChange={e => setForm(f => ({ ...f, school_shift: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm bg-white"
                >
                  <option value="Matutino">Manhã (Matutino)</option>
                  <option value="Vespertino">Tarde (Vespertino)</option>
                  <option value="Integral">Integral</option>
                  <option value="Noturno">Noite (Noturno)</option>
                  <option value="Nenhum / Não estuda">Nenhum / Não estuda</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nome da Escola (opcional)
                </label>
                <input
                  type="text"
                  value={form.school}
                  onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                  placeholder="Ex: EMEF Prof. Darcy Ribeiro"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: DADOS DO RESPONSÁVEL E CONTATO */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-5">
              <div className="p-2 bg-plum-100 text-plum-700 rounded-xl">
                <Phone size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-charcoal-800">2. Responsável Legal & Contato</h2>
                <p className="text-xs text-gray-500">Para confirmação da vaga e recados da coordenação</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nome do Responsável
                </label>
                <input
                  type="text"
                  value={form.guardian_name}
                  onChange={e => setForm(f => ({ ...f, guardian_name: e.target.value }))}
                  placeholder="Nome da mãe, pai ou responsável legal"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Grau de Parentesco
                </label>
                <select
                  value={form.guardian_relationship}
                  onChange={e => setForm(f => ({ ...f, guardian_relationship: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm bg-white"
                >
                  <option value="Mãe">Mãe</option>
                  <option value="Pai">Pai</option>
                  <option value="Avó/Avô">Avó / Avô</option>
                  <option value="Tio/Tia">Tio / Tia</option>
                  <option value="Tutor(a) Legal">Tutor(a) Legal</option>
                  <option value="Irmão/Irmã Maior">Irmão/Irmã Maior</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Telefone / WhatsApp de Contato *
                </label>
                <input
                  type="text"
                  required
                  value={form.guardian_phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  placeholder="(27) 99999-9999"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Número prioritário para o contato da secretaria.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={form.guardian_email}
                  onChange={e => setForm(f => ({ ...f, guardian_email: e.target.value }))}
                  placeholder="exemplo@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Bairro
                </label>
                <input
                  type="text"
                  value={form.neighborhood}
                  onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                  placeholder="Ex: Alvorada"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Cidade
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Vila Velha"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: PROJETO / OFICINA ALMEJADA */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-5">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <BookOpen size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-charcoal-800">3. Oficina ou Atividade Desejada</h2>
                <p className="text-xs text-gray-500">Escolha a atividade que o aluno deseja praticar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Selecione a Oficina / Modalidade *
                </label>
                {loadingProjects ? (
                  <div className="h-12 bg-gray-100 animate-pulse rounded-xl" />
                ) : (
                  <select
                    value={form.project_id}
                    onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm bg-white font-medium text-gray-800"
                  >
                    <option value="">Oficina Geral / A definir com a coordenação</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.category ? `(${p.category})` : ''} {p.schedule ? `— ${p.schedule}` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-[11px] text-gray-500 mt-1.5 block">
                  Oferecemos oficinas de <strong>Violão, Violino, Teclado, Flauta Doce, Teoria Musical, Jiu-Jitsu e Xadrez</strong>.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Turno de Preferência para a Oficina
                </label>
                <select
                  value={form.preferred_shift}
                  onChange={e => setForm(f => ({ ...f, preferred_shift: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm bg-white"
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Qualquer">Qualquer horário disponível</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Já possui instrumento ou experiência prévia?
                </label>
                <select
                  value={form.has_prior_knowledge}
                  onChange={e => setForm(f => ({ ...f, has_prior_knowledge: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm bg-white"
                >
                  <option value="Não">Não, é iniciante</option>
                  <option value="Sim, já praticou antes">Sim, já praticou antes</option>
                  <option value="Possui instrumento próprio">Possui instrumento próprio em casa</option>
                  <option value="Possui instrumento e experiência">Possui instrumento e experiência</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Observações ou Informações Complementares (opcional)
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Informe restrições de saúde, alergias, necessidades pedagógicas especiais ou qualquer outro recado para os professores."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Privacy Note & Submit Button */}
          <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck size={16} className="text-green-600 shrink-0" />
              <span>Seus dados são protegidos e utilizados exclusivamente para gestão das oficinas sociais.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-4 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Cadastrando Aluno...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Finalizar Matrícula & Notificar Secretaria</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
