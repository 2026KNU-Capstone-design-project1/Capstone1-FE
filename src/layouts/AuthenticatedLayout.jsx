import { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { getAccessToken, getUserRole, isWorkerRole, logout } from '../api/auth';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import { getStoredTheme, saveTheme } from '../utils/theme';

export default function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme);
  const navigate = useNavigate();

  function handleThemeChange(nextTheme) {
    setTheme(nextTheme);
    saveTheme(nextTheme);
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  if (getAccessToken() && isWorkerRole(getUserRole())) {
    return <Navigate to="/worker" replace />;
  }

  return (
    <div className="app-shell min-h-screen bg-app-background text-app-text transition-colors duration-200">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onThemeChange={handleThemeChange}
      />

      <div className="min-w-0">
        <AppHeader
          title="Safety Dashboard"
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="min-h-[calc(100vh-77px)] px-5 pt-[14px] pb-[34px] lg:px-[21px]">
          <div className="app-content-frame w-full">
            <Outlet context={{ theme }} />
          </div>
        </main>
      </div>
    </div>
  );
}
