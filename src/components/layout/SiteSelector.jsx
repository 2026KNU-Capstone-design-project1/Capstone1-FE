import AppIcon from '../AppIcon';

export default function SiteSelector({ sites, selectedSite, open, onToggle, onSelect }) {
  return (
    <div className="relative hidden sm:block">
      <button className="flex h-10 items-center gap-3 rounded-lg border border-app-border-strong bg-app-panel px-3 text-[12px] font-semibold text-app-text transition-colors hover:border-app-border-hover hover:bg-app-hover" type="button" onClick={onToggle} aria-haspopup="listbox" aria-expanded={open}>
        <AppIcon name="site" className="h-5 w-5" />
        <span className="max-w-[190px] truncate">{selectedSite.name}</span>
        <AppIcon name="chevronDown" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-12 right-0 z-30 w-[270px] rounded-xl border border-app-border-strong bg-app-panel p-2 shadow-2xl" role="listbox" aria-label="현장 선택">
          {sites.map(site => (
            <button key={site.id} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs text-app-text transition-colors hover:bg-app-hover" type="button" role="option" aria-selected={selectedSite.id === site.id} onClick={() => onSelect(site)}>
              <span className="truncate">{site.name}</span>
              {selectedSite.id === site.id && <AppIcon name="check" className="h-4 w-4 text-app-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
