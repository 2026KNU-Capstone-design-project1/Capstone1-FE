import { Link, useLocation, useParams } from 'react-router-dom';
import AppIcon from '../AppIcon';

export default function IndividualReportLoadingWorkspace() {
  const { reportId } = useParams();
  const location = useLocation();
  const routeRisk = location.state?.risk;
  const riskCode = routeRisk?.id ?? reportId;
  const riskContent = routeRisk?.riskContent;
  const title = [riskCode, riskContent, '개별 위험성평가 보고서'].filter(Boolean).join(' ');

  return (
    <section
      className="report-detail-section relative min-w-0 pb-1"
      style={{ maxWidth: 'calc(100vw - 40px)' }}
      aria-labelledby="report-detail-title"
      aria-busy="true"
    >
      <div className="report-detail-heading px-1">
        <div className="min-w-0">
          <Link className="report-detail-back inline-flex items-center gap-1.5 rounded text-app-text-soft transition-colors hover:text-app-text" to="/reports?tab=individual">
            <AppIcon name="chevronLeft" className="h-5 w-5" />
            보고서 목록
          </Link>
          <h2 id="report-detail-title" className="report-detail-title truncate font-bold text-app-text">
            {title}
          </h2>
          <p className="report-detail-meta text-app-text-soft">
            개별 보고서 <span className="mx-2 text-app-muted">·</span> 데이터 확인 중
          </p>
        </div>
        <button
          className="report-detail-download flex shrink-0 cursor-wait items-center gap-2 rounded-lg bg-app-accent px-6 font-bold text-app-accent-text opacity-55"
          type="button"
          disabled
        >
          <AppIcon name="download" className="h-5 w-5" strokeWidth={2} />
          PDF 준비 중
        </button>
      </div>

      <div className="report-preview-shell overflow-hidden rounded-lg border border-app-border bg-app-panel">
        <div className="report-preview-toolbar grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-app-border pr-8 pl-[26px]">
          <div className="flex min-w-0 items-center gap-4">
            <strong className="truncate text-[15px] text-app-text">보고서 미리보기</strong>
            <span className="hidden h-5 w-px bg-app-border-strong sm:block" />
            <span className="shrink-0 text-[14px] text-app-muted">총 1 페이지</span>
          </div>
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-3 opacity-35">
            <button className="grid h-8 w-8 place-items-center rounded-full border border-app-text-soft text-app-text-soft" type="button" disabled aria-label="축소"><AppIcon name="minus" className="h-4 w-4" /></button>
            <span className="w-11 text-center text-[13px] text-app-text-soft">100%</span>
            <button className="grid h-8 w-8 place-items-center rounded-full border border-app-text-soft text-app-text-soft" type="button" disabled aria-label="확대"><AppIcon name="plus" className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="report-preview-viewport">
          <div className="report-preview-loading grid h-full place-items-center px-6 text-center text-sm" role="status">
            개별 보고서 데이터를 불러오고 있습니다…
          </div>
        </div>
      </div>
    </section>
  );
}
