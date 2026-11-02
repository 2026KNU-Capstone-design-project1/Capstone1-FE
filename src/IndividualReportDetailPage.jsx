import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AppIcon from './components/AppIcon';
import { IndividualRiskPdfDocument } from './components/reports/IndividualRiskPdfDocument';
import PdfPreviewWorkspace from './components/reports/PdfPreviewWorkspace';
import { buildIndividualRiskPdfData, individualRiskPdfFileName } from './data/individualReportPdfMock';

export default function IndividualReportDetailPage() {
  const { reportId } = useParams();
  const location = useLocation();
  const [zoom, setZoom] = useState(100);
  const risk = location.state?.risk?.reportId === Number(reportId) ? location.state.risk : null;
  const pdfData = useMemo(() => risk ? buildIndividualRiskPdfData(risk) : null, [risk]);
  const pdfDocument = useMemo(() => pdfData ? <IndividualRiskPdfDocument data={pdfData} /> : null, [pdfData]);

  if (!risk || !pdfData || !pdfDocument) {
    return (
      <section className="grid min-h-[calc(100vh-126px)] place-items-center rounded-xl border border-app-border bg-app-panel p-8 text-center">
        <div>
          <AppIcon name="report" className="mx-auto h-12 w-12 text-app-muted" />
          <h2 className="mt-4 text-xl font-bold text-app-text">개별 보고서를 찾을 수 없습니다.</h2>
          <Link className="mt-5 inline-flex text-sm font-medium text-app-accent hover:underline" to="/reports?tab=individual">개별 보고서 목록으로 돌아가기</Link>
        </div>
      </section>
    );
  }

  const workspaceReport = {
    ...risk,
    name: `${risk.id} ${risk.riskContent} 개별 위험성평가 보고서`,
  };

  return (
    <section className="report-detail-section relative min-w-0 pb-1" style={{ maxWidth: 'calc(100vw - 40px)' }} aria-labelledby="report-detail-title">
      <PdfPreviewWorkspace
        document={pdfDocument}
        fileName={individualRiskPdfFileName(risk)}
        report={workspaceReport}
        reportTypeLabel="개별 보고서"
        returnTo="/reports?tab=individual"
        totalPages={1}
        zoom={zoom}
        setZoom={setZoom}
      />
    </section>
  );
}
