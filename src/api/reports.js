import { authorizedRequest } from './auth';

async function getReportList(path, label, options) {
  try {
    return await authorizedRequest(path, options);
  } catch (error) {
    const statusText = error.status ? ` (HTTP ${error.status})` : '';
    error.message = `${label} 조회 실패: ${error.message}${statusText}`;
    throw error;
  }
}

function reportCode(reportId) {
  return `REPORT-${String(reportId).padStart(3, '0')}`;
}

function reportCreatedAt(report) {
  return report.createdAt ?? report.created_at;
}

function storageObjectKey(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('risk-thumbnails/')) return imageUrl;

  try {
    const url = new URL(imageUrl);
    if (!url.hostname.includes('.s3.')) return null;
    return decodeURIComponent(url.pathname.replace(/^\//, ''));
  } catch {
    return null;
  }
}

async function resolveReportImageUrl(imageUrl, options) {
  const objectKey = storageObjectKey(imageUrl);
  if (!objectKey) return imageUrl;

  const download = await getReportList(
    `/api/storage/download-urls?key=${encodeURIComponent(objectKey)}`,
    '보고서 이미지 URL',
    options,
  );

  if (!download?.downloadUrl) {
    throw new Error('보고서 이미지 URL 발급 응답이 올바르지 않습니다.');
  }

  return download.downloadUrl;
}

function toCollectionReport(report) {
  const [analysisStart = '-', analysisEnd = '-'] = (report.analysisPeriod ?? '')
    .split('~')
    .map(value => value.trim());

  return {
    reportId: report.reportId,
    id: reportCode(report.reportId),
    reportType: 'summary',
    name: report.title ?? '-',
    type: 'regular',
    analysisStart,
    analysisEnd,
    riskCount: report.includedRiskCount ?? 0,
    createdAt: reportCreatedAt(report),
    status: '생성 완료',
  };
}

function toIndividualReport(report, individualReport) {
  return {
    reportId: report.reportId,
    id: reportCode(report.reportId),
    reportType: 'individual',
    riskId: individualReport?.riskId,
    riskContent: report.hazard ?? individualReport?.taskName ?? '-',
    location: individualReport?.location ?? '-',
    riskType: individualReport?.riskType ?? '-',
    riskLevel: individualReport?.riskLevel ?? '-',
    createdAt: reportCreatedAt(report) ?? reportCreatedAt(individualReport ?? {}),
    status: '생성 완료',
    improvement: individualReport?.riskContent ?? '-',
    safetyMeasure: individualReport?.safetyStep ?? '-',
    legalBasis: individualReport?.legalBasis ?? '-',
    jobName: individualReport?.taskName ?? report.hazard ?? '-',
    accidentType: individualReport?.riskType ?? '-',
  };
}

function toIndividualReportDetail(report) {
  return {
    reportId: report.reportId,
    riskId: report.riskId,
    id: `RISK-${String(report.riskId).padStart(3, '0')}`,
    reportType: 'individual',
    riskContent: report.taskName ?? `개별 보고서 ${report.reportId}`,
    jobName: report.taskName ?? '-',
    location: report.location ?? '-',
    riskType: report.riskType ?? '-',
    accidentType: report.riskType ?? '-',
    riskLevel: report.riskLevel ?? '-',
    improvement: report.riskContent ?? '-',
    safetyMeasure: report.safetyStep ?? '-',
    legalBasis: report.legalBasis ?? '-',
    createdAt: reportCreatedAt(report),
    imageUrl: report.imageUrl ?? null,
    bbox: report.bbox ?? null,
    status: '생성 완료',
  };
}

export async function getReports(options = {}) {
  const [response, individualResponse] = await Promise.all([
    getReportList('/api/report', '통합 보고서 목록', options),
    getReportList('/api/reports/individual', '개별 보고서 목록', options),
  ]);
  const reports = Array.isArray(response) ? response : response?.content;

  if (!Array.isArray(reports)) {
    throw new Error('보고서 목록 응답 형식이 올바르지 않습니다.');
  }

  if (!Array.isArray(individualResponse)) {
    throw new Error('개별 보고서 목록 응답 형식이 올바르지 않습니다.');
  }

  const individualReportsById = new Map(
    individualResponse.map(report => [report.reportId, report]),
  );

  return reports.map(report => (
    report.reportType === 'COLLECTION'
      ? toCollectionReport(report)
      : toIndividualReport(report, individualReportsById.get(report.reportId))
  ));
}

export async function getIndividualReport(reportId, options = {}) {
  const report = await getReportList(
    `/api/reports/individual/${encodeURIComponent(reportId)}`,
    '개별 보고서 상세',
    options,
  );

  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    throw new Error('개별 보고서 상세 응답 형식이 올바르지 않습니다.');
  }

  const detail = toIndividualReportDetail(report);
  const imageUrl = await resolveReportImageUrl(detail.imageUrl, options);

  return { ...detail, imageUrl };
}
