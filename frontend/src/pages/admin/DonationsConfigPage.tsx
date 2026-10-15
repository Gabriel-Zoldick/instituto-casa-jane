import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Heart, Copy, Check, Eye, EyeOff } from 'lucide-react';

interface DonationConfig {
  id?: number;
  pix_key?: string;
  pix_key_type?: string;
  bank_name?: string;
  agency?: string;
  account?: string;
  account_holder?: string;
  message?: string;
  show_donation_section: boolean;
}

const PIX_KEY_TYPES: Record<string, string> = {
  cpf:    'CPF',
  cnpj:   'CNPJ',
  email:  'E-mail',
  phone:  'Telefone',
  random: 'Chave aleatória',
};

export default function DonationsConfigPage() {
  const [config, setConfig]   = useState<DonationConfig>({ show_donation_section: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [copied, setCopied]   = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    api.get('/donations/config')
      .then(({ data }) => data && setConfig(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/donations/config', config);
      toast.success('Configurações salvas com sucesso!');
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const copyPix = () => {
    if (!config.pix_key) return;
    navigator.clipboard.writeText(config.pix_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Chave PIX copiada!');
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500';
  const labelClass = 'block text-xs font-medium text-gray-700 mb-1';

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Configuração de Doações</h1>
        <p className="text-sm text-gray-500">Configure as informações exibidas aos visitantes na página de doações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── FORMULÁRIO ── */}
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-800 text-lg border-b pb-3">Dados para Doação</h2>

          {/* PIX */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-600">Chave PIX</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tipo da chave</label>
                <select
                  value={config.pix_key_type ?? ''}
                  onChange={e => setConfig(c => ({ ...c, pix_key_type: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Selecionar...</option>
                  {Object.entries(PIX_KEY_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Chave PIX</label>
                <input
                  value={config.pix_key ?? ''}
                  onChange={e => setConfig(c => ({ ...c, pix_key: e.target.value }))}
                  className={inputClass}
                  placeholder="CPF, CNPJ, e-mail..."
                />
              </div>
            </div>
          </div>

          {/* Dados bancários */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-600">Dados Bancários (opcional)</p>
            <div>
              <label className={labelClass}>Titular da conta</label>
              <input
                value={config.account_holder ?? ''}
                onChange={e => setConfig(c => ({ ...c, account_holder: e.target.value }))}
                className={inputClass}
                placeholder="Nome completo ou razão social"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Banco</label>
                <input
                  value={config.bank_name ?? ''}
                  onChange={e => setConfig(c => ({ ...c, bank_name: e.target.value }))}
                  className={inputClass}
                  placeholder="Ex: Caixa"
                />
              </div>
              <div>
                <label className={labelClass}>Agência</label>
                <input
                  value={config.agency ?? ''}
                  onChange={e => setConfig(c => ({ ...c, agency: e.target.value }))}
                  className={inputClass}
                  placeholder="0001"
                />
              </div>
              <div>
                <label className={labelClass}>Conta</label>
                <input
                  value={config.account ?? ''}
                  onChange={e => setConfig(c => ({ ...c, account: e.target.value }))}
                  className={inputClass}
                  placeholder="00000-0"
                />
              </div>
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <label className={labelClass}>Mensagem de agradecimento</label>
            <textarea
              rows={3}
              value={config.message ?? ''}
              onChange={e => setConfig(c => ({ ...c, message: e.target.value }))}
              className={inputClass}
              placeholder="Sua doação transforma vidas!"
            />
          </div>

          {/* Toggle visibilidade */}
          <label className="flex items-center gap-3 cursor-pointer select-none p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={config.show_donation_section}
              onChange={e => setConfig(c => ({ ...c, show_donation_section: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 w-4 h-4"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Exibir seção de doação na home</p>
              <p className="text-xs text-gray-400">Quando ativo, o banner de doação aparece na página inicial</p>
            </div>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>

        {/* ── PRÉ-VISUALIZAÇÃO ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">Pré-visualização</h2>
            <button
              type="button"
              onClick={() => setShowPreview(v => !v)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? 'Ocultar' : 'Exibir'}
            </button>
          </div>

          {showPreview && (
            <div className="bg-gradient-to-r from-plum-900 via-primary-800 to-primary-600 text-white rounded-3xl p-6 text-center shadow-lg border border-white/10">
              <Heart size={32} className="mx-auto mb-3" fill="white" />
              <h3 className="text-xl font-bold mb-2">Faça uma Doação</h3>
              <p className="text-rose-100 text-sm mb-5">
                {config.message || 'Sua doação transforma vidas!'}
              </p>

              {config.pix_key && (
                <div className="bg-white/10 rounded-xl p-4 mb-4 text-left">
                  <p className="text-xs font-medium text-primary-200 mb-1 uppercase">
                    Chave PIX {config.pix_key_type ? `(${PIX_KEY_TYPES[config.pix_key_type] ?? config.pix_key_type})` : ''}
                  </p>
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                    <code className="flex-1 text-sm break-all">{config.pix_key}</code>
                    <button
                      type="button"
                      onClick={copyPix}
                      className="text-white hover:text-primary-200 flex-shrink-0"
                      title="Copiar chave PIX"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {(config.bank_name || config.agency) && (
                <div className="bg-white/10 rounded-xl p-4 text-sm text-left space-y-1.5">
                  {config.account_holder && <p>👤 {config.account_holder}</p>}
                  {config.bank_name && <p>🏦 {config.bank_name}</p>}
                  {config.agency && (
                    <p>Ag: {config.agency}{config.account ? ` | Cc: ${config.account}` : ''}</p>
                  )}
                </div>
              )}

              {!config.pix_key && !config.bank_name && (
                <p className="text-primary-200 text-sm italic">
                  Configure os dados de doação ao lado para visualizar aqui
                </p>
              )}
            </div>
          )}

          {/* Dicas */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
            <p className="font-semibold">💡 Dicas para aumentar doações</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-700 mt-1">
              <li>Cadastre-se no <strong>Google for Nonprofits</strong> para receber créditos em anúncios</li>
              <li>Adicione uma mensagem emotiva e específica sobre o impacto da doação</li>
              <li>Divulgue a página de doações nas redes sociais regularmente</li>
              <li>Considere integrar o <strong>Mercado Pago</strong> para aceitar cartões de crédito</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
