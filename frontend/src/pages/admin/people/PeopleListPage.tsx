import { useState, useEffect, useCallback, useRef } from 'react';
import api, { getFileUrl } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import toast from 'react-hot-toast';
import { Plus, Search, Users, LayoutGrid, Network, Edit2, Trash2, Heart, BookOpen, X, Camera, Upload } from 'lucide-react';

// Types
interface Person {
  id: number; name: string; birth_date?: string; cpf?: string; rg?: string;
  gender?: string; person_type: 'adult' | 'child'; phone?: string; email?: string;
  address?: string; neighborhood?: string; city?: string; school?: string;
  notes?: string; photo_url?: string; status: 'active' | 'inactive' | 'waitlist';
  created_at: string;
}
interface Project { id: number; name: string; category?: string; }
interface FamilyMember { id: number; relationship_id: number; relationship_type: string; name: string; person_type: string; status: string; photo_url?: string; }
interface Enrollment { id: number; project_id: number; project_name: string; category?: string; status: string; class_group?: string; enrolled_at: string; }

const STATUS_LABELS: Record<string, string> = { active: 'Ativo', inactive: 'Inativo', waitlist: 'Lista de espera' };
const STATUS_COLORS: Record<string, string> = { active: 'bg-green-100 text-green-800', inactive: 'bg-red-100 text-red-800', waitlist: 'bg-yellow-100 text-yellow-800' };
const TYPE_LABELS: Record<string, string> = { adult: 'Adulto', child: 'Criança' };
const TYPE_COLORS: Record<string, string> = { adult: 'bg-gray-100 text-gray-700', child: 'bg-blue-100 text-blue-700' };
const RELATIONSHIP_LABELS: Record<string, string> = { parent: 'Pai/Mãe', mother: 'Mãe', father: 'Pai', guardian: 'Responsável Legal', sibling: 'Irmão/Irmã', grandparent: 'Avô/Avó', other: 'Outro' };

const Badge = ({ label, colorClass }: { label: string; colorClass: string }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{label}</span>
);

const EMPTY_FORM = { name: '', birth_date: '', cpf: '', rg: '', gender: '', person_type: 'adult' as 'adult'|'child', phone: '', email: '', address: '', neighborhood: '', city: '', school: '', notes: '', photo_url: '', status: 'active' as 'active'|'inactive'|'waitlist' };

export default function PeopleListPage() {
  const { user } = useAuth();
  const { canView } = usePermissions();
  const [people, setPeople] = useState<Person[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [viewMode, setViewMode] = useState<'list'|'cards'|'family'>('list');
  
  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  // Family modal
  const [familyPerson, setFamilyPerson] = useState<Person | null>(null);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [newFamilyPersonId, setNewFamilyPersonId] = useState('');
  const [newFamilyRelType, setNewFamilyRelType] = useState('parent');
  const [addingFamily, setAddingFamily] = useState(false);
  
  // Enroll modal
  const [enrollPerson, setEnrollPerson] = useState<Person | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [newEnrollProjectId, setNewEnrollProjectId] = useState('');
  const [newEnrollGroup, setNewEnrollGroup] = useState('');
  const [newEnrollNotes, setNewEnrollNotes] = useState('');
  const [addingEnroll, setAddingEnroll] = useState(false);

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.person_type = filterType;
      if (filterProject) params.project_id = filterProject;
      const { data } = await api.get('/people', { params });
      setPeople(data);
    } catch { toast.error('Erro ao carregar pessoas'); }
    finally { setLoading(false); }
  }, [search, filterStatus, filterType, filterProject]);

  useEffect(() => { fetchPeople(); }, [fetchPeople]);
  useEffect(() => {
    api.get('/projects').then(({ data }) => setProjects(data)).catch(() => {});
  }, []);

  // Auto-detect person_type from birth_date
  const handleBirthDateChange = (val: string) => {
    const age = val ? Math.floor((Date.now() - new Date(val).getTime()) / (365.25 * 24 * 3600 * 1000)) : null;
    setForm(f => ({ ...f, birth_date: val, person_type: age !== null && age < 18 ? 'child' : 'adult' }));
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido (PNG, JPG, etc).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await api.post('/people/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(f => ({ ...f, photo_url: data.photo_url }));
      toast.success('Foto carregada com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao carregar a foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setForm(f => ({ ...f, photo_url: '' }));
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const openCreate = () => {
    setEditingPerson(null);
    setForm({ ...EMPTY_FORM });
    if (photoInputRef.current) photoInputRef.current.value = '';
    setShowForm(true);
  };

  const openEdit = (p: Person) => {
    setEditingPerson(p);
    setForm({
      name: p.name,
      birth_date: p.birth_date?.slice(0, 10) || '',
      cpf: p.cpf || '',
      rg: p.rg || '',
      gender: p.gender || '',
      person_type: p.person_type,
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      neighborhood: p.neighborhood || '',
      city: p.city || '',
      school: p.school || '',
      notes: p.notes || '',
      photo_url: p.photo_url || '',
      status: p.status
    });
    if (photoInputRef.current) photoInputRef.current.value = '';
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingPerson) {
        await api.put(`/people/${editingPerson.id}`, form);
        toast.success('Pessoa atualizada!');
      } else {
        await api.post('/people', form);
        toast.success('Pessoa cadastrada!');
      }
      setShowForm(false);
      fetchPeople();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao salvar');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (p: Person) => {
    if (!confirm(`Excluir ${p.name}? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/people/${p.id}`);
      toast.success('Pessoa excluída');
      fetchPeople();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Erro ao excluir'); }
  };

  const openFamily = async (p: Person) => {
    setFamilyPerson(p); setFamilyLoading(true); setFamily([]);
    setNewFamilyPersonId(''); setNewFamilyRelType('parent');
    try {
      const { data } = await api.get(`/people/${p.id}/family`);
      setFamily(data);
    } catch { toast.error('Erro ao carregar família'); }
    finally { setFamilyLoading(false); }
  };

  const handleAddFamily = async () => {
    if (!familyPerson || !newFamilyPersonId) return;
    setAddingFamily(true);
    try {
      await api.post(`/people/${familyPerson.id}/family`, { person_b_id: newFamilyPersonId, relationship_type: newFamilyRelType });
      toast.success('Vínculo familiar adicionado!');
      const { data } = await api.get(`/people/${familyPerson.id}/family`);
      setFamily(data);
      setNewFamilyPersonId('');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Erro ao adicionar vínculo'); }
    finally { setAddingFamily(false); }
  };

  const handleRemoveFamily = async (relId: number) => {
    if (!familyPerson) return;
    try {
      await api.delete(`/people/${familyPerson.id}/family/${relId}`);
      toast.success('Vínculo removido');
      const { data } = await api.get(`/people/${familyPerson.id}/family`);
      setFamily(data);
    } catch { toast.error('Erro ao remover vínculo'); }
  };

  const openEnroll = async (p: Person) => {
    setEnrollPerson(p); setEnrollLoading(true); setEnrollments([]);
    setNewEnrollProjectId(''); setNewEnrollGroup(''); setNewEnrollNotes('');
    try {
      const { data } = await api.get(`/people/${p.id}/enrollments`);
      setEnrollments(data);
    } catch { toast.error('Erro ao carregar matrículas'); }
    finally { setEnrollLoading(false); }
  };

  const handleAddEnroll = async () => {
    if (!enrollPerson || !newEnrollProjectId) return;
    setAddingEnroll(true);
    try {
      await api.post(`/projects/${newEnrollProjectId}/enrollments`, { person_id: enrollPerson.id, class_group: newEnrollGroup, notes: newEnrollNotes });
      toast.success('Matriculado com sucesso!');
      const { data } = await api.get(`/people/${enrollPerson.id}/enrollments`);
      setEnrollments(data);
      setNewEnrollProjectId(''); setNewEnrollGroup(''); setNewEnrollNotes('');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Erro ao matricular'); }
    finally { setAddingEnroll(false); }
  };

  const handleRemoveEnroll = async (enrollment: Enrollment) => {
    if (!enrollPerson) return;
    try {
      await api.delete(`/projects/${enrollment.project_id}/enrollments/${enrollment.id}`);
      toast.success('Matrícula removida');
      const { data } = await api.get(`/people/${enrollPerson.id}/enrollments`);
      setEnrollments(data);
    } catch { toast.error('Erro ao remover matrícula'); }
  };

  // Group people by family for family view
  const renderFamilyView = () => {
    const children = people.filter(p => p.person_type === 'child');
    const adults = people.filter(p => p.person_type === 'adult');
    return (
      <div className="space-y-6">
        {adults.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Adultos / Responsáveis ({adults.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adults.map(p => renderPersonCard(p))}
            </div>
          </div>
        )}
        {children.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Crianças / Jovens ({children.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map(p => renderPersonCard(p))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPersonCard = (p: Person) => (
    <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {p.photo_url ? (
            <img
              src={getFileUrl(p.photo_url)}
              alt={p.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${p.person_type === 'child' ? 'bg-blue-500' : 'bg-primary-600'}`}>
              {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
            <div className="flex gap-1 mt-1">
              <Badge label={TYPE_LABELS[p.person_type]} colorClass={TYPE_COLORS[p.person_type]} />
              <Badge label={STATUS_LABELS[p.status]} colorClass={STATUS_COLORS[p.status]} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-1 mt-3 justify-end">
        <button onClick={() => openFamily(p)} className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-50"><Heart size={12} /> Família</button>
        <button onClick={() => openEnroll(p)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"><BookOpen size={12} /> Projetos</button>
        <button onClick={() => openEdit(p)} className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50"><Edit2 size={12} /> Editar</button>
        {(user?.role === 'superadmin' || user?.role === 'admin') && (
          <button onClick={() => handleDelete(p)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"><Trash2 size={12} /></button>
        )}
      </div>
    </div>
  );

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pessoas</h1>
          <p className="text-sm text-gray-500">{people.length} pessoa{people.length !== 1 ? 's' : ''} encontrada{people.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <Plus size={18} /> Nova Pessoa
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome..." className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
            <option value="">Todos os tipos</option>
            <option value="adult">Adulto</option>
            <option value="child">Criança</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="waitlist">Lista de espera</option>
          </select>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
            <option value="">Todos os projetos</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode==='list' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><Users size={16} /></button>
            <button onClick={() => setViewMode('cards')} className={`p-1.5 rounded ${viewMode==='cards' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('family')} className={`p-1.5 rounded ${viewMode==='family' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><Network size={16} /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
      ) : people.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg">Nenhuma pessoa encontrada</p>
          <button onClick={openCreate} className="mt-4 text-primary-600 hover:underline text-sm">Cadastrar primeira pessoa</button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                {canView('phone') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {people.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.photo_url ? (
                        <img
                          src={getFileUrl(p.photo_url)}
                          alt={p.name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${p.person_type === 'child' ? 'bg-blue-500' : 'bg-primary-600'}`}>
                          {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge label={TYPE_LABELS[p.person_type]} colorClass={TYPE_COLORS[p.person_type]} /></td>
                  {canView('phone') && <td className="px-6 py-4 text-sm text-gray-500">{p.phone || '—'}</td>}
                  <td className="px-6 py-4"><Badge label={STATUS_LABELS[p.status]} colorClass={STATUS_COLORS[p.status]} /></td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openFamily(p)} className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50" title="Ver família"><Heart size={16} /></button>
                      <button onClick={() => openEnroll(p)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="Matrículas"><BookOpen size={16} /></button>
                      <button onClick={() => openEdit(p)} className="text-primary-600 hover:text-primary-800 p-1 rounded hover:bg-rose-50" title="Editar"><Edit2 size={16} /></button>
                      {(user?.role === 'superadmin' || user?.role === 'admin') && (
                        <button onClick={() => handleDelete(p)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Excluir"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {people.map(p => renderPersonCard(p))}
        </div>
      ) : renderFamilyView()}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">{editingPerson ? 'Editar Pessoa' : 'Nova Pessoa'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload de Foto (Opcional) */}
                <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="relative group flex-shrink-0">
                    {form.photo_url ? (
                      <img
                        src={getFileUrl(form.photo_url)}
                        alt="Foto de perfil"
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                        <Camera size={26} />
                        <span className="text-[10px] font-medium mt-1">Sem foto</span>
                      </div>
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <p className="text-sm font-bold text-charcoal-800">Foto de Perfil</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-semibold">
                        Opcional
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Adicione uma foto da pessoa cadastrada (criança, jovem ou responsável). Não é obrigatório.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2.5 justify-center sm:justify-start">
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={handlePhotoSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-gray-300 text-charcoal-700 hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Upload size={14} /> {form.photo_url ? 'Alterar foto' : 'Fazer upload de foto'}
                      </button>
                      {form.photo_url && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <X size={14} /> Remover foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Nome completo *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={inputClass} placeholder="Nome completo" />
                </div>
                <div>
                  <label className={labelClass}>Data de nascimento</label>
                  <input type="date" value={form.birth_date} onChange={e => handleBirthDateChange(e.target.value)} className={inputClass} />
                  {form.birth_date && <p className="text-xs text-primary-600 mt-1">Detectado: {form.person_type === 'child' ? '🧒 Criança' : '👤 Adulto'}</p>}
                </div>
                <div>
                  <label className={labelClass}>Gênero</label>
                  <select value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))} className={inputClass}>
                    <option value="">Selecionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </div>
                {canView('cpf') && <div>
                  <label className={labelClass}>CPF</label>
                  <input value={form.cpf} onChange={e => setForm(f => ({...f, cpf: e.target.value}))} className={inputClass} placeholder="000.000.000-00" />
                </div>}
                <div>
                  <label className={labelClass}>RG</label>
                  <input value={form.rg} onChange={e => setForm(f => ({...f, rg: e.target.value}))} className={inputClass} placeholder="RG" />
                </div>
                <div>
                  <label className={labelClass}>Telefone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className={inputClass} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className={labelClass}>E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className={inputClass} placeholder="digite aqui seu e-mail de acesso." />
                </div>
                {canView('address') && <>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Endereço</label>
                    <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} className={inputClass} placeholder="Rua, número, complemento" />
                  </div>
                  <div>
                    <label className={labelClass}>Bairro</label>
                    <input value={form.neighborhood} onChange={e => setForm(f => ({...f, neighborhood: e.target.value}))} className={inputClass} placeholder="Bairro" />
                  </div>
                  <div>
                    <label className={labelClass}>Cidade</label>
                    <input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} className={inputClass} placeholder="Cidade" />
                  </div>
                </>}
                {form.person_type === 'child' && <div className="md:col-span-2">
                  <label className={labelClass}>Escola</label>
                  <input value={form.school} onChange={e => setForm(f => ({...f, school: e.target.value}))} className={inputClass} placeholder="Nome da escola" />
                </div>}
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value as any}))} className={inputClass}>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="waitlist">Lista de espera</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Observações</label>
                  <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className={inputClass} placeholder="Informações adicionais..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {formLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Family Modal */}
      {familyPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Família</h2>
                <p className="text-sm text-gray-500">{familyPerson.name}</p>
              </div>
              <button onClick={() => setFamilyPerson(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              {familyLoading ? <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" /></div>
              : family.length === 0 ? <p className="text-gray-400 text-center py-6">Nenhum vínculo familiar cadastrado</p>
              : (
                <div className="space-y-2">
                  {family.map(m => (
                    <div key={m.relationship_id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        {m.photo_url ? (
                          <img
                            src={getFileUrl(m.photo_url)}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.person_type === 'child' ? 'bg-blue-500' : 'bg-primary-600'}`}>
                            {m.name?.split(' ').map((n:string) => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-gray-500">{RELATIONSHIP_LABELS[m.relationship_type] || m.relationship_type}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveFamily(m.relationship_id)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
              {/* Add family link */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Adicionar vínculo</p>
                <div className="space-y-2">
                  <select value={newFamilyPersonId} onChange={e => setNewFamilyPersonId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Selecionar pessoa...</option>
                    {people.filter(p => p.id !== familyPerson.id && !family.find(f => f.id === p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({TYPE_LABELS[p.person_type]})</option>
                    ))}
                  </select>
                  <select value={newFamilyRelType} onChange={e => setNewFamilyRelType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {Object.entries(RELATIONSHIP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <button onClick={handleAddFamily} disabled={!newFamilyPersonId || addingFamily} className="w-full bg-primary-600 text-white rounded-lg py-2 text-sm hover:bg-primary-700 disabled:opacity-50">
                    {addingFamily ? 'Adicionando...' : 'Adicionar vínculo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {enrollPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Matrículas em Projetos</h2>
                <p className="text-sm text-gray-500">{enrollPerson.name}</p>
              </div>
              <button onClick={() => setEnrollPerson(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              {enrollLoading ? <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" /></div>
              : enrollments.length === 0 ? <p className="text-gray-400 text-center py-6">Nenhuma matrícula ativa</p>
              : (
                <div className="space-y-2">
                  {enrollments.map(e => (
                    <div key={e.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium">{e.project_name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge label={e.status === 'active' ? 'Ativo' : e.status === 'completed' ? 'Concluído' : 'Desistente'} colorClass={e.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} />
                          {e.class_group && <span className="text-xs text-gray-500">{e.class_group}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveEnroll(e)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Matricular em projeto</p>
                <div className="space-y-2">
                  <select value={newEnrollProjectId} onChange={e => setNewEnrollProjectId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">Selecionar projeto...</option>
                    {projects.filter(p => !enrollments.find(e => e.project_id === p.id && e.status === 'active')).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input value={newEnrollGroup} onChange={e => setNewEnrollGroup(e.target.value)} placeholder="Turma / Horário (opcional)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <input value={newEnrollNotes} onChange={e => setNewEnrollNotes(e.target.value)} placeholder="Observações (opcional)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <button onClick={handleAddEnroll} disabled={!newEnrollProjectId || addingEnroll} className="w-full bg-primary-600 text-white rounded-lg py-2 text-sm hover:bg-primary-700 disabled:opacity-50">
                    {addingEnroll ? 'Matriculando...' : 'Matricular'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
