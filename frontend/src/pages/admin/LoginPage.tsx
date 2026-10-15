import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/admin');
      toast.success('Login realizado com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-plum-950 via-charcoal-900 to-primary-950 flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Botão Voltar */}
      <Link 
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-rose-200/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10"
      >
        <ArrowLeft size={14} /> Voltar para o site
      </Link>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
        {/* Cabeçalho com Logo Oficial */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <img 
              src="/logo-icon.png" 
              alt="Logo Casa Jane" 
              className="w-20 h-20 mx-auto object-contain rounded-2xl shadow-md p-1.5 border border-gray-100 bg-white"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-charcoal-800 tracking-tight">Instituto Casa Jane</h2>
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mt-1">Área Administrativa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
              E-mail de Acesso
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="digite aqui seu e-mail de acesso." 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-gradient hover:bg-brand-gradient-hover text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-primary-600/25 hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? 'Entrando no Sistema...' : 'Entrar no Painel'}
          </button>
        </form>

        <p className="mt-8 text-xs text-gray-400 text-center leading-relaxed">
          Acesso restrito à diretoria e colaboradores autorizados do Instituto Casa Jane.
        </p>
      </div>
    </div>
  );
}
