import { useEffect, useState } from 'react';
import { Users, Baby, User, FolderKanban, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Stats {
  total_people: number;
  children: number;
  adults: number;
  active_projects: number;
  recent_enrollments: Array<{ person_name: string; project_name: string; enrolled_at: string }>;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total de Pessoas', value: stats?.total_people ?? 0, icon: Users, color: 'blue' },
    { label: 'Crianças', value: stats?.children ?? 0, icon: Baby, color: 'green' },
    { label: 'Adultos', value: stats?.adults ?? 0, icon: User, color: 'orange' },
    { label: 'Projetos Ativos', value: stats?.active_projects ?? 0, icon: FolderKanban, color: 'purple' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-primary-50 text-primary-600',
    orange: 'bg-plum-50 text-plum-700',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal-800">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo, {user?.name}!</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl ${colorMap[color]}`}><Icon size={24} /></div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                  <p className="text-2xl font-extrabold text-charcoal-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-primary-600" />
              <h2 className="text-lg font-bold text-charcoal-800">Matrículas Recentes</h2>
            </div>
            {stats?.recent_enrollments?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma matrícula recente</p>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-xs text-gray-500 font-medium uppercase">Nome</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium uppercase">Projeto</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.recent_enrollments?.map((e, i) => (
                    <tr key={i}>
                      <td className="py-3 text-sm font-medium text-gray-900">{e.person_name}</td>
                      <td className="py-3 text-sm text-gray-500">{e.project_name}</td>
                      <td className="py-3 text-sm text-gray-500">{new Date(e.enrolled_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};
export default DashboardPage;
