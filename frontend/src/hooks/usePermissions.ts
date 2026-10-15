import { useAuth } from '../contexts/AuthContext';

const DEFAULT_VISIBLE_BY_ROLE: Record<string, string[]> = {
  superadmin: ['cpf', 'rg', 'address', 'phone', 'email', 'birth_date', 'school', 'notes'],
  admin:      ['cpf', 'rg', 'address', 'phone', 'email', 'birth_date', 'school', 'notes'],
  coordinator:['phone', 'email', 'birth_date', 'school', 'notes'],
  viewer:     [],
};

const RESOURCE_ACCESS: Record<string, string[]> = {
  users:           ['superadmin'],
  donations:       ['superadmin', 'admin'],
  documents_admin: ['superadmin', 'admin'],
};

export function usePermissions() {
  const { user } = useAuth();

  /** Verifica se o usuário pode ver um campo específico de pessoa */
  const canView = (field: string): boolean => {
    if (!user) return false;
    const allowedFields = DEFAULT_VISIBLE_BY_ROLE[user.role] ?? [];
    return allowedFields.includes(field);
  };

  /** Verifica se o usuário tem acesso a um recurso/módulo */
  const canAccess = (resource: string): boolean => {
    if (!user) return false;
    const allowedRoles = RESOURCE_ACCESS[resource];
    if (!allowedRoles) return true; // recurso sem restrição
    return allowedRoles.includes(user.role);
  };

  /** Verifica se o usuário tem pelo menos o nível de papel indicado */
  const isAtLeast = (role: string): boolean => {
    if (!user) return false;
    const order = ['viewer', 'coordinator', 'admin', 'superadmin'];
    return order.indexOf(user.role) >= order.indexOf(role);
  };

  return { canView, canAccess, isAtLeast };
}
