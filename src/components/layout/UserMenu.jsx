import AppIcon from '../AppIcon';

export default function UserMenu({ user, open, onToggle, onLogout }) {
  return (
    <div className="relative">
      <button className="group flex items-center gap-7 rounded-lg px-2 py-1 text-left transition-colors hover:bg-app-hover" type="button" onClick={onToggle} aria-expanded={open}>
        <span className="hidden sm:block"><span className="block text-[12px] font-semibold text-app-text">{user.name}</span><span className="mt-0.5 block text-[11px] text-app-muted">{user.role}</span></span>
        <AppIcon name="chevronDown" className={`h-4 w-4 text-app-text transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="absolute top-10 right-0 z-30 w-32 rounded-lg border border-app-border-strong bg-app-panel p-1 shadow-xl"><button className="w-full rounded-md px-3 py-2 text-left text-xs text-app-text hover:bg-app-hover" type="button" onClick={onLogout}>로그아웃</button></div>}
    </div>
  );
}
