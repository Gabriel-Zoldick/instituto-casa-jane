import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Clock,
  UserCheck,
  UserX,
  FileText,
  Settings2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SecurityStats {
  total_users: string | number;
  active_users: string | number;
  locked_users: string | number;
  locked_by_attempts: string | number;
  locked_by_inactivity: string | number;
  failed_logins_24h: string | number;
  successful_logins_24h: string | number;
  locks_triggered_24h: string | number;
}

interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface SecuritySettings {
  max_failed_attempts: number;
  inactivity_days_limit: number;
  session_timeout_hours: number;
  require_strong_passwords: boolean;
}

interface LockedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  lock_reason: string;
  failed_login_attempts: number;
  last_login_at?: string;
  locked_at?: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  LOGIN_SUCCESS: { label: 'Login Sucesso', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  LOGIN_FAILED: { label: 'Falha de Login', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertTriangle },
  LOGIN_BLOCKED_ATTEMPT: { label: 'Tentativa Bloqueada', color: 'bg-red-100 text-red-800 border-red-200', icon: Lock },
  USER_BLOCKED_ATTEMPTS: { label: 'Bloqueio por 5 Falhas', color: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', icon: ShieldAlert },
  USER_BLOCKED_INACTIVE: { label: 'Bloqueio por Inatividade (60d)', color: 'bg-purple-100 text-purple-800 border-purple-300 font-bold', icon: Clock },
  USER_UNLOCKED: { label: 'Usuário Desbloqueado', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Unlock },
  USER_MANUALLY_LOCKED: { label: 'Bloqueio Manual', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Lock },
  USER_CREATED: { label: 'Usuário Criado', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: UserCheck },
  USER_UPDATED: { label: 'Usuário Alterado', color: 'bg-sky-100 text-sky-800 border-sky-200', icon: UserCheck },
  USER_DELETED: { label: 'Usuário Excluído', color: 'bg-red-100 text-red-700 border-red-200', icon: UserX },
  PERSON_CREATED: { label: 'Pessoa Cadastrada', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: FileText },
  PERSON_UPDATED: { label: 'Pessoa Atualizada', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: FileText },
  PERSON_DELETED: { label: 'Pessoa Excluída', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: FileText },
  DOCUMENT_UPLOADED: { label: 'Documento Enviado', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: FileText },
  DOCUMENT_DELETED: { label: 'Documento Excluído', color: 'bg-red-100 text-red-800 border-red-200', icon: FileText },
  SECURITY_SETTINGS_UPDATED: { label: 'Políticas Alteradas', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200', icon: Settings2 },
};

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'settings' | 'locked'>('logs');
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Logs state
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Settings state
  const [settings, setSettings] = useState<SecuritySettings>({
    max_failed_attempts: 5,
    inactivity_days_limit: 60,
    session_timeout_hours: 24,
    require_strong_passwords: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Locked users state
  const [lockedUsers, setLockedUsers] = useState<LockedUser[]>([]);
  const [lockedLoading, setLockedLoading] = useState(false);
  const [sweeping, setSweeping] = useState(false);

  // Carrega stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get('/security/stats');
      setStats(data);
    } catch {
      toast.error('Erro ao carregar métricas de segurança');
    } finally {
      setStatsLoading(false);
    }
  };

  // Carrega logs
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (actionFilter && actionFilter !== 'ALL') params.action = actionFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get('/security/logs', { params });
      setLogs(data.logs);
      setTotalPages(data.totalPages || 1);
      setTotalLogs(data.total || 0);
    } catch {
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLogsLoading(false);
    }
  }, [page, actionFilter, search]);

  // Carrega settings
  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const { data } = await api.get('/security/settings');
      setSettings(data);
    } catch {
      toast.error('Erro ao obter políticas de segurança');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Carrega usuários bloqueados
  const fetchLockedUsers = async () => {
    setLockedLoading(true);
    try {
      const { data } = await api.get('/users');
      const locked = data.filter((u: any) => u.is_locked);
      setLockedUsers(locked);
    } catch {
      toast.error('Erro ao listar usuários bloqueados');
    } finally {
      setLockedLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') fetchLogs();
    if (activeTab === 'locked') fetchLockedUsers();
  }, [activeTab, fetchLogs]);

  // Salvar políticas
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/security/settings', settings);
      toast.success('Políticas de segurança atualizadas com sucesso!');
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar políticas');
    } finally {
      setSavingSettings(false);
    }
  };

  // Desbloquear usuário
  const handleUnlock = async (userId: number, userName: string) => {
    if (!confirm(`Confirmar o desbloqueio da conta de "${userName}"?`)) return;
    try {
      await api.post(`/users/${userId}/unlock`);
      toast.success(`Usuário "${userName}" desbloqueado com sucesso!`);
      fetchLockedUsers();
      fetchStats();
      if (activeTab === 'logs') fetchLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao desbloquear usuário');
    }
  };

  // Executar varredura de inatividade manual
  const handleRunInactivitySweep = async () => {
    if (!confirm('Deseja executar a verificação de contas inativas agora? Usuários com mais de 60 dias sem login serão bloqueados automaticamente.')) return;
    setSweeping(true);
    try {
      const { data } = await api.post('/security/check-inactivity');
      toast.success(data.message);
      fetchStats();
      fetchLockedUsers();
      if (activeTab === 'logs') fetchLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao executar varredura');
    } finally {
      setSweeping(false);
    }
  };

  // Exportar logs em CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('Nenhum log para exportar no filtro atual');
      return;
    }
    const headers = ['ID', 'Data/Hora', 'Usuário', 'E-mail', 'Perfil', 'Ação', 'IP', 'Detalhes'];
    const rows = logs.map(l => [
      l.id,
      new Date(l.created_at).toLocaleString('pt-BR'),
      l.user_name || 'Anônimo',
      l.user_email || '—',
      l.user_role || '—',
      l.action,
      l.ip_address || '—',
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_casa_jane_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Relatório de auditoria exportado com sucesso!');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner de Segurança */}
      <div className="bg-gradient-to-r from-plum-950 via-charcoal-900 to-primary-950 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-semibold mb-3 border border-white/15">
            <ShieldCheck size={14} className="text-green-400" /> Painel de Segurança Ativo • Super Admin
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Centro de Segurança &amp; Auditoria</h1>
          <p className="text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
            Monitoramento em tempo real de tentativas de acesso, bloqueio automático por 5 falhas, 
            política de inatividade de 60 dias e rastreamento completo de ações administrativas.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { fetchStats(); fetchLogs(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw size={14} className={statsLoading ? 'animate-spin' : ''} /> Atualizar
          </button>
          <button
            onClick={handleRunInactivitySweep}
            disabled={sweeping}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-md shadow-primary-600/30 cursor-pointer disabled:opacity-50"
          >
            <Clock size={14} /> {sweeping ? 'Verificando...' : 'Varredura de Inatividade'}
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Usuários Bloqueados */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Contas Bloqueadas</p>
            <p className="text-2xl font-extrabold text-charcoal-800 mt-1">
              {stats?.locked_users ?? 0}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {stats?.locked_by_attempts ?? 0} por falhas • {stats?.locked_by_inactivity ?? 0} por inatividade
            </p>
          </div>
          <div className={`p-3 rounded-2xl ${Number(stats?.locked_users || 0) > 0 ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'}`}>
            <Lock size={22} />
          </div>
        </div>

        {/* Card 2: Falhas de Login (24h) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Falhas de Login (24h)</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {stats?.failed_logins_24h ?? 0}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {stats?.locks_triggered_24h ?? 0} bloqueio(s) disparado(s)
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Card 3: Logins com Sucesso (24h) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Logins Autorizados (24h)</p>
            <p className="text-2xl font-extrabold text-green-600 mt-1">
              {stats?.successful_logins_24h ?? 0}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Autenticações válidas
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-green-100 text-green-600">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 4: Política de Segurança */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Regras de Proteção</p>
            <p className="text-lg font-bold text-charcoal-800 mt-1">
              5 falhas / 60 dias
            </p>
            <p className="text-[11px] text-primary-600 font-semibold mt-0.5">
              Auto-bloqueio ativado
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-plum-100 text-plum-700">
            <ShieldAlert size={22} />
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-6 pt-4 gap-6 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-charcoal-800'
            }`}
          >
            <FileText size={16} /> Logs de Auditoria &amp; Ações ({totalLogs})
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'locked'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-charcoal-800'
            }`}
          >
            <Lock size={16} /> Contas Bloqueadas ({stats?.locked_users ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-charcoal-800'
            }`}
          >
            <Settings2 size={16} /> Políticas de Segurança
          </button>
        </div>

        {/* ── CONTEÚDO DA ABA 1: LOGS DE AUDITORIA ── */}
        {activeTab === 'logs' && (
          <div className="p-6 space-y-5">
            {/* Filtros e Busca */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex flex-1 flex-wrap gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Buscar por usuário, e-mail, IP ou detalhe..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={actionFilter}
                    onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                    className="py-2 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="ALL">Todas as Ações</option>
                    <option value="LOGIN_SUCCESS">Login Sucesso</option>
                    <option value="LOGIN_FAILED">Falha de Senha</option>
                    <option value="LOGIN_BLOCKED_ATTEMPT">Tentativa em Conta Bloqueada</option>
                    <option value="USER_BLOCKED_ATTEMPTS">Bloqueio Automático (5 falhas)</option>
                    <option value="USER_BLOCKED_INACTIVE">Bloqueio por Inatividade (60d)</option>
                    <option value="USER_UNLOCKED">Usuário Desbloqueado</option>
                    <option value="USER_CREATED">Usuário Criado</option>
                    <option value="USER_UPDATED">Usuário Editado</option>
                    <option value="USER_DELETED">Usuário Excluído</option>
                    <option value="PERSON_CREATED">Beneficiário Cadastrado</option>
                    <option value="PERSON_UPDATED">Beneficiário Atualizado</option>
                    <option value="DOCUMENT_UPLOADED">Documento Enviado</option>
                    <option value="SECURITY_SETTINGS_UPDATED">Políticas Atualizadas</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-charcoal-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download size={14} /> Exportar CSV
              </button>
            </div>

            {/* Tabela de Logs */}
            {logsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <HelpCircle size={40} className="mx-auto mb-2 opacity-30 text-charcoal-400" />
                <p className="text-sm font-medium">Nenhum registro de log encontrado para os filtros selecionados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Data / Hora</th>
                      <th className="px-4 py-3">Ação / Evento</th>
                      <th className="px-4 py-3">Usuário</th>
                      <th className="px-4 py-3">IP / Origem</th>
                      <th className="px-4 py-3">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map(log => {
                      const actionMeta = ACTION_LABELS[log.action] || {
                        label: log.action,
                        color: 'bg-gray-100 text-gray-700 border-gray-200',
                        icon: FileText
                      };
                      const Icon = actionMeta.icon;

                      return (
                        <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${actionMeta.color}`}>
                              <Icon size={12} /> {actionMeta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-charcoal-800">
                              {log.user_name || 'Sistema / Convidado'}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">
                              {log.user_email || '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                            {log.ip_address || '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-md truncate" title={log.details || ''}>
                            {log.details || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginação */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <p>Total: <strong>{totalLogs}</strong> eventos registrados</p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>Página {page} de {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTEÚDO DA ABA 2: CONTAS BLOQUEADAS ── */}
        {activeTab === 'locked' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-rose-50 border border-rose-100 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500 text-white rounded-xl">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-rose-900 text-sm">Proteção contra Invasão e Abandono</h3>
                  <p className="text-xs text-rose-700">
                    Usuários são bloqueados após 5 falhas consecutivas ou 60 dias sem login. O Super Admin pode desbloquear a qualquer momento.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunInactivitySweep}
                disabled={sweeping}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {sweeping ? 'Verificando...' : 'Varredura de Inativos (60d)'}
              </button>
            </div>

            {lockedLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : lockedUsers.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                <CheckCircle2 size={40} className="mx-auto mb-2 text-green-500" />
                <p className="font-bold text-charcoal-800 text-sm">Nenhuma conta bloqueada no momento!</p>
                <p className="text-xs text-gray-400 mt-0.5">Todos os usuários ativos estão com acesso regular.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedUsers.map(user => (
                  <div key={user.id} className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-charcoal-800 text-base">{user.name}</h4>
                          <p className="text-xs text-gray-500 font-mono">{user.email}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {user.lock_reason === 'FAILED_ATTEMPTS'
                            ? '5 Tentativas Falhas'
                            : user.lock_reason === 'INACTIVITY'
                            ? 'Inatividade (+60 dias)'
                            : 'Bloqueio Manual'}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-gray-600">
                        <p>
                          <strong>Tentativas incorretas:</strong> {user.failed_login_attempts}
                        </p>
                        <p>
                          <strong>Último login:</strong>{' '}
                          {user.last_login_at
                            ? new Date(user.last_login_at).toLocaleString('pt-BR')
                            : 'Nunca acessou'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleUnlock(user.id, user.name)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md shadow-green-600/25 transition-all cursor-pointer"
                      >
                        <Unlock size={14} /> Desbloquear Acesso
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CONTEÚDO DA ABA 3: POLÍTICAS DE SEGURANÇA ── */}
        {activeTab === 'settings' && (
          <div className="p-6 max-w-2xl">
            <h3 className="text-lg font-bold text-charcoal-800 mb-1">Parâmetros de Segurança da Informação</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Ajuste as diretrizes de bloqueio automático, tolerância a ataques de força bruta e renovação de credenciais.
            </p>

            {settingsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Limite de Tentativas Falhas de Senha (Auto-Bloqueio)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={3}
                      max={10}
                      value={settings.max_failed_attempts}
                      onChange={e => setSettings({ ...settings, max_failed_attempts: parseInt(e.target.value) || 5 })}
                      className="w-24 px-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-xs text-gray-500">
                      tentativas consecutivas incorretas bloquearão a conta (recomendado: 5).
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Bloqueio Automático por Inatividade
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={15}
                      max={180}
                      value={settings.inactivity_days_limit}
                      onChange={e => setSettings({ ...settings, inactivity_days_limit: parseInt(e.target.value) || 60 })}
                      className="w-24 px-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-xs text-gray-500">
                      dias sem autenticação na plataforma (regra atual: 60 dias).
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Expiração da Sessão (Token JWT)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={settings.session_timeout_hours}
                      onChange={e => setSettings({ ...settings, session_timeout_hours: parseInt(e.target.value) || 24 })}
                      className="w-24 px-3 py-2 rounded-xl border border-gray-300 text-sm font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-xs text-gray-500">
                      horas até o usuário precisar efetuar login novamente (recomendado: 24h).
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.require_strong_passwords}
                      onChange={e => setSettings({ ...settings, require_strong_passwords: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-charcoal-800">
                      Exigir senhas fortes (mínimo de 8 caracteres na criação e alteração)
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingSettings ? 'Salvando...' : 'Salvar Políticas de Segurança'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
