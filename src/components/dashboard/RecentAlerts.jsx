import AppIcon from '../AppIcon';

export default function RecentAlerts({ alerts }) {
  return (
    <section className="min-h-0 flex-1 rounded-xl border border-app-border bg-app-panel p-3.5" aria-labelledby="recent-alerts-title">
      <div className="flex items-center justify-between border-b border-app-border-soft pb-4">
        <h2 id="recent-alerts-title" className="text-[15px] font-bold">최신 알림</h2>
        <button className="flex items-center gap-1 text-[11px] text-app-muted hover:text-white" type="button">
          전체보기
          <AppIcon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>

      <div>
        {alerts.map(alert => (
          <article key={alert.id} className="grid grid-cols-[60px_8px_minmax(0,1fr)_40px_54px] items-center gap-2.5 border-b border-app-border-soft py-2.5 last:border-b-0 max-[1450px]:grid-cols-[52px_8px_minmax(0,1fr)_48px]">
            <img className="h-[54px] w-[60px] rounded-md object-cover max-[1450px]:h-12 max-[1450px]:w-[52px]" src={alert.image} alt="" />
            <span className="h-2 w-2 rounded-full bg-app-danger" />
            <div className="min-w-0">
              <h3 className="truncate text-[14px] text-app-text">{alert.title}</h3>
              <p className="mt-1 truncate text-[10px] text-app-muted">{alert.location}</p>
            </div>
            <time className="text-[11px] text-app-text-soft">{alert.time}</time>
            <span className="rounded-lg border border-[#7f2326] bg-[#381d24] px-2.5 py-2.5 text-center text-[10px] text-[#ff4c43] max-[1450px]:hidden">{alert.severity}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
