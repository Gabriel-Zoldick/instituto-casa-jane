import { useState, useEffect } from 'react';
import { Heart, Copy, Check, Building, ShieldCheck, QrCode } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface DonationConfig {
  pix_key?: string;
  pix_key_type?: string;
  bank_name?: string;
  agency?: string;
  account?: string;
  account_holder?: string;
  message?: string;
  show_donation_section?: boolean;
}

const PIX_KEY_LABELS: Record<string, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'E-mail',
  phone: 'Telefone',
  random: 'Chave Aleatória',
};

export default function DonatePage() {
  const [config, setConfig] = useState<DonationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/donations/config')
      .then(({ data }) => setConfig(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopyPix = () => {
    if (!config?.pix_key) return;
    navigator.clipboard.writeText(config.pix_key);
    setCopied(true);
    toast.success('Chave PIX copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-gray-50/70 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Banner Topo */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-primary-100">
            <Heart size={32} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-extrabold text-charcoal-800 mb-3 tracking-tight">Como Apoiar o Instituto Casa Jane</h1>
          <p className="text-gray-600 leading-relaxed text-base">
            {config?.message ||
              'Sua doação ajuda a manter nossas oficinas gratuitas de Jiu-Jitsu, Piano, Violão e Apoio Pedagógico, transformando a vida de crianças e jovens da nossa comunidade.'}
          </p>
        </div>

        {/* Card Principal de Doação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Opção 1: PIX */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  1
                </div>
                <div>
                  <h2 className="text-xl font-bold text-charcoal-800">Doação via PIX</h2>
                  <p className="text-xs text-primary-600 font-semibold">Rápido, instantâneo e sem taxas</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-12 bg-gray-100 rounded-xl" />
                  <div className="h-32 bg-gray-100 rounded-xl" />
                </div>
              ) : config?.pix_key ? (
                <div className="space-y-5">
                  <div className="bg-gradient-to-br from-primary-50/80 to-rose-50/50 border border-primary-100 rounded-2xl p-5 text-center">
                    <p className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">
                      Tipo: {config.pix_key_type ? PIX_KEY_LABELS[config.pix_key_type] || config.pix_key_type : 'Chave PIX'}
                    </p>
                    <div className="bg-white rounded-xl p-3 border border-primary-200/80 mb-3 shadow-inner">
                      <code className="text-sm md:text-base font-mono font-bold text-charcoal-800 break-all select-all">
                        {config.pix_key}
                      </code>
                    </div>

                    <button
                      onClick={handleCopyPix}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-primary-600/25 hover:shadow-lg"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? 'Chave Copiada com Sucesso!' : 'Copiar Chave PIX'}
                    </button>
                  </div>

                  {config.account_holder && (
                    <div className="text-xs text-gray-500 text-center">
                      <p>Favorecido: <strong className="text-charcoal-800">{config.account_holder}</strong></p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <QrCode size={48} className="mx-auto mb-2 opacity-30 text-primary-600" />
                  <p className="text-sm">Chave PIX em atualização pela diretoria.</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2 mt-6">
              <ShieldCheck size={16} className="text-primary-600 flex-shrink-0" />
              <span>100% dos recursos são aplicados diretamente nas atividades sociais.</span>
            </div>
          </div>

          {/* Opção 2: Transferência Bancária */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-plum-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  2
                </div>
                <div>
                  <h2 className="text-xl font-bold text-charcoal-800">Transferência Bancária</h2>
                  <p className="text-xs text-plum-700 font-semibold">TED, DOC ou depósito em conta</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-10 bg-gray-100 rounded-xl" />
                  <div className="h-10 bg-gray-100 rounded-xl" />
                </div>
              ) : config?.bank_name || config?.agency ? (
                <div className="space-y-3 bg-gray-50 rounded-2xl p-5 border border-gray-200/70 text-sm">
                  {config.bank_name && (
                    <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                      <span className="text-gray-500 font-medium">Banco:</span>
                      <strong className="text-charcoal-800">{config.bank_name}</strong>
                    </div>
                  )}
                  {config.agency && (
                    <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                      <span className="text-gray-500 font-medium">Agência:</span>
                      <strong className="text-charcoal-800">{config.agency}</strong>
                    </div>
                  )}
                  {config.account && (
                    <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                      <span className="text-gray-500 font-medium">Conta:</span>
                      <strong className="text-charcoal-800">{config.account}</strong>
                    </div>
                  )}
                  {config.account_holder && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500 font-medium">Titular:</span>
                      <strong className="text-charcoal-800 text-right">{config.account_holder}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Building size={48} className="mx-auto mb-2 opacity-30 text-charcoal-600" />
                  <p className="text-sm">Dados bancários disponíveis mediante solicitação.</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2 mt-6">
              <Building size={16} className="text-plum-700 flex-shrink-0" />
              <span>Para recibos ou declaração de doação, contate a administração.</span>
            </div>
          </div>
        </div>

        {/* Inscrições nas Oficinas */}
        <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-charcoal-800 mb-2 flex items-center gap-2">
            <span className="text-2xl">📝</span> Inscrições nas Oficinas Gratuitas
          </h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            As vagas para as oficinas de <strong>Violão, Violino, Teclado, Flauta, Xadrez e Jiu-Jitsu</strong> são limitadas.
            Entre em contato com a secretaria para verificar disponibilidade e realizar sua inscrição:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://wa.me/5527998992509"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 px-6 py-4 bg-green-50 border border-green-200 rounded-2xl hover:bg-green-100 transition-colors group flex-1"
            >
              <span className="text-3xl">💬</span>
              <div>
                <p className="font-bold text-charcoal-800 text-sm group-hover:text-green-800">Carla Daieny — Secretaria</p>
                <p className="text-green-700 font-semibold text-lg">(27) 99899-2509</p>
                <p className="text-xs text-gray-500">WhatsApp / Telefone — Vagas limitadas</p>
              </div>
            </a>
            <a
              href="https://www.instagram.com/institutocasajane/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 px-6 py-4 bg-primary-50 border border-primary-100 rounded-2xl hover:bg-primary-100 transition-colors group flex-1"
            >
              <span className="text-3xl">📸</span>
              <div>
                <p className="font-bold text-charcoal-800 text-sm group-hover:text-primary-700">Siga no Instagram</p>
                <p className="text-primary-600 font-semibold text-lg">@institutocasajane</p>
                <p className="text-xs text-gray-500">Novidades, fotos e avisos de vagas</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
