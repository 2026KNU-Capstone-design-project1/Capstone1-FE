import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getIndividualReport } from './api/reports';
import AppIcon from './components/AppIcon';
import { IndividualRiskPdfDocument } from './components/reports/IndividualRiskPdfDocument';
import PdfPreviewWorkspace from './components/reports/PdfPreviewWorkspace';
import { buildIndividualRiskPdfData, individualRiskPdfFileName } from './data/individualReportPdfData';
import { loadPdfImage } from './utils/image';

export default function IndividualReportDetailPage() {
  const { reportId } = useParams();
  const [zoom, setZoom] = useState(100);
  const [risk, setRisk] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const pdfData = useMemo(() => risk ? buildIndividualRiskPdfData(risk) : null, [risk]);
  const pdfDocument = useMemo(() => pdfData ? <IndividualRiskPdfDocument data={pdfData} /> : null, [pdfData]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReport() {
      setIsLoading(true);
      setError('');
      setRisk(null);

      try {
        const report = await getIndividualReport(reportId, { signal: controller.signal });
        let preparedReport = report;

        if (report.imageUrl) {
          const image = await loadPdfImage(report.imageUrl, { signal: controller.signal });
          preparedReport = {
            ...report,
            imageUrl: image.dataUrl,
            imageWidth: image.width,
            imageHeight: image.height,
          };
        }

        if (!controller.signal.aborted) setRisk(preparedReport);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || '개별 보고서를 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadReport();
    return () => controller.abort();
  }, [reportId]);

  if (isLoading) {
    return <div className="grid min-h-[520px] place-items-center text-sm text-app-text-soft">개별 보고서를 불러오고 있습니다…</div>;
  }

  if (!risk || !pdfData || !pdfDocument) {
    return (
      <section className="grid min-h-[calc(100vh-126px)] place-items-center rounded-xl border border-app-border bg-app-panel p-8 text-center">
        <div>
          <AppIcon name="report" className="mx-auto h-12 w-12 text-app-muted" />
          <h2 className="mt-4 text-xl font-bold text-app-text">{error || '개별 보고서를 찾을 수 없습니다.'}</h2>
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
