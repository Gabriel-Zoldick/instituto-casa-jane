import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Users, X, FolderOpen } from 'lucide-react';

interface Project {
  id: number; name: string; description?: string; category?: string;
  status: 'active' | 'inactive' | 'finished'; coordinator_id?: number;
  schedule?: string; location?: string; max_capacity?: number;
  created_at: string; enrollment_count?: number;
}
interface User { id: number; name: string; role: string; }

const STATUS_LABELS: Record<string,string> = { active: 'Ativo', inactive: 'Inativo', finished: 'Encerrado' };
const STATUS_COLORS: Record<string,string> = { active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-600', finished: 'bg-red-100 text-red-700' };

const EMPTY_FORM = { name: '', description: '', category: '', status: 'active' as 'active'|'inactive'|'finished', schedule: '', location: '', max_capacity: '' };

export default function ProjectsListPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, coordinator_id: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectPeople, setProjectPeople] = useState<any[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch { toast.error('Erro ao carregar projetos'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProjects();
    api.get('/users').then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  const openCreate = () => { setEditingProject(null); setForm({ ...EMPTY_FORM, coordinator_id: '' }); setShowForm(true); };
  const openEdit = (p: Project) => { setEditingProject(p); setForm({ name: p.name, description: p.description||'', category: p.category||'', status: p.status, schedule: p.schedule||'', location: p.location||'', max_capacity: p.max_capacity?.toString()||'', coordinator_id: p.coordinator_id?.toString()||'' }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      const payload = { ...form, max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null, coordinator_id: form.coordinator_id || null };
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, payload);
        toast.success('Projeto atualizado!');
      } else {
        await api.post('/projects', payload);
        toast.success('Projeto criado!');
      }
      setShowForm(false); fetchProjects();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Erro ao salvar'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (p: Project) => {
    if (!confirm(`Excluir projeto "${p.name}"?`)) return;
    try { await api.delete(`/projects/${p.id}`); toast.success('Projeto excluído'); fetchProjects(); }
    catch (err: any) { toast.error(err.response?.data?.error || 'Erro ao excluir'); }
  };

  const openProjectDetail = async (p: Project) => {
    setSelectedProject(p); setPeopleLoading(true); setProjectPeople([]);
    try {
      const { data } = await api.get(`/projects/${p.id}/people`);
      setProjectPeople(data);
    } catch { toast.error('Erro ao carregar participantes'); }
    finally { setPeopleLoading(false); }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projetos</h1>
          <p className="text-sm text-gray-500">{projects.length} projeto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {(user?.role === 'superadmin' || user?.role === 'admin') && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
            <Plus size={18} /> Novo Projeto
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum projeto cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{p.name}</h3>
                  {p.category && <span className="text-xs text-gray-500">{p.category}</span>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</span>
              </div>
              {p.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>}
              <div className="space-y-1 text-xs text-gray-500 mb-4">
                {p.schedule && <p>🕐 {p.schedule}</p>}
                {p.location && <p>📍 {p.location}</p>}
                {p.max_capacity && <p>👥 Capacidade: {p.max_capacity}</p>}
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <button onClick={() => openProjectDetail(p)} className="flex items-center gap-1 text-primary-600 hover:text-primary-800 text-xs font-medium">
                  <Users size={14} /> Ver participantes
                </button>
                {(user?.role === 'superadmin' || user?.role === 'admin') && (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-primary-600"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(p)} className="text-gray-500 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Nome do Projeto *</label>
                <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Descrição</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Categoria</label>
                  <input value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value as any}))} className={inputClass}>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="finished">Encerrado</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Horário / Dias</label>
                  <input value={form.schedule} onChange={e => setForm(f => ({...f, schedule: e.target.value}))} className={inputClass} placeholder="Ex: Ter e Qui, 14h" />
                </div>
                <div>
                  <label className={labelClass}>Local</label>
                  <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Capacidade Máxima</label>
                  <input type="number" value={form.max_capacity} onChange={e => setForm(f => ({...f, max_capacity: e.target.value}))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Coordenador</label>
                  <select value={form.coordinator_id} onChange={e => setForm(f => ({...f, coordinator_id: e.target.value}))} className={inputClass}>
                    <option value="">Selecione...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {formLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Participantes</h2>
                <p className="text-sm text-gray-500">{selectedProject.name}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6">
              {peopleLoading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
              ) : projectPeople.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum participante matriculado</p>
              ) : (
                <div className="space-y-3">
                  {projectPeople.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{p.person_name}</p>
                        <p className="text-xs text-gray-500">{p.class_group || 'Sem turma'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
