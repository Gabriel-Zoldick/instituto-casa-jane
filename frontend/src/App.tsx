import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';
import { RoleRoute } from './components/RoleRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ProjectsPage from './pages/public/ProjectsPage';
import TransparencyPage from './pages/public/TransparencyPage';
import DonatePage from './pages/public/DonatePage';
import AboutPage from './pages/public/AboutPage';
import EnrollmentPage from './pages/public/EnrollmentPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import PeopleListPage from './pages/admin/people/PeopleListPage';
import ProjectsListPage from './pages/admin/projects/ProjectsListPage';
import DocumentsPage from './pages/admin/DocumentsPage';
import DonationsConfigPage from './pages/admin/DonationsConfigPage';
import UsersPage from './pages/admin/UsersPage';
import SecurityPage from './pages/admin/SecurityPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/matricula" element={<EnrollmentPage />} />
        <Route path="/transparencia" element={<TransparencyPage />} />
        <Route path="/como-doar" element={<DonatePage />} />
        <Route path="/sobre" element={<AboutPage />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="pessoas" element={<PeopleListPage />} />
        <Route path="projetos" element={<ProjectsListPage />} />
        <Route path="documentos" element={<DocumentsPage />} />
        <Route path="doacoes" element={
          <RoleRoute resource="donations">
            <DonationsConfigPage />
          </RoleRoute>
        } />
        <Route path="usuarios" element={
          <RoleRoute resource="users">
            <UsersPage />
          </RoleRoute>
        } />
        <Route path="seguranca" element={
          <RoleRoute resource="users">
            <SecurityPage />
          </RoleRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
