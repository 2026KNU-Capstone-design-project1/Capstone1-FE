import { useState } from 'react';

const SEVERITY_STYLES = {
  HIGH: 'border-app-high-border bg-app-high-bg text-app-high-text',
  MEDIUM: 'border-app-medium-border bg-app-medium-bg text-app-medium-text',
  LOW: 'border-app-low-border bg-app-low-bg text-app-low-text',
};

const STATUS_LABELS = {
  OPEN: '미처리',
  IN_PROGRESS: '처리중',
};

export default function UnresolvedRiskList({ risks, selectedRiskId, onSelect }) {
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const filteredRisks = risks.filter(risk => risk.status === statusFilter);

  function changeStatusFilter(status) {
    setStatusFilter(status);
    const firstRisk = risks.find(risk => risk.status === status);
    if (firstRisk) onSelect(firstRisk);
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-app-border bg-app-panel p-3.5" aria-labelledby="risk-list-title">
      <div className="flex items-center justify-between gap-3 border-b border-app-border-soft pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <h2 id="risk-list-title" className="shrink-0 text-[20px] font-bold">위험 목록</h2>
          <div className="flex items-center rounded-lg border border-app-border bg-app-control p-0.5" aria-label="위험 처리 상태 필터">
            {[
              ['OPEN', '미처리'],
              ['IN_PROGRESS', '처리중'],
            ].map(([status, label]) => (
              <button
                key={status}
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${statusFilter === status ? 'bg-app-accent text-app-accent-text' : 'text-app-muted hover:text-app-text'}`}
                type="button"
                aria-pressed={statusFilter === status}
                onClick={() => changeStatusFilter(status)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <span className="shrink-0 text-[11px] text-app-muted">{filteredRisks.length}건</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {filteredRisks.map(risk => {
          const severity = String(risk.severity ?? '').toUpperCase();
          const selected = selectedRiskId === risk.id;
          const location = [risk.area, risk.facility].filter(Boolean).join(' · ') || '위치 정보 없음';

          return (
            <button
              key={risk.id}
              className={`my-1.5 w-full rounded-lg border px-3 py-2.5 text-left transition-colors first:mt-2 ${selected ? 'border-app-accent bg-app-selected shadow-[inset_3px_0_0_var(--color-app-accent)]' : 'border-transparent border-b-app-border-soft hover:border-app-border hover:bg-app-hover'}`}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(risk)}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-app-text">{risk.content ?? '위험 내용 없음'}</span>
                <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-extrabold ${SEVERITY_STYLES[severity] ?? 'border-app-border bg-app-active-subtle text-app-muted'}`}>
                  {severity || '-'}
                </span>
              </span>
              <span className="mt-1 block truncate text-[11px] text-app-muted">
                {location}
              </span>
              <span className="mt-2 flex items-center justify-between gap-3 text-[11px] text-app-text-soft">
                <span>{STATUS_LABELS[risk.status] ?? risk.status ?? '-'} {risk.statusDate ?? ''}</span>
                <span className="truncate">담당자 {risk.assignee ?? '미배정'}</span>
              </span>
            </button>
          );
        })}
        {filteredRisks.length === 0 && (
          <p className="py-10 text-center text-[12px] text-app-muted">해당 상태의 위험이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
