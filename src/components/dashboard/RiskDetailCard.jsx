import AppIcon from '../AppIcon';

export default function RiskDetailCard({ risk }) {
  const details = [
    ['구역', risk.area],
    ['시설물', risk.facility],
    ['위험 유형', risk.type],
    ['위험도', risk.severity],
    ['감지 시점', risk.detectedAt],
  ];

  return (
    <section className="rounded-xl border border-app-border bg-app-panel p-3.5" aria-labelledby="risk-detail-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="risk-detail-title" className="flex items-center gap-2.5 text-[15px] font-bold text-app-danger">
          <span className="h-3.5 w-3.5 rounded-full bg-app-danger" />
          고위험 탐지 상세
        </h2>
        <span className="truncate text-[11px] text-app-muted">#{risk.id}</span>
      </div>

      <div className="mt-4 grid grid-cols-[140px_minmax(0,1fr)] gap-3.5 max-[1450px]:grid-cols-[112px_minmax(0,1fr)]">
        <img className="h-[148px] w-full rounded-md object-cover" src={risk.image} alt="고위험 작업 현장" />
        <dl className="space-y-3 text-[12px]">
          {details.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[58px_minmax(0,1fr)] items-center gap-2.5">
              <dt className="text-app-muted">{label}</dt>
              <dd className="truncate text-app-text">
                {label === '위험도'
                  ? <span className="rounded-md bg-[#a82020] px-2.5 py-0.5 text-white">{value}</span>
                  : value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_1fr_40px] gap-2.5">
        <button className="flex h-11 items-center justify-center gap-2 rounded-lg border border-app-border-strong text-[13px] font-bold transition-colors hover:bg-app-hover" type="button">
          <AppIcon name="play" className="h-4.5 w-4.5" />
          영상 보기
        </button>
        <button className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#ff7e21] text-[13px] font-bold text-[#101820] transition-colors hover:bg-[#ff963f]" type="button">
          <AppIcon name="check" className="h-4.5 w-4.5" />
          조치 완료
        </button>
        <button className="grid h-11 place-items-center rounded-lg border border-app-border-strong transition-colors hover:bg-app-hover" type="button" aria-label="더 보기">
          <AppIcon name="more" className="h-4.5 w-4.5" />
        </button>
      </div>
    </section>
  );
}
