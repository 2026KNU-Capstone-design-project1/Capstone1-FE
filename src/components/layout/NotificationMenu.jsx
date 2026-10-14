import AppIcon from '../AppIcon';

export default function NotificationMenu({ alerts, unreadIds, open, onToggle, onRead, onReadAll }) {
  return (
    <div className="relative">
      <button className="relative grid h-10 w-10 place-items-center rounded-lg text-app-text transition-colors hover:bg-app-hover hover:text-white" type="button" aria-label={`알림 ${unreadIds.length}개`} aria-expanded={open} onClick={onToggle}>
        <AppIcon name="bell" className="h-6 w-6" />
        {unreadIds.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-app-danger" />}
      </button>
      {open && (
        <div className="absolute top-12 right-0 z-30 w-[340px] overflow-hidden rounded-xl border border-app-border-strong bg-app-panel shadow-2xl max-sm:fixed max-sm:top-[68px] max-sm:right-3 max-sm:left-3 max-sm:w-auto">
          <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
            <div><p className="text-sm font-bold text-app-text">알림</p><p className="mt-0.5 text-[11px] text-app-muted">읽지 않은 알림 {unreadIds.length}개</p></div>
            <button className="text-[11px] text-app-accent hover:underline disabled:cursor-default disabled:opacity-40" type="button" disabled={unreadIds.length === 0} onClick={onReadAll}>모두 읽음</button>
          </div>
          {alerts.map(alert => {
            const unread = unreadIds.includes(alert.id);
            return (
              <button key={alert.id} className={`grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 border-b border-app-border-soft px-4 py-3 text-left transition-colors last:border-0 hover:bg-app-hover ${unread ? 'bg-app-active-subtle' : ''}`} type="button" onClick={() => onRead(alert.id)}>
                <img className="h-11 w-12 rounded-md object-cover" src={alert.image} alt="" />
                <span className="min-w-0"><span className="block truncate text-xs font-semibold text-app-text">{alert.title}</span><span className="mt-1 block truncate text-[10px] text-app-muted">{alert.location}</span></span>
                <span className="flex items-center gap-2 text-[10px] text-app-muted">{unread && <span className="h-2 w-2 rounded-full bg-app-danger" />}{alert.time}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
