import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import { getPageTitle } from '../config/navigation';

export default function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell min-h-screen bg-app-background text-app-text">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0">
        <AppHeader
          title={getPageTitle(location.pathname)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="min-h-[calc(100vh-77px)] px-5 pt-[14px] pb-[34px] lg:px-[21px]">
          <div className="app-content-frame w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
