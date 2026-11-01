import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AppIcon from './components/AppIcon';
import { ReportPdfDocument } from './components/reports/ReportPdfDocument';
import PdfPreviewWorkspace from './components/reports/PdfPreviewWorkspace';
import { buildReportPdfData, reportPdfFileName, reportPdfPageCount } from './data/reportPdfMock';
import { reportMock } from './data/reportMock';

const TYPE_LABEL = {
  regular: '정기 보고서',
  adHoc: '수시 보고서',
};

export default function ReportDetailPage() {
  const { reportId } = useParams();
  const location = useLocation();
  const [zoom, setZoom] = useState(100);
  const report = location.state?.report ?? reportMock.find(item => item.id === reportId);
  const pdfData = useMemo(() => report ? buildReportPdfData(report) : null, [report]);
  const pdfDocument = useMemo(() => pdfData ? <ReportPdfDocument data={pdfData} /> : null, [pdfData]);

  if (!report || !pdfData || !pdfDocument) {
    return (
      <section className="grid min-h-[calc(100vh-126px)] place-items-center rounded-xl border border-app-border bg-app-panel p-8 text-center">
        <div>
          <AppIcon name="report" className="mx-auto h-12 w-12 text-app-muted" />
          <h2 className="mt-4 text-xl font-bold text-app-text">보고서를 찾을 수 없습니다.</h2>
          <Link className="mt-5 inline-flex text-sm font-medium text-app-accent hover:underline" to="/reports">보고서 목록으로 돌아가기</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="report-detail-section relative min-w-0 pb-1" style={{ maxWidth: 'calc(100vw - 40px)' }} aria-labelledby="report-detail-title">
      <PdfPreviewWorkspace
        document={pdfDocument}
        fileName={reportPdfFileName(report)}
        report={report}
        reportTypeLabel={TYPE_LABEL[report.type]}
        totalPages={reportPdfPageCount(pdfData)}
        zoom={zoom}
        setZoom={setZoom}
      />
    </section>
  );
}
