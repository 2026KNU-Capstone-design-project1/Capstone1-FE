import { NavLink } from 'react-router-dom';
import AppIcon from '../AppIcon';
import BrandLogo from '../BrandLogo';
import { appNavigation } from '../../config/navigation';

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-black/60 lg:hidden" type="button" aria-label="사이드바 닫기" onClick={onClose} />}
      <aside className={`app-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r border-app-border-soft bg-app-sidebar transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[78px] items-center justify-between px-8">
          <BrandLogo to="/dashboard" variant="compact" />
          <button className="text-app-muted lg:hidden" type="button" onClick={onClose} aria-label="사이드바 닫기"><AppIcon name="close" className="h-6 w-6" /></button>
        </div>
        <nav className="space-y-2" aria-label="주요 메뉴">
          {appNavigation.map(item => (
            <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => `relative mx-1 flex h-12 items-center gap-5 rounded-lg px-6 text-[14px] transition-colors ${isActive ? 'border border-app-accent-dark bg-app-active text-app-accent before:absolute before:inset-y-0 before:-left-1 before:w-1 before:rounded-r before:bg-app-accent' : 'text-app-text-soft hover:bg-app-hover hover:text-white'}`}>
              <AppIcon name={item.icon} className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
