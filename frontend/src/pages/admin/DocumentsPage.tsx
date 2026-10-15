import React, { useState, useEffect, useRef } from 'react';
import api, { getFileUrl } from '../../services/api';
import toast from 'react-hot-toast';
import { Upload, Trash2, Download, X, Plus, FileText, Eye, EyeOff, Search } from 'lucide-react';

interface Document {
  id: number;
  title: string;
  category?: string;
  file_url: string;
  file_name: string;
  is_public: boolean;
  created_at: string;
}

const CATEGORIES = ['Ata', 'Relatório Financeiro', 'Estatuto', 'Edital', 'Certificado', 'Outro'];

const CAT_COLORS: Record<string, string> = {
  'Ata':                  'bg-blue-100 text-blue-700',
  'Relatório Financeiro': 'bg-green-100 text-green-700',
  'Estatuto':             'bg-purple-100 text-purple-700',
  'Edital':               'bg-orange-100 text-orange-700',
  'Certificado':          'bg-yellow-100 text-yellow-700',
  'Outro':                'bg-gray-100 text-gray-600',
};

export default function DocumentsPage() {
  const [documents, setDocuments]         = useState<Document[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch]               = useState('');
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Outro', is_public: true });
  const [file, setFile]                   = useState<File | null>(null);
  const [uploading, setUploading]         = useState(false);
  const fileRef                           = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/documents');
      setDocuments(data);
    } catch {
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Selecione um arquivo');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('is_public', String(form.is_public));
      await api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Documento enviado com sucesso!');
      setShowForm(false);
      setFile(null);
      setForm({ title: '', category: 'Outro', is_public: true });
      fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Excluir "${doc.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/documents/${doc.id}`);
      toast.success('Documento excluído');
      fetchDocs();
    } catch {
      toast.error('Erro ao excluir documento');
    }
  };

  const filtered = documents.filter(d =>
    (!filterCategory || d.category === filterCategory) &&
    (!search || d.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Documentos</h1>
          <p className="text-sm text-gray-500">
            {documents.length} documento{documents.length !== 1 ? 's' : ''} cadastrado{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} /> Enviar Documento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg">Nenhum documento encontrado</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-primary-600 hover:underline text-sm"
          >
            Enviar primeiro documento
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibilidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{doc.title}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 ml-6">{doc.file_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CAT_COLORS[doc.category ?? 'Outro'] ?? 'bg-gray-100 text-gray-600'}`}>
                      {doc.category ?? 'Outro'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {doc.is_public ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <Eye size={12} /> Público
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <EyeOff size={12} /> Interno
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <a
                        href={getFileUrl(doc.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="Baixar"
                      >
                        <Download size={16} />
                      </a>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Upload */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Enviar Documento</h2>
              <button
                onClick={() => { setShowForm(false); setFile(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Título *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Ex: Ata da Reunião de Outubro 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Arquivo *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-rose-50 transition-colors"
                >
                  {file ? (
                    <>
                      <Upload size={20} className="mx-auto mb-1 text-primary-600" />
                      <p className="text-sm text-primary-700 font-medium">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="mx-auto mb-1 text-gray-400" />
                      <p className="text-sm text-gray-500">Clique para selecionar</p>
                      <p className="text-xs text-gray-400">PDF, Word, imagens (máx. 10 MB)</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xls,.xlsx"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600"
                />
                <span className="text-sm text-gray-700">Tornar público (visível no site para qualquer visitante)</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFile(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
