import { useState, useEffect } from 'react';
import { Search, Download, FileText, ShieldCheck } from 'lucide-react';
import api, { getFileUrl } from '../../services/api';

interface Document {
  id: number;
  title: string;
  category?: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

const CATEGORIES = ['Todas', 'Ata', 'Relatório Financeiro', 'Estatuto', 'Edital', 'Certificado', 'Outro'];

const CAT_COLORS: Record<string, string> = {
  'Ata': 'bg-plum-50 text-plum-700 border border-plum-100',
  'Relatório Financeiro': 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  'Estatuto': 'bg-primary-50 text-primary-700 border border-primary-100',
  'Edital': 'bg-amber-50 text-amber-700 border border-amber-100',
  'Certificado': 'bg-blue-50 text-blue-700 border border-blue-100',
  'Outro': 'bg-gray-50 text-gray-700 border border-gray-100',
};

export default function TransparencyPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todas');

  useEffect(() => {
    api.get('/documents/public')
      .then(({ data }) => setDocuments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = documents.filter(doc => {
    const matchesSearch = !search ||
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.file_name?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'Todas' || doc.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-gray-50/70 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Cabeçalho */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-plum-50 text-plum-700 rounded-full text-xs font-semibold mb-3 border border-plum-100">
            <ShieldCheck size={16} /> Prestação de Contas Pública
          </div>
          <h1 className="text-4xl font-extrabold text-charcoal-800 mb-3 tracking-tight">Portal da Transparência</h1>
          <p className="text-gray-600 text-base leading-relaxed">
            Acesso público e irrestrito aos documentos institucionais do Instituto Casa Jane:
            atas de assembleias, relatórios financeiros, estatuto social e editais.
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
              placeholder="Buscar documento por título..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCat === cat
                    ? 'bg-brand-gradient text-white shadow-sm shadow-primary-600/20'
                    : 'bg-gray-100 text-charcoal-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Documentos */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse flex justify-between items-center">
                <div className="space-y-2 w-2/3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
            <FileText size={48} className="mx-auto mb-3 opacity-30 text-primary-600" />
            <p className="text-lg font-bold text-charcoal-800">Nenhum documento disponível no momento</p>
            <p className="text-sm mt-1">Novos documentos públicos são disponibilizados periodicamente pela administração.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {filtered.map(doc => (
              <div
                key={doc.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-rose-50/20 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary-50 text-primary-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform border border-primary-100">
                    <FileText size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${CAT_COLORS[doc.category || 'Outro'] || 'bg-gray-100 text-gray-700'}`}>
                        {doc.category || 'Geral'}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        Publicado em {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="font-bold text-charcoal-800 text-base group-hover:text-primary-600 transition-colors">{doc.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.file_name}</p>
                  </div>
                </div>

                <a
                  href={getFileUrl(doc.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-primary-600/20 hover:shadow-md self-end sm:self-center"
                >
                  <Download size={16} /> Baixar
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
