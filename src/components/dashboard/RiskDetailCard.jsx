import { useState } from 'react';
import AppIcon from '../AppIcon';

function RiskImage({ risk }) {
  const [failed, setFailed] = useState(false);

  if (!risk.image || failed) {
    return (
      <div className="grid h-[148px] w-full place-items-center rounded-md bg-app-active-subtle text-center text-[11px] text-app-muted">
        이미지 없음
      </div>
    );
  }

  return (
    <img
      className="h-[148px] w-full rounded-md object-cover"
      src={risk.image}
      alt={`${risk.content ?? '위험'} 현장`}
      onError={() => setFailed(true)}
    />
  );
}

export default function RiskDetailCard({ risk }) {
  if (!risk) {
    return (
      <section className="rounded-xl border border-app-border bg-app-panel p-3.5" aria-labelledby="risk-detail-title">
        <h2 id="risk-detail-title" className="flex items-center gap-2.5 text-[15px] font-bold text-app-danger">
          <span className="h-3.5 w-3.5 rounded-full bg-app-danger" />
          위험 탐지 상세
        </h2>
        <div className="grid min-h-[216px] place-items-center text-center text-[12px] text-app-muted">
          표시할 미해결 위험이 없습니다.
        </div>
      </section>
    );
  }

  const severity = String(risk.severity ?? '').toUpperCase();
  const severityStyle = severity === 'HIGH'
    ? 'bg-app-high-bg text-app-high-text'
    : severity === 'MEDIUM'
      ? 'bg-app-medium-bg text-app-medium-text'
      : severity === 'LOW'
        ? 'bg-app-low-bg text-app-low-text'
        : 'bg-app-active-subtle text-app-muted';
  const details = [
    ['위험 내용', risk.content ?? risk.type ?? '-'],
    ['위치', [risk.area, risk.facility].filter(Boolean).join(' · ') || '-'],
    ['위험 유형', risk.riskType ?? risk.type ?? '-'],
    ['위험도', severity || '-'],
    ['감지 시점', risk.detectedAt ?? '-'],
  ];

  return (
    <section className="rounded-xl border border-app-border bg-app-panel p-3.5" aria-labelledby="risk-detail-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="risk-detail-title" className="flex items-center gap-2.5 text-[15px] font-bold text-app-danger">
          <span className="h-3.5 w-3.5 rounded-full bg-app-danger" />
          위험 탐지 상세
        </h2>
        <span className="truncate text-[11px] text-app-muted">#{risk.id}</span>
      </div>

      <div className="mt-4 grid grid-cols-[140px_minmax(0,1fr)] gap-3.5 max-[1450px]:grid-cols-[112px_minmax(0,1fr)]">
        <RiskImage key={`${risk.id}-${risk.image ?? 'empty'}`} risk={risk} />
        <dl className="space-y-3 text-[12px]">
          {details.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[58px_minmax(0,1fr)] items-center gap-2.5">
              <dt className="text-app-muted">{label}</dt>
              <dd className="truncate text-app-text">
                {label === '위험도'
                  ? <span className={`rounded-md px-2.5 py-0.5 ${severityStyle}`}>{value}</span>
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
        <button className="flex h-11 items-center justify-center gap-2 rounded-lg bg-app-accent text-[13px] font-bold text-app-accent-text transition-colors hover:brightness-110" type="button">
          <AppIcon name="user" className="h-4.5 w-4.5" />
          담당자 지정
        </button>
        <button className="grid h-11 place-items-center rounded-lg border border-app-border-strong transition-colors hover:bg-app-hover" type="button" aria-label="더 보기">
          <AppIcon name="more" className="h-4.5 w-4.5" />
        </button>
      </div>
    </section>
  );
}
