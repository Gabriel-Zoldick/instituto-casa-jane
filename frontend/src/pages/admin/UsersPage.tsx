import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Edit2, X, Shield, Eye, ChevronDown, ChevronUp, Lock, Unlock, ShieldAlert, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  first_login_at?: string;
  last_login_at?: string;
  failed_login_attempts?: number;
  is_locked?: boolean;
  lock_reason?: string;
  locked_at?: string;
}
interface Project { id: number; name: string; }

const ROLE_LABELS: Record<string, string> = {
  superadmin:  'Super Admin',
  admin:       'Admin',
  coordinator: 'Coordenador',
  viewer:      'Visualizador',
};
const ROLE_COLORS: Record<string, string> = {
  superadmin:  'bg-purple-100 text-purple-800',
  admin:       'bg-blue-100 text-blue-800',
  coordinator: 'bg-orange-100 text-orange-800',
  viewer:      'bg-gray-100 text-gray-600',
};

/** Campos sensíveis controláveis por permissão */
const SENSITIVE_FIELDS = [
  { key: 'cpf',        label: 'CPF' },
  { key: 'rg',         label: 'RG' },
  { key: 'address',    label: 'Endereço completo' },
  { key: 'phone',      label: 'Telefone' },
  { key: 'email',      label: 'E-mail' },
  { key: 'birth_date', label: 'Data de nascimento' },
  { key: 'school',     label: 'Escola' },
  { key: 'notes',      label: 'Observações' },
];

const EMPTY_FORM = { name: '', email: '', password: '', role: 'viewer', active: true };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]       = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  // Form state
  const [showForm, setShowForm]       = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm]               = useState({ ...EMPTY_FORM });
  const [formLoading, setFormLoading] = useState(false);

  // Permissions panel state
  const [permUser, setPermUser]             = useState<User | null>(null);
  const [fieldPerms, setFieldPerms]         = useState<Record<string, boolean>>({});
  const [projectAccess, setProjectAccess]   = useState<number[]>([]);
  const [permLoading, setPermLoading]       = useState(false);
  const [showProjectSection, setShowProjectSection] = useState(false);

  // ── Handlers de Segurança ─────────────────────────────────────
  const handleUnlockUser = async (u: User) => {
    if (!confirm(`Deseja desbloquear o acesso de "${u.name}"? O contador de tentativas incorretas será zerado.`)) return;
    try {
      await api.post(`/users/${u.id}/unlock`);
      toast.success(`Usuário "${u.name}" desbloqueado com sucesso!`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao desbloquear usuário');
    }
  };

  const handleLockUser = async (u: User) => {
    if (!confirm(`Deseja bloquear o acesso de "${u.name}"?`)) return;
    try {
      await api.post(`/users/${u.id}/lock`, { reason: 'MANUAL' });
      toast.success(`Usuário "${u.name}" bloqueado.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao bloquear usuário');
    }
  };

  // Exclusão Permanente
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/users/${deletingUser.id}`);
      toast.success(`Usuário "${deletingUser.name}" excluído com sucesso!`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao excluir usuário');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    api.get('/projects').then(({ data }) => setProjects(data)).catch(() => {});
  }, []);

  // ── CRUD ───────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingUser(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, active: u.active });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = {
          name: form.name, email: form.email, role: form.role, active: form.active,
        };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success('Usuário atualizado!');
      } else {
        await api.post('/users', form);
        toast.success('Usuário criado!');
      }
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar usuário');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Permissions ────────────────────────────────────────────────
  const openPermissions = async (u: User) => {
    setPermUser(u);
    setPermLoading(true);
    // Inicializa com defaults: todos visíveis
    const defaultPerms: Record<string, boolean> = {};
    SENSITIVE_FIELDS.forEach(f => { defaultPerms[f.key] = true; });

    try {
      const [permsRes, accessRes] = await Promise.all([
        api.get(`/users/${u.id}/permissions`),
        api.get(`/users/${u.id}/project-access`),
      ]);
      // Aplica overrides do servidor
      permsRes.data.forEach((p: { field_name: string; can_view: boolean }) => {
        defaultPerms[p.field_name] = p.can_view;
      });
      setFieldPerms(defaultPerms);
      setProjectAccess(accessRes.data.map((a: { project_id: number }) => a.project_id));
    } catch {
      toast.error('Erro ao carregar permissões');
    } finally {
      setPermLoading(false);
    }
  };

  const savePermissions = async () => {
    if (!permUser) return;
    setPermLoading(true);
    try {
      await api.put(`/users/${permUser.id}/permissions`, { permissions: fieldPerms });
      await api.put(`/users/${permUser.id}/project-access`, { project_ids: projectAccess });
      toast.success('Permissões salvas!');
    } catch {
      toast.error('Erro ao salvar permissões');
    } finally {
      setPermLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────
  const inputClass  = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500';
  const labelClass  = 'block text-xs font-medium text-gray-700 mb-1';
  const canRestrict = permUser?.role === 'coordinator' || permUser?.role === 'viewer';

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários e Permissões</h1>
          <p className="text-sm text-gray-500">
            {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/seguranca"
            className="flex items-center gap-2 bg-plum-50 text-plum-700 border border-plum-200 px-4 py-2 rounded-xl hover:bg-plum-100 font-bold text-xs transition-colors shadow-sm"
          >
            <ShieldCheck size={16} /> Central de Segurança &amp; Logs
          </Link>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 font-bold text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} /> Novo Usuário
          </button>
        </div>
      </div>

      {/* Tabela com Colunas de Segurança */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">E-mail</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Primeiro Acesso</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Último Acesso</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Falhas</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status / Bloqueio</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50/80 transition-colors ${u.is_locked ? 'bg-red-50/40' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${ROLE_COLORS[u.role]?.replace('text-', 'bg-').replace('-100', '-500') ?? 'bg-gray-400'}`}>
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="ml-1.5 text-[10px] text-gray-400 font-normal">(você)</span>
                          )}
                        </span>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium ${ROLE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-gray-600 font-mono text-[11px]">{u.email}</td>

                  {/* Data do Primeiro Acesso */}
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {u.first_login_at 
                      ? new Date(u.first_login_at).toLocaleDateString('pt-BR') 
                      : (u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—')}
                  </td>

                  {/* Data do Último Acesso */}
                  <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                    {u.last_login_at ? (
                      <div>
                        <span className="font-medium text-gray-900 block">{new Date(u.last_login_at).toLocaleDateString('pt-BR')}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{new Date(u.last_login_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Nunca acessou</span>
                    )}
                  </td>

                  {/* Tentativas Falhas */}
                  <td className="px-4 py-3.5 text-center">
                    {(u.failed_login_attempts || 0) === 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">
                        0
                      </span>
                    ) : (u.failed_login_attempts || 0) >= 5 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                        {u.failed_login_attempts} (limite)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {u.failed_login_attempts}
                      </span>
                    )}
                  </td>

                  {/* Status e Bloqueio */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {u.is_locked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <Lock size={12} />
                        {u.lock_reason === 'FAILED_ATTEMPTS'
                          ? 'Bloqueado (5 falhas)'
                          : u.lock_reason === 'INACTIVITY'
                          ? 'Bloqueado (Inativo 60d)'
                          : 'Bloqueado'}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex justify-end items-center gap-1.5">
                      {/* Desbloquear ou Bloquear */}
                      {u.is_locked ? (
                        <button
                          onClick={() => handleUnlockUser(u)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                          title="Desbloquear acesso do usuário"
                        >
                          <Unlock size={12} /> Desbloquear
                        </button>
                      ) : (
                        u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleLockUser(u)}
                            className="text-gray-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                            title="Bloquear usuário temporariamente"
                          >
                            <Lock size={15} />
                          </button>
                        )
                      )}

                      <button
                        onClick={() => openPermissions(u)}
                        className="text-purple-600 hover:text-purple-800 p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                        title="Gerenciar permissões"
                      >
                        <Shield size={15} />
                      </button>

                      <button
                        onClick={() => openEdit(u)}
                        className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Editar usuário"
                      >
                        <Edit2 size={15} />
                      </button>

                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir usuário permanentemente"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal: Criar/Editar Usuário ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Nome completo *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <label className={labelClass}>E-mail *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                  placeholder="digite aqui seu e-mail de acesso."
                />
              </div>
              <div>
                <label className={labelClass}>
                  {editingUser ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className={labelClass}>Papel no sistema</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className={inputClass}
                >
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {form.role === 'superadmin' && 'Acesso total ao sistema'}
                  {form.role === 'admin'       && 'Gerencia projetos, pessoas e documentos'}
                  {form.role === 'coordinator' && 'Gerencia apenas os projetos atribuídos a ele'}
                  {form.role === 'viewer'      && 'Apenas visualiza dados (sem edição)'}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600"
                />
                <span className="text-sm text-gray-700">Usuário ativo (pode fazer login)</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {formLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Permissões ── */}
      {permUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Permissões</h2>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                  {permUser.name}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[permUser.role]}`}>
                    {ROLE_LABELS[permUser.role]}
                  </span>
                </p>
              </div>
              <button onClick={() => setPermUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {permLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              ) : (
                <>
                  {/* Campos visíveis */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Eye size={16} className="text-primary-600" />
                      <h3 className="font-semibold text-gray-800">Campos que pode visualizar</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Campos desmarcados ficam ocultos para este usuário, independente do papel
                    </p>
                    <div className="space-y-1">
                      {SENSITIVE_FIELDS.map(f => (
                        <label
                          key={f.key}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-sm text-gray-700">{f.label}</span>
                          <input
                            type="checkbox"
                            checked={fieldPerms[f.key] !== false}
                            onChange={e => setFieldPerms(p => ({ ...p, [f.key]: e.target.checked }))}
                            className="rounded border-gray-300 text-primary-600 w-4 h-4"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Acesso a projetos (apenas para coordinator/viewer) */}
                  {canRestrict && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowProjectSection(v => !v)}
                        className="flex items-center justify-between w-full mb-3 font-semibold text-gray-800"
                      >
                        <span>Acesso a projetos específicos</span>
                        {showProjectSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {showProjectSection && (
                        <>
                          <p className="text-xs text-gray-400 mb-3">
                            Se nenhum projeto for marcado, o usuário terá acesso a <strong>todos</strong>. Marque apenas os projetos que este usuário pode visualizar.
                          </p>
                          <div className="space-y-1">
                            {projects.map(p => (
                              <label
                                key={p.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-sm text-gray-700">{p.name}</span>
                                <input
                                  type="checkbox"
                                  checked={projectAccess.includes(p.id)}
                                  onChange={e =>
                                    setProjectAccess(a =>
                                      e.target.checked ? [...a, p.id] : a.filter(id => id !== p.id)
                                    )
                                  }
                                  className="rounded border-gray-300 text-primary-600 w-4 h-4"
                                />
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setPermUser(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={savePermissions}
                disabled={permLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {permLoading ? 'Salvando...' : 'Salvar Permissões'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmação de Exclusão Permanente ── */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 p-6 md:p-8 text-center animate-in fade-in zoom-in duration-150">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-xl font-bold text-charcoal-800 mb-2">Excluir Usuário</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Tem certeza que deseja excluir permanentemente o usuário <strong className="text-charcoal-900">{deletingUser.name}</strong> ({deletingUser.email})?
            </p>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 text-left mb-6 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={14} className="shrink-0" />
                Ação Irreversível
              </p>
              <p className="leading-relaxed text-rose-700">
                O acesso à plataforma será revogado imediatamente e as permissões individuais deste usuário serão excluídas do banco de dados.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteUser}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Excluir Permanentemente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
