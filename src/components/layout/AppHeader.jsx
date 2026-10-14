import { useEffect, useRef, useState } from 'react';
import AppIcon from '../AppIcon';
import SiteSelector from './SiteSelector';
import NotificationMenu from './NotificationMenu';
import UserMenu from './UserMenu';
import { dashboardMock } from '../../data/dashboardMock';

export default function AppHeader({ title, onOpenSidebar, onLogout }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedSite, setSelectedSite] = useState(dashboardMock.site);
  const [unreadIds, setUnreadIds] = useState(dashboardMock.recentAlerts.map(alert => alert.id));
  const menusRef = useRef(null);

  useEffect(() => {
    function closeOutside(event) {
      if (!menusRef.current?.contains(event.target)) setOpenMenu(null);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpenMenu(null);
    }
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  function toggleMenu(menu) {
    setOpenMenu(current => current === menu ? null : menu);
  }

  return (
    <header className="flex h-[77px] items-center justify-between gap-4 border-b border-app-border-soft px-5 lg:px-[21px]">
      <div className="flex min-w-0 items-center gap-3">
        <button className="shrink-0 rounded-md p-1 text-app-text lg:hidden" type="button" onClick={onOpenSidebar} aria-label="사이드바 열기"><AppIcon name="menu" className="h-6 w-6" /></button>
        <h1 className="truncate text-[24px] font-bold tracking-[-.4px] text-app-text sm:text-[26px]">{title}</h1>
      </div>
      <div ref={menusRef} className="flex items-center gap-4">
        <SiteSelector sites={dashboardMock.sites} selectedSite={selectedSite} open={openMenu === 'site'} onToggle={() => toggleMenu('site')} onSelect={site => { setSelectedSite(site); setOpenMenu(null); }} />
        <NotificationMenu alerts={dashboardMock.recentAlerts} unreadIds={unreadIds} open={openMenu === 'notifications'} onToggle={() => toggleMenu('notifications')} onRead={id => setUnreadIds(ids => ids.filter(item => item !== id))} onReadAll={() => setUnreadIds([])} />
        <div className="hidden h-9 w-px bg-app-border-soft sm:block" />
        <UserMenu user={dashboardMock.user} open={openMenu === 'user'} onToggle={() => toggleMenu('user')} onLogout={onLogout} />
      </div>
    </header>
  );
}
