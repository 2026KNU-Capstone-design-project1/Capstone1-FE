import { useEffect, useRef, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import { getAccessToken, getUserRole, isWorkerRole, logout } from '../api/auth';

const workerNavigation = [
  { to: '/worker', label: '홈', icon: 'home', end: true },
  { to: '/worker/actions', label: '내 조치', icon: 'clipboardCheck' },
  { to: '/worker/upload', label: '업로드', icon: 'uploadCloud' },
  { to: '/worker/notifications', label: '알림', icon: 'bell' },
];

function WorkerLogo() {
  return (
    <div className="flex items-center gap-[11px]" aria-label="VIRNECT">
      <svg className="h-8 w-8 text-app-accent" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
        <path d="M8 1h32l-6 9H14ZM1 11h13l10 19 10-19h13L29 47H19Z" />
      </svg>
      <span className="text-[24px] leading-none font-black tracking-[-1.1px] text-[#101c25]">VIRNECT</span>
    </div>
  );
}

function AnonymousAvatar() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#d5dde1" />
      <circle cx="20" cy="14.5" r="7.5" fill="#aeb9be" />
      <path d="M7.4 36.1c1.4-8.3 6.1-12.6 12.6-12.6s11.2 4.3 12.6 12.6A19.9 19.9 0 0 1 20 40 19.9 19.9 0 0 1 7.4 36.1Z" fill="#aeb9be" />
    </svg>
  );
}

export default function WorkerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [workerUserName, setWorkerUserName] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    function closeMenuOutside(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    }

    function closeMenuOnEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('pointerdown', closeMenuOutside);
    document.addEventListener('keydown', closeMenuOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeMenuOutside);
      document.removeEventListener('keydown', closeMenuOnEscape);
    };
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  if (getAccessToken() && !isWorkerRole(getUserRole())) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#dfe5e9] text-[#14232e]">
      <div className="worker-app relative mx-auto min-h-[100dvh] w-full max-w-[430px] overflow-x-hidden bg-[#f6f8fa]">
        <header className="sticky top-0 z-30 flex h-[calc(110px+env(safe-area-inset-top))] items-end justify-between bg-[#f6f8fa]/95 pr-[27px] pl-[30px] pt-[env(safe-area-inset-top)] pb-4 backdrop-blur-lg">
          <WorkerLogo />
          <div ref={menuRef} className="relative">
            <button
              className="grid h-11 w-11 place-items-center rounded-full transition-opacity hover:opacity-80"
              type="button"
              aria-label="사용자 메뉴"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
            >
              <AnonymousAvatar />
            </button>
            {menuOpen && (
              <div className="absolute top-12 right-0 w-40 overflow-hidden rounded-2xl border border-[#e6ebee] bg-white p-2">
                <p className="border-b border-[#edf0f2] px-3 py-2.5 text-[13px] font-bold text-[#44515a]">{workerUserName ? `${workerUserName} 작업자` : '작업자'}</p>
                <button className="w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-[#d65d21] hover:bg-[#fff4ef]" type="button" onClick={handleLogout}>로그아웃</button>
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 px-[25px] pt-[26px] pb-[calc(125px+env(safe-area-inset-bottom))]">
          <Outlet context={{ setWorkerUserName }} />
        </main>

        <nav className="fixed right-0 bottom-0 left-0 z-30 mx-auto grid h-[100px] w-full max-w-[430px] grid-cols-4 border-t border-[#e0e5e8] bg-white/95 px-2 pb-[max(28px,env(safe-area-inset-bottom))] backdrop-blur-xl" aria-label="작업자 메뉴">
          {workerNavigation.map(item => {
            const selected = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`flex flex-col items-center justify-center gap-[5px] pt-1 text-[12px] leading-none font-bold transition-colors ${selected ? 'text-app-accent' : 'text-[#59636c]'}`}
              >
                <AppIcon name={item.icon} className="h-[28px] w-[28px]" strokeWidth={selected ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
