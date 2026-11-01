import { BlobProvider } from '@react-pdf/renderer';
import { Link } from 'react-router-dom';
import AppIcon from '../AppIcon';

function displayDateTime(value) {
  return value?.replaceAll('-', '.') ?? '-';
}

export default function PdfPreviewWorkspace({
  document,
  fileName,
  report,
  reportTypeLabel,
  returnTo = '/reports',
  returnLabel = '보고서 목록',
  totalPages,
  zoom,
  setZoom,
}) {
  return (
    <BlobProvider document={document}>
      {({ url, loading, error }) => (
        <>
          <div className="report-detail-heading px-1">
            <div className="min-w-0">
              <Link className="report-detail-back inline-flex items-center gap-1.5 rounded text-app-text-soft transition-colors hover:text-white" to={returnTo}>
                <AppIcon name="chevronLeft" className="h-5 w-5" />
                {returnLabel}
              </Link>
              <h2 id="report-detail-title" className="report-detail-title truncate font-bold text-app-text">{report.name}</h2>
              <p className="report-detail-meta text-app-text-soft">{reportTypeLabel} <span className="mx-2 text-app-muted">·</span> {displayDateTime(report.createdAt)} 생성</p>
            </div>
            <a
              className={`report-detail-download flex shrink-0 items-center gap-2 rounded-lg bg-app-accent px-6 font-bold text-[#071823] transition-colors hover:bg-[#ff982f] ${!url || loading ? 'pointer-events-none opacity-55' : ''}`}
              href={url ?? undefined}
              download={fileName}
              aria-disabled={!url || loading}
            >
              <AppIcon name="download" className="h-5 w-5" strokeWidth={2} />
              {loading ? 'PDF 생성 중' : 'PDF 다운로드'}
            </a>
          </div>

          <div className="report-preview-shell overflow-hidden rounded-lg border border-app-border bg-[#0a2130]">
            <div className="report-preview-toolbar grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-app-border pr-8 pl-[26px]">
              <div className="flex min-w-0 items-center gap-4">
                <strong className="truncate text-[15px] text-app-text">보고서 미리보기</strong>
                <span className="hidden h-5 w-px bg-app-border-strong sm:block" />
                <span className="shrink-0 text-[14px] text-[#a9bcc9]">총 {totalPages} 페이지</span>
              </div>
              <div className="flex min-w-0 shrink-0 items-center justify-end gap-3">
                <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-app-text-soft text-app-text-soft transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label="축소" disabled={zoom <= 60} onClick={() => setZoom(value => Math.max(60, value - 10))}><AppIcon name="minus" className="h-4 w-4" /></button>
                <span className="w-11 shrink-0 text-center text-[13px] text-app-text-soft">{zoom}%</span>
                <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-app-text-soft text-app-text-soft transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-35" type="button" aria-label="확대" disabled={zoom >= 150} onClick={() => setZoom(value => Math.min(150, value + 10))}><AppIcon name="plus" className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="report-preview-viewport bg-[#132f40]">
              {error && (
                <div className="grid h-full place-items-center px-6 text-center text-sm text-app-danger">
                  PDF를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.
                </div>
              )}
              {!error && loading && (
                <div className="grid h-full place-items-center text-sm text-app-text-soft">
                  A4 보고서를 생성하고 있습니다…
                </div>
              )}
              {!error && !loading && url && (
                <iframe
                  key={`${url}-${zoom}`}
                  className="report-preview-frame"
                  title="위험성평가 보고서 PDF 미리보기"
                  src={`${url}#toolbar=0&navpanes=0&scrollbar=1&zoom=${zoom}`}
                />
              )}
            </div>
          </div>
        </>
      )}
    </BlobProvider>
  );
}
