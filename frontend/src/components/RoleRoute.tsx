import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

export const RoleRoute = ({ children, resource }: { children: ReactNode, resource: string }) => {
  const { canAccess } = usePermissions();
  if (!canAccess(resource)) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};
